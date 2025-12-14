var _driversGrid = (function () {
    let drivers = [];
    let filteredDrivers = [];
    let editingDriver = null;
    let driverModal;
    let inspections = [];

    function init() {
        cacheDom();
        bindEvents();
        loadDrivers();
    }

    function cacheDom() {
        driverModal = new bootstrap.Modal(document.getElementById('driverModal'));
    }

    function bindEvents() {
        $('#addDriverBtn').on('click', async function () {
            editingDriver = null;
            $('#driverForm')[0].reset();
            $('#driverEmployeeId').prop('disabled', false);
            $('#driverModal .modal-title').text('Add Driver');
            await loadVehiclesForDropdown();
            driverModal.show();
        });

        $('#driverForm').on('submit', function (e) {
            e.preventDefault();
            saveDriver();
        });

        $('#refreshDriversBtn').on('click', loadDrivers);
        $('#driverSearchInput').on('input', filterDrivers);

        $(document).on('click', '.edit-driver-btn', async function () {
            const id = $(this).data('id');
            const driver = drivers.find(d => d.id === id);
            if (driver) {
                await loadVehiclesForDropdown();
                populateForm(driver);
                editingDriver = driver;
                $('#driverEmployeeId').prop('disabled', true);
                $('#driverModal .modal-title').text('Edit Driver');
                driverModal.show();
            }
        });

        $(document).on('click', '.delete-driver-btn', function () {
            const id = $(this).data('id');
            const driver = drivers.find(d => d.id === id);
            if (!driver) return;

            Swal.fire({
                title: 'Delete Driver',
                text: `Are you sure you want to remove ${driver.full_name}?`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#6c757d',
                confirmButtonText: 'Yes, delete driver'
            }).then(result => {
                if (result.isConfirmed) {
                    deleteDriver(id);
                }
            });
        });
    }

    function getAuthToken() {
        if (typeof authService !== 'undefined' && authService.token) {
            return authService.token;
        }
        const lambdaToken = localStorage.getItem('lambda_token');
        if (lambdaToken) {
            return lambdaToken;
        }
        return null;
    }

    async function loadDrivers() {
        try {
            setTableLoading();
            const token = getAuthToken();
            if (!token) throw new Error('Missing authentication token. Please sign in again.');

            // Load drivers and inspections in parallel
            const [driversData, inspectionsData] = await Promise.all([
                dataFunctions.getDrivers(token),
                dataFunctions.getInspections(token)
            ]);
            
            drivers = Array.isArray(driversData) ? driversData : [];
            inspections = Array.isArray(inspectionsData) ? inspectionsData : [];
            filteredDrivers = [...drivers];
            renderDrivers();
        } catch (error) {
            setTableError(error.message);
        }
    }

    function renderDrivers() {
        if (!filteredDrivers.length) {
            $('#driversTableBody').html(`
                <tr>
                    <td colspan="8" class="text-center py-5">
                        <div class="empty-state">
                            <i class="fas fa-id-card mb-3"></i>
                            <p class="mb-0">No drivers found. Click "Add Driver" to create one.</p>
                        </div>
                    </td>
                </tr>
            `);
            return;
        }

        // Count inspections per driver and find last inspection date
        const inspectionCounts = {};
        const lastInspectionDates = {};
        
        inspections.forEach(inspection => {
            if (inspection.driver_id) {
                // Count inspections
                inspectionCounts[inspection.driver_id] = (inspectionCounts[inspection.driver_id] || 0) + 1;
                
                // Track most recent inspection date
                if (inspection.inspection_date) {
                    const inspectionDate = new Date(inspection.inspection_date);
                    const currentLastDate = lastInspectionDates[inspection.driver_id];
                    
                    if (!currentLastDate || inspectionDate > new Date(currentLastDate)) {
                        lastInspectionDates[inspection.driver_id] = inspection.inspection_date;
                    }
                }
            }
        });

        const rows = filteredDrivers.map(driver => {
            const inspectionCount = inspectionCounts[driver.id] || 0;
            // Use last inspection date from inspection_header if available, otherwise fall back to driver.last_inspection
            const lastInspection = lastInspectionDates[driver.id] || driver.last_inspection;
            
            return `
            <tr>
                <td class="driver-name">${driver.full_name}</td>
                <td>${driver.employee_id}</td>
                <td>${driver.vehicle_code || '--'}</td>
                <td>
                    <span class="license-badge ${getLicenseBadge(driver.license_status)}">
                        ${driver.license_status}
                    </span>
                </td>
                <td>${formatDate(lastInspection)}</td>
                <td>${inspectionCount}</td>
                <td>
                    <span class="status-badge ${getStatusBadge(driver.status)}">
                        ${driver.status}
                    </span>
                </td>
                <td class="text-end">
                    <div class="action-buttons d-inline-flex gap-2">
                        <button class="btn btn-outline-primary edit-driver-btn" data-id="${driver.id}" title="Edit">
                            <i class="fas fa-user-edit"></i>
                        </button>
                        <button class="btn btn-outline-danger delete-driver-btn" data-id="${driver.id}" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
        }).join('');

        $('#driversTableBody').html(rows);
    }

    function setTableLoading() {
        $('#driversTableBody').html(`
            <tr>
                <td colspan="8" class="text-center py-5">
                    <div class="empty-state">
                        <i class="fas fa-circle-notch fa-spin mb-3"></i>
                        <p class="mb-0">Loading drivers...</p>
                    </div>
                </td>
            </tr>
        `);
    }

    function setTableError(message) {
        $('#driversTableBody').html(`
            <tr>
                <td colspan="8" class="text-center py-5">
                    <div class="empty-state text-danger">
                        <i class="fas fa-triangle-exclamation mb-3"></i>
                        <p class="mb-0">${message}</p>
                    </div>
                </td>
            </tr>
        `);
    }

    function getLicenseBadge(status) {
        switch ((status || '').toLowerCase()) {
            case 'expiring soon':
                return 'license-expiring';
            case 'expired':
                return 'license-expired';
            default:
                return 'license-valid';
        }
    }

    function getStatusBadge(status) {
        switch ((status || '').toLowerCase()) {
            case 'training required':
                return 'status-training';
            case 'inactive':
                return 'status-inactive';
            default:
                return 'status-active';
        }
    }

    function formatDate(value) {
        if (!value) return '--';
        const date = new Date(value);
        if (isNaN(date)) return value;
        return date.toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    function filterDrivers() {
        const term = $('#driverSearchInput').val().toLowerCase();
        filteredDrivers = drivers.filter(driver => {
            return (
                driver.full_name.toLowerCase().includes(term) ||
                driver.employee_id.toLowerCase().includes(term) ||
                (driver.status || '').toLowerCase().includes(term) ||
                (driver.license_status || '').toLowerCase().includes(term)
            );
        });
        renderDrivers();
    }

    async function loadVehiclesForDropdown() {
        try {
            const token = getAuthToken();
            if (!token) return;
            
            const vehicles = await dataFunctions.getVehicles(token);
            const vehiclesArray = Array.isArray(vehicles) ? vehicles : [];
            
            const dropdown = $('#driverVehicleId');
            dropdown.empty();
            dropdown.append('<option value="">No vehicle assigned</option>');
            
            vehiclesArray.forEach(vehicle => {
                dropdown.append(`<option value="${vehicle.id}">${vehicle.vehicle_code} - ${vehicle.vehicle_type}</option>`);
            });
        } catch (error) {
            // Silently fail
        }
    }

    function populateForm(driver) {
        $('#driverName').val(driver.full_name);
        $('#driverEmployeeId').val(driver.employee_id);
        $('#driverEmail').val(driver.email || '');
        $('#driverContactNumber').val(driver.contact_number || '');
        $('#driverLicenseStatus').val(driver.license_status);
        $('#driverStatus').val(driver.status);
        $('#driverLastInspection').val(driver.last_inspection ? driver.last_inspection.substring(0, 10) : '');
        $('#driverNotes').val(driver.notes || '');
        $('#driverVehicleId').val(driver.vehicle_id || '');
    }

    async function saveDriver() {
        try {
            const driverData = {
                full_name: $('#driverName').val().trim(),
                employee_id: $('#driverEmployeeId').val().trim(),
                email: $('#driverEmail').val().trim() || null,
                contact_number: $('#driverContactNumber').val().trim() || null,
                license_status: $('#driverLicenseStatus').val(),
                last_inspection: $('#driverLastInspection').val() || null,
                status: $('#driverStatus').val(),
                notes: $('#driverNotes').val(),
                vehicle_id: $('#driverVehicleId').val() || null
            };

            if (!driverData.full_name || !driverData.employee_id) {
                Swal.fire('Missing information', 'Name and Employee ID are required.', 'warning');
                return;
            }

            const token = getAuthToken();
            if (!token) throw new Error('Missing authentication token. Please sign in again.');

            if (editingDriver) {
                const response = await dataFunctions.updateDriver(editingDriver.id, driverData, token);
                if (response.success === false) {
                    throw new Error(response.error || 'Failed to update driver.');
                }
                Swal.fire('Driver updated', `${driverData.full_name} has been updated.`, 'success');
            } else {
                const response = await dataFunctions.createDriver(driverData, token);
                if (response.success === false) {
                    throw new Error(response.error || 'Failed to create driver.');
                }
                Swal.fire('Driver added', `${driverData.full_name} has been added.`, 'success');
            }

            driverModal.hide();
            loadDrivers();
        } catch (error) {
            Swal.fire('Error', error.message || 'Unable to save driver.', 'error');
        }
    }

    async function deleteDriver(driverId) {
        try {
            const token = getAuthToken();
            if (!token) throw new Error('Missing authentication token.');

            const response = await dataFunctions.deleteDriver(driverId, token);
            if (response.success === false) {
                throw new Error(response.error || 'Failed to delete driver.');
            }

            Swal.fire('Driver removed', 'The driver was removed successfully.', 'success');
            loadDrivers();
        } catch (error) {
            Swal.fire('Error', error.message || 'Unable to delete driver.', 'error');
        }
    }

    return {
        init
    };
})();

function initializeDriversGrid() {
    if (typeof dataFunctions !== 'undefined') {
        _driversGrid.init();
    } else {
        setTimeout(initializeDriversGrid, 100);
    }
}

$(document).ready(function () {
    initializeDriversGrid();
});


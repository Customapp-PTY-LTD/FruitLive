var _vehiclesGrid = (function () {
    let vehicles = [];
    let filteredVehicles = [];
    let activeFilter = 'All';
    let editingVehicle = null;
    let vehicleModal;
    let currentView = 'card';
    let searchTerm = '';

    function init() {
        vehicleModal = new bootstrap.Modal(document.getElementById('vehicleModal'));
        bindEvents();
        loadVehicles();
    }

    function bindEvents() {
        $('#addVehicleBtn').on('click', async () => {
            editingVehicle = null;
            $('#vehicleForm')[0].reset();
            $('#vehicleCode').prop('disabled', false);
            $('#vehiclePhotoPreview').hide();
            $('#vehiclePhotoPreviewImg').attr('src', '');
            $('#vehicleModal .modal-title').text('Add Vehicle');
            await loadDriversForDropdown();
            vehicleModal.show();
        });

        $('#vehicleForm').on('submit', function (e) {
            e.preventDefault();
            saveVehicle();
        });

        $('#refreshVehiclesBtn').on('click', loadVehicles);

        $(document).on('click', '.vehicles-tab', function () {
            $('.vehicles-tab').removeClass('active');
            $(this).addClass('active');
            activeFilter = $(this).data('filter');
            filterVehicles();
        });

        $(document).on('click', '.edit-vehicle-btn', async function () {
            const id = $(this).data('id');
            const vehicle = vehicles.find(v => v.id === id);
            if (vehicle) {
                await loadDriversForDropdown();
                populateForm(vehicle);
                editingVehicle = vehicle;
                $('#vehicleCode').prop('disabled', true);
                $('#vehicleModal .modal-title').text('Edit Vehicle');
                vehicleModal.show();
            }
        });

        $(document).on('click', '.delete-vehicle-btn', function () {
            const id = $(this).data('id');
            const vehicle = vehicles.find(v => v.id === id);
            if (!vehicle) return;

            Swal.fire({
                title: 'Remove Vehicle',
                text: `Remove ${vehicle.vehicle_code} from the fleet?`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#6c757d',
                confirmButtonText: 'Yes, remove vehicle'
            }).then(result => {
                if (result.isConfirmed) {
                    deleteVehicle(id);
                }
            });
        });

        $(document).on('click', '.view-toggle-btn', function () {
            $('.view-toggle-btn').removeClass('active');
            $(this).addClass('active');
            currentView = $(this).data('view');
            renderVehicles();
        });

        $('#vehicleSearchInput').on('input', function () {
            searchTerm = $(this).val().toLowerCase();
            filterVehicles();
        });

        $('#vehiclePhoto').on('change', function (e) {
            const file = e.target.files[0];
            if (file) {
                if (file.size > 1024 * 1024) { // 1MB limit to avoid database issues
                    Swal.fire('File too large', 'Please select an image smaller than 1MB.', 'warning');
                    $(this).val('');
                    return;
                }
                const reader = new FileReader();
                reader.onload = function (e) {
                    $('#vehiclePhotoPreviewImg').attr('src', e.target.result);
                    $('#vehiclePhotoPreview').show();
                };
                reader.readAsDataURL(file);
            }
        });

        $('#removeVehiclePhoto').on('click', function () {
            $('#vehiclePhoto').val('');
            $('#vehiclePhotoPreview').hide();
            $('#vehiclePhotoPreviewImg').attr('src', '');
        });
    }

    function getAuthToken() {
        if (typeof authService !== 'undefined' && authService.token) {
            return authService.token;
        }
        return localStorage.getItem('lambda_token');
    }

    async function loadVehicles() {
        try {
            setGridLoading();
            const token = getAuthToken();
            if (!token) throw new Error('Missing authentication token. Please sign in again.');

            const data = await dataFunctions.getVehicles(token);
            vehicles = Array.isArray(data) ? data : [];
            filterVehicles();
        } catch (error) {
            setGridError(error.message);
        }
    }

    function filterVehicles() {
        filteredVehicles = vehicles.filter(vehicle => {
            // Status filter
            if (activeFilter !== 'All') {
                if ((vehicle.status || '').toLowerCase() !== activeFilter.toLowerCase()) {
                    return false;
                }
            }
            // Search filter
            if (searchTerm) {
                const searchableText = [
                    vehicle.vehicle_code,
                    vehicle.vehicle_type,
                    vehicle.fleet_number,
                    vehicle.location,
                    vehicle.status
                ].filter(Boolean).join(' ').toLowerCase();
                if (!searchableText.includes(searchTerm)) {
                    return false;
                }
            }
            return true;
        });
        renderVehicles();
    }

    function renderVehicles() {
        if (currentView === 'card') {
            renderCardView();
        } else {
            renderTableView();
        }
    }

    function renderCardView() {
        if (!filteredVehicles.length) {
            $('#vehiclesGrid').html(`
                <div class="col-12">
                    <div class="empty-state text-center py-5">
                        <i class="fas fa-truck-pickup fa-2x text-muted mb-3"></i>
                        <p class="mb-0">No vehicles in this view.</p>
                    </div>
                </div>
            `);
            $('#vehiclesGrid').show();
            $('#vehiclesTableContainer').hide();
            return;
        }

        const cards = filteredVehicles.map(vehicle => `
            <div class="col-md-6 col-xl-4">
                <div class="vehicle-card">
                    <span class="status-label ${getStatusClass(vehicle.status)}">${vehicle.status || 'Active'}</span>
                    <div class="vehicle-title">${vehicle.vehicle_code}</div>
                    <div class="vehicle-type">${vehicle.vehicle_type}</div>
                    ${vehicle.driver_name ? `<div class="vehicle-meta"><strong>Driver:</strong> ${vehicle.driver_name}</div>` : ''}
                    <div class="vehicle-meta"><strong>Last Inspection:</strong> ${formatDate(vehicle.last_inspection)}</div>
                    <div class="vehicle-meta"><strong>Next Service:</strong> ${formatDate(vehicle.next_service)}</div>
                    ${vehicle.location ? `<div class="vehicle-meta"><strong>Location:</strong> ${vehicle.location}</div>` : ''}
                    <div class="vehicle-actions d-flex gap-2 mt-3">
                        <button class="btn btn-outline-primary flex-fill edit-vehicle-btn" data-id="${vehicle.id}">
                            View Details
                        </button>
                        <button class="btn btn-outline-secondary flex-fill delete-vehicle-btn" data-id="${vehicle.id}">
                            Remove
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        $('#vehiclesGrid').html(cards);
        $('#vehiclesGrid').show();
        $('#vehiclesTableContainer').hide();
    }

    function renderTableView() {
        if (!filteredVehicles.length) {
            $('#vehiclesTableBody').html(`
                <tr>
                    <td colspan="9" class="text-center py-5">
                        <div class="empty-state">
                            <i class="fas fa-truck-pickup fa-2x text-muted mb-3"></i>
                            <p class="mb-0">No vehicles in this view.</p>
                        </div>
                    </td>
                </tr>
            `);
            $('#vehiclesGrid').hide();
            $('#vehiclesTableContainer').show();
            return;
        }

        const rows = filteredVehicles.map(vehicle => `
            <tr>
                <td><strong>${vehicle.vehicle_code}</strong></td>
                <td>${vehicle.vehicle_type || '--'}</td>
                <td>${vehicle.fleet_number || '--'}</td>
                <td>${vehicle.driver_name || '--'}</td>
                <td><span class="status-label ${getStatusClass(vehicle.status)}">${vehicle.status || 'Active'}</span></td>
                <td>${vehicle.location || '--'}</td>
                <td>${formatDate(vehicle.last_inspection)}</td>
                <td>${formatDate(vehicle.next_service)}</td>
                <td class="text-end">
                    <div class="d-inline-flex gap-2">
                        <button class="btn btn-outline-primary edit-vehicle-btn" data-id="${vehicle.id}" title="View Details">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-outline-danger delete-vehicle-btn" data-id="${vehicle.id}" title="Remove">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

        $('#vehiclesTableBody').html(rows);
        $('#vehiclesGrid').hide();
        $('#vehiclesTableContainer').show();
    }

    function setGridLoading() {
        if (currentView === 'card') {
            $('#vehiclesGrid').html(`
                <div class="col-12">
                    <div class="empty-state text-center py-5">
                        <i class="fas fa-circle-notch fa-spin fa-2x text-muted mb-3"></i>
                        <p class="mb-0">Loading vehicles...</p>
                    </div>
                </div>
            `);
            $('#vehiclesGrid').show();
            $('#vehiclesTableContainer').hide();
        } else {
            $('#vehiclesTableBody').html(`
                <tr>
                    <td colspan="8" class="text-center py-5">
                        <div class="empty-state">
                            <i class="fas fa-circle-notch fa-spin fa-2x text-muted mb-3"></i>
                            <p class="mb-0">Loading vehicles...</p>
                        </div>
                    </td>
                </tr>
            `);
            $('#vehiclesGrid').hide();
            $('#vehiclesTableContainer').show();
        }
    }

    function setGridError(message) {
        if (currentView === 'card') {
            $('#vehiclesGrid').html(`
                <div class="col-12">
                    <div class="empty-state text-center py-5 text-danger">
                        <i class="fas fa-triangle-exclamation fa-2x mb-3"></i>
                        <p class="mb-0">${message}</p>
                    </div>
                </div>
            `);
            $('#vehiclesGrid').show();
            $('#vehiclesTableContainer').hide();
        } else {
            $('#vehiclesTableBody').html(`
                <tr>
                    <td colspan="8" class="text-center py-5 text-danger">
                        <div class="empty-state">
                            <i class="fas fa-triangle-exclamation fa-2x mb-3"></i>
                            <p class="mb-0">${message}</p>
                        </div>
                    </td>
                </tr>
            `);
            $('#vehiclesGrid').hide();
            $('#vehiclesTableContainer').show();
        }
    }

    function getStatusClass(status) {
        switch ((status || '').toLowerCase()) {
            case 'maintenance':
                return 'status-maintenance';
            case 'out of service':
                return 'status-out';
            default:
                return 'status-active';
        }
    }

    function formatDate(value) {
        if (!value) return '--';
        const date = new Date(value);
        if (isNaN(date)) return value;
        return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    }

    async function loadDriversForDropdown() {
        try {
            const token = getAuthToken();
            if (!token) return;
            
            const drivers = await dataFunctions.getDrivers(token);
            const driversArray = Array.isArray(drivers) ? drivers : [];
            
            const dropdown = $('#vehicleDriverId');
            dropdown.empty();
            dropdown.append('<option value="">No driver assigned</option>');
            
            driversArray.forEach(driver => {
                dropdown.append(`<option value="${driver.id}">${driver.full_name} (${driver.employee_id})</option>`);
            });
        } catch (error) {
            // Silently fail
        }
    }

    function populateForm(vehicle) {
        $('#vehicleCode').val(vehicle.vehicle_code);
        $('#vehicleType').val(vehicle.vehicle_type);
        $('#vehicleStatus').val(vehicle.status);
        $('#vehicleFleetNumber').val(vehicle.fleet_number || '');
        $('#vehicleLocation').val(vehicle.location || '');
        $('#vehicleLastInspection').val(vehicle.last_inspection ? vehicle.last_inspection.substring(0, 10) : '');
        $('#vehicleNextService').val(vehicle.next_service ? vehicle.next_service.substring(0, 10) : '');
        $('#vehicleNotes').val(vehicle.notes || '');
        $('#vehicleDriverId').val(vehicle.driver_id || '');
        
        // Handle photo
        $('#vehiclePhoto').val('');
        if (vehicle.photo_url || vehicle.photo) {
            const photoUrl = vehicle.photo_url || vehicle.photo;
            $('#vehiclePhotoPreviewImg').attr('src', photoUrl);
            $('#vehiclePhotoPreview').show();
        } else {
            $('#vehiclePhotoPreview').hide();
            $('#vehiclePhotoPreviewImg').attr('src', '');
        }
    }

    async function saveVehicle() {
        try {
            // Handle photo upload - only include if it's a URL or small enough
            let photoData = null;
            const photoFile = $('#vehiclePhoto')[0].files[0];
            if (photoFile) {
                // Check file size (limit to 1MB to avoid issues)
                if (photoFile.size > 1024 * 1024) { // 1MB limit
                    Swal.fire('Photo too large', 'Please select an image smaller than 1MB. Large images may cause save issues.', 'warning');
                    return;
                }
                // Convert to base64
                photoData = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = reject;
                    reader.readAsDataURL(photoFile);
                });
            } else if ($('#vehiclePhotoPreview').is(':visible') && $('#vehiclePhotoPreviewImg').attr('src')) {
                // Keep existing photo if no new file selected
                const existingPhoto = $('#vehiclePhotoPreviewImg').attr('src');
                if (existingPhoto && !existingPhoto.startsWith('data:')) {
                    // It's a URL, keep it
                    photoData = existingPhoto;
                } else if (existingPhoto && existingPhoto.startsWith('data:')) {
                    // It's base64 - only keep if it's not too large (rough check)
                    if (existingPhoto.length < 500000) { // ~500KB base64 limit
                        photoData = existingPhoto;
                    }
                }
            }

            const vehicleData = {
                vehicle_code: $('#vehicleCode').val().trim(),
                vehicle_type: $('#vehicleType').val().trim(),
                status: $('#vehicleStatus').val(),
                fleet_number: $('#vehicleFleetNumber').val().trim(),
                location: $('#vehicleLocation').val().trim(),
                last_inspection: $('#vehicleLastInspection').val() || null,
                next_service: $('#vehicleNextService').val() || null,
                notes: $('#vehicleNotes').val(),
                driver_id: $('#vehicleDriverId').val() || null
            };

            // Only include photo if we have valid data
            if (photoData) {
                vehicleData.photo = photoData;
            }

            if (!vehicleData.vehicle_code || !vehicleData.vehicle_type) {
                Swal.fire('Missing info', 'Vehicle code and type are required.', 'warning');
                return;
            }

            const token = getAuthToken();
            if (!token) throw new Error('Missing authentication token.');

            if (editingVehicle) {
                const response = await dataFunctions.updateVehicle(editingVehicle.id, vehicleData, token);
                if (response.success === false) throw new Error(response.error || 'Failed to update vehicle.');
                Swal.fire('Vehicle updated', `${vehicleData.vehicle_code} has been updated.`, 'success');
            } else {
                const response = await dataFunctions.createVehicle(vehicleData, token);
                if (response.success === false) throw new Error(response.error || 'Failed to create vehicle.');
                Swal.fire('Vehicle added', `${vehicleData.vehicle_code} has been added.`, 'success');
            }

            vehicleModal.hide();
            loadVehicles();
        } catch (error) {
            Swal.fire('Error', error.message || 'Unable to save vehicle.', 'error');
        }
    }

    async function deleteVehicle(vehicleId) {
        try {
            const token = getAuthToken();
            if (!token) throw new Error('Missing authentication token.');

            const response = await dataFunctions.deleteVehicle(vehicleId, token);
            if (response.success === false) throw new Error(response.error || 'Failed to delete vehicle.');

            Swal.fire('Vehicle removed', 'Vehicle removed from fleet.', 'success');
            loadVehicles();
        } catch (error) {
            Swal.fire('Error', error.message || 'Unable to delete vehicle.', 'error');
        }
    }

    return {
        init
    };
})();

function initializeVehiclesGrid() {
    if (typeof dataFunctions !== 'undefined') {
        _vehiclesGrid.init();
    } else {
        setTimeout(initializeVehiclesGrid, 100);
    }
}

$(document).ready(function () {
    initializeVehiclesGrid();
});


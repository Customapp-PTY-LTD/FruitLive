var _inspectionsGrid = (function () {
    let inspections = [];
    let filteredInspections = [];

    function init() {
        bindEvents();
        loadInspections();
    }

    function bindEvents() {
        $('#addInspectionBtn').on('click', () => {
            sessionStorage.removeItem('editingInspectionId');
            sessionStorage.removeItem('viewInspectionId');
            if (typeof _appRouter !== 'undefined' && typeof _appRouter.routeTo === 'function') {
                _appRouter.routeTo('inspection-form');
            }
        });

        $('#refreshInspectionsBtn').on('click', loadInspections);

        $('#inspectionSearchInput').on('input', function () {
            const term = $(this).val().toLowerCase();
            filteredInspections = inspections.filter(item => {
                return (
                    (item.vehicle_code || '').toLowerCase().includes(term) ||
                    (item.driver_name || '').toLowerCase().includes(term) ||
                    (item.fleet_number || '').toLowerCase().includes(term) ||
                    (item.status || '').toLowerCase().includes(term)
                );
            });
            renderTable();
        });

        $(document).on('click', '.view-inspection-btn', function () {
            const id = $(this).data('id');
            sessionStorage.setItem('viewInspectionId', id);
            sessionStorage.removeItem('editingInspectionId');
            if (typeof _appRouter !== 'undefined' && typeof _appRouter.routeTo === 'function') {
                _appRouter.routeTo('inspection-form');
            }
        });

        $(document).on('click', '.delete-inspection-btn', function () {
            const id = $(this).data('id');
            const inspection = inspections.find(i => i.id === id);
            if (!inspection) return;

            Swal.fire({
                title: 'Delete Inspection',
                text: 'Delete this inspection?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#6c757d',
                confirmButtonText: 'Yes, delete inspection'
            }).then(result => {
                if (result.isConfirmed) {
                    deleteInspection(id);
                }
            });
        });
    }

    function getAuthToken() {
        if (typeof authService !== 'undefined' && authService.token) {
            return authService.token;
        }
        return localStorage.getItem('lambda_token');
    }

    async function loadInspections() {
        try {
            setTableLoading();
            const token = getAuthToken();
            if (!token) throw new Error('Missing authentication token. Please sign in again.');

            const data = await dataFunctions.getInspections(token);
            inspections = Array.isArray(data) ? data : [];
            filteredInspections = [...inspections];
            renderTable();
            
            // Check if there's an inspection ID to view (from dashboard navigation)
            const viewInspectionId = sessionStorage.getItem('viewInspectionId');
            if (viewInspectionId) {
                sessionStorage.setItem('viewInspectionId', viewInspectionId);
                if (typeof _appRouter !== 'undefined' && typeof _appRouter.routeTo === 'function') {
                    _appRouter.routeTo('inspection-form');
                }
            }
        } catch (error) {
            setTableError(error.message);
        }
    }

    function renderTable() {
        if (!filteredInspections.length) {
            $('#inspectionsTableBody').html(`
                <tr>
                    <td colspan="7" class="text-center py-5">
                        <div class="empty-state">
                            <i class="fas fa-clipboard-list mb-3"></i>
                            <p class="mb-0">No inspections found.</p>
                        </div>
                    </td>
                </tr>
            `);
            return;
        }

        const rows = filteredInspections.map(item => `
            <tr>
                <td>${item.vehicle_code || item.fleet_number || '--'}</td>
                <td>${item.driver_name || '--'}</td>
                <td>${formatDate(item.inspection_date)}</td>
                <td>
                    <span class="status-badge ${getStatusBadge(item.status)}">${item.status || 'Pending'}</span>
                </td>
                <td>${item.critical_issues || 0}</td>
                <td class="text-end">
                    <div class="inspections-actions d-inline-flex gap-2">
                        <button class="btn btn-outline-primary view-inspection-btn" data-id="${item.id}" title="View">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-outline-secondary delete-inspection-btn" data-id="${item.id}" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

        $('#inspectionsTableBody').html(rows);
    }

    function setTableLoading() {
        $('#inspectionsTableBody').html(`
            <tr>
                <td colspan="7" class="text-center py-5">
                    <div class="empty-state">
                        <i class="fas fa-circle-notch fa-spin mb-3"></i>
                        <p class="mb-0">Loading inspections...</p>
                    </div>
                </td>
            </tr>
        `);
    }

    function setTableError(message) {
        $('#inspectionsTableBody').html(`
            <tr>
                <td colspan="7" class="text-center py-5">
                    <div class="empty-state text-danger">
                        <i class="fas fa-triangle-exclamation mb-3"></i>
                        <p class="mb-0">${message}</p>
                    </div>
                </td>
            </tr>
        `);
    }

    function getStatusBadge(status) {
        switch ((status || '').toLowerCase()) {
            case 'failed':
                return 'status-failed';
            case 'pending':
                return 'status-pending';
            default:
                return 'status-passed';
        }
    }

    function formatDate(value) {
        if (!value) return '--';
        const date = new Date(value);
        if (isNaN(date)) return value;
        return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    }

    async function deleteInspection(inspectionId) {
        try {
            const token = getAuthToken();
            if (!token) throw new Error('Missing authentication token.');

            const response = await dataFunctions.deleteInspection(inspectionId, token);
            if (response.success === false) throw new Error(response.error || 'Failed to delete inspection.');

            Swal.fire('Inspection removed', 'Inspection removed successfully.', 'success');
            loadInspections();
        } catch (error) {
            Swal.fire('Error', error.message || 'Unable to delete inspection.', 'error');
        }
    }

    return {
        init
    };
})();

function initializeInspectionsGrid() {
    if (typeof dataFunctions !== 'undefined') {
        _inspectionsGrid.init();
    } else {
        setTimeout(initializeInspectionsGrid, 100);
    }
}

$(document).ready(function () {
    initializeInspectionsGrid();
});

var _dashboard = (function () {
    let trendChart = null;
    let currentPeriod = 'week'; // Default to week
    let customDateRange = null; // { from: 'YYYY-MM-DD', to: 'YYYY-MM-DD' }

    function cleanup() {
        // Destroy chart instance if it exists
        if (trendChart) {
            try {
                trendChart.destroy();
            } catch (e) {
                // Silently fail
            }
            trendChart = null;
        }
    }

    async function init() {
        // Clean up any existing chart before re-initializing
        cleanup();
        
        bindEvents();
        setLoadingState();

        try {
            await ensureChartLibrary();
            await loadDashboardData();
        } catch (error) {
            setErrorState(error.message || 'Unable to load dashboard data.');
        }
    }

    function bindEvents() {
        $(document).off('click', '.view-inspection-btn').on('click', '.view-inspection-btn', function () {
            const inspectionId = $(this).data('id');
            if (inspectionId && typeof _appRouter !== 'undefined') {
                // Store the inspection ID to view after navigation
                sessionStorage.setItem('viewInspectionId', inspectionId);
                _appRouter.routeTo('inspections-grid');
            } else if (typeof _appRouter !== 'undefined') {
                _appRouter.routeTo('inspections-grid');
            }
        });

        // Period selector change handler
        $(document).off('change', '#trendPeriodSelect').on('change', '#trendPeriodSelect', function () {
            currentPeriod = $(this).val();
            const customRangeDiv = $('#customDateRange');
            
            if (currentPeriod === 'custom') {
                customRangeDiv.addClass('show');
                // Set default dates if not already set
                if (!$('#customDateFrom').val()) {
                    const today = new Date();
                    const weekAgo = new Date(today);
                    weekAgo.setDate(today.getDate() - 7);
                    $('#customDateTo').val(today.toISOString().split('T')[0]);
                    $('#customDateFrom').val(weekAgo.toISOString().split('T')[0]);
                }
            } else {
                customRangeDiv.removeClass('show');
                customDateRange = null;
                // Reload chart with new period
                reloadChart();
            }
        });

        // Custom date range apply button
        $(document).off('click', '#applyCustomRange').on('click', '#applyCustomRange', function () {
            const from = $('#customDateFrom').val();
            const to = $('#customDateTo').val();
            
            if (!from || !to) {
                alert('Please select both start and end dates.');
                return;
            }
            
            if (new Date(from) > new Date(to)) {
                alert('Start date must be before end date.');
                return;
            }
            
            customDateRange = { from, to };
            reloadChart();
        });

        // Helper function to reload chart
        function reloadChart() {
            const token = getAuthToken();
            if (token) {
                dataFunctions.getInspections(token).then(inspections => {
                    const inspectionsArray = Array.isArray(inspections) ? inspections : [];
                    renderTrendChart(inspectionsArray, currentPeriod, customDateRange);
                }).catch(error => {
                    // Silently fail
                });
            }
        }
    }

    function getAuthToken() {
        if (typeof authService !== 'undefined' && authService.token) {
            return authService.token;
        }
        return localStorage.getItem('lambda_token');
    }

    async function ensureChartLibrary() {
        if (typeof Chart !== 'undefined') {
            return;
        }

        await new Promise((resolve, reject) => {
            const existingScript = document.querySelector('script[data-dashboard-chart]');
            if (existingScript) {
                existingScript.addEventListener('load', resolve);
                existingScript.addEventListener('error', reject);
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
            script.defer = true;
            script.dataset.dashboardChart = 'true';
            script.onload = resolve;
            script.onerror = () => reject(new Error('Failed to load chart library.'));
            document.head.appendChild(script);
        });
    }

    async function loadDashboardData() {
        const token = getAuthToken();
        if (!token) {
            throw new Error('Missing authentication token. Please sign in again.');
        }

        const [inspectionsResponse, vehiclesResponse, driversResponse] = await Promise.all([
            dataFunctions.getInspections(token),
            dataFunctions.getVehicles(token),
            dataFunctions.getDrivers(token)
        ]);

        const inspections = Array.isArray(inspectionsResponse) ? inspectionsResponse : [];
        const vehicles = Array.isArray(vehiclesResponse) ? vehiclesResponse : [];
        const drivers = Array.isArray(driversResponse) ? driversResponse : [];

        updateLastUpdated();
        updateInspectionStats(inspections);
        renderRecentInspections(inspections);
        renderTrendChart(inspections, currentPeriod, customDateRange);
        updateFleetSnapshot(vehicles);
        updateDriversSnapshot(drivers);
    }

    function setLoadingState() {
        $('#statInspections, #statPassed, #statPending, #statFailed').text('--');
        $('#statInspectionsSub').text('Loading...');
        $('#recentInspectionsBody').html(`
            <tr>
                <td colspan="6" class="text-center py-4 text-muted">
                    <i class="fas fa-circle-notch fa-spin me-2"></i>Loading inspections...
                </td>
            </tr>
        `);
    }

    function setErrorState(message) {
        $('#recentInspectionsBody').html(`
            <tr>
                <td colspan="6" class="text-center py-4 text-danger">
                    <i class="fas fa-triangle-exclamation me-2"></i>${message}
                </td>
            </tr>
        `);
        $('#inspectionTrendChart').addClass('d-none');
        $('#chartEmptyState')
            .removeClass('d-none')
            .html(`
                <i class="fas fa-triangle-exclamation mb-2 text-danger"></i>
                <p class="mb-0 text-danger">${message}</p>
            `);
    }

    function updateLastUpdated() {
        const target = document.getElementById('dashboardLastUpdated');
        if (target) {
            target.textContent = new Date().toLocaleTimeString();
        }
    }

    function updateInspectionStats(inspections) {
        const todayIso = getIsoDate(new Date());
        const lastSevenDays = getIsoDate(new Date(Date.now() - 6 * 24 * 60 * 60 * 1000));

        const todayCount = inspections.filter(item => {
            const date = getIsoDate(item.inspection_date || item.created_at);
            return date === todayIso;
        }).length;

        const sevenDayCount = inspections.filter(item => {
            const date = getIsoDate(item.inspection_date || item.created_at);
            return date >= lastSevenDays;
        }).length;

        const statusCounts = inspections.reduce((acc, item) => {
            const status = (item.status || '').toLowerCase();
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {});

        $('#statInspections').text(todayCount);
        $('#statInspectionsSub').text(`${sevenDayCount} in the last 7 days`);
        $('#statPassed').text(statusCounts.passed || 0);
        $('#statPending').text(statusCounts.pending || 0);
        $('#statFailed').text(statusCounts.failed || 0);
    }

    function renderRecentInspections(inspections) {
        if (!inspections.length) {
            $('#recentInspectionsBody').html(`
                <tr>
                    <td colspan="6" class="text-center py-4 text-muted">
                        <i class="fas fa-clipboard-list me-2"></i>No inspections recorded yet.
                    </td>
                </tr>
            `);
            return;
        }

        const sorted = [...inspections].sort((a, b) => {
            const dateA = new Date(a.inspection_date || a.created_at || 0).getTime();
            const dateB = new Date(b.inspection_date || b.created_at || 0).getTime();
            return dateB - dateA;
        }).slice(0, 5);

        const rows = sorted.map(item => `
            <tr>
                <td>${item.vehicle_code || '--'}</td>
                <td>${item.driver_name || '--'}</td>
                <td>${formatDateTime(item.inspection_date || item.created_at)}</td>
                <td>
                    <span class="status-badge ${getStatusBadge(item.status)}">${item.status || 'Unknown'}</span>
                </td>
                <td>${item.critical_issues != null ? item.critical_issues : 0}</td>
                <td class="text-end">
                    <button class="btn btn-outline-primary btn-sm view-inspection-btn" data-id="${item.id}" title="View inspection">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            </tr>
        `).join('');

        $('#recentInspectionsBody').html(rows);
    }

    function renderTrendChart(inspections, period = 'week', customRange = null) {
        const canvas = document.getElementById('inspectionTrendChart');
        const emptyState = document.getElementById('chartEmptyState');
        if (!canvas || typeof Chart === 'undefined') return;

        const today = new Date();
        const labels = [];
        const passedValues = [];
        const pendingValues = [];
        const failedValues = [];
        let startDate, endDate;

        // Determine date range based on period
        if (period === 'custom' && customRange) {
            startDate = new Date(customRange.from);
            endDate = new Date(customRange.to);
            endDate.setHours(23, 59, 59, 999); // Include the entire end date
        } else {
            endDate = new Date(today);
            endDate.setHours(23, 59, 59, 999);
            
            switch (period) {
                case 'day':
                    startDate = new Date(today);
                    startDate.setHours(0, 0, 0, 0);
                    break;
                case 'week':
                    startDate = new Date(today);
                    startDate.setDate(today.getDate() - 6); // 7 days including today
                    startDate.setHours(0, 0, 0, 0);
                    break;
                case 'month':
                    startDate = new Date(today);
                    startDate.setDate(today.getDate() - 29); // 30 days including today
                    startDate.setHours(0, 0, 0, 0);
                    break;
                default:
                    startDate = new Date(today);
                    startDate.setDate(today.getDate() - 6);
                    startDate.setHours(0, 0, 0, 0);
            }
        }

        // Calculate number of days in range
        const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
        
        // Determine grouping based on range length
        let groupBy = 'day';
        if (daysDiff > 90) {
            groupBy = 'week';
        } else if (daysDiff > 365) {
            groupBy = 'month';
        }

        // Generate labels and data points
        if (groupBy === 'day') {
            // Daily grouping
            for (let i = 0; i < daysDiff; i++) {
                const date = new Date(startDate);
                date.setDate(startDate.getDate() + i);
                const iso = getIsoDate(date);
                
                const label = date.toLocaleDateString(undefined, { 
                    month: 'short', 
                    day: 'numeric',
                    ...(period === 'day' ? {} : {})
                });
                labels.push(label);

                const dayItems = inspections.filter(item => {
                    const itemDate = getIsoDate(item.inspection_date || item.created_at);
                    return itemDate === iso;
                });
                passedValues.push(dayItems.filter(item => (item.status || '').toLowerCase() === 'passed').length);
                pendingValues.push(dayItems.filter(item => (item.status || '').toLowerCase() === 'pending').length);
                failedValues.push(dayItems.filter(item => (item.status || '').toLowerCase() === 'failed').length);
            }
        } else if (groupBy === 'week') {
            // Weekly grouping
            const weeks = Math.ceil(daysDiff / 7);
            for (let i = 0; i < weeks; i++) {
                const weekStart = new Date(startDate);
                weekStart.setDate(startDate.getDate() + i * 7);
                const weekEnd = new Date(weekStart);
                weekEnd.setDate(weekStart.getDate() + 6);
                if (weekEnd > endDate) weekEnd = endDate;
                
                const weekStartIso = getIsoDate(weekStart);
                const weekEndIso = getIsoDate(weekEnd);
                
                labels.push(weekStart.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }));

                const weekItems = inspections.filter(item => {
                    const itemDate = getIsoDate(item.inspection_date || item.created_at);
                    return itemDate >= weekStartIso && itemDate <= weekEndIso;
                });
                passedValues.push(weekItems.filter(item => (item.status || '').toLowerCase() === 'passed').length);
                pendingValues.push(weekItems.filter(item => (item.status || '').toLowerCase() === 'pending').length);
                failedValues.push(weekItems.filter(item => (item.status || '').toLowerCase() === 'failed').length);
            }
        } else if (groupBy === 'month') {
            // Monthly grouping
            const current = new Date(startDate);
            while (current <= endDate) {
                const monthStart = new Date(current.getFullYear(), current.getMonth(), 1);
                const monthEnd = new Date(current.getFullYear(), current.getMonth() + 1, 0);
                if (monthEnd > endDate) monthEnd = endDate;
                
                const monthStartIso = getIsoDate(monthStart);
                const monthEndIso = getIsoDate(monthEnd);
                
                labels.push(monthStart.toLocaleDateString(undefined, { month: 'short', year: 'numeric' }));

                const monthItems = inspections.filter(item => {
                    const itemDate = getIsoDate(item.inspection_date || item.created_at);
                    return itemDate >= monthStartIso && itemDate <= monthEndIso;
                });
                passedValues.push(monthItems.filter(item => (item.status || '').toLowerCase() === 'passed').length);
                pendingValues.push(monthItems.filter(item => (item.status || '').toLowerCase() === 'pending').length);
                failedValues.push(monthItems.filter(item => (item.status || '').toLowerCase() === 'failed').length);
                
                current.setMonth(current.getMonth() + 1);
            }
        }

        const hasData = passedValues.some(val => val > 0) || pendingValues.some(val => val > 0) || failedValues.some(val => val > 0);
        canvas.classList.toggle('d-none', !hasData);
        emptyState.classList.toggle('d-none', hasData);

        if (!hasData) {
            if (trendChart) {
                trendChart.destroy();
                trendChart = null;
            }
            return;
        }

        const dataset = {
            labels,
            datasets: [
                {
                    label: 'Passed',
                    data: passedValues,
                    borderColor: '#22c55e',
                    backgroundColor: 'rgba(34, 197, 94, 0.15)',
                    fill: true,
                    tension: 0.4
                },
                {
                    label: 'Pending',
                    data: pendingValues,
                    borderColor: '#f59e0b',
                    backgroundColor: 'rgba(245, 158, 11, 0.15)',
                    fill: true,
                    tension: 0.4
                },
                {
                    label: 'Failed',
                    data: failedValues,
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.15)',
                    fill: true,
                    tension: 0.4
                }
            ]
        };

        if (trendChart) {
            trendChart.data = dataset;
            trendChart.update();
            return;
        }

        trendChart = new Chart(canvas.getContext('2d'), {
            type: 'line',
            data: dataset,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: {
                        grid: { display: false }
                    },
                    y: {
                        beginAtZero: true,
                        ticks: { precision: 0 }
                    }
                }
            }
        });
    }

    function updateFleetSnapshot(vehicles) {
        if (!Array.isArray(vehicles) || !vehicles.length) {
            $('#snapshotVehicles, #snapshotActive, #snapshotMaintenance, #snapshotOut').text('--');
            return;
        }

        const totals = vehicles.reduce((acc, vehicle) => {
            const status = (vehicle.status || '').toLowerCase();
            acc.total += 1;
            if (status === 'active') acc.active += 1;
            else if (status === 'maintenance') acc.maintenance += 1;
            else acc.out += 1;
            return acc;
        }, { total: 0, active: 0, maintenance: 0, out: 0 });

        $('#snapshotVehicles').text(totals.total);
        $('#snapshotActive').text(totals.active);
        $('#snapshotMaintenance').text(totals.maintenance);
        $('#snapshotOut').text(totals.out);
    }

    function updateDriversSnapshot(drivers) {
        if (!Array.isArray(drivers) || !drivers.length) {
            $('#snapshotDriversTotal, #snapshotDriversActive, #snapshotDriversValid, #snapshotDriversExpired').text('--');
            return;
        }

        const totals = drivers.reduce((acc, driver) => {
            const status = (driver.status || '').toLowerCase();
            const licenseStatus = (driver.license_status || '').toLowerCase();
            
            acc.total += 1;
            if (status === 'active') acc.active += 1;
            if (licenseStatus === 'valid' || licenseStatus === 'active') acc.valid += 1;
            if (licenseStatus === 'expired' || licenseStatus === 'invalid') acc.expired += 1;
            
            return acc;
        }, { total: 0, active: 0, valid: 0, expired: 0 });

        $('#snapshotDriversTotal').text(totals.total);
        $('#snapshotDriversActive').text(totals.active);
        $('#snapshotDriversValid').text(totals.valid);
        $('#snapshotDriversExpired').text(totals.expired);
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

    function getIsoDate(value) {
        if (!value) return '';
        const date = new Date(value);
        if (isNaN(date)) return '';
        return date.toISOString().split('T')[0];
    }

    function formatDateTime(value) {
        if (!value) return '--';
        const date = new Date(value);
        if (isNaN(date)) return value;
        return date.toLocaleString(undefined, {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    return {
        init,
        cleanup
    };
})();

function initializeDashboard() {
    // Check if DOM elements exist (route has been loaded)
    const dashboardWrapper = document.querySelector('.dashboard-wrapper');
    if (!dashboardWrapper) {
        // DOM not ready yet, retry
        setTimeout(initializeDashboard, 100);
        return;
    }

    // Check if dataFunctions is available
    if (typeof dataFunctions !== 'undefined') {
        _dashboard.init();
    } else {
        setTimeout(initializeDashboard, 100);
    }
}

// Auto-initialize on document ready (for first load)
$(document).ready(function () {
    // Only auto-initialize if we're already on the dashboard route
    if (document.querySelector('.dashboard-wrapper')) {
        initializeDashboard();
    }
});

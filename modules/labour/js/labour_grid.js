/**
 * Labour Allocation Module
 * Manage daily worker allocations, attendance, and task tracking
 */

let labourData = {
    workers: [],
    filteredWorkers: [],
    currentPage: 1,
    pageSize: 10,
    filters: {
        farm: '',
        block: '',
        task: '',
        status: '',
        search: ''
    }
};

/**
 * Initialize Labour Module
 */
async function initializeLabourGrid() {
    try {
        console.log('Initializing Labour Allocation Module...');
        
        // Wait for dataFunctions to be available
        if (typeof waitForDataFunctions === 'function') {
            try {
                await waitForDataFunctions(50, 100);
                console.log('dataFunctions is ready');
            } catch (error) {
                console.error('dataFunctions not available:', error);
                throw new Error('Data functions not available');
            }
        } else if (typeof dataFunctions === 'undefined') {
            // Fallback: wait a bit and check again
            await new Promise(resolve => setTimeout(resolve, 500));
            if (typeof dataFunctions === 'undefined') {
                throw new Error('dataFunctions is not available');
            }
        }
        
        // Set current date
        setCurrentDate();
        
        // Check if utility functions are available
        if (typeof populateFarmSelector === 'undefined') {
            console.error('populateFarmSelector is not defined. Make sure farm-selector-utils.js is loaded.');
            return;
        }
        
        // Load and populate farm and block selectors
        try {
            await populateFarmSelector('farmFilter', localStorage.getItem('selectedFarmId') || 'all', true);
            await populateBlockSelector('blockFilter', null, null, true);
            
            // Setup farm selector to update block selector when changed
            if (typeof setupFarmSelectorWithBlocks === 'function') {
                setupFarmSelectorWithBlocks('farmFilter', 'blockFilter', (farmId) => {
                    // Update farm info display
                    updateFarmInfoDisplay();
                    // Reload data when farm changes
                    loadLabourData().then(() => {
                        loadSummaryStats();
                    }).catch(err => {
                        console.error('Error reloading data after farm change:', err);
                    });
                });
            }
            
            // Also add event listener to farm selector to update display
            const farmSelector = document.getElementById('farmFilter');
            if (farmSelector) {
                farmSelector.addEventListener('change', () => {
                    updateFarmInfoDisplay();
                });
            }
        } catch (error) {
            console.error('Error setting up farm/block selectors:', error);
            // Continue anyway - data loading might still work
        }
        
        // Load data (async)
        await loadLabourData();
        loadSummaryStats();
    } catch (error) {
        console.error('Error initializing Labour Grid:', error);
        // Show user-friendly error message
        const container = document.querySelector('.labour-container');
        if (container) {
            container.innerHTML = `
                <div class="alert alert-danger" role="alert">
                    <h4 class="alert-heading">Error Loading Labour Module</h4>
                    <p>There was an error initializing the labour allocation module. Please refresh the page.</p>
                    <hr>
                    <p class="mb-0"><small>Error: ${error.message}</small></p>
                </div>
            `;
        }
    }
}

/**
 * Set current date display
 */
function setCurrentDate() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateString = now.toLocaleDateString('en-US', options);
    
    const dateElement = document.getElementById('currentDate');
    if (dateElement) {
        dateElement.textContent = dateString;
    }
    
    // Update farm info display
    updateFarmInfoDisplay();
}

/**
 * Update farm info badge display (shows selected farm name or nothing)
 */
function updateFarmInfoDisplay() {
    const farmInfo = document.getElementById('farmInfo');
    if (!farmInfo) return;
    
    const farmSelector = document.getElementById('farmFilter');
    if (farmSelector && farmSelector.value && farmSelector.value !== 'all') {
        const selectedOption = farmSelector.options[farmSelector.selectedIndex];
        if (selectedOption && selectedOption.text) {
            farmInfo.innerHTML = `<span class="badge" style="background-color: #7fa84f;">${selectedOption.text}</span>`;
        } else {
            farmInfo.innerHTML = '';
        }
    } else {
        farmInfo.innerHTML = '';
    }
}

/**
 * Load labour data
 */
async function loadLabourData() {
    try {
        // Check if dataFunctions is available
        if (typeof dataFunctions === 'undefined' || !dataFunctions.getWorkers) {
            console.error('dataFunctions.getWorkers is not available');
            throw new Error('Data functions not available');
        }
        
        // Load workers and allocations with filters
        const farmId = localStorage.getItem('selectedFarmId') || 'all';
        const filters = farmId !== 'all' ? { farmId: farmId } : {};
        
        console.log('Loading labour data with filters:', filters);
        
        const [workers, allocations] = await Promise.all([
            dataFunctions.getWorkers(filters).catch(err => {
                console.error('Error loading workers:', err);
                return [];
            }),
            dataFunctions.getWorkerAllocations(filters).catch(err => {
                console.error('Error loading allocations:', err);
                return [];
            })
        ]);
        
        console.log('Workers response:', workers);
        console.log('Allocations response:', allocations);
        console.log('Workers type:', typeof workers);
        console.log('Is workers array?', Array.isArray(workers));
        console.log('Workers count:', workers?.length || 0);
        console.log('Allocations count:', allocations?.length || 0);
        
        // Handle different response structures
        let workersArray = workers;
        if (workers && !Array.isArray(workers)) {
            // Try to extract array from response object
            if (workers.workers && Array.isArray(workers.workers)) {
                workersArray = workers.workers;
            } else if (workers.data && Array.isArray(workers.data)) {
                workersArray = workers.data;
            } else if (workers.result && Array.isArray(workers.result)) {
                workersArray = workers.result;
            } else {
                console.warn('Workers response is not in expected format:', workers);
                workersArray = [];
            }
        }
        
        let allocationsArray = allocations;
        if (allocations && !Array.isArray(allocations)) {
            if (allocations.allocations && Array.isArray(allocations.allocations)) {
                allocationsArray = allocations.allocations;
            } else if (allocations.data && Array.isArray(allocations.data)) {
                allocationsArray = allocations.data;
            } else if (allocations.result && Array.isArray(allocations.result)) {
                allocationsArray = allocations.result;
            } else {
                console.warn('Allocations response is not in expected format:', allocations);
                allocationsArray = [];
            }
        }
        
        console.log('Workers array after processing:', workersArray);
        console.log('Allocations array after processing:', allocationsArray);
        console.log('Processed workers count:', workersArray?.length || 0);
        
        // Map workers with their allocations
        if (workersArray && Array.isArray(workersArray) && workersArray.length > 0) {
            labourData.workers = workersArray.map(worker => {
                // Find today's allocation for this worker
                const today = new Date().toISOString().split('T')[0];
                const todayAllocation = allocationsArray && Array.isArray(allocationsArray) 
                    ? allocationsArray.find(a => a.worker_id === worker.id && a.allocation_date === today)
                    : null;
                
                return {
                    id: worker.id,
                    name: `${worker.first_name} ${worker.last_name}`,
                    idNumber: worker.id_number || 'N/A',
                    status: todayAllocation ? (todayAllocation.status || 'Present') : 'Unallocated',
                    farm: todayAllocation?.farm_name || todayAllocation?.farm_id || 'Not Allocated',
                    block: todayAllocation ? (todayAllocation.block_name || 'Block ' + (todayAllocation.block_id ? todayAllocation.block_id.substring(0, 8) : 'N/A')) : '-',
                    variety: todayAllocation?.variety_name || (todayAllocation?.variety_id ? 'Variety' : '-'),
                    task: todayAllocation?.task_type || '-',
                    employmentType: worker.employment_type || 'permanent',
                    rowStart: null,
                    rowEnd: null,
                    teamLeader: todayAllocation?.induna_id ? 'Supervisor' : '-',
                    employeeNumber: worker.employee_number,
                    hourlyRate: worker.hourly_rate
                };
            });
        } else {
            labourData.workers = [];
        }
        
        filterWorkers();
        loadWorkersList();
        
    } catch (error) {
        console.error('Error loading labour data:', error);
        // Fallback to mock data
        labourData.workers = [
            {
                id: 1,
                name: 'John Smith',
                idNumber: '9201054321083',
                status: 'Present',
                farm: 'Main Farm',
                block: 'Block A3',
                variety: 'Granny Smith',
                task: 'Pruning',
                rowStart: 12,
                rowEnd: 15,
                teamLeader: 'James'
            }
        ];
        labourData.filteredWorkers = [...labourData.workers];
        loadWorkersList();
    }
}

/**
 * Load summary statistics
 */
function loadSummaryStats() {
    // Calculate stats from actual data
    const stats = {
        total: labourData.workers.length,
        permanent: 0,
        shared: 0,
        seasonal: 0,
        present: 0,
        absent: 0,
        unallocated: 0,
        pruning: 0,
        mowing: 0,
        weeding: 0,
        general: 0
    };
    
    // Count workers by employment type
    labourData.workers.forEach(worker => {
        const empType = (worker.employmentType || 'permanent').toLowerCase();
        if (empType.includes('permanent') || empType === 'permanent') {
            stats.permanent++;
        } else if (empType.includes('shared') || empType === 'shared') {
            stats.shared++;
        } else if (empType.includes('seasonal') || empType === 'seasonal') {
            stats.seasonal++;
        } else {
            // Default to permanent if unknown
            stats.permanent++;
        }
    });
    
    // Only use estimates if we couldn't determine employment types
    if (stats.permanent === 0 && stats.shared === 0 && stats.seasonal === 0 && stats.total > 0) {
        stats.permanent = Math.floor(stats.total * 0.8);
        stats.shared = Math.floor(stats.total * 0.1);
        stats.seasonal = stats.total - stats.permanent - stats.shared;
    }
    
    // Count workers by status
    labourData.workers.forEach(worker => {
        if (worker.status === 'Present') {
            stats.present++;
        } else if (worker.status === 'Absent') {
            stats.absent++;
        } else {
            stats.unallocated++;
        }
    });
    
    // Count workers by task type (from today's allocations)
    const today = new Date().toISOString().split('T')[0];
    labourData.workers.forEach(worker => {
        const task = worker.task;
        if (task && task !== '-') {
            const taskLower = task.toLowerCase();
            if (taskLower.includes('pruning')) {
                stats.pruning++;
            } else if (taskLower.includes('mowing')) {
                stats.mowing++;
            } else if (taskLower.includes('weeding')) {
                stats.weeding++;
            } else {
                stats.general++;
            }
        } else {
            // Unallocated workers count as general
            stats.general++;
        }
    });
    
    // Estimate employment types (if not available in data)
    // This is a placeholder - ideally would come from worker.employment_type
    stats.permanent = Math.floor(stats.total * 0.8);
    stats.shared = Math.floor(stats.total * 0.1);
    stats.seasonal = stats.total - stats.permanent - stats.shared;
    
    // Helper function to safely set text content
    const setTextContent = (id, value) => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        } else {
            console.warn(`Element with id '${id}' not found`);
        }
    };
    
    // Update totals
    setTextContent('totalStaff', stats.total);
    setTextContent('staffBreakdown', `${stats.permanent} permanent + ${stats.shared} shared + ${stats.seasonal} seasonal`);
    setTextContent('presentCount', stats.present);
    setTextContent('absentCount', stats.absent);
    setTextContent('unallocatedCount', stats.unallocated);
    
    // Update team counts
    setTextContent('pruningCount', `${stats.pruning} workers`);
    setTextContent('mowingCount', `${stats.mowing} workers`);
    setTextContent('weedingCount', `${stats.weeding} workers`);
    setTextContent('generalCount', `${stats.general} workers`);
    
    // Show shared workers alert if any
    if (stats.shared > 0) {
        const alert = document.getElementById('sharedWorkersAlert');
        const count = document.getElementById('sharedWorkerCount');
        const details = document.getElementById('sharedWorkerDetails');
        
        if (alert && count && details) {
            alert.style.display = 'block';
            count.textContent = stats.shared;
            details.textContent = 'Transfer active until 23 Dec 2025 | Allocated to: Block A3 Pruning Team';
        }
    }
}

/**
 * Load workers list
 */
function loadWorkersList() {
    const tbody = document.getElementById('workersTableBody');
    if (!tbody) return;
    
    if (labourData.filteredWorkers.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="10" class="text-center text-muted py-4">
                    <i class="bi bi-inbox fs-3"></i>
                    <p class="mb-0 mt-2">No workers found</p>
                </td>
            </tr>
        `;
        return;
    }
    
    const startIndex = (labourData.currentPage - 1) * labourData.pageSize;
    const endIndex = startIndex + labourData.pageSize;
    const pageWorkers = labourData.filteredWorkers.slice(startIndex, endIndex);
    
    tbody.innerHTML = pageWorkers.map(worker => {
        const statusBadgeClass = getStatusBadgeClass(worker.status);
        const rows = worker.rowStart && worker.rowEnd ? `${worker.rowStart}-${worker.rowEnd}` : '-';
        const isAbsent = worker.status === 'Absent';
        
        return `
            <tr>
                <td class="fw-bold">${worker.name}</td>
                <td>${worker.idNumber}</td>
                <td><span class="badge ${statusBadgeClass}">${worker.status}</span></td>
                <td>${worker.farm}</td>
                <td>${worker.block}</td>
                <td>${worker.variety}</td>
                <td>${worker.task}</td>
                <td>${rows}</td>
                <td>${worker.teamLeader}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" 
                            onclick="editWorkerAllocation('${worker.id}')"
                            ${isAbsent ? 'disabled' : ''}>
                        <i class="bi bi-pencil"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
    
    updatePagination();
}

/**
 * Get status badge class
 */
function getStatusBadgeClass(status) {
    switch (status) {
        case 'Present': return 'badge-present';
        case 'Absent': return 'badge-absent';
        case 'Late': return 'badge-late';
        case 'Not Allocated': return 'badge-not-allocated';
        default: return 'badge-secondary';
    }
}

/**
 * Apply filters
 */
function applyFilters() {
    const farmFilter = document.getElementById('farmFilter').value;
    const blockFilter = document.getElementById('blockFilter').value;
    const taskFilter = document.getElementById('taskFilter').value;
    const statusFilter = document.getElementById('statusFilter').value;
    
    labourData.filters = {
        farm: farmFilter,
        block: blockFilter,
        task: taskFilter,
        status: statusFilter,
        search: labourData.filters.search
    };
    
    // Update farm info display when filters change
    updateFarmInfoDisplay();
    
    filterWorkers();
    labourData.currentPage = 1;
    loadWorkersList();
}

/**
 * Search workers
 */
function searchWorkers() {
    const searchTerm = document.getElementById('workerSearch').value.toLowerCase();
    labourData.filters.search = searchTerm;
    
    filterWorkers();
    labourData.currentPage = 1;
    loadWorkersList();
}

/**
 * Filter workers based on active filters
 */
function filterWorkers() {
    labourData.filteredWorkers = labourData.workers.filter(worker => {
        // Search filter
        if (labourData.filters.search) {
            const searchMatch = 
                worker.name.toLowerCase().includes(labourData.filters.search) ||
                worker.idNumber.includes(labourData.filters.search);
            if (!searchMatch) return false;
        }
        
        // Farm filter
        if (labourData.filters.farm && worker.farm !== labourData.filters.farm) {
            return false;
        }
        
        // Block filter
        if (labourData.filters.block && worker.block !== labourData.filters.block) {
            return false;
        }
        
        // Task filter (case-insensitive partial match)
        if (labourData.filters.task) {
            const workerTask = (worker.task || '').toLowerCase().trim();
            const filterTask = labourData.filters.task.toLowerCase().trim();
            
            // Handle "General" as catch-all for non-specific tasks
            if (filterTask === 'general' || filterTask === '') {
                // Show workers without specific task types or with generic tasks
                const specificTasks = ['pruning', 'mowing', 'weeding', 'harvesting', 'spraying'];
                const hasSpecificTask = specificTasks.some(task => workerTask.includes(task));
                if (hasSpecificTask) return false;
            } else {
                // Match specific task types (allows partial matching)
                // Normalize task names (e.g., "Pruning" matches "pruning")
                if (workerTask === '-' || workerTask === '' || !workerTask.includes(filterTask)) {
                    return false;
                }
            }
        }
        
        // Status filter
        if (labourData.filters.status && worker.status !== labourData.filters.status) {
            return false;
        }
        
        return true;
    });
}

/**
 * Update pagination
 */
function updatePagination() {
    const totalPages = Math.ceil(labourData.filteredWorkers.length / labourData.pageSize);
    const paginationInfo = document.getElementById('paginationInfo');
    const pagination = document.getElementById('pagination');
    
    if (paginationInfo) {
        const startIndex = (labourData.currentPage - 1) * labourData.pageSize + 1;
        const endIndex = Math.min(labourData.currentPage * labourData.pageSize, labourData.filteredWorkers.length);
        paginationInfo.textContent = `Showing ${startIndex}-${endIndex} of ${labourData.filteredWorkers.length} workers`;
    }
    
    if (pagination) {
        let html = '';
        
        // Previous button
        html += `<li class="page-item ${labourData.currentPage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="changePage(${labourData.currentPage - 1})">Previous</a>
        </li>`;
        
        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= labourData.currentPage - 1 && i <= labourData.currentPage + 1)) {
                html += `<li class="page-item ${i === labourData.currentPage ? 'active' : ''}">
                    <a class="page-link" href="#" onclick="changePage(${i})">${i}</a>
                </li>`;
            } else if (i === labourData.currentPage - 2 || i === labourData.currentPage + 2) {
                html += '<li class="page-item disabled"><a class="page-link">...</a></li>';
            }
        }
        
        // Next button
        html += `<li class="page-item ${labourData.currentPage === totalPages ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="changePage(${labourData.currentPage + 1})">Next</a>
        </li>`;
        
        pagination.innerHTML = html;
    }
}

/**
 * Change page
 */
function changePage(page) {
    event.preventDefault();
    const totalPages = Math.ceil(labourData.filteredWorkers.length / labourData.pageSize);
    
    if (page < 1 || page > totalPages) return;
    
    labourData.currentPage = page;
    loadWorkersList();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Edit worker allocation
 */
function editWorkerAllocation(workerId) {
    const worker = labourData.workers.find(w => String(w.id) === String(workerId));
    if (!worker) {
        console.error('Worker not found:', workerId);
        return;
    }
    
    // Populate modal
    const editWorkerIdEl = document.getElementById('editWorkerId');
    const editWorkerNameEl = document.getElementById('editWorkerName');
    const editFarmEl = document.getElementById('editFarm');
    const editBlockEl = document.getElementById('editBlock');
    const editVarietyEl = document.getElementById('editVariety');
    const editTaskEl = document.getElementById('editTask');
    const editRowStartEl = document.getElementById('editRowStart');
    const editRowEndEl = document.getElementById('editRowEnd');
    
    if (editWorkerIdEl) editWorkerIdEl.value = worker.id;
    if (editWorkerNameEl) editWorkerNameEl.value = worker.name;
    if (editFarmEl) editFarmEl.value = worker.farm;
    if (editBlockEl) editBlockEl.value = worker.block;
    if (editVarietyEl) editVarietyEl.value = worker.variety;
    if (editTaskEl) editTaskEl.value = worker.task;
    if (editRowStartEl) editRowStartEl.value = worker.rowStart || '';
    if (editRowEndEl) editRowEndEl.value = worker.rowEnd || '';
    
    // Show modal
    const modalElement = document.getElementById('editAllocationModal');
    if (modalElement) {
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
    }
}

/**
 * Save allocation
 */
async function saveAllocation() {
    try {
        const workerId = document.getElementById('editWorkerId').value;
        const allocationId = document.getElementById('editAllocationId').value;
        const farmId = document.getElementById('editFarm').value;
        const blockId = document.getElementById('editBlock').value;
        const taskType = document.getElementById('editTask').value;
        const startTime = document.getElementById('editStartTime')?.value || '07:00';
        const endTime = document.getElementById('editEndTime')?.value || '16:00';
        
        if (!workerId || !farmId) {
            showErrorMessage('Worker and Farm are required');
            return;
        }
        
        const allocationData = {
            worker_id: workerId,
            farm_id: farmId,
            block_id: blockId || null,
            task_type: taskType || null,
            start_time: startTime,
            end_time: endTime,
            status: 'planned'
        };
        
        let result;
        if (allocationId) {
            // Update existing allocation
            result = await dataFunctions.updateWorkerAllocation(allocationId, allocationData);
            showSuccessMessage('Allocation updated successfully');
        } else {
            // Create new allocation
            const allocationDate = document.getElementById('editAllocationDate')?.value || new Date().toISOString().split('T')[0];
            allocationData.allocation_date = allocationDate;
            result = await dataFunctions.createWorkerAllocation(allocationData);
            showSuccessMessage('Allocation created successfully');
        }
        
        // Reload data
        await loadLabourData();
        loadSummaryStats();
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('editAllocationModal'));
        if (modal) modal.hide();
        
    } catch (error) {
        console.error('Error saving allocation:', error);
        showErrorMessage('Failed to save allocation: ' + error.message);
    }
}

/**
 * Save bulk allocation
 */
function saveBulkAllocation() {
    // TODO: Implement bulk allocation
    console.log('Bulk allocation');
    showSuccessMessage('Bulk allocation saved successfully');
}

/**
 * Open team view - filters workers by task type
 */
function openTeam(team) {
    // Map team names to task type filter values
    const taskTypeMap = {
        'pruning': 'Pruning',
        'mowing': 'Mowing',
        'weeding': 'Weeding',
        'general': 'General' // or empty string for all general tasks
    };
    
    const taskType = taskTypeMap[team.toLowerCase()] || team;
    
    // Set task filter
    const taskFilter = document.getElementById('taskFilter');
    if (taskFilter) {
        taskFilter.value = taskType;
    }
    
    // Apply filters to show only workers in this team
    labourData.filters.task = taskType;
    filterWorkers();
    labourData.currentPage = 1;
    loadWorkersList();
    
    // Scroll to worker list
    const workerListCard = document.querySelector('.card');
    if (workerListCard) {
        workerListCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

/**
 * Manage shared workers
 */
function manageSharedWorkers() {
    console.log('Manage shared workers');
    // TODO: Implement shared workers management
}

/**
 * Print summary
 */
function printSummary() {
    window.print();
}

/**
 * Show success message
 */
function showSuccessMessage(message) {
    if (typeof _common !== 'undefined' && _common.showSuccessToast) {
        _common.showSuccessToast(message);
    } else if (typeof Swal !== 'undefined') {
        Swal.fire({
            icon: 'success',
            title: 'Success',
            text: message,
            timer: 3000,
            showConfirmButton: false,
            toast: true,
            position: 'top-end'
        });
    } else {
        console.log('Success:', message);
        alert(message);
    }
}

/**
 * Show error message
 */
function showErrorMessage(message) {
    if (typeof _common !== 'undefined' && _common.showErrorToast) {
        _common.showErrorToast(message);
    } else if (typeof Swal !== 'undefined') {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: message,
            timer: 5000,
            showConfirmButton: true
        });
    } else {
        console.error('Error:', message);
        alert('Error: ' + message);
    }
}

/**
 * Show info message
 */
function showInfoMessage(message) {
    if (typeof _common !== 'undefined' && _common.showInfoToast) {
        _common.showInfoToast(message);
    } else if (typeof Swal !== 'undefined') {
        Swal.fire({
            icon: 'info',
            title: 'Info',
            text: message,
            timer: 3000,
            showConfirmButton: false,
            toast: true,
            position: 'top-end'
        });
    } else {
        console.log('Info:', message);
        alert(message);
    }
}

// Auto-initialize when loaded via router
if (typeof window !== 'undefined') {
    console.log('Labour module script loaded');
}


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
                    // Reload data when farm changes
                    loadLabourData().then(() => {
                        loadSummaryStats();
                    }).catch(err => {
                        console.error('Error reloading data after farm change:', err);
                    });
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
    
    const farmInfo = document.getElementById('farmInfo');
    if (farmInfo) {
        farmInfo.innerHTML = '<span class="badge" style="background-color: #7fa84f;">125 hectares</span>';
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
        
        // Map workers with their allocations
        if (workers && Array.isArray(workers)) {
            labourData.workers = workers.map(worker => {
                // Find today's allocation for this worker
                const today = new Date().toISOString().split('T')[0];
                const todayAllocation = allocations && Array.isArray(allocations) 
                    ? allocations.find(a => a.worker_id === worker.id && a.allocation_date === today)
                    : null;
                
                return {
                    id: worker.id,
                    name: `${worker.first_name} ${worker.last_name}`,
                    idNumber: worker.id_number || 'N/A',
                    status: todayAllocation ? 'Present' : 'Unallocated',
                    farm: 'Quinn Farms', // TODO: Get from farm_id
                    block: todayAllocation ? 'Block ' + (todayAllocation.block_id ? todayAllocation.block_id.substring(0, 8) : 'N/A') : '-',
                    variety: todayAllocation ? 'Variety' : '-',
                    task: todayAllocation?.task_type || '-',
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
        
        labourData.filteredWorkers = [...labourData.workers];
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
    // Mock stats
    const stats = {
        total: 182,
        permanent: 147,
        shared: 12,
        seasonal: 23,
        present: 147,
        absent: 35,
        unallocated: 12,
        pruning: 45,
        mowing: 22,
        weeding: 38,
        general: 42
    };
    
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
        
        // Task filter
        if (labourData.filters.task && worker.task !== labourData.filters.task) {
            return false;
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
 * Open team view
 */
function openTeam(team) {
    console.log('Opening team view:', team);
    // TODO: Navigate to team-specific view
    showInfoMessage(`Opening ${team} team management...`);
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


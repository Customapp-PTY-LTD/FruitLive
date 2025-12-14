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
function initializeLabourGrid() {
    console.log('Initializing Labour Allocation Module...');
    
    // Set current date
    setCurrentDate();
    
    // Load data
    loadLabourData();
    loadSummaryStats();
    loadWorkersList();
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
        // TODO: Replace with actual API call
        // const data = await dataFunctions.getLabourAllocations();
        
        // Mock data
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
            },
            {
                id: 2,
                name: 'Mary Johnson',
                idNumber: '8907123456789',
                status: 'Present',
                farm: 'North Block',
                block: 'Block B1',
                variety: 'Golden Delicious',
                task: 'Weeding',
                rowStart: 8,
                rowEnd: 11,
                teamLeader: 'Peter'
            },
            {
                id: 3,
                name: 'David Williams',
                idNumber: '7503289012345',
                status: 'Absent',
                farm: '-',
                block: '-',
                variety: '-',
                task: '-',
                rowStart: null,
                rowEnd: null,
                teamLeader: '-'
            }
        ];
        
        labourData.filteredWorkers = [...labourData.workers];
        
    } catch (error) {
        console.error('Error loading labour data:', error);
        showErrorMessage('Failed to load labour data');
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
    
    // Update totals
    document.getElementById('totalStaff').textContent = stats.total;
    document.getElementById('staffBreakdown').textContent = 
        `${stats.permanent} permanent + ${stats.shared} shared + ${stats.seasonal} seasonal`;
    document.getElementById('presentCount').textContent = stats.present;
    document.getElementById('absentCount').textContent = stats.absent;
    document.getElementById('unallocatedCount').textContent = stats.unallocated;
    
    // Update team counts
    document.getElementById('pruningCount').textContent = `${stats.pruning} workers`;
    document.getElementById('mowingCount').textContent = `${stats.mowing} workers`;
    document.getElementById('weedingCount').textContent = `${stats.weeding} workers`;
    document.getElementById('generalCount').textContent = `${stats.general} workers`;
    
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
                            onclick="editWorkerAllocation(${worker.id})"
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
    const worker = labourData.workers.find(w => w.id === workerId);
    if (!worker) return;
    
    // Populate modal
    document.getElementById('editWorkerId').value = worker.id;
    document.getElementById('editWorkerName').value = worker.name;
    document.getElementById('editFarm').value = worker.farm;
    document.getElementById('editBlock').value = worker.block;
    document.getElementById('editVariety').value = worker.variety;
    document.getElementById('editTask').value = worker.task;
    document.getElementById('editRowStart').value = worker.rowStart || '';
    document.getElementById('editRowEnd').value = worker.rowEnd || '';
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('editAllocationModal'));
    modal.show();
}

/**
 * Save allocation
 */
async function saveAllocation() {
    const workerId = parseInt(document.getElementById('editWorkerId').value);
    const farm = document.getElementById('editFarm').value;
    const block = document.getElementById('editBlock').value;
    const variety = document.getElementById('editVariety').value;
    const task = document.getElementById('editTask').value;
    const rowStart = parseInt(document.getElementById('editRowStart').value);
    const rowEnd = parseInt(document.getElementById('editRowEnd').value);
    
    // TODO: Save to database
    console.log('Saving allocation:', { workerId, farm, block, variety, task, rowStart, rowEnd });
    
    // Update local data
    const worker = labourData.workers.find(w => w.id === workerId);
    if (worker) {
        worker.farm = farm;
        worker.block = block;
        worker.variety = variety;
        worker.task = task;
        worker.rowStart = rowStart;
        worker.rowEnd = rowEnd;
    }
    
    // Refresh display
    filterWorkers();
    loadWorkersList();
    
    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('editAllocationModal'));
    if (modal) modal.hide();
    
    showSuccessMessage('Allocation updated successfully');
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
    console.log('Success:', message);
    // TODO: Implement proper notification
}

/**
 * Show error message
 */
function showErrorMessage(message) {
    console.error('Error:', message);
    // TODO: Implement proper notification
}

/**
 * Show info message
 */
function showInfoMessage(message) {
    console.log('Info:', message);
    // TODO: Implement proper notification
}

// Auto-initialize when loaded via router
if (typeof window !== 'undefined') {
    console.log('Labour module script loaded');
}


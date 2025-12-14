/**
 * Dashboard Module
 * Main dashboard with farm overview, stats, and quick access
 */

let dashboardData = null;

/**
 * Initialize Dashboard Module
 */
function initializeDashboard() {
    console.log('Initializing Dashboard Module...');
    
    // Set current date
    setCurrentDate();
    
    // Load dashboard data
    loadDashboardData();
    
    // Load components
    loadAlerts();
    loadStats();
    loadModules();
    loadRecentActivity();
    loadUpcomingTasks();
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
}

/**
 * Load dashboard data from API
 */
async function loadDashboardData() {
    try {
        // TODO: Replace with actual API call
        // const data = await dataFunctions.getDashboardData();
        
        // Mock data for now
        dashboardData = {
            farm: {
                name: 'FruitLive Demo Farm',
                location: 'Paarl, Western Cape',
                size: '125 hectares',
                cropType: 'Apples & Citrus'
            }
        };
        
        // Update farm info
        const locationElement = document.getElementById('farmLocation');
        const sizeElement = document.getElementById('farmSize');
        
        if (locationElement) {
            locationElement.textContent = dashboardData.farm.location;
        }
        if (sizeElement) {
            sizeElement.textContent = dashboardData.farm.size;
        }
        
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showErrorMessage('Failed to load dashboard data');
    }
}

/**
 * Load and display alerts
 */
function loadAlerts() {
    const container = document.getElementById('alertsContainer');
    if (!container) return;
    
    // Mock alerts data
    const alerts = [
        {
            type: 'danger',
            icon: 'bi-exclamation-triangle-fill',
            title: 'Urgent:',
            message: '3 staff training certificates expire within 7 days.',
            link: '#',
            linkText: 'Review now'
        },
        {
            type: 'warning',
            icon: 'bi-info-circle-fill',
            title: 'Notice:',
            message: 'Global GAP audit scheduled for next month.',
            link: '#',
            linkText: 'View checklist'
        }
    ];
    
    container.innerHTML = alerts.map(alert => `
        <div class="col-12">
            <div class="alert alert-${alert.type}-custom" role="alert">
                <strong><i class="bi ${alert.icon} me-2"></i>${alert.title}</strong> 
                ${alert.message} <a href="${alert.link}" class="alert-link">${alert.linkText}</a>
            </div>
        </div>
    `).join('');
}

/**
 * Load and display statistics cards
 */
function loadStats() {
    const container = document.getElementById('statsContainer');
    if (!container) return;
    
    // Mock stats data
    const stats = [
        {
            icon: 'bi-people-fill',
            title: 'Active Workers',
            value: '147',
            label: 'workers today'
        },
        {
            icon: 'bi-cash-stack',
            title: 'Labour Cost',
            value: 'R87,450',
            label: 'this week'
        },
        {
            icon: 'bi-clipboard-check',
            title: 'Compliance Score',
            value: '94%',
            label: 'Global GAP ready'
        },
        {
            icon: 'bi-droplet-fill',
            title: 'Spray Schedule',
            value: '3',
            label: 'applications due this week'
        }
    ];
    
    container.innerHTML = stats.map(stat => `
        <div class="col-md-6 col-lg-3">
            <div class="card stat-card">
                <div class="card-header">
                    <i class="bi ${stat.icon} me-2"></i>${stat.title}
                </div>
                <div class="card-body text-center">
                    <div class="stat-value">${stat.value}</div>
                    <small class="stat-label">${stat.label}</small>
                </div>
            </div>
        </div>
    `).join('');
}

/**
 * Load and display module cards
 */
function loadModules() {
    const container = document.getElementById('modulesContainer');
    if (!container) return;
    
    // Define available modules
    const modules = [
        {
            icon: 'bi-people-fill',
            title: 'Labour Allocation',
            description: 'Daily allocation, attendance, task tracking',
            route: 'labour-grid'
        },
        {
            icon: 'bi-person-badge',
            title: 'Users Management',
            description: 'Manage users, roles, and permissions',
            route: 'users-grid'
        },
        {
            icon: 'bi-shield-lock',
            title: 'Roles & Permissions',
            description: 'Configure role-based access control',
            route: 'roles-grid'
        },
        {
            icon: 'bi-toggles',
            title: 'Role Features',
            description: 'Manage feature access by role',
            route: 'role-features-grid'
        },
        {
            icon: 'bi-key',
            title: 'Role Permissions',
            description: 'Configure detailed permissions',
            route: 'role-permissions-grid'
        }
    ];
    
    container.innerHTML = modules.map(module => `
        <div class="col-lg-3 col-md-6">
            <div class="card module-card" onclick="navigateToModule('${module.route}')">
                <div class="card-body text-center">
                    <i class="bi ${module.icon} module-icon"></i>
                    <h5 class="card-title mt-3 fw-bold">${module.title}</h5>
                    <p class="card-text text-muted">${module.description}</p>
                    <button class="btn btn-dashboard">Open Module</button>
                </div>
            </div>
        </div>
    `).join('');
}

/**
 * Load and display recent activity
 */
function loadRecentActivity() {
    const container = document.getElementById('recentActivityList');
    if (!container) return;
    
    // Mock activity data
    const activities = [
        {
            icon: 'bi-person-check-fill',
            iconClass: 'success',
            title: 'User created',
            description: 'New user cedric.keown@gmail.com added to system',
            time: 'Today, 10:45',
            user: 'System Admin'
        },
        {
            icon: 'bi-shield-check',
            iconClass: 'info',
            title: 'Role updated',
            description: 'Super user permissions modified',
            time: 'Today, 09:30',
            user: 'Admin'
        },
        {
            icon: 'bi-file-earmark-check-fill',
            iconClass: 'warning',
            title: 'Configuration changed',
            description: 'RBAC settings updated successfully',
            time: 'Yesterday, 16:20',
            user: 'System Admin'
        }
    ];
    
    container.innerHTML = activities.map(activity => `
        <div class="list-group-item px-0">
            <div class="d-flex align-items-center">
                <div class="activity-icon ${activity.iconClass} me-3">
                    <i class="bi ${activity.icon}"></i>
                </div>
                <div class="flex-grow-1">
                    <strong>${activity.title}</strong> - ${activity.description}
                    <br><small class="text-muted">${activity.time} by ${activity.user}</small>
                </div>
            </div>
        </div>
    `).join('');
}

/**
 * Load and display upcoming tasks
 */
function loadUpcomingTasks() {
    const container = document.getElementById('upcomingTasksList');
    if (!container) return;
    
    // Mock tasks data
    const tasks = [
        {
            priority: 'high',
            title: 'Review user permissions',
            dueDate: 'Due: 20 Dec 2025'
        },
        {
            priority: 'medium',
            title: 'Update role configurations',
            dueDate: 'Scheduled: 22 Dec 2025'
        },
        {
            priority: 'low',
            title: 'System backup verification',
            dueDate: 'Due: 02 Jan 2026'
        }
    ];
    
    container.innerHTML = tasks.map(task => `
        <li class="task-item">
            <span class="task-priority-dot priority-${task.priority}"></span>
            <strong>${task.title}</strong>
            <br><small class="text-muted">${task.dueDate}</small>
        </li>
    `).join('');
}

/**
 * Navigate to a module
 */
function navigateToModule(routeName) {
    if (typeof navigateTo === 'function') {
        navigateTo(routeName);
    } else {
        console.error('Navigation function not available');
    }
}

/**
 * Show error message
 */
function showErrorMessage(message) {
    console.error(message);
    // TODO: Implement proper error notification
}

// Auto-initialize when loaded via router
if (typeof window !== 'undefined') {
    console.log('Dashboard module script loaded');
}


// Admin Module JavaScript
function initializeAdminGrid() {
    console.log('Admin Grid initialized');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAdminGrid);
} else {
    initializeAdminGrid();
}


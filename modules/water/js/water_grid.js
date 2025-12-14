// Water Module JavaScript
function initializeWaterGrid() {
    console.log('Water Grid initialized');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeWaterGrid);
} else {
    initializeWaterGrid();
}


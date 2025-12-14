// Assets Module JavaScript
function initializeAssetsGrid() {
    console.log('Assets Grid initialized');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAssetsGrid);
} else {
    initializeAssetsGrid();
}


// Water Module JavaScript
let waterData = {
    pumpReadings: [],
    licenses: []
};

async function initializeWaterGrid() {
    try {
        console.log('Water Grid initialized');
        
        // Check if utility functions are available
        if (typeof populateFarmSelector === 'undefined') {
            console.error('populateFarmSelector is not defined. Make sure farm-selector-utils.js is loaded.');
            return;
        }
        
        // Load and populate farm selector
        try {
            await populateFarmSelector('farmFilter', localStorage.getItem('selectedFarmId') || 'all', true);
            
            // Setup farm selector change handler
            const farmSelector = document.getElementById('farmFilter');
            if (farmSelector) {
                farmSelector.addEventListener('change', () => {
                    loadPumpReadings().catch(err => console.error('Error loading readings:', err));
                    loadWaterLicenses().catch(err => console.error('Error loading licenses:', err));
                });
            }
        } catch (error) {
            console.error('Error setting up farm selector:', error);
        }
        
        await loadPumpReadings();
        await loadWaterLicenses();
    } catch (error) {
        console.error('Error initializing Water Grid:', error);
    }
}

async function loadPumpReadings() {
    try {
        if (typeof dataFunctions === 'undefined' || !dataFunctions.getPumpReadings) {
            console.error('dataFunctions.getPumpReadings is not available');
            waterData.pumpReadings = [];
            renderPumpReadings();
            return;
        }
        
        const farmId = localStorage.getItem('selectedFarmId') || 'all';
        const filters = farmId !== 'all' ? { farmId: farmId } : {};
        const readings = await dataFunctions.getPumpReadings(filters);
        if (readings && Array.isArray(readings)) {
            waterData.pumpReadings = readings;
        } else {
            waterData.pumpReadings = [];
        }
        renderPumpReadings();
    } catch (error) {
        console.error('Error loading pump readings:', error);
        waterData.pumpReadings = [];
        renderPumpReadings();
    }
}

async function loadWaterLicenses() {
    try {
        if (typeof dataFunctions === 'undefined' || !dataFunctions.getWaterLicenses) {
            console.error('dataFunctions.getWaterLicenses is not available');
            waterData.licenses = [];
            renderWaterLicenses();
            return;
        }
        
        const farmId = localStorage.getItem('selectedFarmId') || 'all';
        const filters = farmId !== 'all' ? { farmId: farmId } : {};
        const licenses = await dataFunctions.getWaterLicenses(filters);
        if (licenses && Array.isArray(licenses)) {
            waterData.licenses = licenses;
        } else {
            waterData.licenses = [];
        }
        renderWaterLicenses();
    } catch (error) {
        console.error('Error loading water licenses:', error);
        waterData.licenses = [];
        renderWaterLicenses();
    }
}

function renderPumpReadings() {
    const container = document.getElementById('pumpReadingsList');
    if (!container) return;
    
    if (waterData.pumpReadings.length === 0) {
        container.innerHTML = '<p class="text-muted">No pump readings found</p>';
        return;
    }
    
    container.innerHTML = waterData.pumpReadings.map(reading => `
        <div class="card mb-3">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-start">
                    <div class="flex-grow-1">
                        <h5 class="card-title">${reading.pump_location || 'Pump Station'}</h5>
                        <p class="card-text mb-2">
                            <strong>Date:</strong> ${new Date(reading.reading_date).toLocaleDateString()}<br>
                            <strong>Meter Reading:</strong> ${reading.meter_reading || 'N/A'} m³<br>
                            <strong>Usage:</strong> ${reading.usage_m3 || 'N/A'} m³
                        </p>
                    </div>
                    <div class="ms-3">
                        <button class="btn btn-sm btn-outline-primary me-2" onclick="editPumpReading('${reading.id}')" title="Edit">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="deletePumpReading('${reading.id}', '${reading.pump_location || 'Pump'}')" title="Delete">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

function renderWaterLicenses() {
    const container = document.getElementById('waterLicensesList');
    if (!container) return;
    
    if (waterData.licenses.length === 0) {
        container.innerHTML = '<p class="text-muted">No water licenses found</p>';
        return;
    }
    
    container.innerHTML = waterData.licenses.map(license => `
        <div class="card mb-3">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-start">
                    <div class="flex-grow-1">
                        <h5 class="card-title">License ${license.license_number}</h5>
                        <p class="card-text mb-2">
                            <strong>Type:</strong> ${license.license_type || 'N/A'}<br>
                            <strong>Allocation:</strong> ${license.annual_allocation_m3 || license.allocation_m3 || 'N/A'} m³<br>
                            <strong>Issued:</strong> ${license.issued_date ? new Date(license.issued_date).toLocaleDateString() : 'N/A'}<br>
                            <strong>Expires:</strong> ${license.expiry_date ? new Date(license.expiry_date).toLocaleDateString() : 'N/A'}<br>
                            <strong>Status:</strong> ${license.status || 'N/A'}
                        </p>
                    </div>
                    <div class="ms-3">
                        <button class="btn btn-sm btn-outline-primary me-2" onclick="editWaterLicense('${license.id}')" title="Edit">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteWaterLicense('${license.id}', '${license.license_number}')" title="Delete">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

/**
 * Edit pump reading
 */
async function editPumpReading(readingId) {
    const reading = waterData.pumpReadings.find(r => String(r.id) === String(readingId));
    if (!reading) {
        showErrorMessage('Pump reading not found');
        return;
    }
    
    document.getElementById('editReadingId').value = reading.id;
    document.getElementById('editReadingDate').value = reading.reading_date ? reading.reading_date.split('T')[0] : '';
    document.getElementById('editPumpLocation').value = reading.pump_location || '';
    document.getElementById('editMeterReading').value = reading.meter_reading || '';
    document.getElementById('editPreviousReading').value = reading.previous_reading || '';
    document.getElementById('editUsageM3').value = reading.usage_m3 || '';
    
    const modal = new bootstrap.Modal(document.getElementById('editReadingModal'));
    modal.show();
}

/**
 * Save pump reading
 */
async function savePumpReading() {
    try {
        const readingId = document.getElementById('editReadingId').value;
        const farmId = localStorage.getItem('selectedFarmId');
        
        if (!farmId || farmId === 'all') {
            showErrorMessage('Please select a farm');
            return;
        }
        
        const readingData = {
            farm_id: farmId,
            pump_location: document.getElementById('editPumpLocation').value,
            reading_date: document.getElementById('editReadingDate').value,
            meter_reading: parseFloat(document.getElementById('editMeterReading').value) || null,
            previous_reading: document.getElementById('editPreviousReading').value ? parseFloat(document.getElementById('editPreviousReading').value) : null,
            usage_m3: document.getElementById('editUsageM3').value ? parseFloat(document.getElementById('editUsageM3').value) : null
        };
        
        if (!readingData.pump_location || !readingData.reading_date) {
            showErrorMessage('Pump Location and Reading Date are required');
            return;
        }
        
        let result;
        if (readingId) {
            result = await dataFunctions.updatePumpReading(readingId, readingData);
            showSuccessMessage('Pump reading updated successfully');
        } else {
            result = await dataFunctions.createPumpReading(readingData);
            showSuccessMessage('Pump reading created successfully');
        }
        
        await loadPumpReadings();
        
        const modal = bootstrap.Modal.getInstance(document.getElementById('editReadingModal'));
        if (modal) modal.hide();
        
    } catch (error) {
        console.error('Error saving pump reading:', error);
        showErrorMessage('Failed to save pump reading: ' + error.message);
    }
}

/**
 * Delete pump reading
 */
async function deletePumpReading(readingId, pumpLocation) {
    if (!confirm(`Are you sure you want to delete the pump reading for ${pumpLocation}? This action cannot be undone.`)) {
        return;
    }
    
    try {
        await dataFunctions.deletePumpReading(readingId);
        showSuccessMessage('Pump reading deleted successfully');
        await loadPumpReadings();
    } catch (error) {
        console.error('Error deleting pump reading:', error);
        showErrorMessage('Failed to delete pump reading: ' + error.message);
    }
}

/**
 * Edit water license
 */
async function editWaterLicense(licenseId) {
    const license = waterData.licenses.find(l => String(l.id) === String(licenseId));
    if (!license) {
        showErrorMessage('Water license not found');
        return;
    }
    
    document.getElementById('editLicenseId').value = license.id;
    document.getElementById('editLicenseNumber').value = license.license_number || '';
    document.getElementById('editLicenseType').value = license.license_type || '';
    document.getElementById('editLicenseIssued').value = license.issued_date ? license.issued_date.split('T')[0] : '';
    document.getElementById('editLicenseExpiry').value = license.expiry_date ? license.expiry_date.split('T')[0] : '';
    document.getElementById('editLicenseAllocation').value = license.annual_allocation_m3 || '';
    document.getElementById('editLicenseAuthority').value = license.issuing_authority || '';
    document.getElementById('editLicenseStatus').value = license.status || 'active';
    
    const modal = new bootstrap.Modal(document.getElementById('editLicenseModal'));
    modal.show();
}

/**
 * Save water license
 */
async function saveWaterLicense() {
    try {
        const licenseId = document.getElementById('editLicenseId').value;
        const farmId = localStorage.getItem('selectedFarmId');
        
        if (!farmId || farmId === 'all') {
            showErrorMessage('Please select a farm');
            return;
        }
        
        const licenseData = {
            farm_id: farmId,
            license_number: document.getElementById('editLicenseNumber').value,
            license_type: document.getElementById('editLicenseType').value || null,
            issued_date: document.getElementById('editLicenseIssued').value || null,
            expiry_date: document.getElementById('editLicenseExpiry').value || null,
            annual_allocation_m3: document.getElementById('editLicenseAllocation').value ? parseFloat(document.getElementById('editLicenseAllocation').value) : null,
            issuing_authority: document.getElementById('editLicenseAuthority').value || null,
            status: document.getElementById('editLicenseStatus').value || 'active'
        };
        
        if (!licenseData.license_number) {
            showErrorMessage('License Number is required');
            return;
        }
        
        let result;
        if (licenseId) {
            result = await dataFunctions.updateWaterLicense(licenseId, licenseData);
            showSuccessMessage('Water license updated successfully');
        } else {
            result = await dataFunctions.createWaterLicense(licenseData);
            showSuccessMessage('Water license created successfully');
        }
        
        await loadWaterLicenses();
        
        const modal = bootstrap.Modal.getInstance(document.getElementById('editLicenseModal'));
        if (modal) modal.hide();
        
    } catch (error) {
        console.error('Error saving water license:', error);
        showErrorMessage('Failed to save water license: ' + error.message);
    }
}

/**
 * Delete water license
 */
async function deleteWaterLicense(licenseId, licenseNumber) {
    if (!confirm(`Are you sure you want to delete license "${licenseNumber}"? This action cannot be undone.`)) {
        return;
    }
    
    try {
        await dataFunctions.deleteWaterLicense(licenseId);
        showSuccessMessage('Water license deleted successfully');
        await loadWaterLicenses();
    } catch (error) {
        console.error('Error deleting water license:', error);
        showErrorMessage('Failed to delete water license: ' + error.message);
    }
}

/**
 * Show success/error messages
 */
function showSuccessMessage(message) {
    if (typeof _common !== 'undefined' && _common.showSuccessToast) {
        _common.showSuccessToast(message);
    } else {
        alert('Success: ' + message);
    }
}

function showErrorMessage(message) {
    if (typeof _common !== 'undefined' && _common.showErrorToast) {
        _common.showErrorToast(message);
    } else {
        alert('Error: ' + message);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeWaterGrid);
} else {
    initializeWaterGrid();
}


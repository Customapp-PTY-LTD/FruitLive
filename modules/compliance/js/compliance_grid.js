// Compliance Module JavaScript
let complianceData = {
    documents: [],
    certificates: [],
    audits: []
};

async function initializeComplianceGrid() {
    try {
        console.log('Compliance Grid initialized');
        
        // Wait for dataFunctions to be available
        if (typeof waitForDataFunctions === 'function') {
            try {
                await waitForDataFunctions(50, 100);
            } catch (error) {
                console.error('dataFunctions not available:', error);
                throw new Error('Data functions not available');
            }
        } else if (typeof dataFunctions === 'undefined') {
            await new Promise(resolve => setTimeout(resolve, 500));
            if (typeof dataFunctions === 'undefined') {
                throw new Error('dataFunctions is not available');
            }
        }
        
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
                    loadComplianceData().catch(err => {
                        console.error('Error reloading compliance data:', err);
                    });
                });
            }
        } catch (error) {
            console.error('Error setting up farm selector:', error);
        }
        
        // Initialize tab functionality if needed
        const tabTriggerList = document.querySelectorAll('#complianceTab button');
        tabTriggerList.forEach(trigger => {
            trigger.addEventListener('click', function(event) {
                event.preventDefault();
                const tab = new bootstrap.Tab(trigger);
                tab.show();
            });
        });
        
        // Load data
        await loadComplianceData();
        
        // Add event listeners for buttons
        if (typeof setupEventListeners === 'function') {
            setupEventListeners();
        }
    } catch (error) {
        console.error('Error initializing Compliance Grid:', error);
    }
}

async function loadComplianceData() {
    try {
        if (typeof dataFunctions === 'undefined') {
            console.error('dataFunctions is not available');
            return;
        }
        
        const farmId = localStorage.getItem('selectedFarmId') || 'all';
        const filters = farmId !== 'all' ? { farmId: farmId } : {};
        
        const [documents, certificates, audits] = await Promise.all([
            dataFunctions.getComplianceDocuments(filters).catch(err => {
                console.error('Error loading documents:', err);
                return [];
            }),
            dataFunctions.getCertificates(filters).catch(err => {
                console.error('Error loading certificates:', err);
                return [];
            }),
            dataFunctions.getAudits(filters).catch(err => {
                console.error('Error loading audits:', err);
                return [];
            })
        ]);
        
        if (documents && Array.isArray(documents)) {
            complianceData.documents = documents;
        } else {
            complianceData.documents = [];
        }
        renderDocuments();
        
        if (certificates && Array.isArray(certificates)) {
            complianceData.certificates = certificates;
        } else {
            complianceData.certificates = [];
        }
        renderCertificates();
        
        if (audits && Array.isArray(audits)) {
            complianceData.audits = audits;
        } else {
            complianceData.audits = [];
        }
        renderAudits();
    } catch (error) {
        console.error('Error loading compliance data:', error);
        complianceData.documents = [];
        complianceData.certificates = [];
        complianceData.audits = [];
        renderDocuments();
        renderCertificates();
        renderAudits();
    }
}

function renderDocuments() {
    const container = document.getElementById('documentsList');
    if (!container) return;
    
    if (complianceData.documents.length === 0) {
        container.innerHTML = '<p class="text-muted">No documents found</p>';
        return;
    }
    
    container.innerHTML = complianceData.documents.map(doc => `
        <div class="card mb-3">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-start">
                    <div class="flex-grow-1">
                        <h5 class="card-title">${doc.title}</h5>
                        <p class="card-text mb-2">
                            <strong>Type:</strong> ${doc.document_type}<br>
                            <strong>Category:</strong> ${doc.category || 'N/A'}<br>
                            <strong>Status:</strong> ${doc.status || 'N/A'}
                            ${doc.expiry_date ? `<br><strong>Expiry:</strong> ${new Date(doc.expiry_date).toLocaleDateString()}` : ''}
                        </p>
                    </div>
                    <div class="ms-3">
                        <button class="btn btn-sm btn-outline-primary me-2" onclick="editComplianceDocument('${doc.id}')" title="Edit">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteComplianceDocument('${doc.id}', '${doc.title}')" title="Delete">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

function renderCertificates() {
    const container = document.getElementById('certificatesList');
    if (!container) return;
    
    if (complianceData.certificates.length === 0) {
        container.innerHTML = '<p class="text-muted">No certificates found</p>';
        return;
    }
    
    container.innerHTML = complianceData.certificates.map(cert => `
        <div class="card mb-3">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-start">
                    <div class="flex-grow-1">
                        <h5 class="card-title">${cert.certificate_type}</h5>
                        <p class="card-text mb-2">
                            <strong>Number:</strong> ${cert.certificate_number}<br>
                            <strong>Issued:</strong> ${cert.issued_date ? new Date(cert.issued_date).toLocaleDateString() : 'N/A'}<br>
                            <strong>Expires:</strong> ${cert.expiry_date ? new Date(cert.expiry_date).toLocaleDateString() : 'N/A'}<br>
                            <strong>Status:</strong> ${cert.status || 'N/A'}
                        </p>
                    </div>
                    <div class="ms-3">
                        <button class="btn btn-sm btn-outline-primary me-2" onclick="editCertificate('${cert.id}')" title="Edit">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteCertificate('${cert.id}', '${cert.certificate_type}')" title="Delete">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

function renderAudits() {
    const container = document.getElementById('auditsList');
    if (!container) return;
    
    if (complianceData.audits.length === 0) {
        container.innerHTML = '<p class="text-muted">No audits found</p>';
        return;
    }
    
    container.innerHTML = complianceData.audits.map(audit => `
        <div class="card mb-3">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-start">
                    <div class="flex-grow-1">
                        <h5 class="card-title">${audit.audit_type}</h5>
                        <p class="card-text mb-2">
                            <strong>Date:</strong> ${new Date(audit.audit_date).toLocaleDateString()}<br>
                            <strong>Auditor:</strong> ${audit.auditor_name || 'N/A'}<br>
                            <strong>Score:</strong> ${audit.score || 'N/A'}%<br>
                            <strong>Status:</strong> ${audit.status || 'N/A'}
                        </p>
                    </div>
                    <div class="ms-3">
                        <button class="btn btn-sm btn-outline-primary me-2" onclick="editAudit('${audit.id}')" title="Edit">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteAudit('${audit.id}', '${audit.audit_type}')" title="Delete">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

function setupEventListeners() {
    // Generate Report button
    const generateBtn = document.querySelector('[data-action="generate-report"]');
    if (generateBtn) {
        generateBtn.addEventListener('click', generateAuditReport);
    }
    
    // Schedule Audit button
    const scheduleBtn = document.querySelector('[data-action="schedule-audit"]');
    if (scheduleBtn) {
        scheduleBtn.addEventListener('click', scheduleAudit);
    }
}

function generateAuditReport() {
    console.log('Generating audit report...');
    // Implementation coming soon
}

function scheduleAudit() {
    document.getElementById('editAuditId').value = '';
    document.getElementById('editAuditType').value = '';
    document.getElementById('editAuditDate').value = '';
    document.getElementById('editAuditorName').value = '';
    document.getElementById('editAuditScore').value = '';
    document.getElementById('editAuditStatus').value = 'scheduled';
    
    const modal = new bootstrap.Modal(document.getElementById('editAuditModal'));
    modal.show();
}

/**
 * Edit compliance document
 */
async function editComplianceDocument(documentId) {
    const doc = complianceData.documents.find(d => String(d.id) === String(documentId));
    if (!doc) {
        showErrorMessage('Document not found');
        return;
    }
    
    document.getElementById('editDocumentId').value = doc.id;
    document.getElementById('editDocumentTitle').value = doc.title || '';
    document.getElementById('editDocumentType').value = doc.document_type || '';
    document.getElementById('editDocumentCategory').value = doc.category || '';
    document.getElementById('editDocumentStatus').value = doc.status || 'active';
    document.getElementById('editDocumentExpiry').value = doc.expiry_date ? doc.expiry_date.split('T')[0] : '';
    
    const modal = new bootstrap.Modal(document.getElementById('editDocumentModal'));
    modal.show();
}

/**
 * Save compliance document
 */
async function saveComplianceDocument() {
    try {
        const documentId = document.getElementById('editDocumentId').value;
        const farmId = localStorage.getItem('selectedFarmId');
        
        if (!farmId || farmId === 'all') {
            showErrorMessage('Please select a farm');
            return;
        }
        
        const documentData = {
            farm_id: farmId,
            title: document.getElementById('editDocumentTitle').value,
            document_type: document.getElementById('editDocumentType').value,
            category: document.getElementById('editDocumentCategory').value || null,
            status: document.getElementById('editDocumentStatus').value || 'active',
            expiry_date: document.getElementById('editDocumentExpiry').value || null
        };
        
        if (!documentData.title || !documentData.document_type) {
            showErrorMessage('Title and Type are required');
            return;
        }
        
        let result;
        if (documentId) {
            result = await dataFunctions.updateComplianceDocument(documentId, documentData);
            showSuccessMessage('Document updated successfully');
        } else {
            result = await dataFunctions.createComplianceDocument(documentData);
            showSuccessMessage('Document created successfully');
        }
        
        await loadComplianceData();
        
        const modal = bootstrap.Modal.getInstance(document.getElementById('editDocumentModal'));
        if (modal) modal.hide();
        
    } catch (error) {
        console.error('Error saving document:', error);
        showErrorMessage('Failed to save document: ' + error.message);
    }
}

/**
 * Delete compliance document
 */
async function deleteComplianceDocument(documentId, documentTitle) {
    if (!confirm(`Are you sure you want to delete "${documentTitle}"? This action cannot be undone.`)) {
        return;
    }
    
    try {
        await dataFunctions.deleteComplianceDocument(documentId);
        showSuccessMessage('Document deleted successfully');
        await loadComplianceData();
    } catch (error) {
        console.error('Error deleting document:', error);
        showErrorMessage('Failed to delete document: ' + error.message);
    }
}

/**
 * Edit certificate
 */
async function editCertificate(certificateId) {
    const cert = complianceData.certificates.find(c => String(c.id) === String(certificateId));
    if (!cert) {
        showErrorMessage('Certificate not found');
        return;
    }
    
    document.getElementById('editCertificateId').value = cert.id;
    document.getElementById('editCertificateType').value = cert.certificate_type || '';
    document.getElementById('editCertificateNumber').value = cert.certificate_number || '';
    document.getElementById('editCertificateIssued').value = cert.issued_date ? cert.issued_date.split('T')[0] : '';
    document.getElementById('editCertificateExpiry').value = cert.expiry_date ? cert.expiry_date.split('T')[0] : '';
    document.getElementById('editCertificateAuthority').value = cert.issuing_authority || '';
    document.getElementById('editCertificateStatus').value = cert.status || 'active';
    
    const modal = new bootstrap.Modal(document.getElementById('editCertificateModal'));
    modal.show();
}

/**
 * Save certificate
 */
async function saveCertificate() {
    try {
        const certificateId = document.getElementById('editCertificateId').value;
        const farmId = localStorage.getItem('selectedFarmId');
        
        if (!farmId || farmId === 'all') {
            showErrorMessage('Please select a farm');
            return;
        }
        
        const certificateData = {
            farm_id: farmId,
            certificate_type: document.getElementById('editCertificateType').value,
            certificate_number: document.getElementById('editCertificateNumber').value,
            issued_date: document.getElementById('editCertificateIssued').value || null,
            expiry_date: document.getElementById('editCertificateExpiry').value || null,
            issuing_authority: document.getElementById('editCertificateAuthority').value || null,
            status: document.getElementById('editCertificateStatus').value || 'active'
        };
        
        if (!certificateData.certificate_type || !certificateData.certificate_number) {
            showErrorMessage('Certificate Type and Number are required');
            return;
        }
        
        let result;
        if (certificateId) {
            result = await dataFunctions.updateCertificate(certificateId, certificateData);
            showSuccessMessage('Certificate updated successfully');
        } else {
            result = await dataFunctions.createCertificate(certificateData);
            showSuccessMessage('Certificate created successfully');
        }
        
        await loadComplianceData();
        
        const modal = bootstrap.Modal.getInstance(document.getElementById('editCertificateModal'));
        if (modal) modal.hide();
        
    } catch (error) {
        console.error('Error saving certificate:', error);
        showErrorMessage('Failed to save certificate: ' + error.message);
    }
}

/**
 * Delete certificate
 */
async function deleteCertificate(certificateId, certificateType) {
    if (!confirm(`Are you sure you want to delete "${certificateType}"? This action cannot be undone.`)) {
        return;
    }
    
    try {
        await dataFunctions.deleteCertificate(certificateId);
        showSuccessMessage('Certificate deleted successfully');
        await loadComplianceData();
    } catch (error) {
        console.error('Error deleting certificate:', error);
        showErrorMessage('Failed to delete certificate: ' + error.message);
    }
}

/**
 * Edit audit
 */
async function editAudit(auditId) {
    const audit = complianceData.audits.find(a => String(a.id) === String(auditId));
    if (!audit) {
        showErrorMessage('Audit not found');
        return;
    }
    
    document.getElementById('editAuditId').value = audit.id;
    document.getElementById('editAuditType').value = audit.audit_type || '';
    document.getElementById('editAuditDate').value = audit.audit_date ? audit.audit_date.split('T')[0] : '';
    document.getElementById('editAuditorName').value = audit.auditor_name || '';
    document.getElementById('editAuditScore').value = audit.score || '';
    document.getElementById('editAuditStatus').value = audit.status || 'scheduled';
    document.getElementById('editAuditFindings').value = audit.findings || '';
    document.getElementById('editAuditRecommendations').value = audit.recommendations || '';
    
    const modal = new bootstrap.Modal(document.getElementById('editAuditModal'));
    modal.show();
}

/**
 * Save audit
 */
async function saveAudit() {
    try {
        const auditId = document.getElementById('editAuditId').value;
        const farmId = localStorage.getItem('selectedFarmId');
        
        if (!farmId || farmId === 'all') {
            showErrorMessage('Please select a farm');
            return;
        }
        
        const auditData = {
            farm_id: farmId,
            audit_type: document.getElementById('editAuditType').value,
            audit_date: document.getElementById('editAuditDate').value,
            auditor_name: document.getElementById('editAuditorName').value || null,
            score: document.getElementById('editAuditScore').value ? parseFloat(document.getElementById('editAuditScore').value) : null,
            status: document.getElementById('editAuditStatus').value || 'scheduled',
            findings: document.getElementById('editAuditFindings').value || null,
            recommendations: document.getElementById('editAuditRecommendations').value || null
        };
        
        if (!auditData.audit_type || !auditData.audit_date) {
            showErrorMessage('Audit Type and Date are required');
            return;
        }
        
        let result;
        if (auditId) {
            result = await dataFunctions.updateAudit(auditId, auditData);
            showSuccessMessage('Audit updated successfully');
        } else {
            result = await dataFunctions.createAudit(auditData);
            showSuccessMessage('Audit created successfully');
        }
        
        await loadComplianceData();
        
        const modal = bootstrap.Modal.getInstance(document.getElementById('editAuditModal'));
        if (modal) modal.hide();
        
    } catch (error) {
        console.error('Error saving audit:', error);
        showErrorMessage('Failed to save audit: ' + error.message);
    }
}

/**
 * Delete audit
 */
async function deleteAudit(auditId, auditType) {
    if (!confirm(`Are you sure you want to delete "${auditType}"? This action cannot be undone.`)) {
        return;
    }
    
    try {
        await dataFunctions.deleteAudit(auditId);
        showSuccessMessage('Audit deleted successfully');
        await loadComplianceData();
    } catch (error) {
        console.error('Error deleting audit:', error);
        showErrorMessage('Failed to delete audit: ' + error.message);
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

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeComplianceGrid);
} else {
    initializeComplianceGrid();
}


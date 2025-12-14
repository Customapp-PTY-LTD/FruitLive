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
                // Set initial value from localStorage
                const savedFarmId = localStorage.getItem('selectedFarmId') || 'all';
                if (savedFarmId !== 'all') {
                    farmSelector.value = savedFarmId;
                }
                
                farmSelector.addEventListener('change', () => {
                    const selectedFarmId = farmSelector.value || 'all';
                    if (selectedFarmId !== 'all') {
                        localStorage.setItem('selectedFarmId', selectedFarmId);
                    } else {
                        localStorage.removeItem('selectedFarmId');
                    }
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
        
        // Setup modal event listeners to clear forms on close
        const auditModal = document.getElementById('editAuditModal');
        if (auditModal) {
            auditModal.addEventListener('hidden.bs.modal', function() {
                // Clear form when modal is closed
                document.getElementById('editAuditId').value = '';
                document.getElementById('editAuditType').value = '';
                document.getElementById('editAuditDate').value = '';
                document.getElementById('editAuditorName').value = '';
                document.getElementById('editAuditScore').value = '';
                document.getElementById('editAuditStatus').value = 'scheduled';
                document.getElementById('editAuditNotes').value = '';
                
                // Remove any validation classes
                const formFields = auditModal.querySelectorAll('.form-control, .form-select');
                formFields.forEach(field => {
                    field.classList.remove('is-invalid', 'is-valid');
                });
            });
        }
        
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
        
        // Get farm ID from selector or localStorage
        const farmSelector = document.getElementById('farmFilter');
        const farmId = farmSelector ? (farmSelector.value || 'all') : (localStorage.getItem('selectedFarmId') || 'all');
        
        // Update localStorage
        if (farmId !== 'all') {
            localStorage.setItem('selectedFarmId', farmId);
        }
        
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
        
        // Update compliance stats
        updateComplianceStats();
    } catch (error) {
        console.error('Error loading compliance data:', error);
        complianceData.documents = [];
        complianceData.certificates = [];
        complianceData.audits = [];
        renderDocuments();
        renderCertificates();
        renderAudits();
        updateComplianceStats();
    }
}

function renderDocuments() {
    const container = document.getElementById('documentsList');
    if (!container) return;
    
    if (complianceData.documents.length === 0) {
        container.innerHTML = `
            <div class="text-center py-4">
                <i class="bi bi-file-earmark fs-1 text-muted mb-3"></i>
                <p class="text-muted mb-0">No compliance documents found</p>
                <small class="text-muted">Click "Add Document" to create a new compliance document</small>
            </div>
        `;
        return;
    }
    
    container.innerHTML = complianceData.documents.map(doc => {
        const statusClass = doc.status === 'active' ? 'success' : doc.status === 'expired' ? 'danger' : 'warning';
        const expiryDate = doc.expiry_date ? new Date(doc.expiry_date).toLocaleDateString() : null;
        const isExpiring = expiryDate && new Date(doc.expiry_date) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        
        return `
        <div class="card mb-3">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-start">
                    <div class="flex-grow-1">
                        <h5 class="card-title mb-2">${escapeHtml(doc.title || 'Untitled Document')}</h5>
                        <p class="card-text mb-2">
                            <span class="badge bg-${statusClass} me-2">${escapeHtml(doc.status || 'N/A')}</span>
                            <strong>Type:</strong> ${escapeHtml(doc.document_type || 'N/A')}<br>
                            ${doc.category ? `<strong>Category:</strong> ${escapeHtml(doc.category)}<br>` : ''}
                            ${expiryDate ? `<strong>Expiry:</strong> ${expiryDate}${isExpiring ? ' <span class="text-warning">⚠ Expiring Soon</span>' : ''}<br>` : ''}
                            ${doc.created_at ? `<small class="text-muted">Created: ${new Date(doc.created_at).toLocaleDateString()}</small>` : ''}
                        </p>
                    </div>
                    <div class="ms-3">
                        <button class="btn btn-sm btn-outline-primary me-2" onclick="editComplianceDocument('${doc.id}')" title="Edit">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteComplianceDocument('${doc.id}', '${escapeHtml(doc.title || 'this document')}')" title="Delete">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
        `;
    }).join('');
}

function renderCertificates() {
    const container = document.getElementById('certificatesList');
    if (!container) return;
    
    if (complianceData.certificates.length === 0) {
        container.innerHTML = `
            <div class="text-center py-4">
                <i class="bi bi-award fs-1 text-muted mb-3"></i>
                <p class="text-muted mb-0">No certificates found</p>
                <small class="text-muted">Click "Add Certificate" to create a new certificate</small>
            </div>
        `;
        return;
    }
    
    container.innerHTML = complianceData.certificates.map(cert => {
        const expiryDate = cert.expiry_date ? new Date(cert.expiry_date) : null;
        const today = new Date();
        const isExpired = expiryDate && expiryDate < today;
        const isExpiringSoon = expiryDate && expiryDate >= today && expiryDate <= new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
        const statusClass = isExpired ? 'danger' : isExpiringSoon ? 'warning' : 'success';
        
        return `
        <div class="card mb-3">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-start">
                    <div class="flex-grow-1">
                        <h5 class="card-title mb-2">${escapeHtml(cert.certificate_type || 'Untitled Certificate')}</h5>
                        <p class="card-text mb-2">
                            <span class="badge bg-${statusClass} me-2">${escapeHtml(cert.status || 'N/A')}</span>
                            <strong>Number:</strong> ${escapeHtml(cert.certificate_number || 'N/A')}<br>
                            ${cert.issued_date ? `<strong>Issued:</strong> ${new Date(cert.issued_date).toLocaleDateString()}<br>` : ''}
                            ${expiryDate ? `<strong>Expires:</strong> ${expiryDate.toLocaleDateString()}${isExpiringSoon ? ' <span class="text-warning">⚠ Expiring Soon</span>' : ''}${isExpired ? ' <span class="text-danger">⚠ Expired</span>' : ''}<br>` : ''}
                            ${cert.issuing_authority ? `<strong>Authority:</strong> ${escapeHtml(cert.issuing_authority)}<br>` : ''}
                        </p>
                    </div>
                    <div class="ms-3">
                        <button class="btn btn-sm btn-outline-primary me-2" onclick="editCertificate('${cert.id}')" title="Edit">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteCertificate('${cert.id}', '${escapeHtml(cert.certificate_type || 'this certificate')}')" title="Delete">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
        `;
    }).join('');
}

function renderAudits() {
    const container = document.getElementById('auditsList');
    if (!container) return;
    
    if (complianceData.audits.length === 0) {
        container.innerHTML = `
            <div class="text-center py-4">
                <i class="bi bi-clipboard-check fs-1 text-muted mb-3"></i>
                <p class="text-muted mb-0">No audits found</p>
                <small class="text-muted">Click "Schedule Audit" to create a new audit</small>
            </div>
        `;
        return;
    }
    
    container.innerHTML = complianceData.audits.map(audit => {
        const statusClass = audit.status === 'completed' ? 'success' : audit.status === 'in_progress' ? 'warning' : audit.status === 'cancelled' ? 'danger' : 'info';
        const score = audit.score !== null && audit.score !== undefined ? audit.score : null;
        const scoreClass = score !== null ? (score >= 80 ? 'success' : score >= 60 ? 'warning' : 'danger') : '';
        
        return `
        <div class="card mb-3">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-start">
                    <div class="flex-grow-1">
                        <h5 class="card-title mb-2">${escapeHtml(audit.audit_type || 'Untitled Audit')}</h5>
                        <p class="card-text mb-2">
                            <span class="badge bg-${statusClass} me-2">${escapeHtml(audit.status || 'N/A')}</span>
                            ${audit.audit_date ? `<strong>Date:</strong> ${new Date(audit.audit_date).toLocaleDateString()}<br>` : ''}
                            ${audit.auditor_name ? `<strong>Auditor:</strong> ${escapeHtml(audit.auditor_name)}<br>` : ''}
                            ${score !== null ? `<strong>Score:</strong> <span class="text-${scoreClass}">${score}%</span><br>` : ''}
                            ${audit.notes ? `<strong>Notes:</strong> ${escapeHtml(audit.notes.substring(0, 150))}${audit.notes.length > 150 ? '...' : ''}<br>` : ''}
                        </p>
                    </div>
                    <div class="ms-3">
                        <button class="btn btn-sm btn-outline-primary me-2" onclick="editAudit('${audit.id}')" title="Edit">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteAudit('${audit.id}', '${escapeHtml(audit.audit_type || 'this audit')}')" title="Delete">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
        `;
    }).join('');
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
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
    // Clear all form fields
    document.getElementById('editAuditId').value = '';
    document.getElementById('editAuditType').value = '';
    document.getElementById('editAuditDate').value = '';
    document.getElementById('editAuditorName').value = '';
    document.getElementById('editAuditScore').value = '';
    document.getElementById('editAuditStatus').value = 'scheduled';
    document.getElementById('editAuditNotes').value = '';
    
    // Remove validation classes
    const modalElement = document.getElementById('editAuditModal');
    if (modalElement) {
        const formFields = modalElement.querySelectorAll('.form-control, .form-select');
        formFields.forEach(field => {
            field.classList.remove('is-invalid', 'is-valid');
        });
    }
    
    const modal = new bootstrap.Modal(document.getElementById('editAuditModal'));
    modal.show();
}

/**
 * Close audit modal
 */
function closeAuditModal() {
    const modalElement = document.getElementById('editAuditModal');
    if (modalElement) {
        // Get existing modal instance or create new one
        let modal = bootstrap.Modal.getInstance(modalElement);
        if (!modal) {
            modal = new bootstrap.Modal(modalElement);
        }
        modal.hide();
    }
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
        const farmSelector = document.getElementById('farmFilter');
        const farmId = farmSelector ? (farmSelector.value || 'all') : (localStorage.getItem('selectedFarmId') || 'all');
        
        if (!farmId || farmId === 'all') {
            showErrorMessage('Please select a specific farm before creating a document');
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
    document.getElementById('editAuditNotes').value = audit.notes || '';
    
    const modal = new bootstrap.Modal(document.getElementById('editAuditModal'));
    modal.show();
}

/**
 * Save audit
 */
async function saveAudit() {
    try {
        const auditId = document.getElementById('editAuditId').value;
        const farmSelector = document.getElementById('farmFilter');
        const farmId = farmSelector ? (farmSelector.value || 'all') : (localStorage.getItem('selectedFarmId') || 'all');
        
        if (!farmId || farmId === 'all') {
            showErrorMessage('Please select a specific farm before creating an audit');
            return;
        }
        
        const auditData = {
            farm_id: farmId,
            audit_type: document.getElementById('editAuditType').value,
            audit_date: document.getElementById('editAuditDate').value,
            auditor_name: document.getElementById('editAuditorName').value || null,
            score: document.getElementById('editAuditScore').value ? parseFloat(document.getElementById('editAuditScore').value) : null,
            status: document.getElementById('editAuditStatus').value || 'scheduled',
            notes: document.getElementById('editAuditNotes').value || null
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

/**
 * Update compliance statistics
 */
function updateComplianceStats() {
    // Calculate documents complete
    const totalDocuments = complianceData.documents.length;
    const activeDocuments = complianceData.documents.filter(d => d.status === 'active' || !d.status).length;
    const documentsCompleteEl = document.getElementById('documentsComplete');
    if (documentsCompleteEl) {
        documentsCompleteEl.textContent = `${activeDocuments}/${totalDocuments}`;
    }
    
    // Calculate certificates expiring (within 7 days)
    const today = new Date();
    const sevenDaysFromNow = new Date(today);
    sevenDaysFromNow.setDate(today.getDate() + 7);
    
    const expiringCertificates = complianceData.certificates.filter(cert => {
        if (!cert.expiry_date) return false;
        const expiryDate = new Date(cert.expiry_date);
        return expiryDate >= today && expiryDate <= sevenDaysFromNow && cert.status !== 'expired';
    }).length;
    
    const certificatesExpiringEl = document.getElementById('certificatesExpiring');
    if (certificatesExpiringEl) {
        certificatesExpiringEl.textContent = expiringCertificates;
    }
    
    // Calculate certified staff (valid certificates)
    const validCertificates = complianceData.certificates.filter(cert => {
        if (cert.status === 'expired' || cert.status === 'revoked') return false;
        if (cert.expiry_date) {
            const expiryDate = new Date(cert.expiry_date);
            return expiryDate >= today;
        }
        return true;
    }).length;
    
    // For now, we'll use certificate count as staff count (can be enhanced later)
    const certifiedStaffEl = document.getElementById('certifiedStaff');
    if (certifiedStaffEl) {
        certifiedStaffEl.textContent = `${validCertificates}/${complianceData.certificates.length}`;
    }
    
    // Calculate compliance score (based on documents and certificates)
    let score = 0;
    let maxScore = 0;
    
    // Documents: 50% weight
    if (totalDocuments > 0) {
        score += (activeDocuments / totalDocuments) * 50;
    }
    maxScore += 50;
    
    // Certificates: 30% weight
    const totalCertificates = complianceData.certificates.length;
    if (totalCertificates > 0) {
        score += (validCertificates / totalCertificates) * 30;
    }
    maxScore += 30;
    
    // Audits: 20% weight (completed audits with good scores)
    const completedAudits = complianceData.audits.filter(a => a.status === 'completed' && a.score >= 80).length;
    const totalAudits = complianceData.audits.length;
    if (totalAudits > 0) {
        score += (completedAudits / totalAudits) * 20;
    }
    maxScore += 20;
    
    const complianceScore = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
    
    // Update compliance score display
    const complianceScoreText = document.getElementById('complianceScoreText');
    const complianceScoreDisplay = document.getElementById('complianceScoreDisplay');
    const complianceProgressBar = document.getElementById('complianceProgressBar');
    const complianceStatus = document.getElementById('complianceStatus');
    
    if (complianceScoreText) complianceScoreText.textContent = `${complianceScore}%`;
    if (complianceScoreDisplay) complianceScoreDisplay.textContent = `${complianceScore}%`;
    if (complianceProgressBar) {
        complianceProgressBar.style.width = `${complianceScore}%`;
        // Update color based on score
        if (complianceScore >= 90) {
            complianceProgressBar.className = 'progress-bar bg-success';
        } else if (complianceScore >= 70) {
            complianceProgressBar.className = 'progress-bar bg-warning';
        } else {
            complianceProgressBar.className = 'progress-bar bg-danger';
        }
    }
    if (complianceStatus) {
        if (complianceScore >= 90) {
            complianceStatus.textContent = 'Audit Ready';
        } else if (complianceScore >= 70) {
            complianceStatus.textContent = 'Needs Improvement';
        } else {
            complianceStatus.textContent = 'Action Required';
        }
    }
    
    // Update next audit
    const nextAudit = complianceData.audits
        .filter(a => a.status === 'scheduled' && a.audit_date)
        .sort((a, b) => new Date(a.audit_date) - new Date(b.audit_date))[0];
    
    const nextAuditText = document.getElementById('nextAuditText');
    if (nextAuditText) {
        if (nextAudit) {
            const auditDate = new Date(nextAudit.audit_date);
            nextAuditText.textContent = `Next audit: ${nextAudit.audit_type} - ${auditDate.toLocaleDateString()}`;
        } else {
            nextAuditText.textContent = 'No upcoming audits scheduled';
        }
    }
}

// Make functions globally accessible for onclick handlers
if (typeof window !== 'undefined') {
    window.saveComplianceDocument = saveComplianceDocument;
    window.editComplianceDocument = editComplianceDocument;
    window.deleteComplianceDocument = deleteComplianceDocument;
    window.saveCertificate = saveCertificate;
    window.editCertificate = editCertificate;
    window.deleteCertificate = deleteCertificate;
    window.saveAudit = saveAudit;
    window.editAudit = editAudit;
    window.deleteAudit = deleteAudit;
    window.scheduleAudit = scheduleAudit;
    window.closeAuditModal = closeAuditModal;
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeComplianceGrid);
} else {
    initializeComplianceGrid();
}


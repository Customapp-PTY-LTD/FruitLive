# UI CRUD Implementation Guide

## Status Summary

### ✅ Completed Backend (Data Functions)
- All UPDATE/DELETE functions implemented
- All GET functions support filters
- Ready for UI integration

### ✅ Completed UI Implementation

#### 1. Chemicals Module ✅
- ✅ Edit/Delete buttons added to render functions
- ✅ Modals added to HTML
- ✅ CRUD functions implemented (editChemical, deleteChemical, editSprayApplication, deleteSprayApplication)
- ✅ Save functions implemented

#### 2. Compliance Module ✅  
- ✅ Edit/Delete buttons added to render functions
- ✅ CRUD functions implemented (editComplianceDocument, deleteComplianceDocument, editCertificate, deleteCertificate, editAudit, deleteAudit)
- ⚠️ Modals need to be added to HTML (see below for template)

### ⏳ Remaining Modules

#### 3. Crops Module
- ❌ Need to add edit/delete buttons to renderMeasurements()
- ❌ Need to add modals to HTML
- ❌ Need to implement editFruitMeasurement, deleteFruitMeasurement, saveMeasurement functions

#### 4. Post-Harvest Module
- ❌ Need to add edit/delete buttons to renderConsignments()
- ❌ Need to add modals to HTML
- ❌ Need to implement editConsignment, deleteConsignment, saveConsignment functions

#### 5. Water Module
- ❌ Need to add edit/delete buttons to renderPumpReadings()
- ❌ Need to add edit/delete buttons and CRUD for licenses
- ❌ Need to add modals to HTML
- ❌ Need to implement edit/delete functions

#### 6. Assets Module (Fuel Transactions)
- ❌ Need to add edit/delete buttons to renderFuelTransactions()
- ❌ Need to add modals to HTML
- ❌ Need to implement editFuelTransaction, deleteFuelTransaction functions

## Modal Templates

### Compliance Document Modal
```html
<div class="modal fade" id="editDocumentModal" tabindex="-1">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">Add/Edit Compliance Document</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
                <input type="hidden" id="editDocumentId" value="">
                <div class="row g-3">
                    <div class="col-md-12">
                        <label class="form-label">Title <span class="text-danger">*</span></label>
                        <input type="text" class="form-control" id="editDocumentTitle" required>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Document Type <span class="text-danger">*</span></label>
                        <input type="text" class="form-control" id="editDocumentType" required>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Category</label>
                        <input type="text" class="form-control" id="editDocumentCategory">
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Status</label>
                        <select class="form-select" id="editDocumentStatus">
                            <option value="active">Active</option>
                            <option value="expired">Expired</option>
                            <option value="pending">Pending</option>
                        </select>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Expiry Date</label>
                        <input type="date" class="form-control" id="editDocumentExpiry">
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                <button type="button" class="btn btn-primary" onclick="saveComplianceDocument()">Save Document</button>
            </div>
        </div>
    </div>
</div>
```

### Certificate Modal
```html
<div class="modal fade" id="editCertificateModal" tabindex="-1">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">Add/Edit Certificate</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
                <input type="hidden" id="editCertificateId" value="">
                <div class="row g-3">
                    <div class="col-md-6">
                        <label class="form-label">Certificate Type <span class="text-danger">*</span></label>
                        <input type="text" class="form-control" id="editCertificateType" required>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Certificate Number <span class="text-danger">*</span></label>
                        <input type="text" class="form-control" id="editCertificateNumber" required>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Issued Date</label>
                        <input type="date" class="form-control" id="editCertificateIssued">
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Expiry Date</label>
                        <input type="date" class="form-control" id="editCertificateExpiry">
                    </div>
                    <div class="col-md-12">
                        <label class="form-label">Issuing Authority</label>
                        <input type="text" class="form-control" id="editCertificateAuthority">
                    </div>
                    <div class="col-md-12">
                        <label class="form-label">Status</label>
                        <select class="form-select" id="editCertificateStatus">
                            <option value="active">Active</option>
                            <option value="expired">Expired</option>
                            <option value="revoked">Revoked</option>
                        </select>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                <button type="button" class="btn btn-primary" onclick="saveCertificate()">Save Certificate</button>
            </div>
        </div>
    </div>
</div>
```

### Audit Modal
```html
<div class="modal fade" id="editAuditModal" tabindex="-1">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">Add/Edit Audit</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
                <input type="hidden" id="editAuditId" value="">
                <div class="row g-3">
                    <div class="col-md-6">
                        <label class="form-label">Audit Type <span class="text-danger">*</span></label>
                        <input type="text" class="form-control" id="editAuditType" required>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Audit Date <span class="text-danger">*</span></label>
                        <input type="date" class="form-control" id="editAuditDate" required>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Auditor Name</label>
                        <input type="text" class="form-control" id="editAuditorName">
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Score (%)</label>
                        <input type="number" class="form-control" id="editAuditScore" min="0" max="100">
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Status</label>
                        <select class="form-select" id="editAuditStatus">
                            <option value="scheduled">Scheduled</option>
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                    <div class="col-md-12">
                        <label class="form-label">Findings</label>
                        <textarea class="form-control" id="editAuditFindings" rows="3"></textarea>
                    </div>
                    <div class="col-md-12">
                        <label class="form-label">Recommendations</label>
                        <textarea class="form-control" id="editAuditRecommendations" rows="3"></textarea>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                <button type="button" class="btn btn-primary" onclick="saveAudit()">Save Audit</button>
            </div>
        </div>
    </div>
</div>
```

## Pattern for Adding CRUD to Remaining Modules

### Step 1: Update Render Function
Add edit/delete buttons to each item:
```javascript
container.innerHTML = data.map(item => `
    <div class="card mb-3">
        <div class="card-body">
            <div class="d-flex justify-content-between align-items-start">
                <div class="flex-grow-1">
                    <!-- Item details -->
                </div>
                <div class="ms-3">
                    <button class="btn btn-sm btn-outline-primary me-2" onclick="editItem('${item.id}')">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteItem('${item.id}', '${item.name}')">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    </div>
`).join('');
```

### Step 2: Add Modal to HTML
Use templates above or follow the pattern from chemicals module.

### Step 3: Implement Functions
```javascript
async function editItem(itemId) {
    const item = data.find(i => String(i.id) === String(itemId));
    // Populate modal fields
    // Show modal
}

async function saveItem() {
    // Get form values
    // Call dataFunctions.updateItem() or dataFunctions.createItem()
    // Reload data
    // Hide modal
}

async function deleteItem(itemId, itemName) {
    if (!confirm(`Delete "${itemName}"?`)) return;
    await dataFunctions.deleteItem(itemId);
    // Reload data
}
```

## Testing Checklist

After implementing each module:
1. ✅ Test CREATE - Add new item
2. ✅ Test READ - View items in list
3. ✅ Test UPDATE - Edit existing item
4. ✅ Test DELETE - Delete item (with confirmation)
5. ✅ Test FILTER - Filter by farm/block/etc
6. ✅ Test SEARCH - Search functionality (if implemented)
7. ✅ Verify error handling
8. ✅ Verify success messages

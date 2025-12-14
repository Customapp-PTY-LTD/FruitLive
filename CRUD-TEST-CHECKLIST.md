# FruitLive CRUD & Search Functionality Test Checklist

## Overview
This document tracks the CRUD (Create, Read, Update, Delete) and Search functionality for each module based on the specifications.

## Test Data Generator
Use `test-data-generator.js` to populate the database with realistic test data. Run in browser console after logging in:
```javascript
generateTestData()
```

---

## Module 1: Dashboard ✅
**Status:** READ-ONLY MODULE

### Required Operations:
- ✅ GET - Load dashboard data (getDashboardStats, getDashboardAlerts, getRecentActivity)
- ❌ CREATE - Not applicable
- ❌ UPDATE - Not applicable  
- ❌ DELETE - Not applicable

### Search/Filter:
- ✅ Farm selector filter
- ✅ Date range filtering (implied in API calls)

**Test:** Verify dashboard loads with stats, alerts, and recent activity for selected farm.

---

## Module 2: Labour Management ⚠️

### Required CRUD Operations:

#### Workers:
- ✅ CREATE - `createWorker()` ✅ Implemented
- ✅ READ - `getWorkers()` ✅ Implemented
- ❌ UPDATE - `updateWorker()` ❌ **MISSING**
- ❌ DELETE - `deleteWorker()` or `deactivateWorker()` ❌ **MISSING**

#### Worker Allocations:
- ✅ CREATE - `createWorkerAllocation()` ✅ Implemented
- ✅ READ - `getWorkerAllocations()` ✅ Implemented
- ❌ UPDATE - `updateWorkerAllocation()` ❌ **MISSING**
- ❌ DELETE - `deleteWorkerAllocation()` ❌ **MISSING**

### Search/Filter:
- ✅ Search by name/ID number ✅ Implemented in `searchWorkers()`
- ✅ Filter by farm ✅ Implemented
- ✅ Filter by block ✅ Implemented
- ✅ Filter by task type ✅ Implemented
- ✅ Filter by status ✅ Implemented
- ✅ Pagination ✅ Implemented

**Missing Functions to Add:**
```javascript
// In js/data-functions.js
updateWorker: async function (workerId, workerData, token = null) {
    const params = {
        p_worker_id: workerId,
        p_first_name: workerData.first_name || null,
        p_last_name: workerData.last_name || null,
        // ... other fields
    };
    return await this.callFunction('update_worker_simple', params, token);
},

deleteWorker: async function (workerId, token = null) {
    return await this.callFunction('deactivate_worker', { p_worker_id: workerId }, token);
},

updateWorkerAllocation: async function (allocationId, allocationData, token = null) {
    // Implementation needed
},

deleteWorkerAllocation: async function (allocationId, token = null) {
    // Implementation needed
}
```

**Test Data:** 30 workers, 50 allocations created by test data generator.

---

## Module 3: Compliance & Audits ⚠️

### Required CRUD Operations:

#### Compliance Documents:
- ✅ CREATE - `createComplianceDocument()` ✅ Implemented
- ✅ READ - `getComplianceDocuments()` ✅ Implemented
- ❌ UPDATE - `updateComplianceDocument()` ❌ **MISSING**
- ❌ DELETE - `deleteComplianceDocument()` ❌ **MISSING**

#### Certificates:
- ✅ CREATE - `createCertificate()` ✅ Implemented
- ✅ READ - `getCertificates()` ✅ Implemented
- ❌ UPDATE - `updateCertificate()` ❌ **MISSING**
- ❌ DELETE - `deleteCertificate()` ❌ **MISSING**

#### Audits:
- ✅ READ - `getAudits()` ✅ Implemented
- ❌ CREATE - `createAudit()` ❌ **MISSING**
- ❌ UPDATE - `updateAudit()` ❌ **MISSING**
- ❌ DELETE - `deleteAudit()` ❌ **MISSING**

### Search/Filter:
- ❌ Search by title/category ❌ **MISSING**
- ❌ Filter by document type ❌ **MISSING**
- ❌ Filter by expiry date ❌ **MISSING**
- ❌ Filter by status ❌ **MISSING**

**Missing Functions to Add:**
```javascript
updateComplianceDocument: async function (documentId, documentData, token = null) {
    // Implementation needed
},

deleteComplianceDocument: async function (documentId, token = null) {
    // Implementation needed
},

updateCertificate: async function (certificateId, certificateData, token = null) {
    // Implementation needed
},

deleteCertificate: async function (certificateId, token = null) {
    // Implementation needed
},

createAudit: async function (auditData, token = null) {
    // Implementation needed
},

updateAudit: async function (auditId, auditData, token = null) {
    // Implementation needed
}
```

**Test Data:** 15 compliance documents, 15 certificates created by test data generator.

---

## Module 4: Chemical Management ⚠️

### Required CRUD Operations:

#### Chemicals:
- ✅ CREATE - `createChemical()` ✅ Implemented
- ✅ READ - `getChemicals()` ✅ Implemented
- ❌ UPDATE - `updateChemical()` ❌ **MISSING**
- ❌ DELETE - `deleteChemical()` ❌ **MISSING**

#### Spray Applications:
- ✅ CREATE - `createSprayApplication()` ✅ Implemented
- ✅ READ - `getSprayApplications()` ✅ Implemented
- ❌ UPDATE - `updateSprayApplication()` ❌ **MISSING**
- ❌ DELETE - `deleteSprayApplication()` ❌ **MISSING**

### Search/Filter:
- ❌ Search by chemical name ❌ **MISSING**
- ❌ Filter by farm ❌ **MISSING**
- ❌ Filter by block ❌ **MISSING**
- ❌ Filter by application date ❌ **MISSING**
- ❌ Filter by PHI days ❌ **MISSING**

**Missing Functions to Add:**
```javascript
updateChemical: async function (chemicalId, chemicalData, token = null) {
    // Implementation needed
},

deleteChemical: async function (chemicalId, token = null) {
    // Implementation needed
},

updateSprayApplication: async function (applicationId, applicationData, token = null) {
    // Implementation needed
},

deleteSprayApplication: async function (applicationId, token = null) {
    // Implementation needed
}
```

**Test Data:** 10 chemicals, 15 spray applications created by test data generator.

---

## Module 5: Crop Monitoring ⚠️

### Required CRUD Operations:

#### Fruit Measurements:
- ✅ CREATE - `createFruitMeasurement()` ✅ Implemented
- ✅ READ - `getFruitMeasurements()` ✅ Implemented
- ❌ UPDATE - `updateFruitMeasurement()` ❌ **MISSING**
- ❌ DELETE - `deleteFruitMeasurement()` ❌ **MISSING**

### Search/Filter:
- ❌ Filter by farm ❌ **MISSING**
- ❌ Filter by block ❌ **MISSING**
- ❌ Filter by variety ❌ **MISSING**
- ❌ Filter by measurement date ❌ **MISSING**
- ❌ Filter by days after bloom ❌ **MISSING**

**Missing Functions to Add:**
```javascript
updateFruitMeasurement: async function (measurementId, measurementData, token = null) {
    // Implementation needed
},

deleteFruitMeasurement: async function (measurementId, token = null) {
    // Implementation needed
}
```

**Test Data:** 20 fruit measurements created by test data generator.

---

## Module 6: Asset Management ✅

### Required CRUD Operations:

#### Vehicles:
- ✅ CREATE - `createVehicle()` ✅ Implemented
- ✅ READ - `getVehicles()` ✅ Implemented
- ✅ UPDATE - `updateVehicle()` ✅ Implemented
- ✅ DELETE - `deleteVehicle()` ✅ Implemented

#### Fuel Transactions:
- ✅ CREATE - `createFuelTransaction()` ✅ Implemented
- ✅ READ - `getFuelTransactions()` ✅ Implemented
- ❌ UPDATE - `updateFuelTransaction()` ❌ **MISSING**
- ❌ DELETE - `deleteFuelTransaction()` ❌ **MISSING**

### Search/Filter:
- ❌ Search by registration number ❌ **MISSING**
- ❌ Filter by vehicle type ❌ **MISSING**
- ❌ Filter by farm ❌ **MISSING**
- ❌ Filter by date range ❌ **MISSING**

**Missing Functions to Add:**
```javascript
updateFuelTransaction: async function (transactionId, transactionData, token = null) {
    // Implementation needed
},

deleteFuelTransaction: async function (transactionId, token = null) {
    // Implementation needed
}
```

**Test Data:** 15 vehicles, 25 fuel transactions created by test data generator.

---

## Module 7: Post-Harvest ⚠️

### Required CRUD Operations:

#### Consignments:
- ✅ CREATE - `createConsignment()` ✅ Implemented
- ✅ READ - `getConsignments()` ✅ Implemented
- ❌ UPDATE - `updateConsignment()` ❌ **MISSING**
- ❌ DELETE - `deleteConsignment()` ❌ **MISSING**

### Search/Filter:
- ❌ Search by consignment number ❌ **MISSING**
- ❌ Filter by farm ❌ **MISSING**
- ❌ Filter by block ❌ **MISSING**
- ❌ Filter by harvest date ❌ **MISSING**
- ❌ Filter by market destination ❌ **MISSING**

**Missing Functions to Add:**
```javascript
updateConsignment: async function (consignmentId, consignmentData, token = null) {
    // Implementation needed
},

deleteConsignment: async function (consignmentId, token = null) {
    // Implementation needed
}
```

**Test Data:** 15 consignments created by test data generator.

---

## Module 8: Water & Irrigation ⚠️

### Required CRUD Operations:

#### Pump Readings:
- ✅ CREATE - `createPumpReading()` ✅ Implemented
- ✅ READ - `getPumpReadings()` ✅ Implemented
- ❌ UPDATE - `updatePumpReading()` ❌ **MISSING**
- ❌ DELETE - `deletePumpReading()` ❌ **MISSING**

#### Water Licenses:
- ✅ READ - `getWaterLicenses()` ✅ Implemented
- ❌ CREATE - `createWaterLicense()` ❌ **MISSING**
- ❌ UPDATE - `updateWaterLicense()` ❌ **MISSING**
- ❌ DELETE - `deleteWaterLicense()` ❌ **MISSING**

### Search/Filter:
- ❌ Filter by farm ❌ **MISSING**
- ❌ Filter by pump location ❌ **MISSING**
- ❌ Filter by date range ❌ **MISSING**

**Missing Functions to Add:**
```javascript
updatePumpReading: async function (readingId, readingData, token = null) {
    // Implementation needed
},

deletePumpReading: async function (readingId, token = null) {
    // Implementation needed
},

createWaterLicense: async function (licenseData, token = null) {
    // Implementation needed
},

updateWaterLicense: async function (licenseId, licenseData, token = null) {
    // Implementation needed
}
```

**Test Data:** 90 pump readings (30 per farm for 30 days) created by test data generator.

---

## Module 9: Administration ✅

### Required CRUD Operations:

#### Farms:
- ✅ CREATE - `createFarm()` ✅ Implemented
- ✅ READ - `getFarms()`, `getFarmById()` ✅ Implemented
- ✅ UPDATE - `updateFarm()` ✅ Implemented
- ❌ DELETE - `deleteFarm()` or `deactivateFarm()` ❌ **MISSING**

#### Users:
- ✅ CREATE - `createUser()` ✅ Implemented
- ✅ READ - `getUsers()`, `getUserById()` ✅ Implemented
- ✅ UPDATE - `updateUser()` ✅ Implemented
- ✅ DELETE - `deleteUser()`, `deactivateUser()` ✅ Implemented

#### Roles:
- ✅ CREATE - `createRole()` ✅ Implemented
- ✅ READ - `getRoles()`, `getRoleById()` ✅ Implemented
- ✅ UPDATE - `updateRole()` ✅ Implemented
- ✅ DELETE - `deactivateRole()` ✅ Implemented

#### Blocks:
- ✅ CREATE - `createBlock()` ✅ Implemented
- ✅ READ - `getBlocks()` ✅ Implemented (via farm selector)
- ❌ UPDATE - `updateBlock()` ❌ **MISSING**
- ❌ DELETE - `deleteBlock()` ❌ **MISSING**

#### Varieties:
- ✅ CREATE - `createVariety()` ✅ Implemented
- ✅ READ - `getVarieties()` ✅ Implemented (via selector)
- ❌ UPDATE - `updateVariety()` ❌ **MISSING**
- ❌ DELETE - `deleteVariety()` ❌ **MISSING**

### Search/Filter:
- ✅ User search/filter ✅ Implemented in users module
- ✅ Role filter ✅ Implemented
- ❌ Farm search ❌ **MISSING**
- ❌ Block search ❌ **MISSING**

**Test Data:** 5 farms, 12 blocks, 7 varieties created by test data generator.

---

## Summary

### ✅ Fully Implemented Modules:
1. **Dashboard** - Read-only, all required operations present
2. **Asset Management (Vehicles)** - Full CRUD implemented

### ⚠️ Partially Implemented Modules:
1. **Labour Management** - Missing UPDATE/DELETE for workers and allocations
2. **Compliance & Audits** - Missing UPDATE/DELETE, missing CREATE/UPDATE/DELETE for audits
3. **Chemical Management** - Missing UPDATE/DELETE for chemicals and applications
4. **Crop Monitoring** - Missing UPDATE/DELETE for measurements
5. **Post-Harvest** - Missing UPDATE/DELETE for consignments
6. **Water & Irrigation** - Missing UPDATE/DELETE, missing CRUD for licenses
7. **Administration** - Missing DELETE for farms, UPDATE/DELETE for blocks/varieties

### 🔍 Search/Filter Status:
- Most modules have basic filtering in UI but need backend support
- Search functionality is minimal across modules
- Labour module has the most complete search/filter implementation

---

## Next Steps

1. **Add Missing UPDATE Functions** - Implement update functions for all entities
2. **Add Missing DELETE Functions** - Implement delete/deactivate functions
3. **Add Search/Filter Backend** - Add search parameters to GET functions
4. **Add UI Search Forms** - Implement search forms in each module
5. **Test CRUD Operations** - Use test data generator and manually test each operation
6. **Add Validation** - Ensure all CREATE/UPDATE operations validate input
7. **Add Error Handling** - Ensure proper error messages for failed operations

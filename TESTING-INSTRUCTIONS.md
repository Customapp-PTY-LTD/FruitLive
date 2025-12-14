# Testing Instructions for CRUD Implementation

## Quick Start Testing

### 1. Load Test Scripts
The test scripts are already included in `index.html`:
- `test-crud-functions.js` - Tests function availability
- `test-data-generator.js` - Generates test data

### 2. Generate Test Data
1. Log into the application
2. Open browser console (F12)
3. Run:
   ```javascript
   generateTestData()
   ```
4. Wait for completion (will create ~300+ records)
5. Check console for success messages

### 3. Test Function Availability
Run in console:
```javascript
testAllCRUDFunctions()
```
This will verify all CRUD functions exist and are callable.

## Module-by-Module Testing Guide

### Chemicals Module
**Test Create:**
1. Navigate to Chemicals module
2. Click "Add Chemical" button
3. Fill in:
   - Chemical Name: "Test Chemical"
   - Active Ingredient: "Test Ingredient"
   - PHI Days: 7
   - Quantity: 100
   - Unit: kg
4. Click "Save Chemical"
5. ✅ Verify: Success message, chemical appears in list

**Test Edit:**
1. Click edit button (pencil icon) on any chemical
2. Modify values
3. Click "Save Chemical"
4. ✅ Verify: Changes reflected in list

**Test Delete:**
1. Click delete button (trash icon) on any chemical
2. Confirm deletion
3. ✅ Verify: Chemical removed from list

**Test Applications:**
- Same workflow for spray applications
- ✅ Verify: Can create/edit/delete applications

### Compliance Module
**Test Documents:**
1. Navigate to Compliance → Global GAP tab
2. Click "Add Document"
3. Fill in required fields
4. ✅ Verify: Document appears in list, can edit/delete

**Test Certificates:**
1. Navigate to Compliance → Training & Certificates tab
2. Click "Add Certificate"
3. Fill in certificate details
4. ✅ Verify: Certificate appears, can edit/delete

**Test Audits:**
1. Navigate to Compliance → Caesar Audits tab
2. Click "Schedule Audit"
3. Fill in audit details
4. ✅ Verify: Audit appears, can edit/delete

### Crops Module
**Test Measurements:**
1. Navigate to Crops module
2. Click "Record Sampling"
3. Fill in measurement details
4. ✅ Verify: Measurement appears in list, can edit/delete

### Post-Harvest Module
**Test Consignments:**
1. Navigate to Post-Harvest module
2. Click "Record Consignment"
3. Fill in consignment details
4. ✅ Verify: Consignment appears, can edit/delete

### Water Module
**Test Pump Readings:**
1. Navigate to Water → Pump Meters tab
2. Click "Record Meter Reading"
3. Fill in reading details
4. ✅ Verify: Reading appears, can edit/delete

**Test Licenses:**
1. Navigate to Water → Compliance tab
2. Click "Add Water License"
3. Fill in license details
4. ✅ Verify: License appears, can edit/delete

### Assets Module
**Test Fuel Transactions:**
1. Navigate to Assets → Fuel Management tab
2. Click "Record Fuel Transaction" or "Add Transaction"
3. Fill in transaction details (select vehicle from dropdown)
4. ✅ Verify: Transaction appears, can edit/delete

**Test Vehicles:**
1. Navigate to Assets → Vehicles tab
2. Vehicles already have full CRUD
3. ✅ Verify: Can create/edit/delete vehicles

## Common Test Scenarios

### Filter Testing
1. Select different farms from farm selector
2. ✅ Verify: Only data for selected farm appears
3. Select "All Farms"
4. ✅ Verify: All data appears

### Error Handling
1. Try to save without required fields
2. ✅ Verify: Error message appears
3. Try to delete a record
4. ✅ Verify: Confirmation dialog appears

### Data Persistence
1. Create a new record
2. Refresh the page
3. ✅ Verify: Record still exists

### Modal Functionality
1. Click "Add" button
2. ✅ Verify: Modal opens with empty fields
3. Fill in data and cancel
4. ✅ Verify: No data saved
5. Fill in data and save
6. ✅ Verify: Data saved and modal closes

## Expected Results

### ✅ All Modules Should:
- Display data in list format
- Show edit/delete buttons for each item
- Open modals for create/edit
- Show success messages after operations
- Show error messages for failures
- Reload data after create/update/delete
- Support farm filtering
- Persist data after page refresh

### ✅ All Modals Should:
- Open when "Add" button clicked (with empty fields)
- Open when "Edit" button clicked (with populated fields)
- Close on Cancel or after successful save
- Validate required fields
- Handle errors gracefully

## Troubleshooting

### Functions Not Found
- Check console for errors
- Verify `js/data-functions.js` is loaded
- Run `testAllCRUDFunctions()` to verify availability

### Modals Don't Open
- Check browser console for JavaScript errors
- Verify Bootstrap 5 is loaded
- Check that modal HTML exists in the page

### Data Not Saving
- Check network tab for API calls
- Verify authentication token is valid
- Check console for error messages
- Verify required fields are filled

### Dropdowns Not Populating
- Check that farm is selected
- Verify `populateBlockSelector`, `populateVarietySelector`, etc. are available
- Check console for errors during dropdown population

## Success Criteria

✅ **Complete** when:
1. All modules can create records
2. All modules can edit records
3. All modules can delete records (with confirmation)
4. All modals open and close correctly
5. All data persists after page refresh
6. Farm filtering works correctly
7. No console errors during operations
8. Success/error messages appear appropriately

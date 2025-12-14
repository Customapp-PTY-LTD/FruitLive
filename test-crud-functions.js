/**
 * CRUD Functions Test Script
 * 
 * Run this in the browser console after logging in to test all CRUD functions.
 * Usage: testAllCRUDFunctions()
 * 
 * NOTE: If you see UUID validation errors, do a hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
 * to clear the browser cache and load the latest JavaScript files.
 */

const CRUDTester = {
    results: {
        passed: [],
        failed: []
    },

    async testAllCRUDFunctions() {
        console.log('🧪 Testing all CRUD functions...\n');
        this.results = { passed: [], failed: [] };

        // Test that dataFunctions exists
        if (typeof dataFunctions === 'undefined') {
            console.error('❌ dataFunctions is not defined!');
            return;
        }

        console.log('✅ dataFunctions object found\n');

        // Test GET functions with filters
        await this.testFunction('getWorkers', () => dataFunctions.getWorkers({}), 'GET');
        await this.testFunction('getWorkers with filters', () => dataFunctions.getWorkers({ farmId: 'all', search: 'test', status: 'active' }), 'GET');
        await this.testFunction('getWorkerAllocations', () => dataFunctions.getWorkerAllocations({}), 'GET');
        await this.testFunction('getChemicals', () => dataFunctions.getChemicals({}), 'GET');
        await this.testFunction('getSprayApplications', () => dataFunctions.getSprayApplications({}), 'GET');
        await this.testFunction('getFruitMeasurements', () => dataFunctions.getFruitMeasurements({}), 'GET');
        await this.testFunction('getVehicles', () => dataFunctions.getVehicles({}), 'GET');
        await this.testFunction('getFuelTransactions', () => dataFunctions.getFuelTransactions({}), 'GET');
        await this.testFunction('getPumpReadings', () => dataFunctions.getPumpReadings({}), 'GET');
        await this.testFunction('getWaterLicenses', () => dataFunctions.getWaterLicenses({}), 'GET');
        await this.testFunction('getConsignments', () => dataFunctions.getConsignments({}), 'GET');
        await this.testFunction('getComplianceDocuments', () => dataFunctions.getComplianceDocuments({}), 'GET');
        await this.testFunction('getCertificates', () => dataFunctions.getCertificates({}), 'GET');
        await this.testFunction('getAudits', () => dataFunctions.getAudits({}), 'GET');

        // Test UPDATE functions exist
        await this.testFunctionExists('updateWorker');
        await this.testFunctionExists('updateWorkerAllocation');
        await this.testFunctionExists('updateChemical');
        await this.testFunctionExists('updateSprayApplication');
        await this.testFunctionExists('updateFruitMeasurement');
        await this.testFunctionExists('updateFuelTransaction');
        await this.testFunctionExists('updatePumpReading');
        await this.testFunctionExists('updateWaterLicense');
        await this.testFunctionExists('updateConsignment');
        await this.testFunctionExists('updateComplianceDocument');
        await this.testFunctionExists('updateCertificate');
        await this.testFunctionExists('updateAudit');
        await this.testFunctionExists('updateBlock');
        await this.testFunctionExists('updateVariety');

        // Test DELETE functions exist
        await this.testFunctionExists('deleteWorker');
        await this.testFunctionExists('deleteWorkerAllocation');
        await this.testFunctionExists('deleteChemical');
        await this.testFunctionExists('deleteSprayApplication');
        await this.testFunctionExists('deleteFruitMeasurement');
        await this.testFunctionExists('deleteFuelTransaction');
        await this.testFunctionExists('deletePumpReading');
        await this.testFunctionExists('deleteWaterLicense');
        await this.testFunctionExists('deleteConsignment');
        await this.testFunctionExists('deleteComplianceDocument');
        await this.testFunctionExists('deleteCertificate');
        await this.testFunctionExists('deleteAudit');
        await this.testFunctionExists('deleteBlock');
        await this.testFunctionExists('deleteVariety');
        await this.testFunctionExists('deleteFarm');

        // Test CREATE functions exist
        await this.testFunctionExists('createWaterLicense');
        await this.testFunctionExists('createAudit');

        // Print summary
        console.log('\n📊 Test Summary:');
        console.log(`✅ Passed: ${this.results.passed.length}`);
        console.log(`❌ Failed: ${this.results.failed.length}`);
        
        if (this.results.failed.length > 0) {
            console.log('\n❌ Failed tests:');
            this.results.failed.forEach(test => {
                console.log(`   - ${test}`);
            });
        }

        return {
            passed: this.results.passed.length,
            failed: this.results.failed.length,
            results: this.results
        };
    },

    async testFunction(name, func, type = 'FUNCTION') {
        try {
            if (typeof func !== 'function') {
                throw new Error('Not a function');
            }
            
            // For GET functions, we just check they don't throw on call (they may return empty arrays)
            if (type === 'GET') {
                const result = await func();
                this.results.passed.push(name);
                console.log(`✅ ${name} - Returns: ${Array.isArray(result) ? `Array(${result.length})` : typeof result}`);
            } else {
                // For other functions, just check they exist and are callable
                this.results.passed.push(name);
                console.log(`✅ ${name}`);
            }
        } catch (error) {
            this.results.failed.push(`${name}: ${error.message}`);
            console.error(`❌ ${name}: ${error.message}`);
        }
    },

    async testFunctionExists(functionName) {
        try {
            if (typeof dataFunctions[functionName] === 'function') {
                this.results.passed.push(functionName);
                console.log(`✅ ${functionName} exists`);
            } else {
                throw new Error('Function does not exist');
            }
        } catch (error) {
            this.results.failed.push(`${functionName}: ${error.message}`);
            console.error(`❌ ${functionName}: ${error.message}`);
        }
    }
};

// Make available globally
window.testAllCRUDFunctions = function() {
    return CRUDTester.testAllCRUDFunctions();
};

console.log('✅ CRUD Functions Test Script loaded!');
console.log('Run: testAllCRUDFunctions() to test all CRUD functions');

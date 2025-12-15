/**
 * Script to create 100 workers and assign them randomly to farms
 * Run this in the browser console after logging in
 */

// South African first names (common)
const firstNames = [
    'Johannes', 'Pieter', 'Willem', 'Andries', 'Jacobus', 'Hendrik', 'Gerhard', 'Frederik',
    'Maria', 'Anna', 'Sarie', 'Johanna', 'Magdalena', 'Elizabeth', 'Petronella', 'Susanna',
    'John', 'David', 'James', 'Michael', 'Robert', 'William', 'Richard', 'Joseph',
    'Sarah', 'Mary', 'Jennifer', 'Lisa', 'Patricia', 'Linda', 'Barbara', 'Susan',
    'Sipho', 'Thabo', 'Lungelo', 'Nkosana', 'Sibusiso', 'Mandla', 'Bongani', 'Lwazi',
    'Nomsa', 'Thandeka', 'Nolwazi', 'Zanele', 'Nokuthula', 'Sibongile', 'Lindiwe', 'Pumla'
];

// South African last names (common)
const lastNames = [
    'Botha', 'Van der Merwe', 'Van Wyk', 'Fourie', 'Coetzee', 'De Villiers', 'Du Plessis', 'Steyn',
    'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
    'Mthembu', 'Dlamini', 'Ndlovu', 'Mkhize', 'Ngubane', 'Mabena', 'Zulu', 'Khumalo',
    'Mahlangu', 'Nkomo', 'Nxumalo', 'Molefe', 'Modise', 'Molepo', 'Radebe', 'Mtshali'
];

// Positions
const positions = ['Pruner', 'Harvester', 'Mower', 'Weeder', 'Sprayer', 'Induna', 'General Worker', 'Team Leader'];

// Employment types
const employmentTypes = ['permanent', 'seasonal', 'casual'];

/**
 * Generate random phone number (South African format)
 */
function generatePhone() {
    const prefix = '+27';
    const areaCode = ['82', '83', '84'][Math.floor(Math.random() * 3)]; // Mobile prefixes
    const number = Math.floor(1000000 + Math.random() * 9000000).toString();
    return `${prefix}${areaCode}${number}`;
}

/**
 * Generate employee number
 */
function generateEmployeeNumber() {
    const prefix = 'EMP';
    const number = Math.floor(100000 + Math.random() * 900000).toString();
    return `${prefix}-${number}`;
}

/**
 * Generate ID number (South African format - 13 digits)
 */
function generateIdNumber() {
    return Math.floor(8000000000000 + Math.random() * 2000000000000).toString();
}

/**
 * Create 100 workers with random assignments
 */
async function create100Workers() {
    console.log('Starting to create 100 workers...');
    
    try {
        // Wait for dataFunctions
        if (typeof dataFunctions === 'undefined') {
            await new Promise(resolve => setTimeout(resolve, 1000));
            if (typeof dataFunctions === 'undefined') {
                throw new Error('dataFunctions not available. Please ensure you are logged in.');
            }
        }
        
        // Get all farms
        const farmsResponse = await dataFunctions.getFarms();
        let farms = farmsResponse;
        if (farmsResponse && !Array.isArray(farmsResponse)) {
            if (farmsResponse.farms && Array.isArray(farmsResponse.farms)) {
                farms = farmsResponse.farms;
            } else if (farmsResponse.data && Array.isArray(farmsResponse.data)) {
                farms = farmsResponse.data;
            } else {
                farms = [];
            }
        }
        
        if (!farms || farms.length === 0) {
            throw new Error('No farms found. Please create farms first.');
        }
        
        console.log(`Found ${farms.length} farms`);
        
        const results = {
            created: 0,
            failed: 0,
            errors: []
        };
        
        // Create workers in batches to avoid overwhelming the API
        const batchSize = 10;
        for (let i = 0; i < 100; i += batchSize) {
            const batchPromises = [];
            
            for (let j = 0; j < batchSize && (i + j) < 100; j++) {
                const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
                const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
                const farm = farms[Math.floor(Math.random() * farms.length)];
                const employmentType = employmentTypes[Math.floor(Math.random() * employmentTypes.length)];
                const position = positions[Math.floor(Math.random() * positions.length)];
                
                // Random hourly rate between R30 and R80
                const hourlyRate = parseFloat((30 + Math.random() * 50).toFixed(2));
                
                // Random hire date within last 5 years
                const hireDate = new Date();
                hireDate.setFullYear(hireDate.getFullYear() - Math.floor(Math.random() * 5));
                hireDate.setMonth(Math.floor(Math.random() * 12));
                hireDate.setDate(Math.floor(Math.random() * 28) + 1);
                
                const workerData = {
                    employee_number: generateEmployeeNumber(),
                    first_name: firstName,
                    last_name: lastName,
                    id_number: generateIdNumber(),
                    phone: generatePhone(),
                    email: `${firstName.toLowerCase()}.${lastName.toLowerCase().replace(/\s+/g, '')}@example.com`,
                    home_farm_id: farm.id,
                    current_farm_id: farm.id, // Initially assigned to home farm
                    employment_type: employmentType,
                    position: position,
                    hourly_rate: hourlyRate,
                    hire_date: hireDate.toISOString().split('T')[0]
                };
                
                const promise = dataFunctions.createWorker(workerData)
                    .then(result => {
                        results.created++;
                        console.log(`Created worker ${i + j + 1}/100: ${firstName} ${lastName} (${workerData.employee_number})`);
                        return result;
                    })
                    .catch(error => {
                        results.failed++;
                        results.errors.push({
                            worker: `${firstName} ${lastName}`,
                            error: error.message
                        });
                        console.error(`Failed to create worker ${i + j + 1}/100: ${firstName} ${lastName}`, error);
                    });
                
                batchPromises.push(promise);
            }
            
            // Wait for batch to complete
            await Promise.all(batchPromises);
            
            // Small delay between batches
            if (i + batchSize < 100) {
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }
        
        console.log('\n=== Summary ===');
        console.log(`Successfully created: ${results.created} workers`);
        console.log(`Failed: ${results.failed} workers`);
        
        if (results.errors.length > 0) {
            console.log('\nErrors:');
            results.errors.forEach(err => {
                console.log(`- ${err.worker}: ${err.error}`);
            });
        }
        
        console.log('\n✓ Worker creation completed!');
        return results;
        
    } catch (error) {
        console.error('Error creating workers:', error);
        throw error;
    }
}

// Make function globally available
window.create100Workers = create100Workers;

console.log('✓ Script loaded. Run create100Workers() in the console to create 100 workers.');

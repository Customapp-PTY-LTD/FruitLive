/**
 * Assign Workers to Farm
 * 
 * This script assigns existing workers to a specific farm.
 * 
 * NOTE: Due to RBAC permissions, this script may not work if your role
 * doesn't have permission to execute 'update_worker_simple'.
 * 
 * If you get "Access denied" errors, use the Supabase MCP or SQL directly:
 * 
 * UPDATE workers
 * SET current_farm_id = '230c143f-9480-4c25-b738-0b6c16635b68',
 *     home_farm_id = '230c143f-9480-4c25-b738-0b6c16635b68',
 *     updated_at = NOW()
 * WHERE current_farm_id IS NULL AND is_active = true
 * LIMIT 15;
 * 
 * Usage:
 * assignWorkersToFarm('230c143f-9480-4c25-b738-0b6c16635b68', 15)
 */

async function assignWorkersToFarm(farmId, count = 15) {
    console.log(`🔄 Assigning ${count} workers to farm ${farmId}...\n`);
    
    try {
        // Get all workers
        const allWorkers = await dataFunctions.getWorkers({});
        console.log(`📋 Found ${allWorkers?.length || 0} total workers`);
        
        // Filter workers that don't have a current_farm_id
        // Check for falsy values (null, undefined, empty string) - UUIDs don't need trimming
        const unassignedWorkers = Array.isArray(allWorkers) 
            ? allWorkers.filter(w => !w.current_farm_id || (typeof w.current_farm_id === 'string' && !w.current_farm_id.trim()))
            : [];
        
        console.log(`👥 Found ${unassignedWorkers.length} unassigned workers`);
        
        if (unassignedWorkers.length === 0) {
            console.warn('⚠ No unassigned workers found. Creating new workers...');
            // Create new workers instead
            await createWorkersForFarm(farmId, count);
            return;
        }
        
        // Take up to the requested count
        const workersToAssign = unassignedWorkers.slice(0, count);
        console.log(`\n🔧 Assigning ${workersToAssign.length} workers to farm...\n`);
        
        let successCount = 0;
        let errorCount = 0;
        
        for (const worker of workersToAssign) {
            try {
                const result = await dataFunctions.updateWorker(worker.id, {
                    current_farm_id: farmId,
                    home_farm_id: farmId, // Also set as home farm
                    is_active: true
                });
                
                if (result && result.success !== false) {
                    successCount++;
                    if (successCount <= 5) {
                        console.log(`   ✓ Assigned: ${worker.first_name} ${worker.last_name} (${worker.employee_number})`);
                    }
                } else {
                    errorCount++;
                    console.warn(`   ✗ Failed to assign: ${worker.employee_number}`);
                }
            } catch (error) {
                errorCount++;
                console.error(`   ✗ Error assigning ${worker.employee_number}:`, error.message);
            }
        }
        
        console.log(`\n✅ Assignment complete!`);
        console.log(`   Success: ${successCount}`);
        console.log(`   Errors: ${errorCount}`);
        
        // Verify assignment
        console.log(`\n🔍 Verifying assignment...`);
        const farmWorkers = await dataFunctions.getWorkers({ farmId: farmId });
        console.log(`   Workers now assigned to farm: ${farmWorkers?.length || 0}`);
        
        return { successCount, errorCount, totalAssigned: farmWorkers?.length || 0 };
        
    } catch (error) {
        console.error('❌ Error assigning workers:', error);
        throw error;
    }
}

/**
 * Create new workers for a farm
 */
async function createWorkersForFarm(farmId, count = 15) {
    console.log(`\n👷 Creating ${count} new workers for farm...\n`);
    
    const firstNames = ['John', 'Sarah', 'Michael', 'Emily', 'David', 'Lisa', 'James', 'Anna', 'Robert', 'Maria', 'William', 'Jennifer', 'Charles', 'Linda', 'Thomas'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Wilson', 'Anderson', 'Taylor'];
    
    // Get existing workers to avoid duplicate employee numbers
    let existingEmployeeNumbers = new Set();
    try {
        const existingWorkers = await dataFunctions.getWorkers({});
        if (existingWorkers && Array.isArray(existingWorkers)) {
            existingWorkers.forEach(w => {
                if (w.employee_number) {
                    existingEmployeeNumbers.add(w.employee_number);
                }
            });
        }
    } catch (error) {
        console.warn('Could not fetch existing workers for employee number check');
    }
    
    let employeeCounter = existingEmployeeNumbers.size + 1;
    let successCount = 0;
    
    for (let i = 0; i < count; i++) {
        const firstName = firstNames[i % firstNames.length];
        const lastName = lastNames[Math.floor(i / firstNames.length)];
        const idPrefix = ['900101', '890215', '880330', '910425', '920530'][i % 5];
        const idNumber = `${idPrefix}${String(i).padStart(7, '0')}0${i % 2}`;
        
        // Generate unique employee number
        let employeeNumber;
        do {
            employeeNumber = `EMP${String(employeeCounter++).padStart(4, '0')}`;
        } while (existingEmployeeNumbers.has(employeeNumber));
        
        existingEmployeeNumbers.add(employeeNumber);
        
        try {
            const result = await dataFunctions.createWorker({
                first_name: firstName,
                last_name: lastName,
                id_number: idNumber,
                employee_number: employeeNumber,
                hourly_rate: 25 + Math.random() * 15, // R25-R40 per hour
                phone: `+27${Math.floor(Math.random() * 900000000) + 100000000}`, // 9 digits after +27 (SA mobile format)
                is_active: true,
                employment_type: i % 3 === 0 ? 'permanent' : (i % 3 === 1 ? 'seasonal' : 'contract'),
                home_farm_id: farmId,
                current_farm_id: farmId
            });
            
            if (result && (result.id || result.success !== false)) {
                successCount++;
                if (successCount <= 5) {
                    console.log(`   ✓ Created: ${firstName} ${lastName} (${employeeNumber})`);
                }
            }
        } catch (error) {
            console.error(`   ✗ Error creating worker ${i + 1}:`, error.message);
        }
    }
    
    console.log(`\n✅ Created ${successCount} workers`);
    return successCount;
}

// Make available globally
if (typeof window !== 'undefined') {
    window.assignWorkersToFarm = assignWorkersToFarm;
    window.createWorkersForFarm = createWorkersForFarm;
    console.log('Functions available: assignWorkersToFarm(farmId, count)');
}

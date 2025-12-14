/**
 * Create Team Allocations
 * 
 * This script creates worker allocations for different teams/tasks across all farms.
 * 
 * Usage:
 * await createTeamAllocations();
 */

async function createTeamAllocations() {
    console.log('👥 Creating team allocations across all farms...\n');
    
    try {
        // Task types for different teams
        const taskTypes = ['pruning', 'mowing', 'weeding', 'harvesting', 'spraying', 'general'];
        
        // Get all farms
        const farms = await dataFunctions.getFarms();
        if (!farms || !Array.isArray(farms) || farms.length === 0) {
            console.error('No farms found');
            return;
        }
        
        console.log(`📋 Found ${farms.length} farms\n`);
        
        // Get today's date
        const today = new Date().toISOString().split('T')[0];
        
        let totalAllocations = 0;
        
        // For each farm
        for (const farm of farms) {
            if (!farm.id) continue;
            
            console.log(`🏡 Farm: ${farm.name || farm.id}`);
            
            // Get workers for this farm
            const farmWorkers = await dataFunctions.getWorkers({ farmId: farm.id });
            if (!farmWorkers || !Array.isArray(farmWorkers) || farmWorkers.length === 0) {
                console.log(`   ⚠ No workers found for this farm\n`);
                continue;
            }
            
            console.log(`   👷 Found ${farmWorkers.length} workers`);
            
            // Get blocks for this farm
            const blocks = await dataFunctions.getBlocks({ farmId: farm.id });
            const farmBlocks = blocks && Array.isArray(blocks) ? blocks : [];
            
            // Distribute workers across task types
            const workersPerTask = Math.ceil(farmWorkers.length / taskTypes.length);
            
            for (let i = 0; i < taskTypes.length; i++) {
                const taskType = taskTypes[i];
                const startIdx = i * workersPerTask;
                const endIdx = Math.min(startIdx + workersPerTask, farmWorkers.length);
                const taskWorkers = farmWorkers.slice(startIdx, endIdx);
                
                if (taskWorkers.length === 0) continue;
                
                // Get a block for this allocation (or null if no blocks)
                const block = farmBlocks.length > 0 
                    ? farmBlocks[i % farmBlocks.length] 
                    : null;
                
                // Create allocations for each worker in this team
                let successCount = 0;
                for (const worker of taskWorkers) {
                    try {
                        const allocationData = {
                            worker_id: worker.id,
                            farm_id: farm.id,
                            allocation_date: today,
                            block_id: block?.id || null,
                            task_type: taskType,
                            status: 'completed',
                            hours_worked: 8.0,
                            start_time: '07:00',
                            end_time: '16:00'
                        };
                        
                        const result = await dataFunctions.createWorkerAllocation(allocationData);
                        
                        if (result && (result.success !== false || result.id)) {
                            successCount++;
                            totalAllocations++;
                        }
                    } catch (error) {
                        // Silently continue - some allocations might fail
                        console.warn(`     ⚠ Failed to create allocation for ${worker.employee_number}: ${error.message}`);
                    }
                }
                
                if (successCount > 0) {
                    console.log(`     ✓ ${taskType}: ${successCount} allocations created`);
                }
            }
            
            console.log('');
        }
        
        console.log(`\n✅ Total allocations created: ${totalAllocations}`);
        return { totalAllocations };
        
    } catch (error) {
        console.error('❌ Error creating team allocations:', error);
        throw error;
    }
}

// Make available globally
if (typeof window !== 'undefined') {
    window.createTeamAllocations = createTeamAllocations;
    console.log('Function available: createTeamAllocations()');
}

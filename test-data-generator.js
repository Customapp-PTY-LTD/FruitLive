/**
 * FruitLive Test Data Generator
 * 
 * This script generates realistic test data for all modules to verify CRUD operations.
 * Run this in the browser console after logging in to populate the database with test data.
 * 
 * Usage:
 * 1. Open browser console (F12)
 * 2. Copy and paste this entire script
 * 3. Execute: generateTestData()
 */

const TestDataGenerator = {
    // Store created IDs for reference
    createdIds: {
        farms: [],
        blocks: [],
        varieties: [],
        workers: [],
        chemicals: [],
        vehicles: [],
        complianceDocuments: [],
        certificates: [],
        consignments: []
    },

    /**
     * Main function to generate all test data
     */
    async generateTestData() {
        console.log('🌱 Starting FruitLive Test Data Generation...\n');
        
        try {
            // Generate in dependency order
            await this.generateFarms();
            await this.generateBlocks();
            // Skip varieties if function doesn't exist - will be handled in generateVarieties
            await this.generateVarieties();
            await this.generateWorkers();
            await this.generateChemicals();
            await this.generateSprayApplications();
            await this.generateFruitMeasurements();
            await this.generateVehicles();
            await this.generateFuelTransactions();
            await this.generatePumpReadings();
            await this.generateConsignments();
            await this.generateComplianceDocuments();
            await this.generateCertificates();
            await this.generateWorkerAllocations();
            
            console.log('\n✅ Test data generation complete!');
            console.log('\n📊 Summary:');
            console.log(`   Farms: ${this.createdIds.farms.length}`);
            console.log(`   Blocks: ${this.createdIds.blocks.length}`);
            console.log(`   Varieties: ${this.createdIds.varieties.length}`);
            console.log(`   Workers: ${this.createdIds.workers.length}`);
            console.log(`   Chemicals: ${this.createdIds.chemicals.length}`);
            console.log(`   Vehicles: ${this.createdIds.vehicles.length}`);
            console.log(`   Compliance Documents: ${this.createdIds.complianceDocuments.length}`);
            console.log(`   Certificates: ${this.createdIds.certificates.length}`);
            console.log(`   Consignments: ${this.createdIds.consignments.length}`);
            
            return this.createdIds;
        } catch (error) {
            console.error('❌ Error generating test data:', error);
            throw error;
        }
    },

    /**
     * Generate Farms
     */
    async generateFarms() {
        console.log('📍 Generating farms...');
        
        const farms = [
            {
                name: 'Valley View Orchard',
                location: 'Paarl, Western Cape',
                size_hectares: 125,
                crop_types: 'Apples & Pears',
                description: 'Main production farm focusing on Granny Smith and Packham pears'
            },
            {
                name: 'Sunrise Citrus Estate',
                location: 'Citrusdal, Western Cape',
                size_hectares: 88,
                crop_types: 'Oranges & Lemons',
                description: 'Citrus production with focus on late-season oranges'
            },
            {
                name: 'Highlands Apple Farm',
                location: 'Elgin, Western Cape',
                size_hectares: 67,
                crop_types: 'Apples',
                description: 'Specialized in premium apple varieties including Pink Lady and Royal Gala'
            },
            {
                name: 'Riverbend Mixed Farm',
                location: 'Robertson, Western Cape',
                size_hectares: 145,
                crop_types: 'Grapes, Apples & Stone Fruit',
                description: 'Diversified farm with multiple crop types'
            },
            {
                name: 'Coastal Berry Farm',
                location: 'George, Western Cape',
                size_hectares: 42,
                crop_types: 'Blueberries & Raspberries',
                description: 'Berry production farm with advanced irrigation systems'
            }
        ];

        for (const farm of farms) {
            try {
                const result = await dataFunctions.createFarm({
                    name: farm.name,
                    location: farm.location,
                    size_hectares: farm.size_hectares,
                    crop_types: farm.crop_types,
                    description: farm.description,
                    is_active: true
                });
                
                if (result && result.id) {
                    this.createdIds.farms.push(result.id);
                    console.log(`   ✓ Created: ${farm.name}`);
                } else {
                    console.log(`   ⚠ Failed to create: ${farm.name}`);
                }
            } catch (error) {
                console.error(`   ✗ Error creating farm ${farm.name}:`, error.message);
            }
        }
        
        // Get farm IDs if not returned
        if (this.createdIds.farms.length === 0) {
            const existingFarms = await dataFunctions.getFarms();
            if (existingFarms && existingFarms.length > 0) {
                this.createdIds.farms = existingFarms.slice(0, 5).map(f => f.id);
                console.log(`   ℹ Using ${existingFarms.length} existing farms`);
            }
        }
    },

    /**
     * Generate Blocks
     */
    async generateBlocks() {
        console.log('🔲 Generating blocks...');
        
        const blockNames = ['A1', 'A2', 'A3', 'B1', 'B2', 'B3', 'C1', 'C2', 'D1', 'D2', 'E1', 'E2'];
        
        for (const farmId of this.createdIds.farms.slice(0, 3)) {
            // Create 4 blocks per farm
            for (let i = 0; i < 4; i++) {
                const blockName = blockNames[this.createdIds.blocks.length % blockNames.length];
                try {
                    const result = await dataFunctions.createBlock({
                        farm_id: farmId,
                        name: `Block ${blockName}`,
                        area_hectares: 8 + Math.random() * 5, // 8-13 hectares
                        crop_type: i % 2 === 0 ? 'Apples' : 'Pears',
                        is_active: true
                    });
                    
                    if (result && result.id) {
                        this.createdIds.blocks.push({ id: result.id, farm_id: farmId });
                        console.log(`   ✓ Created: Block ${blockName} for farm`);
                    }
                } catch (error) {
                    console.error(`   ✗ Error creating block:`, error.message);
                }
            }
        }
    },

    /**
     * Generate Varieties
     */
    async generateVarieties() {
        console.log('🍎 Generating varieties...');
        
        // First, get crop types to map names to IDs
        let cropTypeMap = {};
        try {
            // Try to get crop types - function may not exist
            if (typeof dataFunctions.getCropTypes === 'function') {
                const cropTypes = await dataFunctions.getCropTypes();
                if (cropTypes && Array.isArray(cropTypes)) {
                    cropTypes.forEach(ct => {
                        cropTypeMap[ct.name] = ct.id;
                    });
                }
            } else {
                console.warn('   ⚠ getCropTypes function not available, skipping variety generation');
                console.warn('   Note: create_variety_simple function may not exist in database');
                return;
            }
        } catch (error) {
            console.warn('   ⚠ Could not fetch crop types, skipping variety generation');
            console.warn('   Note: create_variety_simple function may not exist in database');
            return;
        }
        
        // Get first farm ID for variety assignment
        const farmId = this.createdIds.farms.length > 0 ? this.createdIds.farms[0] : null;
        
        const varieties = [
            { name: 'Granny Smith', crop_type: 'Apple', season: 'Late', hectares: 15 },
            { name: 'Royal Gala', crop_type: 'Apple', season: 'Early', hectares: 12 },
            { name: 'Pink Lady', crop_type: 'Apple', season: 'Late', hectares: 10 },
            { name: 'Packham', crop_type: 'Pear', season: 'Mid', hectares: 8 },
            { name: 'Forelle', crop_type: 'Pear', season: 'Early', hectares: 7 },
            { name: 'Valencia', crop_type: 'Orange', season: 'Late', hectares: 20 },
            { name: 'Navel', crop_type: 'Orange', season: 'Early', hectares: 18 }
        ];

        for (const variety of varieties) {
            try {
                // Map crop type name to ID
                const cropTypeId = cropTypeMap[variety.crop_type];
                if (!cropTypeId) {
                    console.warn(`   ⚠ Skipping ${variety.name}: crop type "${variety.crop_type}" not found`);
                    continue;
                }
                
                const result = await dataFunctions.createVariety({
                    farm_id: farmId,
                    name: variety.name,
                    crop_type_id: cropTypeId,
                    hectares: variety.hectares,
                    planting_year: 2020 + Math.floor(Math.random() * 5) // 2020-2024
                });
                
                if (result && result.id) {
                    this.createdIds.varieties.push(result.id);
                    console.log(`   ✓ Created: ${variety.name}`);
                }
            } catch (error) {
                console.error(`   ✗ Error creating variety ${variety.name}:`, error.message);
            }
        }
    },

    /**
     * Generate Workers
     */
    async generateWorkers() {
        console.log('👷 Generating workers...');
        
        // First, get existing workers to avoid duplicate employee numbers
        let existingEmployeeNumbers = new Set();
        try {
            const existingWorkers = await dataFunctions.getWorkers();
            if (existingWorkers && Array.isArray(existingWorkers)) {
                existingWorkers.forEach(w => {
                    if (w.employee_number) {
                        existingEmployeeNumbers.add(w.employee_number);
                    }
                });
            }
        } catch (error) {
            console.warn('   ⚠ Could not fetch existing workers, continuing...');
        }
        
        const firstNames = ['John', 'Sarah', 'Michael', 'Emily', 'David', 'Lisa', 'James', 'Anna', 'Robert', 'Maria'];
        const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
        const idPrefixes = ['900101', '890215', '880330', '910425', '920530', '930615', '940720', '950825'];
        
        let employeeCounter = existingEmployeeNumbers.size + 1;
        
        for (let i = 0; i < 30; i++) {
            const firstName = firstNames[i % firstNames.length];
            const lastName = lastNames[Math.floor(i / firstNames.length)];
            const idPrefix = idPrefixes[i % idPrefixes.length];
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
                    phone_number: `+27${Math.floor(Math.random() * 9000000000) + 1000000000}`,
                    is_active: true,
                    employment_type: i % 3 === 0 ? 'permanent' : (i % 3 === 1 ? 'seasonal' : 'contract')
                });
                
                if (result && result.id) {
                    this.createdIds.workers.push(result.id);
                    if (i < 5) console.log(`   ✓ Created: ${firstName} ${lastName} (${employeeNumber})`);
                }
            } catch (error) {
                console.error(`   ✗ Error creating worker:`, error.message);
            }
        }
        
        console.log(`   ✓ Created ${this.createdIds.workers.length} workers`);
    },

    /**
     * Generate Chemicals
     */
    async generateChemicals() {
        console.log('🧪 Generating chemicals...');
        
        const chemicals = [
            {
                name: 'Captan 80 WP',
                active_ingredient: 'Captan',
                registration_number: 'L1234',
                phi_days: 7,
                quantity_on_hand: 150,
                unit: 'kg',
                expiry_date: new Date(2026, 5, 15).toISOString().split('T')[0]
            },
            {
                name: 'Mancozeb 75 WG',
                active_ingredient: 'Mancozeb',
                registration_number: 'L2345',
                phi_days: 21,
                quantity_on_hand: 200,
                unit: 'kg',
                expiry_date: new Date(2026, 8, 20).toISOString().split('T')[0]
            },
            {
                name: 'Procymidone 500 SC',
                active_ingredient: 'Procymidone',
                registration_number: 'L3456',
                phi_days: 14,
                quantity_on_hand: 75,
                unit: 'L',
                expiry_date: new Date(2026, 11, 10).toISOString().split('T')[0]
            },
            {
                name: 'Chlorpyrifos 480 EC',
                active_ingredient: 'Chlorpyrifos',
                registration_number: 'L4567',
                phi_days: 28,
                quantity_on_hand: 50,
                unit: 'L',
                expiry_date: new Date(2026, 2, 5).toISOString().split('T')[0]
            },
            {
                name: 'Fenarimol 120 SC',
                active_ingredient: 'Fenarimol',
                registration_number: 'L5678',
                phi_days: 7,
                quantity_on_hand: 100,
                unit: 'L',
                expiry_date: new Date(2027, 0, 15).toISOString().split('T')[0]
            }
        ];

        for (const chemical of chemicals) {
            for (const farmId of this.createdIds.farms.slice(0, 2)) {
                try {
                    const result = await dataFunctions.createChemical({
                        farm_id: farmId,
                        name: chemical.name,
                        active_ingredient: chemical.active_ingredient,
                        registration_number: chemical.registration_number,
                        phi_days: chemical.phi_days,
                        quantity_on_hand: chemical.quantity_on_hand,
                        unit: chemical.unit,
                        expiry_date: chemical.expiry_date
                    });
                    
                    if (result && result.id) {
                        this.createdIds.chemicals.push(result.id);
                        if (this.createdIds.chemicals.length <= 5) {
                            console.log(`   ✓ Created: ${chemical.name} for farm`);
                        }
                    }
                } catch (error) {
                    console.error(`   ✗ Error creating chemical:`, error.message);
                }
            }
        }
    },

    /**
     * Generate Spray Applications
     */
    async generateSprayApplications() {
        console.log('💨 Generating spray applications...');
        
        // Get chemicals first
        const chemicals = await dataFunctions.getChemicals();
        if (!chemicals || chemicals.length === 0) {
            console.log('   ⚠ No chemicals available, skipping applications');
            return;
        }

        for (let i = 0; i < 15; i++) {
            const farmId = this.createdIds.farms[i % this.createdIds.farms.length];
            const block = this.createdIds.blocks.find(b => b.farm_id === farmId);
            const chemical = chemicals[i % chemicals.length];
            
            if (!block || !chemical) continue;
            
            const applicationDate = new Date();
            applicationDate.setDate(applicationDate.getDate() - Math.floor(Math.random() * 30));
            
            try {
                const result = await dataFunctions.createSprayApplication({
                    farm_id: farmId,
                    chemical_id: chemical.id,
                    application_date: applicationDate.toISOString().split('T')[0],
                    block_id: block.id,
                    quantity_used: 10 + Math.random() * 20,
                    area_treated: 5 + Math.random() * 10
                });
                
                if (result && result.id && i < 3) {
                    console.log(`   ✓ Created application for ${chemical.name}`);
                }
            } catch (error) {
                console.error(`   ✗ Error creating application:`, error.message);
            }
        }
    },

    /**
     * Generate Fruit Measurements
     */
    async generateFruitMeasurements() {
        console.log('📏 Generating fruit measurements...');
        
        for (let i = 0; i < 20; i++) {
            const farmId = this.createdIds.farms[i % this.createdIds.farms.length];
            const block = this.createdIds.blocks.find(b => b.farm_id === farmId);
            
            if (!block) continue;
            
            const measurementDate = new Date();
            measurementDate.setDate(measurementDate.getDate() - Math.floor(Math.random() * 60));
            
            try {
                const result = await dataFunctions.createFruitMeasurement({
                    farm_id: farmId,
                    measurement_date: measurementDate.toISOString().split('T')[0],
                    block_id: block.id,
                    days_after_full_bloom: 30 + Math.floor(Math.random() * 90),
                    sample_size: 50 + Math.floor(Math.random() * 50),
                    circumference_avg: 15 + Math.random() * 5,
                    weight_avg: 150 + Math.random() * 50
                });
                
                if (result && result.id && i < 3) {
                    console.log(`   ✓ Created measurement`);
                }
            } catch (error) {
                console.error(`   ✗ Error creating measurement:`, error.message);
            }
        }
    },

    /**
     * Generate Vehicles
     */
    async generateVehicles() {
        console.log('🚗 Generating vehicles...');
        
        const vehicles = [
            { make: 'Toyota', model: 'Hilux', year: 2020, type: 'pickup', fuel: 'diesel' },
            { make: 'Isuzu', model: 'KB', year: 2019, type: 'pickup', fuel: 'diesel' },
            { make: 'Ford', model: 'Ranger', year: 2021, type: 'pickup', fuel: 'diesel' },
            { make: 'Toyota', model: 'Land Cruiser', year: 2018, type: 'SUV', fuel: 'diesel' },
            { make: 'Nissan', model: 'NP200', year: 2020, type: 'van', fuel: 'petrol' }
        ];

        for (const vehicle of vehicles) {
            for (const farmId of this.createdIds.farms.slice(0, 3)) {
                try {
                    const regNumber = `CA${String(Math.floor(Math.random() * 90000) + 10000)}GP`;
                    const result = await dataFunctions.createVehicle({
                        farm_id: farmId,
                        registration_number: regNumber,
                        make: vehicle.make,
                        model: vehicle.model,
                        year: vehicle.year,
                        vehicle_type: vehicle.type,
                        fuel_type: vehicle.fuel,
                        current_odometer: 50000 + Math.floor(Math.random() * 100000)
                    });
                    
                    if (result && result.id) {
                        this.createdIds.vehicles.push(result.id);
                        if (this.createdIds.vehicles.length <= 5) {
                            console.log(`   ✓ Created: ${vehicle.make} ${vehicle.model} (${regNumber})`);
                        }
                    }
                } catch (error) {
                    console.error(`   ✗ Error creating vehicle:`, error.message);
                }
            }
        }
    },

    /**
     * Generate Fuel Transactions
     */
    async generateFuelTransactions() {
        console.log('⛽ Generating fuel transactions...');
        
        const vehicles = await dataFunctions.getVehicles();
        if (!vehicles || vehicles.length === 0) {
            console.log('   ⚠ No vehicles available, skipping transactions');
            return;
        }

        for (let i = 0; i < 25; i++) {
            const vehicle = vehicles[i % vehicles.length];
            const transactionDate = new Date();
            transactionDate.setDate(transactionDate.getDate() - Math.floor(Math.random() * 30));
            
            try {
                const result = await dataFunctions.createFuelTransaction({
                    vehicle_id: vehicle.id,
                    farm_id: vehicle.farm_id,
                    transaction_date: transactionDate.toISOString().split('T')[0],
                    litres: 30 + Math.random() * 70,
                    cost: (30 + Math.random() * 70) * (18 + Math.random() * 2),
                    price_per_litre: 18 + Math.random() * 2,
                    odometer_reading: vehicle.current_odometer + Math.floor(Math.random() * 5000)
                });
                
                if (result && result.id && i < 3) {
                    console.log(`   ✓ Created fuel transaction`);
                }
            } catch (error) {
                console.error(`   ✗ Error creating transaction:`, error.message);
            }
        }
    },

    /**
     * Generate Pump Readings
     */
    async generatePumpReadings() {
        console.log('💧 Generating pump readings...');
        
        const pumpLocations = ['Main Pump House', 'Irrigation Block A', 'Irrigation Block B', 'Reservoir Pump'];
        
        for (const farmId of this.createdIds.farms.slice(0, 3)) {
            let previousReading = 10000 + Math.floor(Math.random() * 50000);
            
            for (let i = 0; i < 30; i++) {
                const readingDate = new Date();
                readingDate.setDate(readingDate.getDate() - (30 - i));
                const currentReading = previousReading + 50 + Math.floor(Math.random() * 200);
                const usage = currentReading - previousReading;
                
                try {
                    const result = await dataFunctions.createPumpReading({
                        farm_id: farmId,
                        pump_location: pumpLocations[i % pumpLocations.length],
                        reading_date: readingDate.toISOString().split('T')[0],
                        meter_reading: currentReading,
                        previous_reading: previousReading,
                        usage_m3: usage
                    });
                    
                    previousReading = currentReading;
                    if (result && result.id && i === 0) {
                        console.log(`   ✓ Created reading for farm`);
                    }
                } catch (error) {
                    console.error(`   ✗ Error creating reading:`, error.message);
                }
            }
        }
    },

    /**
     * Generate Consignments
     */
    async generateConsignments() {
        console.log('📦 Generating consignments...');
        
        for (let i = 0; i < 15; i++) {
            const farmId = this.createdIds.farms[i % this.createdIds.farms.length];
            const block = this.createdIds.blocks.find(b => b.farm_id === farmId);
            
            if (!block) continue;
            
            const harvestDate = new Date();
            harvestDate.setDate(harvestDate.getDate() - Math.floor(Math.random() * 90));
            const packDate = new Date(harvestDate);
            packDate.setDate(packDate.getDate() + 2 + Math.floor(Math.random() * 5));
            
            try {
                const consignmentNumber = `CONS-${new Date().getFullYear()}-${String(i + 1).padStart(4, '0')}`;
                const result = await dataFunctions.createConsignment({
                    farm_id: farmId,
                    consignment_number: consignmentNumber,
                    harvest_date: harvestDate.toISOString().split('T')[0],
                    block_id: block.id,
                    pack_date: packDate.toISOString().split('T')[0],
                    total_pallets: 20 + Math.floor(Math.random() * 80),
                    total_cartons: 400 + Math.floor(Math.random() * 1600),
                    market_destination: ['UK', 'EU', 'Local', 'Middle East'][i % 4]
                });
                
                if (result && result.id) {
                    this.createdIds.consignments.push(result.id);
                    if (i < 3) {
                        console.log(`   ✓ Created: ${consignmentNumber}`);
                    }
                }
            } catch (error) {
                console.error(`   ✗ Error creating consignment:`, error.message);
            }
        }
    },

    /**
     * Generate Compliance Documents
     */
    async generateComplianceDocuments() {
        console.log('📋 Generating compliance documents...');
        
        const documentTypes = [
            'Global GAP Certificate',
            'HACCP Plan',
            'Food Safety Policy',
            'Training Record',
            'Audit Report'
        ];
        
        for (const farmId of this.createdIds.farms.slice(0, 3)) {
            for (const docType of documentTypes) {
                try {
                    const result = await dataFunctions.createComplianceDocument({
                        farm_id: farmId,
                        document_type: docType,
                        title: `${docType} - ${new Date().getFullYear()}`,
                        category: 'Certification',
                        status: 'active',
                        expiry_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]
                    });
                    
                    if (result && result.id) {
                        this.createdIds.complianceDocuments.push(result.id);
                        if (this.createdIds.complianceDocuments.length <= 5) {
                            console.log(`   ✓ Created: ${docType}`);
                        }
                    }
                } catch (error) {
                    console.error(`   ✗ Error creating document:`, error.message);
                }
            }
        }
    },

    /**
     * Generate Certificates
     */
    async generateCertificates() {
        console.log('🏆 Generating certificates...');
        
        const certificateTypes = [
            'Global GAP',
            'FSSC 22000',
            'HACCP',
            'Organic Certification',
            'Fair Trade'
        ];
        
        for (const farmId of this.createdIds.farms.slice(0, 3)) {
            for (const certType of certificateTypes) {
                const issuedDate = new Date();
                issuedDate.setFullYear(issuedDate.getFullYear() - 1);
                const expiryDate = new Date(issuedDate);
                expiryDate.setFullYear(expiryDate.getFullYear() + 2);
                
                try {
                    const certNumber = `CERT-${certType.replace(/\s/g, '')}-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)}`;
                    const result = await dataFunctions.createCertificate({
                        farm_id: farmId,
                        certificate_type: certType,
                        certificate_number: certNumber,
                        issued_date: issuedDate.toISOString().split('T')[0],
                        expiry_date: expiryDate.toISOString().split('T')[0],
                        issuing_authority: 'Certification Body SA',
                        status: 'active'
                    });
                    
                    if (result && result.id) {
                        this.createdIds.certificates.push(result.id);
                        if (this.createdIds.certificates.length <= 5) {
                            console.log(`   ✓ Created: ${certType} (${certNumber})`);
                        }
                    }
                } catch (error) {
                    console.error(`   ✗ Error creating certificate:`, error.message);
                }
            }
        }
    },

    /**
     * Generate Worker Allocations
     */
    async generateWorkerAllocations() {
        console.log('📅 Generating worker allocations...');
        
        const workers = await dataFunctions.getWorkers();
        if (!workers || workers.length === 0) {
            console.log('   ⚠ No workers available, skipping allocations');
            return;
        }

        const blocks = await dataFunctions.getBlocks();
        if (!blocks || blocks.length === 0) {
            console.log('   ⚠ No blocks available, skipping allocations');
            return;
        }

        const taskTypes = ['Pruning', 'Mowing', 'Weeding', 'Harvesting', 'Planting', 'Irrigation'];
        
        for (let i = 0; i < 50; i++) {
            const worker = workers[i % workers.length];
            const block = blocks[i % blocks.length];
            const allocationDate = new Date();
            allocationDate.setDate(allocationDate.getDate() - Math.floor(Math.random() * 14));
            
            try {
                const result = await dataFunctions.createWorkerAllocation({
                    worker_id: worker.id,
                    farm_id: block.farm_id,
                    block_id: block.id,
                    allocation_date: allocationDate.toISOString().split('T')[0],
                    task_type: taskTypes[i % taskTypes.length],
                    start_time: '07:00',
                    end_time: '16:00',
                    status: i % 3 === 0 ? 'completed' : (i % 3 === 1 ? 'in_progress' : 'planned')
                });
                
                if (result && result.id && i < 3) {
                    console.log(`   ✓ Created allocation`);
                }
            } catch (error) {
                console.error(`   ✗ Error creating allocation:`, error.message);
            }
        }
    }
};

// Make available globally
window.generateTestData = function() {
    return TestDataGenerator.generateTestData();
};

console.log('✅ Test Data Generator loaded!');
console.log('Run: generateTestData() to create test data');

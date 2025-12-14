var _inspectionForm = (function () {
    let inspectionTemplate = [];
    let editingInspection = null;
    let isViewMode = false;
    let isInitialized = false;
    let driverSignaturePad = null;
    let supervisorSignaturePad = null;
    let drivers = [];

    function init() {
        // Reset if already initialized (allows re-initialization when navigating back)
        if (isInitialized) {
            reset();
        }
        isInitialized = true;
        
        bindEvents();
        initializeSignaturePads();
        autoPopulateDates();
        
        // Show initial loading if we're loading an inspection
        const inspectionId = sessionStorage.getItem('editingInspectionId');
        const viewInspectionId = sessionStorage.getItem('viewInspectionId');
        
        if (inspectionId || viewInspectionId) {
            // Loading will be shown in loadInspectionForEdit/View
            loadInspectionTemplate();
            loadVehiclesForDropdown();
            loadDriversForDropdown();
            checkForInspectionData();
        } else {
            // For new inspections, show a brief loading
            Swal.fire({
                title: 'Loading Form...',
                text: 'Please wait while we prepare the inspection form.',
                allowOutsideClick: false,
                allowEscapeKey: false,
                showConfirmButton: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });
            
            Promise.all([
                loadInspectionTemplate(),
                loadVehiclesForDropdown(),
                loadDriversForDropdown(),
                checkForInspectionData()
            ]).then(() => {
                Swal.close();
            }).catch((error) => {
                Swal.close();
            });
        }
    }

    function bindEvents() {
        // Remove existing handlers to prevent duplicates
        $('#inspectionForm').off('submit');
        $('#cancelBtn, #cancelFormBtn').off('click');
        $('#prepopulateBtn').off('click');
        
        $('#inspectionForm').on('submit', function (e) {
            e.preventDefault();
            if (!isViewMode) {
                saveInspection();
            }
        });

        $('#cancelBtn, #cancelFormBtn').on('click', function () {
            if (typeof _appRouter !== 'undefined' && typeof _appRouter.routeTo === 'function') {
                _appRouter.routeTo('inspections-grid');
            } else {
                window.history.back();
            }
        });

        $('#prepopulateBtn').on('click', function () {
            prepopulateTestData();
        });

        // Clear signature buttons
        $('#clearDriverSignature').off('click').on('click', function () {
            if (driverSignaturePad) {
                driverSignaturePad.clear();
                $('#driverSignature').val('');
            }
        });

        $('#clearSupervisorSignature').off('click').on('click', function () {
            if (supervisorSignaturePad) {
                supervisorSignaturePad.clear();
                $('#supervisorSignature').val('');
            }
        });

        // Clear validation errors when user starts fixing
        $('#inspectionDriverName, #inspectionFleetNumber').on('change', function() {
            $(this).removeClass('is-invalid');
        });

        // Clear validation errors when category items are selected
        $(document).on('change', 'input[type="radio"][name*="_status"]', function() {
            $(this).closest('.inspection-item').removeClass('validation-highlight border-danger border-2 border-warning');
        });
    }

    function initializeSignaturePads() {
        // Wait for canvas elements to be available
        setTimeout(() => {
            const driverCanvas = document.getElementById('driverSignaturePad');
            const supervisorCanvas = document.getElementById('supervisorSignaturePad');

            if (driverCanvas && typeof SignaturePad !== 'undefined') {
                // Clear existing pad if it exists
                if (driverSignaturePad) {
                    driverSignaturePad.clear();
                }
                
                driverSignaturePad = new SignaturePad(driverCanvas, {
                    backgroundColor: 'rgb(255, 255, 255)',
                    penColor: 'rgb(0, 0, 0)',
                    minWidth: 1,
                    maxWidth: 3
                });

                // Update hidden input when signature changes
                driverSignaturePad.addEventListener('endStroke', () => {
                    if (!driverSignaturePad.isEmpty()) {
                        $('#driverSignature').val(driverSignaturePad.toDataURL('image/png'));
                        // Clear validation error when signature is drawn
                        $('#driverSignaturePad').closest('.signature-pad-wrapper').removeClass('validation-highlight border-danger border-2');
                    }
                });
                
                // Clear validation error when user starts drawing
                driverSignaturePad.addEventListener('beginStroke', () => {
                    $('#driverSignaturePad').closest('.signature-pad-wrapper').removeClass('validation-highlight border-danger border-2');
                });

                // Resize canvas to match display size
                resizeCanvas(driverCanvas);
            }

            if (supervisorCanvas && typeof SignaturePad !== 'undefined') {
                // Clear existing pad if it exists
                if (supervisorSignaturePad) {
                    supervisorSignaturePad.clear();
                }
                
                supervisorSignaturePad = new SignaturePad(supervisorCanvas, {
                    backgroundColor: 'rgb(255, 255, 255)',
                    penColor: 'rgb(0, 0, 0)',
                    minWidth: 1,
                    maxWidth: 3
                });

                // Update hidden input when signature changes
                supervisorSignaturePad.addEventListener('endStroke', () => {
                    if (!supervisorSignaturePad.isEmpty()) {
                        $('#supervisorSignature').val(supervisorSignaturePad.toDataURL('image/png'));
                    }
                });

                // Resize canvas to match display size
                resizeCanvas(supervisorCanvas);
            }
        }, 100);
    }

    function resizeCanvas(canvas) {
        const rect = canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        
        const ctx = canvas.getContext('2d');
        ctx.scale(dpr, dpr);
        
        canvas.style.width = rect.width + 'px';
        canvas.style.height = rect.height + 'px';
    }

    function autoPopulateDates() {
        // Set today's date for inspection date and supervisor date
        const today = new Date().toISOString().split('T')[0];
        
        // Only auto-populate if the field is empty (for new inspections)
        if (!$('#inspectionDate').val()) {
            $('#inspectionDate').val(today);
        }
        
        if (!$('#supervisorDate').val()) {
            $('#supervisorDate').val(today);
        }
    }

    function prepopulateTestData() {
        // Set today's date
        const today = new Date().toISOString().split('T')[0];
        const now = new Date();
        const timeString = now.toTimeString().slice(0, 5); // HH:MM format
        
        // Prepopulate header fields
        // Select first driver if available
        const firstDriver = $('#inspectionDriverName option:not(:first)').first();
        if (firstDriver.length) {
            $('#inspectionDriverName').val(firstDriver.val()).trigger('change');
        }
        
        // Select second driver if available
        const secondDriver = $('#inspectionDriverName2 option:not(:first)').first();
        if (secondDriver.length) {
            $('#inspectionDriverName2').val(secondDriver.val());
        }
        
        $('#inspectionDate').val(today);
        
        // Select first vehicle if available
        const firstVehicle = $('#inspectionFleetNumber option:not(:first)').first();
        if (firstVehicle.length) {
            $('#inspectionFleetNumber').val(firstVehicle.val());
        }
        
        // Prepopulate sign-off fields
        $('#driverSignatureName').val('John Doe');
        $('#driverSignature').val('John Doe');
        $('#tripStartTime').val(timeString);
        
        // Set end time 2 hours later
        const endTime = new Date(now.getTime() + 2 * 60 * 60 * 1000);
        $('#tripEndTime').val(endTime.toTimeString().slice(0, 5));
        
        $('#supervisorName').val('Supervisor Name');
        $('#supervisorSignature').val('Supervisor Signature');
        $('#supervisorDate').val(today);
        
        // Prepopulate inspection items - set most to Safe (S)
        setTimeout(() => {
            // Set Category A items to Safe
            $('input[name$="_status"][value="S"]').each(function() {
                const name = $(this).attr('name');
                if (name.includes('item_A_')) {
                    $(this).prop('checked', true);
                }
            });
            
            // Set Category B items to Safe
            $('input[name$="_status"][value="S"]').each(function() {
                const name = $(this).attr('name');
                if (name.includes('item_B_')) {
                    $(this).prop('checked', true);
                }
            });
            
            // Set a few items to Unsafe for testing
            $('input[name$="_status"][value="U"]').each(function() {
                const name = $(this).attr('name');
                // Set one Category A item to Unsafe
                if (name.includes('item_A_1_left_status')) {
                    $(this).prop('checked', true);
                    // Uncheck the Safe option
                    $(`input[name="${name}"][value="S"]`).prop('checked', false);
                }
            });
            
            // Add some notes to Category C
            $('#categoryCItems textarea').val('Test defect notes for Category C items.');
        }, 500);
        
        Swal.fire({
            icon: 'info',
            title: 'Test Data Loaded',
            text: 'Form has been prepopulated with test data.',
            timer: 2000,
            showConfirmButton: false
        });
    }

    function getAuthToken() {
        if (typeof authService !== 'undefined' && authService.token) {
            return authService.token;
        }
        return localStorage.getItem('lambda_token');
    }

    async function checkForInspectionData() {
        // Check if we're editing/viewing an inspection
        const inspectionId = sessionStorage.getItem('editingInspectionId');
        const viewInspectionId = sessionStorage.getItem('viewInspectionId');
        
        if (inspectionId) {
            sessionStorage.removeItem('editingInspectionId');
            await loadInspectionForEdit(inspectionId);
        } else if (viewInspectionId) {
            sessionStorage.removeItem('viewInspectionId');
            await loadInspectionForView(viewInspectionId);
        } else {
            // New inspection
            $('#formTitle').text('New Pre Trip Inspection');
            await renderInspectionItems();
        }
    }

    async function loadInspectionForEdit(inspectionId) {
        // Show loading indicator
        Swal.fire({
            title: 'Loading Inspection...',
            text: 'Please wait while we load the inspection data.',
            allowOutsideClick: false,
            allowEscapeKey: false,
            showConfirmButton: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });
        
        try {
            const token = getAuthToken();
            if (!token) throw new Error('Missing authentication token.');
            
            const inspections = await dataFunctions.getInspections(token);
            const inspection = Array.isArray(inspections) ? inspections.find(i => i.id == inspectionId) : null;
            
            if (inspection) {
                editingInspection = inspection;
                $('#formTitle').text('Edit Pre Trip Inspection');
                await loadVehiclesForDropdown();
                await loadDriversForDropdown();
                await renderInspectionItems();
                
                // Wait a bit for DOM to be ready before populating
                setTimeout(() => {
                    populateForm(inspection);
                    // Re-initialize signature pads after form is populated
                    initializeSignaturePads();
                    
                    // Close loading mask after form is populated
                    Swal.close();
                }, 100);
            } else {
                Swal.close();
                Swal.fire('Error', 'Inspection not found.', 'error');
            }
        } catch (error) {
            Swal.close();
            Swal.fire('Error', 'Failed to load inspection data.', 'error');
        }
    }

    async function loadInspectionForView(inspectionId) {
        // Show loading indicator
        Swal.fire({
            title: 'Loading Inspection...',
            text: 'Please wait while we load the inspection data.',
            allowOutsideClick: false,
            allowEscapeKey: false,
            showConfirmButton: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });
        
        try {
            const token = getAuthToken();
            if (!token) throw new Error('Missing authentication token.');
            
            const inspections = await dataFunctions.getInspections(token);
            const inspection = Array.isArray(inspections) ? inspections.find(i => i.id == inspectionId) : null;
            
            if (inspection) {
                editingInspection = inspection;
                isViewMode = true;
                $('#formTitle').text('View Inspection');
                $('#saveInspectionBtn').hide();
                await loadVehiclesForDropdown();
                await loadDriversForDropdown();
                await renderInspectionItems();
                
                // Wait a bit for DOM to be ready before populating
                setTimeout(() => {
                    populateForm(inspection);
                    // Re-initialize signature pads after form is populated
                    initializeSignaturePads();
                    
                    $('#inspectionForm input, #inspectionForm select, #inspectionForm textarea').prop('disabled', true);
                    
                    // Disable signature pads in view mode by making canvas read-only
                    setTimeout(() => {
                        if (driverSignaturePad) {
                            driverSignaturePad.readOnly = true;
                        }
                        if (supervisorSignaturePad) {
                            supervisorSignaturePad.readOnly = true;
                        }
                        
                        // Close loading mask after everything is set up
                        Swal.close();
                    }, 300);
                    
                    // Hide clear buttons in view mode
                    $('#clearDriverSignature, #clearSupervisorSignature').hide();
                }, 100);
            } else {
                Swal.close();
                Swal.fire('Error', 'Inspection not found.', 'error');
            }
        } catch (error) {
            Swal.close();
            Swal.fire('Error', 'Failed to load inspection data.', 'error');
        }
    }

    async function loadInspectionTemplate() {
        try {
            const token = getAuthToken();
            if (!token) return;
            
            const response = await dataFunctions.getInspectionTemplate(token);
            inspectionTemplate = Array.isArray(response) ? response : [];
            
            if (!inspectionTemplate.length) {
                inspectionTemplate = getDefaultTemplate();
            }
        } catch (error) {
            inspectionTemplate = getDefaultTemplate();
        }
    }

    function getDefaultTemplate() {
        return [
            // Category A - Left
            { category: 'A', section_name: 'Brakes', item_name: 'Brakes (Service, park/emergency)', item_order: 1, column_position: 'left', special_instructions: 'If nothing else is unsafe for use, then vehicle may be driven to test the brakes. If brakes now fail, then vehicle is not allowed to be used any further.' },
            { category: 'A', section_name: 'Safety Equipment', item_name: 'Safety Belts - In Order', item_order: 2, column_position: 'left' },
            { category: 'A', section_name: 'Safety Equipment', item_name: 'Main Hooter - working', item_order: 3, column_position: 'left' },
            { category: 'A', section_name: 'Safety Switches', item_name: 'Safety Switches - Ensure all safety switches operational, Emergency switch, Isolator', item_order: 4, column_position: 'left' },
            { category: 'A', section_name: 'Steering', item_name: 'Check Steering for correct operation and excessive play', item_order: 5, column_position: 'left' },
            { category: 'A', section_name: 'Lights', item_name: 'Ensure Head lights, Rear lights, Brake lights, Reverse lights and Indicator lights are working and lenses are clean', item_order: 6, column_position: 'left' },
            { category: 'A', section_name: 'Wheels', item_name: 'Wheel nuts - not missing and tights (checkpoints)', item_order: 7, column_position: 'left', special_instructions: 'If more than 1 wheel nut is missing to be treated as a "NO GO"' },
            // Category A - Right
            { category: 'A', section_name: 'Fire Safety', item_name: 'Automatic Fire Suppression System - Service and Inspection valid - Gauge in green', item_order: 8, column_position: 'right' },
            { category: 'A', section_name: 'Safety Equipment', item_name: 'Hazard Triangles (x3) - Available', item_order: 9, column_position: 'right' },
            { category: 'A', section_name: 'Communication', item_name: 'Two-Way Radio - working', item_order: 10, column_position: 'right' },
            { category: 'A', section_name: 'Documentation', item_name: 'Valid driver authorisation card in possession of the operator at all times', item_order: 11, column_position: 'right' },
            { category: 'A', section_name: 'Fire Safety', item_name: 'Hand Held Fire Extinguisher - available and in order - Service and Inspection valid - Gauge in green', item_order: 12, column_position: 'right' },
            { category: 'A', section_name: 'Safety Equipment', item_name: 'Reverse Hooter - working', item_order: 13, column_position: 'right' },
            { category: 'A', section_name: 'Safety Equipment', item_name: 'Stop Blocks (x2) - available', item_order: 14, column_position: 'right' },
            // Category B - Left
            { category: 'B', section_name: 'Vehicle Identification', item_name: 'Reflective tape and vehicle identification (white, orange, red, fleet number)', item_order: 1, column_position: 'left' },
            { category: 'B', section_name: 'Controls', item_name: 'Gauges and Switches - operational', item_order: 2, column_position: 'left' },
            { category: 'B', section_name: 'Controls', item_name: 'Pedals unobstructed and pedestals rubber are in place', item_order: 3, column_position: 'left' },
            { category: 'B', section_name: 'Engine', item_name: 'Engine covers and guards in place and secured', item_order: 4, column_position: 'left' },
            { category: 'B', section_name: 'Documentation', item_name: 'Vehicle Legal Fitness - Licence disk, permits, and emergency procedures valid and inside permit bag', item_order: 5, column_position: 'left' },
            { category: 'B', section_name: 'Engine', item_name: 'Smoke emissions - Check if bus/vehicle is smoking', item_order: 6, column_position: 'left' },
            { category: 'B', section_name: 'Tyres', item_name: 'Tyre condition - in good condition (Incl. Spare)', item_order: 7, column_position: 'left' },
            { category: 'B', section_name: 'Tyres', item_name: 'Tyre Pressure - sufficient (Incl. Spare)', item_order: 8, column_position: 'left' },
            { category: 'B', section_name: 'Engine', item_name: 'Oil leaks or water leaks - Engine oil level correct released for normal operations', item_order: 9, column_position: 'left', special_instructions: 'If oil/water leak is excessive, oil leaks to hot surfaces/items that gets hot when bus/vehicle operates or in doubt treat as a "NO GO"' },
            { category: 'B', section_name: 'Fuel', item_name: 'Fuel - Fuel level correct, no visible fuel leaks', item_order: 10, column_position: 'left' },
            // Category B - Right
            { category: 'B', section_name: 'Visibility', item_name: 'Wipers - working', item_order: 11, column_position: 'right' },
            { category: 'B', section_name: 'Visibility', item_name: 'Windscreen - safe for use', item_order: 12, column_position: 'right' },
            { category: 'B', section_name: 'Comfort', item_name: 'Air-Conditioner - working', item_order: 13, column_position: 'right' },
            { category: 'B', section_name: 'Visibility', item_name: 'Mirrors - in order', item_order: 14, column_position: 'right' },
            { category: 'B', section_name: 'Body Condition', item_name: 'Body Damage - Exterior', item_order: 15, column_position: 'right', special_instructions: 'TO BE REPORTED TO CONTROL ROOM BEFORE STARTING TRIP' },
            { category: 'B', section_name: 'Safety Equipment', item_name: 'First Aid Equipment - available, sealed and in order Stretcher for buses - fitted and not damaged', item_order: 16, column_position: 'right' },
            { category: 'B', section_name: 'Cleanliness', item_name: 'Ensure vehicle is clean and ensure debris are washed away daily', item_order: 17, column_position: 'right' },
            { category: 'B', section_name: 'Doors', item_name: 'Ensure that ALL DOORS close properly and door hinges are not damaged - All doors incl. compartments, bonnet, boot and side boot doors', item_order: 18, column_position: 'right' },
            { category: 'B', section_name: 'Interior', item_name: 'General Condition - Interior (seats and cleanliness)', item_order: 19, column_position: 'right' },
            // Category C
            { category: 'C', section_name: 'Other Defects', item_name: 'Any defect that is not mentioned above', item_order: 1, column_position: 'left' }
        ];
    }

    async function loadDriversForDropdown() {
        try {
            const token = getAuthToken();
            if (!token) return;
            
            const driversData = await dataFunctions.getDrivers(token);
            drivers = Array.isArray(driversData) ? driversData : [];
            
            const driver1Dropdown = $('#inspectionDriverName');
            const driver2Dropdown = $('#inspectionDriverName2');
            
            // Clear and populate driver 1 dropdown
            driver1Dropdown.empty();
            driver1Dropdown.append('<option value="">Select Driver</option>');
            
            // Clear and populate driver 2 dropdown
            driver2Dropdown.empty();
            driver2Dropdown.append('<option value="">Select Driver (Optional)</option>');
            
            drivers.forEach(driver => {
                const displayText = `${driver.full_name}${driver.employee_id ? ` (${driver.employee_id})` : ''}`;
                const option = `<option value="${driver.id}" data-driver-name="${driver.full_name}" data-contact-number="${driver.contact_number || ''}">${displayText}</option>`;
                driver1Dropdown.append(option);
                driver2Dropdown.append(option);
            });
            
            // Add change handlers to auto-populate driver signature name
            driver1Dropdown.off('change').on('change', function() {
                const selectedOption = $(this).find('option:selected');
                const driverName = selectedOption.data('driver-name') || '';
                $('#driverSignatureName').val(driverName);
            });
            
            driver2Dropdown.off('change').on('change', function() {
                // Driver 2 doesn't affect signature name
            });
        } catch (error) {
            // Silently fail
        }
    }

    async function loadVehiclesForDropdown() {
        try {
            const token = getAuthToken();
            if (!token) return;
            
            const vehicles = await dataFunctions.getVehicles(token);
            const vehiclesArray = Array.isArray(vehicles) ? vehicles : [];
            
            const dropdown = $('#inspectionFleetNumber');
            dropdown.empty();
            dropdown.append('<option value="">Select Fleet Number</option>');
            
            vehiclesArray.forEach(vehicle => {
                const displayText = vehicle.fleet_number ? `${vehicle.fleet_number} - ${vehicle.vehicle_code}` : vehicle.vehicle_code;
                dropdown.append(`<option value="${vehicle.fleet_number || vehicle.vehicle_code}" data-vehicle-id="${vehicle.id}">${displayText}</option>`);
            });
            
            // If editing, set the selected value
            if (editingInspection && editingInspection.fleet_number) {
                dropdown.val(editingInspection.fleet_number);
            }
        } catch (error) {
            // Silently fail
        }
    }

    async function renderInspectionItems() {
        if (!inspectionTemplate.length) {
            await loadInspectionTemplate();
        }

        // Clear existing items
        $('#categoryALeftItems, #categoryARightItems, #categoryBLeftItems, #categoryBRightItems, #categoryCItems').empty();

        // Group items by category and column
        const categoryA = inspectionTemplate.filter(item => item.category === 'A');
        const categoryB = inspectionTemplate.filter(item => item.category === 'B');
        const categoryC = inspectionTemplate.filter(item => item.category === 'C');

        // Render Category A
        categoryA.forEach(item => {
            const container = item.column_position === 'left' ? $('#categoryALeftItems') : $('#categoryARightItems');
            container.append(renderInspectionItem(item));
        });

        // Render Category B
        categoryB.forEach(item => {
            const container = item.column_position === 'left' ? $('#categoryBLeftItems') : $('#categoryBRightItems');
            container.append(renderInspectionItem(item));
        });

        // Render Category C
        categoryC.forEach(item => {
            $('#categoryCItems').append(renderInspectionItem(item, true));
        });
    }

    function renderInspectionItem(item, isCategoryC = false) {
        const itemId = `item_${item.category}_${item.item_order}_${item.column_position || 'single'}`;
        const safeId = itemId.replace(/[^a-zA-Z0-9_]/g, '_');
        
        let html = `<div class="inspection-item mb-3 p-2 border rounded ${item.category === 'A' ? 'border-danger' : item.category === 'B' ? 'border-warning' : 'border-success'}">`;
        
        if (isCategoryC) {
            html += `
                <label class="form-label fw-bold">${item.item_name}</label>
                <textarea class="form-control" id="${safeId}_notes" rows="4" placeholder="Enter any defects not mentioned above..."></textarea>
            `;
        } else {
            // Use red for Category A special instructions, yellow/warning for others
            const instructionColorClass = item.category === 'A' ? 'text-danger' : 'text-warning';
            html += `
                <div class="d-flex justify-content-between align-items-start mb-2">
                    <label class="form-label mb-0 fw-semibold">${item.item_name}</label>
                </div>
                ${item.special_instructions ? `<small class="${instructionColorClass} d-block mb-2"><i class="fas fa-exclamation-triangle"></i> ${item.special_instructions}</small>` : ''}
                <div class="btn-group" role="group" data-item-id="${safeId}">
                    <input type="radio" class="btn-check" name="${safeId}_status" id="${safeId}_S" value="S" autocomplete="off">
                    <label class="btn btn-outline-success btn-sm" for="${safeId}_S">S</label>
                    
                    <input type="radio" class="btn-check" name="${safeId}_status" id="${safeId}_U" value="U" autocomplete="off">
                    <label class="btn btn-outline-danger btn-sm" for="${safeId}_U">U</label>
                    
                    <input type="radio" class="btn-check" name="${safeId}_status" id="${safeId}_NA" value="N/A" autocomplete="off">
                    <label class="btn btn-outline-secondary btn-sm" for="${safeId}_NA">N/A</label>
                </div>
                <input type="hidden" class="inspection-item-data" 
                    data-category="${item.category}"
                    data-section="${item.section_name}"
                    data-item-name="${item.item_name}"
                    data-item-order="${item.item_order}">
            `;
        }
        
        html += `</div>`;
        return html;
    }

    function populateForm(inspection) {
        // Populate header fields
        // Set driver dropdowns by driver_id if available, otherwise try to match by name
        if (inspection.driver_id) {
            // Try exact match first (handle both string and UUID types)
            const driverIdStr = String(inspection.driver_id);
            const optionExists = $('#inspectionDriverName option[value="' + driverIdStr + '"]').length > 0;
            
            if (optionExists) {
                $('#inspectionDriverName').val(driverIdStr);
            } else {
                // If exact match fails, try to find by name
                if (inspection.driver_name) {
                    const driver1 = drivers.find(d => String(d.id) === driverIdStr || d.full_name === inspection.driver_name);
                    if (driver1) {
                        $('#inspectionDriverName').val(String(driver1.id));
                    }
                }
            }
        } else if (inspection.driver_name) {
            // Try to find driver by name
            const driver1 = drivers.find(d => d.full_name === inspection.driver_name);
            if (driver1) {
                $('#inspectionDriverName').val(String(driver1.id));
            }
        }
        
        if (inspection.driver_id_2) {
            // Try exact match first (handle both string and UUID types)
            const driverId2Str = String(inspection.driver_id_2);
            const option2Exists = $('#inspectionDriverName2 option[value="' + driverId2Str + '"]').length > 0;
            
            if (option2Exists) {
                $('#inspectionDriverName2').val(driverId2Str);
            } else {
                // If exact match fails, try to find by name
                if (inspection.driver_name_2) {
                    const driver2 = drivers.find(d => String(d.id) === driverId2Str || d.full_name === inspection.driver_name_2);
                    if (driver2) {
                        $('#inspectionDriverName2').val(String(driver2.id));
                    }
                }
            }
        } else if (inspection.driver_name_2) {
            // Try to find driver by name
            const driver2 = drivers.find(d => d.full_name === inspection.driver_name_2);
            if (driver2) {
                $('#inspectionDriverName2').val(String(driver2.id));
            }
        }
        
        // Trigger change to update signature name
        $('#inspectionDriverName').trigger('change');
        
        $('#inspectionFleetNumber').val(inspection.fleet_number || '');
        $('#inspectionDate').val(inspection.inspection_date ? inspection.inspection_date.substring(0, 10) : '');
        
        // Populate sign-off fields
        $('#driverSignatureName').val(inspection.driver_signature_name || '');
        $('#tripStartTime').val(inspection.trip_start_time || '');
        $('#tripEndTime').val(inspection.trip_end_time || '');
        $('#supervisorName').val(inspection.supervisor_name || '');
        $('#supervisorDate').val(inspection.supervisor_date ? inspection.supervisor_date.substring(0, 10) : '');
        
        // Load signatures into signature pads if they exist
        if (inspection.driver_signature) {
            $('#driverSignature').val(inspection.driver_signature);
            // Check if it's a base64 image data URL
            if (inspection.driver_signature.startsWith('data:image')) {
                setTimeout(() => {
                    if (driverSignaturePad) {
                        driverSignaturePad.fromDataURL(inspection.driver_signature);
                    }
                }, 200);
            }
        }
        
        if (inspection.supervisor_signature) {
            $('#supervisorSignature').val(inspection.supervisor_signature);
            // Check if it's a base64 image data URL
            if (inspection.supervisor_signature.startsWith('data:image')) {
                setTimeout(() => {
                    if (supervisorSignaturePad) {
                        supervisorSignaturePad.fromDataURL(inspection.supervisor_signature);
                    }
                }, 200);
            }
        }

        // Populate inspection items
        if (inspection.sections && Array.isArray(inspection.sections)) {
            inspection.sections.forEach(section => {
                // Parse items if it's a string (JSONB from database)
                let items = section.items;
                if (typeof items === 'string') {
                    try {
                        items = JSON.parse(items);
                    } catch (e) {
                        items = [];
                    }
                }
                
                // New structure: section has items array
                if (items && Array.isArray(items) && items.length > 0) {
                    items.forEach(item => {
                        // Find matching template item
                        const templateItem = inspectionTemplate.find(t => 
                            t.category === section.category && 
                            t.item_name === item.item_name
                        );
                        
                        if (templateItem) {
                            const itemId = `item_${section.category}_${item.item_order}_${templateItem.column_position || 'single'}`;
                            const safeId = itemId.replace(/[^a-zA-Z0-9_]/g, '_');
                            
                            // Set status radio button
                            if (item.status) {
                                const statusValue = item.status === 'N/A' || item.status === 'NA' ? 'NA' : item.status;
                                const radioButton = $(`#${safeId}_${statusValue}`);
                                if (radioButton.length) {
                                    radioButton.prop('checked', true);
                                    // Trigger change event to update button styling
                                    radioButton.trigger('change');
                                }
                            }
                            
                            // Set notes if available
                            if (item.notes) {
                                const notesField = $(`#${safeId}_notes`);
                                if (notesField.length) {
                                    notesField.val(item.notes);
                                }
                            }
                        } else {
                            if (section.category === 'C' && item.notes) {
                                // Category C items
                                $('#categoryCItems textarea').val(item.notes);
                            }
                        }
                    });
                } else {
                    // Old structure: each section is an item (backward compatibility)
                    const templateItem = inspectionTemplate.find(t => 
                        t.category === section.category && 
                        t.item_name === section.item_name
                    );
                    
                    if (templateItem) {
                        const itemId = `item_${section.category}_${section.item_order}_${templateItem.column_position || 'single'}`;
                        const safeId = itemId.replace(/[^a-zA-Z0-9_]/g, '_');
                        
                        if (section.status) {
                            const statusValue = section.status === 'N/A' || section.status === 'NA' ? 'NA' : section.status;
                            const radioButton = $(`#${safeId}_${statusValue}`);
                            if (radioButton.length) {
                                radioButton.prop('checked', true);
                                radioButton.trigger('change');
                            }
                        }
                        
                        if (section.notes) {
                            const notesField = $(`#${safeId}_notes`);
                            if (notesField.length) {
                                notesField.val(section.notes);
                            }
                        }
                    } else if (section.category === 'C') {
                        $('#categoryCItems textarea').val(section.notes || '');
                    }
                }
            });
        }
    }

    function validateInspectionForm() {
        const errors = [];
        const missingFields = [];

        // Clear previous validation highlights
        $('.is-invalid').removeClass('is-invalid');
        $('.validation-highlight').removeClass('validation-highlight');

        // 1. Validate Driver Name (Driver 1) - dropdown selection
        const driver1Id = $('#inspectionDriverName').val();
        if (!driver1Id) {
            errors.push('Driver Name (Driver 1) is required');
            $('#inspectionDriverName').addClass('is-invalid');
            missingFields.push('Driver Name');
        }

        // 2. Validate Fleet Number - dropdown selection
        const fleetNumber = $('#inspectionFleetNumber').val();
        if (!fleetNumber) {
            errors.push('Fleet Number is required');
            $('#inspectionFleetNumber').addClass('is-invalid');
            missingFields.push('Fleet Number');
        }

        // 3. Validate Driver Signature
        let hasDriverSignature = false;
        if (driverSignaturePad && !driverSignaturePad.isEmpty()) {
            hasDriverSignature = true;
        } else {
            const hiddenSignature = $('#driverSignature').val().trim();
            if (hiddenSignature) {
                hasDriverSignature = true;
            }
        }
        if (!hasDriverSignature) {
            errors.push('Driver Signature is required');
            $('#driverSignaturePad').closest('.signature-pad-wrapper').addClass('validation-highlight border-danger border-2');
            missingFields.push('Driver Signature');
        }

        // 4. Validate Category A items - ALL must have a status selected
        const categoryAItems = inspectionTemplate.filter(item => item.category === 'A');
        const categoryAErrors = [];
        categoryAItems.forEach(item => {
            const itemId = `item_${item.category}_${item.item_order}_${item.column_position || 'single'}`;
            const safeId = itemId.replace(/[^a-zA-Z0-9_]/g, '_');
            const status = $(`input[name="${safeId}_status"]:checked`).val();
            if (!status) {
                categoryAErrors.push(item.item_name);
                // Highlight the missing item
                $(`input[name="${safeId}_status"]`).closest('.inspection-item').addClass('validation-highlight border-danger border-2');
            }
        });
        if (categoryAErrors.length > 0) {
            errors.push(`Category A: ${categoryAErrors.length} item(s) missing status selection`);
            missingFields.push(`Category A (${categoryAErrors.length} items)`);
        }

        // 5. Validate Category B items - ALL must have a status selected
        const categoryBItems = inspectionTemplate.filter(item => item.category === 'B');
        const categoryBErrors = [];
        categoryBItems.forEach(item => {
            const itemId = `item_${item.category}_${item.item_order}_${item.column_position || 'single'}`;
            const safeId = itemId.replace(/[^a-zA-Z0-9_]/g, '_');
            const status = $(`input[name="${safeId}_status"]:checked`).val();
            if (!status) {
                categoryBErrors.push(item.item_name);
                // Highlight the missing item
                $(`input[name="${safeId}_status"]`).closest('.inspection-item').addClass('validation-highlight border-warning border-2');
            }
        });
        if (categoryBErrors.length > 0) {
            errors.push(`Category B: ${categoryBErrors.length} item(s) missing status selection`);
            missingFields.push(`Category B (${categoryBErrors.length} items)`);
        }

        return { errors, missingFields };
    }

    async function saveInspection() {
        let inspectionData = null;
        try {
            // Validate form before proceeding
            const validationResult = validateInspectionForm();
            if (validationResult.errors.length > 0) {
                // Scroll to first error
                const firstError = $('.is-invalid, .validation-highlight').first();
                if (firstError.length) {
                    $('html, body').animate({
                        scrollTop: firstError.offset().top - 100
                    }, 500);
                }

                Swal.fire({
                    icon: 'warning',
                    title: 'Validation Error',
                    html: '<strong>Please complete the following required fields:</strong><br><br>' + 
                          validationResult.errors.map(err => `• ${err}`).join('<br>') +
                          '<br><br><small class="text-muted">Highlighted fields need to be completed.</small>',
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#dc3545',
                    width: '600px'
                });
                return;
            }

            const fleetNumber = $('#inspectionFleetNumber').val();
            const selectedOption = $('#inspectionFleetNumber option:selected');
            const vehicleId = selectedOption.data('vehicle-id') || null;

            // Capture signatures from pads
            let driverSignatureData = null;
            let supervisorSignatureData = null;
            
            if (driverSignaturePad && !driverSignaturePad.isEmpty()) {
                driverSignatureData = driverSignaturePad.toDataURL('image/png');
            } else {
                // Fallback to hidden input if pad not available
                driverSignatureData = $('#driverSignature').val().trim() || null;
            }
            
            if (supervisorSignaturePad && !supervisorSignaturePad.isEmpty()) {
                supervisorSignatureData = supervisorSignaturePad.toDataURL('image/png');
            } else {
                // Fallback to hidden input if pad not available
                supervisorSignatureData = $('#supervisorSignature').val().trim() || null;
            }

            // Get selected driver IDs and names
            const driver1Id = $('#inspectionDriverName').val();
            const driver2Id = $('#inspectionDriverName2').val();
            
            const driver1Option = $('#inspectionDriverName option:selected');
            const driver2Option = $('#inspectionDriverName2 option:selected');
            
            const driver1Name = driver1Option.data('driver-name') || driver1Option.text() || '';
            const driver2Name = driver2Option.data('driver-name') || driver2Option.text() || '';
            
            const driver1Contact = driver1Option.data('contact-number') || null;
            const driver2Contact = driver2Option.data('contact-number') || null;

            inspectionData = {
                driver_name: driver1Name,
                driver_co_nr: driver1Contact,
                driver_id: driver1Id || null,
                driver_name_2: driver2Name || null,
                driver_co_nr_2: driver2Contact || null,
                driver_id_2: driver2Id || null,
                fleet_number: fleetNumber || null,
                inspection_date: $('#inspectionDate').val(),
                vehicle_id: vehicleId,
                driver_signature_name: $('#driverSignatureName').val().trim() || null,
                driver_signature: driverSignatureData,
                trip_start_time: $('#tripStartTime').val() || null,
                trip_end_time: $('#tripEndTime').val() || null,
                supervisor_name: $('#supervisorName').val().trim() || null,
                supervisor_signature: supervisorSignatureData,
                supervisor_date: $('#supervisorDate').val() || null
            };

            if (!inspectionData.driver_name || !inspectionData.inspection_date) {
                Swal.fire('Missing info', 'Driver name and date are required.', 'warning');
                return;
            }

            const sections = [];
            
            inspectionTemplate.forEach(templateItem => {
                if (templateItem.category === 'C') return;
                
                const itemId = `item_${templateItem.category}_${templateItem.item_order}_${templateItem.column_position || 'single'}`;
                const safeId = itemId.replace(/[^a-zA-Z0-9_]/g, '_');
                
                const status = $(`input[name="${safeId}_status"]:checked`).val();
                
                sections.push({
                    category: templateItem.category,
                    section_name: templateItem.section_name,
                    item_name: templateItem.item_name,
                    item_order: templateItem.item_order,
                    status: status || 'N/A',
                    notes: null
                });
            });

            $('#categoryCItems textarea').each(function() {
                const notes = $(this).val().trim();
                if (notes) {
                    sections.push({
                        category: 'C',
                        section_name: 'Other Defects',
                        item_name: 'Any defect that is not mentioned above',
                        item_order: 1,
                        status: 'U',
                        notes: notes
                    });
                }
            });

            inspectionData.sections = sections;

            const token = getAuthToken();
            if (!token) throw new Error('Missing authentication token.');

            // Get user ID for audit fields
            let userId = null;
            try {
                const userInfo = localStorage.getItem('user_info');
                if (userInfo) {
                    const user = JSON.parse(userInfo);
                    userId = user.id || user.user_id || null;
                }
            } catch (e) {
                // Silently fail
            }

            // Add audit fields
            inspectionData.created_by = userId;
            inspectionData.updated_by = userId;

            // Show loading indicator
            Swal.fire({
                title: 'Saving Inspection...',
                text: 'Please wait while we save your inspection.',
                allowOutsideClick: false,
                allowEscapeKey: false,
                showConfirmButton: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            const response = await dataFunctions.createInspectionNew(inspectionData, token);
            
            if (response && response.success === false) {
                Swal.close();
                throw new Error(response.error || 'Failed to create inspection.');
            }

            if (!response || (response.success !== true && !response.id)) {
                Swal.close();
                throw new Error('Unexpected response from server.');
            }

            Swal.close();
            Swal.fire('Inspection saved', 'Inspection saved successfully.', 'success').then(() => {
                if (typeof _appRouter !== 'undefined' && typeof _appRouter.routeTo === 'function') {
                    _appRouter.routeTo('inspections-grid');
                } else {
                    window.history.back();
                }
            });
        } catch (error) {
            Swal.close();
            Swal.fire('Error', error.message || 'Unable to save inspection.', 'error');
        }
    }

    function reset() {
        isInitialized = false;
        inspectionTemplate = [];
        editingInspection = null;
        isViewMode = false;
        
        // Clear signature pads
        if (driverSignaturePad) {
            driverSignaturePad.clear();
        }
        if (supervisorSignaturePad) {
            supervisorSignaturePad.clear();
        }
        
        // Unbind events
        $('#inspectionForm').off('submit');
        $('#cancelBtn, #cancelFormBtn').off('click');
        $('#prepopulateBtn').off('click');
        $('#clearDriverSignature').off('click');
        $('#clearSupervisorSignature').off('click');
    }

    return {
        init,
        reset
    };
})();

function initializeInspectionForm() {
    if (typeof dataFunctions !== 'undefined') {
        _inspectionForm.init();
    } else {
        setTimeout(initializeInspectionForm, 100);
    }
}

// Don't auto-initialize on document ready - let appRouter handle it
// $(document).ready(function () {
//     initializeInspectionForm();
// });


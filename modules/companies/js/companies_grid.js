/**
 * Companies Grid Module
 * Handles company management functionality
 */

var _companiesGrid = function () {
    return {
        companies: [],
        filteredCompanies: [],
        currentPage: 1,
        itemsPerPage: 10,
        editingCompany: null,
        searchTimeout: null,

        init: function () {
            this.setupEventListeners();
            this.loadCompanies();
        },

        setupEventListeners: function () {
            const scope = this;

            // Remove existing event handlers first to prevent duplicates
            $('#searchInput').off('input');
            $('#filterStatus').off('change');
            $('#addCompanyBtn').off('click');
            $('#saveCompanyBtn').off('click');
            $('#companyModal').off('hidden.bs.modal');
            $(document).off('click', '.pagination .page-link');
            $(document).off('click', '.company-name-link');
            $(document).off('click', '.delete-company-btn');

            // Search functionality
            $('#searchInput').on('input', function () {
                clearTimeout(scope.searchTimeout);
                scope.searchTimeout = setTimeout(() => {
                    scope.filterCompanies();
                }, 300);
            });

            // Filter functionality
            $('#filterStatus').on('change', function () {
                scope.filterCompanies();
            });

            // Pagination
            $(document).on('click', '.pagination .page-link', function (e) {
                e.preventDefault();
                const page = parseInt($(this).data('page'));
                if (page && page !== scope.currentPage) {
                    scope.currentPage = page;
                    scope.renderCompanies();
                }
            });

            // Add company button
            $('#addCompanyBtn').on('click', function () {
                scope.showAddCompanyModal();
            });

            // Edit company (click on company name)
            $(document).on('click', '.company-name-link', function (e) {
                e.preventDefault();
                console.log('Company name link clicked');
                const companyId = $(this).data('company-id');
                console.log('Company ID:', companyId);
                if (!companyId) {
                    console.error('No company ID found');
                    return;
                }
                scope.editCompany(companyId);
            });

            // Delete company
            $(document).on('click', '.delete-company-btn', function () {
                const companyId = $(this).data('company-id');
                scope.deleteCompany(companyId);
            });

            // Save company form
            $('#saveCompanyBtn').on('click', function () {
                scope.saveCompany();
            });

            // Modal events
            $('#companyModal').on('hidden.bs.modal', function () {
                scope.clearForm();
            });
        },

        loadCompanies: async function () {
            try {
                this.showLoading();
                const response = await dataFunctions.getCompanies();
                console.log('Companies API response:', response);

                // Handle different response structures
                let companies = response;
                if (response && response.data) {
                    companies = response.data;
                } else if (response && response.companies) {
                    companies = response.companies;
                }

                // Ensure companies is an array
                if (!Array.isArray(companies)) {
                    console.warn('Companies data is not an array:', companies);
                    companies = [];
                }

                console.log('Processed companies data:', companies);
                this.companies = companies;
                this.filteredCompanies = companies;
                this.renderCompanies();
                this.hideLoading();
            } catch (error) {
                console.error('Error loading companies:', error);
                this.showError('Error loading companies: ' + error.message);
                this.hideLoading();
            }
        },

        filterCompanies: function () {
            const searchTerm = $('#searchInput').val().toLowerCase();
            const statusFilter = $('#filterStatus').val();

            this.filteredCompanies = this.companies.filter(company => {
                const companyName = (company.name || '').toLowerCase();
                const email = (company.email_primary || '').toLowerCase();
                const phone = (company.phone_primary || '').toLowerCase();

                const matchesSearch = !searchTerm ||
                    companyName.includes(searchTerm) ||
                    email.includes(searchTerm) ||
                    phone.includes(searchTerm);

                const matchesStatus = !statusFilter ||
                    (company.is_active !== false).toString() === statusFilter;

                return matchesSearch && matchesStatus;
            });

            this.currentPage = 1;
            this.renderCompanies();
        },

        renderCompanies: function () {
            console.log('Rendering companies:', this.filteredCompanies);
            const startIndex = (this.currentPage - 1) * this.itemsPerPage;
            const endIndex = startIndex + this.itemsPerPage;
            const companiesToShow = this.filteredCompanies.slice(startIndex, endIndex);

            console.log('Companies to show:', companiesToShow);

            const companiesHtml = companiesToShow.map(company => {
                console.log('Rendering company:', company);
                return `
                <tr>
                    <td>
                        <a href="#" class="company-name-link text-decoration-none" data-company-id="${company.id || ''}">
                            ${this.escapeHtml(company.name || 'Unknown Company')}
                        </a>
                    </td>
                    <td>${this.escapeHtml(company.email_primary || '')}</td>
                    <td>${this.escapeHtml(company.phone_primary || '')}</td>
                    <td>
                        <span class="badge ${(company.is_active !== false) ? 'bg-success' : 'bg-secondary'}">
                            ${(company.is_active !== false) ? 'Active' : 'Inactive'}
                        </span>
                    </td>
                    <td>
                        <button class="btn btn-sm btn-outline-danger delete-company-btn" data-company-id="${company.id || ''}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
            }).join('');

            $('#companiesTableBody').html(companiesHtml);
            this.renderPagination();
        },

        renderPagination: function () {
            const totalPages = Math.ceil(this.filteredCompanies.length / this.itemsPerPage);

            if (totalPages <= 1) {
                $('#pagination').empty();
                return;
            }

            let paginationHtml = '<nav><ul class="pagination justify-content-center">';

            // Previous button
            if (this.currentPage > 1) {
                paginationHtml += `<li class="page-item"><a class="page-link" href="#" data-page="${this.currentPage - 1}">Previous</a></li>`;
            }

            // Page numbers
            for (let i = 1; i <= totalPages; i++) {
                if (i === this.currentPage) {
                    paginationHtml += `<li class="page-item active"><span class="page-link">${i}</span></li>`;
                } else {
                    paginationHtml += `<li class="page-item"><a class="page-link" href="#" data-page="${i}">${i}</a></li>`;
                }
            }

            // Next button
            if (this.currentPage < totalPages) {
                paginationHtml += `<li class="page-item"><a class="page-link" href="#" data-page="${this.currentPage + 1}">Next</a></li>`;
            }

            paginationHtml += '</ul></nav>';
            $('#pagination').html(paginationHtml);
        },

        showAddCompanyModal: function () {
            this.editingCompany = null;
            this.clearForm();
            $('#companyModalLabel').text('Add Company');
            $('#companyModal').modal('show');
        },

        editCompany: async function (companyId) {
            console.log('editCompany called with ID:', companyId);
            console.log('Available companies:', this.companies.length);
            try {
                const company = this.companies.find(c => c.id === companyId);
                console.log('Found company:', company);
                if (!company) {
                    console.error('Company not found:', companyId);
                    console.log('Available company IDs:', this.companies.map(c => c.id));
                    this.showError('Company not found');
                    return;
                }

                this.editingCompany = company;
                console.log('About to populate form with company:', company);
                this.populateForm(company);
                $('#companyModalLabel').text('Edit Company');
                $('#companyModal').modal('show');
                console.log('Modal should be showing now');
            } catch (error) {
                console.error('Error editing company:', error);
                this.showError('Error loading company details: ' + error.message);
            }
        },

        deleteCompany: function (companyId) {
            const company = this.companies.find(c => c.id === companyId);
            if (!company) return;

            Swal.fire({
                title: 'Are you sure?',
                text: `Do you want to delete "${company.company_name}"?`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Yes, delete it!'
            }).then(async (result) => {
                if (result.isConfirmed) {
                    try {
                        await dataFunctions.deleteCompany(companyId);
                        this.showSuccess('Company deleted successfully');
                        this.loadCompanies();
                    } catch (error) {
                        console.error('Error deleting company:', error);
                        this.showError('Error deleting company: ' + error.message);
                    }
                }
            });
        },

        saveCompany: async function () {
            try {
                const formData = {
                    name: $('#companyName').val().trim(),
                    email_primary: $('#companyEmail').val().trim(),
                    phone_primary: $('#companyPhone').val().trim(),
                    website: $('#website').val().trim(),
                    is_active: $('#companyActive').is(':checked')
                };

                // Validation
                if (!formData.name) {
                    this.showError('Company name is required');
                    return;
                }

                if (!formData.email_primary) {
                    this.showError('Email is required');
                    return;
                }

                // Email validation
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(formData.email_primary)) {
                    this.showError('Please enter a valid email address');
                    return;
                }

                if (this.editingCompany) {
                    // Update existing company
                    await dataFunctions.updateCompany(this.editingCompany.id, formData);
                    this.showSuccess('Company updated successfully');
                } else {
                    // Create new company
                    await dataFunctions.createCompany(formData);
                    this.showSuccess('Company created successfully');
                }

                $('#companyModal').modal('hide');
                this.loadCompanies();
            } catch (error) {
                console.error('Error saving company:', error);
                this.showError('Error saving company: ' + error.message);
            }
        },

        populateForm: function (company) {
            console.log('populateForm called with company:', company);
            console.log('Available company fields:', Object.keys(company));

            // Use the actual field names from backend
            const companyName = company.name || '';
            const email = company.email_primary || '';
            const phone = company.phone_primary || '';
            const website = company.website || '';
            const isActive = company.is_active !== undefined ? company.is_active : true;

            console.log('Setting company name to:', companyName);
            $('#companyName').val(companyName);
            console.log('Setting email to:', email);
            $('#companyEmail').val(email);
            console.log('Setting phone to:', phone);
            $('#companyPhone').val(phone);
            console.log('Setting website to:', website);
            $('#website').val(website);
            console.log('Setting active status to:', isActive);
            $('#companyActive').prop('checked', isActive);
            console.log('Form population complete');
        },

        clearForm: function () {
            $('#companyForm')[0].reset();
            this.editingCompany = null;
        },

        showLoading: function () {
            $('#companiesTableBody').html('<tr><td colspan="5" class="text-center"><i class="fas fa-spinner fa-spin"></i> Loading...</td></tr>');
        },

        hideLoading: function () {
            // Loading will be replaced by renderCompanies
        },

        showError: function (message) {
            if (typeof _common !== 'undefined' && _common.showToastMessage) {
                _common.showToastMessage(message, 'error');
            } else {
                alert(message);
            }
        },

        showSuccess: function (message) {
            if (typeof _common !== 'undefined' && _common.showToastMessage) {
                _common.showToastMessage(message, 'success');
            } else {
                alert(message);
            }
        },

        escapeHtml: function (text) {
            if (!text) return '';
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        },

        search: function () {
            this.filterCompanies();
        },

        applyFilters: function () {
            this.filterCompanies();
        },

        clearFilters: function () {
            $('#searchInput').val('');
            $('#filterStatus').val('');
            this.filterCompanies();
        }
    }
}();

// Initialize companies grid when module is loaded
function initializeCompaniesGrid() {
    if (typeof dataFunctions !== 'undefined') {
        _companiesGrid.init();
    } else {
        // Wait for dataFunctions to be available
        setTimeout(initializeCompaniesGrid, 100);
    }
}

// Auto-initialize if DOM is ready
$(document).ready(function () {
    initializeCompaniesGrid();
});
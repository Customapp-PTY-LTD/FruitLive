# Company Table Implementation - Hope Diamond Transport

## Overview
Successfully created a Company table in the Hope Diamond Transport project based on the UnderRight project's Company table structure.

## Database Structure

### Company Table
- **Table Name**: `Company` (with lowercase `company` view for Lambda compatibility)
- **Primary Key**: `id` (BIGSERIAL)
- **Unique Identifier**: `company_guid` (UUID with default GEN_RANDOM_UUID())
- **Row Level Security**: Enabled

### Key Fields
- **Basic Information**:
  - `name` - Company name
  - `company_code` - Short code/abbreviation
  - `legal_name` - Official legal name
  - `trading_name` - Trading name (may differ from legal name)

- **Registration & Legal**:
  - `registration_number` - Government registration number
  - `tax_id` - Tax identification number
  - `duns_number` - D-U-N-S number

- **Contact Information**:
  - `phone_primary` / `phone_secondary` - Phone numbers
  - `email_primary` / `email_secondary` - Email addresses
  - `website` - Company website URL

- **Address**:
  - `address_line1` / `address_line2` - Address lines
  - `city`, `state_province`, `postal_code`, `country` - Location details

- **Business Details**:
  - `industry` - Industry sector
  - `business_size` - Size category (Small, Medium, Large, Enterprise)
  - `annual_revenue` - Annual revenue amount
  - `employee_count` - Number of employees
  - `founded_date` - Date company was founded

- **Financial**:
  - `currency_code` - Primary currency (default: 'USD')
  - `credit_rating` - Credit rating if available
  - `payment_terms` - Standard payment terms

- **Status & Metadata**:
  - `status` - Current status (default: 'active')
  - `is_verified` - Whether information is verified (default: false)
  - `is_active` - Whether record is active (default: true)
  - `description` - Company description
  - `notes` - Additional notes
  - `created_at` / `updated_at` - Timestamps

## CRUD Functions Created

### 1. `get_companies()`
- Returns list of all active companies
- Includes key fields for display purposes

### 2. `get_company_by_id(p_id BIGINT)`
- Returns complete company details by ID
- Includes all fields for detailed view

### 3. `create_company(...)`
- Creates new company record
- All parameters are optional with sensible defaults
- Returns ID, GUID, and name of created company

### 4. `update_company(p_id BIGINT, ...)`
- Updates existing company record
- Uses COALESCE to only update provided fields
- Returns boolean indicating success

### 5. `delete_company(p_id BIGINT)`
- Soft delete (sets is_active = false)
- Returns boolean indicating success

## RBAC Permissions

### Role-Based Access Control
- **Super Admin**: Full access (read, write, create, delete)
- **Transport Manager**: Read, write, create access
- **Fleet Supervisor**: Read access only
- **User**: Read access only
- **Customer Service**: Read access only

### Permissions Applied To:
- Company table operations
- All CRUD functions

## Sample Data
Added Hope Diamond Transport Ltd as a sample company record with:
- Complete company information
- South African address and contact details
- Transportation industry classification
- Active status with verification

## Lambda Compatibility
- Created lowercase `company` view for Lambda function compatibility
- Maintains same structure as UnderRight project for consistency

## Next Steps
1. **Frontend Integration**: Create company management UI components
2. **API Integration**: Connect to Lambda proxy for company operations
3. **Validation**: Add business logic validation for company data
4. **Search**: Implement company search and filtering capabilities
5. **Reporting**: Add company-related reporting features

## Files Created/Modified
- Database migrations for Company table structure
- RBAC permissions for role-based access
- CRUD functions for company operations
- Sample data for testing

The Company table is now ready for integration with the Hope Diamond Transport admin portal!

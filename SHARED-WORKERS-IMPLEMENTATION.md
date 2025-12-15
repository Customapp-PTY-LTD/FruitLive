# Shared Workers Functionality Implementation

## Overview

Shared Workers functionality allows managing workers who are transferred between farms. A worker is considered "shared" when their `current_farm_id` differs from their `home_farm_id`.

## Features Implemented

### 1. Shared Workers Identification
- Workers are identified as "shared" when `home_farm_id != current_farm_id`
- Shared workers alert displays count and details
- Modal shows all shared workers with home and current farm information

### 2. Shared Workers Modal
- Displays list of all shared workers
- Shows worker name, employee number, home farm, and current farm
- "Return" button to revert worker back to home farm
- "Create Transfer" button to initiate new transfers

### 3. Create Transfer Modal
- Select origin farm (where workers are coming from)
- Select destination farm (where workers are going to)
- Select multiple workers from origin farm
- Set start date (required) and end date (optional)
- Add notes about the transfer
- Saves transfer by updating worker `current_farm_id`

### 4. Transfer Management
- Transfer workers by updating `current_farm_id` to destination farm
- Revert transfer by setting `current_farm_id` back to `home_farm_id`
- Updates are reflected immediately in the UI

## Data Functions Added

### `getSharedWorkers(filters, token)`
- Gets all workers and filters for shared workers (home_farm_id != current_farm_id)
- Returns array of shared worker objects

### `updateWorkerTransfer(workerId, destinationFarmId, token)`
- Wrapper around `updateWorker` to transfer a worker
- Updates `current_farm_id` to destination farm

## UI Components

### Shared Workers Alert
- Displays above filters when shared workers exist
- Shows count and farm details
- "Manage Transfer" button opens modal

### Shared Workers Modal
- Full list of shared workers
- Each worker shows:
  - Name and employee number
  - Home farm → Current farm
  - Return button

### Create Transfer Modal
- Form to create new transfers
- Worker selection checkboxes
- Farm dropdowns
- Date inputs

## Usage Flow

1. **View Shared Workers**: Click "Shared Workers" button → Modal opens with list
2. **Create Transfer**: 
   - Click "Create Transfer" in modal
   - Select origin and destination farms
   - Select workers to transfer
   - Set dates and notes
   - Save transfer
3. **Return Worker**: Click "Return" button on shared worker → Worker returns to home farm
4. **Auto-refresh**: After transfer/return, data reloads automatically

## Database Notes

- Uses existing `workers` table with `home_farm_id` and `current_farm_id`
- `labour_transfers` table exists but not yet used (future enhancement)
- Current implementation uses direct worker updates

## Future Enhancements

1. **Transfer History**: Track transfer dates and history
2. **Transfer Status**: Use `labour_transfers` table for proper tracking
3. **Automatic Expiry**: Auto-return workers when transfer end date is reached
4. **Approval Workflow**: Require approval for transfers
5. **Cost Markup**: Apply 10% markup for shared workers (as per spec)

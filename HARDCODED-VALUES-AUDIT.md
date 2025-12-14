# Hardcoded Values Audit

## Critical Issues (Should be Dynamic)

### 1. Summary Cards - Hardcoded Statistics
These cards show hardcoded values that should be calculated from actual data:

#### Water Module (`modules/water/html/water_grid.html`)
- Line 43: `18,450 m³` - Water Used (This Month)
- Line 53: `8` - Active Pumps
- Line 63: `64,200 m³` - License Remaining
- Line 64: `250,000 m³` - annual allocation
- Line 73: `R45,230` - Water Cost (Month)

#### Assets Module (`modules/assets/html/assets_grid.html`)
- Line 53: `R48,250` - Fuel (This Month)
- Line 54: `2,845 litres` - consumed
- Line 73: `R285,400` - Equipment Value
- Line 63: `3` - Service Due vehicles

#### Chemicals Module (`modules/chemicals/html/chemicals_grid.html`)
- Line 85: `R284,500` - Cost (This Season)

#### Post-Harvest Module (`modules/postharvest/html/postharvest_grid.html`)
- Line 72: `R1.2M` - Est. Returns

### 2. Dashboard Module (`modules/dashboard/js/dashboard.js`)
- Line 223: `'125 hectares'` - Hardcoded farm size (fallback)
- Line 221: `'FruitLive Demo Farm'` - Hardcoded farm name (fallback)
- Line 247-249: Same hardcoded fallback values
- Line 387: `'R87,450'` - Hardcoded labour cost
- Line 223, 249: `'125 hectares'` - Hardcoded size in multiple places

### 3. Admin Module (`modules/admin/js/admin_grid.js`)
- Lines 104-110: Mock summary data (totalFarms, totalUsers, etc.)
- Lines 149-210: Mock farms data with hardcoded hectares, workers, vehicles

### 4. Labour Module (`modules/labour/js/labour_grid.js`)
- Line 164: `'Quinn Farms'` - Hardcoded farm name (with TODO comment)

## Recommended Actions

1. **Summary Cards**: Should calculate from actual database data
2. **Dashboard Fallbacks**: Should show "No data available" or empty state
3. **Admin Mock Data**: Should use actual API calls
4. **Labour Farm Name**: Should fetch from allocation data

## Non-Critical (Placeholders/Labels)

These are acceptable as they're placeholders or labels:
- "Loading..." messages
- "N/A" for missing data
- "Coming soon..." for future features
- Placeholder text in input fields
- CSS color variables (these are intentional)

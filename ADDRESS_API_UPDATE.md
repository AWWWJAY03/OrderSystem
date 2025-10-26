# Address Dropdown Update - J&T Express API Integration

## Changes Made

### 1. Backend (Code.gs)
- ✅ Updated `getAddress()` function to use J&T Express API instead of PSGC API
- ✅ Changed API endpoint from `https://psgc.gitlab.io/api/` to `https://ylofficialjw.jtexpress.ph/website/base/info/area`
- ✅ Updated to use `parentId` parameter instead of `parentCode`
- ✅ Removed "District" field from order storage
- ✅ Updated field mappings in `createOrder()` and `getOrders()` functions

**API Endpoints:**
- **Provinces:** `https://ylofficialjw.jtexpress.ph/website/base/info/area?countryCode=PH&current=1&size=9999`
- **Cities:** `https://ylofficialjw.jtexpress.ph/website/base/info/area?countryCode=PH&parentId={provinceId}&current=1&size=9999`
- **Barangays:** `https://ylofficialjw.jtexpress.ph/website/base/info/area?countryCode=PH&parentId={cityId}&current=1&size=9999`

### 2. Frontend (OrderForm.jsx)
- ✅ Removed "District" dropdown field
- ✅ Updated dropdowns to use J&T API data structure (id, code, name)
- ✅ Changed from `parentCode` to `parentId` for dependent dropdowns
- ✅ Updated select options to use `id` as value and `name` as display text

### 3. API Service (api.js)
- ✅ Updated `getAddresses()` function parameter from `parentCode` to `parentId`
- ✅ Kept caching mechanism for performance

### 4. Data Structure
The J&T Express API returns:
```json
{
  "code": 1,
  "msg": "请求成功",
  "data": {
    "records": [
      {
        "id": 55593,
        "code": "210000",
        "nativeName": "ABRA",
        "type": 2
      }
    ],
    "total": 84
  }
}
```

Our system transforms this to:
```json
{
  "id": 55593,
  "code": "210000",
  "name": "ABRA",
  "type": 2
}
```

## Updated Order Form Structure

**Before:**
- Province → City → District → Barangay

**After:**
- Province → City → Barangay

## Google Sheets Schema Update

The Orders sheet structure has been updated:

**Old (18 columns):**
OrderID | TrackingNumber | Source | ProductID | ProductName | Quantity | CustomerName | Email | Province | City | District | Barangay | AddressDetails | Contact | PaymentStatus | ShippingStatus | JNTTracking | Date | AdminNotes

**New (17 columns):**
OrderID | TrackingNumber | Source | ProductID | ProductName | Quantity | CustomerName | Email | Province | City | Barangay | AddressDetails | Contact | PaymentStatus | ShippingStatus | JNTTracking | Date | AdminNotes

## Benefits

1. ✅ **J&T Compatible:** Addresses now match J&T Express's delivery network
2. ✅ **Accurate Coverage:** Only addresses where J&T delivers are available
3. ✅ **Real-time Data:** Fetches from J&T's official API
4. ✅ **Simpler Structure:** Removed District level complexity
5. ✅ **Better Integration:** Works seamlessly with J&T booking automation

## Testing

To test the address dropdowns:
1. Deploy the updated backend code to Google Apps Script
2. Run the frontend with `npm run dev`
3. Open the order form
4. Select a province - cities should populate
5. Select a city - barangays should populate
6. Complete the form and submit

## Notes

- The API is cached for 6 hours to avoid rate limits
- Addresses are filtered to show only J&T delivery coverage
- Empty parentId fetches provinces
- parentId={provinceId} fetches cities
- parentId={cityId} fetches barangays


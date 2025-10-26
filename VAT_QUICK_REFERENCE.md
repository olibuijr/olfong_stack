# VAT Implementation - Quick Reference

## Core Formula
```
priceBeforeVat = totalPrice / (1 + vatRate/100)
vatAmount = totalPrice - priceBeforeVat
```

## Utility Functions - Quick Access

### Frontend (`/web/src/utils/vatUtils.js`)
```javascript
import {
  calculateVatBreakdown,      // Get full breakdown
  getVatAmount,               // Get just VAT
  getPriceBeforeVat,          // Get price before VAT
  calculateOrderVat,          // Multi-item calculation
  formatVatInfo               // Format for display
} from '@/utils/vatUtils';
```

### Backend (`/backend/src/utils/vatUtils.js`)
```javascript
const {
  calculateVatBreakdown,      // Get full breakdown
  getVatAmount,               // Get just VAT
  getPriceBeforeVat,          // Get price before VAT
  calculateOrderVat,          // Multi-item calculation
  calculateOrderItemsVat,     // For OrderItem objects
  formatVatInfo               // Format for display
} = require('../utils/vatUtils');
```

## Usage Examples

### Example 1: Single Product
```javascript
const breakdown = calculateVatBreakdown(1999, 24);
// Returns: {
//   priceBeforeVat: 1612.10,
//   vatAmount: 386.90,
//   totalPrice: 1999
// }
```

### Example 2: Cart Items
```javascript
const cartTotals = calculateOrderVat([
  { price: 5000, quantity: 2, vatRate: 24 },
  { price: 3000, quantity: 1, vatRate: 24 }
]);
// Returns: {
//   totalBeforeVat: 6451.61,
//   totalVat: 1548.39,
//   grandTotal: 8000
// }
```

### Example 3: Order with Products
```javascript
const vatBreakdown = calculateOrderItemsVat(orderItems);
// Returns: {
//   totalBeforeVat: ...,
//   totalVat: ...,
//   grandTotal: ...,
//   itemBreakdowns: [...]  // Per-item details
// }
```

## Files Modified

### Frontend
- `/web/src/pages/ProductDetail.jsx` - VAT display
- `/web/src/pages/admin/Analytics.jsx` - VAT reporting

### Backend
- `/backend/src/controllers/analyticsController.js` - VAT calculations
- `/backend/src/controllers/productController.js` - VAT data queries

## Database Changes

### Queries Include VAT
```javascript
// Products now return with VAT profile
const product = await prisma.product.findUnique({
  where: { id: 440 },
  include: {
    category: {
      include: { vatProfile: true }  // NEW
    }
  }
});
```

## Translation Keys

### Product Page
```
productDetailPage.vatInformation
productDetailPage.vatProfile
productDetailPage.vatRate
productDetailPage.priceBeforeVat
productDetailPage.vatAmount
productDetailPage.totalPrice
```

### Analytics Page
```
adminAnalytics.totalVat
adminAnalytics.ofRevenue
adminAnalytics.revenueBeforeVat
adminAnalytics.netRevenue
adminAnalytics.averageVatRate
adminAnalytics.acrossAllOrders
```

## Common Tasks

### Task 1: Display Product VAT
```javascript
// In component
const breakdown = calculateVatBreakdown(product.price, product.category?.vatProfile?.vatRate);

// Display
<p>Price before VAT: {breakdown.priceBeforeVat} ISK</p>
<p>VAT: {breakdown.vatAmount} ISK</p>
<p>Total: {breakdown.totalPrice} ISK</p>
```

### Task 2: Calculate Order Total
```javascript
// In order processing
const vatInfo = calculateOrderVat(cartItems.map(item => ({
  price: item.product.price,
  quantity: item.quantity,
  vatRate: item.product.category?.vatProfile?.vatRate || 0
})));

// Store or display
order.totalBeforeVat = vatInfo.totalBeforeVat;
order.totalVat = vatInfo.totalVat;
order.totalPrice = vatInfo.grandTotal;
```

### Task 3: Get Analytics VAT Data
```javascript
// In analytics controller
const currentOrders = await prisma.order.findMany({
  where: { createdAt: { gte: startDate } },
  include: { items: { include: { product: { include: { category: { include: { vatProfile: true } } } } } } }
});

currentOrders.forEach(order => {
  const vatBreakdown = calculateOrderItemsVat(order.items);
  // Use vatBreakdown data
});
```

## Testing Data

**Product**: Vina Maipo Sauvignon Blanc Chardonnay
**ID**: 440
**Price**: 1,999 ISK
**VAT Rate**: 24%

**Verification**:
- Price Before VAT: 1,612.10 ISK
- VAT Amount: 386.90 ISK
- Total: 1,999.00 ISK ✓

## Troubleshooting

### VAT Not Showing on Product?
1. Check if category has `vatProfileId` assigned
2. Verify VAT profile exists and is active
3. Confirm product includes category with vatProfile

### VAT Data Missing in Analytics?
1. Ensure orders have items with product data
2. Verify products include category data
3. Check that categories include vatProfile data

### Incorrect Calculation?
1. Verify using: `priceBeforeVat = totalPrice / (1 + vatRate/100)`
2. Check VAT rate is percentage (24, not 0.24)
3. Test with simple example: 1000 ISK at 24% = 806.45 before + 193.55 VAT

## Performance Tips

1. **Cache VAT Profiles** - Rarely change, safe to cache
2. **Eager Load Relations** - Include vatProfile in queries
3. **Batch Calculations** - Use `calculateOrderVat()` for multiple items
4. **Denormalize for Reports** - Store vatAmount in OrderItem if needed

## Support

For detailed information, see:
- `VAT_IMPLEMENTATION_GUIDE.md` - Complete guide
- `VAT_SUMMARY.md` - Full implementation details
- Code comments in utility files

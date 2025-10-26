# VAT Implementation Guide

## Overview

This guide explains how VAT (Value Added Tax) is implemented in the Ölföng system and how to use the VAT utilities throughout the codebase.

## Key Concept

**All prices in the system are stored WITH VAT included.**

Since we can't directly access the price before VAT from a product price, we use reverse calculation:

```
priceBeforeVat = totalPrice / (1 + vatRate/100)
vatAmount = totalPrice - priceBeforeVat
```

## VAT Utilities

Two utility modules are provided for working with VAT calculations:

### Frontend: `/web/src/utils/vatUtils.js`

ES6 module for use in React components and frontend services.

#### Available Functions

1. **`calculateVatBreakdown(totalPrice, vatRate)`**
   - Calculates VAT breakdown from a price that includes VAT
   - Returns: `{ priceBeforeVat, vatAmount, totalPrice }`

2. **`getVatAmount(totalPrice, vatRate)`**
   - Returns only the VAT amount

3. **`getPriceBeforeVat(totalPrice, vatRate)`**
   - Returns only the price before VAT

4. **`calculateOrderVat(items)`**
   - Calculates total VAT for multiple items
   - Each item should have: `{ price, quantity, vatRate }`
   - Returns: `{ totalBeforeVat, totalVat, grandTotal }`

5. **`formatVatInfo(totalPrice, vatProfile, currency)`**
   - Formats VAT information for display
   - Takes a complete vatProfile object with name, nameIs, description, etc.

#### Frontend Example

```javascript
import { calculateVatBreakdown, calculateOrderVat } from '@/utils/vatUtils';

// Single product
const vatBreakdown = calculateVatBreakdown(1999, 24);
// { priceBeforeVat: 1612.10, vatAmount: 386.90, totalPrice: 1999 }

// Cart items
const cartItems = [
  { price: 5000, quantity: 2, vatRate: 24 },
  { price: 3000, quantity: 1, vatRate: 24 }
];
const totals = calculateOrderVat(cartItems);
// { totalBeforeVat: ..., totalVat: ..., grandTotal: ... }
```

### Backend: `/backend/src/utils/vatUtils.js`

CommonJS module for Node.js/Express services.

#### Available Functions

Same as frontend plus:

6. **`calculateOrderItemsVat(orderItems)`**
   - Specialized for OrderItem objects that include product data
   - Automatically extracts VAT rate from: `orderItem.product.category.vatProfile.vatRate`
   - Returns detailed breakdown including per-item information

#### Backend Example

```javascript
const vatUtils = require('../utils/vatUtils');

// Single product
const breakdown = vatUtils.calculateVatBreakdown(1999, 24);

// Order with items
const orderItems = [
  {
    product: {
      id: 440,
      name: 'Product Name',
      price: 5000,
      category: {
        vatProfile: { vatRate: 24 }
      }
    },
    quantity: 2
  }
];

const result = vatUtils.calculateOrderItemsVat(orderItems);
// {
//   totalBeforeVat: 8064.52,
//   totalVat: 1935.48,
//   grandTotal: 10000,
//   itemBreakdowns: [...]
// }
```

## Implementation in Orders

When processing orders, include VAT breakdown information:

### Example: Order Response Structure

```json
{
  "id": 123,
  "userId": 456,
  "items": [
    {
      "productId": 440,
      "productName": "Vina Maipo",
      "quantity": 2,
      "pricePerUnit": 1999,
      "subtotal": 3998,
      "vatRate": 24,
      "priceBeforeVat": 3224.19,
      "vatAmount": 773.81
    }
  ],
  "totals": {
    "subtotalBeforeVat": 3224.19,
    "totalVat": 773.81,
    "grandTotal": 3998
  }
}
```

### Implementation Pattern

```javascript
// In order controller
const { calculateOrderItemsVat } = require('../utils/vatUtils');

async function getOrder(req, res) {
  const order = await prisma.order.findUnique({
    where: { id: req.params.id },
    include: {
      items: {
        include: {
          product: {
            include: {
              category: {
                include: { vatProfile: true }
              }
            }
          }
        }
      }
    }
  });

  // Calculate VAT breakdown
  const vatBreakdown = calculateOrderItemsVat(order.items);

  res.json({
    ...order,
    vatBreakdown
  });
}
```

## Integration Points

### 1. **Cart Summary (Frontend)**

Use `calculateOrderVat()` to show cart totals:

```javascript
// In Cart component
const cartTotals = calculateOrderVat(cartItems.map(item => ({
  price: item.product.price,
  quantity: item.quantity,
  vatRate: item.product.category?.vatProfile?.vatRate || 0
})));
```

### 2. **Checkout Page (Frontend)**

Display VAT breakdown before payment:

```javascript
// Show price components
- Price before VAT: {cartTotals.totalBeforeVat}
- VAT (24%): {cartTotals.totalVat}
- Total: {cartTotals.grandTotal}
```

### 3. **Order Creation (Backend)**

Store VAT breakdown in order or OrderItem:

```javascript
// Extend OrderItem model to optionally store:
// - vatRate: Float (for historical records)
// - priceBeforeVat: Float (optional, for clarity)
// - vatAmount: Float (optional, for reporting)
```

### 4. **Invoice Generation (Backend)**

Include VAT breakdown:

```javascript
const { calculateOrderItemsVat } = require('../utils/vatUtils');

const vatInfo = calculateOrderItemsVat(orderItems);

// Use vatInfo for invoice display
invoiceData.subtotal = vatInfo.totalBeforeVat;
invoiceData.vat = vatInfo.totalVat;
invoiceData.total = vatInfo.grandTotal;
invoiceData.itemBreakdowns = vatInfo.itemBreakdowns;
```

### 5. **Reporting & Analytics**

Track VAT amounts for accounting:

```javascript
// Tax report query
const orders = await prisma.order.findMany({
  where: { createdAt: { gte: startDate, lte: endDate } },
  include: { items: { include: { product: { include: { category: { include: { vatProfile: true } } } } } } }
});

// Aggregate VAT
const totalVat = orders.reduce((sum, order) => {
  const breakdown = calculateOrderItemsVat(order.items);
  return sum + breakdown.totalVat;
}, 0);
```

## Database Schema Considerations

### Current Fields

Products already have:
- `price` - Total price including VAT

Categories have:
- `vatProfileId` - Reference to VatProfile
- `vatRate` - Legacy field (prefer vatProfile)

### Recommended Additions (Optional)

For better reporting, consider storing in OrderItem:

```prisma
model OrderItem {
  // ... existing fields

  // Optional: Store VAT info at time of order
  vatRate          Float?    // VAT rate applied (24, 0, etc.)
  priceBeforeVat   Float?    // Price before VAT for this item
  vatAmount        Float?    // VAT amount for this item

  @@index([orderId])
}
```

## Examples in Code

### Cart Page

```javascript
import { calculateOrderVat } from '@/utils/vatUtils';

function CartSummary({ items }) {
  const vatBreakdown = calculateOrderVat(items.map(item => ({
    price: item.product.price,
    quantity: item.quantity,
    vatRate: item.product.category?.vatProfile?.vatRate || 0
  })));

  return (
    <div>
      <p>Subtotal: {vatBreakdown.totalBeforeVat} ISK</p>
      <p>VAT: {vatBreakdown.totalVat} ISK</p>
      <p>Total: {vatBreakdown.grandTotal} ISK</p>
    </div>
  );
}
```

### Order Detail Page

```javascript
import { formatVatInfo } from '@/utils/vatUtils';

function OrderDetail({ order }) {
  const productVat = order.items.map(item => ({
    ...item,
    vat: formatVatInfo(item.product.price, item.product.category?.vatProfile)
  }));

  return (
    <div>
      {productVat.map(item => (
        <div key={item.id}>
          <p>{item.product.name}: {item.product.price} ISK</p>
          <small>
            Before VAT: {item.vat.priceBeforeVat} ISK
            VAT ({item.vat.vatRate}%): {item.vat.vatAmount} ISK
          </small>
        </div>
      ))}
    </div>
  );
}
```

## Testing VAT Calculations

### Test Case: 24% VAT

```
Product Price: 1,999 ISK
VAT Rate: 24%

Calculation:
- priceBeforeVat = 1999 / 1.24 = 1,612.10
- vatAmount = 1999 - 1612.10 = 386.90

Verification: 1612.10 + 386.90 = 1999 ✓
```

## Migration Notes

If migrating from a system without VAT:

1. Ensure all product prices include VAT
2. Assign appropriate VAT profiles to categories
3. Update order reports to show VAT breakdown
4. Modify invoice templates to display VAT information
5. Update tax reporting to use calculated VAT amounts

## Support

For questions or issues with VAT calculations, refer to:
- `/web/src/utils/vatUtils.js` - Frontend implementation
- `/backend/src/utils/vatUtils.js` - Backend implementation
- Test files with examples in comments

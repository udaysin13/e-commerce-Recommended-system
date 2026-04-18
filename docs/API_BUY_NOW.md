# Buy Now API Reference

## Endpoint

```
POST /orders/buy-now
```

---

## Authentication

**Required**: Yes (Bearer Token)

**Header**:
```
Authorization: Bearer {token}
```

---

## Request Body

```json
{
  "productId": "string (required)",
  "quantity": "number (required, must be > 0)"
}
```

### Example Request
```bash
curl -X POST http://localhost:4000/orders/buy-now \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "prod_12345",
    "quantity": 1
  }'
```

---

## Response (Success)

**Status**: `201 Created`

```json
{
  "success": true,
  "data": {
    "order": {
      "id": "ord_abc123",
      "orderNumber": "ORD-20240417-ABC123",
      "status": "PENDING",
      "paymentStatus": "PENDING",
      "subtotal": 99.99,
      "taxAmount": 10.00,
      "shippingAmount": 0,
      "discountAmount": 0,
      "totalAmount": 109.99,
      "currency": "USD",
      "placedAt": "2024-04-17T10:30:00Z",
      "items": [
        {
          "id": "oi_123",
          "productId": "prod_12345",
          "productName": "Wireless Headphones",
          "sku": "WH-001",
          "quantity": 1,
          "unitPrice": 99.99,
          "totalPrice": 109.99
        }
      ]
    }
  }
}
```

---

## Error Responses

### 400 Bad Request - Missing Fields
```json
{
  "success": false,
  "error": {
    "message": "productId and quantity are required."
  }
}
```

### 400 Bad Request - Product Not Found
```json
{
  "success": false,
  "error": {
    "message": "Product not found."
  }
}
```

### 400 Bad Request - Insufficient Stock
```json
{
  "success": false,
  "error": {
    "message": "Product does not have enough stock. Available: 5"
  }
}
```

### 400 Bad Request - Product Inactive
```json
{
  "success": false,
  "error": {
    "message": "Product is no longer available."
  }
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": {
    "message": "Authentication is required."
  }
}
```

---

## Implementation Details

### What Happens:
1. ✅ Validates user authentication
2. ✅ Fetches product from database
3. ✅ Validates product is active
4. ✅ Validates sufficient stock
5. ✅ Calculates totals:
   - Subtotal = quantity × unitPrice
   - Tax = subtotal × 0.10 (10%)
   - Shipping = 0 (free)
   - Total = subtotal + tax
6. ✅ Creates order in database
7. ✅ Decrements product stock
8. ✅ Records purchase interaction for recommendations
9. ✅ Returns order details

### Order Fields:
- `orderNumber`: Auto-generated unique identifier (format: ORD-YYYYMMDD-XXXXXX)
- `status`: PENDING (initial state)
- `paymentStatus`: PENDING (awaiting payment)
- `currency`: USD (or product's currency)
- `placedAt`: Timestamp when order was created

---

## Frontend Usage

### Basic Implementation
```typescript
async function placeOrder(productId: string, quantity: number) {
  const token = localStorage.getItem("authToken");
  
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/orders/buy-now`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        productId,
        quantity,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message);
  }

  const data = await response.json();
  return data.data.order;
}
```

### In React/Next.js Component
```typescript
const handleConfirmOrder = async () => {
  try {
    const order = await placeOrder(productId, quantity);
    router.push(`/order-confirmation/${order.id}`);
  } catch (error) {
    setError(error.message);
  }
};
```

---

## Database Schema References

### Order Model
```prisma
model Order {
  id              String    @id @default(cuid())
  userId          String
  orderNumber     String    @unique
  status          OrderStatus
  paymentStatus   PaymentStatus
  subtotal        Decimal   @db.Decimal(10, 2)
  taxAmount       Decimal   @db.Decimal(10, 2)
  shippingAmount  Decimal   @db.Decimal(10, 2)
  discountAmount  Decimal   @db.Decimal(10, 2)
  totalAmount     Decimal   @db.Decimal(10, 2)
  currency        String
  placedAt        DateTime  @default(now())
  
  user            User      @relation(fields: [userId])
  items           OrderItem[]
}
```

### OrderItem Model
```prisma
model OrderItem {
  id          String   @id @default(cuid())
  orderId     String
  productId   String
  productName String
  sku         String
  quantity    Int
  unitPrice   Decimal  @db.Decimal(10, 2)
  totalPrice  Decimal  @db.Decimal(10, 2)
  
  order       Order    @relation(fields: [orderId])
  product     Product  @relation(fields: [productId])
}
```

---

## Testing with cURL

### Get Auth Token (adapt to your auth system)
```bash
# Login to get token
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password"}'
```

### Place Buy Now Order
```bash
# Replace token and productId
curl -X POST http://localhost:4000/orders/buy-now \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "YOUR_PRODUCT_ID",
    "quantity": 1
  }'
```

---

## Status Codes

| Code | Meaning |
|------|---------|
| 201 | Order created successfully |
| 400 | Invalid request (missing fields, product not found, insufficient stock) |
| 401 | Not authenticated |
| 500 | Server error |

---

## Related Endpoints

- `GET /orders` - List user's orders
- `GET /orders/:id` - Get order details
- `POST /orders` - Create order from cart (different from buy-now)

---

## Notes

- Each order gets a unique `orderNumber` automatically
- Product stock is immediately decremented upon order creation
- Purchase interactions are recorded for the recommendation system
- All amounts are in the product's currency (default: USD)
- Tax is calculated at 10% by default (configurable in service)

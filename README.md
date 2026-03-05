# nowpayments-node

**A simple, human-friendly Node.js SDK for [NOWPayments](https://nowpayments.io/)** — accept 300+ cryptocurrencies with automatic conversion to your wallet.

## Setup

**1. Get your API key** → [account.nowpayments.io](https://account.nowpayments.io) (use [sandbox](https://account-sandbox.nowpayments.io) for testing)

**2. Install**

```bash
npm install nowpayments-node
```

**3. Use**

```typescript
import { NowPayments } from 'nowpayments-node';

const np = new NowPayments({
  apiKey: process.env.NOWPAYMENTS_API_KEY!,  // Always use env vars in production
  sandbox: true,  // Set false for real payments
});
```

## Quick Examples

### Create a payment (customer pays in crypto)

```typescript
const payment = await np.createPayment({
  price_amount: 29.99,
  price_currency: 'usd',
  pay_currency: 'btc',
  order_id: 'order-12345',
  order_description: 'Monthly subscription',
  ipn_callback_url: 'https://yoursite.com/webhook',
});

// Show customer where to pay:
console.log(`Pay ${payment.pay_amount} ${payment.pay_currency.toUpperCase()}`);
console.log(`Address: ${payment.pay_address}`);
```

### Check payment status & show friendly message

```typescript
import { getStatusLabel, isPaymentComplete } from 'nowpayments-node';

const payment = await np.getPaymentStatus(paymentId);

// "Awaiting payment" | "Completed" | "Expired" etc.
console.log(getStatusLabel(payment.payment_status));

if (isPaymentComplete(payment.payment_status)) {
  console.log('Payment done! Fulfill the order.');
}
```

### Get price in crypto before creating payment

```typescript
const estimate = await np.getEstimatePrice({
  amount: 100,
  currency_from: 'usd',
  currency_to: 'btc',
});
console.log(`100 USD ≈ ${estimate.estimated_amount} BTC`);
```

## Config options

| Option     | Required | Default   | Description                              |
|-----------|----------|-----------|------------------------------------------|
| `apiKey`  | Yes      | —         | From [Dashboard](https://account.nowpayments.io) |
| `sandbox` | No       | `false`   | Use sandbox for testing                  |
| `timeout` | No       | `30000`   | Request timeout (ms)                     |
| `ipnSecret` | No     | —         | For webhook verification                 |
| `baseUrl` | No       | —         | Override API URL                         |

## Main methods

| Method | What it does |
|--------|--------------|
| `createPayment(params)` | Create payment → get address for customer |
| `getPaymentStatus(id)` | Check if payment received |
| `getPayments(params?)` | List all payments (paginated) |
| `createInvoice(params)` | Create invoice → get URL to redirect customer |
| `createInvoicePayment(params)` | Create payment for existing invoice |
| `getCurrencies()` | List supported cryptos (btc, eth, etc.) |
| `getEstimatePrice(params)` | Convert fiat → crypto amount |
| `getMinAmount(params)` | Get minimum payment for currency pair |
| `updatePaymentEstimate(id)` | Refresh payment amount before expiry |
| `createPayout(params, jwt?)` | Mass payout (requires JWT token) |
| `verifyPayout(id)` | Verify payout |
| `getStatus()` | Check if API is up |
| Subscriptions: `getSubscriptions()`, `getSubscriptionPlans()`, etc. | Recurring payments |
| Sub-partners: `getSubPartners()`, `getSubPartnerBalance()`, etc. | Customer management |

## Helpers (human-friendly)

```typescript
import {
  isPaymentComplete,   // finished, failed, refunded, expired
  isPaymentPending,   // waiting, confirming, etc.
  getStatusLabel,     // "Awaiting payment" | "Completed" | ...
  getPaymentSummary,  // Short string for display
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUSES,
} from 'nowpayments-node';
```

## Verify webhooks (IPN)

Ensure callbacks are from NOWPayments, not a fake request:

```typescript
import { NowPayments, verifyIpnSignature } from 'nowpayments-node';

// With instance (needs ipnSecret in config):
const np = new NowPayments({ apiKey: '...', ipnSecret: 'YOUR_IPN_SECRET' });
if (np.verifyIpn(req.body, req.headers['x-nowpayments-sig'])) {
  // Valid – process payment update
}

// Or standalone:
if (verifyIpnSignature(req.body, req.headers['x-nowpayments-sig'], 'YOUR_IPN_SECRET')) {
  // Valid
}
```

## Errors

```typescript
import { NowPaymentsError } from 'nowpayments-node';

try {
  await np.createPayment({ ... });
} catch (err) {
  if (err instanceof NowPaymentsError) {
    console.log(err.message);      // Human-readable message
    console.log(err.statusCode);  // 400, 401, 500, etc.
  }
}
```

## Subscriptions, invoices, sub-partners

See [API docs](https://documenter.getpostman.com/view/7907941/2s93JusNJt) for full endpoint list. This SDK supports:

- **Subscriptions**: `getSubscriptions()`, `getSubscription()`, `deleteSubscription()`, `getSubscriptionPlans()`, etc.
- **Invoices**: `createInvoice()`, `createInvoicePayment()`
- **Sub-partners**: `getSubPartners()`, `getSubPartnerBalance()`, `getTransfers()`, etc.

## Links

- [API Docs](https://documenter.getpostman.com/view/7907941/2s93JusNJt)
- [Sandbox](https://documenter.getpostman.com/view/7907941/T1LSCRHC)
- [Help & Support](https://nowpayments.io/help/payments/api)

## License

MIT

# nowpayments-node

**A simple, human-friendly Node.js SDK for [NOWPayments](https://nowpayments.io/)** — accept 300+ cryptocurrencies with automatic conversion to your wallet.

## 3-step flow

```
1. createPayment()  →  Get address for customer
2. Customer pays    →  You receive coins
3. getPaymentStatus() or IPN webhook  →  Know when done
```

## Setup

**1. Get API key** → [account.nowpayments.io](https://account.nowpayments.io) ([sandbox](https://account-sandbox.nowpayments.io) for testing)

**2. Install**

```bash
npm install nowpayments-node
```

**3. Init**

```typescript
import { NowPayments } from 'nowpayments-node';

const np = new NowPayments({
  apiKey: process.env.NOWPAYMENTS_API_KEY!,
  sandbox: true,  // false for real payments
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
| `getAuthToken(email, password)` | Get JWT (expires 5 min, needed for payouts) |
| `createPayout(params, jwt)` | Mass payout (JWT required) |
| `verifyPayout(id, code, jwt)` | Verify payout with 2FA code |
| `getPayoutStatus(id)`, `getPayouts(params)` | Payout status & list |
| `validatePayoutAddress(params)` | Check address before payout |
| `getBalance(jwt?)` | Custody balance |
| `getStatus()` | Check if API is up |
| Subscriptions: `createSubscription()`, `getSubscriptions()`, etc. | Recurring payments |
| Custody: `createSubPartner()`, `createTransfer()`, `writeOff()`, `deposit()` | User balances |
| Conversions: `createConversion()`, `getConversionStatus()`, `getConversions()` | In-account exchange |

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

Always verify callbacks before trusting them:

```typescript
import { NowPayments, verifyIpnSignature } from 'nowpayments-node';

const np = new NowPayments({ apiKey: '...', ipnSecret: 'YOUR_IPN_SECRET' });

// Express / Connect: use raw body (express.json()) for np.verifyIpn
const sig = req.headers['x-nowpayments-sig'];
if (sig && np.verifyIpn(req.body, sig)) {
  // Valid – process payment update (req.body.payment_status, etc.)
}

// Or without instance:
verifyIpnSignature(req.body, sig, 'YOUR_IPN_SECRET');
```

## Errors

```typescript
import { NowPaymentsError } from 'nowpayments-node';

try {
  await np.createPayment({ ... });
} catch (err) {
  if (err instanceof NowPaymentsError) {
    console.log(err.message);     // "Invalid api key"
    console.log(err.statusCode); // 401
    console.log(err.toString()); // "Invalid api key (status: 401) [UNAUTHORIZED]"
  }
}
```

## Common patterns

**Payout flow (needs JWT):**
```typescript
const { token } = await np.getAuthToken(email, password);
await np.validatePayoutAddress({ address, currency });
const batch = await np.createPayout({ withdrawals: [{ address, currency, amount }] }, token);
await np.verifyPayout(batch.id, '123456', token);  // 2FA code
```

**Check before creating payment:**
```typescript
const [estimate, min] = await Promise.all([
  np.getEstimatePrice({ amount: 100, currency_from: 'usd', currency_to: 'btc' }),
  np.getMinAmount({ currency_from: 'usd', currency_to: 'btc' }),
]);
if (estimate.estimated_amount >= min.min_amount) {
  const payment = await np.createPayment({ ... });
}
```

## Subscriptions, invoices, sub-partners

See [API docs](https://documenter.getpostman.com/view/7907941/2s93JusNJt) for full list. This SDK supports:

- **Subscriptions**: `getSubscriptions()`, `getSubscription()`, `deleteSubscription()`, `getSubscriptionPlans()`, etc.
- **Invoices**: `createInvoice()`, `createInvoicePayment()`
- **Sub-partners**: `getSubPartners()`, `getSubPartnerBalance()`, `getTransfers()`, etc.

## Links

- [API Docs](https://documenter.getpostman.com/view/7907941/2s93JusNJt)
- [Sandbox](https://documenter.getpostman.com/view/7907941/T1LSCRHC)
- [Help & Support](https://nowpayments.io/help/payments/api)

## License

MIT

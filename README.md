<p align="center">
  <img src="https://img.shields.io/npm/v/nowpayments-node?color=6366f1&style=for-the-badge&logo=npm" alt="npm version" />
  <img src="https://img.shields.io/badge/license-MIT-22c55e?style=for-the-badge" alt="license" />
  <img src="https://img.shields.io/badge/Node.js-16+-339933?style=for-the-badge&logo=node.js" alt="Node.js" />
  <img src="https://img.shields.io/badge/TypeScript-5+-3178c6?style=for-the-badge&logo=typescript" alt="TypeScript" />
</p>

<h1 align="center">nowpayments-node</h1>
<p align="center">
  <strong>Full-featured Node.js SDK for NOWPayments</strong><br/>
  Accept 300+ cryptocurrencies with auto-conversion to your wallet
</p>

<p align="center">
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-features">Features</a> •
  <a href="#-examples">Examples</a> •
  <a href="#-api-reference">API</a> •
  <a href="#-links">Links</a>
</p>

---

## ✨ Features

| Feature | Support |
|---------|---------|
| **Payments** | Create, status, list, update estimate |
| **Invoices** | Create invoice + redirect flow |
| **Payouts** | Mass payout, verify 2FA, cancel scheduled |
| **Fiat Payouts** | Currencies, payment methods, list |
| **Subscriptions** | Plans, recurring payments, cancel |
| **Custody** | Sub-partners, transfers, deposit, write-off |
| **Conversions** | In-custody currency conversion |
| **IPN Webhooks** | HMAC signature verification |
| **Helpers** | `isPaymentComplete`, `getStatusLabel`, etc. |

---

## 🚀 Quick start

```bash
npm install nowpayments-node
```

```typescript
import { NowPayments } from 'nowpayments-node';

const np = new NowPayments({
  apiKey: process.env.NOWPAYMENTS_API_KEY!,
  sandbox: true,  // false for production
});

// Create payment
const payment = await np.createPayment({
  price_amount: 29.99,
  price_currency: 'usd',
  pay_currency: 'btc',
  order_id: 'order-123',
});

console.log(`Pay ${payment.pay_amount} BTC → ${payment.pay_address}`);
```

---

## ⚙️ Config

| Option | Required | Default | Description |
|--------|----------|---------|-------------|
| `apiKey` | Yes | — | From [Dashboard](https://account.nowpayments.io) |
| `sandbox` | No | `false` | Use sandbox API |
| `timeout` | No | `30000` | Request timeout (ms) |
| `ipnSecret` | No | — | For webhook verification |
| `baseUrl` | No | — | Override API URL |

---

## 📁 Examples

| File | Description |
|------|-------------|
| `01-create-payment.ts` | Create payment |
| `02-check-payment-status.ts` | Check status |
| `03-list-payments.ts` | List payments |
| `04-create-invoice.ts` | Invoice (redirect flow) |
| `05-estimate-and-min-amount.ts` | Price estimate |
| `06-get-currencies.ts` | Currencies |
| `07-payout-flow.ts` | Payout (validate → create → verify) |
| `08-subscription.ts` | Subscriptions |
| `09-ipn-webhook.ts` | IPN verification |
| `10-custody-and-balance.ts` | Balance, custody, deposit |
| `11-conversions.ts` | Conversions |

```bash
export NOWPAYMENTS_API_KEY=your_key
npx tsx examples/01-create-payment.ts
```

---

## 📖 API Reference

### Auth & Status

#### `getStatus()`
```typescript
const status = await np.getStatus();
// { message: 'OK' }
```

#### `getAuthToken(email, password)`
```typescript
const { token } = await np.getAuthToken('your@email.com', 'password');
// Use token for payouts, custody, etc. Expires in 5 min.
```

### Currencies

- `getCurrencies(fixedRate?)` — List available crypto
- `getFullCurrencies()` — Detailed info (id, code, name, wallet_regex, network)
- `getMerchantCoins(fixedRate?)` — From dashboard settings
- `getCurrency(currency)` — Single currency details

### Payments

- `createPayment(params)` — Create payment → get pay address
- `getPaymentStatus(paymentId)` — Check status
- `getPayments(params?)` — List (paginated)
- `updatePaymentEstimate(paymentId)` — Refresh amount before expiry

### Price & Minimum

- `getEstimatePrice(params)` — Fiat → crypto amount
- `getMinAmount(params)` — Min payment for currency pair

### Invoices

- `createInvoice(params)` — Create invoice URL
- `createInvoicePayment(params)` — Payment for existing invoice

### Payouts (JWT)

- `validatePayoutAddress(params)` — Validate before payout
- `createPayout(params, jwtToken)` — Mass payout
- `verifyPayout(id, code, jwtToken)` — 2FA verification
- `cancelPayout(id, jwtToken)` — Cancel scheduled (use individual payout id)
- `getPayoutStatus(id, jwtToken?)` — Status
- `getPayouts(params?)` — List

### Fiat Payouts (JWT)

- `getFiatPayoutsCryptoCurrencies(params?, jwtToken?)`
- `getFiatPayoutsPaymentMethods(params?, jwtToken?)`
- `getFiatPayouts(params?, jwtToken?)`

### Subscriptions

- `getSubscriptionPlans(params?)` / `getSubscriptionPlan(id)`
- `updateSubscriptionPlan(id, updates)`
- `createSubscription(params, jwtToken)`
- `getSubscriptions(params?)` / `getSubscription(id)`
- `deleteSubscription(id, jwtToken?)`

### Custody / Sub-partners (JWT)

- `createSubPartner(name, jwtToken)`
- `createSubPartnerPayment(params, jwtToken)` — Deposit with payment
- `getSubPartners(params?, jwtToken?)` / `getSubPartnerBalance(id)`
- `createTransfer(params, jwtToken)` / `deposit(params, jwtToken)` / `writeOff(params, jwtToken)`
- `getTransfers(params?, jwtToken?)` / `getTransfer(id, jwtToken?)`

### Conversions (JWT)

- `createConversion(params, jwtToken)`
- `getConversionStatus(id, jwtToken)` / `getConversions(params?, jwtToken?)`

### IPN / Webhooks

```typescript
// With instance (needs ipnSecret in config):
if (np.verifyIpn(req.body, req.headers['x-nowpayments-sig'])) {
  const { payment_id, payment_status } = req.body;
}

// Standalone:
import { verifyIpnSignature } from 'nowpayments-node';
verifyIpnSignature(req.body, sig, 'SECRET');
```

### Helpers

```typescript
import {
  isPaymentComplete,
  isPaymentPending,
  getStatusLabel,
  getPaymentSummary,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUSES,
} from 'nowpayments-node';
```

### Errors

```typescript
import { NowPaymentsError } from 'nowpayments-node';

try {
  await np.createPayment({ ... });
} catch (err) {
  if (err instanceof NowPaymentsError) {
    console.log(err.message, err.statusCode);
  }
}
```

---

## 🔗 Links

| Link | URL |
|------|-----|
| **API Docs** | [Postman](https://documenter.getpostman.com/view/7907941/2s93JusNJt) |
| **Sandbox** | [Postman Sandbox](https://documenter.getpostman.com/view/7907941/T1LSCRHC) |
| **Help** | [nowpayments.io/help](https://nowpayments.io/help/payments/api) |
| **Dashboard** | [account.nowpayments.io](https://account.nowpayments.io) |

---

## 📄 License

MIT © [Foisalislambd](https://github.com/Foisalislambd)

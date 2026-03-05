# nowpayments-node

**Full-featured Node.js SDK for [NOWPayments](https://nowpayments.io/)** — accept 300+ cryptocurrencies with auto-conversion to your wallet.

---

## Quick start

```bash
npm install nowpayments-node
```

```typescript
import { NowPayments } from 'nowpayments-node';

const np = new NowPayments({
  apiKey: process.env.NOWPAYMENTS_API_KEY!,
  sandbox: true,  // false for production
});
```

---

## Config

| Option     | Required | Default | Description |
|------------|----------|---------|-------------|
| `apiKey`   | Yes      | —       | From [Dashboard](https://account.nowpayments.io) |
| `sandbox`  | No       | `false` | Use sandbox API |
| `timeout`  | No       | `30000` | Request timeout (ms) |
| `ipnSecret`| No       | —       | For webhook verification |
| `baseUrl`  | No       | —       | Override API URL |

---

## Separate examples

See `examples/` for focused scripts:

| Example | Description |
|---------|-------------|
| `01-create-payment.ts` | Create payment |
| `02-check-payment-status.ts` | Check status |
| `03-list-payments.ts` | List payments |
| `04-create-invoice.ts` | Invoice (redirect) |
| `05-estimate-and-min-amount.ts` | Price estimate |
| `06-get-currencies.ts` | Currencies |
| `07-payout-flow.ts` | Payout flow |
| `08-subscription.ts` | Subscriptions |
| `09-ipn-webhook.ts` | IPN verification |
| `10-custody-and-balance.ts` | Balance, custody, deposit with payment |
| `11-conversions.ts` | Conversions |

```bash
export NOWPAYMENTS_API_KEY=your_key
npx tsx examples/01-create-payment.ts
```

---

## Full method guide (with examples)

### Auth & status

#### `getStatus()`
Check if API is up.

```typescript
const status = await np.getStatus();
// { message: 'OK' }
```

#### `getAuthToken(email, password)`
Get JWT token for payouts, custody, etc. Expires in 5 minutes.

```typescript
const { token } = await np.getAuthToken('your@email.com', 'password');
// Use token with createPayout, verifyPayout, createSubPartner, etc.
```

---

### Currencies

#### `getCurrencies(fixedRate?)`
List all available crypto for payments.

```typescript
const { currencies } = await np.getCurrencies();
// ['btc', 'eth', 'usdt', 'trx', ...]

// With fixed rate min/max:
const { currencies } = await np.getCurrencies(true);
```

#### `getMerchantCoins(fixedRate?)`
Currencies from your dashboard "coins settings".

```typescript
const { currencies } = await np.getMerchantCoins();
```

#### `getCurrency(currency)`
Get single currency details (limits, etc.).

```typescript
const info = await np.getCurrency('btc');
```

#### `getFullCurrencies()`
Get detailed info for all currencies (id, code, name, wallet_regex, network, etc.).

```typescript
const { currencies } = await np.getFullCurrencies();
// currencies[0].code, .name, .wallet_regex, .network
```

---

### Payments (main flow)

#### `createPayment(params)`
Create payment → get address for customer to pay.

```typescript
const payment = await np.createPayment({
  price_amount: 29.99,
  price_currency: 'usd',
  pay_currency: 'btc',
  order_id: 'order-12345',
  order_description: 'Monthly plan',
  ipn_callback_url: 'https://yoursite.com/webhook',  // optional
  is_fixed_rate: true,      // optional
  is_fee_paid_by_user: false,  // optional
});

// Show customer:
console.log(`Pay ${payment.pay_amount} ${payment.pay_currency.toUpperCase()}`);
console.log(`To: ${payment.pay_address}`);
```

#### `getPaymentStatus(paymentId)`
Check if payment received.

```typescript
const payment = await np.getPaymentStatus(5524759814);
console.log(payment.payment_status);  // 'waiting' | 'finished' | 'expired' | ...
```

#### `getPayments(params?)`
List all payments (paginated).

```typescript
const list = await np.getPayments({
  limit: 10,
  page: 0,
  sortBy: 'created_at',
  orderBy: 'desc',
  dateFrom: '2024-01-01',
  dateTo: '2024-12-31',
});
// list.data, list.total, list.pagesCount
```

#### `updatePaymentEstimate(paymentId)`
Refresh amount before expiry (rate may change).

```typescript
const result = await np.updatePaymentEstimate(paymentId);
// result.pay_amount, result.expiration_estimate_date
```

---

### Price & minimum

#### `getEstimatePrice(params)`
Convert fiat → crypto amount.

```typescript
const estimate = await np.getEstimatePrice({
  amount: 100,
  currency_from: 'usd',
  currency_to: 'btc',
});
// estimate.estimated_amount
console.log(`100 USD ≈ ${estimate.estimated_amount} BTC`);
```

#### `getMinAmount(params)`
Get minimum payment for currency pair.

```typescript
const min = await np.getMinAmount({
  currency_from: 'usd',
  currency_to: 'btc',
  fiat_equivalent: 'usd',  // optional
  is_fixed_rate: false,    // optional
  is_fee_paid_by_user: false,  // optional
});
// min.min_amount, min.fiat_equivalent
```

---

### Invoices

#### `createInvoice(params)`
Create invoice → redirect customer to invoice URL.

```typescript
const invoice = await np.createInvoice({
  price_amount: 49.99,
  price_currency: 'usd',
  pay_currency: 'btc',  // optional
  order_id: 'inv-001',
  order_description: 'Premium',
  success_url: 'https://yoursite.com/success',
  cancel_url: 'https://yoursite.com/cancel',
  partially_paid_url: 'https://yoursite.com/partial',  // optional
  is_fixed_rate: true,   // optional
  is_fee_paid_by_user: false,  // optional
});
// invoice.invoice_url → redirect customer here
```

#### `createInvoicePayment(params)`
Create payment for existing invoice.

```typescript
const payment = await np.createInvoicePayment({
  iid: invoiceId,
  pay_currency: 'btc',
  purchase_id: 'purchase-123',
  order_description: 'Item',
  customer_email: 'user@example.com',
});
```

---

### Payouts (JWT required)

#### `validatePayoutAddress(params)`
Check address before payout.

```typescript
try {
  await np.validatePayoutAddress({ address: '0x...', currency: 'eth' });
  // valid
} catch {
  // invalid
}
```

#### `createPayout(params, jwtToken)`
Create mass payout.

```typescript
const { token } = await np.getAuthToken(email, password);

const batch = await np.createPayout({
  ipn_callback_url: 'https://yoursite.com/payout-webhook',
  withdrawals: [
    { address: 'TEmGw...', currency: 'trx', amount: 200 },
    { address: '0x1EB...', currency: 'eth', amount: 0.1 },
  ],
}, token);
// batch.id, batch.withdrawals
```

#### `verifyPayout(payoutId, verificationCode, jwtToken)`
Verify with 2FA (from app or email).

```typescript
await np.verifyPayout(batch.id, '123456', token);
```

#### `cancelPayout(payoutId, jwtToken)`
Cancel a scheduled payout (created with execute_at). Use individual payout id, not batch id.

```typescript
await np.cancelPayout('5000000000', token);
```

#### `getPayoutStatus(payoutId, jwtToken?)`
Get payout status.

```typescript
const status = await np.getPayoutStatus('5000000713', token);
```

#### `getPayouts(params?)`
List crypto payouts.

```typescript
const payouts = await np.getPayouts({
  batch_id: '5000000713',
  status: 'finished',
  limit: 10,
  page: 0,
  order_by: 'dateCreated',
  order: 'desc',
});
```

---

### Fiat Payouts (JWT required)

#### `getFiatPayoutsCryptoCurrencies(params?, jwtToken?)`
Get crypto currencies available for fiat cashout.

```typescript
const { result } = await np.getFiatPayoutsCryptoCurrencies({ provider: 'transfi' }, token);
```

#### `getFiatPayoutsPaymentMethods(params?, jwtToken?)`
Get payment methods for provider + currency.

```typescript
const { result } = await np.getFiatPayoutsPaymentMethods(
  { provider: 'transfi', currency: 'usd' },
  token
);
```

#### `getFiatPayouts(params?, jwtToken?)`
List fiat payouts with filters.

```typescript
const { result } = await np.getFiatPayouts(
  { status: 'FINISHED', limit: 10, dateFrom: '2024-01-01' },
  token
);
// result.rows
```

---

### Balance

#### `getBalance(jwtToken?)`
Get custody balance (currencies + amount).

```typescript
const balance = await np.getBalance(token);
// { eth: { amount: 0.5, pendingAmount: 0 }, trx: { ... } }
```

---

### Subscriptions (recurring)

#### `getSubscriptionPlans(params?)`
List subscription plans.

```typescript
const { result, count } = await np.getSubscriptionPlans({ limit: 10, offset: 0 });
```

#### `getSubscriptionPlan(id)`
Get single plan.

```typescript
const { result } = await np.getSubscriptionPlan('76215585');
```

#### `updateSubscriptionPlan(id, updates)`
Update plan.

```typescript
await np.updateSubscriptionPlan('76215585', {
  amount: 9.99,
  interval_day: '30',
});
```

#### `createSubscription(params, jwtToken)`
Create subscription (email or custody user).

```typescript
// Email subscription:
const { result } = await np.createSubscription({
  subscription_plan_id: 76215585,
  email: 'customer@example.com',
}, token);

// Custody (sub-partner):
const { result } = await np.createSubscription({
  subscription_plan_id: 76215585,
  sub_partner_id: '111394288',
}, token);
```

#### `getSubscriptions(params?)`
List recurring payments.

```typescript
const { result, count } = await np.getSubscriptions({
  status: 'PAID',
  subscription_plan_id: '111394288',
  is_active: true,
  limit: 10,
  offset: 0,
});
```

#### `getSubscription(id)`
Get single subscription.

```typescript
const { result } = await np.getSubscription('1515573197');
```

#### `deleteSubscription(id, jwtToken?)`
Cancel subscription. Pass JWT when API requires it.

```typescript
await np.deleteSubscription('1515573197', token);
```

---

### Custody / Sub-partners (JWT for most)

#### `createSubPartner(name, jwtToken)`
Create new user account.

```typescript
const { result } = await np.createSubPartner('user-123', token);
// result.id, result.name
```

#### `createSubPartnerPayment(params, jwtToken)`
Top up sub-partner balance with a crypto payment (deposit with payment).

```typescript
const { result } = await np.createSubPartnerPayment(
  { currency: 'trx', amount: 50, sub_partner_id: '1631380403', fixed_rate: false },
  token
);
// Show customer: Pay result.pay_amount TRX to result.pay_address
```

#### `getSubPartners(params?, jwtToken?)`
List users.

```typescript
const users = await np.getSubPartners(
  { offset: 0, limit: 10, order: 'DESC' },
  token
);
```

#### `getSubPartnerBalance(subPartnerId)`
Get user balance.

```typescript
const { result } = await np.getSubPartnerBalance('111394288');
// result.balances.usdtbsc.amount
```

#### `createTransfer(params, jwtToken)`
Transfer between user accounts.

```typescript
await np.createTransfer({
  currency: 'trx',
  amount: 0.3,
  from_id: 111394288,
  to_id: 5209391548,
}, token);
```

#### `deposit(params, jwtToken)`
Deposit from master to user.

```typescript
await np.deposit({
  currency: 'trx',
  amount: 0.5,
  sub_partner_id: '111394288',
}, token);
```

#### `writeOff(params, jwtToken)`
Write off from user to master.

```typescript
await np.writeOff({
  currency: 'trx',
  amount: 0.3,
  sub_partner_id: '111394288',
}, token);
```

#### `getTransfers(params?, jwtToken?)`
List transfers.

```typescript
const transfers = await np.getTransfers(
  { status: 'FINISHED', limit: 10, order: 'DESC' },
  token
);
```

#### `getTransfer(id, jwtToken?)`
Get single transfer.

```typescript
const transfer = await np.getTransfer('327209161', token);
```

---

### Conversions (custody, JWT)

#### `createConversion(params, jwtToken)`
Convert within custody account.

```typescript
const result = await np.createConversion({
  amount: 50,
  from_currency: 'usdttrc20',
  to_currency: 'usdterc20',
}, token);
```

#### `getConversionStatus(conversionId, jwtToken)`
Get conversion status.

```typescript
const status = await np.getConversionStatus('1327866232', token);
```

#### `getConversions(params?, jwtToken?)`
List conversions.

```typescript
const list = await np.getConversions({
  status: 'FINISHED',
  limit: 10,
  order: 'DESC',
}, token);
```

---

### IPN / Webhooks

#### `verifyIpn(payload, signature)` or `verifyIpnSignature(...)`
Verify webhook is from NOWPayments.

```typescript
const np = new NowPayments({ apiKey: '...', ipnSecret: 'SECRET' });

// With instance:
if (np.verifyIpn(req.body, req.headers['x-nowpayments-sig'])) {
  const { payment_id, payment_status } = req.body;
  // process...
}

// Standalone:
import { verifyIpnSignature } from 'nowpayments-node';
verifyIpnSignature(req.body, sig, 'SECRET');
```

---

### Helper functions

```typescript
import {
  isPaymentComplete,   // true if finished/failed/refunded/expired
  isPaymentPending,   // true if waiting/confirming/...
  getStatusLabel,     // "Awaiting payment" | "Completed" | ...
  getPaymentSummary,  // "Awaiting payment: 0.001 BTC → bc1q..."
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUSES,
} from 'nowpayments-node';

const payment = await np.getPaymentStatus(id);
console.log(getStatusLabel(payment.payment_status));  // "Completed"
if (isPaymentComplete(payment.payment_status)) {
  // Fulfill order
}
```

---

### Errors

```typescript
import { NowPaymentsError } from 'nowpayments-node';

try {
  await np.createPayment({ ... });
} catch (err) {
  if (err instanceof NowPaymentsError) {
    console.log(err.message);     // "Invalid api key"
    console.log(err.statusCode); // 401
    console.log(err.toString()); // "Invalid api key (status: 401)"
  }
}
```

---

## Links

- [API Docs](https://documenter.getpostman.com/view/7907941/2s93JusNJt)
- [Sandbox](https://documenter.getpostman.com/view/7907941/T1LSCRHC)
- [Help](https://nowpayments.io/help/payments/api)

## License

MIT

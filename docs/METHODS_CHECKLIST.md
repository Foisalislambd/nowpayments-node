# NOWPayments API – Methods Checklist

Based on `copied-docs.md` (official Postman docs). ✅ = implemented in this package.

## Auth & Status

| API | Method | Package | Notes |
|-----|--------|---------|-------|
| GET /v1/status | getStatus | ✅ `getStatus()` | |
| POST /v1/auth | getAuthToken | ✅ `getAuthToken(email, password)` | Returns JWT (expires 5 min) |

## Currencies

| API | Method | Package | Notes |
|-----|--------|---------|-------|
| GET /v1/currencies | getCurrencies | ✅ `getCurrencies(fixedRate?)` | fixed_rate param optional |
| GET /v1/currencies/{currency} | getCurrency | ✅ `getCurrency(currency)` | |
| GET /v1/merchant/coins | getMerchantCoins | ✅ `getMerchantCoins(fixedRate?)` | Coins from dashboard settings |

## Payments

| API | Method | Package | Notes |
|-----|--------|---------|-------|
| GET /v1/min-amount | getMinAmount | ✅ `getMinAmount(params)` | + fiat_equivalent, is_fixed_rate, is_fee_paid_by_user |
| POST /v1/payment/:id/update-merchant-estimate | updatePaymentEstimate | ✅ | |
| GET /v1/estimate | getEstimatePrice | ✅ | |
| POST /v1/payment | createPayment | ✅ | |
| GET /v1/payment/:id | getPaymentStatus | ✅ | |
| GET /v1/payment/ | getPayments | ✅ | |

## Invoices

| API | Method | Package |
|-----|--------|---------|
| POST /v1/invoice | createInvoice | ✅ |
| POST /v1/invoice-payment | createInvoicePayment | ✅ |

## Payouts (JWT required)

| API | Method | Package | Notes |
|-----|--------|---------|-------|
| POST /v1/payout | createPayout | ✅ `createPayout(params, jwtToken)` | |
| POST /v1/payout/:id/verify | verifyPayout | ✅ `verifyPayout(id, verificationCode, jwtToken)` | 2FA code in body |
| GET /v1/payout/:id | getPayoutStatus | ✅ `getPayoutStatus(id, jwtToken?)` | |
| GET /v1/payout | getPayouts | ✅ `getPayouts(params?)` | |
| POST /v1/payout/validate-address | validatePayoutAddress | ✅ | |

## Balance & Custody

| API | Method | Package |
|-----|--------|---------|
| GET /v1/balance | getBalance | ✅ `getBalance(jwtToken?)` |

## Sub-Partner / Custody (JWT for most)

| API | Method | Package |
|-----|--------|---------|
| POST /v1/sub-partner/balance | createSubPartner | ✅ `createSubPartner(name, jwtToken)` |
| POST /v1/sub-partner/payment | createSubPartnerPayment | ✅ `createSubPartnerPayment(params, jwtToken)` |
| GET /v1/sub-partner/balance/:id | getSubPartnerBalance | ✅ |
| GET /v1/sub-partner | getSubPartners | ✅ `getSubPartners(params?, jwtToken?)` |
| GET /v1/sub-partner/transfers | getTransfers | ✅ `getTransfers(params?, jwtToken?)` |
| GET /v1/sub-partner/transfer/:id | getTransfer | ✅ `getTransfer(id, jwtToken?)` |
| POST /v1/sub-partner/transfer | createTransfer | ✅ `createTransfer(params, jwtToken)` |
| POST /v1/sub-partner/write-off | writeOff | ✅ `writeOff(params, jwtToken)` |
| POST /v1/sub-partner/deposit | deposit | ✅ `deposit(params, jwtToken)` |

## Subscriptions (JWT required)

| API | Method | Package |
|-----|--------|---------|
| GET /v1/subscriptions | getSubscriptions | ✅ |
| GET /v1/subscriptions/:id | getSubscription | ✅ |
| DELETE /v1/subscriptions/:id | deleteSubscription | ✅ |
| POST /v1/subscriptions | createSubscription | ✅ `createSubscription(params, jwtToken)` |
| GET /v1/subscriptions/plans | getSubscriptionPlans | ✅ |
| GET /v1/subscriptions/plans/:id | getSubscriptionPlan | ✅ |
| PATCH /v1/subscriptions/plans/:id | updateSubscriptionPlan | ✅ |

## Conversions (JWT required)

| API | Method | Package |
|-----|--------|---------|
| POST /v1/conversion | createConversion | ✅ `createConversion(params, jwtToken)` |
| GET /v1/conversion/:id | getConversionStatus | ✅ `getConversionStatus(id, jwtToken)` |
| GET /v1/conversion | getConversions | ✅ `getConversions(params?, jwtToken?)` |

## IPN & Helpers

| Feature | Package |
|---------|---------|
| verifyIpn / verifyIpnSignature | ✅ |
| createIpnSignature | ✅ |
| isPaymentComplete, getStatusLabel, etc. | ✅ |

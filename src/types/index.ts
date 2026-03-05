/**
 * NOWPayments API Type Definitions
 */

/** Payment status values – use PAYMENT_STATUSES for iteration */
export type PaymentStatus =
  | 'waiting'
  | 'confirming'
  | 'confirmed'
  | 'spending'
  | 'partially_paid'
  | 'finished'
  | 'failed'
  | 'refunded'
  | 'expired';

/** All possible payment statuses (useful for validation) */
export const PAYMENT_STATUSES: readonly PaymentStatus[] = [
  'waiting',
  'confirming',
  'confirmed',
  'spending',
  'partially_paid',
  'finished',
  'failed',
  'refunded',
  'expired',
] as const;

/** Statuses that mean payment is done (success or terminal) */
export const PAYMENT_DONE_STATUSES: PaymentStatus[] = [
  'finished',
  'failed',
  'refunded',
  'expired',
];

/** Statuses that mean customer should still pay */
export const PAYMENT_PENDING_STATUSES: PaymentStatus[] = [
  'waiting',
  'confirming',
  'confirmed',
  'spending',
  'partially_paid',
];

/** Client configuration options */
export interface NowPaymentsConfig {
  /** Your NOWPayments API key (required) */
  apiKey: string;
  /** Use sandbox API (api-sandbox.nowpayments.io) */
  sandbox?: boolean;
  /** Custom base URL (overrides sandbox) */
  baseUrl?: string;
  /** Request timeout in ms */
  timeout?: number;
  /** IPN secret for verifying webhook callbacks */
  ipnSecret?: string;
}

/** Create payment request */
export interface CreatePaymentParams {
  price_amount: number;
  price_currency: string;
  pay_currency: string;
  pay_amount?: number;
  ipn_callback_url?: string;
  order_id?: string;
  order_description?: string;
  purchase_id?: string;
  payout_address?: string;
  payout_currency?: string;
  payout_extra_id?: string;
  fixed_rate?: boolean;
}

/** Create invoice request */
export interface CreateInvoiceParams {
  price_amount: number;
  price_currency: string;
  pay_currency?: string;
  ipn_callback_url?: string;
  order_id?: string;
  order_description?: string;
  success_url?: string;
  cancel_url?: string;
}

/** Payment object from API */
export interface Payment {
  payment_id: number;
  payment_status: PaymentStatus;
  pay_address: string;
  pay_amount: number;
  pay_currency: string;
  price_amount: number;
  price_currency: string;
  actually_paid?: number;
  outcome_amount?: number;
  outcome_currency?: string;
  order_id?: string;
  order_description?: string;
  purchase_id?: string;
  created_at?: string;
  updated_at?: string;
}

/** Paginated payments list */
export interface PaymentsListResponse {
  data: Payment[];
  limit: number;
  page: number;
  pagesCount: number;
  total: number;
}

/** Estimate price response */
export interface EstimatePriceResponse {
  amount_from: number;
  currency_from: string;
  currency_to: string;
  estimated_amount: number;
}

/** Minimum amount response */
export interface MinAmountResponse {
  currency_from: string;
  currency_to: string;
  min_amount: number;
  fiat_equivalent?: number;
}

/** List payments query params */
export interface ListPaymentsParams {
  limit?: number;
  page?: number;
  sortBy?: string;
  orderBy?: 'asc' | 'desc';
  dateFrom?: string;
  dateTo?: string;
}

/** Get estimate params */
export interface EstimateParams {
  amount: number;
  currency_from: string;
  currency_to: string;
}

/** Get min amount params */
export interface MinAmountParams {
  currency_from: string;
  currency_to: string;
  fiat_equivalent?: string;
  is_fixed_rate?: boolean;
  is_fee_paid_by_user?: boolean;
}

/** Invoice response */
export interface InvoiceResponse {
  id: string;
  invoice_id?: string;
  invoice_url: string;
  price_amount: number;
  price_currency: string;
  pay_currency?: string;
  order_id?: string;
  order_description?: string;
  [key: string]: unknown;
}

/** Subscription plan */
export interface SubscriptionPlan {
  id: string;
  amount: number;
  currency: string;
  interval_day: string;
  title: string;
  created_at?: string;
  updated_at?: string;
}

/** Recurring payment/subscription */
export interface RecurringPayment {
  id: string;
  subscription_plan_id: string;
  status: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  expire_date?: string;
  subscriber?: { email?: string; sub_partner_id?: string };
}

/** Sub-partner balance */
export interface SubPartnerBalance {
  subPartnerId: string;
  balances: Record<string, { amount: number; pendingAmount: number }>;
}

/** Payout withdrawal item for createPayout */
export interface PayoutWithdrawal {
  address: string;
  currency: string;
  amount: number;
  extra_id?: string;
  ipn_callback_url?: string;
  payout_description?: string;
  unique_external_id?: string;
  fiat_amount?: number;
  fiat_currency?: string;
}

/** Create payout request body */
export interface CreatePayoutParams {
  ipn_callback_url?: string;
  payout_description?: string;
  withdrawals: PayoutWithdrawal[];
}

/** Auth response (JWT token for payouts, etc.) */
export interface AuthResponse {
  token: string;
}

/** Validate address params */
export interface ValidateAddressParams {
  address: string;
  currency: string;
  extra_id?: string;
}

/** API error response */
export interface ApiErrorResponse {
  message?: string;
  code?: string;
  status?: boolean;
  statusCode?: number;
}

/** API status response (GET /v1/status) */
export interface ApiStatusResponse {
  status?: string;
  message?: string;
  [key: string]: unknown;
}

/**
 * NOWPayments Node.js SDK
 * Full-featured TypeScript client for the NOWPayments cryptocurrency payment API
 *
 * @see https://documenter.getpostman.com/view/7907941/2s93JusNJt
 */

import type { AxiosInstance } from 'axios';
import type {
  NowPaymentsConfig,
  CreatePaymentParams,
  CreateInvoiceParams,
  CreatePayoutParams,
  Payment,
  PaymentsListResponse,
  EstimatePriceResponse,
  MinAmountResponse,
  ListPaymentsParams,
  EstimateParams,
  MinAmountParams,
  InvoiceResponse,
  ApiStatusResponse,
  SubscriptionPlan,
  RecurringPayment,
  SubPartnerBalance,
} from './types';
import { createHttpClient, NowPaymentsError } from './utils/http';
import { verifyIpnSignature, createIpnSignature } from './utils/ipn';
import {
  isPaymentComplete,
  isPaymentPending,
  getStatusLabel,
  getPaymentSummary,
  PAYMENT_STATUS_LABELS,
} from './utils/helpers';

export { NowPaymentsError, verifyIpnSignature, createIpnSignature };
export {
  isPaymentComplete,
  isPaymentPending,
  getStatusLabel,
  getPaymentSummary,
  PAYMENT_STATUS_LABELS,
} from './utils/helpers';
export {
  PAYMENT_STATUSES,
  PAYMENT_DONE_STATUSES,
  PAYMENT_PENDING_STATUSES,
} from './types';
export * from './types';

export class NowPayments {
  private readonly client: AxiosInstance;
  private readonly config: NowPaymentsConfig;

  constructor(config: NowPaymentsConfig) {
    if (!config.apiKey?.trim()) {
      throw new Error(
        'NOWPayments API key is required. Get yours at https://account.nowpayments.io'
      );
    }
    this.config = config;
    this.client = createHttpClient(config);
  }

  /** Check if API is up and available */
  async getStatus(): Promise<ApiStatusResponse> {
    const { data } = await this.client.get<ApiStatusResponse>('/v1/status');
    return data;
  }

  /** Get list of available crypto currencies (e.g. btc, eth, usdt) */
  async getCurrencies(): Promise<{ currencies: string[] }> {
    const { data } = await this.client.get<{ currencies: string[] }>(
      '/v1/currencies'
    );
    return data;
  }

  /** Get single currency details (limits, etc.) */
  async getCurrency(currency: string): Promise<unknown> {
    const { data } = await this.client.get(`/v1/currencies/${currency}`);
    return data;
  }

  /** Get estimated price in crypto for a fiat amount */
  async getEstimatePrice(params: EstimateParams): Promise<EstimatePriceResponse> {
    const { data } = await this.client.get<EstimatePriceResponse>('/v1/estimate', {
      params: {
        amount: params.amount,
        currency_from: params.currency_from,
        currency_to: params.currency_to,
      },
    });
    return data;
  }

  /** Get minimum payment amount for currency pair */
  async getMinAmount(params: MinAmountParams): Promise<MinAmountResponse> {
    const { data } = await this.client.get<MinAmountResponse>('/v1/min-amount', {
      params: {
        currency_from: params.currency_from,
        currency_to: params.currency_to,
      },
    });
    return data;
  }

  /** Create a new payment */
  async createPayment(params: CreatePaymentParams): Promise<Payment> {
    const { data } = await this.client.post<Payment>('/v1/payment', params);
    return data;
  }

  /** Get payment status by ID */
  async getPaymentStatus(paymentId: number | string): Promise<Payment> {
    const { data } = await this.client.get<Payment>(`/v1/payment/${paymentId}`);
    return data;
  }

  /** Get paginated list of payments */
  async getPayments(params?: ListPaymentsParams): Promise<PaymentsListResponse> {
    const { data } = await this.client.get<PaymentsListResponse>('/v1/payment/', {
      params: params ?? {},
    });
    return data;
  }

  /** Update payment estimate (call before expiration) */
  async updatePaymentEstimate(
    paymentId: number | string
  ): Promise<{ pay_amount: number; expiration_estimate_date: string; id: string; token_id: string }> {
    const { data } = await this.client.post(
      `/v1/payment/${paymentId}/update-merchant-estimate`
    );
    return data;
  }

  /** Create an invoice (redirect flow) */
  async createInvoice(params: CreateInvoiceParams): Promise<InvoiceResponse> {
    const { data } = await this.client.post<InvoiceResponse>('/v1/invoice', params);
    return data;
  }

  /** Create payment for existing invoice */
  async createInvoicePayment(params: {
    iid: number | string;
    pay_currency?: string;
    purchase_id?: string;
    order_description?: string;
    customer_email?: string;
    payout_address?: string;
    payout_extra_id?: string;
    payout_currency?: string;
  }): Promise<Payment> {
    const { data } = await this.client.post<Payment>('/v1/invoice-payment', params);
    return data;
  }

  // --- Recurring Payments (Subscriptions) ---

  /** List all recurring payments */
  async getSubscriptions(): Promise<{ count: number; result: RecurringPayment[] }> {
    const { data } = await this.client.get<{
      count: number;
      result: RecurringPayment[];
    }>('/v1/subscriptions');
    return data;
  }

  /** Get single recurring payment */
  async getSubscription(id: string): Promise<{ result: RecurringPayment }> {
    const { data } = await this.client.get<{ result: RecurringPayment }>(
      `/v1/subscriptions/${id}`
    );
    return data;
  }

  /** Cancel recurring payment */
  async deleteSubscription(id: string): Promise<{ result: string }> {
    const { data } = await this.client.delete<{ result: string }>(
      `/v1/subscriptions/${id}`
    );
    return data;
  }

  /** List subscription plans */
  async getSubscriptionPlans(): Promise<{
    count: number;
    result: SubscriptionPlan[];
  }> {
    const { data } = await this.client.get<{
      count: number;
      result: SubscriptionPlan[];
    }>('/v1/subscriptions/plans');
    return data;
  }

  /** Get single subscription plan */
  async getSubscriptionPlan(
    id: string
  ): Promise<{ result: SubscriptionPlan }> {
    const { data } = await this.client.get<{ result: SubscriptionPlan }>(
      `/v1/subscriptions/plans/${id}`
    );
    return data;
  }

  /** Update subscription plan */
  async updateSubscriptionPlan(
    id: string,
    updates: Partial<SubscriptionPlan>
  ): Promise<unknown> {
    const { data } = await this.client.patch(
      `/v1/subscriptions/plans/${id}`,
      updates
    );
    return data;
  }

  // --- Sub-Partner / Customer Management ---

  /** List sub-partners */
  async getSubPartners(): Promise<unknown> {
    const { data } = await this.client.get('/v1/sub-partner');
    return data;
  }

  /** Get sub-partner balance */
  async getSubPartnerBalance(
    subPartnerId: string
  ): Promise<{ result: SubPartnerBalance }> {
    const { data } = await this.client.get<{ result: SubPartnerBalance }>(
      `/v1/sub-partner/balance/${subPartnerId}`
    );
    return data;
  }

  /** List transfers */
  async getTransfers(): Promise<unknown> {
    const { data } = await this.client.get('/v1/sub-partner/transfers');
    return data;
  }

  /** Get single transfer */
  async getTransfer(id: string): Promise<unknown> {
    const { data } = await this.client.get(
      `/v1/sub-partner/transfer/${id}`
    );
    return data;
  }

  /**
   * Create mass payout. Requires JWT token (get from Mass Payouts / auth flow).
   * Pass jwtToken when you have it.
   */
  async createPayout(
    params: CreatePayoutParams,
    jwtToken?: string
  ): Promise<unknown> {
    const config = jwtToken
      ? { headers: { Authorization: `Bearer ${jwtToken}` } }
      : {};
    const { data } = await this.client.post('/v1/payout', params, config);
    return data;
  }

  /** Verify payout by ID */
  async verifyPayout(payoutId: string): Promise<string> {
    const { data } = await this.client.post<string>(
      `/v1/payout/${payoutId}/verify`
    );
    return data as string;
  }

  /** Verify IPN callback (convenience using config ipnSecret) */
  verifyIpn(payload: string | Record<string, unknown>, signature: string): boolean {
    const secret = this.config.ipnSecret;
    if (!secret) {
      throw new Error(
        'IPN secret not configured. Pass ipnSecret in constructor or use verifyIpnSignature() with explicit secret.'
      );
    }
    return verifyIpnSignature(payload, signature, secret);
  }
}

export default NowPayments;

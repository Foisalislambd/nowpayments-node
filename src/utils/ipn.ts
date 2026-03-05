/**
 * IPN (Instant Payment Notification) verification utilities
 * @see https://nowpayments.io/help/payments/api
 */

import * as crypto from 'crypto';

/**
 * Verify IPN callback signature from NOWPayments.
 * Safe to call – handles invalid input gracefully.
 *
 * @param payload - Raw request body (string or parsed object)
 * @param signature - Value from x-nowpayments-sig header
 * @param ipnSecret - Your IPN Secret from Dashboard → Store Settings
 * @returns true if signature is valid, false otherwise
 */
export function verifyIpnSignature(
  payload: string | Record<string, unknown>,
  signature: string,
  ipnSecret: string
): boolean {
  if (!signature?.trim() || !ipnSecret?.trim()) {
    return false;
  }

  try {
    let jsonString: string;
    if (typeof payload === 'string') {
      const parsed = JSON.parse(payload) as Record<string, unknown>;
      jsonString = JSON.stringify(parsed, Object.keys(parsed).sort());
    } else if (payload && typeof payload === 'object') {
      jsonString = JSON.stringify(payload, Object.keys(payload).sort());
    } else {
      return false;
    }

    const hmac = crypto.createHmac('sha512', ipnSecret.trim());
    hmac.update(jsonString);
    const computedSig = hmac.digest('hex');

    const sigBuf = Buffer.from(signature, 'hex');
    const computedBuf = Buffer.from(computedSig, 'hex');
    if (sigBuf.length !== computedBuf.length) return false;

    return crypto.timingSafeEqual(sigBuf, computedBuf);
  } catch {
    return false;
  }
}

/**
 * Create IPN signature for testing (e.g., mocking callbacks)
 */
export function createIpnSignature(
  payload: Record<string, unknown>,
  ipnSecret: string
): string {
  const jsonString = JSON.stringify(payload, Object.keys(payload).sort());
  const hmac = crypto.createHmac('sha512', ipnSecret.trim());
  hmac.update(jsonString);
  return hmac.digest('hex');
}

/**
 * Example: Balance + custody (sub-partner, deposit, transfer)
 * Run: npx tsx examples/10-custody-and-balance.ts
 */
import { NowPayments } from '../src';

const np = new NowPayments({
  apiKey: process.env.NOWPAYMENTS_API_KEY!,
  sandbox: true,
});

async function main() {
  // Balance
  const balance = await np.getBalance();
  console.log('Balance:', balance);

  // Sub-partners (if using custody)
  const partners = await np.getSubPartners();
  console.log('Sub-partners:', partners);
}

main().catch(console.error);

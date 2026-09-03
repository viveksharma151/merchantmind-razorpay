import Razorpay from 'razorpay';

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || '';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '';

export const IS_MOCK_MODE =
  !RAZORPAY_KEY_ID ||
  !RAZORPAY_KEY_SECRET ||
  RAZORPAY_KEY_ID === 'rzp_test_your_key_here';

let razorpayClient: Razorpay | null = null;

if (!IS_MOCK_MODE) {
  try {
    razorpayClient = new Razorpay({
      key_id: RAZORPAY_KEY_ID,
      key_secret: RAZORPAY_KEY_SECRET,
    });
  } catch (err) {
    console.warn('[Razorpay] Failed to initialize client. Running in Mock Mode.', err);
  }
}

export async function createRazorpayOrder(params: {
  amount: number; // in INR
  currency?: string;
  receipt: string;
  notes?: Record<string, string>;
}): Promise<{
  id: string;
  amount: number;
  amount_due: number;
  currency: string;
  receipt: string;
  status: string;
  notes?: Record<string, string>;
  mock: boolean;
  created_at: number;
}> {
  const amountPaise = Math.round(params.amount * 100);
  const currency = params.currency || 'INR';

  if (IS_MOCK_MODE || !razorpayClient) {
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 9);
    return {
      id: `order_mock_${randomSuffix}`,
      amount: amountPaise,
      amount_due: amountPaise,
      currency,
      receipt: params.receipt,
      status: 'created',
      notes: params.notes,
      mock: true,
      created_at: Math.floor(timestamp / 1000),
    };
  }

  const order = await razorpayClient.orders.create({
    amount: amountPaise,
    currency,
    receipt: params.receipt,
    notes: params.notes,
  });

  return {
    id: order.id,
    amount: Number(order.amount),
    amount_due: Number(order.amount_due),
    currency: order.currency,
    receipt: order.receipt || params.receipt,
    status: order.status,
    notes: order.notes as Record<string, string> | undefined,
    mock: false,
    created_at: order.created_at,
  };
}

export async function createRazorpayPaymentLink(params: {
  amount: number; // in INR
  description: string;
  productName?: string;
}): Promise<{
  id: string;
  short_url: string;
  amount: number;
  description: string;
  status: string;
  mock: boolean;
}> {
  const amountPaise = Math.round(params.amount * 100);
  const randomSuffix = Math.random().toString(36).substring(2, 8);

  if (IS_MOCK_MODE || !razorpayClient) {
    return {
      id: `plink_mock_${randomSuffix}`,
      short_url: `https://rzp.io/l/mock_${randomSuffix}`,
      amount: amountPaise,
      description: params.description,
      status: 'created',
      mock: true,
    };
  }

  const link = await razorpayClient.paymentLink.create({
    amount: amountPaise,
    currency: 'INR',
    description: params.description,
    notify: {
      sms: true,
      email: true,
    },
  });

  return {
    id: link.id,
    short_url: link.short_url,
    amount: Number(link.amount),
    description: link.description || params.description,
    status: link.status,
    mock: false,
  };
}

export function getRazorpayPublicConfig() {
  return {
    key_id: IS_MOCK_MODE ? 'rzp_test_demo' : RAZORPAY_KEY_ID,
    mock_mode: IS_MOCK_MODE,
  };
}

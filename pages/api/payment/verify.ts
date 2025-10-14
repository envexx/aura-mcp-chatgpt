import { NextApiRequest, NextApiResponse } from 'next';
import { X402PaymentManager } from '../../../lib/x402-payment';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { paymentId } = req.body;

    if (!paymentId) {
      return res.status(400).json({ 
        error: 'Missing paymentId parameter'
      });
    }

    const paymentManager = new X402PaymentManager();
    const verification = await paymentManager.verifyPayment(paymentId);

    const response = {
      success: true,
      verification: {
        paymentId,
        isPaid: verification.isPaid,
        status: verification.isPaid ? 'COMPLETED' : 'PENDING',
        transactionHash: verification.transactionHash,
        paidAt: verification.paidAt
      },
      message: verification.isPaid 
        ? '✅ Payment verified successfully! You can now access premium features.'
        : '⏳ Payment is still pending. Please complete the transaction and try again.',
      nextSteps: verification.isPaid 
        ? [
            'You now have access to premium features',
            'Use the original API endpoint to access the service',
            'Payment is valid for 24 hours'
          ]
        : [
            'Complete the payment using the provided QR code or payment URL',
            'Wait for blockchain confirmation (usually 1-2 minutes)',
            'Retry verification after payment is sent'
          ]
    };

    res.status(200).json(response);

  } catch (error: any) {
    console.error('Error verifying payment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify payment',
      details: error.message
    });
  }
}

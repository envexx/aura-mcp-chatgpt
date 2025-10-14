import { NextApiRequest, NextApiResponse } from 'next';
import { X402PaymentManager, SERVICE_PRICING } from '../../../lib/x402-payment';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { walletAddress, service } = req.body;

    if (!walletAddress || !service) {
      return res.status(400).json({ 
        error: 'Missing required parameters',
        required: ['walletAddress', 'service']
      });
    }

    if (!(service in SERVICE_PRICING)) {
      return res.status(400).json({ 
        error: 'Invalid service',
        validServices: Object.keys(SERVICE_PRICING)
      });
    }

    const paymentManager = new X402PaymentManager();
    
    const paymentResponse = await paymentManager.createPayment({
      amount: SERVICE_PRICING[service as keyof typeof SERVICE_PRICING],
      service: service as keyof typeof SERVICE_PRICING,
      userAddress: walletAddress,
      sessionId: `session_${Date.now()}`
    });

    if (!paymentResponse.success) {
      return res.status(500).json({
        success: false,
        error: 'Failed to create payment',
        details: paymentResponse.error
      });
    }

    res.status(200).json({
      success: true,
      payment: {
        paymentId: paymentResponse.paymentId,
        qrCode: paymentResponse.qrCode,
        paymentUrl: paymentResponse.paymentUrl,
        amount: SERVICE_PRICING[service as keyof typeof SERVICE_PRICING],
        currency: 'USDC',
        service: service,
        recipient: '0xd3a12CA02256CD74AD8659974cfF36f62Aa0485c',
        expiresAt: paymentResponse.expiresAt,
        instructions: `💳 Payment Required for ${service.replace('_', ' ').toUpperCase()}
        
Amount: ${SERVICE_PRICING[service as keyof typeof SERVICE_PRICING]} USDC
Service: ${service.replace('_', ' ').toUpperCase()}

To complete payment:
1. Scan the QR code with your wallet
2. Or visit the payment URL
3. Send exactly ${SERVICE_PRICING[service as keyof typeof SERVICE_PRICING]} USDC
4. Use the verify endpoint to confirm payment

Payment ID: ${paymentResponse.paymentId}`
      }
    });

  } catch (error: any) {
    console.error('Error creating payment:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
}

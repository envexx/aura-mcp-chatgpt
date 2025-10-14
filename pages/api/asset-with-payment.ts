import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { requirePayment } from '../../lib/x402-payment';
import { config } from '../../lib/config';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { address } = req.query;

    if (!address || typeof address !== 'string') {
      return res.status(400).json({ error: 'Wallet address is required' });
    }

    // 🔐 Check x402 payment requirement
    const paymentCheck = await requirePayment(address, 'portfolio_analysis');
    
    if (!paymentCheck.authorized) {
      return res.status(402).json({
        error: 'Payment Required',
        message: paymentCheck.message,
        payment: paymentCheck.paymentResponse,
        service: 'portfolio_analysis',
        amount: 0.001,
        currency: 'USDC'
      });
    }

    // ✅ Payment verified, proceed with service
    const auraApiUrl = config.auraApiUrl;
    const response = await axios.get(`${auraApiUrl}/asset?address=${address}`);
    
    // Add payment confirmation to response
    const enhancedResponse = {
      ...response.data,
      payment: {
        status: 'verified',
        service: 'portfolio_analysis',
        message: '✅ Payment verified - Premium analysis enabled'
      }
    };

    res.status(200).json(enhancedResponse);

  } catch (error: any) {
    console.error('Error in asset endpoint:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch portfolio data',
      details: error.message
    });
  }
}

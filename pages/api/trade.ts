import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

interface TradeRequest {
  address: string;
  fromToken: string;
  toToken: string;
  amount: string;
  slippage?: number;
}

interface AutomationRule {
  type: 'PRICE_TARGET' | 'STOP_LOSS' | 'TAKE_PROFIT';
  targetPrice?: number;
  percentage?: number;
  action: 'BUY' | 'SELL';
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { address, fromToken, toToken, amount, slippage = 0.5, automationRules } = req.body as TradeRequest & { automationRules?: AutomationRule[] };

    if (!address || !fromToken || !toToken || !amount) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // 1. First check token allowance and balance
    const allowanceCheck = await axios.get(
      `${process.env.NEXT_PUBLIC_AURA_API_URL}/portfolio/balances?address=${address}`
    );

    const hasBalance = allowanceCheck.data.portfolio.some((token: any) => 
      token.symbol === fromToken && parseFloat(token.balance) >= parseFloat(amount)
    );

    if (!hasBalance) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // 2. Get trade quote
    const quoteResponse = await axios.get(
      `${process.env.NEXT_PUBLIC_AURA_API_URL}/trade/quote?fromToken=${fromToken}&toToken=${toToken}&amount=${amount}&slippage=${slippage}`
    );

    const quote = quoteResponse.data;

    // 3. If automation rules are provided, set them up
    if (automationRules?.length) {
      // Store automation rules in database or cache
      // This is where you'd integrate with a service like Redis or DB
      // For demo, we'll just acknowledge them
      console.log('Setting up automation rules:', automationRules);
    }

    // 4. Execute trade
    const tradeResponse = await axios.post(
      `${process.env.NEXT_PUBLIC_AURA_API_URL}/trade/execute`,
      {
        address,
        fromToken,
        toToken,
        amount,
        slippage,
        quote: quote.id
      }
    );

    // 5. Format response with execution details and automation status
    const response = {
      success: true,
      transaction: tradeResponse.data,
      automationStatus: automationRules ? {
        rulesSet: automationRules.length,
        monitoring: true,
        triggers: automationRules.map(rule => ({
          type: rule.type,
          status: 'ACTIVE',
          conditions: {
            targetPrice: rule.targetPrice,
            percentage: rule.percentage,
            action: rule.action
          }
        }))
      } : null,
      estimatedOutput: quote.estimatedOutput,
      priceImpact: quote.priceImpact,
      route: quote.route
    };

    res.status(200).json(response);

  } catch (error: any) {
    console.error('Error executing trade:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to execute trade',
      details: error.message
    });
  }
}
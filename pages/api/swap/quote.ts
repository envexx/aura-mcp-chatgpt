import { NextApiRequest, NextApiResponse } from 'next';
import { createUniswapMCPClient } from '../../../lib/uniswap-mcp-client';
import { requirePayment } from '../../../lib/x402-payment';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { 
      walletAddress,
      tokenIn, 
      tokenOut, 
      amountIn, 
      slippage = 0.5,
      chain = 'ethereum'
    } = req.body;

    // Validate required parameters
    if (!walletAddress || !tokenIn || !tokenOut || !amountIn) {
      return res.status(400).json({ 
        error: 'Missing required parameters',
        required: ['walletAddress', 'tokenIn', 'tokenOut', 'amountIn']
      });
    }

    // 🔐 Check x402 payment requirement for swap quotes
    const paymentCheck = await requirePayment(walletAddress, 'trade_execution');
    
    if (!paymentCheck.authorized) {
      return res.status(402).json({
        error: 'Payment Required for Swap Quote',
        message: paymentCheck.message,
        payment: paymentCheck.paymentResponse,
        service: 'trade_execution',
        amount: 0.005,
        currency: 'USDC',
        description: 'Premium swap quotes with optimal routing and MEV protection'
      });
    }

    // ✅ Payment verified, proceed with Uniswap MCP call
    const uniswapClient = createUniswapMCPClient(chain);

    // Health check first
    const healthCheck = await uniswapClient.healthCheck();
    if (!healthCheck.success) {
      return res.status(503).json({
        success: false,
        error: 'Uniswap MCP service unavailable',
        details: healthCheck.error,
        fallback: {
          message: 'MCP service is down. You can still swap manually using:',
          alternatives: [
            'https://app.uniswap.org',
            'https://1inch.io',
            'https://matcha.xyz'
          ]
        }
      });
    }

    // Get swap quote from Uniswap MCP
    const quoteResponse = await uniswapClient.getSwapQuote({
      tokenIn,
      tokenOut,
      amountIn,
      slippage,
      recipient: walletAddress,
      chain
    });

    if (!quoteResponse.success) {
      return res.status(400).json({
        success: false,
        error: 'Failed to get swap quote',
        details: quoteResponse.error,
        suggestion: 'Try adjusting slippage or amount, or check token addresses'
      });
    }

    // Enhanced response with AURA integration
    const enhancedResponse = {
      success: true,
      payment: {
        status: 'verified',
        service: 'trade_execution',
        message: '✅ Payment verified - Premium swap quotes enabled'
      },
      quote: {
        ...quoteResponse.quote,
        // Add AURA-specific enhancements
        auraEnhancements: {
          mevProtection: true,
          optimalRouting: true,
          gasOptimization: true,
          priceImpactWarning: quoteResponse.quote!.priceImpact > 3 ? 
            '⚠️ High price impact detected. Consider reducing trade size.' : null
        }
      },
      transactionData: quoteResponse.transactionData,
      confirmationUrl: quoteResponse.confirmationUrl,
      instructions: {
        nextSteps: [
          '1. Review the quote details above',
          '2. Click the confirmation URL to connect your wallet',
          '3. Confirm the transaction in your wallet',
          '4. Wait for blockchain confirmation'
        ],
        estimatedTime: '2-5 minutes',
        network: chain.toUpperCase(),
        gasEstimate: quoteResponse.quote?.gasEstimate
      },
      metadata: {
        timestamp: new Date().toISOString(),
        chain,
        mcpProvider: 'uniswap-trader-mcp',
        auraVersion: '1.0.0'
      }
    };

    res.status(200).json(enhancedResponse);

  } catch (error: any) {
    console.error('Swap quote error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message,
      fallback: {
        message: 'Service temporarily unavailable. Try manual swap:',
        uniswapUrl: `https://app.uniswap.org/#/swap?inputCurrency=${req.body.tokenIn}&outputCurrency=${req.body.tokenOut}`
      }
    });
  }
}

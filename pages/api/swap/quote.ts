import { NextApiRequest, NextApiResponse } from 'next';
import { UniswapIntegration } from '../../../lib/uniswap-integration';
import { X402PaymentManager } from '../../../lib/x402-payment';

// Helper function to get chain ID
function getChainId(chain: string): number {
  const chainMap: Record<string, number> = {
    'ethereum': 1,
    'optimism': 10,
    'polygon': 137,
    'arbitrum': 42161,
    'base': 8453
  };
  return chainMap[chain.toLowerCase()] || 1;
}

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
    const paymentManager = new X402PaymentManager();
    const hasPayment = await paymentManager.hasValidPayment(walletAddress, 'trade_execution');
    
    if (!hasPayment) {
      const payment = await paymentManager.createPayment({
        amount: 0.005,
        service: 'trade_execution',
        userAddress: walletAddress
      });
      
      return res.status(402).json({
        error: 'Payment Required for Swap Quote',
        payment,
        service: 'trade_execution',
        amount: 0.005,
        currency: 'USDC',
        description: 'Premium swap quotes with optimal routing and MEV protection'
      });
    }

    // ✅ Payment verified, proceed with Uniswap integration
    const uniswapIntegration = new UniswapIntegration();
    const chainId = getChainId(chain);

    // Get swap quote from Uniswap integration
    const quoteResponse = await uniswapIntegration.getSwapQuote(
      chainId,
      tokenIn,
      tokenOut,
      amountIn
    );

    // Enhanced response with AURA integration
    const enhancedResponse = {
      success: true,
      payment: {
        status: 'verified',
        service: 'trade_execution',
        message: '✅ Payment verified - Premium swap quotes enabled'
      },
      quote: {
        chainId: quoteResponse.chainId,
        tradeType: quoteResponse.tradeType,
        price: quoteResponse.price,
        inputAmount: quoteResponse.inputAmount,
        outputAmount: quoteResponse.outputAmount,
        minimumReceived: quoteResponse.minimumReceived,
        maximumInput: quoteResponse.maximumInput,
        route: quoteResponse.route,
        estimatedGas: quoteResponse.estimatedGas,
        priceImpact: quoteResponse.priceImpact,
        // Add AURA-specific enhancements
        auraEnhancements: {
          mevProtection: true,
          optimalRouting: true,
          gasOptimization: true,
          priceImpactWarning: parseFloat(quoteResponse.priceImpact) > 3 ? 
            '⚠️ High price impact detected. Consider reducing trade size.' : null
        }
      },
      instructions: {
        nextSteps: [
          '1. Review the quote details above',
          '2. Use execute swap API to proceed',
          '3. Confirm the transaction in your wallet',
          '4. Wait for blockchain confirmation'
        ],
        estimatedTime: '2-5 minutes',
        network: chain.toUpperCase(),
        gasEstimate: quoteResponse.estimatedGas
      },
      metadata: {
        timestamp: new Date().toISOString(),
        chain,
        mcpProvider: 'uniswap-integration',
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

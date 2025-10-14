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
      amountOutMin,
      slippage = 0.5,
      deadline = 1800,
      chain = 'ethereum'
    } = req.body;

    // Validate required parameters
    if (!walletAddress || !tokenIn || !tokenOut || !amountIn || !amountOutMin) {
      return res.status(400).json({ 
        error: 'Missing required parameters',
        required: ['walletAddress', 'tokenIn', 'tokenOut', 'amountIn', 'amountOutMin']
      });
    }

    // 🔐 Check x402 payment requirement for swap execution
    const paymentManager = new X402PaymentManager();
    const hasPayment = await paymentManager.hasValidPayment(walletAddress, 'trade_execution');
    
    if (!hasPayment) {
      const payment = await paymentManager.createPayment({
        amount: 0.005,
        service: 'trade_execution',
        userAddress: walletAddress
      });
      
      return res.status(402).json({
        error: 'Payment Required for Swap Execution',
        payment,
        service: 'trade_execution',
        amount: 0.005,
        currency: 'USDC'
      });
    }

    // ✅ Payment verified, proceed with swap execution
    const uniswapIntegration = new UniswapIntegration();
    const chainId = getChainId(chain);

    // Execute swap through Uniswap integration
    const executionResponse = await uniswapIntegration.executeSwap(
      chainId,
      tokenIn,
      tokenOut,
      amountIn,
      undefined,
      'exactIn',
      slippage,
      Math.floor(deadline / 60),
      process.env.WALLET_PRIVATE_KEY
    );

    // Enhanced response with AURA tracking
    const enhancedResponse = {
      success: true,
      payment: {
        status: 'verified',
        service: 'trade_execution',
        message: '✅ Payment verified - Swap executed successfully'
      },
      execution: {
        transactionHash: executionResponse.txHash,
        status: 'pending',
        estimatedConfirmation: '2-5 minutes'
      },
      trade: {
        tokenIn,
        tokenOut,
        amountIn: executionResponse.amountIn,
        amountOut: executionResponse.outputAmount,
        slippage,
        chain,
        timestamp: new Date().toISOString()
      },
      nextSteps: [
        '✅ Transaction submitted to blockchain',
        '⏳ Waiting for confirmation...',
        '🔍 Track progress using the transaction hash',
        '📱 You will receive confirmation once complete'
      ],
      links: {
        explorer: `https://etherscan.io/tx/${executionResponse.txHash}`,
        support: `${process.env.NEXT_PUBLIC_API_URL}/support?tx=${executionResponse.txHash}`
      },
      metadata: {
        mcpProvider: 'uniswap-integration',
        auraVersion: '1.0.0',
        executedAt: new Date().toISOString()
      }
    };

    res.status(200).json(enhancedResponse);

  } catch (error: any) {
    console.error('Swap execution error:', error);
    res.status(500).json({
      success: false,
      error: 'Swap execution failed',
      details: error.message,
      recovery: {
        message: 'Transaction may have failed. Please check your wallet and try again.',
        checkSteps: [
          'Check your wallet for any pending transactions',
          'Verify you have sufficient balance and gas',
          'Try reducing the trade amount or increasing slippage',
          'Contact support if the issue persists'
        ]
      }
    });
  }
}

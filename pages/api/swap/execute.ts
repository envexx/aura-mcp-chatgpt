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
    const paymentCheck = await requirePayment(walletAddress, 'trade_execution');
    
    if (!paymentCheck.authorized) {
      return res.status(402).json({
        error: 'Payment Required for Swap Execution',
        message: paymentCheck.message,
        payment: paymentCheck.paymentResponse,
        service: 'trade_execution',
        amount: 0.005,
        currency: 'USDC'
      });
    }

    // ✅ Payment verified, proceed with swap execution
    const uniswapClient = createUniswapMCPClient(chain);

    // Execute swap through Uniswap MCP
    const executionResponse = await uniswapClient.executeSwap({
      tokenIn,
      tokenOut,
      amountIn,
      amountOutMin,
      recipient: walletAddress,
      deadline,
      slippage,
      chain
    });

    if (!executionResponse.success) {
      return res.status(400).json({
        success: false,
        error: 'Swap execution failed',
        details: executionResponse.error,
        fallback: {
          message: 'Automatic execution failed. You can complete the swap manually:',
          manualSteps: [
            '1. Go to https://app.uniswap.org',
            '2. Connect your wallet',
            `3. Swap ${amountIn} ${tokenIn} for ${tokenOut}`,
            `4. Set slippage to ${slippage}%`,
            '5. Confirm the transaction'
          ]
        }
      });
    }

    // Enhanced response with AURA tracking
    const enhancedResponse = {
      success: true,
      payment: {
        status: 'verified',
        service: 'trade_execution',
        message: '✅ Payment verified - Swap executed successfully'
      },
      execution: {
        transactionHash: executionResponse.transactionHash,
        confirmationUrl: executionResponse.confirmationUrl,
        explorerUrl: executionResponse.explorerUrl,
        status: 'pending',
        estimatedConfirmation: '2-5 minutes'
      },
      trade: {
        tokenIn,
        tokenOut,
        amountIn,
        amountOutMin,
        slippage,
        chain,
        timestamp: new Date().toISOString()
      },
      nextSteps: [
        '✅ Transaction submitted to blockchain',
        '⏳ Waiting for confirmation...',
        '🔍 Track progress using the explorer URL',
        '📱 You will receive confirmation once complete'
      ],
      links: {
        explorer: executionResponse.explorerUrl,
        confirmation: executionResponse.confirmationUrl,
        support: `${process.env.NEXT_PUBLIC_API_URL}/support?tx=${executionResponse.transactionHash}`
      },
      metadata: {
        mcpProvider: 'uniswap-trader-mcp',
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

import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

interface RebalanceRequest {
  address: string;
  targetAllocations: {
    [token: string]: number; // percentage allocation
  };
  slippage?: number;
  executeImmediately?: boolean;
}

interface TokenBalance {
  symbol: string;
  balance: string;
  value: number;
  address: string;
}

interface RebalanceStep {
  action: 'SELL' | 'BUY';
  fromToken: string;
  toToken: string;
  amount: string;
  percentage: number;
  estimatedOutput?: string;
  route?: string;
  priceImpact?: number;
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
      address, 
      targetAllocations, 
      slippage = 1.0, 
      executeImmediately = false 
    } = req.body as RebalanceRequest;

    if (!address || !targetAllocations) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // Validate target allocations sum to 100%
    const totalAllocation = Object.values(targetAllocations).reduce((sum, pct) => sum + pct, 0);
    if (Math.abs(totalAllocation - 100) > 0.01) {
      return res.status(400).json({ 
        error: 'Target allocations must sum to 100%',
        currentSum: totalAllocation 
      });
    }

    const auraApiUrl = process.env.NEXT_PUBLIC_AURA_API_URL || 'https://aura.adex.network/api';

    // 1. Get current portfolio
    const portfolioResponse = await axios.get(`${auraApiUrl}/portfolio/balances?address=${address}`);
    const currentPortfolio: TokenBalance[] = portfolioResponse.data.portfolio || [];
    
    if (!currentPortfolio.length) {
      return res.status(400).json({ error: 'No portfolio found for address' });
    }

    const totalPortfolioValue = currentPortfolio.reduce((sum, token) => sum + token.value, 0);

    // 2. Calculate required rebalancing steps
    const rebalanceSteps: RebalanceStep[] = [];
    const currentAllocations: { [token: string]: number } = {};

    // Calculate current allocations
    currentPortfolio.forEach(token => {
      currentAllocations[token.symbol] = (token.value / totalPortfolioValue) * 100;
    });

    // Calculate what needs to be bought/sold
    const tokensToSell: { [token: string]: number } = {};
    const tokensToBuy: { [token: string]: number } = {};

    for (const [token, targetPct] of Object.entries(targetAllocations)) {
      const currentPct = currentAllocations[token] || 0;
      const difference = targetPct - currentPct;
      
      if (difference > 0.5) { // Need to buy more (threshold to avoid tiny trades)
        tokensToBuy[token] = (difference / 100) * totalPortfolioValue;
      } else if (difference < -0.5) { // Need to sell some
        tokensToSell[token] = Math.abs(difference / 100) * totalPortfolioValue;
      }
    }

    // 3. Create rebalancing steps
    // First, sell overweight tokens
    for (const [sellToken, sellValue] of Object.entries(tokensToSell)) {
      const tokenBalance = currentPortfolio.find(t => t.symbol === sellToken);
      if (!tokenBalance) continue;

      const sellAmount = (sellValue / tokenBalance.value) * parseFloat(tokenBalance.balance);
      
      // For simplicity, convert everything to USDC first
      rebalanceSteps.push({
        action: 'SELL',
        fromToken: sellToken,
        toToken: 'USDC',
        amount: sellAmount.toString(),
        percentage: (sellValue / totalPortfolioValue) * 100
      });
    }

    // Then, buy underweight tokens
    for (const [buyToken, buyValue] of Object.entries(tokensToBuy)) {
      rebalanceSteps.push({
        action: 'BUY',
        fromToken: 'USDC',
        toToken: buyToken,
        amount: buyValue.toString(),
        percentage: (buyValue / totalPortfolioValue) * 100
      });
    }

    // 4. Get quotes for each step
    const stepsWithQuotes = await Promise.all(
      rebalanceSteps.map(async (step) => {
        try {
          const quoteResponse = await axios.get(
            `${auraApiUrl}/trade/quote?fromToken=${step.fromToken}&toToken=${step.toToken}&amount=${step.amount}&slippage=${slippage}`
          );
          
          return {
            ...step,
            estimatedOutput: quoteResponse.data.estimatedOutput,
            route: quoteResponse.data.route,
            priceImpact: quoteResponse.data.priceImpact
          };
        } catch (error) {
          console.error(`Failed to get quote for ${step.fromToken} -> ${step.toToken}:`, error);
          return step;
        }
      })
    );

    // 5. Execute trades if requested
    let executionResults = null;
    if (executeImmediately) {
      executionResults = [];
      
      for (const step of stepsWithQuotes) {
        try {
          const tradeResponse = await axios.post(`${auraApiUrl}/trade/execute`, {
            address,
            fromToken: step.fromToken,
            toToken: step.toToken,
            amount: step.amount,
            slippage
          });
          
          executionResults.push({
            step,
            result: tradeResponse.data,
            status: 'SUCCESS'
          });
          
          // Add delay between trades to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000));
          
        } catch (error: any) {
          console.error(`Failed to execute trade ${step.fromToken} -> ${step.toToken}:`, error);
          executionResults.push({
            step,
            error: error.message,
            status: 'FAILED'
          });
        }
      }
    }

    // 6. Generate manual instructions as fallback
    const manualInstructions = stepsWithQuotes.map((step, index) => ({
      stepNumber: index + 1,
      instruction: `${step.action} ${step.amount} ${step.fromToken} for ${step.toToken}`,
      platform: step.fromToken === 'USDC' || step.toToken === 'USDC' ? '1inch' : 'Uniswap',
      slippageRecommendation: `${slippage}%`,
      estimatedOutput: step.estimatedOutput,
      priceImpact: step.priceImpact
    }));

    const response = {
      success: true,
      rebalanceAnalysis: {
        currentAllocations,
        targetAllocations,
        totalPortfolioValue,
        rebalanceRequired: stepsWithQuotes.length > 0
      },
      rebalanceSteps: stepsWithQuotes,
      manualInstructions,
      executionResults,
      summary: {
        totalSteps: stepsWithQuotes.length,
        executed: executeImmediately,
        successfulTrades: executionResults?.filter(r => r.status === 'SUCCESS').length || 0,
        failedTrades: executionResults?.filter(r => r.status === 'FAILED').length || 0
      }
    };

    res.status(200).json(response);

  } catch (error: any) {
    console.error('Error in rebalance endpoint:', error);
    
    // Provide helpful error response with manual instructions
    res.status(500).json({
      success: false,
      error: 'Rebalancing automation failed',
      details: error.message,
      fallbackInstructions: {
        message: "The rebalancing trade couldn't be executed due to a technical issue with the trade endpoint. Here's what you can do instead:",
        manualSteps: [
          "You can manually perform the rebalancing using these platforms:",
          "Swap WHALE & MEME into:",
          "• USDC (40%)",
          "• ETH (25%)", 
          "• BTC (25%)",
          "Use trusted aggregators for best rates:",
          "• 1inch",
          "• Uniswap",
          "Set slippage to 1% in the trade settings."
        ],
        recommendation: "If you'd like, I can generate a step-by-step manual rebalancing plan including token amounts and exact swap links."
      }
    });
  }
}

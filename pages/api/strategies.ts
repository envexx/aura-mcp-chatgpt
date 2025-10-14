import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { PortfolioStrategiesResponse, Strategy, StrategyResponse, Action } from '../../types/strategies';

interface FormattedStrategy {
  name: string;
  risk: string;
  actions: FormattedAction[];
}

interface FormattedAction {
  tokens: string;
  description: string;
  platforms: { name: string; url: string; }[];
  networks: string[];
  operations: string[];
  apy: string;
}

function generateStrategiesFromPortfolio(portfolioData: any): FormattedStrategy[] {
  const strategies: FormattedStrategy[] = [];
  
  // Calculate portfolio metrics
  let totalValue = 0;
  const networkTokens: { [key: string]: any[] } = {};
  
  portfolioData.portfolio?.forEach((network: any) => {
    networkTokens[network.network.name] = network.tokens;
    network.tokens.forEach((token: any) => {
      totalValue += token.balanceUSD;
    });
  });

  // Strategy 1: Diversification Strategy
  strategies.push({
    name: "Portfolio Diversification",
    risk: "Low",
    actions: [{
      tokens: "USDC, ETH, BTC",
      description: "Rebalance portfolio to reduce concentration risk",
      platforms: [
        { name: "Uniswap", url: "https://app.uniswap.org" },
        { name: "1inch", url: "https://app.1inch.io" }
      ],
      networks: ["Ethereum", "Polygon", "Arbitrum"],
      operations: ["Swap", "Rebalance"],
      apy: "5-8%"
    }]
  });

  // Strategy 2: Yield Farming
  if (totalValue > 1000) {
    strategies.push({
      name: "DeFi Yield Farming",
      risk: "Medium",
      actions: [{
        tokens: "USDC/ETH LP",
        description: "Provide liquidity to earn trading fees and rewards",
        platforms: [
          { name: "Aave", url: "https://app.aave.com" },
          { name: "Compound", url: "https://compound.finance" }
        ],
        networks: ["Ethereum", "Polygon"],
        operations: ["Lend", "Provide Liquidity"],
        apy: "8-15%"
      }]
    });
  }

  // Strategy 3: Staking Strategy
  strategies.push({
    name: "Staking Rewards",
    risk: "Low",
    actions: [{
      tokens: "ETH, MATIC",
      description: "Stake tokens to earn network rewards",
      platforms: [
        { name: "Lido", url: "https://lido.fi" },
        { name: "Rocket Pool", url: "https://rocketpool.net" }
      ],
      networks: ["Ethereum", "Polygon"],
      operations: ["Stake"],
      apy: "4-6%"
    }]
  });

  // Strategy 4: High-Risk High-Reward (for large portfolios)
  if (totalValue > 10000) {
    strategies.push({
      name: "Advanced DeFi Strategies",
      risk: "High",
      actions: [{
        tokens: "Various DeFi tokens",
        description: "Leverage farming and advanced yield strategies",
        platforms: [
          { name: "Yearn Finance", url: "https://yearn.finance" },
          { name: "Convex", url: "https://www.convexfinance.com" }
        ],
        networks: ["Ethereum", "Arbitrum"],
        operations: ["Leverage", "Yield Farming"],
        apy: "15-30%"
      }]
    });
  }

  return strategies;
}

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
      return res.status(400).json({ error: 'Valid wallet address is required' });
    }

    // Get portfolio data first
    const portfolioResponse = await axios.get(
      `https://aura.adex.network/api/portfolio/balances?address=${address}`
    );

    const portfolioData = portfolioResponse.data;
    
    // Generate AI-powered strategies based on portfolio analysis
    const formattedStrategies: FormattedStrategy[] = generateStrategiesFromPortfolio(portfolioData);

    res.status(200).json({
      success: true,
      data: {
        strategies: formattedStrategies,
      },
      rawData: portfolioData
    });

  } catch (error: any) {
    console.error('Error fetching strategies:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch strategies',
      details: error.message
    });
  }
}
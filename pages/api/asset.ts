import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { 
  AuraPortfolioResponse,
  FormattedAssetResponse,
  NetworkAssets,
  NetworkData
} from '../../types/aura';

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

    // Fetch portfolio balances from AURA API
    const auraResponse = await axios.get<AuraPortfolioResponse>(
      `${process.env.NEXT_PUBLIC_AURA_API_URL}/portfolio/balances?address=${address}`
    );

    const portfolioData: AuraPortfolioResponse = auraResponse.data;
    
    // Process and format the data
    const formattedResponse: FormattedAssetResponse = {
      totalPortfolioValue: 0,
      networks: [],
      topHoldings: [],
      riskAnalysis: {
        diversificationScore: 0,
        stablecoinPercentage: 0,
        largestHolding: {
          symbol: '',
          percentage: 0,
        },
      },
    };

    const allTokens: {
      symbol: string;
      value: number;
      token: string;
      network: string;
    }[] = [];

    // Process each network's assets
    for (const [networkName, networkData] of Object.entries(portfolioData.portfolio)) {
      const networkAssets: NetworkAssets = {
        network: networkName,
        totalValue: 0,
        tokens: [],
      };

      // Process tokens in the network
      for (const token of networkData.tokens) {
        const tokenValue = parseFloat(token.usdValue || '0');
        networkAssets.totalValue += tokenValue;
        
        networkAssets.tokens.push({
          symbol: token.symbol,
          balance: token.balance,
          usdValue: token.usdValue,
          token: token.token,
          decimals: token.decimals,
          price: token.price || 0,
        });

        allTokens.push({
          symbol: token.symbol,
          value: tokenValue,
          token: token.token,
          network: networkName,
        });

        formattedResponse.totalPortfolioValue += tokenValue;
      }

      formattedResponse.networks.push(networkAssets);
    }

    // Calculate top holdings
    const tokenTotals = allTokens.reduce((acc, token) => {
      if (!acc[token.symbol]) {
        acc[token.symbol] = {
          totalValue: 0,
          token: token.token,
          symbol: token.symbol,
        };
      }
      acc[token.symbol].totalValue += token.value;
      return acc;
    }, {} as Record<string, { totalValue: number; token: string; symbol: string }>);

    formattedResponse.topHoldings = Object.values(tokenTotals)
      .sort((a, b) => b.totalValue - a.totalValue)
      .slice(0, 5)
      .map(holding => ({
        ...holding,
        percentage: (holding.totalValue / formattedResponse.totalPortfolioValue) * 100,
      }));

    // Calculate risk analysis
    const stablecoins = ['USDT', 'USDC', 'DAI', 'BUSD', 'TUSD', 'USDP'];
    const stablecoinValue = allTokens
      .filter(token => stablecoins.includes(token.symbol))
      .reduce((sum, token) => sum + token.value, 0);

    formattedResponse.riskAnalysis = {
      // Score based on number of different tokens and distribution
      diversificationScore: Math.min(
        100,
        (Object.keys(tokenTotals).length * 10) + 
        (formattedResponse.topHoldings[0]?.percentage > 50 ? -30 : 0)
      ),
      stablecoinPercentage: (stablecoinValue / formattedResponse.totalPortfolioValue) * 100,
      largestHolding: {
        symbol: formattedResponse.topHoldings[0]?.symbol || '',
        percentage: formattedResponse.topHoldings[0]?.percentage || 0,
      },
    };

    res.status(200).json({
      success: true,
      data: formattedResponse,
      rawData: portfolioData, // Include raw data for reference if needed
    });

  } catch (error: any) {
    console.error('Error fetching asset data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch asset data',
      details: error.message,
    });
  }
}
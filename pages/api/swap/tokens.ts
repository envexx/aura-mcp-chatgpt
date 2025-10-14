import { NextApiRequest, NextApiResponse } from 'next';
import { UniswapIntegration } from '../../../lib/uniswap-integration';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { chain = 'ethereum' } = req.query;

    const uniswapIntegration = new UniswapIntegration();

    // Get supported chains and tokens
    const supportedChains = uniswapIntegration.getSupportedChains();
    const fallbackTokens = getFallbackTokens(chain as string);
      
    // Enhanced response with AURA metadata
    const enhancedResponse = {
      success: true,
      tokens: fallbackTokens,
      supportedChains,
      source: 'uniswap-integration',
      chain: chain as string,
      metadata: {
        totalTokens: fallbackTokens.length,
        lastUpdated: new Date().toISOString(),
        mcpProvider: 'uniswap-trader-mcp'
      },
      popularTokens: getPopularTokens(chain as string),
      categories: {
        stablecoins: fallbackTokens.filter((token: any) => 
          ['USDC', 'USDT', 'DAI', 'FRAX'].includes(token.symbol)
        ),
        majors: fallbackTokens.filter((token: any) => 
          ['ETH', 'WETH', 'BTC', 'WBTC'].includes(token.symbol)
        ),
        defi: fallbackTokens.filter((token: any) => 
          ['UNI', 'AAVE', 'COMP', 'MKR', 'SNX'].includes(token.symbol)
        )
      }
    };

    res.status(200).json(enhancedResponse);

  } catch (error: any) {
    console.error('Get tokens error:', error);
    
    // Return fallback tokens on error
    const fallbackTokens = getFallbackTokens(req.query.chain as string || 'ethereum');
    
    res.status(200).json({
      success: true,
      tokens: fallbackTokens,
      source: 'fallback',
      error: error.message,
      message: 'Using cached token list due to service error'
    });
  }
}

function getFallbackTokens(chain: string) {
  const tokensByChain: { [key: string]: any[] } = {
    ethereum: [
      {
        address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
        symbol: 'WETH',
        name: 'Wrapped Ether',
        decimals: 18,
        logoURI: 'https://tokens.1inch.io/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2.png'
      },
      {
        address: '0xA0b86a33E6441b8C4505b5c4b5c4b5c4b5c4b5c4',
        symbol: 'USDC',
        name: 'USD Coin',
        decimals: 6,
        logoURI: 'https://tokens.1inch.io/0xa0b86a33e6441b8c4505b5c4b5c4b5c4b5c4b5c4.png'
      },
      {
        address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        symbol: 'USDT',
        name: 'Tether USD',
        decimals: 6,
        logoURI: 'https://tokens.1inch.io/0xdac17f958d2ee523a2206206994597c13d831ec7.png'
      },
      {
        address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
        symbol: 'DAI',
        name: 'Dai Stablecoin',
        decimals: 18,
        logoURI: 'https://tokens.1inch.io/0x6b175474e89094c44da98b954eedeac495271d0f.png'
      },
      {
        address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
        symbol: 'WBTC',
        name: 'Wrapped BTC',
        decimals: 8,
        logoURI: 'https://tokens.1inch.io/0x2260fac5e5542a773aa44fbcfedf7c193bc2c599.png'
      }
    ],
    polygon: [
      {
        address: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
        symbol: 'WMATIC',
        name: 'Wrapped Matic',
        decimals: 18,
        logoURI: 'https://wallet-asset.matic.network/img/tokens/matic.svg'
      },
      {
        address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
        symbol: 'USDC',
        name: 'USD Coin',
        decimals: 6,
        logoURI: 'https://tokens.1inch.io/0xa0b86a33e6441b8c4505b5c4b5c4b5c4b5c4b5c4.png'
      }
    ],
    arbitrum: [
      {
        address: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
        symbol: 'WETH',
        name: 'Wrapped Ether',
        decimals: 18,
        logoURI: 'https://tokens.1inch.io/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2.png'
      },
      {
        address: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',
        symbol: 'USDC',
        name: 'USD Coin',
        decimals: 6,
        logoURI: 'https://tokens.1inch.io/0xa0b86a33e6441b8c4505b5c4b5c4b5c4b5c4b5c4.png'
      }
    ]
  };

  return tokensByChain[chain.toLowerCase()] || tokensByChain.ethereum;
}

function getPopularTokens(chain: string) {
  const popularByChain: { [key: string]: string[] } = {
    ethereum: ['WETH', 'USDC', 'USDT', 'DAI', 'WBTC', 'UNI', 'LINK'],
    polygon: ['WMATIC', 'USDC', 'USDT', 'DAI', 'WETH'],
    arbitrum: ['WETH', 'USDC', 'ARB', 'GMX'],
    optimism: ['WETH', 'USDC', 'OP', 'SNX'],
    base: ['WETH', 'USDC', 'CBETH']
  };

  return popularByChain[chain.toLowerCase()] || popularByChain.ethereum;
}

import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

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

    // Fetch strategies from AURA API
    const auraResponse = await axios.get(
      `${process.env.NEXT_PUBLIC_AURA_API_URL}/portfolio/strategies?address=${address}`
    );

    const strategies = auraResponse.data;

    // Format and enhance the strategies data
    const formattedStrategies = strategies.strategies.map((strategy: any) => ({
      name: strategy.name,
      risk: strategy.risk,
      description: strategy.description,
      actions: strategy.actions.map((action: any) => ({
        type: action.type,
        platform: action.platform,
        network: action.network,
        token: action.token,
        estimatedApy: action.estimatedApy,
        requirements: action.requirements || [],
        steps: action.steps || []
      })),
      timeframe: strategy.timeframe || 'short-term',
      confidence: strategy.confidence || 'medium',
      potentialReturn: {
        min: strategy.potentialReturn?.min || 0,
        max: strategy.potentialReturn?.max || 0,
        timeframe: strategy.potentialReturn?.timeframe || 'yearly'
      }
    }));

    // Add additional analysis
    const analysis = {
      totalStrategies: formattedStrategies.length,
      riskDistribution: {
        low: formattedStrategies.filter(s => s.risk === 'low').length,
        medium: formattedStrategies.filter(s => s.risk === 'medium').length,
        high: formattedStrategies.filter(s => s.risk === 'high').length
      },
      platforms: [...new Set(formattedStrategies.flatMap(s => s.actions.map(a => a.platform)))],
      networks: [...new Set(formattedStrategies.flatMap(s => s.actions.map(a => a.network)))]
    };

    res.status(200).json({
      success: true,
      data: {
        strategies: formattedStrategies,
        analysis: analysis
      },
      rawData: strategies // Include raw data for reference
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
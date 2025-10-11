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

    const auraResponse = await axios.get(
      `https://aura.adex.network/api/portfolio/strategies?address=${address}`
    );

    const strategiesResponse: PortfolioStrategiesResponse = auraResponse.data;

    const formattedStrategies: FormattedStrategy[] = [];

    for (const strategy of strategiesResponse.strategies) {
      for (const strategyResponse of strategy.response) {
        const formattedActions: FormattedAction[] = strategyResponse.actions.map((action: Action) => ({
          tokens: action.tokens,
          description: action.description,
          platforms: action.platforms || [],
          networks: action.networks || [],
          operations: action.operations || [],
          apy: action.apy || 'N/A',
        }));

        formattedStrategies.push({
          name: strategyResponse.name,
          risk: strategyResponse.risk,
          actions: formattedActions,
        });
      }
    }

    res.status(200).json({
      success: true,
      data: {
        strategies: formattedStrategies,
      },
      rawData: strategiesResponse
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
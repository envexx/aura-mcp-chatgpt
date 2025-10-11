export interface Strategy {
  name: string;
  risk: 'low' | 'medium' | 'high';
  description: string;
  actions: StrategyAction[];
  timeframe: string;
  confidence: string;
  potentialReturn: {
    min: number;
    max: number;
    timeframe: string;
  };
}

export interface StrategyAction {
  type: string;
  platform: string;
  network: string;
  token: string;
  estimatedApy: number;
  requirements: string[];
  steps: string[];
}

export interface StrategyAnalysis {
  totalStrategies: number;
  riskDistribution: {
    low: number;
    medium: number;
    high: number;
  };
  platforms: string[];
  networks: string[];
}

export interface StrategiesResponse {
  strategies: Strategy[];
  analysis: StrategyAnalysis;
}
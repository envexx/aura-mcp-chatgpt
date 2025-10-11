import { NetworkPortfolio } from './aura';

export interface PortfolioStrategiesResponse {
  address: string;
  portfolio: NetworkPortfolio[];
  strategies: Strategy[];
  cached: boolean;
  version: string;
}

export interface Strategy {
  llm: {
    provider: string;
    model: string;
  };
  response: StrategyResponse[];
  responseTime: number;
  error: string | null;
}

export interface StrategyResponse {
  name: string;
  risk: string;
  actions: Action[];
}

export interface Action {
  tokens: string;
  description: string;
  platforms: Platform[];
  networks: string[];
  operations: string[];
  apy: string;
}

export interface Platform {
  name: string;
  url: string;
}
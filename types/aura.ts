export interface AuraToken {
  symbol: string;
  balance: string;
  usdValue: string;
  token: string;
  decimals: number;
  price: number;
}

export interface NetworkData {
  tokens: AuraToken[];
  totalValue: string;
}

export interface AuraPortfolioResponse {
  portfolio: {
    [network: string]: NetworkData;
  };
  cached: boolean;
  version: string;
}

export interface TopHolding {
  token: string;
  symbol: string;
  totalValue: number;
  percentage: number;
}

export interface RiskAnalysis {
  diversificationScore: number;
  stablecoinPercentage: number;
  largestHolding: {
    symbol: string;
    percentage: number;
  };
}

export interface NetworkAssets {
  network: string;
  totalValue: number;
  tokens: AuraToken[];
}

export interface FormattedAssetResponse {
  totalPortfolioValue: number;
  networks: NetworkAssets[];
  topHoldings: TopHolding[];
  riskAnalysis: RiskAnalysis;
}
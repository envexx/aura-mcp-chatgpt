export interface PortfolioToken {
  address: string;
  symbol: string;
  network: string;
  balance: number;
  balanceUSD: number;
}

export interface PortfolioNetworkInfo {
  name: string;
  chainId: string;
  platformId: string;
  explorerUrl: string;
  iconUrls: string[];
}

export interface NetworkPortfolio {
  network: PortfolioNetworkInfo;
  tokens: PortfolioToken[];
}

export interface AuraPortfolioResponse {
  address: string;
  portfolio: NetworkPortfolio[];
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

export interface AuraToken {
  symbol: string;
  balance: number;
  usdValue: string;
  token: string;
  decimals: number;
  price: number;
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
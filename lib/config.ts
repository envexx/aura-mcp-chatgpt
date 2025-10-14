/**
 * Configuration utility for AURA MCP
 * Centralizes environment variable management and provides fallbacks
 */

export const config = {
  // API URLs
  auraApiUrl: process.env.NEXT_PUBLIC_AURA_API_URL || 'https://aura.adex.network/api',
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  
  // OpenAI
  openaiApiKey: process.env.OPENAI_API_KEY,
  
  // Blockchain RPC URLs
  rpcUrls: {
    ethereum: process.env.ETHEREUM_RPC_URL || 'https://mainnet.infura.io/v3/YOUR_PROJECT_ID',
    polygon: process.env.POLYGON_RPC_URL || 'https://polygon-mainnet.infura.io/v3/YOUR_PROJECT_ID',
    arbitrum: process.env.ARBITRUM_RPC_URL || 'https://arbitrum-mainnet.infura.io/v3/YOUR_PROJECT_ID',
  },
  
  // x402 Payment
  x402: {
    paymentEndpoint: process.env.X402_PAYMENT_ENDPOINT || 'https://x402.adex.network',
    walletAddress: process.env.X402_WALLET_ADDRESS,
  },
  
  // Development
  isDevelopment: process.env.NODE_ENV === 'development',
  port: process.env.PORT || 3000,
  
  // Trading defaults
  trading: {
    defaultSlippage: 0.5,
    maxSlippage: 5.0,
    defaultGasLimit: '300000',
    retryAttempts: 3,
    retryDelay: 1000, // ms
  },
  
  // Automation settings
  automation: {
    monitoringInterval: 60000, // 1 minute
    defaultCooldown: 60, // minutes
    maxExecutions: 100,
  }
};

/**
 * Validates that required environment variables are set
 */
export function validateConfig(): { isValid: boolean; missingVars: string[] } {
  const requiredVars = [
    'NEXT_PUBLIC_AURA_API_URL',
    'OPENAI_API_KEY'
  ];
  
  const missingVars = requiredVars.filter(varName => {
    const value = process.env[varName];
    return !value || value.includes('YOUR_') || value === '';
  });
  
  return {
    isValid: missingVars.length === 0,
    missingVars
  };
}

/**
 * Gets the appropriate API URL with fallback
 */
export function getApiUrl(endpoint: string = ''): string {
  const baseUrl = config.auraApiUrl;
  return endpoint ? `${baseUrl}/${endpoint.replace(/^\//, '')}` : baseUrl;
}

/**
 * Gets the local API URL with fallback
 */
export function getLocalApiUrl(endpoint: string = ''): string {
  const baseUrl = config.apiUrl;
  return endpoint ? `${baseUrl}/${endpoint.replace(/^\//, '')}` : baseUrl;
}

/**
 * Configuration for different environments
 */
export const envConfig = {
  development: {
    logLevel: 'debug',
    enableMockData: true,
    skipValidation: false,
  },
  production: {
    logLevel: 'error',
    enableMockData: false,
    skipValidation: false,
  },
  test: {
    logLevel: 'silent',
    enableMockData: true,
    skipValidation: true,
  }
};

export default config;

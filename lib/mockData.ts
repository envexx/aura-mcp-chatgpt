export const mockPortfolioData = {
  cached: false,
  version: "1.0.0",
  portfolio: {
    ethereum: {
      name: "Ethereum",
      chainId: 1,
      tokens: [
        {
          symbol: "ETH",
          balance: "1.5",
          usdValue: "3000",
          token: "0x0000000000000000000000000000000000000000",
          decimals: 18,
          price: 2000
        },
        {
          symbol: "USDC",
          balance: "5000",
          usdValue: "5000",
          token: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
          decimals: 6,
          price: 1
        }
      ]
    },
    polygon: {
      name: "Polygon",
      chainId: 137,
      tokens: [
        {
          symbol: "MATIC",
          balance: "10000",
          usdValue: "8000",
          token: "0x0000000000000000000000000000000000001010",
          decimals: 18,
          price: 0.8
        }
      ]
    }
  }
};
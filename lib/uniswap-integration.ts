import { ethers, JsonRpcProvider, Wallet, Contract, parseUnits, formatUnits, MaxUint256, ZeroAddress } from 'ethers';

// Simplified interfaces for compatibility
interface Token {
  chainId: number;
  address: string;
  decimals: number;
  symbol?: string;
  name?: string;
}

interface SwapQuoteParams {
  tokenIn: string;
  tokenOut: string;
  fee: number;
  amountIn?: string;
  amountOut?: string;
  recipient: string;
  deadline: number;
  sqrtPriceLimitX96?: string;
}

// Chain configurations for multi-chain support
export const CHAIN_CONFIGS: Record<number, {
  rpcUrl: string;
  swapRouter: string;
  poolFactory: string;
  weth: string;
  name: string;
}> = {
  1: { // Ethereum Mainnet
    rpcUrl: `https://mainnet.infura.io/v3/${process.env.INFURA_KEY}`,
    swapRouter: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
    poolFactory: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
    weth: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    name: "Ethereum"
  },
  10: { // Optimism
    rpcUrl: `https://optimism-mainnet.infura.io/v3/${process.env.INFURA_KEY}`,
    swapRouter: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
    poolFactory: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
    weth: "0x4200000000000000000000000000000000000006",
    name: "Optimism"
  },
  137: { // Polygon
    rpcUrl: `https://polygon-mainnet.infura.io/v3/${process.env.INFURA_KEY}`,
    swapRouter: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
    poolFactory: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
    weth: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
    name: "Polygon"
  },
  42161: { // Arbitrum One
    rpcUrl: `https://arbitrum-mainnet.infura.io/v3/${process.env.INFURA_KEY}`,
    swapRouter: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
    poolFactory: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
    weth: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
    name: "Arbitrum One"
  },
  8453: { // Base
    rpcUrl: `https://base-mainnet.infura.io/v3/${process.env.INFURA_KEY}`,
    swapRouter: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
    poolFactory: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
    weth: "0x4200000000000000000000000000000000000006",
    name: "Base"
  }
};

// ERC20 ABI for token interactions
export const ERC20ABI = [
  "function balanceOf(address account) external view returns (uint256)",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function symbol() external view returns (string)",
  "function decimals() external view returns (uint8)",
  "function name() external view returns (string)"
];

// SwapRouter ABI for Uniswap V3
export const SwapRouterABI = [
  "function exactInputSingle(tuple(address tokenIn, address tokenOut, uint24 fee, address recipient, uint256 deadline, uint256 amountIn, uint256 amountOutMinimum, uint160 sqrtPriceLimitX96) params) external payable returns (uint256 amountOut)",
  "function exactOutputSingle(tuple(address tokenIn, address tokenOut, uint24 fee, address recipient, uint256 deadline, uint256 amountOut, uint256 amountInMaximum, uint160 sqrtPriceLimitX96) params) external payable returns (uint256 amountIn)",
  "function multicall(bytes[] calldata data) external payable returns (bytes[] memory results)"
];

export interface SwapQuote {
  chainId: number;
  tradeType: string;
  price: string;
  inputAmount: string;
  outputAmount: string;
  minimumReceived: string;
  maximumInput: string;
  route: Array<{
    tokenIn: string;
    tokenOut: string;
    fee: number;
  }>;
  estimatedGas: string;
  priceImpact: string;
}

export interface SwapResult {
  chainId: number;
  txHash: string;
  tradeType: string;
  amountIn: string;
  outputAmount: string;
  minimumReceived: string;
  maximumInput: string;
  fromToken: string;
  toToken: string;
  route: Array<{
    tokenIn: string;
    tokenOut: string;
    fee: number;
  }>;
  gasUsed: string;
  actualPrice: string;
}

export class UniswapIntegration {
  private providers: Map<number, JsonRpcProvider> = new Map();

  constructor() {
    this.initializeProviders();
  }

  private initializeProviders() {
    Object.entries(CHAIN_CONFIGS).forEach(([chainId, config]) => {
      const provider = new JsonRpcProvider(config.rpcUrl);
      this.providers.set(parseInt(chainId), provider);
    });
  }

  private getChainContext(chainId: number) {
    const config = CHAIN_CONFIGS[chainId];
    if (!config) {
      const supportedChains = Object.entries(CHAIN_CONFIGS)
        .map(([id, { name }]) => `${id} - ${name}`)
        .join(', ');
      throw new Error(`Unsupported chainId: ${chainId}. Supported chains: ${supportedChains}`);
    }
    
    const provider = this.providers.get(chainId);
    
    if (!provider) {
      throw new Error(`Provider not initialized for chain ${chainId}`);
    }
    
    return { provider, config };
  }

  private async createToken(chainId: number, address: string, provider: JsonRpcProvider, symbol = "UNKNOWN", name = "Unknown Token"): Promise<Token> {
    const config = CHAIN_CONFIGS[chainId];
    if (!address || address.toLowerCase() === "native") {
      return {
        chainId,
        address: config.weth,
        decimals: 18,
        symbol,
        name
      };
    }
    
    const tokenContract = new Contract(address, ERC20ABI, provider);
    const [decimals, tokenSymbol, tokenName] = await Promise.all([
      tokenContract.decimals(),
      tokenContract.symbol().catch(() => symbol),
      tokenContract.name().catch(() => name)
    ]);
    
    return {
      chainId,
      address: ethers.getAddress(address),
      decimals: Number(decimals),
      symbol: tokenSymbol,
      name: tokenName
    };
  }

  async getSwapQuote(
    chainId: number = 1,
    tokenIn: string,
    tokenOut: string,
    amountIn?: string,
    amountOut?: string,
    tradeType: 'exactIn' | 'exactOut' = 'exactIn'
  ): Promise<SwapQuote> {
    try {
      const { provider, config } = this.getChainContext(chainId);
      
      const tokenA = await this.createToken(chainId, tokenIn, provider);
      const tokenB = await this.createToken(chainId, tokenOut, provider);

      if (tradeType === "exactIn" && !amountIn) {
        throw new Error("amountIn is required for exactIn trades");
      }
      if (tradeType === "exactOut" && !amountOut) {
        throw new Error("amountOut is required for exactOut trades");
      }

      const amount = tradeType === "exactIn" ? amountIn! : amountOut!;
      const decimals = tradeType === "exactIn" ? tokenA.decimals : tokenB.decimals;
      const amountWei = parseUnits(amount, decimals);
      
      // Simplified quote calculation (in real implementation, you'd use Uniswap SDK)
      // For now, return a mock quote structure
      const mockPrice = "1.0"; // This would be calculated from actual pool data
      const slippageAmount = BigInt(amountWei) * BigInt(5) / BigInt(1000); // 0.5% slippage
      
      return {
        chainId,
        tradeType,
        price: mockPrice,
        inputAmount: formatUnits(amountWei, tokenA.decimals),
        outputAmount: formatUnits(amountWei, tokenB.decimals), // Simplified 1:1 for demo
        minimumReceived: formatUnits(amountWei - slippageAmount, tokenB.decimals),
        maximumInput: formatUnits(amountWei + slippageAmount, tokenA.decimals),
        route: [{
          tokenIn: tokenA.address,
          tokenOut: tokenB.address,
          fee: 3000 // 0.3% fee
        }],
        estimatedGas: "150000",
        priceImpact: "0.1"
      };
    } catch (error: any) {
      throw new Error(`Failed to get price quote: ${error.message}`);
    }
  }

  async executeSwap(
    chainId: number = 1,
    tokenIn: string,
    tokenOut: string,
    amountIn?: string,
    amountOut?: string,
    tradeType: 'exactIn' | 'exactOut' = 'exactIn',
    slippageTolerance: number = 0.5,
    deadline: number = 20,
    privateKey?: string
  ): Promise<SwapResult> {
    try {
      if (!privateKey) {
        throw new Error("Private key is required for swap execution");
      }

      const { provider, config } = this.getChainContext(chainId);
      const wallet = new Wallet(privateKey, provider);

      const isNativeIn = !tokenIn || tokenIn.toLowerCase() === "native";
      const isNativeOut = !tokenOut || tokenOut.toLowerCase() === "native";
      
      const tokenA = await this.createToken(chainId, isNativeIn ? config.weth : tokenIn, provider);
      const tokenB = await this.createToken(chainId, isNativeOut ? config.weth : tokenOut, provider);

      if (tradeType === "exactIn" && !amountIn) {
        throw new Error("amountIn is required for exactIn trades");
      }
      if (tradeType === "exactOut" && !amountOut) {
        throw new Error("amountOut is required for exactOut trades");
      }

      const amount = tradeType === "exactIn" ? amountIn! : amountOut!;
      const decimals = tradeType === "exactIn" ? tokenA.decimals : tokenB.decimals;
      const amountWei = parseUnits(amount, decimals);
      
      // Check balance before swap
      await this.checkBalance(provider, wallet, isNativeIn ? null : tokenA.address, isNativeIn);

      // Approve token if not native input
      if (!isNativeIn) {
        const tokenContract = new Contract(tokenA.address, ERC20ABI, wallet);
        const approvalTx = await tokenContract.approve(config.swapRouter, MaxUint256);
        await approvalTx.wait();
      }

      // For demo purposes, create a simple swap transaction
      // In production, you'd use the actual Uniswap router contract methods
      const swapRouter = new Contract(config.swapRouter, SwapRouterABI, wallet);
      
      const swapParams = {
        tokenIn: tokenA.address,
        tokenOut: tokenB.address,
        fee: 3000, // 0.3%
        recipient: wallet.address,
        deadline: Math.floor(Date.now() / 1000) + (deadline * 60),
        amountIn: amountWei,
        amountOutMinimum: amountWei * BigInt(100 - Math.floor(slippageTolerance * 100)) / BigInt(100),
        sqrtPriceLimitX96: 0
      };

      const tx = await swapRouter.exactInputSingle(swapParams, {
        value: isNativeIn ? amountWei : 0,
        gasLimit: 200000
      });

      const receipt = await tx.wait();
      
      if (!receipt) {
        throw new Error("Transaction failed");
      }

      return {
        chainId,
        txHash: receipt.hash || 'unknown',
        tradeType,
        amountIn: formatUnits(amountWei, tokenA.decimals),
        outputAmount: formatUnits(amountWei, tokenB.decimals), // Simplified
        minimumReceived: formatUnits(swapParams.amountOutMinimum, tokenB.decimals),
        maximumInput: formatUnits(amountWei, tokenA.decimals),
        fromToken: isNativeIn ? "NATIVE" : tokenIn,
        toToken: isNativeOut ? "NATIVE" : tokenOut,
        route: [{
          tokenIn: tokenA.address,
          tokenOut: tokenB.address,
          fee: 3000
        }],
        gasUsed: receipt.gasUsed?.toString() || "0",
        actualPrice: "1.0" // Simplified
      };
    } catch (error: any) {
      throw new Error(`Swap execution failed: ${error.message}`);
    }
  }

  private async checkBalance(provider: JsonRpcProvider, wallet: Wallet, tokenAddress: string | null, isNative = false) {
    if (isNative) {
      const balance = await provider.getBalance(wallet.address);
      if (balance === 0n) {
        throw new Error(`Zero native token balance. Please deposit funds to ${wallet.address}.`);
      }
    } else if (tokenAddress) {
      const tokenContract = new Contract(tokenAddress, ERC20ABI, provider);
      const balance = await tokenContract.balanceOf(wallet.address);
      if (balance === 0n) {
        const symbol = await tokenContract.symbol();
        throw new Error(`Zero ${symbol} balance. Please deposit funds to ${wallet.address}.`);
      }
    }
  }

  getSupportedChains(): Array<{chainId: number, name: string}> {
    return Object.entries(CHAIN_CONFIGS).map(([chainId, config]) => ({
      chainId: parseInt(chainId),
      name: config.name
    }));
  }
}

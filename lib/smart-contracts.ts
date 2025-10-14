import { ethers } from 'ethers';

// Contract addresses for different networks
export const CONTRACTS = {
  ethereum: {
    uniswapV2Router: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
    uniswapV3Router: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
    aaveLendingPool: '0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9',
    lidoStETH: '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84',
    compoundCETH: '0x4Ddc2D193948926D02f9B1fE9e1daa0718270ED5',
    yearnVault: '0xa354F35829Ae975e850e23e9615b11Da1B3dC4DE'
  },
  polygon: {
    uniswapV2Router: '0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff',
    aaveLendingPool: '0x8dFf5E27EA6b7AC08EbFdf9eB090F32ee9a30fcf'
  },
  arbitrum: {
    uniswapV3Router: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
    aaveLendingPool: '0x794a61358D6845594F94dc1DB02A252b5b4814aD'
  }
};

// Token addresses
export const TOKENS = {
  ethereum: {
    WETH: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    USDC: '0xA0b86a33E6441b8C4505b5c4b5c4b5c4b5c4b5c4',
    USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    DAI: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    WBTC: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599'
  }
};

// ABIs
export const ABIS = {
  ERC20: [
    "function balanceOf(address owner) view returns (uint256)",
    "function transfer(address to, uint256 amount) returns (bool)",
    "function approve(address spender, uint256 amount) returns (bool)",
    "function allowance(address owner, address spender) view returns (uint256)",
    "function decimals() view returns (uint8)",
    "function symbol() view returns (string)",
    "function name() view returns (string)"
  ],
  
  UniswapV2Router: [
    "function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)",
    "function swapTokensForExactTokens(uint amountOut, uint amountInMax, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)",
    "function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts)",
    "function addLiquidity(address tokenA, address tokenB, uint amountADesired, uint amountBDesired, uint amountAMin, uint amountBMin, address to, uint deadline) external returns (uint amountA, uint amountB, uint liquidity)"
  ],
  
  UniswapV3Router: [
    "function exactInputSingle((address tokenIn, address tokenOut, uint24 fee, address recipient, uint256 deadline, uint256 amountIn, uint256 amountOutMinimum, uint160 sqrtPriceLimitX96)) external payable returns (uint256 amountOut)"
  ],
  
  AaveLendingPool: [
    "function deposit(address asset, uint256 amount, address onBehalfOf, uint16 referralCode) external",
    "function withdraw(address asset, uint256 amount, address to) external returns (uint256)",
    "function borrow(address asset, uint256 amount, uint256 interestRateMode, uint16 referralCode, address onBehalfOf) external"
  ],
  
  LidoStETH: [
    "function submit(address _referral) external payable returns (uint256)",
    "function getPooledEthByShares(uint256 _sharesAmount) external view returns (uint256)"
  ],
  
  CompoundCToken: [
    "function mint(uint mintAmount) external returns (uint)",
    "function redeem(uint redeemTokens) external returns (uint)",
    "function borrow(uint borrowAmount) external returns (uint)",
    "function repayBorrow(uint repayAmount) external returns (uint)"
  ]
};

export interface TransactionParams {
  to: string;
  data: string;
  value?: string;
  gasLimit?: string;
  gasPrice?: string;
}

export class SmartContractManager {
  private provider: ethers.JsonRpcProvider;
  private network: string;

  constructor(rpcUrl: string, network: string = 'ethereum') {
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.network = network;
  }

  // Uniswap V2 Operations
  async prepareSwapV2(
    tokenIn: string,
    tokenOut: string,
    amountIn: string,
    recipient: string,
    slippageTolerance: number = 0.5
  ): Promise<TransactionParams> {
    const router = new ethers.Contract(
      CONTRACTS.ethereum.uniswapV2Router,
      ABIS.UniswapV2Router,
      this.provider
    );

    const path = [tokenIn, tokenOut];
    const amountInWei = ethers.parseUnits(amountIn, 18);
    
    // Get expected output
    const amountsOut = await router.getAmountsOut(amountInWei, path);
    const amountOutMin = amountsOut[1] * BigInt(Math.floor((100 - slippageTolerance) * 100)) / BigInt(10000);
    
    const deadline = Math.floor(Date.now() / 1000) + 1800; // 30 minutes

    const data = router.interface.encodeFunctionData('swapExactTokensForTokens', [
      amountInWei,
      amountOutMin,
      path,
      recipient,
      deadline
    ]);

    return {
      to: CONTRACTS.ethereum.uniswapV2Router,
      data,
      gasLimit: '200000'
    };
  }

  // Uniswap V3 Operations
  async prepareSwapV3(
    tokenIn: string,
    tokenOut: string,
    fee: number,
    amountIn: string,
    recipient: string,
    slippageTolerance: number = 0.5
  ): Promise<TransactionParams> {
    const router = new ethers.Contract(
      CONTRACTS.ethereum.uniswapV3Router,
      ABIS.UniswapV3Router,
      this.provider
    );

    const amountInWei = ethers.parseUnits(amountIn, 18);
    const deadline = Math.floor(Date.now() / 1000) + 1800;
    
    // Calculate minimum output (simplified)
    const amountOutMinimum = amountInWei * BigInt(Math.floor((100 - slippageTolerance) * 100)) / BigInt(10000);

    const params = {
      tokenIn,
      tokenOut,
      fee,
      recipient,
      deadline,
      amountIn: amountInWei,
      amountOutMinimum,
      sqrtPriceLimitX96: 0
    };

    const data = router.interface.encodeFunctionData('exactInputSingle', [params]);

    return {
      to: CONTRACTS.ethereum.uniswapV3Router,
      data,
      gasLimit: '300000'
    };
  }

  // Aave Operations
  async prepareAaveDeposit(
    asset: string,
    amount: string,
    onBehalfOf: string
  ): Promise<TransactionParams> {
    const lendingPool = new ethers.Contract(
      CONTRACTS.ethereum.aaveLendingPool,
      ABIS.AaveLendingPool,
      this.provider
    );

    const amountWei = ethers.parseUnits(amount, 18);
    const data = lendingPool.interface.encodeFunctionData('deposit', [
      asset,
      amountWei,
      onBehalfOf,
      0 // referralCode
    ]);

    return {
      to: CONTRACTS.ethereum.aaveLendingPool,
      data,
      gasLimit: '250000'
    };
  }

  async prepareAaveWithdraw(
    asset: string,
    amount: string,
    to: string
  ): Promise<TransactionParams> {
    const lendingPool = new ethers.Contract(
      CONTRACTS.ethereum.aaveLendingPool,
      ABIS.AaveLendingPool,
      this.provider
    );

    const amountWei = amount === 'max' ? ethers.MaxUint256 : ethers.parseUnits(amount, 18);
    const data = lendingPool.interface.encodeFunctionData('withdraw', [
      asset,
      amountWei,
      to
    ]);

    return {
      to: CONTRACTS.ethereum.aaveLendingPool,
      data,
      gasLimit: '200000'
    };
  }

  // Lido Staking
  async prepareLidoStake(amount: string, referral: string = ethers.ZeroAddress): Promise<TransactionParams> {
    const stETH = new ethers.Contract(
      CONTRACTS.ethereum.lidoStETH,
      ABIS.LidoStETH,
      this.provider
    );

    const data = stETH.interface.encodeFunctionData('submit', [referral]);

    return {
      to: CONTRACTS.ethereum.lidoStETH,
      data,
      value: ethers.parseEther(amount).toString(),
      gasLimit: '150000'
    };
  }

  // Compound Operations
  async prepareCompoundSupply(
    cTokenAddress: string,
    amount: string
  ): Promise<TransactionParams> {
    const cToken = new ethers.Contract(
      cTokenAddress,
      ABIS.CompoundCToken,
      this.provider
    );

    const amountWei = ethers.parseUnits(amount, 18);
    const data = cToken.interface.encodeFunctionData('mint', [amountWei]);

    return {
      to: cTokenAddress,
      data,
      gasLimit: '200000'
    };
  }

  // Token Operations
  async prepareTokenApproval(
    tokenAddress: string,
    spender: string,
    amount: string
  ): Promise<TransactionParams> {
    const token = new ethers.Contract(tokenAddress, ABIS.ERC20, this.provider);
    const amountWei = ethers.parseUnits(amount, 18);
    
    const data = token.interface.encodeFunctionData('approve', [spender, amountWei]);

    return {
      to: tokenAddress,
      data,
      gasLimit: '50000'
    };
  }

  // Utility functions
  async getTokenBalance(tokenAddress: string, userAddress: string): Promise<string> {
    const token = new ethers.Contract(tokenAddress, ABIS.ERC20, this.provider);
    const balance = await token.balanceOf(userAddress);
    return ethers.formatUnits(balance, 18);
  }

  async getTokenAllowance(
    tokenAddress: string,
    owner: string,
    spender: string
  ): Promise<string> {
    const token = new ethers.Contract(tokenAddress, ABIS.ERC20, this.provider);
    const allowance = await token.allowance(owner, spender);
    return ethers.formatUnits(allowance, 18);
  }

  async estimateGas(txParams: TransactionParams, from: string): Promise<string> {
    try {
      const gasEstimate = await this.provider.estimateGas({
        to: txParams.to,
        data: txParams.data,
        value: txParams.value || '0',
        from
      });
      return gasEstimate.toString();
    } catch (error) {
      console.error('Gas estimation failed:', error);
      return txParams.gasLimit || '300000';
    }
  }

  async getCurrentGasPrice(): Promise<string> {
    const feeData = await this.provider.getFeeData();
    return feeData.gasPrice?.toString() || '20000000000'; // 20 gwei fallback
  }

  // Multi-step transaction builder
  buildMultiStepTransaction(steps: TransactionParams[]): TransactionParams[] {
    return steps.map((step, index) => ({
      ...step,
      // Add nonce management for sequential transactions
      nonce: `+${index}` // This would be handled by the wallet
    }));
  }

  // Strategy-specific transaction builders
  async buildYieldFarmingTx(
    tokenA: string,
    tokenB: string,
    amountA: string,
    amountB: string,
    userAddress: string
  ): Promise<TransactionParams[]> {
    const transactions: TransactionParams[] = [];

    // 1. Approve tokens
    transactions.push(
      await this.prepareTokenApproval(tokenA, CONTRACTS.ethereum.uniswapV2Router, amountA)
    );
    transactions.push(
      await this.prepareTokenApproval(tokenB, CONTRACTS.ethereum.uniswapV2Router, amountB)
    );

    // 2. Add liquidity
    const router = new ethers.Contract(
      CONTRACTS.ethereum.uniswapV2Router,
      ABIS.UniswapV2Router,
      this.provider
    );

    const deadline = Math.floor(Date.now() / 1000) + 1800;
    const amountAWei = ethers.parseUnits(amountA, 18);
    const amountBWei = ethers.parseUnits(amountB, 18);
    const amountAMin = amountAWei * BigInt(95) / BigInt(100); // 5% slippage
    const amountBMin = amountBWei * BigInt(95) / BigInt(100);

    const data = router.interface.encodeFunctionData('addLiquidity', [
      tokenA,
      tokenB,
      amountAWei,
      amountBWei,
      amountAMin,
      amountBMin,
      userAddress,
      deadline
    ]);

    transactions.push({
      to: CONTRACTS.ethereum.uniswapV2Router,
      data,
      gasLimit: '400000'
    });

    return transactions;
  }

  async buildStakingTx(amount: string): Promise<TransactionParams[]> {
    return [await this.prepareLidoStake(amount)];
  }

  async buildLendingTx(
    asset: string,
    amount: string,
    userAddress: string
  ): Promise<TransactionParams[]> {
    const transactions: TransactionParams[] = [];

    // 1. Approve token
    transactions.push(
      await this.prepareTokenApproval(asset, CONTRACTS.ethereum.aaveLendingPool, amount)
    );

    // 2. Deposit to Aave
    transactions.push(
      await this.prepareAaveDeposit(asset, amount, userAddress)
    );

    return transactions;
  }
}

// Factory function
export function createSmartContractManager(network: string = 'ethereum'): SmartContractManager {
  const rpcUrls = {
    ethereum: process.env.ETHEREUM_RPC_URL || 'https://mainnet.infura.io/v3/YOUR_PROJECT_ID',
    polygon: process.env.POLYGON_RPC_URL || 'https://polygon-mainnet.infura.io/v3/YOUR_PROJECT_ID',
    arbitrum: process.env.ARBITRUM_RPC_URL || 'https://arbitrum-mainnet.infura.io/v3/YOUR_PROJECT_ID'
  };

  return new SmartContractManager(rpcUrls[network as keyof typeof rpcUrls], network);
}

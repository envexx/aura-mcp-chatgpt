import { NextApiRequest, NextApiResponse } from 'next';
import { ethers } from 'ethers';
import axios from 'axios';

interface WalletValidationResult {
  isValid: boolean;
  isConnected: boolean;
  hasBalance: boolean;
  actualBalance?: string;
  network?: string;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { address, expectedNetwork = 'ethereum' } = req.body;

    if (!address) {
      return res.status(400).json({ error: 'Wallet address is required' });
    }

    const result: WalletValidationResult = {
      isValid: false,
      isConnected: false,
      hasBalance: false
    };

    // 1. Validate address format
    try {
      const isValidAddress = ethers.isAddress(address);
      if (!isValidAddress) {
        result.error = 'Invalid wallet address format';
        return res.status(200).json(result);
      }
      result.isValid = true;
    } catch (error) {
      result.error = 'Invalid wallet address format';
      return res.status(200).json(result);
    }

    // 2. Check if wallet has any on-chain activity
    try {
      const provider = new ethers.JsonRpcProvider(
        process.env.ETHEREUM_RPC_URL || 'https://mainnet.infura.io/v3/YOUR_PROJECT_ID'
      );

      // Check ETH balance
      const balance = await provider.getBalance(address);
      const balanceInEth = ethers.formatEther(balance);
      
      result.actualBalance = balanceInEth;
      result.hasBalance = parseFloat(balanceInEth) > 0;
      result.network = expectedNetwork;

      // Check transaction count to see if wallet is active
      const txCount = await provider.getTransactionCount(address);
      result.isConnected = txCount > 0 || parseFloat(balanceInEth) > 0;

    } catch (error: any) {
      console.error('Error checking on-chain data:', error);
      result.error = 'Unable to verify wallet on-chain data';
    }

    // 3. Cross-check with AURA API data
    try {
      const auraResponse = await axios.get(
        `https://aura.adex.network/api/portfolio/balances?address=${address}`,
        { timeout: 5000 }
      );

      const auraData = auraResponse.data;
      
      // Check if AURA returns meaningful data or just mock data
      if (auraData.portfolio && auraData.portfolio.length > 0) {
        const totalValue = auraData.portfolio.reduce((sum: number, network: any) => {
          return sum + network.tokens.reduce((networkSum: number, token: any) => {
            return networkSum + (token.balanceUSD || 0);
          }, 0);
        }, 0);

        // If AURA shows significant value but on-chain shows no balance,
        // it might be mock data
        if (totalValue > 1000 && !result.hasBalance) {
          result.error = 'Data mismatch: AURA shows portfolio value but wallet appears empty on-chain. This might be demo data.';
        }
      }

    } catch (error) {
      console.log('AURA API not accessible, using on-chain data only');
    }

    res.status(200).json(result);

  } catch (error: any) {
    console.error('Wallet validation error:', error);
    res.status(500).json({
      isValid: false,
      isConnected: false,
      hasBalance: false,
      error: 'Internal server error during validation'
    });
  }
}

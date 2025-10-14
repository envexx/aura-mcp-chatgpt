import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { ethers } from 'ethers';

interface SwapConfirmationProps {
  to?: string;
  data?: string;
  value?: string;
  gasLimit?: string;
  tokenIn?: string;
  tokenOut?: string;
  amountIn?: string;
  amountOutMin?: string;
  recipient?: string;
  txHash?: string;
}

export default function SwapConfirmation() {
  const router = useRouter();
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState<string>('');
  const [error, setError] = useState<string>('');

  const {
    to,
    data,
    value = '0',
    gasLimit,
    tokenIn,
    tokenOut,
    amountIn,
    amountOutMin,
    recipient,
    txHash: existingTxHash
  } = router.query as SwapConfirmationProps;

  useEffect(() => {
    checkWalletConnection();
    if (existingTxHash) {
      setTxHash(existingTxHash);
    }
  }, [existingTxHash]);

  const checkWalletConnection = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setIsConnected(true);
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error);
      }
    }
  };

  const connectWallet = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);
        setIsConnected(true);
      } catch (error: any) {
        setError(`Failed to connect wallet: ${error.message}`);
      }
    } else {
      setError('MetaMask not detected. Please install MetaMask to continue.');
    }
  };

  const executeSwap = async () => {
    if (!isConnected || !to || !data) {
      setError('Missing transaction data or wallet not connected');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const transaction = {
        to,
        data,
        value: ethers.parseEther(value || '0'),
        gasLimit: gasLimit ? BigInt(gasLimit) : undefined
      };

      console.log('Executing swap transaction:', transaction);

      const tx = await signer.sendTransaction(transaction);
      setTxHash(tx.hash);

      // Wait for confirmation
      const receipt = await tx.wait();
      console.log('Transaction confirmed:', receipt);

    } catch (error: any) {
      console.error('Swap execution error:', error);
      setError(`Transaction failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const getExplorerUrl = (hash: string) => {
    return `https://etherscan.io/tx/${hash}`;
  };

  if (existingTxHash || txHash) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Swap Submitted Successfully!
            </h1>
            
            <p className="text-gray-600 mb-6">
              Your swap transaction has been submitted to the blockchain.
            </p>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600 mb-2">Transaction Hash:</p>
              <p className="font-mono text-sm break-all text-gray-900">
                {existingTxHash || txHash}
              </p>
            </div>

            <div className="space-y-3">
              <a
                href={getExplorerUrl(existingTxHash || txHash)}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                View on Etherscan
              </a>
              
              <button
                onClick={() => router.push('/')}
                className="block w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Confirm Swap Transaction
          </h1>
          <p className="text-gray-600">
            Review and confirm your swap details below
          </p>
        </div>

        {/* Swap Details */}
        {tokenIn && tokenOut && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">From:</span>
              <span className="font-semibold">{amountIn} {tokenIn}</span>
            </div>
            <div className="flex items-center justify-center my-2">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">To (minimum):</span>
              <span className="font-semibold">{amountOutMin} {tokenOut}</span>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Wallet Connection */}
        {!isConnected ? (
          <button
            onClick={connectWallet}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            Connect Wallet
          </button>
        ) : (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-green-800 text-sm">
                ✅ Wallet Connected: {account.slice(0, 6)}...{account.slice(-4)}
              </p>
            </div>

            <button
              onClick={executeSwap}
              disabled={isLoading || !to || !data}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Executing Swap...
                </div>
              ) : (
                'Confirm Swap'
              )}
            </button>

            <p className="text-xs text-gray-500 text-center">
              By confirming, you agree to execute this swap transaction. 
              Make sure you have sufficient ETH for gas fees.
            </p>
          </div>
        )}

        {/* Powered by AURA */}
        <div className="mt-6 pt-4 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-500">
            Powered by AURA MCP × Uniswap
          </p>
        </div>
      </div>
    </div>
  );
}

// Add TypeScript declaration for window.ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}

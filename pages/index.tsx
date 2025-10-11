import { useState } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { MetaMaskConnector } from 'wagmi/connectors/metaMask';
import type { Strategy, StrategiesResponse } from '../types/strategies';

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'portfolio' | 'strategies' | 'chat'>('portfolio');
  const [portfolioData, setPortfolioData] = useState<any>(null);
  const [strategiesData, setStrategiesData] = useState<StrategiesResponse | null>(null);
  const [chatMessage, setChatMessage] = useState('');
  const [chatResponse, setChatResponse] = useState<string | null>(null);

  const { address, isConnected } = useAccount();
  const { connect } = useConnect({
    connector: new MetaMaskConnector(),
  });
  const { disconnect } = useDisconnect();

  const handleGetPortfolio = async () => {
    if (!address) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/asset?address=${address}`);
      const data = await response.json();
      setPortfolioData(data);
    } catch (error) {
      console.error('Error fetching portfolio:', error);
    }
    setLoading(false);
  };

  const handleGetStrategies = async () => {
    if (!address) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/strategies?address=${address}`);
      const data = await response.json();
      setStrategiesData(data.data);
    } catch (error) {
      console.error('Error fetching strategies:', error);
    }
    setLoading(false);
  };

  const handleChatSubmit = async () => {
    if (!address) return;
    setLoading(true);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          address,
          message: chatMessage
        })
      });
      const data = await response.json();
      setChatResponse(data.chatAnswer);
    } catch (error) {
      console.error('Error getting chat response:', error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">
          AURA MCP Dashboard
        </h1>

        <div className="bg-white shadow rounded-lg p-6 mb-8">
          {!isConnected ? (
            <button
              onClick={() => connect()}
              className="w-full bg-blue-600 text-white rounded px-4 py-2"
            >
              Connect Wallet
            </button>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p>Connected: {address}</p>
                <button
                  onClick={() => disconnect()}
                  className="bg-red-600 text-white rounded px-4 py-2"
                >
                  Disconnect
                </button>
              </div>

              <div className="flex space-x-4 border-b">
                <button
                  className={`py-2 px-4 ${activeTab === 'portfolio' ? 'border-b-2 border-blue-500' : ''}`}
                  onClick={() => {
                    setActiveTab('portfolio');
                    handleGetPortfolio();
                  }}
                >
                  Portfolio
                </button>
                <button
                  className={`py-2 px-4 ${activeTab === 'strategies' ? 'border-b-2 border-blue-500' : ''}`}
                  onClick={() => {
                    setActiveTab('strategies');
                    handleGetStrategies();
                  }}
                >
                  Strategies
                </button>
                <button
                  className={`py-2 px-4 ${activeTab === 'chat' ? 'border-b-2 border-blue-500' : ''}`}
                  onClick={() => setActiveTab('chat')}
                >
                  AI Chat
                </button>
              </div>

              {loading && (
                <div className="text-center py-4">Loading...</div>
              )}

              {activeTab === 'portfolio' && portfolioData && (
                <div className="space-y-6">
                  <div className="bg-gray-50 p-4 rounded">
                    <h2 className="text-xl font-semibold mb-4">Portfolio Overview</h2>
                    <p>Total Value: ${(portfolioData?.data?.totalPortfolioValue || 0).toFixed(2)}</p>
                    
                    <h3 className="text-lg font-semibold mt-4 mb-2">Top Holdings</h3>
                    <div className="space-y-2">
                      {portfolioData?.data?.topHoldings?.map((holding: any) => {
                        const totalValue = typeof holding?.totalValue === 'number' ? holding.totalValue : 0;
                        const percentage = typeof holding?.percentage === 'number' ? holding.percentage : 0;
                        return (
                          <div key={holding?.symbol || 'unknown'} className="flex justify-between">
                            <span>{holding?.symbol || 'Unknown'}</span>
                            <span>${totalValue.toFixed(2)} ({percentage.toFixed(2)}%)</span>
                          </div>
                        );
                      }) || <p>No holdings data available</p>}
                    </div>

                    <h3 className="text-lg font-semibold mt-4 mb-2">Risk Analysis</h3>
                    <div className="space-y-2">
                      <p>Diversification Score: {portfolioData?.data?.riskAnalysis?.diversificationScore || 0}/100</p>
                      <p>Stablecoin Percentage: {(portfolioData?.data?.riskAnalysis?.stablecoinPercentage || 0).toFixed(2)}%</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'strategies' && (
                <div className="space-y-6">
                  <div className="bg-gray-50 p-4 rounded">
                    <h2 className="text-xl font-semibold mb-4">Strategy Analysis</h2>
                    <p>Total Strategies: {strategiesData?.analysis?.totalStrategies || 0}</p>
                    
                    <h3 className="text-lg font-semibold mt-4 mb-2">Risk Distribution</h3>
                    <div className="space-y-2">
                      <p>Low Risk: {strategiesData?.analysis?.riskDistribution?.low || 0}</p>
                      <p>Medium Risk: {strategiesData?.analysis?.riskDistribution?.medium || 0}</p>
                      <p>High Risk: {strategiesData?.analysis?.riskDistribution?.high || 0}</p>
                    </div>

                    <h3 className="text-lg font-semibold mt-4 mb-2">Available Strategies</h3>
                    <div className="space-y-4">
                      {strategiesData?.strategies?.map((strategy: Strategy, index: number) => (
                        <div key={index} className="border p-4 rounded">
                          <h4 className="font-semibold">{strategy?.name || 'Unnamed Strategy'}</h4>
                          <p className="text-sm text-gray-600">{strategy?.description || 'No description available'}</p>
                          <p className="text-sm mt-2">Risk: {strategy?.risk || 'Unknown'}</p>
                          <p className="text-sm">Potential Return: {strategy?.potentialReturn?.min || 0}% - {strategy?.potentialReturn?.max || 0}%</p>
                        </div>
                      )) || <p>No strategies available</p>}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'chat' && (
                <div className="space-y-4">
                  <textarea
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    placeholder="Ask about your portfolio or strategies..."
                    className="w-full p-2 border rounded"
                    rows={3}
                  />

                  <button
                    onClick={handleChatSubmit}
                    disabled={loading}
                    className="w-full bg-green-600 text-white rounded px-4 py-2 disabled:opacity-50"
                  >
                    Get AI Analysis
                  </button>

                  {chatResponse && (
                    <div className="bg-gray-50 p-4 rounded">
                      <h3 className="text-lg font-semibold mb-2">AI Response:</h3>
                      <p className="whitespace-pre-wrap">{chatResponse}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
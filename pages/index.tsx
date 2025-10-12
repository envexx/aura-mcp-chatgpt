import { Home, Database, MessageSquare, TrendingUp, Shield, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Documentation() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <h1 className="text-xl font-semibold text-gray-900">AURA MCP API Documentation</h1>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
        >
          {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`w-64 bg-gray-50 border-r border-gray-200 p-6 fixed inset-y-0 left-0 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:inset-0 transition-transform duration-200 ease-in-out z-30`}>
          <nav className="mt-8">
            <ul className="space-y-2">
              <li>
                <a href="#introduction" className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 hover:text-gray-900" onClick={() => setSidebarOpen(false)}>
                  <Home className="mr-3 h-5 w-5" />
                  Introduction
                </a>
              </li>
              <li>
                <a href="#asset" className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 hover:text-gray-900" onClick={() => setSidebarOpen(false)}>
                  <Database className="mr-3 h-5 w-5" />
                  Portfolio Analytics
                </a>
              </li>
              <li>
                <a href="#strategies" className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 hover:text-gray-900" onClick={() => setSidebarOpen(false)}>
                  <TrendingUp className="mr-3 h-5 w-5" />
                  Trading Strategies
                </a>
              </li>
              <li>
                <a href="#chat" className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 hover:text-gray-900" onClick={() => setSidebarOpen(false)}>
                  <MessageSquare className="mr-3 h-5 w-5" />
                  Chat Assistant
                </a>
              </li>
              <li>
                <a href="#trade" className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 hover:text-gray-900" onClick={() => setSidebarOpen(false)}>
                  <TrendingUp className="mr-3 h-5 w-5" />
                  Execute Trade
                </a>
              </li>
              <li>
                <a href="#privacy-policy" className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 hover:text-gray-900" onClick={() => setSidebarOpen(false)}>
                  <Shield className="mr-3 h-5 w-5" />
                  Privacy Policy
                </a>
              </li>
            </ul>
          </nav>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && <div className="fixed inset-0 z-20 bg-black bg-opacity-50 md:hidden" onClick={() => setSidebarOpen(false)}></div>}

        {/* Main Content */}
        <main className="flex-1 md:ml-0 p-8 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            <section id="introduction" className="mb-16">
              <h1 className="text-4xl font-bold text-gray-900 mb-6">Aura AI Trading Assistant MCP</h1>
              <p className="text-lg text-gray-700 mb-4">
                Advanced MCP server integrating AURA API with ChatGPT, automated trading, and x402 micropayments.
              </p>
              <p className="text-lg text-gray-700">
                This API provides endpoints for portfolio analytics, trading strategies, AI chat assistance, trade execution, and privacy policy access.
              </p>
            </section>

            <section id="asset" className="mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">GET /api/asset - Portfolio Analytics</h2>
              <p className="text-lg text-gray-700 mb-6">
                Get detailed portfolio analytics with AI insights.
              </p>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Parameters</h3>
              <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                <li><code className="bg-gray-100 px-2 py-1 rounded text-sm">address</code> (query, required): Wallet address to analyze (string)</li>
              </ul>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Example Request</h3>
              <pre className="bg-gray-100 p-4 rounded-lg text-sm text-gray-800 overflow-x-auto">
                <code>GET /api/asset?address=0x1234567890abcdef</code>
              </pre>
            </section>

            <section id="strategies" className="mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">GET /api/strategies - Trading Strategies</h2>
              <p className="text-lg text-gray-700 mb-6">
                Get AI-powered trading strategies and recommendations.
              </p>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Parameters</h3>
              <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                <li><code className="bg-gray-100 px-2 py-1 rounded text-sm">address</code> (query, required): Wallet address to analyze (string)</li>
              </ul>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Example Request</h3>
              <pre className="bg-gray-100 p-4 rounded-lg text-sm text-gray-800 overflow-x-auto">
                <code>GET /api/strategies?address=0x1234567890abcdef</code>
              </pre>
            </section>

            <section id="chat" className="mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">POST /api/chat - Chat Assistant</h2>
              <p className="text-lg text-gray-700 mb-6">
                Interactive AI assistant for portfolio analysis and strategy advice.
              </p>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Request Body</h3>
              <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                <li><code className="bg-gray-100 px-2 py-1 rounded text-sm">address</code> (optional): Wallet address (string)</li>
                <li><code className="bg-gray-100 px-2 py-1 rounded text-sm">message</code> (optional): User message (string)</li>
              </ul>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Example Request</h3>
              <pre className="bg-gray-100 p-4 rounded-lg text-sm text-gray-800 overflow-x-auto">
                <code>POST /api/chat
Content-Type: application/json

{`{
  "address": "0x1234567890abcdef",
  "message": "What is my portfolio value?"
}`}</code>
              </pre>
            </section>

            <section id="trade" className="mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">POST /api/trade - Execute Trade</h2>
              <p className="text-lg text-gray-700 mb-6">
                Execute trades with automation rules and smart order routing.
              </p>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Request Body</h3>
              <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                <li><code className="bg-gray-100 px-2 py-1 rounded text-sm">address</code> (required): Wallet address (string)</li>
                <li><code className="bg-gray-100 px-2 py-1 rounded text-sm">fromToken</code> (required): Token to sell (string)</li>
                <li><code className="bg-gray-100 px-2 py-1 rounded text-sm">toToken</code> (required): Token to buy (string)</li>
                <li><code className="bg-gray-100 px-2 py-1 rounded text-sm">amount</code> (required): Amount to trade (string)</li>
                <li><code className="bg-gray-100 px-2 py-1 rounded text-sm">slippage</code> (optional): Allowed slippage percentage (number)</li>
                <li><code className="bg-gray-100 px-2 py-1 rounded text-sm">automationRules</code> (optional): Automated trading rules (array of objects)</li>
              </ul>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Example Request</h3>
              <pre className="bg-gray-100 p-4 rounded-lg text-sm text-gray-800 overflow-x-auto">
                <code>POST /api/trade
Content-Type: application/json

{`{
  "address": "0x1234567890abcdef",
  "fromToken": "ETH",
  "toToken": "USDC",
  "amount": "1.0"
}`}</code>
              </pre>
            </section>

            <section id="privacy-policy" className="mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">GET /api/privacy-policy - Privacy Policy</h2>
              <p className="text-lg text-gray-700 mb-6">
                Get the privacy policy details.
              </p>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Response</h3>
              <pre className="bg-gray-100 p-4 rounded-lg text-sm text-gray-800 overflow-x-auto">
                <code>{`{
  "success": true,
  "data": {
    "version": "1.0",
    "lastUpdated": "2023-10-01",
    "policyDetails": {}
  }
}`}</code>
              </pre>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

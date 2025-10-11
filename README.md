# AURA AI Trading Assistant MCP

![AURA MCP Banner](https://aura.adex.network/assets/banner.png)

An advanced Model Context Protocol (MCP) server that integrates AURA API with ChatGPT, automated trading features, and x402 micropayments. This project is built for the AdEx AURA API Hackathon, combining the power of AI with DeFi analytics and automation.

## 🌟 Features

### 🤖 AI-Powered Analytics
- **Portfolio Analysis**: Deep insights into your crypto holdings
- **Risk Assessment**: Advanced risk profiling and diversification scoring
- **Natural Language Interface**: Chat with AI about your portfolio
- **Strategy Recommendations**: AI-driven investment strategies

### 📈 Automated Trading
- **Smart Order Routing**: Optimized trade execution
- **Automation Rules**:
  - Stop Loss
  - Take Profit
  - Price Target Monitoring
- **Multi-token Support**: Trade across various tokens and networks
- **Slippage Protection**: Built-in mechanisms to prevent excessive slippage

### 💳 x402 Integration
- **Pay-per-use Model**: Micropayments for premium features
- **Service Pricing**:
  - Portfolio Analysis: 0.001 USDC
  - Strategy Recommendations: 0.002 USDC
  - Trade Execution: 0.005 USDC
  - Automated Trading: 0.01 USDC
- **QR Code Payments**: Easy payment flow integration

### 🌐 Multi-Network Support
- Ethereum
- Polygon
- Optimism
- Arbitrum
- Base

## 🚀 Getting Started

### Prerequisites
- Node.js 16+
- npm or yarn
- MetaMask or compatible Web3 wallet

### Installation

1. Clone the repository:
\`\`\`bash
git clone https://github.com/your-username/aura-mcp.git
cd aura-mcp
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Create a \`.env\` file in the root directory:
\`\`\`env
OPENAI_API_KEY=your_openai_api_key_here
NEXT_PUBLIC_AURA_API_URL=https://aura.adex.network/api
\`\`\`

4. Run the development server:
\`\`\`bash
npm run dev
\`\`\`

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🔧 API Endpoints

### Portfolio Analysis
\`\`\`http
GET /api/asset?address={wallet_address}
\`\`\`
Returns comprehensive portfolio analysis including:
- Total portfolio value
- Token holdings
- Risk analysis
- Diversification score

### Strategy Recommendations
\`\`\`http
GET /api/strategies?address={wallet_address}
\`\`\`
Provides AI-powered strategy recommendations with:
- Risk-based categorization
- Expected returns
- Implementation steps
- Platform suggestions

### AI Chat Interface
\`\`\`http
POST /api/chat
{
  "address": "wallet_address",
  "message": "user_query"
}
\`\`\`
Interactive AI assistant for portfolio and strategy discussions

### Automated Trading
\`\`\`http
POST /api/trade
{
  "address": "wallet_address",
  "fromToken": "token_address",
  "toToken": "token_address",
  "amount": "amount",
  "automationRules": [
    {
      "type": "STOP_LOSS",
      "percentage": 5,
      "action": "SELL"
    }
  ]
}
\`\`\`

## 💡 Use Cases

1. **Portfolio Management**
   - Track and analyze crypto holdings
   - Get diversification recommendations
   - Monitor risk exposure

2. **Automated Trading**
   - Set up automated trading rules
   - Execute trades with AI assistance
   - Monitor and adjust strategies

3. **DeFi Strategy Optimization**
   - Get yield farming suggestions
   - Analyze liquidity opportunities
   - Track and optimize gas costs

4. **Risk Management**
   - Set up stop-loss orders
   - Monitor portfolio health
   - Get real-time risk alerts

## 🔐 Security

- All API endpoints are secured with proper authentication
- Automated trading rules are validated and sanitized
- Rate limiting implemented on all endpoints
- No private keys are ever stored or required
- All transactions require wallet signature

## 🛠 Tech Stack

- **Frontend**: Next.js, React, TailwindCSS
- **Backend**: Next.js API Routes
- **Blockchain**: Wagmi, Ethers.js
- **AI**: OpenAI GPT-3.5/4
- **Payments**: x402 Protocol
- **Data**: AURA API

## 📈 Performance

The MCP server is optimized for:
- Low latency responses (<500ms)
- High throughput capability
- Efficient caching of portfolio data
- Minimal gas costs for trades

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch:
   \`\`\`bash
   git checkout -b feature/amazing-feature
   \`\`\`
3. Commit your changes:
   \`\`\`bash
   git commit -m 'Add amazing feature'
   \`\`\`
4. Push to the branch:
   \`\`\`bash
   git push origin feature/amazing-feature
   \`\`\`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- AdEx Network for the AURA API
- OpenAI for GPT integration capabilities
- x402 Protocol for micropayments infrastructure

## 📞 Support

For support and queries:
- Join our [Telegram Group](https://t.me/aura_mcp_support)
- Create an issue in this repository
- Email: support@aura-mcp.com

---

Built with ❤️ for the AdEx AURA API Hackathon
# AURA AI Trading Assistant MCP

![AURA MCP Banner](https://aura.adex.network/assets/banner.png)

An advanced Model Context Protocol (MCP) server that integrates AURA API with ChatGPT, automated trading features, and x402 micropayments. This project is built for the AdEx AURA API Hackathon, combining the power of AI with DeFi analytics and automation.

## 🌟 Features

### Aura MCP Server

Aura MCP (Model Context Protocol) Server adalah platform trading AI yang menyediakan analisis portfolio, rekomendasi strategi, dan eksekusi trade dengan sistem micropayment terintegrasi.

## 🚀 Available Tools

### 💰 Core Trading Tools (FREE)

| Tool | Description | Cost | Input |
|------|-------------|------|-------|
| `analyze_portfolio` | AI portfolio analysis | **FREE** | wallet_address |
| `get_strategies` | Investment strategies | **FREE** | wallet_address, risk_tolerance |
| `execute_trade` | Execute trades | **FREE** | wallet_address, from_token, to_token, amount |
| `setup_automation` | Trading automation | **FREE** | wallet_address, automation_type, parameters |

### 🔄 Uniswap Integration Tools (PAID)

| Tool | Description | Cost | Input |
|------|-------------|------|-------|
| `get_swap_quote` | Real-time swap quotes | **0.005 USDC** | wallet_address, token_in, token_out, amount_in |
| `execute_swap` | Execute Uniswap swaps | **0.005 USDC** | wallet_address, token_in, token_out, amount_in |
| `get_supported_tokens` | List supported tokens | **FREE** | chain (optional) |

### 💳 Payment Tools

| Tool | Description | Cost | Input |
|------|-------------|------|-------|
| `create_payment` | Create micropayment | Free | wallet_address, service |
| `verify_payment` | Verify payment status | Free | payment_id |

## 🌐 Supported Chains

- **Ethereum** (Chain ID: 1)
- **Optimism** (Chain ID: 10) 
- **Polygon** (Chain ID: 137)
- **Arbitrum** (Chain ID: 42161)
- **Base** (Chain ID: 8453)

## ⚡ Quick Start

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment** (`.env`):
   ```env
   WALLET_PRIVATE_KEY=your_private_key
   INFURA_KEY=your_infura_key
   OPENAI_API_KEY=your_openai_key
   ```

3. **Start server**:
   ```bash
   npm run dev
   ```

## 📝 Usage Examples

### Get Swap Quote
```json
{
  "name": "get_swap_quote",
  "arguments": {
    "wallet_address": "0x...",
    "token_in": "NATIVE",
    "token_out": "0xA0b86a33E6417c8C4e5F5B0b1e8C5C5F5E5D5C5B",
    "amount_in": "1.0",
    "chain": "ethereum"
  }
}
```

### Execute Trade
```json
{
  "name": "execute_trade",
  "arguments": {
    "wallet_address": "0x...",
    "from_token": "ETH",
    "to_token": "USDC",
    "amount": "0.5",
    "slippage": 0.5
  }
}
```

### Portfolio Analysis
```json
{
  "name": "analyze_portfolio",
  "arguments": {
    "wallet_address": "0x..."
  }
}
```

## 💡 Key Features

- **x402 Micropayments**: Pay-per-use dengan USDC
- **Multi-Chain Support**: 5 blockchain utama
- **Smart Routing**: Optimasi harga dengan Uniswap
- **AI Analysis**: Portfolio insights dengan OpenAI
- **Automated Trading**: Setup trading rules
- **Real-time Quotes**: Live price data

## 🔒 Security

- Private keys di environment variables
- Payment verification untuk setiap transaksi
- Balance validation sebelum trade
- Slippage protection
- Comprehensive error handling

## 🛠️ Development

```
aura-mcp/
├── lib/uniswap-integration.ts   # Uniswap integration
├── lib/x402-payment.js         # Payment system  
├── mcp-server.ts              # Main MCP server
└── pages/api/                 # API endpoints
```

## 📞 Support

**Common Issues**:
- Check INFURA_KEY validity
- Verify wallet balance
- Ensure payment confirmation
- Check slippage tolerance

**Environment Setup**:
- Node.js 18+
- Valid Ethereum wallet
- Infura API access
- USDC for payments

## 🙏 Acknowledgments

- AdEx Network for the AURA API
- OpenAI for GPT integration capabilities

## 🚀 Getting Started

### Prerequisites
- Node.js 16+
- npm or yarn
- MetaMask or compatible Web3 wallet

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/aura-mcp.git
cd aura-mcp
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
OPENAI_API_KEY=your_openai_api_key_here
NEXT_PUBLIC_AURA_API_URL=https://aura.adex.network/api
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🔧 API Endpoints

### Portfolio Analysis
```http
GET /api/asset?address={wallet_address}
```
Returns comprehensive portfolio analysis including:
- Total portfolio value
- Token holdings
- Risk analysis
- Diversification score

### Strategy Recommendations
```http
GET /api/strategies?address={wallet_address}
```
Provides AI-powered strategy recommendations with:
- Risk-based categorization
- Expected returns
- Implementation steps
- Platform suggestions

### AI Chat Interface
```http
POST /api/chat
{
  "address": "wallet_address",
  "message": "user_query"
}
```
Interactive AI assistant for portfolio and strategy discussions

### Automated Trading
```http
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
```

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
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. Commit your changes:
   ```bash
   git commit -m 'Add amazing feature'
   ```
4. Push to the branch:
   ```bash
   git push origin feature/amazing-feature
   ```
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
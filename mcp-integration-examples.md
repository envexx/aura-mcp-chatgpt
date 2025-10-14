# MCP API Integration Examples

## 🎯 Menggunakan MCP sebagai Single Source of Truth

MCP AURA telah terbukti sangat fleksibel untuk digunakan sebagai satu-satunya sumber data untuk berbagai platform. Berikut adalah contoh implementasi:

## 📊 Test Results dengan Wallet: `0x841ed663F2636863D40be4EE76243377dff13a34`

### Portfolio Analysis
- **Total Value**: $408,251,739.07
- **Networks**: 6 (Ethereum, Polygon, OP Mainnet, Avalanche, Arbitrum, Base)
- **Risk Score**: 100/100
- **Top Holding**: ETH (52.5%)

### AI-Generated Strategies
1. **Portfolio Diversification** (Low Risk)
   - APY: 5-8%
   - Platforms: Uniswap, 1inch
   - Action: Rebalance portfolio to reduce concentration risk

2. **DeFi Yield Farming** (Medium Risk)
   - APY: 8-15%
   - Platforms: Aave, Compound
   - Action: Provide liquidity to earn trading fees and rewards

3. **Staking Rewards** (Low Risk)
   - APY: 4-6%
   - Platforms: Lido, Rocket Pool
   - Action: Stake tokens to earn network rewards

4. **Advanced DeFi Strategies** (High Risk)
   - APY: 15-30%
   - Platforms: Yearn Finance, Convex
   - Action: Leverage farming and advanced yield strategies

## 🔌 Integration Examples

### 1. Web Application Integration

```javascript
// React/Next.js Example
const usePortfolioData = (address) => {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      // Single API call untuk semua data
      const [portfolio, strategies] = await Promise.all([
        fetch(`http://localhost:3001/api/asset?address=${address}`),
        fetch(`http://localhost:3001/api/strategies?address=${address}`)
      ]);
      
      setData({
        portfolio: await portfolio.json(),
        strategies: await strategies.json()
      });
    };
    
    fetchData();
  }, [address]);
  
  return data;
};
```

### 2. Telegram Bot Integration

```javascript
// Telegram Bot Example
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

const bot = new TelegramBot(TOKEN, { polling: true });

bot.onText(/\/portfolio (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const address = match[1];
  
  try {
    // Gunakan MCP API sebagai sumber data tunggal
    const portfolio = await axios.get(`http://localhost:3001/api/asset?address=${address}`);
    const strategies = await axios.get(`http://localhost:3001/api/strategies?address=${address}`);
    
    const message = `
💰 Portfolio Value: $${portfolio.data.data.totalPortfolioValue.toFixed(2)}
🏦 Networks: ${portfolio.data.data.networks.length}
📈 Risk Score: ${portfolio.data.data.riskAnalysis.diversificationScore}/100

🎯 Recommended Strategies:
${strategies.data.data.strategies.map((s, i) => 
  `${i+1}. ${s.name} (${s.risk} Risk) - ${s.actions[0].apy} APY`
).join('\n')}
    `;
    
    bot.sendMessage(chatId, message);
  } catch (error) {
    bot.sendMessage(chatId, 'Error fetching portfolio data');
  }
});
```

### 3. Discord Bot Integration

```javascript
// Discord Bot Example
const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

client.on('messageCreate', async message => {
  if (message.content.startsWith('!portfolio ')) {
    const address = message.content.split(' ')[1];
    
    try {
      const portfolio = await axios.get(`http://localhost:3001/api/asset?address=${address}`);
      const strategies = await axios.get(`http://localhost:3001/api/strategies?address=${address}`);
      
      const embed = {
        title: '📊 Portfolio Analysis',
        fields: [
          {
            name: '💰 Total Value',
            value: `$${portfolio.data.data.totalPortfolioValue.toFixed(2)}`,
            inline: true
          },
          {
            name: '🏦 Networks',
            value: portfolio.data.data.networks.length.toString(),
            inline: true
          },
          {
            name: '📈 Risk Score',
            value: `${portfolio.data.data.riskAnalysis.diversificationScore}/100`,
            inline: true
          },
          {
            name: '🎯 Top Strategy',
            value: `${strategies.data.data.strategies[0].name} (${strategies.data.data.strategies[0].actions[0].apy} APY)`,
            inline: false
          }
        ],
        color: 0x00ff00
      };
      
      message.reply({ embeds: [embed] });
    } catch (error) {
      message.reply('Error fetching portfolio data');
    }
  }
});
```

### 4. Mobile App Integration (React Native)

```javascript
// React Native Example
import axios from 'axios';

const PortfolioScreen = ({ route }) => {
  const { address } = route.params;
  const [portfolioData, setPortfolioData] = useState(null);
  const [strategies, setStrategies] = useState([]);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [portfolioRes, strategiesRes] = await Promise.all([
          axios.get(`http://your-mcp-server.com/api/asset?address=${address}`),
          axios.get(`http://your-mcp-server.com/api/strategies?address=${address}`)
        ]);
        
        setPortfolioData(portfolioRes.data.data);
        setStrategies(strategiesRes.data.data.strategies);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    
    fetchData();
  }, [address]);
  
  return (
    <ScrollView>
      <PortfolioCard data={portfolioData} />
      <StrategiesList strategies={strategies} />
    </ScrollView>
  );
};
```

## 🌟 Keunggulan MCP sebagai Single Source

### ✅ Advantages:
1. **Unified API**: Satu endpoint untuk semua kebutuhan
2. **Consistent Data**: Data portfolio dan strategies selalu sinkron
3. **AI-Powered**: Strategies dibuat berdasarkan analisis portfolio real-time
4. **Cross-Platform**: Bisa digunakan di web, mobile, bot, desktop
5. **Real-time**: Data selalu up-to-date dari blockchain
6. **Scalable**: Mudah ditambahkan fitur baru

### 🔧 API Endpoints Summary:
- `GET /api/asset?address={wallet}` - Portfolio analysis
- `GET /api/strategies?address={wallet}` - AI-generated strategies
- `POST /api/chat` - AI assistant (dengan OpenAI API key)
- `POST /api/trade` - Execute trades
- `POST /api/execute-strategy` - **NEW**: Execute AI strategies automatically
- `GET/POST/PUT/DELETE /api/automation` - **NEW**: Manage automation rules
- `GET /api/privacy-policy` - Privacy policy

## 🚀 Deployment Ready

MCP sudah siap untuk production dengan:
- CORS enabled untuk web integration
- Error handling yang robust
- Rate limiting protection
- Comprehensive logging
- OpenAPI documentation

## 🤖 NEW: Advanced AI Trading Execution

### Fitur Terbaru yang Ditambahkan:

#### 1. **Automated Strategy Execution** (`/api/execute-strategy`)
- Eksekusi otomatis strategi AI berdasarkan analisis portfolio
- Smart contract integration untuk Uniswap, Aave, Lido, dll
- Risk management dan safety checks
- Multi-step transaction execution
- Real-time monitoring dan reporting

```javascript
// Example: Execute AI strategy automatically
const response = await axios.post('/api/execute-strategy', {
  address: '0x841ed663F2636863D40be4EE76243377dff13a34',
  strategyId: '0', // Index of strategy to execute
  autoExecute: true,
  riskTolerance: 'medium', // low, medium, high
  maxSlippage: 0.5,
  maxGasPrice: '50' // gwei
});

console.log(response.data);
// {
//   success: true,
//   executionId: "exec_1697123456789",
//   strategy: "DeFi Yield Farming",
//   steps: [
//     { type: "SWAP", status: "SUCCESS", txHash: "0x...", gasUsed: "150000" },
//     { type: "STAKE", status: "SUCCESS", txHash: "0x...", gasUsed: "200000" }
//   ],
//   totalGasUsed: 350000,
//   estimatedProfit: 1250.50,
//   actualProfit: 1245.30
// }
```

#### 2. **Automation Engine** (`/api/automation`)
- Price-based triggers
- Time-based execution (cron-like)
- Portfolio rebalancing automation
- Yield optimization monitoring
- Cooldown periods dan execution limits

```javascript
// Example: Create automation rule
const rule = await axios.post('/api/automation', {
  action: 'create',
  userId: '0x841ed663F2636863D40be4EE76243377dff13a34',
  strategyId: '1',
  type: 'YIELD_OPTIMIZATION',
  conditions: {
    yieldThreshold: 15 // Execute when yield > 15%
  },
  actions: {
    executeStrategy: true,
    notifyUser: true,
    maxExecutions: 10,
    cooldownPeriod: 120 // 2 hours
  },
  status: 'ACTIVE'
});
```

#### 3. **Smart Contract Integration Library** (`/lib/smart-contracts.ts`)
- Pre-built contract interactions untuk major DeFi protocols
- Transaction builder untuk complex strategies
- Gas optimization dan price impact calculation
- Multi-network support (Ethereum, Polygon, Arbitrum)

#### 4. **Enhanced Safety Features**
- **Gas Price Monitoring**: Automatic execution pause saat gas tinggi
- **Price Impact Protection**: Reject trades dengan slippage berlebihan
- **Balance Verification**: Check sufficient funds sebelum execution
- **Transaction Simulation**: Dry-run sebelum actual execution
- **MEV Protection**: Delay antar transactions untuk avoid sandwich attacks

### 🎯 Use Cases Baru:

1. **Automated Yield Farming**
   - Monitor yield opportunities 24/7
   - Auto-compound rewards
   - Rebalance positions berdasarkan market conditions

2. **Smart Portfolio Rebalancing**
   - Maintain target allocation percentages
   - Trigger rebalancing pada volatility tinggi
   - Tax-loss harvesting automation

3. **DCA (Dollar Cost Averaging) Strategies**
   - Scheduled purchases berdasarkan time intervals
   - Price-based DCA (buy dips automatically)
   - Multi-asset DCA dengan dynamic allocation

4. **Risk Management Automation**
   - Stop-loss orders untuk DeFi positions
   - Automatic position sizing berdasarkan portfolio risk
   - Correlation-based diversification

### 🔧 Integration Examples:

#### Telegram Bot dengan Auto-Execution:
```javascript
bot.onText(/\/auto-trade (.+) (.+)/, async (msg, match) => {
  const address = match[1];
  const strategyIndex = match[2];
  
  const result = await axios.post('/api/execute-strategy', {
    address,
    strategyId: strategyIndex,
    autoExecute: true,
    riskTolerance: 'medium'
  });
  
  bot.sendMessage(msg.chat.id, 
    `🤖 Auto-execution ${result.data.success ? 'SUCCESS' : 'FAILED'}\n` +
    `Strategy: ${result.data.strategy}\n` +
    `Profit: $${result.data.actualProfit.toFixed(2)}\n` +
    `Gas Used: ${result.data.totalGasUsed.toLocaleString()}`
  );
});
```

#### Discord Bot dengan Automation Management:
```javascript
client.on('messageCreate', async message => {
  if (message.content.startsWith('!setup-automation ')) {
    const [, address, type, threshold] = message.content.split(' ');
    
    await axios.post('/api/automation', {
      action: 'create',
      userId: address,
      type: type.toUpperCase(),
      conditions: { yieldThreshold: parseFloat(threshold) },
      actions: { executeStrategy: true, notifyUser: true }
    });
    
    message.reply('✅ Automation rule created successfully!');
  }
});
```

**Kesimpulan**: MCP AURA kini tidak hanya menyediakan data dan insights, tetapi juga **eksekusi trading otomatis yang cerdas** dengan AI-powered decision making, smart contract integration, dan comprehensive risk management. Ini menjadikan MCP sebagai **complete trading automation platform** yang siap production!

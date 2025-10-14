# AURA MCP Troubleshooting Guide

## Common Issues and Solutions

### 1. "Invalid URL" Error in Trade Endpoint

**Problem**: The rebalancing trade fails with "Invalid URL" error.

**Root Cause**: Missing or incorrectly configured environment variables.

**Solution**:
1. Run the setup script:
   ```bash
   npm run setup
   ```

2. Or manually create a `.env` file with:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   NEXT_PUBLIC_AURA_API_URL=https://aura.adex.network/api
   NEXT_PUBLIC_API_URL=http://localhost:3000
   ```

3. Restart your development server:
   ```bash
   npm run dev
   ```

### 2. Environment Variable Configuration

**Check your configuration**:
```bash
npm run config:validate
```

**Required Variables**:
- `OPENAI_API_KEY`: Get from [OpenAI Platform](https://platform.openai.com/api-keys)
- `NEXT_PUBLIC_AURA_API_URL`: Should be `https://aura.adex.network/api`

**Optional Variables**:
- `ETHEREUM_RPC_URL`: Infura/Alchemy endpoint for Ethereum
- `POLYGON_RPC_URL`: RPC endpoint for Polygon
- `ARBITRUM_RPC_URL`: RPC endpoint for Arbitrum

### 3. Rebalancing Issues

**If automated rebalancing fails**:

1. **Check API endpoints**: Ensure AURA API is accessible
2. **Verify wallet connection**: Make sure wallet is connected
3. **Check token balances**: Ensure sufficient balance for trades
4. **Use manual rebalancing**: Follow the fallback instructions

**Manual Rebalancing Steps**:
1. Go to [1inch](https://1inch.io) or [Uniswap](https://uniswap.org)
2. Connect your wallet
3. Swap tokens according to target allocation:
   - USDC: 40%
   - ETH: 25%
   - BTC: 25%
4. Set slippage to 1%

### 4. API Endpoint Issues

**Portfolio API not working**:
```bash
# Test the endpoint directly
curl "https://aura.adex.network/api/portfolio/balances?address=YOUR_WALLET_ADDRESS"
```

**Trade API not working**:
- Check if the AURA API is online
- Verify your wallet address format
- Ensure you have sufficient balance

### 5. Development Server Issues

**Port already in use**:
```bash
# Kill process on port 3000
npx kill-port 3000

# Or use a different port
PORT=3001 npm run dev
```

**Module not found errors**:
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### 6. Wallet Connection Issues

**MetaMask not connecting**:
1. Refresh the page
2. Check if MetaMask is unlocked
3. Switch to the correct network
4. Clear browser cache

**Wrong network**:
- Switch to Ethereum Mainnet in MetaMask
- Or configure the app for your preferred network

### 7. Trading Errors

**Insufficient balance**:
- Check your token balances
- Ensure you have enough ETH for gas fees

**High slippage**:
- Increase slippage tolerance (up to 5%)
- Try smaller trade amounts
- Wait for better market conditions

**Transaction failed**:
- Check gas price settings
- Increase gas limit
- Retry the transaction

### 8. AI Features Not Working

**OpenAI API errors**:
1. Verify your API key is correct
2. Check your OpenAI account has credits
3. Ensure API key has proper permissions

**Chat not responding**:
- Check browser console for errors
- Verify API key configuration
- Try refreshing the page

## Getting Help

### Debug Information

When reporting issues, include:

1. **Environment**:
   ```bash
   node --version
   npm --version
   ```

2. **Configuration check**:
   ```bash
   npm run config:validate
   ```

3. **Browser console errors** (F12 → Console)

4. **Server logs** from your terminal

### Contact Support

- **GitHub Issues**: [Create an issue](https://github.com/your-repo/aura-mcp/issues)
- **Telegram**: [Join our support group](https://t.me/aura_mcp_support)
- **Email**: support@aura-mcp.com

### Useful Commands

```bash
# Setup environment
npm run setup

# Validate configuration
npm run config:validate

# Start development server
npm run dev

# Build for production
npm run build

# Check for linting issues
npm run lint
```

## Advanced Troubleshooting

### Network Issues

If you're having connectivity issues:

1. **Check AURA API status**:
   ```bash
   curl -I https://aura.adex.network/api/health
   ```

2. **Test with different RPC**:
   - Try different Infura/Alchemy endpoints
   - Use public RPC endpoints as fallback

3. **Proxy/Firewall issues**:
   - Check corporate firewall settings
   - Try using a VPN
   - Whitelist required domains

### Performance Issues

**Slow API responses**:
- Check your internet connection
- Try different RPC providers
- Reduce the number of concurrent requests

**High gas fees**:
- Wait for lower network congestion
- Use Layer 2 solutions (Polygon, Arbitrum)
- Adjust gas price settings

### Data Issues

**Incorrect portfolio values**:
- Refresh the page
- Check if token prices are updating
- Verify wallet address is correct

**Missing tokens**:
- Ensure tokens are on supported networks
- Check if tokens have sufficient liquidity
- Verify token contract addresses

---

**Still having issues?** Don't hesitate to reach out for support!

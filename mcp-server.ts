#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';
import { X402PaymentManager, SERVICE_PRICING } from './lib/x402-payment.js';
import { UniswapIntegration } from './lib/uniswap-integration.js';

class AuraMCPServer {
  private server: Server;
  private paymentManager: X402PaymentManager;
  private uniswapIntegration: UniswapIntegration;

  constructor() {
    this.server = new Server(
      {
        name: 'aura-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.paymentManager = new X402PaymentManager();
    this.uniswapIntegration = new UniswapIntegration();
    this.setupToolHandlers();
  }

  private setupToolHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'analyze_portfolio',
            description: 'Analyze crypto portfolio with AI insights (Free)',
            inputSchema: {
              type: 'object',
              properties: {
                wallet_address: {
                  type: 'string',
                  description: 'Ethereum wallet address to analyze',
                },
              },
              required: ['wallet_address'],
            },
          },
          {
            name: 'get_strategies',
            description: 'Get AI-powered investment strategies (Free)',
            inputSchema: {
              type: 'object',
              properties: {
                wallet_address: {
                  type: 'string',
                  description: 'Ethereum wallet address',
                },
                risk_tolerance: {
                  type: 'string',
                  enum: ['conservative', 'moderate', 'aggressive'],
                  description: 'Risk tolerance level',
                },
              },
              required: ['wallet_address'],
            },
          },
          {
            name: 'execute_trade',
            description: 'Execute automated trade (Free)',
            inputSchema: {
              type: 'object',
              properties: {
                wallet_address: { type: 'string' },
                from_token: { type: 'string' },
                to_token: { type: 'string' },
                amount: { type: 'string' },
                slippage: { type: 'number', default: 0.5 },
              },
              required: ['wallet_address', 'from_token', 'to_token', 'amount'],
            },
          },
          {
            name: 'setup_automation',
            description: 'Setup trading automation rules (Free)',
            inputSchema: {
              type: 'object',
              properties: {
                wallet_address: { type: 'string' },
                automation_type: {
                  type: 'string',
                  enum: ['stop_loss', 'take_profit', 'rebalance', 'yield_optimization'],
                },
                parameters: { type: 'object' },
              },
              required: ['wallet_address', 'automation_type'],
            },
          },
          {
            name: 'create_payment',
            description: 'Create x402 micropayment for premium features',
            inputSchema: {
              type: 'object',
              properties: {
                wallet_address: { type: 'string' },
                service: {
                  type: 'string',
                  enum: ['portfolio_analysis', 'strategy_recommendations', 'trade_execution', 'automated_trading'],
                },
              },
              required: ['wallet_address', 'service'],
            },
          },
          {
            name: 'verify_payment',
            description: 'Verify x402 payment status',
            inputSchema: {
              type: 'object',
              properties: {
                payment_id: { type: 'string' },
              },
              required: ['payment_id'],
            },
          },
          {
            name: 'get_swap_quote',
            description: 'Get optimal swap quote from Uniswap MCP (Requires 0.005 USDC payment)',
            inputSchema: {
              type: 'object',
              properties: {
                wallet_address: { type: 'string' },
                token_in: { type: 'string' },
                token_out: { type: 'string' },
                amount_in: { type: 'string' },
                slippage: { type: 'number', default: 0.5 },
                chain: { type: 'string', default: 'ethereum' },
              },
              required: ['wallet_address', 'token_in', 'token_out', 'amount_in'],
            },
          },
          {
            name: 'execute_swap',
            description: 'Execute swap via Uniswap MCP (Requires 0.005 USDC payment)',
            inputSchema: {
              type: 'object',
              properties: {
                wallet_address: { type: 'string' },
                token_in: { type: 'string' },
                token_out: { type: 'string' },
                amount_in: { type: 'string' },
                amount_out_min: { type: 'string' },
                slippage: { type: 'number', default: 0.5 },
                chain: { type: 'string', default: 'ethereum' },
              },
              required: ['wallet_address', 'token_in', 'token_out', 'amount_in', 'amount_out_min'],
            },
          },
          {
            name: 'get_supported_tokens',
            description: 'Get list of supported tokens for swapping',
            inputSchema: {
              type: 'object',
              properties: {
                chain: { type: 'string', default: 'ethereum' },
              },
            },
          },
        ] as Tool[],
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'analyze_portfolio':
            return await this.handlePortfolioAnalysis(args);
          
          case 'get_strategies':
            return await this.handleGetStrategies(args);
          
          case 'execute_trade':
            return await this.handleExecuteTrade(args);
          
          case 'setup_automation':
            return await this.handleSetupAutomation(args);
          
          case 'create_payment':
            return await this.handleCreatePayment(args);
          
          case 'verify_payment':
            return await this.handleVerifyPayment(args);
          
          case 'get_swap_quote':
            return await this.handleGetSwapQuote(args);
          
          case 'execute_swap':
            return await this.handleExecuteSwap(args);
          
          case 'get_supported_tokens':
            return await this.handleGetSupportedTokens(args);
          
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error: any) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error.message}`,
            },
          ],
        };
      }
    });
  }

  private async handlePortfolioAnalysis(args: any) {
    const { wallet_address } = args;

    // Proceed with analysis (no payment required)
    try {
      const response = await axios.get(`http://localhost:3000/api/asset?address=${wallet_address}`);
      
      return {
        content: [
          {
            type: 'text',
            text: `✅ **Portfolio Analysis Complete** (Free Service)

${JSON.stringify(response.data, null, 2)}`,
          },
        ],
      };
    } catch (error: any) {
      throw new Error(`Failed to analyze portfolio: ${error.message}`);
    }
  }

  private async handleGetStrategies(args: any) {
    const { wallet_address, risk_tolerance = 'moderate' } = args;

    // No payment required for strategies

    try {
      const response = await axios.get(
        `http://localhost:3000/api/strategies?address=${wallet_address}&risk=${risk_tolerance}`
      );
      
      return {
        content: [
          {
            type: 'text',
            text: `✅ **AI Strategy Recommendations** (Free Service)

${JSON.stringify(response.data, null, 2)}`,
          },
        ],
      };
    } catch (error: any) {
      throw new Error(`Failed to get strategies: ${error.message}`);
    }
  }

  private async handleExecuteTrade(args: any) {
    const { wallet_address, from_token, to_token, amount, slippage } = args;

    // No payment required for basic trade execution

    try {
      const response = await axios.post('http://localhost:3000/api/trade', {
        address: wallet_address,
        fromToken: from_token,
        toToken: to_token,
        amount,
        slippage,
      });
      
      return {
        content: [
          {
            type: 'text',
            text: `✅ **Trade Executed Successfully** (Free Service)

${JSON.stringify(response.data, null, 2)}`,
          },
        ],
      };
    } catch (error: any) {
      throw new Error(`Failed to execute trade: ${error.message}`);
    }
  }

  private async handleSetupAutomation(args: any) {
    const { wallet_address, automation_type, parameters } = args;

    // No payment required for automation setup

    try {
      const response = await axios.post('http://localhost:3000/api/automation', {
        action: 'create',
        userId: wallet_address,
        type: automation_type.toUpperCase(),
        conditions: parameters,
        actions: { executeStrategy: true, notifyUser: true },
        status: 'ACTIVE',
      });
      
      return {
        content: [
          {
            type: 'text',
            text: `✅ **Automation Setup Complete** (Free Service)

${JSON.stringify(response.data, null, 2)}`,
          },
        ],
      };
    } catch (error: any) {
      throw new Error(`Failed to setup automation: ${error.message}`);
    }
  }

  private async handleCreatePayment(args: any) {
    const { wallet_address, service } = args;

    const payment = await this.paymentManager.createPayment({
      amount: SERVICE_PRICING[service as keyof typeof SERVICE_PRICING],
      service: service as keyof typeof SERVICE_PRICING,
      userAddress: wallet_address,
    });

    return {
      content: [
        {
          type: 'text',
          text: `💳 **Payment Created**

Service: ${service}
Amount: ${SERVICE_PRICING[service as keyof typeof SERVICE_PRICING]} USDC
Payment ID: ${payment.paymentId}
QR Code: ${payment.qrCode}
Payment URL: ${payment.paymentUrl}
Expires: ${payment.expiresAt}

Scan QR code or visit payment URL to complete transaction.`,
        },
      ],
    };
  }

  private async handleVerifyPayment(args: any) {
    const { payment_id } = args;

    const verification = await this.paymentManager.verifyPayment(payment_id);

    return {
      content: [
        {
          type: 'text',
          text: `🔍 **Payment Verification**

Payment ID: ${payment_id}
Status: ${verification.isPaid ? '✅ PAID' : '❌ PENDING'}
${verification.transactionHash ? `Transaction: ${verification.transactionHash}` : ''}
${verification.paidAt ? `Paid At: ${verification.paidAt}` : ''}

${verification.isPaid ? 'You can now use premium features!' : 'Payment still pending. Please complete the transaction.'}`,
        },
      ],
    };
  }

  private async handleGetSwapQuote(args: any) {
    const { wallet_address, token_in, token_out, amount_in, slippage = 0.5, chain = 'ethereum' } = args;

    const hasPayment = await this.paymentManager.hasValidPayment(
      wallet_address,
      'trade_execution'
    );

    if (!hasPayment) {
      const payment = await this.paymentManager.createPayment({
        amount: SERVICE_PRICING.trade_execution,
        service: 'trade_execution',
        userAddress: wallet_address,
      });

      return {
        content: [
          {
            type: 'text',
            text: `💳 **Payment Required for Swap Quote**

Amount: ${SERVICE_PRICING.trade_execution} USDC
Service: Uniswap Swap Quote

Complete payment to get real-time swap quotes.`,
          },
        ],
      };
    }

    try {
      const chainId = this.getChainId(chain);
      const quote = await this.uniswapIntegration.getSwapQuote(
        chainId,
        token_in,
        token_out,
        amount_in
      );
      
      return {
        content: [
          {
            type: 'text',
            text: `✅ **Uniswap Swap Quote** (Payment Verified)

${JSON.stringify(quote, null, 2)}`,
          },
        ],
      };
    } catch (error: any) {
      throw new Error(`Failed to get swap quote: ${error.message}`);
    }
  }

  private async handleExecuteSwap(args: any) {
    const { wallet_address, token_in, token_out, amount_in, amount_out_min, slippage = 0.5, chain = 'ethereum' } = args;

    const hasPayment = await this.paymentManager.hasValidPayment(
      wallet_address,
      'trade_execution'
    );

    if (!hasPayment) {
      const payment = await this.paymentManager.createPayment({
        amount: SERVICE_PRICING.trade_execution,
        service: 'trade_execution',
        userAddress: wallet_address,
      });

      return {
        content: [
          {
            type: 'text',
            text: `💳 **Payment Required for Swap Execution**

Amount: ${SERVICE_PRICING.trade_execution} USDC
Service: Uniswap Swap Execution

Complete payment to execute: ${amount_in} ${token_in} → ${token_out}`,
          },
        ],
      };
    }

    try {
      const chainId = this.getChainId(chain);
      const privateKey = process.env.WALLET_PRIVATE_KEY;
      
      if (!privateKey) {
        throw new Error('Wallet private key not configured');
      }

      const result = await this.uniswapIntegration.executeSwap(
        chainId,
        token_in,
        token_out,
        amount_in,
        undefined,
        'exactIn',
        slippage,
        20,
        privateKey
      );
      
      return {
        content: [
          {
            type: 'text',
            text: `✅ **Swap Executed Successfully** (Payment Verified)

${JSON.stringify(result, null, 2)}`,
          },
        ],
      };
    } catch (error: any) {
      throw new Error(`Failed to execute swap: ${error.message}`);
    }
  }

  private async handleGetSupportedTokens(args: any) {
    const { chain = 'ethereum' } = args;

    try {
      const supportedChains = this.uniswapIntegration.getSupportedChains();
      const chainId = this.getChainId(chain);
      const chainInfo = supportedChains.find(c => c.chainId === chainId);
      
      return {
        content: [
          {
            type: 'text',
            text: `📋 **Supported Tokens and Chains**

Selected Chain: ${chainInfo?.name || 'Unknown'} (${chainId})

Supported Chains:
${supportedChains.map(c => `- ${c.name} (Chain ID: ${c.chainId})`).join('\n')}

**Common Tokens:**
- ETH (Native)
- USDC: 0xA0b86a33E6417c8C4e5F5B0b1e8C5C5F5E5D5C5B
- USDT: 0xdAC17F958D2ee523a2206206994597C13D831ec7
- DAI: 0x6B175474E89094C44Da98b954EedeAC495271d0F
- WBTC: 0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599

*Note: Use 'NATIVE' for native tokens like ETH, MATIC, BNB, etc.*`,
          },
        ],
      };
    } catch (error: any) {
      throw new Error(`Failed to get supported tokens: ${error.message}`);
    }
  }

  private getChainId(chain: string): number {
    const chainMap: Record<string, number> = {
      'ethereum': 1,
      'optimism': 10,
      'polygon': 137,
      'arbitrum': 42161,
      'base': 8453
    };
    
    return chainMap[chain.toLowerCase()] || 1;
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('AURA MCP Server running with x402 payments and Uniswap integration');
  }
}

const server = new AuraMCPServer();
server.run().catch(console.error);

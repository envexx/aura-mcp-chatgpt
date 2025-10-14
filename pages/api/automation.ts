import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

interface AutomationRule {
  id: string;
  userId: string;
  strategyId: string;
  type: 'PRICE_TRIGGER' | 'TIME_BASED' | 'PORTFOLIO_REBALANCE' | 'YIELD_OPTIMIZATION';
  conditions: {
    priceTarget?: number;
    priceDirection?: 'ABOVE' | 'BELOW';
    timeInterval?: string; // cron format
    portfolioThreshold?: number;
    yieldThreshold?: number;
  };
  actions: {
    executeStrategy: boolean;
    notifyUser: boolean;
    maxExecutions?: number;
    cooldownPeriod?: number; // minutes
  };
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED';
  createdAt: string;
  lastExecuted?: string;
  executionCount: number;
}

interface MonitoringData {
  portfolioValue: number;
  priceChanges: { [token: string]: number };
  yieldOpportunities: any[];
  riskMetrics: {
    volatility: number;
    sharpeRatio: number;
    maxDrawdown: number;
  };
}

class AutomationEngine {
  private rules: Map<string, AutomationRule> = new Map();
  private isMonitoring = false;
  private monitoringInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.loadRules();
    this.startMonitoring();
  }

  private loadRules() {
    // In production, load from database
    // For demo, we'll use in-memory storage
    console.log('Loading automation rules from storage...');
  }

  private startMonitoring() {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    this.monitoringInterval = setInterval(async () => {
      await this.checkAllRules();
    }, 60000); // Check every minute
    
    console.log('Automation monitoring started');
  }

  private stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    this.isMonitoring = false;
    console.log('Automation monitoring stopped');
  }

  async createRule(rule: Omit<AutomationRule, 'id' | 'createdAt' | 'executionCount'>): Promise<AutomationRule> {
    const newRule: AutomationRule = {
      ...rule,
      id: `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      executionCount: 0
    };

    this.rules.set(newRule.id, newRule);
    
    // In production, save to database
    console.log(`Created automation rule: ${newRule.id}`);
    
    return newRule;
  }

  async updateRule(ruleId: string, updates: Partial<AutomationRule>): Promise<AutomationRule | null> {
    const rule = this.rules.get(ruleId);
    if (!rule) return null;

    const updatedRule = { ...rule, ...updates };
    this.rules.set(ruleId, updatedRule);
    
    console.log(`Updated automation rule: ${ruleId}`);
    return updatedRule;
  }

  async deleteRule(ruleId: string): Promise<boolean> {
    const deleted = this.rules.delete(ruleId);
    console.log(`Deleted automation rule: ${ruleId}`);
    return deleted;
  }

  async getRules(userId: string): Promise<AutomationRule[]> {
    return Array.from(this.rules.values()).filter(rule => rule.userId === userId);
  }

  private async checkAllRules() {
    console.log(`Checking ${this.rules.size} automation rules...`);
    
    for (const rule of this.rules.values()) {
      if (rule.status !== 'ACTIVE') continue;
      
      try {
        await this.checkRule(rule);
      } catch (error) {
        console.error(`Error checking rule ${rule.id}:`, error);
      }
    }
  }

  private async checkRule(rule: AutomationRule) {
    // Check cooldown period
    if (rule.lastExecuted) {
      const lastExecution = new Date(rule.lastExecuted);
      const cooldownEnd = new Date(lastExecution.getTime() + (rule.actions.cooldownPeriod || 60) * 60000);
      if (new Date() < cooldownEnd) {
        return; // Still in cooldown
      }
    }

    // Check max executions
    if (rule.actions.maxExecutions && rule.executionCount >= rule.actions.maxExecutions) {
      await this.updateRule(rule.id, { status: 'COMPLETED' });
      return;
    }

    const shouldExecute = await this.evaluateConditions(rule);
    
    if (shouldExecute) {
      await this.executeRule(rule);
    }
  }

  private async evaluateConditions(rule: AutomationRule): Promise<boolean> {
    const monitoringData = await this.getMonitoringData(rule.userId);
    
    switch (rule.type) {
      case 'PRICE_TRIGGER':
        return this.checkPriceTrigger(rule, monitoringData);
      
      case 'TIME_BASED':
        return this.checkTimeTrigger(rule);
      
      case 'PORTFOLIO_REBALANCE':
        return this.checkRebalanceTrigger(rule, monitoringData);
      
      case 'YIELD_OPTIMIZATION':
        return this.checkYieldTrigger(rule, monitoringData);
      
      default:
        return false;
    }
  }

  private checkPriceTrigger(rule: AutomationRule, data: MonitoringData): boolean {
    const { priceTarget, priceDirection } = rule.conditions;
    if (!priceTarget || !priceDirection) return false;

    // Check if any token price meets the condition
    for (const [token, priceChange] of Object.entries(data.priceChanges)) {
      const currentPrice = 100 + priceChange; // Simplified price calculation
      
      if (priceDirection === 'ABOVE' && currentPrice > priceTarget) {
        return true;
      }
      if (priceDirection === 'BELOW' && currentPrice < priceTarget) {
        return true;
      }
    }
    
    return false;
  }

  private checkTimeTrigger(rule: AutomationRule): boolean {
    // Simplified time-based trigger
    // In production, use a proper cron parser
    const { timeInterval } = rule.conditions;
    if (!timeInterval) return false;

    // For demo, trigger every hour if timeInterval is "hourly"
    if (timeInterval === 'hourly') {
      const now = new Date();
      return now.getMinutes() === 0; // Trigger at the top of each hour
    }

    return false;
  }

  private checkRebalanceTrigger(rule: AutomationRule, data: MonitoringData): boolean {
    const { portfolioThreshold } = rule.conditions;
    if (!portfolioThreshold) return false;

    // Check if portfolio deviation exceeds threshold
    return data.riskMetrics.volatility > portfolioThreshold;
  }

  private checkYieldTrigger(rule: AutomationRule, data: MonitoringData): boolean {
    const { yieldThreshold } = rule.conditions;
    if (!yieldThreshold) return false;

    // Check if there are yield opportunities above threshold
    return data.yieldOpportunities.some(opp => opp.apy > yieldThreshold);
  }

  private async executeRule(rule: AutomationRule) {
    console.log(`Executing automation rule: ${rule.id}`);
    
    try {
      if (rule.actions.executeStrategy) {
        // Execute the associated strategy
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
        const response = await axios.post(`${apiUrl}/api/execute-strategy`, {
          address: rule.userId, // Assuming userId is the wallet address
          strategyId: rule.strategyId,
          autoExecute: true,
          riskTolerance: 'medium'
        });
        
        console.log(`Strategy execution result:`, response.data);
      }

      if (rule.actions.notifyUser) {
        await this.notifyUser(rule);
      }

      // Update rule execution count and timestamp
      await this.updateRule(rule.id, {
        executionCount: rule.executionCount + 1,
        lastExecuted: new Date().toISOString()
      });

    } catch (error) {
      console.error(`Failed to execute rule ${rule.id}:`, error);
    }
  }

  private async notifyUser(rule: AutomationRule) {
    // In production, send email, push notification, or webhook
    console.log(`Notifying user ${rule.userId} about rule execution: ${rule.id}`);
    
    // Could integrate with services like:
    // - SendGrid for email
    // - Firebase for push notifications
    // - Slack/Discord webhooks
    // - Telegram bot
  }

  private async getMonitoringData(userId: string): Promise<MonitoringData> {
    try {
      // Get portfolio data
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const portfolioResponse = await axios.get(`${apiUrl}/api/asset?address=${userId}`);
      const portfolio = portfolioResponse.data.data;

      // Get strategies (yield opportunities)
      const strategiesResponse = await axios.get(`${apiUrl}/api/strategies?address=${userId}`);
      const strategies = strategiesResponse.data.data.strategies;

      // Calculate price changes (simplified)
      const priceChanges: { [token: string]: number } = {
        'ETH': Math.random() * 10 - 5, // Random price change between -5% and +5%
        'BTC': Math.random() * 10 - 5,
        'USDC': Math.random() * 2 - 1
      };

      return {
        portfolioValue: portfolio.totalPortfolioValue,
        priceChanges,
        yieldOpportunities: strategies.map((s: any) => ({
          name: s.name,
          apy: parseFloat(s.actions[0].apy.split('-')[1].replace('%', ''))
        })),
        riskMetrics: {
          volatility: portfolio.riskAnalysis?.volatility || Math.random() * 50,
          sharpeRatio: Math.random() * 2,
          maxDrawdown: Math.random() * 20
        }
      };
    } catch (error) {
      console.error('Error getting monitoring data:', error);
      throw error;
    }
  }

  getStatus() {
    return {
      isMonitoring: this.isMonitoring,
      totalRules: this.rules.size,
      activeRules: Array.from(this.rules.values()).filter(r => r.status === 'ACTIVE').length
    };
  }
}

// Global automation engine instance
let automationEngine: AutomationEngine | null = null;

function getAutomationEngine(): AutomationEngine {
  if (!automationEngine) {
    automationEngine = new AutomationEngine();
  }
  return automationEngine;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const engine = getAutomationEngine();

  try {
    switch (req.method) {
      case 'GET':
        const { userId, action } = req.query;
        
        if (action === 'status') {
          return res.status(200).json(engine.getStatus());
        }
        
        if (userId && typeof userId === 'string') {
          const rules = await engine.getRules(userId);
          return res.status(200).json({ success: true, rules });
        }
        
        return res.status(400).json({ error: 'userId is required' });

      case 'POST':
        const { action: postAction, ...ruleData } = req.body;
        
        if (postAction === 'create') {
          const rule = await engine.createRule(ruleData);
          return res.status(201).json({ success: true, rule });
        }
        
        return res.status(400).json({ error: 'Invalid action' });

      case 'PUT':
        const { ruleId, ...updates } = req.body;
        
        if (!ruleId) {
          return res.status(400).json({ error: 'ruleId is required' });
        }
        
        const updatedRule = await engine.updateRule(ruleId, updates);
        if (!updatedRule) {
          return res.status(404).json({ error: 'Rule not found' });
        }
        
        return res.status(200).json({ success: true, rule: updatedRule });

      case 'DELETE':
        const { ruleId: deleteRuleId } = req.query;
        
        if (!deleteRuleId || typeof deleteRuleId !== 'string') {
          return res.status(400).json({ error: 'ruleId is required' });
        }
        
        const deleted = await engine.deleteRule(deleteRuleId);
        if (!deleted) {
          return res.status(404).json({ error: 'Rule not found' });
        }
        
        return res.status(200).json({ success: true });

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (error: any) {
    console.error('Automation API error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
}

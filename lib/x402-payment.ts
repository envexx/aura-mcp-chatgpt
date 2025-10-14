import axios from 'axios';
import { config } from './config';

export interface PaymentRequest {
  amount: number; // in USDC
  service: 'portfolio_analysis' | 'strategy_recommendations' | 'trade_execution' | 'automated_trading';
  userAddress: string;
  sessionId?: string;
}

export interface PaymentResponse {
  success: boolean;
  paymentId?: string;
  qrCode?: string;
  paymentUrl?: string;
  expiresAt?: string;
  error?: string;
}

export interface PaymentVerification {
  isPaid: boolean;
  paymentId: string;
  transactionHash?: string;
  paidAt?: string;
}

// Service pricing in USDC
export const SERVICE_PRICING = {
  portfolio_analysis: 0.001,
  strategy_recommendations: 0.002,
  trade_execution: 0.005,
  automated_trading: 0.01
} as const;

export class X402PaymentManager {
  private baseUrl: string;
  private walletAddress: string;

  constructor() {
    this.baseUrl = config.x402.paymentEndpoint;
    this.walletAddress = config.x402.walletAddress || '';
  }

  /**
   * Create a payment request for a service
   */
  async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      const amount = SERVICE_PRICING[request.service];
      
      const paymentData = {
        amount: amount,
        currency: 'USDC',
        recipient: this.walletAddress,
        service: request.service,
        userAddress: request.userAddress,
        metadata: {
          sessionId: request.sessionId,
          timestamp: new Date().toISOString()
        }
      };

      const response = await axios.post(`${this.baseUrl}/create-payment`, paymentData);
      
      return {
        success: true,
        paymentId: response.data.paymentId,
        qrCode: response.data.qrCode,
        paymentUrl: response.data.paymentUrl,
        expiresAt: response.data.expiresAt
      };

    } catch (error: any) {
      console.error('Failed to create x402 payment:', error);
      return {
        success: false,
        error: error.message || 'Payment creation failed'
      };
    }
  }

  /**
   * Verify if a payment has been completed
   */
  async verifyPayment(paymentId: string): Promise<PaymentVerification> {
    try {
      const response = await axios.get(`${this.baseUrl}/verify-payment/${paymentId}`);
      
      return {
        isPaid: response.data.status === 'completed',
        paymentId,
        transactionHash: response.data.transactionHash,
        paidAt: response.data.paidAt
      };

    } catch (error: any) {
      console.error('Failed to verify payment:', error);
      return {
        isPaid: false,
        paymentId
      };
    }
  }

  /**
   * Check if user has valid payment for service
   */
  async hasValidPayment(userAddress: string, service: keyof typeof SERVICE_PRICING): Promise<boolean> {
    try {
      // Check recent payments for this user and service
      const response = await axios.get(`${this.baseUrl}/user-payments`, {
        params: {
          userAddress,
          service,
          timeframe: '24h' // Valid for 24 hours
        }
      });

      return response.data.hasValidPayment || false;

    } catch (error) {
      console.error('Failed to check payment status:', error);
      return false;
    }
  }

  /**
   * Generate payment instructions for MCP response
   */
  generatePaymentInstructions(service: keyof typeof SERVICE_PRICING): string {
    const amount = SERVICE_PRICING[service];
    const serviceName = service.replace('_', ' ').toUpperCase();
    
    return `💳 **Payment Required**
    
Service: ${serviceName}
Amount: ${amount} USDC
    
To access this premium feature:
1. Connect your wallet
2. Scan the QR code or visit the payment link
3. Complete the micropayment
4. Retry your request

This enables pay-per-use access to advanced AI features.`;
  }
}

// Middleware function for API routes
export async function requirePayment(
  userAddress: string, 
  service: keyof typeof SERVICE_PRICING
): Promise<{ authorized: boolean; paymentResponse?: PaymentResponse; message?: string }> {
  
  const paymentManager = new X402PaymentManager();
  
  // Check if payment is required (can be disabled in development)
  if (config.isDevelopment && process.env.SKIP_PAYMENT === 'true') {
    return { authorized: true, message: 'Payment skipped in development mode' };
  }

  // Check if user has valid payment
  const hasPayment = await paymentManager.hasValidPayment(userAddress, service);
  
  if (hasPayment) {
    return { authorized: true };
  }

  // Create new payment request
  const paymentResponse = await paymentManager.createPayment({
    amount: SERVICE_PRICING[service],
    service,
    userAddress
  });

  return {
    authorized: false,
    paymentResponse,
    message: paymentManager.generatePaymentInstructions(service)
  };
}

export default X402PaymentManager;

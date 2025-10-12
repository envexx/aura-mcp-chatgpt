import { NextApiRequest, NextApiResponse } from 'next';
import { OpenAI } from 'openai';
import axios from 'axios';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { address, message } = req.body;

    if (!address) {
      return res.status(400).json({ error: 'Wallet address is required' });
    }

    // 1. Fetch data from AURA API
    const auraResponse = await axios.get(
      `${process.env.NEXT_PUBLIC_AURA_API_URL}/portfolio/strategies?address=${address}`
    );

    const auraData = auraResponse.data;

    // 2. Prepare context for ChatGPT
    const portfolioInfo = JSON.stringify(auraData.portfolio);
    const strategyInfo = JSON.stringify(auraData.strategies);
    
    const systemMessage = `You are an expert crypto portfolio advisor specializing in DeFi strategies and blockchain analytics. Your role is to analyze on-chain data and provide personalized financial advice.

    CONTEXT:
    1. Portfolio Data: ${portfolioInfo}
    2. AURA Suggested Strategies: ${strategyInfo}

    GUIDELINES:
    - Always analyze the portfolio composition and risk profile first
    - Explain strategies in simple terms while maintaining technical accuracy
    - Highlight potential risks and rewards for each recommendation
    - Consider gas fees and network conditions in your advice
    - Provide actionable steps when suggesting strategies
    - If suggesting DeFi protocols, explain why they are trustworthy
    - Include approximate APY/returns where available
    - Mention any relevant security considerations

    FORMAT YOUR RESPONSES AS:
    1. Portfolio Overview
    2. Risk Analysis
    3. Recommended Strategies
    4. Action Steps
    5. Additional Considerations

    Remember to be conservative with user funds and always prioritize security and risk management.`;

    // 3. Call ChatGPT API
    const chatResponse = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: message || 'Explain the recommended strategies in simple terms.' }
      ],
      temperature: 0.7
    });

    // 4. Send response
    res.status(200).json({
      aura: auraData,
      chatAnswer: chatResponse.choices[0]?.message?.content || '(No response)'
    });

  } catch (error: any) {
    console.error('Error in AI handler:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    });
  }
}
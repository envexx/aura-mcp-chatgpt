import type { NextApiRequest, NextApiResponse } from 'next';

const privacyPolicy = {
  version: "1.0.0",
  lastUpdated: "2025-10-12",
  policyDetails: {
    introduction: {
      title: "Privacy Policy for AURA MCP",
      description: "This Privacy Policy describes how AURA MCP ('we', 'us', or 'our') collects, uses, and protects your information when you use our service."
    },
    dataCollection: {
      title: "Information We Collect",
      items: [
        {
          type: "Wallet Address",
          purpose: "To analyze portfolio and provide recommendations",
          storage: "Temporary, during analysis only"
        },
        {
          type: "Transaction History",
          purpose: "For strategy recommendations and performance analysis",
          storage: "Cached for optimization, cleared every 24 hours"
        },
        {
          type: "Trading Preferences",
          purpose: "To customize automated trading rules",
          storage: "Stored until user deletion"
        },
        {
          type: "Chat Messages",
          purpose: "To provide AI-powered assistance",
          storage: "Temporary, cleared after session"
        }
      ]
    },
    dataUsage: {
      title: "How We Use Your Information",
      purposes: [
        "Portfolio analysis and recommendations",
        "Trading automation and strategy execution",
        "Risk assessment and monitoring",
        "Service improvement and optimization"
      ]
    },
    dataSecurity: {
      title: "Data Security",
      measures: [
        "End-to-end encryption for all communications",
        "No storage of private keys or sensitive credentials",
        "Regular security audits and updates",
        "Compliance with blockchain security best practices"
      ]
    },
    userRights: {
      title: "Your Rights",
      rights: [
        {
          name: "Data Access",
          description: "You can request a copy of your data at any time"
        },
        {
          name: "Data Deletion",
          description: "You can request deletion of all stored preferences and data"
        },
        {
          name: "Data Correction",
          description: "You can update or correct your information"
        },
        {
          name: "Data Portability",
          description: "You can request your data in a portable format"
        }
      ]
    },
    thirdPartyServices: {
      title: "Third-Party Services",
      services: [
        {
          name: "AURA API",
          purpose: "Portfolio analysis and strategy recommendations",
          dataShared: ["Wallet address", "Transaction history"],
          policy: "https://aura.adex.network/privacy"
        },
        {
          name: "OpenAI",
          purpose: "AI-powered chat assistance",
          dataShared: ["Chat messages"],
          policy: "https://openai.com/privacy"
        },
        {
          name: "x402",
          purpose: "Micropayments processing",
          dataShared: ["Transaction amount", "Payment address"],
          policy: "https://x402.co/privacy"
        }
      ]
    },
    cookies: {
      title: "Cookies and Tracking",
      description: "We use essential cookies only for maintaining session state and user preferences. No tracking cookies are used.",
      types: [
        {
          name: "Session Cookie",
          purpose: "Maintain user session",
          duration: "24 hours"
        },
        {
          name: "Preference Cookie",
          purpose: "Store user settings",
          duration: "30 days"
        }
      ]
    },
    contact: {
      title: "Contact Us",
      methods: [
        {
          type: "Email",
          value: "privacy@aura-mcp.com"
        },
        {
          type: "Telegram",
          value: "https://t.me/aura_mcp_support"
        }
      ]
    }
  },
  compliance: {
    regulations: [
      "GDPR",
      "CCPA",
      "ePrivacy Directive"
    ],
    certifications: [
      "ISO 27001",
      "Blockchain Security Standard"
    ]
  }
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    res.status(200).json({
      success: true,
      data: privacyPolicy
    });
  } catch (error: any) {
    console.error('Error fetching privacy policy:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch privacy policy',
      details: error.message
    });
  }
}
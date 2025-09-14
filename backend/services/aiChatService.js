const axios = require('axios');

class AIChatService {
  constructor() {
    this.openaiApiKey = process.env.OPENAI_API_KEY;
    this.apiUrl = 'https://api.openai.com/v1/chat/completions';
    
    // System prompt for rainwater harvesting context
    this.systemPrompt = `You are an expert assistant for a Rooftop Rainwater Harvesting Assessment application. You help users understand:

1. Rainwater harvesting systems, techniques, and benefits
2. Cost estimates, ROI calculations, and government subsidies
3. Installation processes, maintenance, and troubleshooting
4. Environmental impact and water conservation
5. Regional considerations for Indian climate zones
6. Recharge structures (pits, wells, trenches)
7. Legal requirements and permits
8. System sizing and component selection

Always provide helpful, accurate, and actionable advice. Keep responses concise but informative. Focus on practical solutions for Indian households and businesses.

If asked about topics outside rainwater harvesting, politely redirect to water conservation topics.`;
  }

  /**
   * Generate AI response using OpenAI API
   */
  async generateResponse(userMessage, conversationHistory = []) {
    try {
      // If no API key, fall back to enhanced keyword responses
      if (!this.openaiApiKey) {
        return this.generateEnhancedResponse(userMessage);
      }

      // Prepare conversation messages
      const messages = [
        { role: 'system', content: this.systemPrompt },
        ...conversationHistory,
        { role: 'user', content: userMessage }
      ];

      const response = await axios.post(this.apiUrl, {
        model: 'gpt-3.5-turbo',
        messages: messages,
        max_tokens: 300,
        temperature: 0.7,
        presence_penalty: 0.1,
        frequency_penalty: 0.1
      }, {
        headers: {
          'Authorization': `Bearer ${this.openaiApiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        response: response.data.choices[0].message.content.trim(),
        source: 'openai',
        tokens: response.data.usage.total_tokens
      };

    } catch (error) {
      console.error('OpenAI API error:', error.response?.data || error.message);
      
      // Fallback to enhanced responses
      return this.generateEnhancedKeywordResponse(userMessage);
    }
  }

  /**
   * Generate enhanced keyword-based responses with better context awareness
   */
  generateEnhancedKeywordResponse(userMessage) {
    const message = userMessage.toLowerCase();
    const originalMessage = userMessage; // Keep original for number extraction

    // Check for calculation requests and redirect to assessment
    if (this.isCalculationRequest(message)) {
      return this.redirectToAssessment();
    }
    
    // Advanced pattern matching with multiple keywords
    const responses = {
      // Greeting patterns
      greeting: {
        patterns: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'namaste'],
        responses: [
          "Hello! I'm here to help you with rainwater harvesting questions. What would you like to know about water conservation, system costs, installation, or benefits?",
          "Hi there! I can assist you with rainwater harvesting systems, cost estimates, installation guidance, and environmental benefits. How can I help you today?",
          "Namaste! I'm your rainwater harvesting expert. Ask me about system design, costs, benefits, or any water conservation topics."
        ]
      },

      // Cost and pricing - redirect to assessment for specific calculations
      cost: {
        patterns: ['cost', 'price', 'expensive', 'cheap', 'budget', 'money', 'investment', 'subsidy'],
        responses: [
          "Rainwater harvesting system costs vary by size and complexity. Basic systems start from ₹25,000-40,000 for small homes, while larger systems can cost ₹80,000-1,20,000. Government subsidies of 20-25% are available in most states. For precise cost estimates tailored to your property, use our Assessment Tool!",
          "Investment in rainwater harvesting ranges from ₹25,000 for basic setups to ₹1,20,000 for comprehensive systems. Consider government subsidies (up to 25% in many states), tax benefits under Section 80C, and long-term water bill savings. Take our assessment for detailed cost breakdown specific to your needs!",
          "Typical costs include: Gutters & pipes (₹8,000-15,000), Storage tank (₹20,000-50,000), Filtration (₹10,000-20,000), Installation (₹8,000-15,000). Government schemes like PMKSY offer substantial subsidies. Use our Assessment Tool to get personalized cost estimates and ROI calculations!"
        ]
      },

      // Technical specifications
      technical: {
        patterns: ['how does it work', 'technical', 'components', 'parts', 'system', 'design', 'installation'],
        responses: [
          "A rainwater harvesting system has 4 main components: 1) Catchment (roof), 2) Conveyance (gutters, pipes), 3) First-flush diverter (removes initial dirty water), 4) Storage/Recharge (tanks or ground structures). Water flows from roof → gutters → filter → storage tank or recharge pit.",
          "System design depends on rainfall, roof area, and water demand. Key components: Roof catchment, PVC gutters, leaf guards, first-flush diverter, sand/charcoal filters, storage tanks (1000L-5000L), and overflow management. Professional installation takes 2-3 days.",
          "Installation process: 1) Roof preparation & gutter installation, 2) Pipe network setup, 3) Filter system installation, 4) Tank placement & connections, 5) Testing & commissioning. Requires basic plumbing skills or professional installer."
        ]
      },

      // Benefits and impact
      benefits: {
        patterns: ['benefit', 'advantage', 'impact', 'environment', 'save', 'conservation', 'green'],
        responses: [
          "Key benefits: 30-50% reduction in water bills, groundwater recharge, flood prevention, improved water quality, energy savings, and environmental conservation. A typical home can harvest 50,000-150,000 liters annually, equivalent to 2-6 months of water supply.",
          "Environmental impact: Reduces urban flooding, recharges groundwater, saves energy (no pumping), reduces carbon footprint. Social benefits: Water security, reduced dependency on municipal supply, community resilience during droughts.",
          "Economic benefits: Lower water bills, increased property value, government incentives. Environmental: Reduces stormwater runoff, prevents soil erosion, supports urban biodiversity. Health: Better water quality than municipal supply when properly filtered."
        ]
      },

      // Maintenance and troubleshooting
      maintenance: {
        patterns: ['maintain', 'clean', 'service', 'problem', 'issue', 'repair', 'troubleshoot'],
        responses: [
          "Monthly maintenance: Clean gutters and remove leaves, check pipe connections, inspect first-flush diverter. Quarterly: Clean storage tank, replace filters, check pump (if any). Annual: Professional system inspection, tank cleaning, component replacement as needed.",
          "Common issues: Clogged gutters (clean regularly), dirty water (check first-flush diverter), low water pressure (check filters), tank overflow (adjust float valve). Most problems are preventable with regular cleaning and inspection.",
          "Maintenance costs: ₹2,000-5,000 annually for cleaning and minor repairs. Filter replacement: ₹500-1,500/year. Professional service: ₹3,000-8,000/year. Well-maintained systems last 15-20 years with minimal issues."
        ]
      },

      // Legal and permits
      legal: {
        patterns: ['legal', 'permit', 'approval', 'government', 'law', 'regulation', 'mandatory'],
        responses: [
          "Most residential rainwater harvesting systems don't require special permits. However, check local municipal guidelines. Many cities like Chennai, Bangalore, and Delhi have made it mandatory for new constructions. Building plan approval may require RWH system inclusion.",
          "Government support: Central and state governments offer subsidies, tax benefits, and technical assistance. PMKSY, MGNREGA, and state water conservation schemes provide funding. Some states offer property tax rebates for RWH installations.",
          "Compliance: Follow NBC (National Building Code) guidelines, ensure proper drainage, avoid contamination of groundwater. Get structural engineer approval for large installations. Municipal corporations provide free technical guidance in most cities."
        ]
      },

      // Regional and climate
      regional: {
        patterns: ['climate', 'region', 'state', 'city', 'rainfall', 'monsoon', 'weather'],
        responses: [
          "India has diverse climate zones: High rainfall (Western Ghats, Northeast: 2000-4000mm), Moderate (Gangetic plains: 800-1200mm), Low (Rajasthan, Gujarat: 200-600mm). System design varies by region - storage focus in low rainfall areas, recharge focus in high rainfall zones.",
          "Regional considerations: Coastal areas need corrosion-resistant materials, hill stations require freeze protection, desert areas need maximum storage capacity, flood-prone areas focus on recharge structures. Local soil type affects recharge pit design.",
          "Monsoon patterns: Southwest monsoon (June-September) provides 70-80% annual rainfall. Pre-monsoon preparation is crucial. Post-monsoon maintenance ensures system readiness. Northeast monsoon (October-December) benefits southern states."
        ]
      }
    };

    // Find matching pattern
    for (const [category, data] of Object.entries(responses)) {
      if (data.patterns.some(pattern => message.includes(pattern))) {
        const randomResponse = data.responses[Math.floor(Math.random() * data.responses.length)];
        return {
          response: randomResponse,
          source: 'enhanced_keywords',
          category: category
        };
      }
    }

    // Default intelligent response
    return {
      response: `I'd be happy to help with your rainwater harvesting question: "${userMessage}". I can provide information about system costs, installation, benefits, maintenance, government schemes, or technical specifications. Could you be more specific about what aspect interests you most?`,
      source: 'default',
      category: 'general'
    };
  }

  /**
   * Check if user is asking for calculations
   */
  isCalculationRequest(message) {
    const calculationKeywords = [
      'calculate', 'how much', 'potential', 'save', 'harvest', 'collect',
      'sqft', 'sq ft', 'square feet', 'roof area', 'rainfall', 'mm',
      'liters', 'gallons', 'cost', 'estimate'
    ];

    const hasCalculationIntent = calculationKeywords.some(keyword => 
      message.includes(keyword)
    );

    const hasNumbers = /\d+/.test(message);
    const hasRoofReference = message.includes('roof') || message.includes('area');
    
    return hasCalculationIntent && (hasNumbers || hasRoofReference);
  }

  /**
   * Redirect users to assessment page for calculations
   */
  redirectToAssessment() {
    return {
      response: `🧮 **For accurate calculations and personalized recommendations, please use our Assessment Tool!**

Our comprehensive assessment will calculate:
• Exact water harvesting potential for your location
• Customized system recommendations
• Detailed cost analysis with government subsidies
• Environmental impact assessment
• ROI and payback period

📊 **Click "Take Assessment" to get started** - it only takes 2 minutes and provides precise calculations based on:
• Your exact roof area and type
• Local rainfall patterns
• Soil conditions
• Water demand requirements

The assessment uses real regional data and provides actionable recommendations tailored specifically for your property!

💡 I'm here to answer general questions about rainwater harvesting, benefits, installation tips, maintenance, or government schemes. What would you like to know?`,
      source: 'assessment_redirect',
      category: 'redirect'
    };
  }

  /**
   * Get conversation context for better responses
   */
  buildConversationHistory(messages) {
    return messages.slice(-6).map(msg => ({
      role: msg.isUser ? 'user' : 'assistant',
      content: msg.text
    }));
  }
}

module.exports = new AIChatService();

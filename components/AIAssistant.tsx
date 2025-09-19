'use client';

import { useState, useEffect, useRef } from 'react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

interface AIAssistantProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function AIAssistant({ isOpen, onToggle }: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! I'm Marcus, your general AI assistant. I'm here to help with basic questions. We're also developing an advanced agentic chatbot for deal sourcing—stay tuned!",
      sender: 'assistant',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const generateResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();

    // Legal advice safeguards
    if (input.includes('legal') || input.includes('lawyer') || input.includes('attorney') ||
        input.includes('lawsuit') || input.includes('contract') || input.includes('sue') ||
        input.includes('liability') || input.includes('regulation') || input.includes('compliance')) {
      return "I can't provide legal advice. Please consult with a qualified attorney for legal matters related to business acquisitions.";
    }

    // Confidential information safeguards
    if (input.includes('password') || input.includes('login') || input.includes('api') ||
        input.includes('database') || input.includes('confidential') || input.includes('private')) {
      return "I can't access or discuss confidential information. Please contact our support team for account-related questions.";
    }

    // Business acquisition questions
    if (input.includes('acquisition') || input.includes('buy') || input.includes('purchase') ||
        input.includes('merge') || input.includes('takeover')) {
      return "Business acquisitions involve purchasing existing companies. Key factors include valuation, due diligence, financing, and integration planning. Our platform helps connect buyers with sellers and streamlines the process.";
    }

    if (input.includes('due diligence')) {
      return "Due diligence is the investigation process where buyers examine a business's financials, operations, legal status, and market position before acquisition. It typically includes reviewing financial statements, contracts, employee records, and market analysis.";
    }

    if (input.includes('valuation') || input.includes('value') || input.includes('worth')) {
      return "Business valuation methods include asset-based, income-based (DCF), and market-based approaches. Factors like revenue, EBITDA, growth potential, and industry multiples all influence value. Professional appraisers often provide the most accurate assessments.";
    }

    if (input.includes('financing') || input.includes('loan') || input.includes('funding')) {
      return "Acquisition financing options include bank loans, SBA loans, seller financing, private equity, and personal funds. The best option depends on deal size, buyer qualifications, and business cash flow.";
    }

    if (input.includes('listing') || input.includes('list') || input.includes('sell')) {
      return "To list your business, you'll need financial statements, business description, growth history, and asking price. Our platform helps present your business professionally to qualified buyers.";
    }

    if (input.includes('search') || input.includes('find') || input.includes('browse')) {
      return "You can browse opportunities using our search filters for industry, revenue, location, and price range. Use the 'Browse Opportunities' page to explore available businesses.";
    }

    // Platform questions
    if (input.includes('succedence') || input.includes('platform') || input.includes('how') ||
        input.includes('what') || input.includes('help')) {
      return "Succedence is a premium marketplace connecting business buyers and sellers. We provide AI-powered matching, due diligence tools, and professional transaction support. Browse opportunities, create listings, or set preferences to get started.";
    }

    if (input.includes('hello') || input.includes('hi') || input.includes('hey')) {
      return "Hello! I'm here to help with basic questions about business acquisitions and our platform. What would you like to know?";
    }

    if (input.includes('thank') || input.includes('thanks')) {
      return "You're welcome! Happy to help with any other questions about business acquisitions or our platform.";
    }

    // Default response
    return "I can help with general questions about business acquisitions, valuations, due diligence, and our platform. For specific legal or financial advice, please consult qualified professionals. What would you like to know?";
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const userQuestion = inputValue;
    setInputValue('');
    setIsTyping(true);

    // Generate response after a short delay
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: generateResponse(userQuestion),
        sender: 'assistant',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="fixed bottom-6 right-6 w-16 h-16 bg-accent-gradient text-midnight rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 z-50 flex items-center justify-center"
        aria-label="Open Marcus"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-charcoal border border-gold/30 rounded-lg shadow-2xl z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gold/20">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-accent-gradient rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-midnight" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <h3 className="text-warm-white font-medium text-sm">Marcus</h3>
            <p className="text-xs text-silver/80">AI-powered business insights</p>
          </div>
        </div>
        <button
          onClick={onToggle}
          className="text-silver hover:text-warm-white transition-colors"
          aria-label="Close Marcus"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 text-sm ${
                message.sender === 'user'
                  ? 'bg-gold text-midnight'
                  : 'bg-slate text-warm-white'
              }`}
            >
              <p className="mb-1">{message.text}</p>
              <p className={`text-xs ${message.sender === 'user' ? 'text-midnight/70' : 'text-silver/70'}`}>
                {formatTime(message.timestamp)}
              </p>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-slate text-warm-white rounded-lg p-3 text-sm">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-silver rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-silver rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-silver rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gold/20 p-4">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask about business opportunities..."
            className="flex-1 px-3 py-2 bg-slate border border-silver/30 rounded text-warm-white placeholder-silver/60 text-sm focus:border-gold focus:outline-none"
            disabled={isTyping}
          />
          <button
            type="submit"
            disabled={isTyping || !inputValue.trim()}
            className="px-3 py-2 bg-accent-gradient text-midnight rounded hover:bg-gold-light disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
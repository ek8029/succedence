'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { PlanType } from '@/lib/types';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  analysisType?: string;
}

interface ConversationalChatboxProps {
  listingId: string;
  analysisType: 'business_analysis' | 'market_intelligence' | 'due_diligence' | 'buyer_match';
  previousAnalysis: any;
  title: string;
  placeholder?: string;
  icon?: React.ReactNode;
}

export default function ConversationalChatbox({
  listingId,
  analysisType,
  previousAnalysis,
  title,
  placeholder,
  icon
}: ConversationalChatboxProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [remainingQuestions, setRemainingQuestions] = useState<number | null>(null);
  const [rateLimitWarning, setRateLimitWarning] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const userPlan = (user?.plan as PlanType) || 'free';

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Note: Removed auto-focus to prevent unexpected page scrolling
  // Users can click on the input when they want to interact with it

  // Load conversation history from localStorage
  useEffect(() => {
    const storageKey = `chat_${listingId}_${analysisType}`;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const savedMessages = JSON.parse(saved);
        setMessages(savedMessages);
      } catch (error) {
        console.warn('Failed to load chat history:', error);
      }
    }
  }, [listingId, analysisType]);

  // Save conversation history to localStorage
  const saveToStorage = (newMessages: ChatMessage[]) => {
    const storageKey = `chat_${listingId}_${analysisType}`;
    try {
      localStorage.setItem(storageKey, JSON.stringify(newMessages));
    } catch (error) {
      console.warn('Failed to save chat history:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !user?.id || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: inputValue.trim(),
      timestamp: Date.now(),
      analysisType
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputValue('');
    setIsLoading(true);
    setRateLimitWarning(null);

    try {
      const response = await fetch('/api/ai/follow-up', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          listingId,
          analysisType,
          question: userMessage.content,
          previousAnalysis,
          conversationHistory: messages.slice(-6) // Include last 6 messages for context
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          setRateLimitWarning(data.error || 'Rate limit exceeded');
          // Remove the user message if rate limited
          setMessages(messages);
          return;
        }
        throw new Error(data.error || 'Failed to get response');
      }

      const assistantMessage: ChatMessage = {
        id: `assistant_${Date.now()}`,
        role: 'assistant',
        content: data.response,
        timestamp: Date.now(),
        analysisType
      };

      const finalMessages = [...newMessages, assistantMessage];
      setMessages(finalMessages);
      setRemainingQuestions(data.remainingQuestions);
      saveToStorage(finalMessages);

    } catch (error) {
      const errorMessage: ChatMessage = {
        id: `error_${Date.now()}`,
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: Date.now(),
        analysisType
      };

      const finalMessages = [...newMessages, errorMessage];
      setMessages(finalMessages);
      saveToStorage(finalMessages);
    } finally {
      setIsLoading(false);
    }
  };

  const clearConversation = () => {
    setMessages([]);
    const storageKey = `chat_${listingId}_${analysisType}`;
    localStorage.removeItem(storageKey);
    setRemainingQuestions(null);
    setRateLimitWarning(null);
  };

  const getPlaceholderText = () => {
    if (!user?.id) return 'Sign in to start chatting...';
    if (remainingQuestions === 0) return 'Question limit reached for today';
    return placeholder || `Ask me anything about this ${analysisType.replace('_', ' ')}...`;
  };

  const getPlanInfo = () => {
    switch (userPlan) {
      case 'free': return { total: 2, color: 'text-gray-400' };
      case 'starter': return { total: 10, color: 'text-blue-400' };
      case 'professional': return { total: 50, color: 'text-purple-400' };
      case 'enterprise': return { total: 'unlimited', color: 'text-gold' };
      default: return { total: 0, color: 'text-gray-400' };
    }
  };

  const planInfo = getPlanInfo();

  return (
    <div className="p-4 bg-purple-900/10 rounded-luxury border border-purple-400/20">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-semibold text-purple-400 font-serif flex items-center">
          {icon || (
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          )}
          {title}
        </h4>

        <div className="flex items-center space-x-3">
          {remainingQuestions !== null && (
            <span className={`text-xs ${planInfo.color}`}>
              {typeof planInfo.total === 'number'
                ? `${remainingQuestions}/${planInfo.total} remaining`
                : 'Unlimited'
              }
            </span>
          )}
          {messages.length > 0 && (
            <button
              onClick={clearConversation}
              className="text-xs text-gray-400 hover:text-gray-300 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="mb-4 max-h-96 overflow-y-auto space-y-3 bg-charcoal/20 rounded-lg p-3">
        {messages.length === 0 ? (
          <div className="text-center text-silver/60 text-sm py-8">
            <div className="mb-2">
              <svg className="w-8 h-8 mx-auto text-purple-400/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            Start a conversation about this analysis
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] px-3 py-2 rounded-lg text-sm ${
                  message.role === 'user'
                    ? 'bg-purple-600 text-white'
                    : 'bg-charcoal/50 text-silver border border-purple-400/20'
                }`}
              >
                <div className="whitespace-pre-wrap">{message.content}</div>
                <div className={`text-xs mt-1 ${
                  message.role === 'user' ? 'text-purple-200' : 'text-silver/60'
                }`}>
                  {new Date(message.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))
        )}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-charcoal/50 border border-purple-400/20 rounded-lg px-3 py-2">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Rate limit warning */}
      {rateLimitWarning && (
        <div className="mb-3 p-2 bg-orange-900/20 border border-orange-400/20 rounded text-orange-300 text-xs">
          {rateLimitWarning}
        </div>
      )}

      {/* Input */}
      <div className="flex space-x-2">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={getPlaceholderText()}
          className="flex-1 px-3 py-2 bg-charcoal/50 border border-purple-400/20 rounded-luxury text-warm-white placeholder-silver/60 focus:outline-none focus:border-purple-400 disabled:opacity-50"
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          disabled={!user?.id || remainingQuestions === 0 || isLoading}
        />
        <button
          onClick={handleSendMessage}
          disabled={!inputValue.trim() || !user?.id || remainingQuestions === 0 || isLoading}
          className="px-4 py-2 bg-purple-600 text-white rounded-luxury hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          )}
        </button>
      </div>

      {/* Footer info */}
      {!user?.id && (
        <p className="text-purple-300 text-xs mt-2">Sign in to start conversing with AI</p>
      )}

      {remainingQuestions === 0 && user?.id && (
        <div className="mt-2 p-2 bg-orange-900/20 border border-orange-400/20 rounded text-orange-300 text-xs">
          You&apos;ve reached your daily limit. Upgrade your plan for more questions.
        </div>
      )}
    </div>
  );
}
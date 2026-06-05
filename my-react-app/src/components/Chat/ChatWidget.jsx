import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, X, Send, Bot, User, Loader2, Minimize2, Zap, 
  Trash2, History, Settings, Wallet, TrendingUp, CalendarClock,
  PiggyBank, BookOpen, PlusCircle
} from 'lucide-react';
import axios from 'axios';
import './ChatWidget.css';


const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const smartBotCapabilities = [
  {
    title: 'Use the app',
    description: 'Ask how Dashboard, Transactions, Budgets, Bills, Predictions, and other pages work.',
    prompt: 'What can you do in this application?',
    icon: MessageCircle
  },
  {
    title: 'Check money status',
    description: 'Balance, income, spending, net worth, and savings rate.',
    prompt: 'What is my balance?',
    icon: Wallet
  },
  {
    title: 'Review budgets',
    description: 'See budget status, remaining budget, and overspending risk.',
    prompt: 'How is my budget status?',
    icon: PiggyBank
  },
  {
    title: 'Track transactions',
    description: 'Log expenses or income directly from chat.',
    prompt: 'Add expense 250 for food',
    icon: PlusCircle
  },
  {
    title: 'Upcoming bills',
    description: 'Find pending bills and payments that are due soon.',
    prompt: 'Show my upcoming bills',
    icon: CalendarClock
  },
  {
    title: 'Investment summary',
    description: 'Understand your portfolio and investment position.',
    prompt: 'How are my investments doing?',
    icon: TrendingUp
  },
  {
    title: 'Learn finance',
    description: 'Get simple explanations for SIPs, savings, debt, and more.',
    prompt: 'Explain SIP in simple words',
    icon: BookOpen
  }
];

const escapeHtml = (value) => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');

const formatImportantContent = (value) => {
  if (!value) return '';

  return escapeHtml(value)
    .replace(/\*\*(.*?)\*\*/g, '<strong class="smartbot-highlight">$1</strong>')
    .replace(/((?:₹|â‚¹|Rs\.?|INR)\s?\d[\d,]*(?:\.\d+)?|\d+(?:\.\d+)?%)/gi, '<span class="smartbot-value-highlight">$1</span>')
    .replace(/\b(Next Step|Strategic Pro-Tip|Pro-Tip|Important|Warning|Budget Alert|Risk|Due|Over Budget|Savings Rate|Net Worth)\b/gi, '<span class="smartbot-label-highlight">$1</span>');
};

// Typewriter Effect Component
const TypewriterMessage = ({ content, isComplete, onComplete }) => {
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const indexRef = useRef(0);
  const timeoutRef = useRef(null);
  const hasStartedTyping = useRef(false);

  useEffect(() => {
    if (isComplete) {
      setDisplayText(content);
      setIsTyping(false);
      return;
    }

    // Streaming responses update `content` chunk by chunk. Render the latest
    // accumulated text directly so the user sees the answer grow in real time.
    setDisplayText(content || '');
    setIsTyping(true);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [content, isComplete, onComplete]);

  const formatMessageContent = (text) => {
    if (!text) return null;
    
    const cleanText = text.split('SUGGESTED_QUESTIONS:')[0].trim();
    if (!cleanText) return null;
    
    const lines = cleanText.split('\n');
    const elements = [];
    
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      
      if (!line.trim()) {
        elements.push(<div key={i} className="h-2" />);
        continue;
      }
      
      if (line.trim().startsWith('**') && line.includes('**')) {
        let content = line.replace(/\*\*/g, '');
        elements.push(<h4 key={i} className="font-semibold text-gray-800 mt-2 mb-1 text-sm smartbot-important-heading">{content}</h4>);
      }
      else if (/^[•\*-]\s+/.test(line.trim())) {
        let content = line.trim().substring(1).trim();
        content = formatImportantContent(content);
        
        elements.push(
          <div key={i} className="flex items-start gap-2 mt-1 min-w-0">
            <span className="text-blue-500 mt-0.5">•</span>
            <span className="flex-1 text-gray-700 break-words min-w-0" dangerouslySetInnerHTML={{ __html: content }} />
          </div>
        );
      }
      else if (/^\d+\./.test(line.trim())) {
        const match = line.trim().match(/^(\d+)\.\s*(.*)/);
        if (match) {
          let content = match[2];
          content = formatImportantContent(content);
          
          elements.push(
            <div key={i} className="flex items-start gap-2 mt-1 min-w-0">
              <span className="text-blue-500 font-medium min-w-[20px]">{match[1]}.</span>
              <span className="flex-1 text-gray-700 break-words min-w-0" dangerouslySetInnerHTML={{ __html: content }} />
            </div>
          );
        } else {
          let formattedLine = formatImportantContent(line);
          elements.push(<p key={i} className="text-gray-700 mt-1" dangerouslySetInnerHTML={{ __html: formattedLine }} />);
        }
      }
      else {
        let formattedLine = formatImportantContent(line);
        elements.push(<p key={i} className="text-gray-700 mt-1 leading-relaxed break-words" dangerouslySetInnerHTML={{ __html: formattedLine }} />);
      }
    }
    
    return elements;
  };

  return (
    <div className="relative">
      <div className="whitespace-pre-wrap break-words">
        {formatMessageContent(displayText || content)}
        {isTyping && !isComplete && (
          <span className="inline-block w-0.5 h-4 bg-blue-500 ml-0.5 animate-pulse" />
        )}
      </div>
    </div>
  );
};

// Main ChatWidget Component
const ChatWidget = ({ onChatOpenChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { 
      role: 'ai', 
      content: 'Hi! I am SmartBot, your application and finance assistant. Ask me how to use this app or choose a quick action below.', 
      suggestions: [], 
      isComplete: true,
      source: 'rule-based',
      id: 'welcome-msg'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const messagesEndRef = useRef(null);
  const messageIdCounter = useRef(1);

  // Notify parent when chat opens/closes
  useEffect(() => {
    if (onChatOpenChange) {
      onChatOpenChange(isOpen);
    }
  }, [isOpen, onChatOpenChange]);

  // Clear conversation history
  const clearConversationHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/smartbot/clear-history`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setMessages([
        { 
          role: 'ai', 
          content: 'Hi! I am SmartBot, your application and finance assistant. Ask me how to use this app or choose a quick action below.', 
          suggestions: [], 
          isComplete: true,
          source: 'rule-based',
          id: 'welcome-msg'
        }
      ]);
      setShowMenu(false);
      
    } catch (err) {
      console.error('Failed to clear history:', err);
    }
  };

  // Get chat summary
  const getChatSummary = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/smartbot/summary`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Chat Summary:', response.data);
      alert(`Chat Statistics:\n${response.data.response || JSON.stringify(response.data, null, 2)}`);
      
    } catch (err) {
      console.error('Failed to get summary:', err);
    }
    setShowMenu(false);
  };

  const parseAIResponse = (text) => {
    const suggestionMarker = 'SUGGESTED_QUESTIONS:';
    if (text.includes(suggestionMarker)) {
      const parts = text.split(suggestionMarker);
      const mainContent = parts[0].trim();
      try {
        const suggestions = JSON.parse(parts[1].trim());
        return { content: mainContent, suggestions };
      } catch (e) {
        return { content: text, suggestions: [] };
      }
    }
    return { content: text, suggestions: [] };
  };

  const handleSendMessage = async (e, customMsg = null) => {
    if (e) e.preventDefault();
    const messageToSend = customMsg || input;
    if (!messageToSend.trim() || isLoading) return;

    const userMsg = messageToSend.trim();
    const userMessageId = messageIdCounter.current++;
    
    setMessages(prev => [...prev, { 
      role: 'user', 
      content: userMsg, 
      isComplete: true,
      id: userMessageId
    }]);
    
    setInput('');
    setIsLoading(true);

    const aiMessageId = messageIdCounter.current++;
    setMessages(prev => [...prev, { 
      role: 'ai', 
      content: '', 
      suggestions: [],
      isComplete: false,
      source: 'checking',
      id: aiMessageId
    }]);
    setStreamingMessageId(aiMessageId);

    const controller = new AbortController();
    let streamTimeout = null;
    const resetStreamTimeout = () => {
      if (streamTimeout) clearTimeout(streamTimeout);
      streamTimeout = setTimeout(() => controller.abort(), 170000);
    };

    try {
      const token = localStorage.getItem('token');
      const cleanToken = token ? token.replace(/^["'](.+(?=["']$))["']$/, '$1') : '';
      resetStreamTimeout();
      
      const response = await fetch(`${API_BASE_URL}/smartbot/stream?message=${encodeURIComponent(userMsg)}`, {
        headers: {
          'Authorization': `Bearer ${cleanToken}`
        },
        signal: controller.signal
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';
      let currentEvent = '';
      let streamFinished = false;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        resetStreamTimeout();
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop();
        
        for (let line of lines) {
          if (line.endsWith('\r')) {
            line = line.slice(0, -1);
          }
          if (!line) continue;
          
          if (line.startsWith('event:')) {
            currentEvent = line.slice(6).trim();
          } else if (line.startsWith('data:')) {
            const dataVal = line.slice(5);
            
            if (currentEvent === 'connected') {
              currentEvent = '';
              continue;
            }

            if (currentEvent === 'done') {
              streamFinished = true;
              currentEvent = '';
              break;
            }
            
            if (dataVal === 'User not authenticated' || dataVal === 'Message cannot be empty') {
              throw new Error(dataVal);
            }
            
            // Extract chunk from JSON structure if sent by backend
            let chunkText = dataVal;
            if (dataVal.trim().startsWith('{')) {
              try {
                const parsed = JSON.parse(dataVal);
                if (parsed && typeof parsed.text === 'string') {
                  chunkText = parsed.text;
                }
                if (parsed && typeof parsed.source === 'string') {
                  setMessages(prev => {
                    const newMsgs = [...prev];
                    const targetIndex = newMsgs.findIndex(msg => msg.id === aiMessageId);
                    if (targetIndex !== -1) {
                      newMsgs[targetIndex] = {
                        ...newMsgs[targetIndex],
                        source: parsed.source,
                        intent: parsed.intent || newMsgs[targetIndex].intent
                      };
                    }
                    return newMsgs;
                  });
                }
              } catch (e) {
                console.error("Failed to parse SSE data chunk:", e);
              }
            }
            
            setMessages(prev => {
              const newMsgs = [...prev];
              const targetIndex = newMsgs.findIndex(msg => msg.id === aiMessageId);
              if (targetIndex !== -1) {
                newMsgs[targetIndex] = {
                  ...newMsgs[targetIndex],
                  content: (newMsgs[targetIndex].content || '') + chunkText
                };
              }
              return newMsgs;
            });
          }
        }

        if (streamFinished) break;
      }

      // Parse final output to extract recommendations/suggestions
      setMessages(prev => {
        const newMsgs = [...prev];
        const targetIndex = newMsgs.findIndex(msg => msg.id === aiMessageId);
        if (targetIndex !== -1) {
          const finalContent = newMsgs[targetIndex].content || '';
          const parsed = parseAIResponse(finalContent);
          newMsgs[targetIndex] = {
            ...newMsgs[targetIndex],
            content: parsed.content,
            suggestions: parsed.suggestions,
            source: newMsgs[targetIndex].source === 'checking' ? 'ai' : newMsgs[targetIndex].source,
            isComplete: true
          };
        }
        return newMsgs;
      });
      
    } catch (err) {
      console.error(err);
      setMessages(prev => {
        const newMsgs = [...prev];
        const targetIndex = newMsgs.findIndex(msg => msg.id === aiMessageId);
        if (targetIndex !== -1) {
          const currentContent = newMsgs[targetIndex].content || '';
          if (currentContent.trim().length > 0) {
            // Stream was interrupted but we already have content! Preserve and complete it.
            const parsed = parseAIResponse(currentContent);
            newMsgs[targetIndex] = {
              ...newMsgs[targetIndex],
              content: parsed.content,
              suggestions: parsed.suggestions,
              source: newMsgs[targetIndex].source === 'checking' ? 'ai' : newMsgs[targetIndex].source,
              isComplete: true
            };
          } else {
            // No content received at all, show the generic error message.
            newMsgs[targetIndex] = {
              ...newMsgs[targetIndex],
              content: 'Sorry, I encountered an error. Please try again.',
              suggestions: [],
              source: 'system',
              isComplete: true
            };
          }
        }
        return newMsgs;
      });
    } finally {
      if (streamTimeout) clearTimeout(streamTimeout);
      setIsLoading(false);
      setStreamingMessageId(null);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getSourceBadge = (source) => {
    if (source === 'rule-based') {
      return { label: 'Rule based real data', className: 'smartbot-source-rule' };
    }
    if (source === 'ai') {
      return { label: 'AI answer', className: 'smartbot-source-ai' };
    }
    if (source === 'system') {
      return { label: 'System message', className: 'smartbot-source-system' };
    }
    return { label: 'Checking source', className: 'smartbot-source-system' };
  };

  const lastMessage = messages[messages.length - 1];
  const shouldShowQuickQuestions = !isLoading
    && lastMessage?.role === 'ai'
    && lastMessage?.isComplete;

  return (
    <>
      {/* Chat Panel - Fixed on the right */}
      <AnimatePresence mode="wait">
        {isOpen && (
          <>
            {/* Overlay only for mobile */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/30 z-40 md:hidden"
            />
            
            {/* Chat Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="smartbot-chat fixed top-0 right-0 w-full sm:w-[400px] h-full bg-white shadow-2xl z-50 flex flex-col"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 flex items-center justify-between text-white">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <Bot size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">SmartBot AI</h3>
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-[10px] text-blue-100">Memory Enabled</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <button 
                      onClick={() => setShowMenu(!showMenu)}
                      className="p-1 hover:bg-white/10 rounded-full transition-colors"
                    >
                      <Settings size={18} />
                    </button>
                    
                    <AnimatePresence>
                      {showMenu && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50"
                        >
                          <button
                            onClick={getChatSummary}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                          >
                            <History size={16} className="text-blue-600" />
                            <span className="text-sm text-gray-700">Chat Summary</span>
                          </button>
                          <button
                            onClick={clearConversationHistory}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left border-t border-gray-100"
                          >
                            <Trash2 size={16} className="text-red-500" />
                            <span className="text-sm text-red-600">Clear History</span>
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="p-1 hover:bg-white/10 rounded-full transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 chat-messages-area">
                {messages.map((msg) => (
                  <div 
                    key={msg.id}
                    className={`flex chat-message-item ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex gap-2 max-w-[85%] min-w-0 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        msg.role === 'user' ? 'bg-blue-100 text-blue-600' : 'bg-white border border-gray-100 text-gray-600 shadow-sm'
                      }`}>
                        {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                      </div>
                      <div className={`p-3 rounded-2xl text-sm break-words overflow-hidden w-full ${
                        msg.role === 'user' 
                          ? 'bg-blue-600 text-white rounded-tr-none' 
                          : 'bg-white text-gray-800 border border-gray-100 shadow-sm rounded-tl-none'
                      }`}>
                        {msg.role === 'ai' ? (
                          <>
                            <div className={`smartbot-source-badge ${getSourceBadge(msg.source).className}`}>
                              {getSourceBadge(msg.source).label}
                            </div>
                            <TypewriterMessage 
                              content={msg.content} 
                              isComplete={msg.isComplete}
                            />
                          </>
                        ) : (
                          <div className="whitespace-pre-wrap">{msg.content}</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {shouldShowQuickQuestions && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="relative z-[1] ml-10"
                  >
                    <div className="mb-2">
                      <h4 className="text-xs font-semibold text-gray-700">Quick questions</h4>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        These stay available after every answer.
                      </p>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      {smartBotCapabilities.map(({ title, description, prompt, icon: Icon }) => (
                        <button
                          key={title}
                          type="button"
                          onClick={(e) => handleSendMessage(e, prompt)}
                          disabled={isLoading}
                          className="group w-full text-left bg-white border border-gray-100 rounded-lg p-3 shadow-sm hover:border-blue-200 hover:bg-blue-50/60 hover:shadow-md transition-all disabled:opacity-60"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-100">
                              <Icon size={16} />
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-semibold text-gray-800 leading-5">{title}</div>
                              <div className="text-[11px] text-gray-500 leading-4">{description}</div>
                              <div className="text-[11px] text-blue-600 mt-1 truncate">{prompt}</div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Suggestions */}
                {!isLoading && messages.length > 0 && messages[messages.length - 1]?.role === 'ai' && 
                 messages[messages.length - 1]?.suggestions?.length > 0 && 
                 messages[messages.length - 1]?.isComplete && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex flex-wrap gap-2 justify-start ml-10"
                  >
                    {messages[messages.length - 1].suggestions.map((suggestion, sIdx) => (
                      <button
                        key={sIdx}
                        onClick={(e) => handleSendMessage(e, suggestion)}
                        className="text-[11px] bg-white border border-blue-100 text-blue-600 px-3 py-1.5 rounded-full hover:bg-blue-50 hover:border-blue-200 transition-all shadow-sm"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </motion.div>
                )}
                
                {isLoading && !streamingMessageId && (
                  <div className="flex justify-start">
                    <div className="flex gap-2 max-w-[85%]">
                      <div className="w-8 h-8 rounded-full bg-white border border-gray-100 flex items-center justify-center shadow-sm">
                        <Bot size={14} className="text-gray-400" />
                      </div>
                      <div className="bg-white border border-gray-100 shadow-sm p-3 rounded-2xl rounded-tl-none">
                        <div className="flex gap-1">
                          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-100">
                <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 border border-gray-200 focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask me anything about this app..."
                    className="flex-1 bg-transparent border-none outline-none text-sm py-1"
                  />
                  <button 
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className={`p-2 rounded-lg transition-colors ${
                      input.trim() && !isLoading ? 'bg-blue-600 text-white shadow-md hover:bg-blue-700' : 'text-gray-300'
                    }`}
                  >
                    <Send size={16} />
                  </button>
                </div>
                <div className="flex items-center justify-center gap-4 mt-2">
                  <p className="text-[10px] text-gray-400 flex items-center justify-center gap-1">
                    <Zap size={10} className="text-yellow-500" />
                    App data answers are rule based
                  </p>
                  <button
                    type="button"
                    onClick={clearConversationHistory}
                    className="text-[10px] text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1"
                  >
                    <Trash2 size={10} />
                    Clear
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Floating Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 z-40 ${
          isOpen ? 'bg-gray-100 text-gray-600' : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-xl'
        }`}
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </motion.button>
    </>
  );
};

export default ChatWidget;

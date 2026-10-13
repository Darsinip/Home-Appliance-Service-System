import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hi there! 👋 I'm HomeServ AI. How can I help you today?", isBot: true }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [sessionId, setSessionId] = useState(() => {
    const key = 'homeServChatSession';
    const existing = sessionStorage.getItem(key);
    if (existing) return existing;
    const next = crypto.randomUUID();
    sessionStorage.setItem(key, next);
    return next;
  });
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  async function fetchSuggestions() {
    try {
      const res = await api.get('/chatbot/suggestions');
      if (res.data?.data) {
        setSuggestions(res.data.data);
      }
    } catch {
      console.error('Failed to fetch suggestions', err);
      // Fallback suggestions
      setSuggestions(["I need AC repair", "What are your prices?", "How to book a service?"]);
    }
  }

  useEffect(() => {
    if (isOpen && suggestions.length === 0) {
      fetchSuggestions();
    }
  }, [isOpen, suggestions.length]);

  const handleSend = async (text) => {
    const message = text.trim();
    if (!message || isTyping) return;
    
    setMessages(prev => [...prev, { text: message, isBot: false }]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await api.post('/chatbot', { message, sessionId });
      setMessages(prev => [...prev, { text: res.data.data.message || 'Sorry, I could not process that.', isBot: true }]);
    } catch (err) {
      setMessages(prev => [...prev, { text: 'Oops! Something went wrong while connecting to the server.', isBot: true }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(input);
    }
  };

  const renderMessage = (text) => text.split('\n').map((line, index) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    return (
      <React.Fragment key={`${line}-${index}`}>
        {parts.map((part, partIndex) => part.startsWith('**') && part.endsWith('**')
          ? <strong key={partIndex}>{part.slice(2, -2)}</strong>
          : <React.Fragment key={partIndex}>{part}</React.Fragment>)}
        {index < text.split('\n').length - 1 && <br />}
      </React.Fragment>
    );
  });

  const startNewChat = () => {
    const next = crypto.randomUUID();
    sessionStorage.setItem('homeServChatSession', next);
    setSessionId(next);
    setMessages([{ text: "Hi there! 👋 I'm HomeServ AI. How can I help you today?", isBot: true }]);
  };

  return (
    <>
      <button className={`chatbot-btn ${!isOpen ? 'pulse' : ''}`} onClick={() => setIsOpen(!isOpen)}>
        💬
      </button>

      <div className="chatbot-panel" style={{ 
        transform: isOpen ? 'scale(1)' : 'scale(0)', 
        opacity: isOpen ? 1 : 0, 
        pointerEvents: isOpen ? 'auto' : 'none' 
      }}>
        <div className="chatbot-header">
          <h5><span className="me-2">🤖</span>HomeServ AI</h5>
          <div className="d-flex align-items-center gap-2">
            <button className="btn btn-sm btn-link text-white p-0" onClick={startNewChat}>New chat</button>
            <button className="chatbot-close" onClick={() => setIsOpen(false)} aria-label="Close chat">&times;</button>
          </div>
        </div>
        
        <div className="chatbot-messages">
          {messages.map((msg, i) => (
            <div key={i} className={`chat-msg ${msg.isBot ? 'bot' : 'user'}`}>
              {renderMessage(msg.text)}
            </div>
          ))}
          {isTyping && (
            <div className="chat-msg bot">
              <span className="typing-dot">.</span><span className="typing-dot">.</span><span className="typing-dot">.</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {suggestions.length > 0 && messages.length === 1 && (
          <div className="px-3 pb-2 chat-chips">
            {suggestions.map((sug, i) => (
              <span key={i} className="chat-chip" onClick={() => handleSend(sug)}>{sug}</span>
            ))}
          </div>
        )}

        <div className="chatbot-input">
          <input 
            type="text" 
            placeholder="Type your message..." 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isTyping}
          />
          <button onClick={() => handleSend(input)} disabled={isTyping} aria-label="Send message">➤</button>
        </div>
      </div>
      <style>{`
        .typing-dot { animation: typing 1.4s infinite; display: inline-block; margin: 0 1px; font-weight: bold; }
        .typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .typing-dot:nth-child(3) { animation-delay: 0.4s; }
        @keyframes typing { 0%, 100% { transform: translateY(0); opacity: 0.2; } 50% { transform: translateY(-3px); opacity: 1; } }
      `}</style>
    </>
  );
};

export default ChatBot;

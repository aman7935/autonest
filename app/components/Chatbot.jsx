"use client";
import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

const generateUUID = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I am your AutoNest AI assistant. How can I help you find your dream car today?', temperature: null }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResponding, setIsResponding] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [temperature, setTemperature] = useState(0.85);
  const messagesEndRef = useRef(null);

  // Prevent background scrolling when chatbot is open, only on mobile devices
  useEffect(() => {
    const handleScrollLock = () => {
      if (isOpen && window.innerWidth <= 768) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = 'unset';
      }
    };
    
    handleScrollLock();
    window.addEventListener('resize', handleScrollLock);

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('resize', handleScrollLock);
    };
  }, [isOpen]);

  const scrollToBottom = () => {
    // Using 'auto' instead of 'smooth' prevents severe stuttering on mobile 
    // when text streams in word-by-word at high speeds.
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const fetchHistory = async () => {
      const sessionId = sessionStorage.getItem("autonest_session_id");
      if (sessionId) {
        try {
          const base = process.env.NEXT_PUBLIC_BACKEND_URL || `http://localhost:8000`;
          const response = await fetch(`${base}/api/chat/history/${sessionId}`);
          if (response.ok) {
            const data = await response.json();
            if (data.messages && data.messages.length > 0) {
              setMessages([
                { role: 'assistant', content: 'Hello! I am your AutoNest AI assistant. How can I help you find your dream car today?' },
                ...data.messages
              ]);
            }
          }
        } catch (e) {
          console.error("Error fetching chat history:", e);
        }
      } else {
        // Initialize session ID if it doesn't exist
        const newSessionId = generateUUID();
        sessionStorage.setItem("autonest_session_id", newSessionId);
      }
    };
    fetchHistory();
  }, []);

  const handleNewChat = () => {
    const newSessionId = generateUUID();
    sessionStorage.setItem("autonest_session_id", newSessionId);
    setMessages([
      { role: 'assistant', content: 'Hello! I am your AutoNest AI assistant. How can I help you find your dream car today?', temperature: null }
    ]);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isResponding) return;

    const userMessage = input;
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    setIsLoading(true);
    setIsResponding(true);

    let sessionId = sessionStorage.getItem("autonest_session_id");
    if (!sessionId) {
      sessionId = generateUUID();
      sessionStorage.setItem("autonest_session_id", sessionId);
    }

    // Keep reference to the active temperature for this exchange
    const activeTemperature = temperature;

    try {
      // Use deployed Render backend, fallback to localhost for local dev
      const base = process.env.NEXT_PUBLIC_BACKEND_URL || `http://localhost:8000`;
      const backendUrl = `${base}/api/chat/stream`;
      
      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: userMessage, 
          session_id: sessionId,
          temperature: activeTemperature 
        })
      });

      if (response.ok) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let assistantMessage = '';
        let isFirstChunk = true;

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          
          buffer += decoder.decode(value, { stream: true });
          const events = buffer.split("\n\n");
          buffer = events.pop() || "";
          
          for (const event of events) {
            if (event.startsWith("data: ")) {
              const dataString = event.slice(6);
              if (dataString.trim() === "[DONE]") continue;
              
              let chunkText = "";
              try {
                const parsedData = JSON.parse(dataString);
                chunkText = parsedData.content || parsedData.response || "";
              } catch (e) {
                chunkText = dataString;
              }

              if (chunkText) {
                if (isFirstChunk) {
                  setIsLoading(false); // Remove typing indicator now that we have text
                  isFirstChunk = false;
                  assistantMessage += chunkText;
                  // Push the first word to the chat history
                  setMessages(prev => [...prev, { 
                    role: 'assistant', 
                    content: assistantMessage,
                    temperature: activeTemperature 
                  }]);
                } else {
                  // Artificially delay by 40ms per word to create a readable typing effect
                  await new Promise(resolve => setTimeout(resolve, 40));
                  assistantMessage += chunkText;
                  
                  // Update the last message in the array with the new chunk
                  setMessages(prev => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1] = { 
                      role: 'assistant', 
                      content: assistantMessage,
                      temperature: activeTemperature
                    };
                    return newMessages;
                  });
                }
              }
            }
          }
        }
        
        // Failsafe if stream ends empty
        if (isFirstChunk) {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
        // Fallback if backend is down
        setTimeout(() => {
          setMessages(prev => [...prev, { role: 'assistant', content: "I'm currently unable to reach the server. Please call us directly for assistance." }]);
        }, 1000);
      }
    } catch (error) {
      setTimeout(() => {
        setMessages(prev => [...prev, { role: 'assistant', content: "I'm having trouble connecting to the server. Please try again in a moment." }]);
      }, 1000);
    } finally {
      setIsLoading(false);
      setIsResponding(false);
    }
  };

  return (
    <div className={`chatbot-container ${isOpen ? 'open' : ''}`}>
      <div className="chatbot-toggle" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? '✕' : '💬'}
      </div>
      
      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0 }}>AutoNest Concierge</h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={() => setShowSettings(!showSettings)}
                title="Toggle Creativity Controls"
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  cursor: 'pointer', 
                  fontSize: '1.2rem', 
                  padding: '0 5px',
                  opacity: showSettings ? 1 : 0.7,
                  transition: 'opacity 0.2s'
                }}
              >
                ⚙️
              </button>
              <button 
                onClick={handleNewChat}
                title="Start New Chat"
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', padding: '0 5px' }}
              >
                🔄
              </button>
            </div>
          </div>
          
          {showSettings && (
            <div className="chatbot-settings" style={{
              padding: '12px 15px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              background: 'rgba(0, 0, 0, 0.2)',
              backdropFilter: 'blur(5px)',
              fontSize: '0.85rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Response Style:</span>
                <strong style={{ color: '#d4af37' }}>
                  {temperature.toFixed(2)} {temperature <= 0.4 ? '❄️ Precise' : temperature <= 0.8 ? '🎯 Balanced' : '🔥 Creative'}
                </strong>
              </div>
              <input 
                type="range" 
                min="0.1" 
                max="1.5" 
                step="0.05" 
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                style={{
                  width: '100%',
                  accentColor: '#d4af37',
                  cursor: 'pointer',
                  background: 'rgba(255, 255, 255, 0.2)',
                  height: '4px',
                  borderRadius: '2px',
                  outline: 'none'
                }}
              />
            </div>
          )}

          <div className="chatbot-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`message ${msg.role}`}>
                {msg.role === 'assistant' && (
                  <div className="ai-avatar" title="AutoNest AI">👨‍💼</div>
                )}
                <div className="message-content">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                  {msg.role === 'assistant' && msg.temperature !== undefined && msg.temperature !== null && (
                    <div className="message-temperature" style={{
                      fontSize: '0.7rem',
                      color: 'rgba(255, 255, 255, 0.4)',
                      marginTop: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                      paddingTop: '4px'
                    }}>
                      <span>Temp: {msg.temperature}</span>
                      <span>•</span>
                      <span>{msg.temperature <= 0.4 ? '❄️ Precise' : msg.temperature <= 0.8 ? '🎯 Balanced' : '🔥 Creative'}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="message assistant">
                <div className="ai-avatar" title="Thinking...">🤔</div>
                <div className="message-content typing">Thinking...</div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <form className="chatbot-input" onSubmit={handleSend}>
            <input 
              type="text" 
              placeholder={isResponding ? "Please wait..." : "Ask about our cars..."} 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isResponding}
            />
            <button type="submit" disabled={isResponding}>Send</button>
          </form>
        </div>
      )}
    </div>
  );
}

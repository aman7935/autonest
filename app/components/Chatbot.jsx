"use client";
import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I am your AutoNest AI assistant. How can I help you find your dream car today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    // Using 'auto' instead of 'smooth' prevents severe stuttering on mobile 
    // when text streams in word-by-word at high speeds.
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input;
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    setIsLoading(true);

    try {
      // Use deployed Render backend, fallback to localhost for local dev
      const base = process.env.NEXT_PUBLIC_BACKEND_URL || `http://localhost:8000`;
      const backendUrl = `${base}/api/chat/stream`;
      
      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage })
      });

      if (response.ok) {
        setIsLoading(false); // Stop loading animation immediately once stream starts
        // Add an empty assistant message to the chat
        setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let assistantMessage = '';

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
              
              try {
                const parsedData = JSON.parse(dataString);
                // Extract content (or response, depending on what the backend exactly sends)
                const word = parsedData.content || parsedData.response || "";
                assistantMessage += word;
                
                // Update the last message in the array with the new chunk
                setMessages(prev => {
                  const newMessages = [...prev];
                  newMessages[newMessages.length - 1] = { 
                    role: 'assistant', 
                    content: assistantMessage 
                  };
                  return newMessages;
                });
              } catch (e) {
                // If parsing fails, it might be raw text, append it directly
                assistantMessage += dataString;
              }
            }
          }
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
    }
  };

  return (
    <div className={`chatbot-container ${isOpen ? 'open' : ''}`}>
      <div className="chatbot-toggle" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? '✕' : '💬'}
      </div>
      
      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <h3>AutoNest Concierge</h3>
          </div>
          <div className="chatbot-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`message ${msg.role}`}>
                <div className="message-content">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="message assistant">
                <div className="message-content typing">...</div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <form className="chatbot-input" onSubmit={handleSend}>
            <input 
              type="text" 
              placeholder="Ask about our cars..." 
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button type="submit" disabled={isLoading}>Send</button>
          </form>
        </div>
      )}
    </div>
  );
}

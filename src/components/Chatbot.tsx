import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, User, ExternalLink } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

type Message = {
  id: string;
  role: 'bot' | 'user';
  text: React.ReactNode;
  options?: string[];
  inputType?: 'form' | 'none';
};

export default function Chatbot() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  
  // Form States
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formIssue, setFormIssue] = useState('');

  const [isTyping, setIsTyping] = useState(false);
  
  // State for Agent Approval
  const [requestId, setRequestId] = useState<string | null>(null);
  const [requestStatus, setRequestStatus] = useState<'pending' | 'accepted' | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check localStorage for existing session
  useEffect(() => {
    const savedSession = sessionStorage.getItem('chatbot_session');
    if (savedSession) {
      try {
        const { messages, requestId, requestStatus } = JSON.parse(savedSession);
        setMessages(messages);
        setRequestId(requestId);
        setRequestStatus(requestStatus);
      } catch (e) {
        initChat();
      }
    } else {
      initChat();
    }
  }, []);

  // Save session state
  useEffect(() => {
    if (messages.length > 0) {
      sessionStorage.setItem('chatbot_session', JSON.stringify({
        messages,
        requestId,
        requestStatus
      }));
    }
  }, [messages, requestId, requestStatus]);

  // Polling for status updates every 3 seconds
  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;

    if (requestId && requestStatus === 'pending') {
      intervalId = setInterval(async () => {
        try {
          const { data, error } = await (supabase as any)
            .from('chat_requests')
            .select('status')
            .eq('id', requestId)
            .single();

          if (data && data.status === 'accepted') {
            setRequestStatus('accepted');
            addBotMessage('✅ Agent is ready! Redirecting you to WhatsApp...');
            // Auto-redirect
            window.open('https://wa.me/919448789797?text=' + encodeURIComponent(`Hi I requested support. My name is ${formName || 'User'} and my issue is: ${formIssue || 'Help needed'}`), '_blank');
          }
        } catch (err) {
          console.error('Polling error', err);
        }
      }, 3000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [requestId, requestStatus, formName, formIssue]);

  const initChat = () => {
    setMessages([
      {
        id: Date.now().toString(),
        role: 'bot',
        text: 'Hi there! 👋 How can we help you today?',
        options: ['Pricing', 'Services', 'Talk to Agent'],
      }
    ]);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const addMessage = (msg: Omit<Message, 'id'>) => {
    setMessages(prev => [...prev.map(m => ({ ...m, options: undefined, inputType: 'none' as const })), { ...msg, id: Date.now().toString() }]);
  };

  const addBotMessage = (text: React.ReactNode, options?: string[], inputType?: 'form') => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      addMessage({ role: 'bot', text, options, inputType });
    }, 800);
  };

  const handleOptionClick = (option: string) => {
    addMessage({ role: 'user', text: option });
    
    if (option === 'Pricing') {
      addBotMessage('Our plans start from economic, premium, to elegant options. You can check the #pricing section on our website for detailed breakdown!', ['Services', 'Talk to Agent']);
    } else if (option === 'Services') {
      addBotMessage('We provide powerful dynamic QR Code generation, analytics tracking, predesigned frames and deep customization.', ['Pricing', 'Talk to Agent']);
    } else if (option === 'Talk to Agent') {
      addBotMessage('Please provide your details below so an agent can assist you.', undefined, 'form');
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formPhone.trim()) return;
    
    addMessage({ role: 'user', text: `Submitted Details:\nName: ${formName}\nPhone: ${formPhone}\nIssue: ${formIssue || 'None'}` });
    
    setIsTyping(true);

    try {
      const { data, error } = await (supabase as any)
        .from('chat_requests')
        .insert({ name: formName, phone: formPhone, message: formIssue, status: 'pending' })
        .select()
        .single();

      if (error) throw error;

      setRequestId(data.id);
      setRequestStatus('pending');
      
      setIsTyping(false);
      addMessage({
        role: 'bot',
        text: '⏳ Please wait until our agent connects to you...'
      });

    } catch (err: any) {
      console.error(err);
      setIsTyping(false);
      toast.error('Failed to connect. Please try again.');
      addBotMessage('Sorry, there was an error submitting your request.', ['Talk to Agent']);
    }
  };

  const handleReset = () => {
    sessionStorage.removeItem('chatbot_session');
    setRequestId(null);
    setRequestStatus(null);
    initChat();
  };

  const currentInputType = messages[messages.length - 1]?.inputType;

  if (location.pathname.startsWith('/dteqraadmin')) {
    return null;
  }

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-xl shadow-primary/30 hover:scale-110 transition-transform z-50"
          >
            <MessageCircle className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 w-full max-w-[350px] sm:w-[350px] h-[500px] max-h-[85vh] bg-background border border-border shadow-2xl rounded-2xl flex flex-col z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="h-16 bg-primary/5 border-b border-border flex items-center justify-between px-4 shrink-0 relative overflow-hidden">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center overflow-hidden border border-primary/20 shadow-sm p-1.5">
                  <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-foreground">Support Assistant</h3>
                  <p className="text-[10px] text-green-500 flex items-center gap-1 font-medium">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                    Online
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={handleReset} className="p-2 text-muted-foreground hover:text-foreground hover:bg-black/5 rounded-lg transition-colors text-xs" title="Restart Context">
                  Reset
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-muted-foreground hover:text-foreground hover:bg-black/5 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/30">
              {messages.map((msg, idx) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-6 h-6 shrink-0 rounded-full flex items-center justify-center mt-1 overflow-hidden p-0.5 ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-primary/10 border border-primary/20'}`}>
                      {msg.role === 'user' ? <User className="w-3.5 h-3.5" /> : <img src="/logo.png" alt="Bot" className="w-full h-full object-contain" />}
                    </div>
                    <div>
                      <div
                        className={`px-3 py-2 rounded-2xl text-sm ${
                          msg.role === 'user'
                            ? 'bg-primary text-primary-foreground rounded-tr-sm'
                            : 'bg-background border border-border text-foreground rounded-tl-sm'
                        }`}
                      >
                        {msg.text}
                      </div>
                      
                      {msg.options && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {msg.options.map(opt => (
                            <button
                              key={opt}
                              onClick={() => handleOptionClick(opt)}
                              className="text-xs bg-background hover:bg-primary hover:text-primary-foreground border border-primary/20 text-primary px-3 py-1.5 rounded-full transition-all font-medium"
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {isTyping && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                  <div className="flex gap-2 max-w-[85%]">
                    <div className="w-6 h-6 bg-primary/10 border border-primary/20 p-0.5 rounded-full flex items-center justify-center mt-1 overflow-hidden">
                      <img src="/logo.png" alt="Bot" className="w-full h-full object-contain" />
                    </div>
                    <div className="px-3 py-3 rounded-2xl bg-background border border-border rounded-tl-sm flex gap-1">
                      <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce"></span>
                      <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            {currentInputType === 'form' && requestStatus === null && (
              <div className="p-3 bg-background border-t border-border shrink-0">
                <form onSubmit={handleFormSubmit} className="flex flex-col gap-2">
                  <input
                    type="text"
                    placeholder="Your Name *"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-3 py-2 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    required
                  />
                  <input
                    type="tel"
                    placeholder="WhatsApp Number *"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    required
                  />
                  <textarea
                    placeholder="Describe your issue (optional)"
                    value={formIssue}
                    onChange={(e) => setFormIssue(e.target.value)}
                    className="w-full px-3 py-2 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[60px] resize-none"
                  />
                  <button
                    type="submit"
                    disabled={!formName.trim() || !formPhone.trim() || isTyping}
                    className="w-full bg-primary text-primary-foreground py-2 rounded-xl flex items-center justify-center font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
                  >
                    Submit Request <Send className="w-3.5 h-3.5 ml-2" />
                  </button>
                </form>
              </div>
            )}
            
            {requestStatus === 'pending' && (
              <div className="p-3 bg-amber-500/10 border-t border-amber-500/20 shrink-0 text-center">
                <p className="text-xs font-semibold text-amber-600 flex items-center justify-center gap-1.5">
                  <span className="w-2 h-2 rounded-full border-2 border-amber-500 border-t-transparent animate-spin"></span>
                  Waiting for agent...
                </p>
              </div>
            )}

            {requestStatus === 'accepted' && (
              <div className="p-3 bg-green-500/10 border-t border-green-500/20 shrink-0 text-center flex flex-col items-center gap-2">
                <p className="text-xs font-semibold text-green-600">✅ Agent is ready!</p>
                <a
                  href={`https://wa.me/919448789797?text=${encodeURIComponent('Hi I requested support.')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-green-500 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-green-600 transition-colors shadow-sm"
                >
                  Connect on WhatsApp
                </a>
              </div>
            )}
            
            {/* When not collecting input or waiting */}
            {currentInputType !== 'form' && requestStatus === null && (
              <div className="p-3 bg-background border-t border-border shrink-0 text-center">
                <p className="text-[10px] text-muted-foreground">Please select an option above</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

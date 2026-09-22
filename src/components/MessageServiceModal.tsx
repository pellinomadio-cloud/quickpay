import React, { useState } from 'react';
import { User } from '../types';
import { QUICKPAY_COMPANY_ACCOUNT } from '../data/storage';
import { X, Send, Bot, User as UserIcon, CheckCheck, Sparkles, PhoneCall } from 'lucide-react';

interface MessageServiceModalProps {
  user: User;
  onClose: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  time: string;
}

export const MessageServiceModal: React.FC<MessageServiceModalProps> = ({ user, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'bot',
      text: `Hello ${user.name}! Welcome to QuickPay 24/7 Priority Support. How can we assist your financial transactions today?`,
      time: 'Just now',
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const quickQuestions = [
    'How do I fund my wallet?',
    'What are the data bundle rates?',
    'Is my 6-digit PIN secure?',
    'Are bank transfers instant?',
  ];

  const handleSendMessage = (textToSend?: string) => {
    const query = textToSend || input.trim();
    if (!query) return;

    const userMsg: ChatMessage = {
      id: `m_${Date.now()}`,
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsTyping(true);

    setTimeout(() => {
      let botResponse = `Thank you for contacting QuickPay support! Our customer team is monitoring your request regarding: "${query}".`;

      const lower = query.toLowerCase();
      if (lower.includes('fund') || lower.includes('top up') || lower.includes('account')) {
        botResponse = `To fund your wallet, simply tap "Fund Wallet" on your dashboard. Transfer from any banking app to the official QuickPay Corporate Account: ${QUICKPAY_COMPANY_ACCOUNT.accountNumber} (${QUICKPAY_COMPANY_ACCOUNT.bankName}). Your balance reflects in seconds with zero charges!`;
      } else if (lower.includes('rate') || lower.includes('data') || lower.includes('airtime')) {
        botResponse = `QuickPay offers Nigeria's lowest SME and direct data rates! 1GB is just ₦290, 2.5GB is ₦500, and you enjoy a guaranteed 2% instant cashback discount on all airtime top-ups.`;
      } else if (lower.includes('pin') || lower.includes('security') || lower.includes('password')) {
        botResponse = `Your 6-digit password/PIN is encrypted using bank-grade 256-bit cryptography. Never share your 6-digit password with anyone—even QuickPay staff will never ask for it.`;
      } else if (lower.includes('instant') || lower.includes('transfer')) {
        botResponse = `Yes! All QuickPay-to-QuickPay transfers are 100% free and instant. Commercial bank transfers settle via NIBSS instant payment protocols within seconds.`;
      }

      const botMsg: ChatMessage = {
        id: `bot_${Date.now()}`,
        sender: 'bot',
        text: botResponse,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 750);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-md h-[560px] bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-100 flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#033421] to-[#054b30] text-white p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-emerald-700 flex items-center justify-center border border-emerald-400/40">
                <Bot className="w-5 h-5 text-emerald-100" />
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-full ring-2 ring-[#033421]" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white leading-tight">
                QuickPay Priority Desk
              </h4>
              <p className="text-[11px] text-emerald-200/80 flex items-center gap-1">
                <span>Online</span> • <span>Average response: instant</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#f8fafc]">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[82%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-[#064e32] text-white rounded-br-xs shadow-xs'
                    : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs shadow-xs'
                }`}
              >
                <p>{m.text}</p>
                <div
                  className={`text-[10px] mt-1 flex items-center justify-end gap-1 ${
                    m.sender === 'user' ? 'text-emerald-200' : 'text-slate-400'
                  }`}
                >
                  <span>{m.time}</span>
                  {m.sender === 'user' && <CheckCheck className="w-3 h-3" />}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-1.5 text-xs text-slate-400 p-2">
              <span className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce" />
              <span className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce delay-100" />
              <span className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce delay-200" />
              <span className="ml-1 text-[11px]">QuickPay agent is typing...</span>
            </div>
          )}
        </div>

        {/* Quick Question Prompts */}
        <div className="p-2 bg-white border-t border-slate-100 flex gap-1.5 overflow-x-auto no-scrollbar">
          {quickQuestions.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => handleSendMessage(q)}
              className="text-[11px] whitespace-nowrap px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-[#064e32] font-medium rounded-full border border-emerald-200/60 transition cursor-pointer shrink-0"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-3 bg-white border-t border-slate-100 flex items-center gap-2 shrink-0"
        >
          <input
            type="text"
            id="chat-service-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your question..."
            className="flex-1 px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#064e32]"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="p-2.5 bg-[#064e32] hover:bg-emerald-900 disabled:opacity-50 text-white rounded-xl transition cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { User } from '../types';
import { QUICKPAY_COMPANY_ACCOUNT } from '../data/storage';
import {
  ArrowLeft,
  Send,
  Bot,
  User as UserIcon,
  CheckCheck,
  Sparkles,
  PhoneCall,
  ShieldCheck,
} from 'lucide-react';
import logoImg from '../assets/images/quickpay_gold_logo_1789754815185.jpg';

interface MessageServicePageProps {
  user: User;
  onBack: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  time: string;
}

export const MessageServicePage: React.FC<MessageServicePageProps> = ({ user, onBack }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'bot',
      text: `Hello ${user.name}! Welcome to QuickPay 24/7 Priority Support. How can we assist your banking or wallet transactions today?`,
      time: 'Just now',
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const quickQuestions = [
    'How do I withdraw funds to my bank?',
    'How do I fund my wallet?',
    'What are the data bundle rates?',
    'Is my 6-digit password secure?',
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
      let botResponse = `Thank you for contacting QuickPay support! Our desk agent is reviewing your query regarding: "${query}".`;

      const lower = query.toLowerCase();
      if (lower.includes('withdraw') || lower.includes('bank') || lower.includes('transfer out')) {
        botResponse = `To withdraw funds directly to your external bank, tap the "Withdraw" button on your dashboard. Enter your 10-digit NUBAN account number, pick your bank, choose your amount, and enter your 6-digit password. Withdrawals are processed instantly via NIBSS with zero transfer fees!`;
      } else if (lower.includes('fund') || lower.includes('top up') || lower.includes('account')) {
        botResponse = `To fund your wallet, tap "Fund Wallet" on the home dashboard. Transfer from any banking app to the official QuickPay Corporate Account: ${QUICKPAY_COMPANY_ACCOUNT.accountNumber} (${QUICKPAY_COMPANY_ACCOUNT.bankName}). Your balance updates in seconds!`;
      } else if (lower.includes('rate') || lower.includes('data') || lower.includes('airtime')) {
        botResponse = `QuickPay offers wholesale SME and direct telecom rates! 1GB is just ₦290, 2.5GB is ₦500, and you enjoy a guaranteed 2% instant cashback discount on all airtime recharges.`;
      } else if (lower.includes('pin') || lower.includes('security') || lower.includes('password')) {
        botResponse = `Your 6-digit password/PIN is encrypted using bank-grade 256-bit cryptography. Never share your 6-digit password with anyone. QuickPay personnel will never ask for your confidential password.`;
      }

      const botMsg: ChatMessage = {
        id: `m_${Date.now() + 1}`,
        sender: 'bot',
        text: botResponse,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 700);
  };

  return (
    <div className="w-full min-h-screen bg-[#f8fafc] dark:bg-[#03140d] text-slate-900 dark:text-white flex flex-col pb-24 transition-colors duration-200">
      {/* Top Header */}
      <header className="bg-gradient-to-r from-[#022818] via-[#044329] to-[#022818] dark:from-[#011a10] dark:via-[#022a1a] dark:to-[#01180e] text-white sticky top-0 z-30 shadow-md">
        <div className="px-4 sm:px-6 py-4 flex items-center justify-between">
          <button
            type="button"
            id="message-page-back-btn"
            onClick={onBack}
            className="flex items-center gap-1.5 py-1.5 px-3 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <div className="text-center">
            <h1 className="text-base font-extrabold tracking-tight text-white">Message Support</h1>
            <div className="flex items-center justify-center gap-1 text-[10px] text-emerald-300 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>24/7 Agent Online</span>
            </div>
          </div>

          <div className="w-8 h-8 rounded-full overflow-hidden border border-[#e5b74b] p-0.5">
            <img src={logoImg} alt="QuickPay" className="w-full h-full object-cover rounded-full" />
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 w-full max-w-xl mx-auto px-4 sm:px-6 pt-4 flex flex-col">
        {/* Support status banner */}
        <div className="p-3.5 bg-white dark:bg-[#062417] rounded-2xl border border-slate-200 dark:border-emerald-800/40 shadow-xs flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-[#064e32] dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-xs font-extrabold text-slate-900 dark:text-white">Verified Support Desk</p>
              <p className="text-[11px] text-slate-500 dark:text-emerald-200/60">Average response time: under 1 minute</p>
            </div>
          </div>
          <a
            href="tel:+2348007842572"
            className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 dark:bg-[#021810] hover:bg-emerald-100 dark:hover:bg-[#04281a] text-emerald-800 dark:text-[#ffd56b] rounded-xl text-xs font-bold transition border border-transparent dark:border-emerald-800/40"
          >
            <PhoneCall className="w-3.5 h-3.5 text-[#064e32] dark:text-emerald-400" />
            <span>Call</span>
          </a>
        </div>

        {/* Quick questions pills */}
        <div className="mb-4 overflow-x-auto pb-1 flex gap-2 no-scrollbar">
          {quickQuestions.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(q)}
              className="text-xs font-semibold px-3 py-1.5 bg-white dark:bg-[#062417] border border-slate-200 dark:border-emerald-800/50 rounded-full text-slate-700 dark:text-emerald-200 hover:border-[#064e32] dark:hover:border-emerald-400 hover:text-[#064e32] dark:hover:text-white whitespace-nowrap transition cursor-pointer shadow-2xs shrink-0"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Chat message bubbles */}
        <div className="flex-1 bg-white dark:bg-[#062417] rounded-3xl p-4 sm:p-5 border border-slate-200 dark:border-emerald-800/40 shadow-xs space-y-4 mb-4 min-h-[360px] max-h-[500px] overflow-y-auto">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex items-start gap-2.5 ${m.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0 ${
                  m.sender === 'user'
                    ? 'bg-[#064e32] dark:bg-emerald-600 text-white'
                    : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                }`}
              >
                {m.sender === 'user' ? <UserIcon className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>

              <div
                className={`max-w-[80%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-[#064e32] dark:bg-emerald-600 text-white rounded-tr-none'
                    : 'bg-slate-100 dark:bg-[#021810] text-slate-800 dark:text-emerald-100 rounded-tl-none border border-transparent dark:border-emerald-800/40'
                }`}
              >
                <p>{m.text}</p>
                <div
                  className={`flex items-center gap-1 mt-1 text-[10px] ${
                    m.sender === 'user' ? 'text-emerald-200 dark:text-emerald-200 justify-end' : 'text-slate-400 dark:text-emerald-400/60 justify-start'
                  }`}
                >
                  <span>{m.time}</span>
                  {m.sender === 'user' && <CheckCheck className="w-3 h-3 text-emerald-300" />}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-emerald-300/70 italic p-2">
              <Bot className="w-4 h-4 text-emerald-700 dark:text-emerald-400 animate-spin" />
              <span>QuickPay agent is typing a response...</span>
            </div>
          )}
        </div>

        {/* Input box */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2 bg-white dark:bg-[#062417] p-2 rounded-2xl border border-slate-200 dark:border-emerald-800/50 shadow-sm"
        >
          <input
            type="text"
            id="message-page-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your question here..."
            className="flex-1 px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-emerald-500/40 bg-transparent focus:outline-none"
          />
          <button
            type="submit"
            id="message-page-send-btn"
            disabled={!input.trim()}
            className="p-2.5 bg-[#064e32] dark:bg-emerald-600 hover:bg-emerald-900 dark:hover:bg-emerald-500 text-white rounded-xl transition cursor-pointer disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </main>
    </div>
  );
};

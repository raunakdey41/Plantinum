"use client";

import React, { useState, useRef, useEffect } from 'react';

interface Message {
  id: string;
  sender: 'user' | 'doctor';
  text: string;
  timestamp: string;
}

interface PlantDoctorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PlantDoctorModal({ isOpen, onClose }: PlantDoctorModalProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'doctor',
      text: "Hello! I am Dr. Flora, your Plantinum Senior Botanist. 🌿\n\nHow can I help your plants thrive today? Ask me about yellowing leaves, watering schedules, pests, or light conditions!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const quickQuestions = [
    "🍃 Why are my Monstera leaves turning yellow?",
    "💧 How often should I water my Snake Plant?",
    "🐛 How do I treat white spots or bugs on leaves?",
    "🪴 When is the best time to repot my Peace Lily?"
  ];

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const question = (textToSend || inputValue).trim();
    if (!question || isTyping) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: question,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputValue('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/plant-doctor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messages.map(m => ({ sender: m.sender, text: m.text })),
          userQuestion: question
        })
      });

      const data = await res.json();
      const docMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'doctor',
        text: data.reply || "Dr. Flora is evaluating your plant. Please ensure it gets bright indirect sunlight!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, docMsg]);
    } catch (err) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'doctor',
        text: "I am having trouble connecting to the greenhouse database. Please try asking again!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[620px] max-h-[90vh] border border-stone-200">
        {/* Header */}
        <div className="bg-[#182d21] text-white p-4 sm:p-5 flex items-center justify-between border-b border-stone-700/50">
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <div className="w-11 h-11 rounded-full bg-emerald-800 border-2 border-emerald-400/40 flex items-center justify-center text-white font-bold text-lg shadow-inner">
                🪴
              </div>
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-400 border-2 border-[#182d21] rounded-full" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-base sm:text-lg text-white">Dr. Flora</h3>
              </div>
              <p className="text-xs text-stone-300">Plantinum Master Botanist &amp; Doctor</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close Chat"
            className="p-2 text-stone-300 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
        </div>

        {/* Quick Question Pills */}
        <div className="bg-stone-50 border-b border-stone-200 p-2.5 flex items-center gap-2 overflow-x-auto hide-scrollbar">
          {quickQuestions.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(q)}
              className="shrink-0 text-[11px] font-semibold bg-white text-stone-700 hover:bg-emerald-950 hover:text-white px-3 py-1.5 rounded-full border border-stone-200 shadow-2xs transition-all cursor-pointer whitespace-nowrap"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Chat Feed */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-[#fbfbfa]">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'doctor' && (
                <div className="w-8 h-8 rounded-full bg-[#182d21] text-white flex items-center justify-center text-sm shrink-0 mt-1 shadow-xs">
                  🌿
                </div>
              )}

              <div
                className={`max-w-[82%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed shadow-xs ${
                  msg.sender === 'user'
                    ? 'bg-[#182d21] text-white rounded-br-none'
                    : 'bg-white text-stone-800 border border-stone-200/90 rounded-bl-none'
                }`}
              >
                <div className="whitespace-pre-line font-normal">{msg.text}</div>
                <span
                  className={`text-[10px] mt-2 block font-medium ${
                    msg.sender === 'user' ? 'text-emerald-200 text-right' : 'text-stone-400'
                  }`}
                >
                  {msg.timestamp}
                </span>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-3 justify-start items-center">
              <div className="w-8 h-8 rounded-full bg-[#182d21] text-white flex items-center justify-center text-sm shrink-0">
                🌿
              </div>
              <div className="bg-white border border-stone-200 px-4 py-3 rounded-2xl rounded-bl-none shadow-xs flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-700 animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-emerald-700 animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 rounded-full bg-emerald-700 animate-bounce [animation-delay:0.4s]" />
                <span className="text-xs text-stone-500 font-semibold ml-2">Dr. Flora is diagnosing...</span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3.5 sm:p-4 bg-white border-t border-stone-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Describe your plant symptoms or question..."
              className="flex-1 px-4 py-3 rounded-full border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#182d21] text-stone-800 text-xs sm:text-sm placeholder:text-stone-400"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isTyping}
              className="w-11 h-11 rounded-full bg-[#182d21] text-white flex items-center justify-center hover:bg-[#0f1c13] transition-colors disabled:opacity-40 cursor-pointer shrink-0 shadow-sm"
            >
              <span className="material-symbols-outlined text-xl">send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

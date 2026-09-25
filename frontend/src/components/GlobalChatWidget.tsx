"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useStore, LiveOrder, ChatMessage } from '@/context/StoreContext';
import { collection, query, where, onSnapshot, doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { formatError } from '@/lib/errorUtils';

export default function GlobalChatWidget() {
  const { liveOrders, submitUtr } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string>('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [userMsgText, setUserMsgText] = useState('');
  const [inputUtr, setInputUtr] = useState('');
  const [isSubmittingUtr, setIsSubmittingUtr] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Deduplicate liveOrders by order ID to prevent duplicate React keys
  const uniqueLiveOrders: LiveOrder[] = Array.from(
    new Map(liveOrders.map((o) => [o.id, o])).values()
  );

  // Default active order to most recent live order
  const activeOrder: LiveOrder | null = 
    uniqueLiveOrders.find(o => o.id === selectedOrderId) || 
    (uniqueLiveOrders.length > 0 ? uniqueLiveOrders[0] : null);

  useEffect(() => {
    if (activeOrder && !selectedOrderId) {
      setSelectedOrderId(activeOrder.id);
    }
  }, [uniqueLiveOrders, activeOrder, selectedOrderId]);

  // Subscribe to real-time Firestore Chat Messages for the selected active order
  useEffect(() => {
    const targetId = activeOrder?.id || 'general';
    try {
      const chatsRef = collection(db, 'chats');
      const q = query(chatsRef, where('orderId', '==', targetId));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const msgs: ChatMessage[] = snapshot.docs.map(doc => doc.data() as ChatMessage);
        msgs.sort((a, b) => (a.id > b.id ? 1 : -1));
        setChatMessages(msgs);
      }, (err) => {
        const saved = localStorage.getItem(`chat_${targetId}`);
        if (saved) setChatMessages(JSON.parse(saved));
      });
      return () => unsubscribe();
    } catch (e) {
      const saved = localStorage.getItem(`chat_${targetId}`);
      if (saved) setChatMessages(JSON.parse(saved));
    }
  }, [activeOrder?.id]);

  useEffect(() => {
    if (isOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isOpen]);

  const handleUtrSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackMsg(null);
    if (!inputUtr.trim() || !activeOrder) return;

    if (inputUtr.trim().length < 6) {
      setFeedbackMsg({ type: 'error', text: 'Please enter a valid 12-digit UTR reference number.' });
      return;
    }

    setIsSubmittingUtr(true);
    try {
      await submitUtr(activeOrder.id, inputUtr.trim());
      setInputUtr('');
      setFeedbackMsg({ type: 'success', text: 'UTR submitted successfully! Admin is verifying your payment.' });
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: formatError(err) });
    } finally {
      setIsSubmittingUtr(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackMsg(null);
    if (!userMsgText.trim()) return;

    const targetOrderId = activeOrder?.id || 'general';
    const msgId = Date.now().toString();
    const newMsg: ChatMessage = {
      id: msgId,
      orderId: targetOrderId,
      sender: 'user',
      senderName: activeOrder?.customerDetails?.fullName || 'Customer',
      text: userMsgText.trim(),
      type: 'text',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setUserMsgText('');

    try {
      await setDoc(doc(db, 'chats', `${targetOrderId}_${msgId}`), newMsg);
    } catch (err: any) {
      const saved = JSON.parse(localStorage.getItem(`chat_${targetOrderId}`) || '[]');
      const updated = [...saved, newMsg];
      localStorage.setItem(`chat_${targetOrderId}`, JSON.stringify(updated));
      setChatMessages(updated);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[999]">
      {/* Floating Widget Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-3 bg-[#182d21] text-white p-4 sm:px-5 sm:py-3.5 rounded-full shadow-2xl hover:bg-[#0f1c13] transition-all transform hover:scale-105 border border-emerald-600/40 cursor-pointer"
          title="Open Plantinum Atelier Live Chat"
        >
          <div className="relative flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl text-emerald-300">chat</span>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#182d21] animate-pulse" />
          </div>
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-xs font-bold text-white tracking-wide">Live Concierge Chat</span>
            <span className="text-[10px] text-emerald-300">Atelier Support &amp; Payment</span>
          </div>
        </button>
      )}

      {/* Expanded Floating Chat Modal Window */}
      {isOpen && (
        <div className="w-[92vw] sm:w-[400px] h-[550px] max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-stone-200 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="bg-[#182d21] text-white p-4 flex items-center justify-between border-b border-emerald-900/50">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-emerald-800 text-white flex items-center justify-center font-serif font-bold text-xs border border-emerald-500">
                  PA
                </div>
                <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#182d21] absolute bottom-0 right-0 animate-pulse" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-white leading-tight">Plantinum Atelier Chat Desk</h4>
                <p className="text-[10px] text-emerald-300">Live Support &amp; Payment Desk</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-stone-200 hover:text-white transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>

          {/* Active Orders Switcher Selector */}
          {uniqueLiveOrders.length > 0 && (
            <div className="bg-stone-100 px-3 py-2 border-b border-stone-200 flex items-center justify-between text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Active Order:</span>
              <select
                value={selectedOrderId}
                onChange={(e) => setSelectedOrderId(e.target.value)}
                className="bg-white border border-stone-300 rounded-lg px-2.5 py-1 text-xs font-mono font-bold text-stone-800 focus:outline-none focus:ring-1 focus:ring-emerald-800"
              >
                {uniqueLiveOrders.map(o => (
                  <option key={o.id} value={o.id}>
                    #{o.id} ({o.status.replace('_', ' ')})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Feedback Banner */}
          {feedbackMsg && (
            <div className={`p-2.5 text-xs text-center font-medium ${
              feedbackMsg.type === 'success' ? 'bg-emerald-100 text-emerald-900 border-b border-emerald-200' : 'bg-red-100 text-red-900 border-b border-red-200'
            }`}>
              {feedbackMsg.text}
            </div>
          )}

          {/* Message List */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-stone-50/60">
            {chatMessages.length === 0 ? (
              <div className="text-center py-10 text-stone-400 text-xs">
                <span className="material-symbols-outlined text-3xl mb-1 text-stone-300 block">support_agent</span>
                <p className="font-bold text-stone-600 mb-1">Welcome to Plantinum Concierge!</p>
                <p className="text-[11px] text-stone-400">Ask us any question about your orders, plant care, or GPay payments.</p>
              </div>
            ) : (
              chatMessages.map((msg) => {
                const isAdmin = msg.sender === 'admin' || msg.sender === 'system';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isAdmin ? 'items-start' : 'items-end'}`}
                  >
                    <span className="text-[9px] text-stone-400 mb-0.5 px-1">
                      {msg.senderName || (isAdmin ? 'Plantinum Concierge' : 'You')} • {msg.timestamp}
                    </span>

                    <div
                      className={`max-w-[88%] rounded-2xl p-3 shadow-sm text-xs leading-relaxed ${
                        isAdmin
                          ? 'bg-white text-stone-800 border border-stone-200 rounded-tl-none'
                          : 'bg-[#182d21] text-white rounded-tr-none'
                      }`}
                    >
                      <p className="whitespace-pre-line">{msg.text}</p>

                      {/* Render GPay UPI QR Payment Request inside Chat */}
                      {msg.type === 'qr_payment_request' && msg.paymentPayload && (
                        <div className="mt-2.5 p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-stone-900 text-center">
                          <img
                            src={msg.paymentPayload.qrCodeUrl}
                            alt="GPay QR Code"
                            className="w-36 h-36 mx-auto rounded-lg bg-white p-1 border border-emerald-200 mb-2"
                          />
                          <p className="font-mono text-[11px] font-bold text-stone-900">UPI ID: {msg.paymentPayload.upiId}</p>
                          <p className="text-xs font-extrabold text-emerald-950 mt-0.5">Amount: ₹{msg.paymentPayload.amount}</p>

                          {activeOrder?.status === 'payment_requested' && (
                            <form onSubmit={handleUtrSubmit} className="mt-2.5 pt-2 border-t border-emerald-200 text-left">
                              <label className="block text-[10px] font-bold text-stone-800 mb-1">
                                Submit 12-Digit UTR Number:
                              </label>
                              <div className="flex gap-1.5">
                                <input
                                  type="text"
                                  value={inputUtr}
                                  onChange={(e) => setInputUtr(e.target.value)}
                                  placeholder="12-digit UTR..."
                                  className="flex-1 px-2.5 py-1.5 rounded-lg border border-emerald-300 bg-white text-xs font-mono focus:outline-none focus:ring-1 focus:ring-emerald-700"
                                  required
                                />
                                <button
                                  type="submit"
                                  disabled={isSubmittingUtr}
                                  className="bg-emerald-800 text-white font-bold text-[11px] px-3 py-1.5 rounded-lg hover:bg-emerald-900 cursor-pointer disabled:opacity-50"
                                >
                                  Submit
                                </button>
                              </div>
                            </form>
                          )}
                        </div>
                      )}

                      {/* Render UTR Submission badge */}
                      {msg.type === 'utr_submission' && (
                        <div className="mt-1.5 inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-50 text-blue-900 font-mono text-[10px] font-bold border border-blue-200">
                          <span className="material-symbols-outlined text-xs text-blue-700">verified</span>
                          {msg.text}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}

            <div ref={chatBottomRef} />
          </div>

          {/* Input Bar */}
          <form onSubmit={handleSendMessage} className="p-2.5 bg-white border-t border-stone-200 flex gap-2">
            <input
              type="text"
              value={userMsgText}
              onChange={(e) => setUserMsgText(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-3.5 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#182d21] text-xs font-medium text-stone-800"
            />
            <button
              type="submit"
              className="bg-[#182d21] hover:bg-[#0f1c13] text-white p-2 rounded-xl transition-colors shrink-0 flex items-center justify-center cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg">send</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

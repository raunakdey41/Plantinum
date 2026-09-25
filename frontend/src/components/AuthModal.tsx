"use client";

import React, { useState, useEffect } from 'react';
import { signInWithEmailAndPassword, signInWithCustomToken, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useStore } from '@/context/StoreContext';
import { formatError } from '@/lib/errorUtils';

type AuthMode = 'login' | 'signup' | 'forgot-password';

export default function AuthModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [mode, setMode] = useState<AuthMode>('login');
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useStore();

  useEffect(() => {
    // Reset state when modal opens/closes
    if (!isOpen) {
      setEmail('');
      setPassword('');
      setOtp('');
      setMode('login');
      setOtpSent(false);
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || (mode === 'signup' && !password)) {
      setError('Please fill in all fields');
      return;
    }
    
    if (mode === 'signup' && password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const action = mode === 'signup' ? 'signup' : 'reset';
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, action }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send OTP');
      
      setOtpSent(true);
    } catch (err: any) {
      setError(formatError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) {
      setError('Please enter the OTP');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const action = mode === 'signup' ? 'signup' : 'reset';
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, password, action }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to verify OTP');
      
      // Successfully verified, we get a custom token
      await signInWithCustomToken(auth, data.customToken);
      onClose();
    } catch (err: any) {
      setError(formatError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(formatError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-primary/40 backdrop-blur-sm px-4">
      <div className="bg-surface-container-lowest rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-surface-container">
          <h3 className="font-headline-sm text-headline-sm text-primary font-bold">
            {user ? 'My Profile' : (mode === 'login' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Reset Password')}
          </h3>
          <button onClick={onClose} className="p-1 text-on-surface hover:text-error rounded-full transition-colors cursor-pointer">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        
        <div className="p-6">
          {user ? (
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="w-20 h-20 rounded-full bg-secondary-container flex items-center justify-center text-secondary text-2xl font-bold uppercase">
                {user.email?.charAt(0) || 'U'}
              </div>
              <div>
                <p className="font-title-md text-primary font-bold">{user.email || 'User'}</p>
                <p className="text-body-sm text-on-surface-variant">Member since {new Date(user.metadata.creationTime || '').toLocaleDateString()}</p>
              </div>
              <button 
                onClick={handleLogout}
                className="mt-2 w-full py-2.5 rounded-lg border border-error text-error font-label-md font-bold hover:bg-error/10 transition-colors cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <form onSubmit={mode === 'login' ? handleLogin : (otpSent ? handleVerifyOtp : handleSendOtp)} className="flex flex-col gap-4">
              {error && <div className="p-3 bg-error/10 text-error text-sm rounded-lg">{error}</div>}
              
              {!otpSent ? (
                <>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-label-sm font-label-sm text-on-surface-variant">Email Address <span className="text-error">*</span></label>
                    <input 
                      type="email" 
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full px-4 py-2.5 rounded-lg bg-surface-container-low text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                      required 
                    />
                  </div>
                  
                  {mode !== 'forgot-password' && (
                    <div className="flex flex-col gap-1.5">
                      <label className="text-label-sm font-label-sm text-on-surface-variant">Password <span className="text-error">*</span></label>
                      <input 
                        type="password" 
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-4 py-2.5 rounded-lg bg-surface-container-low text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                        required 
                        minLength={6}
                      />
                    </div>
                  )}

                  {mode === 'login' && (
                    <div className="text-right">
                      <button 
                        type="button" 
                        onClick={() => { setMode('forgot-password'); setError(''); }} 
                        className="text-primary text-sm hover:underline"
                      >
                        Forgot Password?
                      </button>
                    </div>
                  )}
                  
                  <button 
                    type="submit" 
                    disabled={loading || !email || (mode !== 'forgot-password' && !password)}
                    className="mt-2 w-full py-3 rounded-lg bg-primary text-on-primary font-label-md font-bold hover:bg-primary-container hover:text-on-primary-container transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {loading ? 'Processing...' : (mode === 'login' ? 'Sign In' : 'Send OTP')}
                  </button>
                </>
              ) : (
                <>
                  <div className="p-3 bg-primary-container/20 text-on-surface text-sm rounded-lg text-center mb-2">
                    An OTP has been sent to <strong>{email}</strong>
                  </div>

                  {mode === 'forgot-password' && (
                    <div className="flex flex-col gap-1.5 mb-2">
                      <label className="text-label-sm font-label-sm text-on-surface-variant">New Password <span className="text-error">*</span></label>
                      <input 
                        type="password" 
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-4 py-2.5 rounded-lg bg-surface-container-low text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                        required 
                        minLength={6}
                      />
                    </div>
                  )}
                  
                  <div className="flex flex-col gap-1.5">
                    <label className="text-label-sm font-label-sm text-on-surface-variant">6-Digit OTP <span className="text-error">*</span></label>
                    <input 
                      type="text" 
                      value={otp}
                      onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="123456"
                      className="w-full px-4 py-2.5 rounded-lg bg-surface-container-low text-on-surface text-center tracking-[0.5em] font-bold text-xl focus:outline-none focus:ring-1 focus:ring-primary"
                      required 
                    />
                  </div>
                  
                  <button 
                    type="submit" 
                    disabled={loading || otp.length !== 6 || (mode === 'forgot-password' && !password)}
                    className="mt-2 w-full py-3 rounded-lg bg-primary text-on-primary font-label-md font-bold hover:bg-primary-container hover:text-on-primary-container transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {loading ? 'Verifying...' : 'Verify & Complete'}
                  </button>
                  
                  <button 
                    type="button"
                    disabled={loading}
                    onClick={() => { setOtpSent(false); setOtp(''); }}
                    className="mt-1 w-full py-2 text-on-surface-variant text-sm hover:text-on-surface transition-colors"
                  >
                    Change Email
                  </button>
                </>
              )}

              <div className="text-center mt-2 flex flex-col gap-2">
                <button 
                  type="button" 
                  onClick={() => {
                    setMode(mode === 'login' ? 'signup' : 'login');
                    setOtpSent(false);
                    setError('');
                  }} 
                  className="text-secondary text-sm font-bold hover:underline"
                >
                  {mode === 'login' ? "Don't have an account? Sign Up" : "Back to Sign In"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

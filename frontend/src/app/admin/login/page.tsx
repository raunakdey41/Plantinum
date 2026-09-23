"use client";

import React, { useState } from 'react';
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check for unauthorized redirect error
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('error') === 'unauthorized') {
        setError('You do not have permission to access the admin portal.');
        // Clean up URL
        window.history.replaceState({}, '', '/admin/login');
      }
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/admin');
    } catch (err: any) {
      if (err.code === 'auth/invalid-credential') {
        setError('Invalid email or password. Please try again.');
      } else if (err.code === 'auth/user-not-found') {
        setError('No admin account found with this email.');
      } else {
        setError('Failed to securely login. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-surface-container-low px-4">
      <div className="max-w-md w-full bg-surface-container-lowest p-8 rounded-2xl shadow-xl">
        <div className="text-center mb-8">
          <h1 className="font-headline-lg text-primary text-3xl font-bold mb-2">Plantinum Admin</h1>
          <p className="text-on-surface-variant font-body-sm">Sign in to manage your store</p>
        </div>

        {error && (
          <div className="bg-error-container text-on-error-container p-3 rounded-lg mb-6 font-body-sm text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <div>
            <label className="block font-label-sm text-on-surface mb-1.5 uppercase tracking-wider text-[11px] font-bold">Email Address</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-body-md"
              placeholder="admin@plantinum.com"
            />
          </div>
          <div>
            <label className="block font-label-sm text-on-surface mb-1.5 uppercase tracking-wider text-[11px] font-bold">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-body-md"
              placeholder="••••••••"
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="mt-2 w-full bg-primary hover:bg-secondary text-on-primary py-3 rounded-lg font-label-md uppercase tracking-wider font-bold transition-colors disabled:opacity-70 flex justify-center items-center h-12"
          >
            {loading ? <span className="material-symbols-outlined animate-spin">refresh</span> : 'Secure Login'}
          </button>
        </form>
      </div>
    </div>
  );
}

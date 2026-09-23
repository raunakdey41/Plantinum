"use client";

import React, { useState, useEffect } from 'react';
import { useStore } from '@/context/StoreContext';

export default function LocationModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { deliveryLocation, setDeliveryLocation } = useStore();
  
  // Extract digits from the current deliveryLocation if it matches "City Pincode"
  const existingPincode = deliveryLocation.match(/\d{6}/)?.[0] || '';
  const [pincode, setPincode] = useState(existingPincode);
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch initial city if existingPincode is there
  useEffect(() => {
    if (isOpen && pincode.length === 6 && !city) {
      fetchCity(pincode);
    }
  }, [isOpen]);

  const fetchCity = async (pin: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
      const data = await res.json();
      if (data && data[0].Status === 'Success') {
        // PostOffice can have District, Name, State
        setCity(data[0].PostOffice[0].District);
      } else {
        setError('Invalid Pincode');
        setCity('');
      }
    } catch (err) {
      setError('Failed to fetch location');
      setCity('');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (pincode.length === 6) {
      fetchCity(pincode);
    } else {
      setCity('');
      setError('');
    }
  }, [pincode]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pincode.length === 6 && city) {
      setDeliveryLocation(`${city} ${pincode}`);
      onClose();
    } else if (pincode.length === 6 && !error && !loading) {
      // Fallback if API fails but valid length
      setDeliveryLocation(pincode);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-primary/40 backdrop-blur-sm px-4">
      <div className="bg-surface-container-lowest rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-surface-container">
          <h3 className="font-headline-sm text-headline-sm text-primary font-bold">Delivery Location</h3>
          <button onClick={onClose} className="p-1 text-on-surface hover:text-error rounded-full transition-colors cursor-pointer">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-label-sm font-label-sm text-on-surface-variant">Enter 6-digit Pincode</label>
            <input 
              type="text" 
              maxLength={6}
              value={pincode}
              onChange={e => setPincode(e.target.value.replace(/\D/g, ''))}
              placeholder="e.g. 700001"
              className="w-full px-4 py-2.5 rounded-lg bg-surface-container-low text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
              autoFocus
              required 
            />
          </div>

          <div className="min-h-[24px] flex items-center">
            {loading && <span className="text-sm text-on-surface-variant animate-pulse">Fetching city...</span>}
            {error && <span className="text-sm text-error">{error}</span>}
            {city && !loading && (
              <span className="text-sm text-primary font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">location_on</span>
                Deliver to {city}
              </span>
            )}
          </div>
          
          <button 
            type="submit" 
            disabled={pincode.length !== 6 || !!error || loading}
            className="w-full py-3 rounded-lg bg-primary text-on-primary font-label-md font-bold hover:bg-primary-container hover:text-on-primary-container transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save Location
          </button>
        </form>
      </div>
    </div>
  );
}

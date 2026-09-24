"use client";

import React from 'react';

export interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const isDanger = type === 'danger';
  const isWarning = type === 'warning';

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant w-full max-w-md p-6 flex flex-col items-center text-center gap-4 relative overflow-hidden">
        
        {/* Decorative background glow */}
        <div className={`absolute -top-12 -right-12 w-32 h-32 rounded-full blur-2xl opacity-30 pointer-events-none ${
          isDanger ? 'bg-error' : isWarning ? 'bg-amber-500' : 'bg-primary'
        }`} />

        {/* Icon Container */}
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner ${
          isDanger 
            ? 'bg-error-container/50 text-error' 
            : isWarning 
            ? 'bg-amber-100 text-amber-700' 
            : 'bg-primary-container/50 text-primary'
        }`}>
          <span className="material-symbols-outlined text-3xl font-bold">
            {isDanger ? 'delete_forever' : isWarning ? 'warning' : 'info'}
          </span>
        </div>

        {/* Text Content */}
        <div className="flex flex-col gap-1.5">
          <h3 className="font-headline-sm font-bold text-on-surface text-lg md:text-xl">
            {title}
          </h3>
          <p className="text-on-surface-variant text-xs md:text-sm leading-relaxed">
            {message}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-center gap-3 w-full mt-2 pt-2">
          {cancelText && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-2.5 px-4 rounded-xl border border-outline-variant text-on-surface font-bold text-xs md:text-sm hover:bg-surface-container transition-colors"
            >
              {cancelText}
            </button>
          )}
          <button
            type="button"
            onClick={onConfirm}
            className={`flex-1 py-2.5 px-4 rounded-xl text-white font-bold text-xs md:text-sm shadow-md transition-opacity hover:opacity-90 flex items-center justify-center gap-1.5 ${
              isDanger 
                ? 'bg-error' 
                : isWarning 
                ? 'bg-amber-600' 
                : 'bg-primary'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

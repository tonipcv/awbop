/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState } from "react";
import Image from 'next/image';
import Link from "next/link";
import { ArrowRight, ArrowLeft } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      setIsSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1a1a1a] to-[#2a2a2a] font-normal tracking-[-0.03em] relative z-10">
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-[420px] bg-[#0f0f0f] rounded-2xl border border-gray-800 p-8 shadow-lg relative z-20">
            {/* Logo */}
            <div className="text-center mb-8">
              <div className="flex justify-center items-center mb-4">
                <Image
                  src="/logo.png"
                  alt="Logo"
                  width={40}
                  height={13}
                  className="object-contain"
                  priority
                />
              </div>
            </div>

            {/* Success Icon */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-200 mb-2">Email sent!</h2>
              <p className="text-gray-400 text-sm">
                We've sent a password recovery link to your email.
              </p>
            </div>

            {/* Back to login */}
            <Link 
              href="/auth/signin"
              className="w-full py-2.5 px-4 text-sm font-semibold text-gray-300 bg-[#1a1a1a] hover:bg-[#2a2a2a] rounded-lg transition-all duration-300 flex items-center justify-center gap-2 border border-gray-700"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1a1a] to-[#2a2a2a] font-normal tracking-[-0.03em] relative z-10">
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-[420px] bg-[#0f0f0f] rounded-2xl border border-gray-800 p-8 shadow-lg relative z-20">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="flex justify-center items-center mb-4">
              <Image
                src="/logo.png"
                alt="Logo"
                width={40}
                height={13}
                className="object-contain"
                priority
              />
            </div>
            <h1 className="text-xl font-semibold text-gray-200 mb-2">Forgot your password?</h1>
            <p className="text-gray-400 text-sm">
              Enter your email and we'll send you a link to reset your password.
            </p>
          </div>

          {/* Mensagem de erro */}
          {error && (
            <div className="mb-6 text-red-400 text-center text-sm">{error}</div>
          )}
          
          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-5" autoComplete="off">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="off"
                className="w-full px-4 py-2.5 text-sm bg-[#1a1a1a] border border-gray-700 rounded-lg focus:ring-2 focus:ring-gray-600/20 focus:border-gray-500 transition-all duration-200 text-gray-200"
                placeholder="m@example.com"
              />
            </div>

            <button 
              type="submit" 
              className="w-full py-2.5 px-4 text-sm font-semibold text-white bg-[#1a1a1a] hover:bg-[#2a2a2a] rounded-lg transition-all duration-300 flex items-center justify-center gap-2 border border-gray-700"
              disabled={isLoading}
            >
              {isLoading ? 'Sending link...' : 'Reset password'}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Links */}
          <div className="mt-4 text-center">
            <Link 
              href="/auth/signin" 
              className="text-sm text-gray-400 hover:text-gray-200 transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <ArrowLeft className="h-3 w-3" />
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 
'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import NeonText from '@/components/neon/neon-text';

interface PINInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  disabled?: boolean;
  error?: boolean;
  className?: string;
}

export default function PINInput({
  length = 6,
  value,
  onChange,
  onComplete,
  disabled = false,
  error = false,
  className,
}: PINInputProps) {
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Auto-focus first input on mount
  useEffect(() => {
    if (inputRefs.current[0] && !disabled) {
      inputRefs.current[0].focus();
    }
  }, [disabled]);

  const handleInputChange = (index: number, inputValue: string) => {
    // Only allow digits
    const digit = inputValue.replace(/\D/g, '').slice(0, 1);
    
    if (digit) {
      const newValue = value.split('');
      newValue[index] = digit;
      const updatedValue = newValue.join('');
      
      onChange(updatedValue);
      
      // Auto-focus next input
      if (index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      } else {
        // All digits filled, trigger completion
        if (updatedValue.length === length && onComplete) {
          onComplete(updatedValue);
        }
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (value[index]) {
        // Clear current digit
        const newValue = value.split('');
        newValue[index] = '';
        onChange(newValue.join(''));
      } else if (index > 0) {
        // Move to previous input and clear it
        const newValue = value.split('');
        newValue[index - 1] = '';
        onChange(newValue.join(''));
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    
    if (pastedData.length > 0) {
      onChange(pastedData);
      
      // Focus the next empty input or the last input
      const nextIndex = Math.min(pastedData.length, length - 1);
      inputRefs.current[nextIndex]?.focus();
      
      // Trigger completion if all digits are filled
      if (pastedData.length === length && onComplete) {
        onComplete(pastedData);
      }
    }
  };

  return (
    <div className={cn('flex justify-center gap-3', className)}>
      {Array.from({ length }, (_, index) => (
        <div key={index} className="relative">
          <input
            ref={(el) => { inputRefs.current[index] = el; }}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={value[index] || ''}
            onChange={(e) => handleInputChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            onFocus={() => setFocusedIndex(index)}
            onBlur={() => setFocusedIndex(null)}
            disabled={disabled}
            className={cn(
              'w-12 h-14 md:w-14 md:h-16 text-center text-2xl md:text-3xl font-bold',
              'bg-purple-500/10 border-2 rounded-xl transition-all duration-200',
              'focus:outline-none focus:ring-0',
              'text-white placeholder-white/50',
              // Focus state
              focusedIndex === index && 'border-purple-400 shadow-lg shadow-purple-400/30',
              // Error state
              error && 'border-red-400 shadow-lg shadow-red-400/30',
              // Default state
              !focusedIndex && !error && 'border-white/30 hover:border-white/50',
              // Disabled state
              disabled && 'opacity-50 cursor-not-allowed'
            )}
            style={{
              background: 'rgba(139, 92, 246, 0.08)',
              backdropFilter: 'blur(10px)',
            }}
          />
          
          {/* Glow effect for focused/error states */}
          {(focusedIndex === index || error) && (
            <div
              className={cn(
                'absolute inset-0 rounded-xl pointer-events-none',
                'animate-pulse',
                error ? 'bg-red-400/20' : 'bg-purple-400/20'
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}

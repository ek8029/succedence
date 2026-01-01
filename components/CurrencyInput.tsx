'use client';

import { useRef, useEffect, forwardRef } from 'react';

interface CurrencyInputProps {
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
  disabled?: boolean;
  'aria-label'?: string;
}

export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ value, onChange, placeholder, className, required, disabled, 'aria-label': ariaLabel }, ref) => {
    const inputRef = useRef<HTMLInputElement>(null);

    // Combine refs
    useEffect(() => {
      if (ref && inputRef.current) {
        if (typeof ref === 'function') {
          ref(inputRef.current);
        } else {
          ref.current = inputRef.current;
        }
      }
    }, [ref]);

    const formatCurrency = (value: number | undefined): string => {
      if (!value) return '';
      return value.toLocaleString();
    };

    const parseCurrency = (value: string): number | undefined => {
      const cleaned = value.replace(/[^0-9]/g, '');
      const num = parseInt(cleaned);
      return isNaN(num) ? undefined : num;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(parseCurrency(e.target.value));
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      // Select all text on focus for easy editing
      e.target.select();
    };

    return (
      <div className="relative">
        <span
          className="absolute left-4 top-1/2 -translate-y-1/2 text-silver/50 pointer-events-none select-none z-10"
          aria-hidden="true"
        >
          $
        </span>
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          value={formatCurrency(value)}
          onChange={handleChange}
          onFocus={handleFocus}
          placeholder={placeholder}
          className={className || "w-full pl-8 pr-4 py-3 bg-charcoal/50 border border-white/10 rounded-luxury text-warm-white placeholder-silver/50 focus:border-gold/50 focus:outline-none focus:ring-2 focus:ring-gold/20"}
          required={required}
          disabled={disabled}
          aria-label={ariaLabel}
        />
      </div>
    );
  }
);

CurrencyInput.displayName = 'CurrencyInput';

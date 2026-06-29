import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { motion, AnimatePresence } from 'framer-motion';

export function PasswordInput({ 
  value, 
  onChange, 
  showStrength = false,
  label = "Password",
  id = "password",
  ...props 
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [capsLock, setCapsLock] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.getModifierState) {
        setCapsLock(e.getModifierState('CapsLock'));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Simple UI-only strength calculation
  const getStrength = (pass) => {
    if (!pass) return { score: 0, text: '', color: 'bg-white/10' };
    let score = 0;
    if (pass.length > 7) score += 1;
    if (pass.length > 12) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score < 2) return { score: 1, text: 'Weak', color: 'bg-red-500' };
    if (score < 4) return { score: 2, text: 'Fair', color: 'bg-orange-400' };
    return { score: 3, text: 'Strong', color: 'bg-emerald-500' };
  };

  const strength = showStrength ? getStrength(value) : null;

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium text-muted-foreground flex justify-between">
        {label}
        {capsLock && (
          <span className="text-orange-400 flex items-center gap-1 text-xs">
            <AlertTriangle size={12} /> Caps Lock is ON
          </span>
        )}
      </label>
      <div className="relative">
        <Input
          id={id}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          className="pr-10"
          {...props}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      {showStrength && value && (
        <AnimatePresence>
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2 pt-1"
          >
            <div className="flex-1 flex gap-1 h-1.5">
              {[1, 2, 3].map((level) => (
                <div 
                  key={level} 
                  className={`flex-1 rounded-full transition-colors duration-300 ${
                    strength.score >= level ? strength.color : 'bg-white/10'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs font-medium text-muted-foreground w-12 text-right">
              {strength.text}
            </span>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}

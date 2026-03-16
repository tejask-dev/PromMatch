import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { Mail, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import FloatingParticles from '../components/FloatingParticles';

const TAGLINES = [
  'Find Your Perfect Prom Date ✨',
  'The Night of Your Life Starts Here 👑',
  'Your Fairytale Begins Tonight 💕',
  'Make Prom Unforgettable 🌟',
];

const Signup = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [taglineIndex, setTaglineIndex] = useState(0);
  const { signIn, signUp, signInWithGoogle } = useAuth();

  useEffect(() => {
    const interval = setInterval(() => {
      setTaglineIndex((i) => (i + 1) % TAGLINES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        await signIn(email, password);
        toast.success('Welcome back! 💕');
      } else {
        await signUp(email, password);
        toast.success('Account created! Check your email to confirm.');
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      toast.error(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <FloatingParticles count={20} />

      {/* Ambient orbs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(255,26,145,0.15) 0%, transparent 70%)' }} />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)' }} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0, rotate: -15 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 16 }}
            className="inline-block mb-3"
          >
            <span className="text-6xl" style={{ filter: 'drop-shadow(0 0 20px rgba(255,26,145,0.6))' }}>💕</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="font-prom text-5xl gradient-text mb-3"
            style={{ textShadow: '0 0 40px rgba(255,26,145,0.3)' }}
          >
            PromMatch
          </motion.h1>

          {/* Animated tagline */}
          <div className="h-6 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.p
                key={taglineIndex}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.4 }}
                className="text-white/60 text-sm font-medium"
              >
                {TAGLINES[taglineIndex]}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>

        {/* Auth card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="glass-card rounded-3xl p-8"
        >
          {/* Toggle tabs */}
          <div className="flex mb-7 rounded-2xl p-1" style={{ background: 'rgba(255,255,255,0.07)' }}>
            {['Sign In', 'Sign Up'].map((label, i) => (
              <button
                key={label}
                onClick={() => setIsLogin(i === 0)}
                className="flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200"
                style={
                  (i === 0) === isLogin
                    ? { background: 'linear-gradient(135deg, #ff1a91, #7c3aed)', color: 'white', boxShadow: '0 4px 15px rgba(255,26,145,0.3)' }
                    : { color: 'rgba(255,255,255,0.5)' }
                }
              >
                {label}
              </button>
            ))}
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-4 mb-5">
            <div>
              <label className="block text-white/70 text-sm font-medium mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-dark pl-10"
                  placeholder="you@school.edu"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-white/70 text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-dark pl-10"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full btn-prom py-3.5 text-base"
              style={{ boxShadow: '0 8px 25px rgba(255,26,145,0.35)' }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Loading…
                </span>
              ) : (
                isLogin ? 'Sign In 🚀' : 'Create Account 💕'
              )}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="relative flex items-center mb-5">
            <div className="flex-1 border-t border-white/10" />
            <span className="px-3 text-white/30 text-xs">or continue with</span>
            <div className="flex-1 border-t border-white/10" />
          </div>

          {/* Google */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGoogleAuth}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-xl font-medium text-sm transition-all duration-200 disabled:opacity-50"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: 'white' }}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </motion.button>
        </motion.div>

        <p className="mt-5 text-center text-white/25 text-xs">
          By signing up, you agree to our Terms of Service and Privacy Policy
        </p>
      </motion.div>
    </div>
  );
};

export default Signup;

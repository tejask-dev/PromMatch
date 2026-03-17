import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { Mail, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import FloatingParticles from '../components/FloatingParticles';
import PrivacyPolicyModal from '../components/PrivacyPolicyModal';

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
  const [showPrivacy, setShowPrivacy] = useState(false);
  const { signIn, signUp } = useAuth();

  useEffect(() => {
    const interval = setInterval(() => {
      setTaglineIndex((i) => (i + 1) % TAGLINES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    if (!isLogin) {
      // Show privacy policy first before creating account
      setShowPrivacy(true);
      return;
    }
    await doSignIn();
  };

  const doSignIn = async () => {
    setLoading(true);
    try {
      await signIn(email, password);
      toast.success('Welcome back! 💕');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const doSignUp = async () => {
    setShowPrivacy(false);
    setLoading(true);
    try {
      await signUp(email, password);
      toast.success('Account created! Check your email to confirm.');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <PrivacyPolicyModal
        isOpen={showPrivacy}
        onAccept={doSignUp}
        onClose={() => setShowPrivacy(false)}
      />
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
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-dark"
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="you@school.edu"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-white/70 text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-dark"
                  style={{ paddingLeft: '2.5rem' }}
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

        </motion.div>

        <p className="mt-5 text-center text-white/25 text-xs">
          By signing up, you agree to our Terms of Service and Privacy Policy
        </p>
      </motion.div>
    </div>
  );
};

export default Signup;

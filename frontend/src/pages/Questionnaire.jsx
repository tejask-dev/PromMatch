import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import axios from 'axios';
import toast from 'react-hot-toast';
import { API_BASE_URL, getAuthHeaders } from '../config/api';

const SLIDER_EMOJIS = ['😬', '😐', '🙂', '😊', '🤩'];

const Questionnaire = () => {
  const navigate = useNavigate();
  const { getToken } = useAuth();

  const [questions, setQuestions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [catIndex, setCatIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      const token = getToken();
      const headers = token ? getAuthHeaders(token) : {};
      const [questionsRes, answersRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/questionnaire/questions`),
        axios.get(`${API_BASE_URL}/questionnaire/my-answers`, { headers }).catch(() => ({ data: { answers: {} } })),
      ]);

      const allQuestions = questionsRes.data.questions || [];
      setQuestions(allQuestions);

      // Group by category
      const groups = {};
      allQuestions.forEach((q) => {
        const cat = q.category || 'general';
        if (!groups[cat]) groups[cat] = { name: cat, questions: [] };
        groups[cat].questions.push(q);
      });
      setCategories(Object.values(groups));
      setAnswers(answersRes.data.answers || {});
    } catch (e) {
      toast.error('Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const token = getToken();
      if (!token) { toast.error('Please sign in first'); return; }
      await axios.post(`${API_BASE_URL}/questionnaire/submit`, answers, { headers: getAuthHeaders(token) });
      toast.success('Your matches just got smarter! 🎯');
      navigate('/dashboard');
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Failed to save answers');
    } finally {
      setSubmitting(false);
    }
  };

  const totalAnswered = Object.keys(answers).length;
  const totalQuestions = questions.length;
  const progressPct = totalQuestions > 0 ? (totalAnswered / totalQuestions) * 100 : 0;

  const CAT_LABELS = {
    personality: 'Personality 🎭',
    values: 'Values 💎',
    prom_expectations: 'Prom Night 🎊',
    comfort_levels: 'Comfort 🛡️',
    interests: 'Interests 🎵',
    communication: 'Communication 💬',
    deal_breakers: 'Deal Breakers 🚫',
    vibe: 'Your Vibe ✨',
    general: 'General ❓',
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-white/10 border-t-pink-500 animate-spin" />
      </div>
    );
  }

  const currentCat = categories[catIndex];
  const isLast = catIndex === categories.length - 1;

  return (
    <div className="min-h-screen pb-12">
      {/* Header */}
      <div className="glass sticky top-0 z-20">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => navigate('/dashboard')} className="p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-all">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="text-center">
            <span className="font-bold text-white text-sm">Your Vibe Check ✨</span>
            <p className="text-white/40 text-xs">{catIndex + 1} of {categories.length}</p>
          </div>
          {/* Circular progress */}
          <div className="relative w-10 h-10">
            <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
              <circle cx="18" cy="18" r="15" fill="none" stroke="url(#pg)" strokeWidth="3"
                strokeDasharray={`${progressPct * 0.942} 94.2`} strokeLinecap="round" />
              <defs>
                <linearGradient id="pg" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#ff1a91" />
                  <stop offset="100%" stopColor="#7c3aed" />
                </linearGradient>
              </defs>
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white">
              {Math.round(progressPct)}%
            </span>
          </div>
        </div>
      </div>

      {/* Category tabs */}
      <div className="max-w-lg mx-auto px-4 py-4 overflow-x-auto">
        <div className="flex gap-2 w-max">
          {categories.map((cat, i) => {
            const catAnswered = cat.questions.filter((q) => answers[q.id] !== undefined).length;
            const allAnswered = catAnswered === cat.questions.length;
            return (
              <button
                key={cat.name}
                onClick={() => setCatIndex(i)}
                className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200"
                style={i === catIndex
                  ? { background: 'linear-gradient(135deg, #ff1a91, #7c3aed)', color: 'white' }
                  : allAnswered
                  ? { background: 'rgba(34,197,94,0.2)', color: '#86efac', border: '1px solid rgba(34,197,94,0.3)' }
                  : { background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)' }
                }
              >
                {allAnswered && i !== catIndex ? '✓ ' : ''}{CAT_LABELS[cat.name] || cat.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Questions */}
      <div className="max-w-lg mx-auto px-4">
        <AnimatePresence mode="wait">
          {currentCat && (
            <motion.div
              key={catIndex}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.25 }}
              className="space-y-5"
            >
              <h2 className="text-xl font-black text-white">{CAT_LABELS[currentCat.name] || currentCat.name}</h2>

              {currentCat.questions.map((q) => (
                <div key={q.id} className="glass-card rounded-2xl p-5">
                  <p className="font-semibold text-white mb-1">{q.question}</p>
                  {q.why && <p className="text-white/40 text-xs mb-4">{q.why}</p>}

                  {q.type === 'multiple_choice' ? (
                    <div className="grid grid-cols-1 gap-2">
                      {q.options.map((opt) => {
                        const selected = answers[q.id] === opt.value;
                        return (
                          <button
                            key={opt.value}
                            onClick={() => handleAnswer(q.id, opt.value)}
                            className="w-full text-left px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200"
                            style={selected
                              ? { background: 'linear-gradient(135deg, rgba(255,26,145,0.25), rgba(124,58,237,0.25))', border: '1px solid rgba(255,26,145,0.5)', color: 'white' }
                              : { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }
                            }
                          >
                            {selected && <span className="mr-2">✓</span>}{opt.label}
                          </button>
                        );
                      })}
                    </div>
                  ) : q.type === 'slider' ? (
                    <div>
                      <div className="text-center text-3xl mb-3">
                        {SLIDER_EMOJIS[Math.round((answers[q.id] || 3) - 1)]}
                      </div>
                      <input
                        type="range"
                        min={1}
                        max={5}
                        step={1}
                        value={answers[q.id] || 3}
                        onChange={(e) => handleAnswer(q.id, parseInt(e.target.value))}
                        className="w-full accent-pink-500"
                        style={{ accentColor: '#ff1a91' }}
                      />
                      <div className="flex justify-between text-xs text-white/40 mt-1">
                        <span>Not at all</span>
                        <span>Very much</span>
                      </div>
                    </div>
                  ) : null}
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex gap-3 mt-8">
          {catIndex > 0 && (
            <button onClick={() => setCatIndex((i) => i - 1)} className="btn-glass py-3 px-5 rounded-xl flex items-center gap-2 text-sm font-semibold">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          )}
          {!isLast ? (
            <button onClick={() => setCatIndex((i) => i + 1)} className="flex-1 btn-prom py-3 rounded-xl flex items-center justify-center gap-2 text-sm">
              Next <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={submitting} className="flex-1 btn-prom py-3 rounded-xl flex items-center justify-center gap-2 text-sm disabled:opacity-50">
              {submitting ? (
                <><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Saving…</>
              ) : (
                <><Check className="w-4 h-4" /> Save & Boost Matches 🎯</>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Questionnaire;

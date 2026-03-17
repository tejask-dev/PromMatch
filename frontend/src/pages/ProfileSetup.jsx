import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Camera, X, ArrowRight, ArrowLeft, Plus, Check, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import { uploadToSupabase } from '../services/imageUpload';
import { API_BASE_URL, getAuthHeaders } from '../config/api';
import { WINDSOR_ESSEX_SCHOOLS, isValidWindsorEssexSchool } from '../data/schools';

const wordCount = (str) => str.trim().split(/\s+/).filter(Boolean).length;

const GRADE_OPTIONS = [
  { value: 'junior', label: 'Grade 11 (Junior)' },
  { value: 'senior', label: 'Grade 12 (Senior)' },
];

const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'non-binary', label: 'Non-Binary' },
  { value: 'other', label: 'Other' },
];

const HOBBY_PRESETS = [
  '🎵 Music', '🎨 Art', '📸 Photography', '🎮 Gaming', '⚽ Soccer',
  '🏀 Basketball', '🎭 Theater', '📚 Reading', '✍️ Writing', '💃 Dance',
  '🏊 Swimming', '🎸 Guitar', '🎤 Singing', '🏋️ Fitness', '🍳 Cooking',
  '🎬 Film', '🌿 Nature', '🐾 Animals', '🎯 Archery', '🏄 Surfing',
  '🎻 Violin', '🎹 Piano', '🚀 Tech', '🌍 Travel', '🧘 Yoga',
  '🎪 Comedy', '🎲 Board Games', '🖥️ Coding', '🎀 Fashion', '☕ Coffee',
];

const PERSONALITY_QUESTIONS = [
  "What's your ideal prom night?",
  "What makes you laugh?",
  "Describe your perfect date",
  "What's your favorite way to spend weekends?",
  "What's something you're passionate about?",
];

const STEPS = [
  { num: 1, label: 'Basics', emoji: '✨' },
  { num: 2, label: 'Photos', emoji: '📸' },
  { num: 3, label: 'Vibes', emoji: '🎵' },
  { num: 4, label: 'Socials', emoji: '📱' },
  { num: 5, label: 'Personality', emoji: '💫' },
];

const ProfileSetup = () => {
  const { user, getToken } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [photos, setPhotos] = useState(Array(6).fill(null));
  const [uploadingSlot, setUploadingSlot] = useState(null);
  const fileRefs = useRef([]);
  const [schoolSearch, setSchoolSearch] = useState('');
  const [showSchoolDropdown, setShowSchoolDropdown] = useState(false);
  const schoolRef = useRef(null);

  // Close school dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => { if (schoolRef.current && !schoolRef.current.contains(e.target)) setShowSchoolDropdown(false); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    gender: '',
    looking_for: [],
    grade: '',
    school: '',
    hobbies: [],
    socials: { instagram: '', snapchat: '', tiktok: '' },
    personality: '',
    question_answers: PERSONALITY_QUESTIONS.reduce((acc, q) => ({ ...acc, [q]: '' }), {}),
  });

  // Load existing profile on mount
  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/users/profile/${user.id}`);
        const p = res.data?.profile;
        if (p) {
          setIsEditMode(true);
          setFormData({
            name: p.name || '',
            bio: p.bio || '',
            gender: p.gender || '',
            looking_for: p.looking_for || [],
            grade: p.grade || '',
            school: p.school || '',
            hobbies: p.hobbies || [],
            socials: { instagram: p.socials?.instagram || '', snapchat: p.socials?.snapchat || '', tiktok: p.socials?.tiktok || '' },
            personality: p.personality || '',
            question_answers: {
              ...PERSONALITY_QUESTIONS.reduce((acc, q) => ({ ...acc, [q]: '' }), {}),
              ...(p.question_answers || {}),
            },
          });
          // Pre-fill existing photo as first slot if present
          if (p.profile_pic_url) {
            setPhotos(prev => {
              const next = [...prev];
              next[0] = { file: null, preview: p.profile_pic_url, url: p.profile_pic_url };
              return next;
            });
          }
        }
      } catch {
        // No profile yet — stay in create mode
      } finally {
        setLoadingProfile(false);
      }
    };
    load();
  }, [user]);

  const handleInputChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));
  const handleSocialChange = (platform, value) => setFormData(prev => ({ ...prev, socials: { ...prev.socials, [platform]: value } }));
  const handleQuestionAnswer = (question, answer) => setFormData(prev => ({ ...prev, question_answers: { ...prev.question_answers, [question]: answer } }));

  const toggleLookingFor = (gender) => {
    setFormData(prev => ({
      ...prev,
      looking_for: prev.looking_for.includes(gender)
        ? prev.looking_for.filter(g => g !== gender)
        : [...prev.looking_for, gender],
    }));
  };

  const toggleHobby = (hobby) => {
    setFormData(prev => ({
      ...prev,
      hobbies: prev.hobbies.includes(hobby)
        ? prev.hobbies.filter(h => h !== hobby)
        : prev.hobbies.length < 15
        ? [...prev.hobbies, hobby]
        : prev.hobbies,
    }));
  };

  const handlePhotoUpload = async (e, slotIndex) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) { toast.error('Photo must be under 8MB'); return; }
    if (!user) { toast.error('Please wait…'); return; }

    const preview = URL.createObjectURL(file);
    setUploadingSlot(slotIndex);
    try {
      const url = await uploadToSupabase(file, user.id);
      setPhotos(prev => {
        const next = [...prev];
        next[slotIndex] = { file, preview, url };
        return next;
      });
    } catch {
      toast.error('Upload failed. Try again.');
    } finally {
      setUploadingSlot(null);
    }
  };

  const removePhoto = (slotIndex) => {
    setPhotos(prev => {
      const next = [...prev];
      next[slotIndex] = null;
      return next;
    });
  };

  const filledPhotos = photos.filter(Boolean);

  const validateStep = () => {
    if (currentStep === 1) {
      if (!formData.name.trim() || !formData.bio.trim() || !formData.gender || !formData.grade || !formData.school.trim()) {
        toast.error('Please fill in all required fields'); return false;
      }
      if (!isValidWindsorEssexSchool(formData.school)) {
        toast.error('Please select a valid Windsor-Essex County school'); return false;
      }
      if (formData.looking_for.length === 0) {
        toast.error("Please select who you're interested in"); return false;
      }
    }
    if (currentStep === 2) {
      if (filledPhotos.length < 1) {
        toast.error('Please add at least 1 photo'); return false;
      }
    }
    if (currentStep === 3) {
      if (formData.hobbies.length < 2) {
        toast.error('Pick at least 2 vibes!'); return false;
      }
    }
    if (currentStep === 5) {
      if (wordCount(formData.personality) < 10) {
        toast.error('Write at least 10 words about yourself'); return false;
      }
    }
    return true;
  };

  const nextStep = () => {
    if (!validateStep()) return;
    setCurrentStep(prev => Math.min(prev + 1, 5));
  };

  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const handleSubmit = async () => {
    if (!validateStep()) return;
    if (!user) return;
    setLoading(true);
    try {
      const token = getToken();
      const primaryPhoto = filledPhotos[0];
      const profileData = {
        user_id: user.id,
        name: formData.name,
        bio: formData.bio,
        gender: formData.gender,
        looking_for: formData.looking_for,
        grade: formData.grade,
        school: formData.school,
        hobbies: formData.hobbies,
        personality: formData.personality,
        question_answers: formData.question_answers,
        socials: formData.socials,
        profile_pic_url: primaryPhoto?.url || '',
      };

      const headers = token ? getAuthHeaders(token) : {};
      const response = await axios.post(`${API_BASE_URL}/users/profile`, profileData, { headers });

      if (response.data.success || response.data.user_id) {
        // Upload remaining photos
        if (filledPhotos.length > 1) {
          const photoUploads = filledPhotos.slice(1).map((p, i) =>
            axios.post(`${API_BASE_URL}/users/photos`, { url: p.url, order_index: i + 1 }, { headers })
              .catch(() => null)
          );
          await Promise.all(photoUploads);
        }
        toast.success('Profile created! Time to find your match 🎯');
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Error creating profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const slideVariants = {
    enter: (dir) => ({ opacity: 0, x: dir > 0 ? 40 : -40 }),
    center: { opacity: 1, x: 0 },
    exit: (dir) => ({ opacity: 0, x: dir > 0 ? -40 : 40 }),
  };

  const [slideDir, setSlideDir] = useState(1);

  const goNext = () => { setSlideDir(1); nextStep(); };
  const goPrev = () => { setSlideDir(-1); prevStep(); };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-5">
            <div>
              <h2 className="text-2xl font-black text-white mb-1">Let's Get Started ✨</h2>
              <p className="text-white/50 text-sm">Tell us the basics</p>
            </div>

            <div>
              <label className="block text-white/70 text-sm font-medium mb-2">Your Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="input-dark"
                placeholder="First name or nickname"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-white/70 text-sm font-medium mb-2">I am *</label>
                <select
                  value={formData.gender}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                  className="input-dark"
                >
                  <option value="">Select…</option>
                  {GENDER_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-white/70 text-sm font-medium mb-2">Grade *</label>
                <select
                  value={formData.grade}
                  onChange={(e) => handleInputChange('grade', e.target.value)}
                  className="input-dark"
                >
                  <option value="">Select…</option>
                  {GRADE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
            </div>

            <div ref={schoolRef} className="relative">
              <label className="block text-white/70 text-sm font-medium mb-2">School * <span className="text-white/30 font-normal text-xs">(Windsor-Essex only)</span></label>
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
                <input
                  type="text"
                  value={formData.school || schoolSearch}
                  onChange={(e) => {
                    const val = e.target.value;
                    handleInputChange('school', '');
                    setSchoolSearch(val);
                    setShowSchoolDropdown(true);
                  }}
                  onFocus={() => { setSchoolSearch(''); handleInputChange('school', ''); setShowSchoolDropdown(true); }}
                  className="input-dark"
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="Search your school…"
                  autoComplete="off"
                />
                {formData.school && <Check className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-green-400 pointer-events-none" />}
              </div>
              <AnimatePresence>
                {showSchoolDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.15 }}
                    className="absolute z-50 w-full mt-1 rounded-xl overflow-hidden shadow-2xl max-h-52 overflow-y-auto"
                    style={{ background: '#1a0a2e', border: '1px solid rgba(255,255,255,0.15)' }}
                  >
                    {WINDSOR_ESSEX_SCHOOLS.filter(s =>
                      s.name.toLowerCase().includes((formData.school || schoolSearch).toLowerCase()) ||
                      s.city.toLowerCase().includes((formData.school || schoolSearch).toLowerCase())
                    ).map((school) => (
                      <button
                        key={school.name}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => { handleInputChange('school', school.name); setSchoolSearch(school.name); setShowSchoolDropdown(false); }}
                        className="w-full text-left px-4 py-2.5 hover:bg-white/10 transition-colors"
                      >
                        <p className="text-white text-sm font-medium">{school.name}</p>
                        <p className="text-white/40 text-xs">{school.city} · {school.board}</p>
                      </button>
                    ))}
                    {WINDSOR_ESSEX_SCHOOLS.filter(s =>
                      s.name.toLowerCase().includes((formData.school || schoolSearch).toLowerCase()) ||
                      s.city.toLowerCase().includes((formData.school || schoolSearch).toLowerCase())
                    ).length === 0 && (
                      <div className="px-4 py-3 text-center">
                        <p className="text-white/50 text-sm">No Windsor-Essex school found</p>
                        <p className="text-white/30 text-xs mt-0.5">This platform is for Windsor-Essex County students only</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div>
              <label className="block text-white/70 text-sm font-medium mb-2">I'm interested in *</label>
              <div className="flex flex-wrap gap-2">
                {GENDER_OPTIONS.map(opt => {
                  const sel = formData.looking_for.includes(opt.value);
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => toggleLookingFor(opt.value)}
                      className="px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200"
                      style={sel
                        ? { background: 'linear-gradient(135deg, #ff1a91, #7c3aed)', color: 'white' }
                        : { background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.12)' }
                      }
                    >
                      {sel && <Check className="inline w-3 h-3 mr-1" />}{opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-white/70 text-sm font-medium mb-2">Bio *</label>
              <textarea
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                className="input-dark h-24 resize-none"
                placeholder="Tell future matches a bit about yourself…"
                maxLength={300}
              />
              <p className="text-white/30 text-xs text-right mt-1">{formData.bio.length}/300</p>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-5">
            <div>
              <h2 className="text-2xl font-black text-white mb-1">Your Photos 📸</h2>
              <p className="text-white/50 text-sm">Add 1–6 photos. First one is your main photo.</p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {photos.map((photo, i) => (
                <div
                  key={i}
                  className="relative aspect-square rounded-2xl overflow-hidden"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  {photo ? (
                    <>
                      <img src={photo.preview} alt="" className="w-full h-full object-cover" />
                      {i === 0 && (
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-xs font-bold text-white"
                          style={{ background: 'linear-gradient(135deg, #ff1a91, #7c3aed)' }}>
                          Main
                        </div>
                      )}
                      <button
                        onClick={() => removePhoto(i)}
                        className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center"
                        style={{ background: 'rgba(0,0,0,0.6)' }}
                      >
                        <X className="w-3.5 h-3.5 text-white" />
                      </button>
                    </>
                  ) : (
                    <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer group">
                      {uploadingSlot === i ? (
                        <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-pink-500 animate-spin" />
                      ) : (
                        <>
                          <div className="w-8 h-8 rounded-full flex items-center justify-center mb-1 transition-all group-hover:scale-110"
                            style={{ background: i === 0 ? 'linear-gradient(135deg, #ff1a91, #7c3aed)' : 'rgba(255,255,255,0.1)' }}>
                            {i === 0 ? <Camera className="w-4 h-4 text-white" /> : <Plus className="w-4 h-4 text-white/60" />}
                          </div>
                          {i === 0 && <span className="text-xs text-white/50">Required</span>}
                        </>
                      )}
                      <input
                        ref={el => fileRefs.current[i] = el}
                        type="file"
                        accept="image/*"
                        onChange={(e) => handlePhotoUpload(e, i)}
                        className="hidden"
                        disabled={uploadingSlot !== null}
                      />
                    </label>
                  )}
                </div>
              ))}
            </div>

            <p className="text-white/30 text-xs text-center">
              {filledPhotos.length}/6 photos added · Max 8MB per photo
            </p>
          </div>
        );

      case 3:
        return (
          <div className="space-y-5">
            <div>
              <h2 className="text-2xl font-black text-white mb-1">Your Vibe 🎵</h2>
              <p className="text-white/50 text-sm">Pick 2–15 things you love</p>
            </div>

            <div className="flex flex-wrap gap-2">
              {HOBBY_PRESETS.map(hobby => {
                const sel = formData.hobbies.includes(hobby);
                return (
                  <button
                    key={hobby}
                    type="button"
                    onClick={() => toggleHobby(hobby)}
                    className="px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200"
                    style={sel
                      ? { background: 'linear-gradient(135deg, rgba(255,26,145,0.3), rgba(124,58,237,0.3))', color: 'white', border: '1px solid rgba(255,26,145,0.5)' }
                      : { background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.1)' }
                    }
                  >
                    {sel && '✓ '}{hobby}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between px-1">
              <span className="text-white/40 text-xs">{formData.hobbies.length} selected</span>
              {formData.hobbies.length > 0 && (
                <button
                  onClick={() => setFormData(prev => ({ ...prev, hobbies: [] }))}
                  className="text-white/40 text-xs hover:text-white/70 transition-colors"
                >
                  Clear all
                </button>
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-5">
            <div>
              <h2 className="text-2xl font-black text-white mb-1">Your Socials 📱</h2>
              <p className="text-white/50 text-sm">Only shown when you match — totally optional</p>
            </div>

            {[
              { key: 'instagram', label: 'Instagram', placeholder: '@yourhandle', emoji: '📷' },
              { key: 'snapchat', label: 'Snapchat', placeholder: 'yourusername', emoji: '👻' },
              { key: 'tiktok', label: 'TikTok', placeholder: '@yourhandle', emoji: '🎵' },
            ].map(({ key, label, placeholder, emoji }) => (
              <div key={key}>
                <label className="block text-white/70 text-sm font-medium mb-2">{emoji} {label}</label>
                <input
                  type="text"
                  value={formData.socials[key]}
                  onChange={(e) => handleSocialChange(key, e.target.value)}
                  className="input-dark"
                  placeholder={placeholder}
                />
              </div>
            ))}

            <div className="glass rounded-xl p-3 flex items-start gap-2">
              <span className="text-lg">🔒</span>
              <p className="text-white/50 text-xs leading-relaxed">
                Your socials are only revealed when both people swipe right. They stay private until a mutual match!
              </p>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-5">
            <div>
              <h2 className="text-2xl font-black text-white mb-1">Final Touch 💫</h2>
              <p className="text-white/50 text-sm">Help the AI find your best match</p>
            </div>

            <div>
              <label className="block text-white/70 text-sm font-medium mb-2">Describe your personality *</label>
              <textarea
                value={formData.personality}
                onChange={(e) => handleInputChange('personality', e.target.value)}
                className="input-dark h-28 resize-none"
                placeholder="Are you outgoing or chill? Adventurous or homebody? Funny or serious? Describe yourself in your own words…"
              />
              {(() => {
                const wc = wordCount(formData.personality);
                return (
                  <p className={`text-xs mt-1 text-right ${wc < 10 ? 'text-red-400/70' : 'text-green-400/70'}`}>
                    {wc} word{wc !== 1 ? 's' : ''} {wc < 10 ? `(need ${10 - wc} more)` : '✓'}
                  </p>
                );
              })()}
            </div>

            <div className="space-y-4">
              <p className="text-white/70 text-sm font-medium">Quick prompts</p>
              {PERSONALITY_QUESTIONS.map((question) => (
                <div key={question}>
                  <label className="block text-white/60 text-xs mb-1.5">{question}</label>
                  <textarea
                    value={formData.question_answers[question]}
                    onChange={(e) => handleQuestionAnswer(question, e.target.value)}
                    className="input-dark h-16 resize-none text-sm"
                    placeholder="Your answer…"
                  />
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (loadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-white/10 border-t-pink-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-lg mx-auto">

        {/* Header */}
        <div className="text-center mb-6">
          <span className="font-prom text-3xl gradient-text">PromMatch</span>
          {isEditMode && <p className="text-white/40 text-xs mt-1">Editing your profile</p>}
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-1 mb-8">
          {STEPS.map((step, idx) => {
            const done = currentStep > step.num;
            const active = currentStep === step.num;
            return (
              <React.Fragment key={step.num}>
                <div className="flex flex-col items-center">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300"
                    style={done
                      ? { background: 'linear-gradient(135deg, #ff1a91, #7c3aed)', color: 'white' }
                      : active
                      ? { background: 'rgba(255,26,145,0.15)', border: '2px solid #ff1a91', color: '#ff1a91' }
                      : { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.3)' }
                    }
                  >
                    {done ? <Check className="w-4 h-4" /> : step.num}
                  </div>
                  <span className="text-[10px] mt-1 font-medium"
                    style={{ color: active ? '#ff1a91' : done ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.25)' }}>
                    {step.label}
                  </span>
                </div>
                {idx < STEPS.length - 1 && (
                  <div className="flex-1 h-px mb-5 mx-1 transition-all duration-300"
                    style={{ background: done ? 'linear-gradient(90deg, #ff1a91, #7c3aed)' : 'rgba(255,255,255,0.1)' }} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Card */}
        <div className="glass-card rounded-3xl p-6 overflow-hidden">
          <AnimatePresence mode="wait" custom={slideDir}>
            <motion.div
              key={currentStep}
              custom={slideDir}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25 }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex gap-3 mt-8">
            {currentStep > 1 && (
              <button
                onClick={goPrev}
                className="btn-glass py-3 px-5 rounded-xl flex items-center gap-2 text-sm font-semibold"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            )}
            {currentStep < 5 ? (
              <button
                onClick={goNext}
                className="flex-1 btn-prom py-3 rounded-xl flex items-center justify-center gap-2 text-sm"
              >
                Next <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 btn-prom py-3 rounded-xl flex items-center justify-center gap-2 text-sm disabled:opacity-50"
              >
                {loading ? (
                  <><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> {isEditMode ? 'Saving…' : 'Creating…'}</>
                ) : (
                  isEditMode ? <>Save Changes ✓</> : <>Find My Match 💕</>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetup;

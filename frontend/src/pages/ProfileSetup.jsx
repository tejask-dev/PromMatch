import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Camera, Upload, ArrowRight, ArrowLeft, Sparkles, Heart } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import { convertToBase64 } from '../services/imageUpload';

const API_BASE_URL = 'http://localhost:8000';

const GRADE_OPTIONS = [
  { value: 'freshman', label: 'Freshman (9th)' },
  { value: 'sophomore', label: 'Sophomore (10th)' },
  { value: 'junior', label: 'Junior (11th)' },
  { value: 'senior', label: 'Senior (12th)' },
];

const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'non-binary', label: 'Non-Binary' },
  { value: 'other', label: 'Other' },
];

const PERSONALITY_QUESTIONS = [
  "What's your ideal prom night?",
  "What makes you laugh?",
  "Describe your perfect date",
  "What's your favorite way to spend weekends?",
  "What's something you're passionate about?"
];

const ProfileSetup = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [profilePic, setProfilePic] = useState(null);
  const [profilePicUrl, setProfilePicUrl] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    gender: '',
    looking_for: [],
    grade: '',
    hobbies: [],
    socials: {
      instagram: '',
      snapchat: '',
      tiktok: ''
    },
    personality: '',
    question_answers: PERSONALITY_QUESTIONS.reduce((acc, q) => ({ ...acc, [q]: '' }), {})
  });

  const [newHobby, setNewHobby] = useState('');

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSocialChange = (platform, value) => {
    setFormData(prev => ({
      ...prev,
      socials: { ...prev.socials, [platform]: value }
    }));
  };

  const handleQuestionAnswer = (question, answer) => {
    setFormData(prev => ({
      ...prev,
      question_answers: { ...prev.question_answers, [question]: answer }
    }));
  };

  const toggleLookingFor = (gender) => {
    setFormData(prev => ({
      ...prev,
      looking_for: prev.looking_for.includes(gender)
        ? prev.looking_for.filter(g => g !== gender)
        : [...prev.looking_for, gender]
    }));
  };

  const addHobby = () => {
    if (newHobby.trim() && !formData.hobbies.includes(newHobby.trim())) {
      setFormData(prev => ({
        ...prev,
        hobbies: [...prev.hobbies, newHobby.trim()]
      }));
      setNewHobby('');
    }
  };

  const removeHobby = (hobby) => {
    setFormData(prev => ({
      ...prev,
      hobbies: prev.hobbies.filter(h => h !== hobby)
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB');
        return;
      }
      setProfilePic(file);
      const reader = new FileReader();
      reader.onload = (e) => setProfilePicUrl(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Convert profile pic to base64
      let picUrl = '';
      if (profilePic) {
        picUrl = await convertToBase64(profilePic);
      }
      
      // Prepare profile data
      const profileData = {
        user_id: user.id,
        name: formData.name,
        bio: formData.bio,
        gender: formData.gender,
        looking_for: formData.looking_for,
        grade: formData.grade,
        hobbies: formData.hobbies,
        personality: formData.personality,
        question_answers: formData.question_answers,
        socials: formData.socials,
        profile_pic_url: picUrl
      };

      // Send to backend
      const response = await axios.post(`${API_BASE_URL}/users/profile`, profileData);

      if (response.data.success) {
        toast.success('Profile created successfully! 🎉');
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error creating profile:', error);
      toast.error('Error creating profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    // Validation per step
    if (currentStep === 1) {
      if (!formData.name || !formData.bio || !formData.gender || !formData.grade) {
        toast.error('Please fill in all required fields');
        return;
      }
      if (formData.looking_for.length === 0) {
        toast.error('Please select who you\'re interested in');
        return;
      }
    }
    if (currentStep === 2 && formData.hobbies.length < 2) {
      toast.error('Please add at least 2 hobbies');
      return;
    }
    if (currentStep === 4 && formData.personality.length < 50) {
      toast.error('Personality description must be at least 50 characters');
      return;
    }
    setCurrentStep(prev => Math.min(prev + 1, 4));
  };

  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Let's Get Started! ✨</h2>
              <p className="text-gray-600">Tell us about yourself</p>
            </div>
            
            {/* Profile Picture */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center overflow-hidden ring-4 ring-white shadow-lg">
                  {profilePicUrl ? (
                    <img src={profilePicUrl} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <Camera className="w-10 h-10 text-pink-400" />
                  )}
                </div>
                <label className="absolute -bottom-2 -right-2 w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:scale-105 transition-transform">
                  <Upload className="w-5 h-5 text-white" />
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="Your name"
              />
            </div>

            {/* Gender & Grade Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">I am a *</label>
                <select
                  value={formData.gender}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500"
                >
                  <option value="">Select...</option>
                  {GENDER_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Grade *</label>
                <select
                  value={formData.grade}
                  onChange={(e) => handleInputChange('grade', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500"
                >
                  <option value="">Select...</option>
                  {GRADE_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Looking For */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">I'm interested in *</label>
              <div className="flex flex-wrap gap-2">
                {GENDER_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => toggleLookingFor(opt.value)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      formData.looking_for.includes(opt.value)
                        ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bio *</label>
              <textarea
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 h-24 resize-none"
                placeholder="Tell us about yourself..."
                maxLength={500}
              />
              <p className="text-xs text-gray-400 mt-1 text-right">{formData.bio.length}/500</p>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">What Do You Love? 🎯</h2>
              <p className="text-gray-600">Add your hobbies and interests</p>
            </div>

            <div>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newHobby}
                  onChange={(e) => setNewHobby(e.target.value)}
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500"
                  placeholder="e.g., Photography, Basketball..."
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addHobby())}
                />
                <button
                  type="button"
                  onClick={addHobby}
                  className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-medium hover:opacity-90"
                >
                  Add
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 min-h-[100px]">
              {formData.hobbies.map((hobby, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-gradient-to-r from-pink-100 to-purple-100 text-pink-800 px-4 py-2 rounded-full text-sm flex items-center space-x-2"
                >
                  <span>{hobby}</span>
                  <button
                    type="button"
                    onClick={() => removeHobby(hobby)}
                    className="text-pink-600 hover:text-pink-800 font-bold"
                  >
                    ×
                  </button>
                </motion.span>
              ))}
              {formData.hobbies.length === 0 && (
                <p className="text-gray-400 text-sm">Add at least 2 hobbies to help find your match!</p>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Connect Socially 📱</h2>
              <p className="text-gray-600">Share your socials (shown after matching)</p>
            </div>

            <div className="space-y-4">
              {['instagram', 'snapchat', 'tiktok'].map(platform => (
                <div key={platform}>
                  <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                    {platform}
                  </label>
                  <input
                    type="text"
                    value={formData.socials[platform]}
                    onChange={(e) => handleSocialChange(platform, e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500"
                    placeholder={`@${platform}_username`}
                  />
                </div>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Final Touch! 💫</h2>
              <p className="text-gray-600">Help us find your perfect match</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Describe Your Personality *
              </label>
              <textarea
                value={formData.personality}
                onChange={(e) => handleInputChange('personality', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 h-32 resize-none"
                placeholder="Describe yourself in 50-100 words..."
                minLength={50}
              />
              <p className={`text-xs mt-1 text-right ${formData.personality.length < 50 ? 'text-red-500' : 'text-green-500'}`}>
                {formData.personality.length}/50 minimum
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Quick Questions</h3>
              {Object.entries(formData.question_answers).slice(0, 3).map(([question, answer]) => (
                <div key={question}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{question}</label>
                  <textarea
                    value={answer}
                    onChange={(e) => handleQuestionAnswer(question, e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 h-20 resize-none"
                    placeholder="Your answer..."
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

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-lg mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl p-8 border border-white/50"
        >
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Step {currentStep} of 4</span>
              <span className="text-sm text-pink-600 font-medium">
                {Math.round((currentStep / 4) * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <motion.div
                className="bg-gradient-to-r from-pink-500 to-purple-600 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(currentStep / 4) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Step Content */}
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            {renderStep()}
          </motion.div>

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className="flex items-center px-6 py-3 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </button>

            {currentStep < 4 ? (
              <button
                onClick={nextStep}
                className="flex items-center px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-medium hover:opacity-90 transition-all"
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading || formData.personality.length < 50}
                className="flex items-center px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                    </svg>
                    Creating...
                  </>
                ) : (
                  <>
                    <Heart className="w-4 h-4 mr-2" />
                    Find My Match
                  </>
                )}
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfileSetup;
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Shield } from 'lucide-react';

const PRIVACY_POLICY = `Last Updated: March 2026

Welcome to PromMatch ("we," "our," or "us"). This Privacy Policy explains how we collect, use, store, disclose, and protect personal information when you use our prom matchmaking platform (the "Platform").

By creating an account, you acknowledge that you have read and understood this Privacy Policy and consent to the collection, use, and disclosure of your personal information as described below.

1. ABOUT THE PLATFORM
PromMatch is a prom matchmaking platform designed to help eligible Grade 11 and Grade 12 students create profiles and find compatible prom matches. The Platform does not provide on-platform messaging. If two users are matched, the social media account information that each user voluntarily provides may be shown to the matched user so they may choose whether to contact each other outside the Platform.

2. ELIGIBILITY
The Platform is intended only for students in Grade 11 and Grade 12. The Platform is not intended for children under the age of 13, and we do not knowingly collect personal information from anyone under 13. If we become aware that we have collected personal information from a child under 13, we will delete that information as soon as reasonably possible.

3. INFORMATION WE COLLECT
We may collect the following personal information when you use the Platform:
• Your name and email address
• Photos you upload
• Your school, grade, age, and gender
• Your matching preferences
• Your social media usernames or handles that you choose to provide for match-sharing purposes
• Limited technical information (IP address, browser type, device info) generated through normal website operation

4. HOW WE USE YOUR INFORMATION
We use your personal information to:
• Create and manage your account
• Provide the Platform and its matching features
• Display your profile to other eligible users
• Generate and provide matches based on profile information and preferences
• Reveal your voluntarily provided social media handle to another user after a match occurs
• Communicate with you about your account, updates, or support requests
• Maintain the safety, integrity, and proper functioning of the Platform
• Detect, prevent, and respond to fraud, fake accounts, or misuse

5. PROFILE VISIBILITY AND MATCHING
When you create a profile, information you provide may be visible to other eligible users, including your name, photos, grade, school, and profile preferences. If you match with another user, the social media username you voluntarily provided may be shown to that matched user. Once disclosed, we cannot control how that matched user uses, saves, screenshots, copies, or redistributes that information.

6. NO ON-PLATFORM MESSAGING
The Platform does not support direct messaging between users. All communication between matched users occurs outside the Platform through third-party services such as Instagram, Snapchat, or other external services.

7. OFF-PLATFORM CONTACT AND USER RESPONSIBILITY
Any decision to add, message, contact, or meet another user through external services is made solely at your own discretion and risk. We are not responsible for any conversation, conduct, harm, or outcome arising from communications that take place outside the Platform. You are solely responsible for deciding what information to share with another user.

8. HOW WE SHARE INFORMATION
We may disclose personal information:
• To other users, as part of the Platform's profile display and matching features
• To a matched user, including your voluntarily provided social media handle
• To service providers or technical vendors that help us operate the Platform
• Where required by law, court order, or lawful government request
• Where necessary to investigate fraud, security issues, or violations of our Terms

We do not sell personal information. We do not use third-party advertising networks or targeted advertising tools.

9. PHOTOS AND USER CONTENT
You are responsible for the photos and content you upload. By uploading content, you represent that it belongs to you, accurately represents you, and does not violate the privacy or rights of any other person. We reserve the right to remove content that is false, inappropriate, unsafe, or offensive.

10. SECURITY
We use reasonable administrative, technical, and organizational measures designed to protect personal information from unauthorized access. However, no method of internet transmission is completely secure, and we cannot guarantee absolute security.

11. DATA RETENTION
We keep personal information only for as long as reasonably necessary to provide the Platform and comply with legal obligations. When personal information is no longer required, we may delete, anonymize, or securely dispose of it.

12. ACCOUNT DELETION
Users may delete their accounts through the Platform. When you delete your account, we will take reasonable steps to remove your account information, subject to any information we need to retain for legal or security purposes.

13. YOUR RIGHTS
Subject to applicable law, you may have the right to access, correct, or request deletion of your personal information. To make a privacy request, contact us at: tejas.kaushik@outlook.com

14. THIRD-PARTY PLATFORMS
Interactions with other users through Instagram, Snapchat, or any other third-party platform are governed by those platforms' own privacy policies, not this Privacy Policy.

15. SCHOOL NON-AFFILIATION
The Platform is independently operated and is not affiliated with, endorsed by, or officially associated with any school, school board, prom committee, or educational institution.

16. CHANGES TO THIS POLICY
We may update this Privacy Policy from time to time. Your continued use of the Platform after any update means you acknowledge the revised Policy.

17. CONTACT US
If you have questions or concerns, contact us at: tejas.kaushik@outlook.com`;

const PrivacyPolicyModal = ({ isOpen, onAccept, onClose }) => {
  const [hasScrolled, setHasScrolled] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (isOpen) { setHasScrolled(false); setAccepted(false); }
  }, [isOpen]);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    if (nearBottom) setHasScrolled(true);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: 'spring', damping: 24, stiffness: 300 }}
            className="w-full max-w-lg glass-card rounded-3xl overflow-hidden flex flex-col"
            style={{ maxHeight: '85vh' }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 p-5 border-b border-white/10 flex-shrink-0">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #ff1a91, #7c3aed)' }}>
                <Shield className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-white font-bold text-base leading-tight">Privacy Policy</h2>
                <p className="text-white/50 text-xs">Please read before creating your account</p>
              </div>
              <button onClick={onClose} className="text-white/40 hover:text-white/80 transition-colors flex-shrink-0">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scroll body */}
            <div
              ref={scrollRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto p-5 text-white/70 text-sm leading-relaxed space-y-3"
              style={{ scrollbarWidth: 'thin' }}
            >
              {PRIVACY_POLICY.split('\n\n').map((para, i) => (
                <p key={i} className={para.match(/^\d+\./) ? 'text-white font-semibold mt-4' : ''}>
                  {para}
                </p>
              ))}
              <div className="h-4" />
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-white/10 space-y-4 flex-shrink-0">
              {!hasScrolled && (
                <p className="text-white/40 text-xs text-center">
                  Scroll to the bottom to continue ↓
                </p>
              )}

              <label className={`flex items-start gap-3 cursor-pointer transition-opacity ${!hasScrolled ? 'opacity-40 pointer-events-none' : ''}`}>
                <div
                  onClick={() => setAccepted(prev => !prev)}
                  className="w-5 h-5 rounded-md flex-shrink-0 mt-0.5 flex items-center justify-center transition-all duration-200 cursor-pointer border"
                  style={accepted
                    ? { background: 'linear-gradient(135deg, #ff1a91, #7c3aed)', borderColor: 'transparent' }
                    : { background: 'transparent', borderColor: 'rgba(255,255,255,0.3)' }
                  }
                >
                  {accepted && <Check className="w-3 h-3 text-white" />}
                </div>
                <span className="text-white/70 text-sm leading-snug select-none" onClick={() => hasScrolled && setAccepted(prev => !prev)}>
                  I have read and agree to the Privacy Policy. I confirm I am in Grade 11 or 12.
                </span>
              </label>

              <button
                onClick={() => accepted && onAccept()}
                disabled={!accepted}
                className="w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: 'linear-gradient(135deg, #ff1a91, #7c3aed)', color: 'white' }}
              >
                I Agree — Create My Account 💕
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PrivacyPolicyModal;

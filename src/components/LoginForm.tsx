import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { Language, translations } from '../translations';
import { cn } from '../lib/utils';
import { 
  ShieldCheck, 
  ShieldAlert, 
  UserCog,
  UserCheck,
  Edit3,
  LogIn,
  Chrome
} from 'lucide-react';
import { motion } from 'motion/react';
import { auth, db } from '../lib/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { setDoc, doc, getDoc, collection } from 'firebase/firestore';

interface LoginFormProps {
  onLogin: (user: User) => void;
  language: Language;
}

export default function LoginForm({ onLogin, language }: LoginFormProps) {
  const t = translations[language];
  const [role, setRole] = useState<UserRole>('User');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const roles: { id: UserRole; label: string; icon: any; color: string }[] = [
    { id: 'Super Admin', label: t.superAdmin, icon: ShieldCheck, color: 'bg-rose-500' },
    { id: 'Admin', label: t.admin, icon: UserCog, color: 'bg-blue-600' },
    { id: 'Edit', label: t.editor, icon: Edit3, color: 'bg-amber-500' },
    { id: 'User', label: t.user, icon: UserCheck, color: 'bg-emerald-500' },
  ];

  const handleGoogleLogin = async () => {
    setError('');
    setIsLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const firebaseUser = userCredential.user;

      const userProfile: Omit<User, 'id'> = {
        username: firebaseUser.email?.split('@')[0] || 'user',
        role: role,
        displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
        photoUrl: firebaseUser.photoURL || `https://ui-avatars.com/api/?name=${firebaseUser.displayName}&background=random`
      };

      // Check if user document already exists
      if (!db) throw new Error('Firestore database is not initialized');
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      let userDoc;
      try {
        userDoc = await getDoc(userDocRef);
      } catch (err: any) {
        if (err.message?.includes('offline')) {
          throw new Error('Firestore is offline. Please check your Firebase configuration or try again later.');
        }
        throw err;
      }

      if (!userDoc.exists()) {
        await setDoc(userDocRef, userProfile);
      }

      onLogin({ id: firebaseUser.uid, ...userProfile });
    } catch (err: any) {
      console.error('Login Error:', err);
      if (err.code === 'auth/admin-restricted-operation') {
        setError('Google Sign-in is restricted. Please contact the administrator.');
      } else {
        setError(err.message || t.invalidLogin);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent p-4 font-sans">
      <div className="w-full max-w-5xl flex flex-col md:flex-row bg-white/50 backdrop-blur-lg dark:bg-[#001a4d]/70 rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
        
        {/* Left Side: Branding/Visual */}
        <div className="md:w-1/2 bg-[#001a4d] p-8 md:p-12 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#ff6600]/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20">
                <span className="text-2xl font-black text-white tracking-tighter">D</span>
              </div>
              <h1 className="text-2xl font-black tracking-[0.2em] text-white">DNPPPM</h1>
            </div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className={cn(
                "text-4xl md:text-5xl font-black text-white mb-6 leading-tight",
                language === 'kh' ? "font-khmer" : "font-sans"
              )}>
                {t.welcomeBack}
              </h2>
              <p className={cn(
                "text-white/60 text-lg max-w-md",
                language === 'kh' ? "font-khmer" : "font-sans"
              )}>
                {t.loginSubtitle}
              </p>
            </motion.div>
          </div>

          <div className="relative z-10 mt-12 md:mt-0">
            <div className="flex items-center gap-4 p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
              <div className="w-10 h-10 rounded-full bg-[#ff6600] flex items-center justify-center shadow-lg shadow-[#ff6600]/20">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-white font-bold text-sm">Secure Access</p>
                <p className="text-white/40 text-xs">End-to-end encrypted session</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="md:w-1/2 p-8 md:p-12 bg-transparent flex flex-col justify-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <label className={cn(
                "block text-sm font-bold text-slate-700",
                language === 'kh' ? "font-khmer" : "font-sans"
              )}>
                {t.selectRole}
              </label>
              <div className="grid grid-cols-2 gap-3">
                {roles.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRole(r.id)}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-2xl border-2 transition-all text-left",
                      role === r.id 
                        ? "border-[#001a4d] bg-[#001a4d]/5 shadow-sm" 
                        : "border-slate-100 hover:border-slate-200 bg-slate-50/50"
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-sm",
                      r.color
                    )}>
                      <r.icon className="w-4 h-4" />
                    </div>
                    <span className={cn(
                      "text-xs font-bold",
                      role === r.id ? "text-[#001a4d]" : "text-slate-600",
                      language === 'kh' ? "font-khmer" : "font-sans"
                    )}>
                      {r.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 p-4 bg-rose-50 text-rose-600 rounded-2xl text-sm font-bold border border-rose-100"
              >
                <ShieldAlert className="w-5 h-5" />
                {error}
              </motion.div>
            )}

            <div className="space-y-4">
              <button
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className={cn(
                  "w-full py-4 bg-white border-2 border-slate-200 text-slate-700 rounded-2xl font-bold text-lg shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center gap-3 group relative overflow-hidden",
                  isLoading && "opacity-70 cursor-not-allowed"
                )}
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-4 border-slate-200 border-t-[#001a4d] rounded-full animate-spin" />
                ) : (
                  <>
                    <Chrome className="w-6 h-6 text-[#4285F4]" />
                    <span className={language === 'kh' ? "font-khmer" : "font-sans"}>Sign in with Google</span>
                  </>
                )}
              </button>
              
              <p className="text-center text-slate-400 text-xs font-medium">
                Use your official department Google account
              </p>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-slate-100 text-center">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
              National Police Personnel Department
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

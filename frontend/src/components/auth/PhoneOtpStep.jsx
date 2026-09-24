import React, { useState } from 'react';
import { useCanteen } from '../../context/CanteenContext';
import { SCHOOLS_LIST, CLASSES_LIST, SECTIONS_LIST } from '../../data/schools';
import { ArrowRight, ShieldCheck, School, ArrowLeft, RefreshCw, UserPlus } from 'lucide-react';

export const PhoneOtpStep = () => {
  const {
    authStep,
    setAuthStep,
    tempPhone,
    sendOtp,
    verifyOtp,
    registerUser
  } = useCanteen();

  // Mode and Base State
  const [isLoginMode, setIsLoginMode] = useState(true);
  
  const [phoneNumber, setPhoneNumber] = useState(tempPhone || '');
  
  const [otpCode, setOtpCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sign Up Form State
  const [name, setName] = useState('');
  const [schoolsList, setSchoolsList] = useState([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState('');
  const [selectedClass, setSelectedClass] = useState('Class 10');
  const [selectedSection, setSelectedSection] = useState('A');
  const [rollNo, setRollNo] = useState('');

  React.useEffect(() => {
    if (!isLoginMode) {
      fetch('http://localhost:5000/api/v1/schools')
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data.length > 0) {
            setSchoolsList(data.data);
            setSelectedSchoolId(data.data[0].id);
          }
        })
        .catch(err => console.error('Error fetching schools:', err));
    }
  }, [isLoginMode]);

  const selectedSchool = schoolsList.find((s) => s.id.toString() === selectedSchoolId.toString()) || { name: 'Loading...' };

  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    
    if (phoneNumber.length < 10) return;
    if (isSubmitting) return;
    
    setIsSubmitting(true);

    // If in Sign Up mode, register the user on the backend first
    if (!isLoginMode) {
      if (!name.trim() || !rollNo.trim()) {
        setIsSubmitting(false);
        return;
      }
      
      const payload = {
        name: name.trim(),
        school_id: selectedSchool.id,
        class: selectedClass,
        roll: rollNo.trim(),
        section: selectedSection,
        phone: phoneNumber
      };

      const regResult = await registerUser(payload);
      if (!regResult.success) {
        setIsSubmitting(false);
        return; // Halt if registration fails (e.g. phone already exists)
      }
    }

    // Send an OTP to verify
    const res = await sendOtp(phoneNumber);
    
    if (isLoginMode && res && !res.ok && res.error && res.error.includes('No student registered')) {
      setIsLoginMode(false);
      showToast('Sign Up Required', 'Please create an account first.', 'error');
    }

    setIsSubmitting(false);
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    if (otpCode.length === 6 && !isSubmitting) {
      setIsSubmitting(true);
      await verifyOtp(otpCode);
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    if (tempPhone && !isSubmitting) {
      setOtpCode('');
      setIsSubmitting(true);
      await sendOtp(tempPhone);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative flex-1 flex flex-col justify-center px-6 py-8 bg-gradient-to-b from-leaf-50 via-white to-gold-50/50 text-gray-900 overflow-y-auto">

      {/* Brand Header */}
      <div className="text-center mb-6 shrink-0 mt-4">
        <div className="w-14 h-14 rounded-2xl bg-leaf-600 text-white mx-auto flex items-center justify-center shadow-md mb-3">
          <School className="w-7 h-7" />
        </div>
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">NutriCanteen</h1>
        <p className="text-xs text-gray-500 mt-0.5">School Canteen Pre-Order & Digital Wallet</p>
      </div>

      {authStep === 'phone' ? (

        /* 📱 Step 1: Login OR Registration Form 📱 */
        <div className="bg-white p-5 rounded-3xl border border-leaf-100 shadow-sm max-w-sm mx-auto w-full mb-8">
          <h2 className="text-base font-bold text-gray-900 mb-1">
            {isLoginMode ? 'Student / Parent Sign In' : 'Create New Account'}
          </h2>
          <p className="text-xs text-gray-500 mb-4">
            {isLoginMode 
              ? "Enter your mobile number to sign in — we'll send a verification code."
              : "Fill your details below to register — we'll verify your mobile number."}
          </p>

          <form onSubmit={handlePhoneSubmit} className="space-y-4">
            
            {/* Phone Number Field (Always visible) */}
            <div>
              <label className="block text-[11px] font-bold text-gray-600 mb-1.5 uppercase tracking-wider">
                Mobile Number
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-leaf-700 font-bold text-sm">+91</span>
                <input
                  type="tel"
                  maxLength={10}
                  required
                  autoFocus={isLoginMode}
                  placeholder="Mobile Number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-leaf-50/50 border border-leaf-200 rounded-xl pl-12 pr-4 py-2.5 text-sm font-bold text-gray-900 placeholder-gray-400 focus:outline-none focus:border-leaf-500 focus:ring-1 focus:ring-leaf-500"
                />
              </div>
            </div>

            {/* Registration Fields (Only visible in Sign Up mode) */}
            {!isLoginMode && (
              <div className="space-y-4 pt-1 border-t border-leaf-100">
                {/* Full Name */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 mb-1.5 uppercase tracking-wider">
                    Student Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-leaf-50/50 border border-leaf-200 rounded-xl px-4 py-2.5 text-gray-900 font-semibold text-xs focus:outline-none focus:border-leaf-500 focus:ring-1 focus:ring-leaf-500"
                  />
                </div>

                {/* School Selection */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 mb-1.5 uppercase tracking-wider">
                    Select School
                  </label>
                  <div className="relative">
                    <select
                      value={selectedSchoolId}
                      onChange={(e) => setSelectedSchoolId(e.target.value)}
                      className="w-full bg-leaf-50/50 border border-leaf-200 rounded-xl px-4 py-2.5 pr-10 text-gray-900 font-semibold text-xs focus:outline-none focus:border-leaf-500 appearance-none cursor-pointer"
                      disabled={schoolsList.length === 0}
                    >
                      {schoolsList.length > 0 ? (
                        schoolsList.map((sch) => (
                          <option key={sch.id} value={sch.id}>{sch.name}</option>
                        ))
                      ) : (
                        <option value="">Loading schools...</option>
                      )}
                    </select>
                    <School className="w-4 h-4 text-leaf-600 absolute right-3.5 top-3 pointer-events-none" />
                  </div>
                </div>

                {/* Class & Roll Row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1.5 uppercase tracking-wider">
                      Class
                    </label>
                    <select
                      value={selectedClass}
                      onChange={(e) => setSelectedClass(e.target.value)}
                      className="w-full bg-leaf-50/50 border border-leaf-200 rounded-xl px-3 py-2.5 text-gray-900 font-semibold text-xs focus:outline-none focus:border-leaf-500"
                    >
                      {CLASSES_LIST.map((cls) => (
                        <option key={cls} value={cls}>{cls}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1.5 uppercase tracking-wider">
                      Roll Number
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={999}
                      value={rollNo}
                      onChange={(e) => setRollNo(e.target.value)}
                      className="w-full bg-leaf-50/50 border border-leaf-200 rounded-xl px-3 py-2.5 text-gray-900 font-bold text-xs focus:outline-none focus:border-leaf-500 text-center"
                    />
                  </div>
                </div>

                {/* Section Pills */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 mb-1.5 uppercase tracking-wider">
                    Section
                  </label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {SECTIONS_LIST.map((sec) => (
                      <button
                        key={sec}
                        type="button"
                        onClick={() => setSelectedSection(sec)}
                        className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          selectedSection === sec
                            ? 'bg-leaf-600 text-white shadow-xs'
                            : 'bg-leaf-50 text-leaf-800 hover:bg-leaf-100 border border-leaf-200'
                        }`}
                      >
                        {sec}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={phoneNumber.length < 10 || isSubmitting || (!isLoginMode && (!name.trim() || !rollNo.trim()))}
              className="w-full bg-leaf-600 hover:bg-leaf-700 text-white font-bold py-3 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wide cursor-pointer disabled:opacity-50 mt-2"
            >
              {isLoginMode ? (
                <><span>{isSubmitting ? 'Sending OTP...' : 'Send OTP'}</span><ArrowRight className="w-4 h-4" /></>
              ) : (
                <><span>{isSubmitting ? 'Processing...' : 'Register & Verify'}</span><UserPlus className="w-4 h-4" /></>
              )}
            </button>
            
            <div className="pt-3 text-center pb-1">
              <button
                type="button"
                onClick={() => { setIsLoginMode(!isLoginMode); }}
                className="text-[11px] text-gray-600 hover:text-leaf-700 font-semibold cursor-pointer"
              >
                {isLoginMode 
                  ? <span>Don't have an account? <span className="text-leaf-700 underline">Sign Up</span></span> 
                  : <span>Already have an account? <span className="text-leaf-700 underline">Sign In</span></span>}
              </button>
            </div>
          </form>
        </div>

      ) : (

        /* ── Step 2: OTP Verification ── */
        <div className="bg-white p-5 rounded-3xl border border-leaf-100 shadow-sm max-w-sm mx-auto w-full mb-8">
          {/* Header row */}
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-base font-bold text-gray-900">Verify OTP</h2>
            <button
              type="button"
              onClick={() => { setAuthStep('phone'); setOtpCode(''); }}
              className="text-[11px] text-leaf-700 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>Change</span>
            </button>
          </div>

          <p className="text-xs text-gray-500 mb-4">
            6-digit code sent to{' '}
            <strong className="text-gray-900">+91 {tempPhone}</strong>
          </p>

          {/* OTP boxes */}
          <form onSubmit={handleOtpSubmit} className="space-y-4">
            <OtpInput value={otpCode} onChange={setOtpCode} />

            <button
              type="submit"
              disabled={otpCode.length < 6 || isSubmitting}
              className="w-full bg-leaf-600 hover:bg-leaf-700 text-white font-bold py-2.5 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider disabled:opacity-50 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isSubmitting ? 'Verifying...' : 'Verify & Continue'}</span>
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={isSubmitting}
                className="text-[11px] text-gray-500 hover:text-leaf-700 font-semibold inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${isSubmitting ? 'animate-spin' : ''}`} />
                <span>Didn't receive code? Resend OTP</span>
              </button>
            </div>
          </form>
        </div>

      )}

      {/* Footer */}
      <div className="absolute bottom-4 left-0 right-0 text-center text-[11px] text-gray-400 flex items-center justify-center gap-1.5 pointer-events-none">
        <ShieldCheck className="w-3.5 h-3.5 text-leaf-600" />
        <span>Verified School Canteen Network • 100% Safe</span>
      </div>
    </div>
  );
};

/* ── 6-box OTP Input ── */
const OtpInput = ({ value, onChange }) => {
  const boxes = Array(6).fill('');

  const handleKey = (e, idx) => {
    const key = e.key;

    if (key === 'Backspace') {
      const next = value.slice(0, idx === value.length ? idx - 1 : idx);
      onChange(next);
      const prev = document.getElementById(`otp-${idx - 1}`);
      if (prev) prev.focus();
      return;
    }

    if (!/^\d$/.test(key)) return;

    const next = (value.slice(0, idx) + key + value.slice(idx + 1)).slice(0, 6);
    onChange(next);

    const nextBox = document.getElementById(`otp-${idx + 1}`);
    if (nextBox) nextBox.focus();
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted) {
      onChange(pasted);
      const lastBox = document.getElementById(`otp-${Math.min(pasted.length, 5)}`);
      if (lastBox) lastBox.focus();
    }
    e.preventDefault();
  };

  return (
    <div className="flex gap-2 justify-center">
      {boxes.map((_, idx) => (
        <input
          key={idx}
          id={`otp-${idx}`}
          type="text"
          inputMode="numeric"
          maxLength={1}
          autoFocus={idx === 0}
          value={value[idx] || ''}
          onKeyDown={(e) => handleKey(e, idx)}
          onPaste={handlePaste}
          onChange={() => {}}
          className="w-11 h-12 text-center text-lg font-bold border-2 rounded-xl bg-leaf-50/50 text-gray-900 focus:outline-none focus:border-leaf-500 focus:bg-white transition-all"
          style={{ borderColor: value[idx] ? '#3d7a48' : undefined }}
        />
      ))}
    </div>
  );
};

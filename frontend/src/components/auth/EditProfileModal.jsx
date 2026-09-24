import React, { useState, useEffect } from 'react';
import { useCanteen } from '../../context/CanteenContext';
import { X, Save } from 'lucide-react';
import { apiCompleteProfile } from '../../services/api';

export const EditProfileModal = ({ isOpen, onClose }) => {
  const { student, showToast, syncBackendData } = useCanteen();
  
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (student && isOpen) {
      setName(student.name || '');
    }
  }, [student, isOpen]);

  if (!isOpen || !student) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await apiCompleteProfile({
        name: name.trim(),
        class_name: student.className,
        section: student.section,
        roll_no: student.rollNo
      });

      if (res.ok) {
        showToast('Success', 'Profile updated successfully!', 'success');
        await syncBackendData();
        onClose();
      } else {
        showToast('Error', res.error || 'Failed to update profile', 'error');
      }
    } catch (err) {
      showToast('Error', 'An unexpected error occurred', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white dark:bg-[#101812] w-full max-w-sm rounded-3xl shadow-xl overflow-hidden border border-leaf-100 dark:border-leaf-800">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-leaf-100 dark:border-leaf-800/80 bg-leaf-50/50 dark:bg-leaf-950/30">
          <h2 className="text-base font-bold text-gray-900 dark:text-white">Edit Profile</h2>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white dark:bg-leaf-900 border border-gray-200 dark:border-leaf-800 text-gray-500 dark:text-leaf-300 flex items-center justify-center hover:bg-gray-50 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          
          <div className="flex flex-col items-center gap-3">
            <div className="w-20 h-20 rounded-full bg-gold-200 text-gold-950 flex items-center justify-center font-bold text-2xl shadow-sm">
              {name ? name.charAt(0).toUpperCase() : 'S'}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
              Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-leaf-50/50 dark:bg-leaf-900/30 border border-leaf-200 dark:border-leaf-700 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white font-semibold text-sm focus:outline-none focus:border-leaf-500 focus:ring-1 focus:ring-leaf-500"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !name.trim()}
            className="w-full mt-2 bg-leaf-600 hover:bg-leaf-700 text-white font-bold py-3 rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all text-xs uppercase tracking-wide cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSubmitting ? 'Saving...' : 'Save Profile'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

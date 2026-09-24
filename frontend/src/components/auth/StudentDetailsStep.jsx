import React, { useState, useEffect } from 'react';
import { useCanteen } from '../../context/CanteenContext';
import { SCHOOLS_LIST, CLASSES_LIST, SECTIONS_LIST } from '../../data/schools';
import { School, Sparkles, ArrowRight, ArrowLeft } from 'lucide-react';

export const StudentDetailsStep = () => {
  const { completeStudentProfile, setAuthStep } = useCanteen();

  const [name, setName] = useState('');
  const [schoolsList, setSchoolsList] = useState([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState('');
  const [selectedClass, setSelectedClass] = useState('Class 10');
  const [selectedSection, setSelectedSection] = useState('A');
  const [rollNo, setRollNo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetch('http://localhost:5000/api/v1/schools')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data.length > 0) {
          setSchoolsList(data.data);
          setSelectedSchoolId(data.data[0].id);
        }
      })
      .catch(err => console.error('Error fetching schools:', err));
  }, []);

  const selectedSchool = schoolsList.find((s) => s.id.toString() === selectedSchoolId.toString()) || { name: 'Loading...' };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (name.trim() && rollNo.trim() && !isSubmitting && selectedSchool.id) {
      setIsSubmitting(true);
      await completeStudentProfile({
        name: name.trim(),
        school_id: selectedSchool.id,
        className: selectedClass,
        section: selectedSection,
        rollNo: rollNo.trim()
      });
      setIsSubmitting(false);
    }
  };

  const previewId = `STU-${selectedClass.replace('Class ', '')}${selectedSection}-${rollNo || '00'}`;

  return (
    <div className="flex-1 flex flex-col justify-center px-4 py-6 bg-gradient-to-b from-leaf-50 via-white to-gold-50/40 text-gray-900 overflow-y-auto">
      <div className="max-w-md mx-auto w-full space-y-4">

        {/* Header */}
        <div className="relative text-center">
          {/* Back Button */}
          <button
            type="button"
            onClick={() => setAuthStep('phone')}
            className="absolute left-0 top-0.5 flex items-center gap-1 text-xs text-leaf-700 font-semibold hover:text-leaf-900 transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <h2 className="text-lg font-bold text-gray-900">Link Your School & Class</h2>
          <p className="text-xs text-gray-500 mt-1 px-8">
            Your unique ID is used for meal pickups and wallet counter deductions.
          </p>
        </div>

        {/* Live Preview Card */}
        <div className="p-4 rounded-2xl bg-leaf-700 text-white border border-leaf-600 shadow-sm relative overflow-hidden">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="min-w-0">
                <h3 className="font-bold text-sm text-white truncate">{name || 'Student Name'}</h3>
                <p className="text-[11px] text-leaf-100 truncate">{selectedSchool.name}</p>
                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                  <span className="bg-gold-200 text-gold-950 text-[10px] font-bold px-2 py-0.5 rounded">
                    {selectedClass} • Sec {selectedSection}
                  </span>
                  <span className="bg-leaf-800 text-leaf-100 text-[10px] font-medium px-2 py-0.5 rounded">
                    Roll #{rollNo || '--'}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="text-[9px] text-gold-200 font-bold tracking-wider block uppercase">Unique ID</span>
              <span className="text-xs font-mono font-bold text-white bg-leaf-900/60 px-2 py-0.5 rounded border border-leaf-600">
                {previewId}
              </span>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white p-5 rounded-3xl border border-leaf-100 shadow-sm space-y-4">
          
          {/* Student Name */}
          <div>
            <label className="block text-[11px] font-bold text-gray-600 mb-1.5 uppercase tracking-wider">
              Student Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-leaf-50/50 border border-leaf-200 rounded-xl px-4 py-2.5 text-gray-900 placeholder-gray-400 font-semibold text-xs focus:outline-none focus:border-leaf-500 focus:ring-1 focus:ring-leaf-500"
            />
          </div>

          {/* School Selection */}
          <div>
            <label className="block text-[11px] font-bold text-gray-600 mb-1.5 uppercase tracking-wider flex items-center justify-between">
              <span>Select School</span>
              <span className="text-[10px] text-gold-700 lowercase font-normal normal-case">verified canteens</span>
            </label>
            <div className="relative">
              <select
                value={selectedSchoolId}
                onChange={(e) => setSelectedSchoolId(e.target.value)}
                className="w-full bg-leaf-50/50 border border-leaf-200 rounded-xl px-4 py-2.5 pr-10 text-gray-900 font-semibold text-xs focus:outline-none focus:border-leaf-500 focus:ring-1 focus:ring-leaf-500 appearance-none cursor-pointer"
                disabled={schoolsList.length === 0}
              >
                {schoolsList.length > 0 ? (
                  schoolsList.map((sch) => (
                    <option key={sch.id} value={sch.id}>
                      {sch.name}
                    </option>
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
            {/* Class Dropdown */}
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

            {/* Roll Number */}
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

          {/* Submit */}
          <button
            type="submit"
            disabled={!name.trim() || !rollNo.trim() || isSubmitting}
            className="w-full bg-leaf-600 hover:bg-leaf-700 text-white font-bold py-3 rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all text-xs uppercase tracking-wide cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5 text-gold-300" />
            <span>{isSubmitting ? 'Setting up Profile...' : 'Complete Setup & Enter Canteen'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

      </div>
    </div>
  );
};

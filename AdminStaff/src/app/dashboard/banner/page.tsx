'use strict';
'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Image as ImageIcon,
  UploadCloud,
  CheckCircle,
  AlertCircle,
  RotateCcw,
  Smartphone,
  Trash2,
  Plus,
  Layers,
  ChevronLeft,
  ChevronRight,
  Info
} from 'lucide-react';

interface BannerSlide {
  id: string;
  imageUrl: string;
  title: string;
  subtitle: string;
}

const DEFAULT_BANNERS: BannerSlide[] = [
  {
    id: 'default-1',
    imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=1200',
    title: 'Fresh & Nutritious Meals',
    subtitle: 'Hygienic and wholesome food prepared fresh daily!',
  },
  {
    id: 'default-2',
    imageUrl: 'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?auto=format&fit=crop&q=80&w=1200',
    title: 'Healthy Campus Bites',
    subtitle: 'Balanced nutrition for energy all school day!',
  },
  {
    id: 'default-3',
    imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&q=80&w=1200',
    title: 'Hot & Oven-Fresh Snacks',
    subtitle: 'Pre-order now and skip the long recess queue!',
  },
];

export default function BannerManagementPage() {
  const [banners, setBanners] = useState<BannerSlide[]>(DEFAULT_BANNERS);
  const [isCustom, setIsCustom] = useState(false);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Preview Slider State
  const [currentSlide, setCurrentSlide] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchBanners = async () => {
    try {
      setFetching(true);
      const res = await fetch('/api/banner?t=' + Date.now(), { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        const slides = Array.isArray(data.banners) && data.banners.length > 0 ? data.banners : DEFAULT_BANNERS;
        setBanners(slides);
        setIsCustom(Boolean(data.isCustom));
        setCurrentSlide(0);
      }
    } catch (e) {
      console.error('Failed to load banners:', e);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  // Auto-advance preview slide
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [banners.length]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleAddSlide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setMessage({ type: 'error', text: 'Please select an image file to upload as a new banner slide.' });
      return;
    }

    try {
      setLoading(true);
      setMessage(null);

      const formData = new FormData();
      formData.append('title', title.trim() || 'Fresh & Nutritious Meals');
      formData.append('subtitle', subtitle.trim() || 'Hygienic and wholesome food prepared fresh daily!');
      formData.append('image', selectedFile);

      const res = await fetch('/api/banner', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        setSelectedFile(null);
        setPreviewUrl(null);
        setTitle('');
        setSubtitle('');
        if (fileInputRef.current) fileInputRef.current.value = '';
        setMessage({ type: 'success', text: 'New banner slide uploaded and added to the carousel!' });
        await fetchBanners();
      } else {
        const err = await res.json();
        setMessage({ type: 'error', text: err.error || 'Failed to add banner slide' });
      }
    } catch (e: any) {
      setMessage({ type: 'error', text: e.message || 'An error occurred' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSlide = async (id: string) => {
    if (!confirm('Are you sure you want to remove this banner slide?')) return;

    try {
      setLoading(true);
      setMessage(null);

      const formData = new FormData();
      formData.append('deleteId', id);

      const res = await fetch('/api/banner', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        setMessage({ type: 'success', text: 'Banner slide removed successfully.' });
        await fetchBanners();
      } else {
        setMessage({ type: 'error', text: 'Failed to delete banner slide.' });
      }
    } catch (e: any) {
      setMessage({ type: 'error', text: e.message || 'An error occurred' });
    } finally {
      setLoading(false);
    }
  };

  const handleResetToDefault = async () => {
    if (!confirm('Are you sure you want to remove all custom banner slides and restore the default banners?')) {
      return;
    }

    try {
      setLoading(true);
      setMessage(null);

      const formData = new FormData();
      formData.append('reset', 'true');

      const res = await fetch('/api/banner', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        setSelectedFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        setMessage({ type: 'success', text: 'Restored default multi-image banners successfully!' });
        await fetchBanners();
      } else {
        setMessage({ type: 'error', text: 'Failed to reset banners.' });
      }
    } catch (e: any) {
      setMessage({ type: 'error', text: e.message || 'An error occurred' });
    } finally {
      setLoading(false);
    }
  };

  const activeSlide = banners[currentSlide] || banners[0] || DEFAULT_BANNERS[0];
  const displayPreviewImage = previewUrl || activeSlide.imageUrl;

  return (
    <div className="space-y-6 max-w-6xl pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-brown/10 pb-5">
        <div>
          <h1 className="text-2xl font-black text-brand-brown-dark tracking-tight flex items-center gap-2.5">
            <ImageIcon className="w-7 h-7 text-brand-gold" />
            App Banner Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Upload multiple banner slides with auto-sliding indicator dots shown on the student mobile app.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isCustom ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              {banners.length} Custom Slide{banners.length > 1 ? 's' : ''} Active
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              Default Slides Active ({DEFAULT_BANNERS.length} images)
            </span>
          )}
        </div>
      </div>

      {/* Toast Alert Message */}
      {message && (
        <div
          className={`p-4 rounded-xl border flex items-center gap-3 animate-fade-in ${
            message.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <p className="text-sm font-semibold">{message.text}</p>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Upload New Slide + Active Slides List */}
        <div className="lg:col-span-7 space-y-6">
          {/* Upload New Slide Form */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-brand-brown/10 space-y-5">
            <h2 className="text-base font-extrabold text-brand-brown-dark flex items-center gap-2">
              <Plus className="w-5 h-5 text-brand-gold" />
              Add New Banner Slide
            </h2>

            <form onSubmit={handleAddSlide} className="space-y-4">
              {/* Drag & Drop File Zone */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                  Slide Image <span className="text-red-500">*</span>
                </label>
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all ${
                    selectedFile
                      ? 'border-brand-gold bg-amber-50/40'
                      : 'border-gray-300 hover:border-brand-gold hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/png, image/jpeg, image/webp"
                    className="hidden"
                  />

                  <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="w-10 h-10 rounded-full bg-brand-gold/15 text-brand-gold flex items-center justify-center">
                      <UploadCloud className="w-5 h-5" />
                    </div>
                    {selectedFile ? (
                      <div>
                        <p className="text-sm font-bold text-brand-brown-dark">{selectedFile.name}</p>
                        <p className="text-xs text-gray-500">{(selectedFile.size / 1024).toFixed(1)} KB • Click or drag to replace</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm font-semibold text-gray-700">Click to upload or drag & drop</p>
                        <p className="text-xs text-gray-400 mt-0.5">PNG, JPG, or WebP (Recommended 1200x500px)</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Title & Subtitle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">
                    Slide Headline (Optional)
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Fresh & Healthy Meals"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm font-medium focus:ring-2 focus:ring-brand-gold/40 focus:border-brand-gold outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">
                    Subtitle (Optional)
                  </label>
                  <input
                    type="text"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    placeholder="e.g. Prepared fresh daily"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm font-medium focus:ring-2 focus:ring-brand-gold/40 focus:border-brand-gold outline-none"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !selectedFile}
                className="w-full py-2.5 px-4 bg-brand-gold hover:bg-brand-gold-dark text-brand-brown-dark font-extrabold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-40"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-brand-brown-dark border-t-transparent rounded-full animate-spin"></span>
                    <span>Uploading Slide...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Upload & Add Slide</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Current Slides Management List */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-brand-brown/10 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h2 className="text-base font-extrabold text-brand-brown-dark flex items-center gap-2">
                <Layers className="w-5 h-5 text-brand-gold" />
                Current Banner Slides ({banners.length})
              </h2>
              {isCustom && (
                <button
                  type="button"
                  onClick={handleResetToDefault}
                  disabled={loading}
                  className="text-xs font-bold text-gray-500 hover:text-rose-600 flex items-center gap-1 transition"
                  title="Remove all custom slides and restore default banners"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restore Defaults</span>
                </button>
              )}
            </div>

            <div className="space-y-3">
              {banners.map((slide, idx) => (
                <div
                  key={slide.id || idx}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                    currentSlide === idx
                      ? 'border-brand-gold bg-amber-50/30'
                      : 'border-gray-200 bg-gray-50/50'
                  }`}
                >
                  <div className="w-16 h-12 rounded-lg overflow-hidden bg-gray-200 shrink-0">
                    <img src={slide.imageUrl} alt={slide.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-gray-200 text-gray-700">
                        Slide {idx + 1}
                      </span>
                      <h4 className="text-xs font-bold text-gray-900 truncate">{slide.title}</h4>
                    </div>
                    <p className="text-[11px] text-gray-500 truncate mt-0.5">{slide.subtitle}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setCurrentSlide(idx)}
                      className="px-2.5 py-1 text-xs font-semibold text-gray-600 hover:text-brand-brown-dark hover:bg-white rounded-lg transition"
                    >
                      Preview
                    </button>
                    {isCustom && (
                      <button
                        onClick={() => handleDeleteSlide(slide.id)}
                        disabled={loading}
                        className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg transition"
                        title="Delete slide"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Live Mobile App Carousel Preview with Slide Dots */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-brand-brown-dark flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-brand-gold" />
              Live Mobile Slider Preview
            </h2>
            <span className="text-[11px] font-semibold text-gray-400">
              Slide {currentSlide + 1} of {banners.length}
            </span>
          </div>

          {/* Phone Frame */}
          <div className="bg-[#111827] p-3 rounded-[32px] shadow-lg max-w-sm mx-auto border-4 border-gray-800">
            {/* Phone Screen */}
            <div className="bg-[#f6f9f7] rounded-[24px] overflow-hidden p-3.5 space-y-3 font-sans">
              {/* Header simulation */}
              <div className="flex items-center justify-between pb-1.5 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-700 flex items-center justify-center text-white text-xs font-bold">
                    M
                  </div>
                  <div>
                    <span className="font-extrabold text-xs text-gray-900">Mapstreak</span>
                    <p className="text-[9px] text-gray-500">Student • 12-A #100</p>
                  </div>
                </div>
                <div className="px-2 py-0.5 rounded-lg bg-amber-100 border border-amber-200 text-amber-900 text-[10px] font-bold">
                  ₹3080 +
                </div>
              </div>

              {/* Search Bar simulation */}
              <div className="bg-white rounded-xl border border-gray-200 px-3 py-2 text-[10px] text-gray-400 font-medium flex items-center gap-2 shadow-xs">
                <span>🔍</span>
                <span>Search meals, wraps, juices...</span>
              </div>

              {/* THE MULTI-IMAGE BANNER SLIDER WITH SLIDE DOTS */}
              <div className="relative rounded-2xl overflow-hidden shadow-xs border border-gray-200/80 group">
                <div className="w-full h-32 relative bg-gray-200 overflow-hidden">
                  <img
                    src={displayPreviewImage}
                    alt={activeSlide.title}
                    className="w-full h-full object-cover transition-all duration-500"
                  />
                  {/* Subtle gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10"></div>

                  {/* Text without any "special" badges */}
                  <div className="absolute inset-0 p-3 pb-6 flex flex-col justify-end text-white">
                    <h4 className="font-extrabold text-xs text-white leading-tight drop-shadow-sm">
                      {previewUrl ? (title || 'New Banner Slide') : activeSlide.title}
                    </h4>
                    <p className="text-[10px] text-gray-200 mt-0.5 leading-snug drop-shadow-sm line-clamp-1">
                      {previewUrl ? (subtitle || 'Prepared fresh daily') : activeSlide.subtitle}
                    </p>
                  </div>

                  {/* Left / Right Arrow navigation */}
                  {banners.length > 1 && (
                    <>
                      <button
                        onClick={() => setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length)}
                        className="absolute left-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setCurrentSlide((prev) => (prev + 1) % banners.length)}
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}

                  {/* Slide Indicator Dots */}
                  {banners.length > 1 && (
                    <div className="absolute bottom-2 left-0 right-0 flex justify-center items-center gap-1.5 z-20">
                      {banners.map((_, dotIdx) => (
                        <button
                          key={dotIdx}
                          onClick={() => setCurrentSlide(dotIdx)}
                          className={`h-1.5 rounded-full transition-all duration-300 ${
                            dotIdx === currentSlide
                              ? 'w-5 bg-amber-400 shadow-xs'
                              : 'w-1.5 bg-white/60 hover:bg-white'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Menu items simulation below banner */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-[10px] font-bold text-gray-700 uppercase">
                  <span>All Menu Items</span>
                  <span className="text-gray-400 font-normal">3 items</span>
                </div>
                <div className="bg-white p-2 rounded-xl border border-gray-200 flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-xs">🍲</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold text-gray-800 truncate">Paneer Kathi Roll</p>
                    <p className="text-[9px] text-gray-400">₹65 • Campus Fresh</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

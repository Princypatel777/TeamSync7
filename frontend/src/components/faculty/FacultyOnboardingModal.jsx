import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import API from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import {
  User,
  Building,
  GraduationCap,
  Sparkles,
  Phone,
  MapPin,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Plus,
  X,
  ShieldCheck,
} from 'lucide-react';

const COMMON_EXPERTISE_SUGGESTIONS = [
  'Artificial Intelligence',
  'Machine Learning',
  'Cloud Computing',
  'Cyber Security',
  'Web Technologies',
  'Data Science',
  'Internet of Things (IoT)',
  'Software Architecture',
  'Mobile Computing',
  'Blockchain',
  'Computer Vision',
  'DevOps & CI/CD',
];

const DESIGNATION_OPTIONS = [
  'Assistant Professor',
  'Associate Professor',
  'Professor',
  'Head of Department (HOD)',
  'Dean / Director',
  'Visiting Faculty',
  'Adjunct Professor',
];

export const FacultyOnboardingModal = ({ isOpen, onClose, isMandatory = true }) => {
  const { user, updateUser } = useAuthStore();
  const queryClient = useQueryClient();

  const [name, setName] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [designation, setDesignation] = useState('Assistant Professor');
  const [expertise, setExpertise] = useState([]);
  const [customTag, setCustomTag] = useState('');
  const [phone, setPhone] = useState('');
  const [officeLocation, setOfficeLocation] = useState('');
  const [bio, setBio] = useState('');

  const [formError, setFormError] = useState('');
  const [successCelebration, setSuccessCelebration] = useState(false);

  // Fetch active departments for dropdown
  const { data: deptData, isLoading: isDeptsLoading } = useQuery({
    queryKey: ['facultyDepartments'],
    queryFn: async () => {
      try {
        const res = await API.get('/faculty/departments');
        return res.data.departments || [];
      } catch (err) {
        // Fallback to admin departments endpoint if needed
        const res = await API.get('/admin/departments');
        return res.data.departments || [];
      }
    },
  });

  // Prefill with current user/profile data
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      const profile = user.profile;
      if (profile) {
        const deptId = profile.departmentId?._id || profile.departmentId || '';
        setDepartmentId(deptId);
        if (profile.designation) setDesignation(profile.designation);
        if (Array.isArray(profile.expertise)) setExpertise(profile.expertise);
        if (profile.phone) setPhone(profile.phone);
        if (profile.officeLocation) setOfficeLocation(profile.officeLocation);
        if (profile.bio) setBio(profile.bio);
      }
    }
  }, [user, isOpen]);

  // Mutation to save faculty profile
  const saveMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await API.put('/faculty/profile', payload);
      return res.data;
    },
    onSuccess: (data) => {
      // Invalidate queries so that dashboards and profile pages update
      queryClient.invalidateQueries(['facultyProfile']);
      queryClient.invalidateQueries(['adminFaculty']);
      queryClient.invalidateQueries(['authMe']);

      // Update local auth store immediately
      updateUser({
        name: data.user?.name || name,
        isProfileComplete: true,
        profile: data.profile,
      });

      setSuccessCelebration(true);
      setTimeout(() => {
        setSuccessCelebration(false);
        if (onClose) onClose();
      }, 1500);
    },
    onError: (err) => {
      setFormError(
        err.response?.data?.message || 'Failed to save profile. Please verify your inputs.'
      );
    },
  });

  const handleAddExpertiseTag = (tag) => {
    const trimmed = tag.trim();
    if (trimmed && !expertise.includes(trimmed)) {
      setExpertise([...expertise, trimmed]);
    }
  };

  const handleRemoveExpertiseTag = (tagToRemove) => {
    setExpertise(expertise.filter((t) => t !== tagToRemove));
  };

  const handleAddCustomTag = (e) => {
    e.preventDefault();
    if (customTag.trim()) {
      handleAddExpertiseTag(customTag);
      setCustomTag('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    if (!name.trim()) {
      setFormError('Please enter your full name.');
      return;
    }

    if (!departmentId) {
      setFormError('Please select your academic department.');
      return;
    }

    saveMutation.mutate({
      name: name.trim(),
      departmentId,
      designation,
      expertise,
      phone: phone.trim(),
      officeLocation: officeLocation.trim(),
      bio: bio.trim(),
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden transform transition-all">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 p-6 sm:p-8 text-white relative">
          {!isMandatory && onClose && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-semibold tracking-wider uppercase text-blue-400">
                First-Time Setup
              </span>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                Welcome to TeamSync!
              </h2>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Please confirm your academic details, department, and domain specializations to complete
            your faculty guide profile.
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 max-h-[75vh] overflow-y-auto">
          {successCelebration ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-slate-800">Profile Configured Successfully!</h3>
              <p className="text-sm text-slate-500 max-w-sm">
                Thank you, Professor. Your profile has been updated and you are now ready to guide
                student projects.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {formError && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start space-x-3 text-rose-700 text-sm">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Grid 1: Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Dr. Ananya Sharma"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium text-slate-900"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Institutional Email
                  </label>
                  <div className="flex items-center space-x-2 px-3 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-600 font-mono">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span className="truncate">{user?.email || 'faculty@teamsync.edu'}</span>
                  </div>
                </div>
              </div>

              {/* Grid 2: Department & Designation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Academic Department <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                    <select
                      value={departmentId}
                      onChange={(e) => setDepartmentId(e.target.value)}
                      className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-900 font-medium appearance-none"
                      required
                      disabled={isDeptsLoading}
                    >
                      <option value="">-- Select Your Department --</option>
                      {deptData?.map((dept) => (
                        <option key={dept._id} value={dept._id}>
                          {dept.name} ({dept.code})
                        </option>
                      ))}
                    </select>
                  </div>
                  {isDeptsLoading && (
                    <p className="text-[11px] text-slate-400 mt-1">Loading departments...</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Academic Designation <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                    <select
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                      className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-900 font-medium appearance-none"
                      required
                    >
                      {DESIGNATION_OPTIONS.map((desig) => (
                        <option key={desig} value={desig}>
                          {desig}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Specializations / Areas of Expertise */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Domain Expertise & Specializations
                </label>
                <p className="text-xs text-slate-500 mb-2.5">
                  Select your areas of technical expertise so coordinators can allocate matching SGP
                  project domains to you:
                </p>

                {/* Selected Tags */}
                <div className="flex flex-wrap gap-2 mb-3 min-h-[32px] p-2 bg-slate-50 border border-slate-200 rounded-xl">
                  {expertise.length === 0 ? (
                    <span className="text-xs text-slate-400 italic py-1 px-1">
                      No specializations added yet. Click suggestions below or add your own.
                    </span>
                  ) : (
                    expertise.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold shadow-xs"
                      >
                        <span>{tag}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveExpertiseTag(tag)}
                          className="hover:text-rose-600 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))
                  )}
                </div>

                {/* Suggested Pills */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {COMMON_EXPERTISE_SUGGESTIONS.filter((s) => !expertise.includes(s)).map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleAddExpertiseTag(tag)}
                      className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-100 text-slate-600 hover:text-blue-700 transition-colors flex items-center space-x-1 border border-slate-200/80"
                    >
                      <Plus className="w-3 h-3" />
                      <span>{tag}</span>
                    </button>
                  ))}
                </div>

                {/* Custom Tag Input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customTag}
                    onChange={(e) => setCustomTag(e.target.value)}
                    placeholder="Add custom specialization (e.g. Embedded Systems)..."
                    className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleAddCustomTag(e);
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomTag}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold flex items-center space-x-1 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>
              </div>

              {/* Grid 3: Phone & Cabin/Office */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Contact / Mobile Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. +91 98765 43210"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-900 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Cabin / Office Location
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={officeLocation}
                      onChange={(e) => setOfficeLocation(e.target.value)}
                      placeholder="e.g. Room 304, IT Department Block"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-900 font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Bio / Research Profile */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Brief Bio & Research Interests
                </label>
                <div className="relative">
                  <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <textarea
                    rows={2}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Short summary of your academic background and project mentorship interests..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-900 font-medium resize-none"
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
                {!isMandatory && onClose && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  disabled={saveMutation.isPending}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all flex items-center space-x-2 disabled:opacity-60"
                >
                  {saveMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving Profile...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Save & Complete Profile</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default FacultyOnboardingModal;

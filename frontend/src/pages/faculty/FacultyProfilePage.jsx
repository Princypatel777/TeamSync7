import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import API from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import FacultyOnboardingModal from '../../components/faculty/FacultyOnboardingModal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  User,
  Mail,
  ShieldCheck,
  Building,
  GraduationCap,
  Sparkles,
  Phone,
  MapPin,
  FileText,
  Edit3,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export const FacultyProfilePage = () => {
  const { user } = useAuthStore();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Fetch live faculty profile
  const { data, isLoading } = useQuery({
    queryKey: ['facultyProfile'],
    queryFn: async () => {
      const res = await API.get('/faculty/profile');
      return res.data;
    },
  });

  if (isLoading) {
    return (
      <div className="py-20 flex justify-center">
        <LoadingSpinner message="Loading faculty profile..." />
      </div>
    );
  }

  const profile = data?.profile || user?.profile;
  const facultyUser = data?.user || user;
  const isProfileComplete = Boolean(profile?.isProfileComplete || facultyUser?.isProfileComplete);

  const deptName =
    profile?.departmentId?.name ||
    (typeof profile?.departmentId === 'string' ? profile.departmentId : null) ||
    'Not Specified';
  const deptCode = profile?.departmentId?.code ? ` (${profile.departmentId.code})` : '';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Modal for editing / updating profile */}
      <FacultyOnboardingModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        isMandatory={false}
      />

      {/* Main Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {/* Cover / Header Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 h-36 relative px-8">
          <div className="absolute -bottom-14 left-8 flex items-end space-x-5">
            <div className="w-28 h-28 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-2xl border-4 border-white flex items-center justify-center shadow-lg text-white font-bold text-4xl">
              {facultyUser?.name?.charAt(0) || 'F'}
            </div>
          </div>
          <div className="absolute top-6 right-8">
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-semibold backdrop-blur-sm transition-all border border-white/20 shadow-xs"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit Profile Details</span>
            </button>
          </div>
        </div>

        {/* Profile Header Details */}
        <div className="pt-18 pb-8 px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                  {facultyUser?.name || 'Faculty Member'}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                  {facultyUser?.role || 'FACULTY'}
                </span>
              </div>
              <p className="text-sm font-medium text-slate-500 mt-1 flex items-center space-x-1.5">
                <GraduationCap className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>{profile?.designation || 'Assistant Professor'}</span>
                <span>•</span>
                <span>{deptName}{deptCode}</span>
              </p>
            </div>

            {/* Profile Completion Badge */}
            <div>
              {isProfileComplete ? (
                <div className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold shadow-2xs">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Profile Completed & Active</span>
                </div>
              ) : (
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold hover:bg-amber-100 transition-colors"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>Incomplete Details — Click to Setup</span>
                </button>
              )}
            </div>
          </div>

          {/* Bio Section */}
          {profile?.bio && (
            <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-100 text-sm text-slate-700 leading-relaxed">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                About & Research Background
              </p>
              <p>{profile.bio}</p>
            </div>
          )}

          {/* Details Grid */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Academic & Department Info */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">
                Departmental Information
              </h3>

              <div className="flex items-start space-x-3 text-slate-700">
                <Building className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-slate-400">Department</p>
                  <p className="font-semibold text-slate-800">{deptName}{deptCode}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 text-slate-700">
                <GraduationCap className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-slate-400">Designation</p>
                  <p className="font-semibold text-slate-800">{profile?.designation || 'Assistant Professor'}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 text-slate-700">
                <MapPin className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-slate-400">Office / Cabin Location</p>
                  <p className="font-semibold text-slate-800">
                    {profile?.officeLocation || <span className="text-slate-400 italic">Not set (Click edit to add)</span>}
                  </p>
                </div>
              </div>
            </div>

            {/* Communication & Account Details */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">
                Contact & Communication
              </h3>

              <div className="flex items-start space-x-3 text-slate-700">
                <Mail className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-slate-400">Institutional Email</p>
                  <p className="font-semibold font-mono text-slate-800">{facultyUser?.email}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 text-slate-700">
                <Phone className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-slate-400">Mobile / Contact Phone</p>
                  <p className="font-semibold text-slate-800">
                    {profile?.phone || <span className="text-slate-400 italic">Not set (Click edit to add)</span>}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 text-slate-700">
                <ShieldCheck className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-slate-400">Account Authorization</p>
                  <p className="font-semibold text-emerald-700">Active Guide & Evaluator</p>
                </div>
              </div>
            </div>
          </div>

          {/* Domain Expertise Section */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Domain Specializations & Mentorship Areas
              </h3>
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
              >
                + Manage Specializations
              </button>
            </div>

            {Array.isArray(profile?.expertise) && profile.expertise.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {profile.expertise.map((item, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200/80 text-blue-800 text-xs font-semibold shadow-2xs"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-blue-600 mr-1.5" />
                    {item}
                  </span>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-center">
                <p className="text-xs text-slate-500">
                  No technical specializations recorded. Click "Edit Profile Details" to list your project domains.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacultyProfilePage;

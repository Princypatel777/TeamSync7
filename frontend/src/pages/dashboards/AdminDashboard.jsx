import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../store/authStore';
import API from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  ShieldCheck,
  Users,
  GraduationCap,
  Building,
  Layers,
  Activity,
  CheckCircle2,
  FolderGit2,
  Award,
  ArrowRight,
  Settings,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminDashboard = () => {
  const { user } = useAuthStore();

  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ['adminAnalyticsDashboard'],
    queryFn: async () => {
      const res = await API.get('/platform/analytics');
      return res.data;
    },
  });

  if (isLoading) return <LoadingSpinner text="Loading System Control Center..." />;

  const kpis = analyticsData?.kpis || {};

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Institutional Admin Control Center
            </h1>
            <StatusBadge status="ACTIVE" customLabel="System Online" />
          </div>
          <p className="text-sm text-slate-300 mt-1">
            Logged in as <span className="font-semibold text-white">{user?.name}</span>. Full institutional governance, user provisioning & academic cycle management.
          </p>
        </div>
        <div className="flex items-center space-x-2 text-xs font-mono bg-slate-800 px-3 py-1.5 rounded-lg text-slate-300 border border-slate-700">
          <ShieldCheck className="w-4 h-4 text-purple-400" />
          <span>Role: SYSTEM ADMIN</span>
        </div>
      </div>

      {/* Live System KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Students</span>
            <GraduationCap className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-800">{kpis.totalStudents || 0}</div>
          <div className="text-xs text-slate-500 mt-1">Enrolled across departments</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Faculty Mentors</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-slate-800">{kpis.totalFaculty || 0}</div>
          <div className="text-xs text-slate-500 mt-1">Guides & Evaluators</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Active Groups</span>
            <Layers className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-800">{kpis.totalGroups || 0}</div>
          <div className="text-xs text-slate-500 mt-1">Student project groups</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Approved Projects</span>
            <FolderGit2 className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-slate-800">{kpis.approvedProjects || 0}</div>
          <div className="text-xs text-slate-500 mt-1">In active development</div>
        </div>
      </div>

      {/* Admin Modules Quick Launch */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-800">
          Institutional Administration Modules
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/admin/students"
            className="p-4 bg-slate-50 hover:bg-blue-50/70 border border-slate-200 hover:border-blue-200 rounded-xl transition group"
          >
            <div className="flex items-center justify-between">
              <GraduationCap className="w-6 h-6 text-blue-600 mb-2" />
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition" />
            </div>
            <h3 className="font-bold text-slate-800 text-sm">Student Provisioning</h3>
            <p className="text-xs text-slate-500 mt-1">Manage enrollments, passwords, and student profiles.</p>
          </Link>

          <Link
            to="/admin/faculty"
            className="p-4 bg-slate-50 hover:bg-indigo-50/70 border border-slate-200 hover:border-indigo-200 rounded-xl transition group"
          >
            <div className="flex items-center justify-between">
              <Users className="w-6 h-6 text-indigo-600 mb-2" />
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition" />
            </div>
            <h3 className="font-bold text-slate-800 text-sm">Faculty & Guides</h3>
            <p className="text-xs text-slate-500 mt-1">Create mentors, assign departments, and manage designations.</p>
          </Link>

          <Link
            to="/admin/departments"
            className="p-4 bg-slate-50 hover:bg-emerald-50/70 border border-slate-200 hover:border-emerald-200 rounded-xl transition group"
          >
            <div className="flex items-center justify-between">
              <Building className="w-6 h-6 text-emerald-600 mb-2" />
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition" />
            </div>
            <h3 className="font-bold text-slate-800 text-sm">Academic Structure</h3>
            <p className="text-xs text-slate-500 mt-1">Configure Departments, Academic Years, and SGP Cycles.</p>
          </Link>
        </div>
      </div>

      {/* System Security & Audit Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
          <div className="flex items-center space-x-2 text-slate-700 font-bold text-sm mb-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Security & Authentication Enforcement</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            All user authentication is powered by bcrypt-hashed passwords and signed JWT tokens with strictly enforced role-based route protection on both backend Express middleware and React Router.
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
          <div className="flex items-center space-x-2 text-slate-700 font-bold text-sm mb-2">
            <Activity className="w-4 h-4 text-blue-600" />
            <span>System Audit & Governance</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Every critical action including logins, proposal approvals, faculty assignment, and marks submission is logged to the MongoDB Audit Trail.
          </p>
          <div className="mt-3">
            <Link to="/admin/audit-logs" className="text-xs text-blue-600 font-semibold hover:underline inline-flex items-center gap-1">
              View System Audit Logs <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

import React from 'react';
import { NavLink } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import API from '../../services/api';
import {
  LayoutDashboard,
  User,
  Users,
  FolderGit2,
  FileText,
  CheckSquare,
  Kanban,
  Bug,
  Flag,
  FileCode,
  MessageSquare,
  Github,
  Calendar,
  Award,
  Building,
  GraduationCap,
  Settings,
  ShieldCheck,
  Cpu,
  Layers,
  Sparkles,
  ClipboardList,
} from 'lucide-react';

const MENU_ITEMS_BY_ROLE = {
  STUDENT: [
    { label: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
    { label: 'My Group', path: '/student/group', icon: Users },
    { label: 'My Project', path: '/student/proposal', icon: FolderGit2 },
    { label: 'Kanban / Tasks', path: '/student/kanban', icon: Kanban },
    { label: 'Files', path: '/student/files', icon: FileCode },
    { label: 'GitHub', path: '/student/github', icon: Github },
    { label: 'Reviews & Marks', path: '/student/reviews', icon: Award },
    { label: 'Profile', path: '/student/profile', icon: User },
  ],
  FACULTY: [
    { label: 'Dashboard', path: '/faculty/dashboard', icon: LayoutDashboard },
    { label: 'My Groups', path: '/faculty/projects', icon: Users },
    { label: 'Proposals Review', path: '/faculty/proposals', icon: FileText },
    { label: 'Reviews & Evaluation', path: '/faculty/marks', icon: Award },
    { label: 'Calendar', path: '/faculty/calendar', icon: Calendar },
    { label: 'Profile', path: '/faculty/profile', icon: User },
  ],
  COORDINATOR: [
    { label: 'Dashboard', path: '/coordinator/dashboard', icon: LayoutDashboard },
    { label: 'Groups', path: '/coordinator/groups', icon: Users },
    { label: 'Students', path: '/coordinator/students', icon: GraduationCap },
    { label: 'Faculty Allocation', path: '/coordinator/faculty-assign', icon: Users },
    { label: 'Reviews & Marks', path: '/coordinator/reviews', icon: Award },
    { label: 'Analytics', path: '/coordinator/analytics', icon: Layers },
    { label: 'Calendar', path: '/coordinator/calendar', icon: Calendar },
    { label: 'Profile', path: '/coordinator/profile', icon: User },
  ],
  ADMIN: [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Students', path: '/admin/students', icon: GraduationCap },
    { label: 'Faculty', path: '/admin/faculty', icon: Users },
    { label: 'Coordinators', path: '/admin/coordinators', icon: Users },
    { label: 'Academic Settings', path: '/admin/departments', icon: Building },
    { label: 'System Analytics', path: '/admin/analytics', icon: Layers },
    { label: 'Audit Logs', path: '/admin/audit-logs', icon: ShieldCheck },
  ],
};

export const Sidebar = ({ role }) => {
  const menuItems = MENU_ITEMS_BY_ROLE[role] || MENU_ITEMS_BY_ROLE.STUDENT;

  const { data: unreadData } = useQuery({
    queryKey: ['chatUnreadCounts'],
    queryFn: async () => {
      const res = await API.get('/collaboration/chat/unread');
      return res.data;
    },
    refetchInterval: 5000,
    enabled: role === 'STUDENT' || role === 'FACULTY' || role === 'COORDINATOR'
  });

  const totalUnread = unreadData?.total || 0;

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-screen sticky top-0 border-r border-slate-800 select-none overflow-y-auto">
      {/* Brand Header */}
      <div className="h-16 px-6 flex items-center justify-between border-b border-slate-800 bg-slate-950">
        <div className="flex items-center space-x-2">
          <div className="bg-blue-600 text-white p-1.5 rounded-lg font-bold text-lg">
            TS
          </div>
          <div>
            <h1 className="font-bold text-white tracking-wide text-lg">TeamSync</h1>
            <p className="text-[10px] text-slate-400 font-mono leading-none">SGP Management</p>
          </div>
        </div>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 py-4 px-3 space-y-1">
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white font-semibold shadow-sm'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                }`
              }
            >
              <IconComponent className="w-4 h-4 mr-3 shrink-0" />
              <span className="truncate flex-1">{item.label}</span>
              {item.label === 'Chat' && totalUnread > 0 && (
                <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm ml-2">
                  {totalUnread > 99 ? '99+' : totalUnread}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer info */}
      <div className="p-4 border-t border-slate-800 text-xs text-slate-500 font-mono text-center">
        v1.0.0 • Institutional Build
      </div>
    </aside>
  );
};

export default Sidebar;

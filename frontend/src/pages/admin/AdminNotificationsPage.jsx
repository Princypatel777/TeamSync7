import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import API from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import {
  Bell,
  Send,
  Users,
  UserCheck,
  Shield,
  CheckCircle2,
  AlertCircle,
  Info,
  Search,
  History,
  CheckCheck,
  Megaphone,
  Radio,
  X,
  RefreshCw,
  FolderGit2,
  GraduationCap,
  Calendar,
  Sparkles,
} from 'lucide-react';

const NOTIF_TYPES = [
  { value: 'ANNOUNCEMENT', label: 'Announcement', color: 'bg-blue-50 text-blue-700 border-blue-200', icon: Megaphone },
  { value: 'ALERT', label: 'High Priority Alert', color: 'bg-rose-50 text-rose-700 border-rose-200', icon: AlertCircle },
  { value: 'GENERAL', label: 'General Notice', color: 'bg-slate-50 text-slate-700 border-slate-200', icon: Info },
  { value: 'TASK', label: 'Task / Milestone', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
  { value: 'REVIEW', label: 'Evaluation / Review', color: 'bg-purple-50 text-purple-700 border-purple-200', icon: Calendar },
];

export const AdminNotificationsPage = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('BROADCAST'); // 'BROADCAST' | 'HISTORY' | 'INBOX'

  // Targeting States
  const [targetMode, setTargetMode] = useState('ALL'); // 'ALL' | 'ROLES' | 'SPECIFIC_USERS' | 'GROUP'
  const [selectedRoles, setSelectedRoles] = useState(['COORDINATOR', 'FACULTY']);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [groupTarget, setGroupTarget] = useState('ALL'); // 'ALL' | 'MEMBERS_ONLY' | 'GUIDE_ONLY'

  // Form State
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('ANNOUNCEMENT');
  const [userSearch, setUserSearch] = useState('');
  const [feedback, setFeedback] = useState(null); // { type: 'success' | 'error', text: '' }

  // 1. Fetch Users for specific user selection
  const { data: usersData, isLoading: isUsersLoading } = useQuery({
    queryKey: ['adminAllUsersList'],
    queryFn: async () => {
      const res = await API.get('/admin/users', { params: { limit: 200 } });
      return res.data?.users || [];
    },
  });

  // 2. Fetch Groups for group-wise targeting
  const { data: groupsData, isLoading: isGroupsLoading } = useQuery({
    queryKey: ['adminAllGroupsForNotif'],
    queryFn: async () => {
      const res = await API.get('/groups');
      return res.data?.groups || [];
    },
  });

  // 3. Fetch Broadcast History
  const { data: historyData, isLoading: isHistoryLoading } = useQuery({
    queryKey: ['adminBroadcastHistory'],
    queryFn: async () => {
      const res = await API.get('/admin/notifications/broadcasts');
      return res.data?.broadcasts || [];
    },
    enabled: activeTab === 'HISTORY',
  });

  // 4. Fetch Admin's own notifications
  const { data: inboxData, isLoading: isInboxLoading } = useQuery({
    queryKey: ['adminPersonalNotifications'],
    queryFn: async () => {
      const res = await API.get('/platform/notifications');
      return res.data;
    },
    enabled: activeTab === 'INBOX',
  });

  // Send Notification Mutation
  const sendMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await API.post('/admin/notifications/send', payload);
      return res.data;
    },
    onSuccess: (data) => {
      setFeedback({ type: 'success', text: data.message || 'Notification broadcast successfully!' });
      setTitle('');
      setMessage('');
      setSelectedUserIds([]);
      queryClient.invalidateQueries(['adminBroadcastHistory']);
      setTimeout(() => setFeedback(null), 5000);
    },
    onError: (err) => {
      setFeedback({
        type: 'error',
        text: err.response?.data?.detail || err.response?.data?.message || 'Failed to dispatch notification.',
      });
    },
  });

  // Mark all inbox read mutation
  const readAllMutation = useMutation({
    mutationFn: async () => {
      const res = await API.put('/platform/notifications/read-all');
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['adminPersonalNotifications']);
    },
  });

  const users = usersData || [];
  const groups = groupsData || [];
  const broadcasts = historyData || [];
  const personalNotifs = inboxData?.notifications || [];

  // Filtered users for manual user search
  const filteredUsers = users.filter((u) => {
    if (!userSearch) return true;
    const term = userSearch.toLowerCase();
    return (
      u.name?.toLowerCase().includes(term) ||
      u.email?.toLowerCase().includes(term) ||
      u.enrollmentNumber?.toLowerCase().includes(term) ||
      u.role?.toLowerCase().includes(term)
    );
  });

  const handleToggleUser = (id) => {
    if (selectedUserIds.includes(id)) {
      setSelectedUserIds(selectedUserIds.filter((uid) => uid !== id));
    } else {
      setSelectedUserIds([...selectedUserIds, id]);
    }
  };

  const handleToggleRole = (role) => {
    if (selectedRoles.includes(role)) {
      setSelectedRoles(selectedRoles.filter((r) => r !== role));
    } else {
      setSelectedRoles([...selectedRoles, role]);
    }
  };

  const handleSend = (e) => {
    e.preventDefault();
    setFeedback(null);

    if (!title.trim() || !message.trim()) {
      setFeedback({ type: 'error', text: 'Please fill in both a notification title and message.' });
      return;
    }

    const payload = {
      title,
      message,
      type,
      targetMode,
    };

    if (targetMode === 'ROLES') {
      if (selectedRoles.length === 0) {
        setFeedback({ type: 'error', text: 'Please select at least one target role.' });
        return;
      }
      payload.roles = selectedRoles;
    } else if (targetMode === 'SPECIFIC_USERS') {
      if (selectedUserIds.length === 0) {
        setFeedback({ type: 'error', text: 'Please select at least one specific user recipient.' });
        return;
      }
      payload.userIds = selectedUserIds;
    } else if (targetMode === 'GROUP') {
      if (!selectedGroupId) {
        setFeedback({ type: 'error', text: 'Please select a project group to target.' });
        return;
      }
      payload.groupId = selectedGroupId;
      payload.groupTarget = groupTarget;
    }

    sendMutation.mutate(payload);
  };

  const selectedGroupObj = groups.find((g) => (g._id || g.id) === selectedGroupId);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
              <Megaphone className="w-7 h-7 text-indigo-600" /> Notification Broadcast Center
            </h1>
            <StatusBadge status="ACTIVE" customLabel="System Dispatcher" />
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Dispatch announcements, deadlines, and critical alerts across all user roles, specific individuals, or project groups.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab('BROADCAST')}
            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'BROADCAST' ? 'bg-white text-indigo-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Radio className="w-3.5 h-3.5" /> Broadcast Center
          </button>
          <button
            onClick={() => setActiveTab('HISTORY')}
            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'HISTORY' ? 'bg-white text-indigo-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <History className="w-3.5 h-3.5" /> Broadcast Logs
          </button>
          <button
            onClick={() => setActiveTab('INBOX')}
            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'INBOX' ? 'bg-white text-indigo-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Bell className="w-3.5 h-3.5" /> My Notifications
          </button>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl border text-sm font-medium flex items-center gap-2 transition-all ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {feedback.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" /> : <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* TAB 1: BROADCAST SENDER */}
      {activeTab === 'BROADCAST' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleSend} className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
              {/* STEP 1: TARGETING CRITERIA */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-indigo-600" /> 1. Select Recipient Audience
                </label>

                {/* Mode Selector Buttons */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                  {[
                    { id: 'ALL', label: 'Everyone', desc: 'All active users', icon: '🌍' },
                    { id: 'ROLES', label: 'By Role(s)', desc: 'Faculty, Coord, etc.', icon: '👥' },
                    { id: 'SPECIFIC_USERS', label: 'Specific User(s)', desc: 'Pick individually', icon: '🎯' },
                    { id: 'GROUP', label: 'Group-Wise', desc: 'Members or Guide', icon: '🏷️' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setTargetMode(m.id)}
                      className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                        targetMode === m.id
                          ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span className="text-xl mb-1">{m.icon}</span>
                      <div>
                        <p className={`text-xs font-bold ${targetMode === m.id ? 'text-indigo-900' : 'text-slate-800'}`}>
                          {m.label}
                        </p>
                        <p className="text-[10px] text-slate-500 line-clamp-1">{m.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Sub-Option A: ROLE COMBINATIONS */}
                {targetMode === 'ROLES' && (
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                    <p className="text-xs font-semibold text-slate-700">Quick Combinations & Role Selection:</p>

                    {/* Quick Preset Buttons */}
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedRoles(['COORDINATOR'])}
                        className="px-2.5 py-1 text-xs font-medium rounded-lg bg-white border border-slate-300 hover:bg-indigo-50 hover:border-indigo-300 text-slate-700"
                      >
                        Only Coordinators
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedRoles(['FACULTY'])}
                        className="px-2.5 py-1 text-xs font-medium rounded-lg bg-white border border-slate-300 hover:bg-indigo-50 hover:border-indigo-300 text-slate-700"
                      >
                        Only Faculty
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedRoles(['FACULTY', 'COORDINATOR'])}
                        className="px-2.5 py-1 text-xs font-medium rounded-lg bg-white border border-slate-300 hover:bg-indigo-50 hover:border-indigo-300 text-slate-700"
                      >
                        Both Faculty & Coordinators
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedRoles(['STUDENT'])}
                        className="px-2.5 py-1 text-xs font-medium rounded-lg bg-white border border-slate-300 hover:bg-indigo-50 hover:border-indigo-300 text-slate-700"
                      >
                        Only Students
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedRoles(['STUDENT', 'FACULTY', 'COORDINATOR'])}
                        className="px-2.5 py-1 text-xs font-medium rounded-lg bg-white border border-slate-300 hover:bg-indigo-50 hover:border-indigo-300 text-slate-700"
                      >
                        Students + Faculty + Coordinators
                      </button>
                    </div>

                    {/* Role Checkboxes */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-200">
                      {['STUDENT', 'FACULTY', 'COORDINATOR', 'ADMIN'].map((r) => {
                        const checked = selectedRoles.includes(r);
                        return (
                          <label
                            key={r}
                            className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer text-xs font-semibold ${
                              checked ? 'bg-indigo-50 border-indigo-300 text-indigo-900' : 'bg-white border-slate-200 text-slate-600'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => handleToggleRole(r)}
                              className="rounded text-indigo-600 focus:ring-indigo-500"
                            />
                            <span>{r}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Sub-Option B: SPECIFIC USERS */}
                {targetMode === 'SPECIFIC_USERS' && (
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-slate-700">
                        Selected Users: <span className="font-bold text-indigo-600">{selectedUserIds.length}</span>
                      </p>
                      {selectedUserIds.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setSelectedUserIds([])}
                          className="text-[11px] text-rose-600 hover:underline"
                        >
                          Clear all
                        </button>
                      )}
                    </div>

                    {/* Selected Tags */}
                    {selectedUserIds.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1.5 bg-white rounded-lg border border-slate-200">
                        {selectedUserIds.map((uid) => {
                          const u = users.find((user) => (user._id || user.id) === uid);
                          return (
                            <span
                              key={uid}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200"
                            >
                              <span>{u ? u.name : uid}</span>
                              <X
                                className="w-3 h-3 cursor-pointer hover:text-indigo-900"
                                onClick={() => handleToggleUser(uid)}
                              />
                            </span>
                          );
                        })}
                      </div>
                    )}

                    {/* Search & List */}
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search users by name, email, enrollment, role..."
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 bg-white rounded-lg border border-slate-200">
                      {isUsersLoading ? (
                        <p className="p-3 text-xs text-slate-400">Loading user directory...</p>
                      ) : filteredUsers.length === 0 ? (
                        <p className="p-3 text-xs text-slate-400">No users match search.</p>
                      ) : (
                        filteredUsers.map((u) => {
                          const uid = u._id || u.id;
                          const isChecked = selectedUserIds.includes(uid);
                          return (
                            <div
                              key={uid}
                              onClick={() => handleToggleUser(uid)}
                              className={`p-2 flex items-center justify-between text-xs cursor-pointer hover:bg-slate-50 transition ${
                                isChecked ? 'bg-indigo-50/50' : ''
                              }`}
                            >
                              <div>
                                <p className="font-semibold text-slate-800">{u.name}</p>
                                <p className="text-[10px] text-slate-400 font-mono">
                                  {u.email} {u.enrollmentNumber ? `• ${u.enrollmentNumber}` : ''}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">
                                  {u.role}
                                </span>
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => {}}
                                  className="rounded text-indigo-600 focus:ring-indigo-500"
                                />
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}

                {/* Sub-Option C: GROUP-WISE */}
                {targetMode === 'GROUP' && (
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Select Project Group *
                      </label>
                      <select
                        value={selectedGroupId}
                        onChange={(e) => setSelectedGroupId(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="">-- Choose Project Group --</option>
                        {groups.map((g) => (
                          <option key={g._id || g.id} value={g._id || g.id}>
                            [{g.code}] {g.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {selectedGroupObj && (
                      <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs text-slate-600 space-y-1">
                        <p>
                          <span className="font-semibold text-slate-800">Leader:</span> {selectedGroupObj.leaderId?.name || 'Assigned'}
                        </p>
                        <p>
                          <span className="font-semibold text-slate-800">Members:</span> {selectedGroupObj.members?.length || 1} student(s)
                        </p>
                        <p>
                          <span className="font-semibold text-slate-800">Faculty Guide:</span>{' '}
                          {selectedGroupObj.guideId?.name || 'Assigned / In Proposal'}
                        </p>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-2">
                        Target Within This Group:
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {[
                          { id: 'ALL', label: 'Both Members & Guide', desc: 'Entire group + supervising faculty' },
                          { id: 'MEMBERS_ONLY', label: 'Only Group Members', desc: 'Students & leader only' },
                          { id: 'GUIDE_ONLY', label: 'Only That Group Faculty', desc: 'Faculty guide only' },
                        ].map((gt) => (
                          <button
                            key={gt.id}
                            type="button"
                            onClick={() => setGroupTarget(gt.id)}
                            className={`p-2.5 rounded-lg border text-left text-xs transition ${
                              groupTarget === gt.id
                                ? 'bg-indigo-50 border-indigo-400 font-bold text-indigo-900 ring-1 ring-indigo-400'
                                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <p>{gt.label}</p>
                            <p className="text-[10px] text-slate-400 font-normal">{gt.desc}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* STEP 2: NOTIFICATION CONTENT */}
              <div className="pt-4 border-t border-slate-100 space-y-4">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Megaphone className="w-4 h-4 text-indigo-600" /> 2. Compose Notification
                </label>

                {/* Type Selection */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Notification Priority / Category</label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {NOTIF_TYPES.map((nt) => {
                      const Icon = nt.icon;
                      const isSelected = type === nt.value;
                      return (
                        <button
                          key={nt.value}
                          type="button"
                          onClick={() => setType(nt.value)}
                          className={`p-2 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition ${
                            isSelected
                              ? `${nt.color} ring-2 ring-indigo-400 font-bold`
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{nt.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Title / Headline *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Action Required: SGP Review 2 Presentation Schedule Released"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Message Body */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Message Content *</label>
                  <textarea
                    rows="4"
                    required
                    placeholder="Provide the complete announcement or instructions for the targeted recipients..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
                  ></textarea>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <span className="text-xs text-slate-500">
                  Targeting Mode:{' '}
                  <span className="font-semibold text-slate-800">
                    {targetMode === 'ALL'
                      ? 'All Users'
                      : targetMode === 'ROLES'
                      ? selectedRoles.join(', ')
                      : targetMode === 'SPECIFIC_USERS'
                      ? `${selectedUserIds.length} User(s)`
                      : `Group: ${selectedGroupObj ? selectedGroupObj.code : 'None'} (${groupTarget})`}
                  </span>
                </span>
                <button
                  type="submit"
                  disabled={sendMutation.isPending}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-sm font-semibold shadow-md flex items-center gap-2 transition"
                >
                  {sendMutation.isPending ? (
                    <>
                      <LoadingSpinner className="w-4 h-4 text-white" />
                      <span>Dispatching...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Send Notification</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Live Recipient Preview & Summary (1 col) */}
          <div className="space-y-6">
            {/* Live Card Preview */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-600" /> Live In-App Preview
              </h3>
              <p className="text-xs text-slate-400">This is how recipients will see the notification in their feed:</p>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider bg-indigo-100 text-indigo-700">
                    {type}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Just now</span>
                </div>
                <h4 className="font-bold text-slate-800 text-sm">{title || 'Notification Title Preview'}</h4>
                <p className="text-xs text-slate-600 whitespace-pre-line leading-relaxed">
                  {message || 'Detailed notification message body will appear here for the students or faculty.'}
                </p>
                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Sent by Administrator</span>
                  <span className="font-semibold text-indigo-600">Mark as read</span>
                </div>
              </div>
            </div>

            {/* Targeting Summary Card */}
            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-lg space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm flex items-center gap-2">
                  <Shield className="w-4 h-4 text-indigo-400" /> Institutional Broadcast
                </h4>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-indigo-800 text-indigo-200">
                  Instant
                </span>
              </div>
              <p className="text-xs text-indigo-200 leading-relaxed">
                Notifications are pushed directly to user accounts with instant in-app alerts and notifications count updates.
              </p>
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-indigo-800 text-xs">
                <div>
                  <p className="text-indigo-300 font-medium">Total Users</p>
                  <p className="text-lg font-bold">{users.length}</p>
                </div>
                <div>
                  <p className="text-indigo-300 font-medium">Total Groups</p>
                  <p className="text-lg font-bold">{groups.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BROADCAST LOGS */}
      {activeTab === 'HISTORY' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Broadcast Dispatch History</h2>
              <p className="text-xs text-slate-500 mt-0.5">Audit log of all announcements and mass notifications dispatched.</p>
            </div>
            <button
              onClick={() => queryClient.invalidateQueries(['adminBroadcastHistory'])}
              className="p-2 text-slate-500 hover:text-indigo-600 rounded-lg hover:bg-slate-100"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {isHistoryLoading ? (
            <LoadingSpinner text="Fetching broadcast logs..." />
          ) : broadcasts.length === 0 ? (
            <EmptyState
              icon={History}
              title="No broadcast history"
              description="You have not dispatched any mass notifications yet."
            />
          ) : (
            <div className="divide-y divide-slate-100">
              {broadcasts.map((log) => (
                <div key={log.id || log._id} className="p-5 flex items-start justify-between hover:bg-slate-50 transition">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-indigo-50 text-indigo-700">
                        {log.details?.type || 'ANNOUNCEMENT'}
                      </span>
                      <h4 className="font-bold text-slate-800 text-sm">{log.details?.title || 'Notification Broadcast'}</h4>
                    </div>
                    <div className="text-xs text-slate-500 flex flex-wrap items-center gap-x-4 gap-y-1">
                      <span>
                        Target: <span className="font-semibold text-slate-700">{log.details?.targetMode}</span>
                      </span>
                      {log.details?.roles && (
                        <span>
                          Roles: <span className="font-semibold text-slate-700">{log.details.roles.join(', ')}</span>
                        </span>
                      )}
                      {log.details?.groupTarget && (
                        <span>
                          Group Target: <span className="font-semibold text-slate-700">{log.details.groupTarget}</span>
                        </span>
                      )}
                      <span>
                        Dispatched to: <span className="font-bold text-indigo-600">{log.details?.recipientsCount || 0} user(s)</span>
                      </span>
                      <span>By: {log.actorName || 'Administrator'}</span>
                    </div>
                  </div>
                  <span className="text-xs text-slate-400 font-mono shrink-0">
                    {new Date(log.createdAt || log.created_at).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: PERSONAL INBOX */}
      {activeTab === 'INBOX' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-800">My Admin Notifications</h2>
              <p className="text-xs text-slate-500 mt-0.5">Alerts and notices delivered to your account.</p>
            </div>
            <button
              onClick={() => readAllMutation.mutate()}
              className="px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <CheckCheck className="w-3.5 h-3.5" /> Mark All as Read
            </button>
          </div>

          {isInboxLoading ? (
            <LoadingSpinner text="Loading notifications..." />
          ) : personalNotifs.length === 0 ? (
            <EmptyState
              icon={Bell}
              title="No notifications"
              description="Your personal notification inbox is completely empty."
            />
          ) : (
            <div className="divide-y divide-slate-100">
              {personalNotifs.map((n) => (
                <div key={n.id || n._id} className={`py-4 flex justify-between items-start ${n.isRead ? 'opacity-70' : ''}`}>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{n.title}</span>
                      {!n.isRead && <span className="w-2 h-2 rounded-full bg-blue-600"></span>}
                    </div>
                    <p className="text-xs text-slate-600 whitespace-pre-line">{n.message}</p>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(n.createdAt || n.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminNotificationsPage;

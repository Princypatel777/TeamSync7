import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import API from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  Cpu,
  Save,
  Key,
  ShieldAlert,
  Edit2,
  Trash2,
  Sliders,
  Settings,
  Plus,
  X,
  CheckCircle2,
  Eye,
  EyeOff,
  Sparkles,
  Bot,
  Layers,
  FileCheck,
} from 'lucide-react';

export const AdminAiSettingsPage = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('AI_ENGINE'); // 'AI_ENGINE' | 'ACADEMIC_RULES' | 'ALL_KEYS'

  // Modals for editing/adding keys
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [modalKey, setModalKey] = useState('');
  const [modalValue, setModalValue] = useState('');
  const [modalDesc, setModalDesc] = useState('');
  const [isEditingKey, setIsEditingKey] = useState(false);

  // Form states for AI
  const [showKey, setShowKey] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Fetch all system configs
  const { data, isLoading } = useQuery({
    queryKey: ['systemConfigs'],
    queryFn: async () => {
      const res = await API.get('/platform/settings');
      return res.data;
    },
  });

  const configs = data?.configs || [];

  // Helper to find value by key
  const getConfigVal = (key, fallback = '') => {
    const item = configs.find((c) => c.key === key);
    return item ? item.value : fallback;
  };

  // Upsert mutation
  const updateConfigMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await API.post('/platform/settings', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['systemConfigs']);
      setFeedback({ type: 'success', text: 'Configuration saved successfully!' });
      setIsEditModalOpen(false);
      setTimeout(() => setFeedback(null), 4000);
    },
    onError: (err) => {
      setFeedback({
        type: 'error',
        text: err.response?.data?.detail || err.response?.data?.message || 'Failed to update configuration.',
      });
    },
  });

  // Delete mutation
  const deleteConfigMutation = useMutation({
    mutationFn: async (id) => {
      const res = await API.delete(`/platform/settings/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['systemConfigs']);
      setFeedback({ type: 'success', text: 'Setting deleted successfully.' });
      setTimeout(() => setFeedback(null), 4000);
    },
    onError: (err) => {
      alert(err.response?.data?.detail || 'Failed to delete configuration.');
    },
  });

  if (isLoading) return <LoadingSpinner text="Loading System Configuration..." />;

  // Quick states mapped to configs
  const geminiKey = getConfigVal('GEMINI_API_KEY', '');
  const geminiModel = getConfigVal('GEMINI_MODEL', 'gemini-1.5-flash');
  const similarityThreshold = getConfigVal('SIMILARITY_THRESHOLD_PERCENT', '35');
  const maxGroupSize = getConfigVal('MAX_GROUP_SIZE', '4');
  const allowLateSubmissions = getConfigVal('ALLOW_LATE_SUBMISSIONS', 'false');
  const autoScreenProposals = getConfigVal('AUTO_SCREEN_PROPOSALS', 'true');

  const openCreateModal = () => {
    setIsEditingKey(false);
    setModalKey('');
    setModalValue('');
    setModalDesc('');
    setIsEditModalOpen(true);
  };

  const openEditModal = (c) => {
    setIsEditingKey(true);
    setModalKey(c.key);
    setModalValue(c.value);
    setModalDesc(c.description || '');
    setIsEditModalOpen(true);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* HEADER */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <Cpu className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold text-slate-800 tracking-tight">AI & System Settings</h1>
              <StatusBadge status="ACTIVE" customLabel="Platform Controls" />
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Configure Google Gemini LLM API keys, automated plagiarism similarity thresholds, and institutional project policies.
            </p>
          </div>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center space-x-1.5 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom Setting</span>
        </button>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl border text-sm font-medium flex items-center gap-2 transition-all ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{feedback.text}</span>
        </div>
      )}

      {/* TABS */}
      <div className="flex border-b border-slate-200 bg-white px-4 rounded-xl shadow-xs">
        <button
          onClick={() => setActiveTab('AI_ENGINE')}
          className={`py-3.5 px-5 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'AI_ENGINE'
              ? 'border-purple-600 text-purple-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Bot className="w-4 h-4" />
          AI Engine & Plagiarism Settings
        </button>
        <button
          onClick={() => setActiveTab('ACADEMIC_RULES')}
          className={`py-3.5 px-5 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'ACADEMIC_RULES'
              ? 'border-purple-600 text-purple-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sliders className="w-4 h-4" />
          Academic & Project Policies
        </button>
        <button
          onClick={() => setActiveTab('ALL_KEYS')}
          className={`py-3.5 px-5 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'ALL_KEYS'
              ? 'border-purple-600 text-purple-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Settings className="w-4 h-4" />
          All Configuration Keys ({configs.length})
        </button>
      </div>

      {/* TAB 1: AI ENGINE SETTINGS */}
      {activeTab === 'AI_ENGINE' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card A: Gemini API Key */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">Google Gemini API Key</h3>
                <p className="text-xs text-slate-500">Required for proposal topic similarity & smart insights</p>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formVal = e.target.elements.geminiKeyInput.value.trim();
                updateConfigMutation.mutate({
                  key: 'GEMINI_API_KEY',
                  value: formVal,
                  description: 'Google Gemini Pro LLM Key for project similarity & recommendations',
                });
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">API Secret Key</label>
                <div className="relative">
                  <input
                    name="geminiKeyInput"
                    type={showKey ? 'text' : 'password'}
                    defaultValue={geminiKey}
                    placeholder="AIzaSy..."
                    className="w-full pl-3 pr-10 py-2 border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Get your key from Google AI Studio (makersuite.google.com).</p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Model Selection</label>
                <select
                  defaultValue={geminiModel}
                  onChange={(e) => {
                    updateConfigMutation.mutate({
                      key: 'GEMINI_MODEL',
                      value: e.target.value,
                      description: 'Selected Gemini Model generation endpoint',
                    });
                  }}
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs bg-white font-medium"
                >
                  <option value="gemini-1.5-flash">Gemini 1.5 Flash (Fast & Recommended)</option>
                  <option value="gemini-1.5-pro">Gemini 1.5 Pro (Deep Reasoning)</option>
                  <option value="gemini-2.0-flash">Gemini 2.0 Flash (Next-Gen)</option>
                </select>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={updateConfigMutation.isPending}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Update Key</span>
                </button>
              </div>
            </form>
          </div>

          {/* Card B: Similarity Threshold */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">Historical Plagiarism Threshold</h3>
                <p className="text-xs text-slate-500">Flags project proposals matching previous academic years</p>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formVal = e.target.elements.threshInput.value;
                updateConfigMutation.mutate({
                  key: 'SIMILARITY_THRESHOLD_PERCENT',
                  value: String(formVal),
                  description: 'Plagiarism / historical similarity flag threshold percentage',
                });
              }}
              className="space-y-4"
            >
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold uppercase text-slate-500">Sensitivity Threshold</label>
                  <span className="text-xs font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                    {similarityThreshold}%
                  </span>
                </div>
                <input
                  name="threshInput"
                  type="range"
                  min="10"
                  max="80"
                  step="5"
                  defaultValue={similarityThreshold}
                  onChange={(e) => {
                    const el = document.getElementById('threshDisplay');
                    if (el) el.textContent = `${e.target.value}%`;
                  }}
                  className="w-full accent-purple-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
                  <span>10% (Strict)</span>
                  <span id="threshDisplay" className="font-bold text-slate-700">
                    {similarityThreshold}%
                  </span>
                  <span>80% (Permissive)</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
                <p className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  How this works:
                </p>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Proposals with similarity exceeding <b>{similarityThreshold}%</b> against stored repository projects will be automatically flagged for Coordinator review with an alert badge.
                </p>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={updateConfigMutation.isPending}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Save Threshold</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 2: ACADEMIC RULES */}
      {activeTab === 'ACADEMIC_RULES' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6 max-w-3xl">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-800">Institutional SGP Project Policies</h3>
            <p className="text-xs text-slate-500 mt-0.5">Rules governing group formations, submissions, and timeline policies.</p>
          </div>

          <div className="space-y-5">
            {/* Rule 1: Max Group Size */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 p-4 bg-slate-50/70 rounded-xl border border-slate-200">
              <div>
                <h4 className="text-sm font-bold text-slate-800">Maximum Group Size</h4>
                <p className="text-xs text-slate-500">Maximum number of students permitted per project group.</p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="10"
                  defaultValue={maxGroupSize}
                  onBlur={(e) => {
                    updateConfigMutation.mutate({
                      key: 'MAX_GROUP_SIZE',
                      value: e.target.value,
                      description: 'Maximum allowed student group members per SGP cycle',
                    });
                  }}
                  className="w-20 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-center"
                />
                <span className="text-xs text-slate-500 font-medium">Students</span>
              </div>
            </div>

            {/* Rule 2: Late Submissions */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 p-4 bg-slate-50/70 rounded-xl border border-slate-200">
              <div>
                <h4 className="text-sm font-bold text-slate-800">Allow Late Task & Milestone Submissions</h4>
                <p className="text-xs text-slate-500">If enabled, students can submit work past deadline marked as "LATE".</p>
              </div>
              <select
                defaultValue={allowLateSubmissions}
                onChange={(e) => {
                  updateConfigMutation.mutate({
                    key: 'ALLOW_LATE_SUBMISSIONS',
                    value: e.target.value,
                    description: 'Allow students to submit deliverables past scheduled milestone deadlines',
                  });
                }}
                className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold"
              >
                <option value="true">Allowed (Marked Late)</option>
                <option value="false">Strict (Locked at Deadline)</option>
              </select>
            </div>

            {/* Rule 3: Auto Proposal Screening */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 p-4 bg-slate-50/70 rounded-xl border border-slate-200">
              <div>
                <h4 className="text-sm font-bold text-slate-800">Automatic AI Proposal Screening</h4>
                <p className="text-xs text-slate-500">Run automatic AI analysis immediately when a group submits a proposal.</p>
              </div>
              <select
                defaultValue={autoScreenProposals}
                onChange={(e) => {
                  updateConfigMutation.mutate({
                    key: 'AUTO_SCREEN_PROPOSALS',
                    value: e.target.value,
                    description: 'Run automatic AI similarity scan upon student proposal submission',
                  });
                }}
                className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold"
              >
                <option value="true">Enabled (Automatic)</option>
                <option value="false">Disabled (Manual Only)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ALL CONFIGURATION KEYS (ADVANCED) */}
      {activeTab === 'ALL_KEYS' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">Raw Key-Value Settings Store</h3>
            <span className="text-xs font-mono font-bold text-slate-500">{configs.length} Active Keys</span>
          </div>

          <div className="divide-y divide-slate-100">
            {configs.map((c) => {
              const cfgId = c._id || c.id;
              const isKeySecret = c.key.includes('KEY') || c.key.includes('SECRET');

              return (
                <div key={cfgId} className="p-4 hover:bg-slate-50/70 transition flex items-center justify-between gap-4">
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                        {c.key}
                      </span>
                      <span className="font-mono text-xs font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded truncate max-w-md">
                        {isKeySecret && !showKey ? '••••••••••••••••••••' : c.value}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 truncate">{c.description || 'No description provided.'}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => openEditModal(c)}
                      className="p-1.5 text-slate-500 hover:text-blue-600 rounded bg-slate-100 hover:bg-blue-50 transition"
                      title="Edit Setting"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Delete configuration key "${c.key}"?`)) {
                          deleteConfigMutation.mutate(cfgId);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition"
                      title="Delete Setting"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 p-6 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-800">
                {isEditingKey ? 'Edit Configuration Key' : 'Add New Configuration Key'}
              </h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!modalKey.trim() || modalValue === '') return;
                updateConfigMutation.mutate({
                  key: modalKey.trim().toUpperCase(),
                  value: modalValue,
                  description: modalDesc,
                });
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Configuration Key *</label>
                <input
                  type="text"
                  required
                  disabled={isEditingKey}
                  value={modalKey}
                  onChange={(e) => setModalKey(e.target.value)}
                  placeholder="e.g. SGP_ACADEMIC_YEAR"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono disabled:bg-slate-100 disabled:text-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Value *</label>
                <textarea
                  rows="2"
                  required
                  value={modalValue}
                  onChange={(e) => setModalValue(e.target.value)}
                  placeholder="Value content..."
                  className="w-full p-3 border border-slate-300 rounded-lg text-xs font-mono"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Description</label>
                <input
                  type="text"
                  value={modalDesc}
                  onChange={(e) => setModalDesc(e.target.value)}
                  placeholder="What this setting controls..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-slate-600 font-semibold text-xs rounded-lg hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateConfigMutation.isPending}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs"
                >
                  {updateConfigMutation.isPending ? 'Saving...' : 'Save Configuration'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAiSettingsPage;

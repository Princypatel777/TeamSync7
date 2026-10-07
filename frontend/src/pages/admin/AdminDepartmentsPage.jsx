import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
import API from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { Building, Plus, CheckCircle, XCircle, X, AlertCircle, Trash2, Edit2, Calendar, Layers } from 'lucide-react';

export const AdminDepartmentsPage = () => {
  const location = useLocation();
  const isAcademicYears = location.pathname.includes('academic-years');
  const isCycles = location.pathname.includes('cycles');
  const pageType = isAcademicYears ? 'Academic Years' : isCycles ? 'SGP Cycles' : 'Departments';
  const Icon = isAcademicYears ? Calendar : isCycles ? Layers : Building;

  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ name: '', code: '', description: '' });
  const [formError, setFormError] = useState('');

  const endpoint = isAcademicYears ? '/admin/academic-years' : isCycles ? '/admin/sgp-cycles' : '/admin/departments';

  const { data: items, isLoading, error } = useQuery({
    queryKey: [pageType.toLowerCase()],
    queryFn: async () => {
      const res = await API.get(endpoint);
      if (isAcademicYears) {
        return (res.data.academicYears || []).map((y) => ({
          ...y,
          name: y.yearLabel || y.year_label || y.name,
          code: y.yearLabel || y.year_label || y.code,
        }));
      }
      if (isCycles) {
        return (res.data.sgpCycles || []).map((c) => ({
          ...c,
          name: c.name,
          code: c.code || c.name,
        }));
      }
      return res.data.departments || [];
    },
  });

  const createItemMutation = useMutation({
    mutationFn: async (payload) => {
      let body = payload;
      if (isAcademicYears) {
        body = { yearLabel: payload.name || payload.code };
      } else if (isCycles) {
        body = { name: payload.name };
      }
      const res = await API.post(endpoint, body);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries([pageType.toLowerCase()]);
      setIsModalOpen(false);
      setFormData({ name: '', code: '', description: '' });
    },
    onError: (err) => {
      setFormError(err.response?.data?.message || err.response?.data?.detail || `Failed to create ${pageType.toLowerCase()}.`);
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: async (payload) => {
      const id = editingItem._id || editingItem.id;
      let body = payload;
      if (isAcademicYears) {
        body = { yearLabel: payload.name || payload.code, year_label: payload.name || payload.code };
      } else if (isCycles) {
        body = { name: payload.name };
      }
      const res = await API.put(`${endpoint}/${id}`, body);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries([pageType.toLowerCase()]);
      setIsModalOpen(false);
      setEditingItem(null);
      setFormData({ name: '', code: '', description: '' });
    },
    onError: (err) => {
      setFormError(err.response?.data?.message || err.response?.data?.detail || `Failed to update ${pageType.toLowerCase()}.`);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');
    if (!formData.name && !formData.code) {
      setFormError('Name or Code is required.');
      return;
    }
    const finalData = {
      ...formData,
      name: formData.name || formData.code,
      code: formData.code || formData.name,
    };
    if (editingItem) {
      updateItemMutation.mutate(finalData);
    } else {
      createItemMutation.mutate(finalData);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">{pageType}</h1>
            <StatusBadge status="ACTIVE" customLabel="System Config" />
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Configure system settings for {pageType.toLowerCase()}.
          </p>
        </div>
        <button
          onClick={() => {
            setFormData({ name: '', code: '', description: '' });
            setFormError('');
            setIsModalOpen(true);
          }}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add {pageType.slice(0, -1)}</span>
        </button>
      </div>

      {isLoading ? (
        <LoadingSpinner text={`Fetching ${pageType.toLowerCase()}...`} />
      ) : error ? (
        <div className="p-4 bg-rose-50 text-rose-700 rounded-lg text-sm">Failed to load {pageType.toLowerCase()}.</div>
      ) : items?.length === 0 ? (
        <EmptyState
          icon={Icon}
          title={`No ${pageType.toLowerCase()} configured`}
          description={`Create your first ${pageType.toLowerCase().slice(0, -1)}.`}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items?.map((dept) => (
            <div
              key={(dept._id || dept.id)}
              className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-mono font-bold rounded-md">
                    {dept.code}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      <CheckCircle className="w-3 h-3 mr-1" /> Active
                    </span>
                    <button
                      onClick={() => { setEditingItem(dept); setFormData({ name: dept.name, code: dept.code, description: dept.description || '' }); setIsModalOpen(true); }}
                      className="p-1 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                      title="Edit Department"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={async () => {
                        if (window.confirm(`Are you sure you want to delete this ${pageType.toLowerCase().slice(0, -1)}?`)) {
                          try {
                            await API.delete(`${endpoint}/${(dept._id || dept.id)}`);
                            queryClient.invalidateQueries([pageType.toLowerCase()]);
                          } catch (err) {
                            alert(err.response?.data?.detail || `Failed to delete ${pageType.toLowerCase().slice(0, -1)}`);
                          }
                        }
                      }}
                      className="p-1 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <h3 className="text-lg font-bold text-slate-800">{dept.name}</h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  {dept.description || 'No description provided.'}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <span>Code: {dept.code}</span>
                <span>Created {new Date(dept.createdAt || dept.created_at || Date.now()).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">{editingItem ? "Edit" : "Add"} {pageType.slice(0, -1)}</h3>
              <button onClick={() => { setIsModalOpen(false); setEditingItem(null); }} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mt-4 p-3 bg-rose-50 text-rose-700 rounded-lg text-xs flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">{pageType.slice(0, -1)} Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={`e.g. ${isAcademicYears ? '2026-2027' : isCycles ? 'SGP Cycle VI' : 'Information Technology'}`}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Code (Uppercase) *</label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder={`e.g. ${isAcademicYears ? 'AY26-27' : isCycles ? 'SGP-6' : 'IT'}`}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Description</label>
                <textarea
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => { setIsModalOpen(false); setEditingItem(null); }}
                  className="px-4 py-2 text-slate-600 text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createItemMutation.isPending || updateItemMutation.isPending}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-sm"
                >
                  {createItemMutation.isPending || updateItemMutation.isPending ? 'Saving...' : editingItem ? 'Save Changes' : `Create ${pageType.slice(0, -1)}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDepartmentsPage;

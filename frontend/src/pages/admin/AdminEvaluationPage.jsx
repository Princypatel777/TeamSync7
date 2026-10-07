import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import API from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Award, Plus, Calendar, Layers, CheckCircle2, X, Trash2, Edit2 } from 'lucide-react';

export const AdminEvaluationPage = () => {
  const queryClient = useQueryClient();
  const [isCriteriaModal, setIsCriteriaModal] = useState(false);
  const [editingCriteria, setEditingCriteria] = useState(null);
  const [isReviewModal, setIsReviewModal] = useState(false);
  const [editingReview, setEditingReview] = useState(null);

  // Criteria Form State
  const [cName, setCName] = useState('');
  const [cWeight, setCWeight] = useState(25);
  const [cDesc, setCDesc] = useState('');

  // Review Form State
  const [rName, setRName] = useState('');
  const [rStage, setRStage] = useState('REVIEW_1');
  const [rDate, setRDate] = useState('');
  const [rVenue, setRVenue] = useState('Main Seminar Hall');

  // Fetch Criteria
  const { data: criteriaData, isLoading: isCriteriaLoading } = useQuery({
    queryKey: ['evalCriteria'],
    queryFn: async () => {
      const res = await API.get('/evaluation/criteria');
      return res.data;
    },
  });

  // Fetch Reviews
  const { data: reviewsData, isLoading: isReviewsLoading } = useQuery({
    queryKey: ['reviewSchedules'],
    queryFn: async () => {
      const res = await API.get('/evaluation/reviews');
      return res.data;
    },
  });

  // Add Criteria Mutation
  const addCriteriaMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await API.post('/evaluation/criteria', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['evalCriteria']);
      setIsCriteriaModal(false);
      setEditingCriteria(null);
      setCName('');
      setCDesc('');
    },
    onError: (err) => {
      alert(err.response?.data?.detail || err.response?.data?.message || 'Failed to save rubric criteria.');
    },
  });

  // Update Criteria Mutation
  const updateCriteriaMutation = useMutation({
    mutationFn: async (payload) => {
      const id = editingCriteria._id || editingCriteria.id;
      const res = await API.put(`/evaluation/criteria/${id}`, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['evalCriteria']);
      setIsCriteriaModal(false);
      setEditingCriteria(null);
      setCName('');
      setCDesc('');
    },
    onError: (err) => {
      alert(err.response?.data?.detail || err.response?.data?.message || 'Failed to update rubric criteria.');
    },
  });

  // Add Review Schedule Mutation
  const addReviewMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await API.post('/evaluation/reviews', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['reviewSchedules']);
      setIsReviewModal(false);
      setEditingReview(null);
      setRName('');
    },
    onError: (err) => {
      alert(err.response?.data?.detail || err.response?.data?.message || 'Failed to schedule review.');
    },
  });

  // Update Review Schedule Mutation
  const updateReviewMutation = useMutation({
    mutationFn: async (payload) => {
      const id = editingReview._id || editingReview.id;
      const res = await API.put(`/evaluation/reviews/${id}`, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['reviewSchedules']);
      setIsReviewModal(false);
      setEditingReview(null);
      setRName('');
    },
    onError: (err) => {
      alert(err.response?.data?.detail || err.response?.data?.message || 'Failed to update review schedule.');
    },
  });

  if (isCriteriaLoading || isReviewsLoading) return <LoadingSpinner text="Loading Evaluation Rubrics & Schedules..." />;

  const criteria = criteriaData?.criteria || [];
  const reviews = reviewsData?.reviews || [];
  const totalWeightage = criteria.reduce((sum, c) => sum + (c.weightagePercentage || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Evaluation Rubrics & Review Scheduling</h1>
              <StatusBadge status="ACTIVE" customLabel={`Total Weightage: ${totalWeightage}%`} />
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Configure weighted assessment criteria and schedule multi-stage SGP presentation reviews.
            </p>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={() => {
              setEditingCriteria(null);
              setCName('');
              setCWeight(25);
              setCDesc('');
              setIsCriteriaModal(true);
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-md flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Rubric Criteria</span>
          </button>
          <button
            onClick={() => {
              setEditingReview(null);
              setRName('');
              setRDate('');
              setRVenue('Main Seminar Hall');
              setIsReviewModal(true);
            }}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-md flex items-center space-x-1.5"
          >
            <Calendar className="w-4 h-4" />
            <span>Schedule Review</span>
          </button>
        </div>
      </div>

      {/* Criteria Grid */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex justify-between items-center pb-2 border-b border-slate-100">
          <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Evaluation Rubrics ({criteria.length})</h3>
          <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-full ${totalWeightage === 100 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
            Sum: {totalWeightage}% {totalWeightage === 100 ? '(Valid)' : '(Must equal 100%)'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {criteria.map((c) => (
            <div key={c._id || c.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
              <div className="flex justify-between items-start">
                <h4 className="font-bold text-slate-900 text-sm">{c.name}</h4>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-800 font-mono font-bold text-xs rounded">
                    {c.weightagePercentage}%
                  </span>
                  <button
                    onClick={() => {
                      setEditingCriteria(c);
                      setCName(c.name);
                      setCWeight(c.weightagePercentage || 25);
                      setCDesc(c.description || '');
                      setIsCriteriaModal(true);
                    }}
                    className="text-blue-400 hover:text-blue-600 p-1"
                    title="Edit Criterion"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={async () => {
                      if (window.confirm('Delete this criterion?')) {
                        try {
                          await API.delete(`/evaluation/criteria/${c._id || c.id}`);
                          queryClient.invalidateQueries(['evalCriteria']);
                        } catch (err) {
                          alert(err.response?.data?.detail || 'Failed to delete criterion');
                        }
                      }
                    }}
                    className="text-rose-400 hover:text-rose-600 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">{c.description || 'No description provided.'}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Review Schedules */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
        <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Scheduled Review Stages ({reviews.length})</h3>
        <div className="divide-y divide-slate-200">
          {reviews.map((r) => (
            <div key={r._id || r.id} className="py-3 flex justify-between items-center">
              <div>
                <div className="flex items-center space-x-3">
                  <span className="px-2 py-0.5 bg-slate-100 font-mono font-bold text-[10px] text-slate-700 rounded">
                    {r.stage}
                  </span>
                  <h4 className="font-bold text-slate-900 text-sm">{r.reviewName}</h4>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">Venue: {r.venue}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-semibold text-slate-700">{new Date(r.scheduledDate).toLocaleDateString()}</span>
                <button
                  onClick={() => {
                    setEditingReview(r);
                    setRName(r.reviewName);
                    setRStage(r.stage);
                    setRDate(r.scheduledDate ? r.scheduledDate.split('T')[0] : '');
                    setRVenue(r.venue || '');
                    setIsReviewModal(true);
                  }}
                  className="text-blue-400 hover:text-blue-600 p-1"
                  title="Edit Schedule"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={async () => {
                    if (window.confirm('Delete this review schedule?')) {
                      try {
                        await API.delete(`/evaluation/reviews/${r._id || r.id}`);
                        queryClient.invalidateQueries(['reviewSchedules']);
                      } catch (err) {
                        alert(err.response?.data?.detail || 'Failed to delete review');
                      }
                    }
                  }}
                  className="text-rose-400 hover:text-rose-600 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add / Edit Criteria Modal */}
      {isCriteriaModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">
                {editingCriteria ? 'Edit Evaluation Rubric Criteria' : 'Add Evaluation Rubric Criteria'}
              </h3>
              <button onClick={() => { setIsCriteriaModal(false); setEditingCriteria(null); }} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!cName) return;
                const payload = { name: cName, weightagePercentage: Number(cWeight), description: cDesc };
                if (editingCriteria) {
                  updateCriteriaMutation.mutate(payload);
                } else {
                  addCriteriaMutation.mutate(payload);
                }
              }}
              className="space-y-4 mt-4"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Criteria Name *</label>
                <input
                  type="text"
                  required
                  value={cName}
                  onChange={(e) => setCName(e.target.value)}
                  placeholder="e.g. System Architecture & DB Schema"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Weightage Percentage (0-100) *</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  required
                  value={cWeight}
                  onChange={(e) => setCWeight(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Description</label>
                <textarea
                  rows="3"
                  value={cDesc}
                  onChange={(e) => setCDesc(e.target.value)}
                  placeholder="Rubric grading guidelines..."
                  className="w-full p-3 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => { setIsCriteriaModal(false); setEditingCriteria(null); }}
                  className="px-4 py-2 text-slate-600 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addCriteriaMutation.isPending || updateCriteriaMutation.isPending}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm"
                >
                  {addCriteriaMutation.isPending || updateCriteriaMutation.isPending
                    ? 'Saving...'
                    : editingCriteria
                    ? 'Save Changes'
                    : 'Save Rubric'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Review Schedule Modal */}
      {isReviewModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">
                {editingReview ? 'Edit Review Stage' : 'Schedule Review Stage'}
              </h3>
              <button onClick={() => { setIsReviewModal(false); setEditingReview(null); }} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!rName || !rDate) return;
                const payload = { reviewName: rName, stage: rStage, scheduledDate: rDate, venue: rVenue };
                if (editingReview) {
                  updateReviewMutation.mutate(payload);
                } else {
                  addReviewMutation.mutate(payload);
                }
              }}
              className="space-y-4 mt-4"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Review Name *</label>
                <input
                  type="text"
                  required
                  value={rName}
                  onChange={(e) => setRName(e.target.value)}
                  placeholder="e.g. SGP Mid-Term Review Presentation"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Review Stage</label>
                <select
                  value={rStage}
                  onChange={(e) => setRStage(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-slate-900"
                >
                  <option value="REVIEW_1">Review 1 (Proposal)</option>
                  <option value="REVIEW_2">Review 2 (Mid-Term)</option>
                  <option value="REVIEW_3">Review 3 (Testing)</option>
                  <option value="FINAL_VIVA">Final Viva</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Scheduled Date *</label>
                <input
                  type="date"
                  required
                  value={rDate}
                  onChange={(e) => setRDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Venue / Link</label>
                <input
                  type="text"
                  value={rVenue}
                  onChange={(e) => setRVenue(e.target.value)}
                  placeholder="Main Seminar Hall / Zoom Link"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => { setIsReviewModal(false); setEditingReview(null); }}
                  className="px-4 py-2 text-slate-600 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addReviewMutation.isPending || updateReviewMutation.isPending}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-sm"
                >
                  {addReviewMutation.isPending || updateReviewMutation.isPending
                    ? 'Saving...'
                    : editingReview
                    ? 'Save Changes'
                    : 'Schedule Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEvaluationPage;

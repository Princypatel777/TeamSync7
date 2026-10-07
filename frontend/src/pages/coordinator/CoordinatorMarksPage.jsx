import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import API from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAuthStore } from '../../store/authStore';
import {
  Award,
  Plus,
  Calendar,
  CheckCircle2,
  X,
  Shield,
  Edit2,
  Trash2,
  GraduationCap,
  Download,
  Search,
  Users,
  MessageSquare,
  FileSpreadsheet,
  Filter,
  CheckCheck,
  Clock,
  Sparkles,
  Layers,
} from 'lucide-react';

export const CoordinatorMarksPage = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const userRole = user?.role || 'COORDINATOR';

  // Active Tab: 'FACULTY_REVIEWS' | 'RUBRICS' | 'RUBRIC_MARKS'
  const [activeTab, setActiveTab] = useState('FACULTY_REVIEWS');

  // Filter states for Faculty Review Marks
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReviewFilter, setSelectedReviewFilter] = useState('ALL');
  const [selectedGroupFilter, setSelectedGroupFilter] = useState('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');

  // Modals for Rubrics & Marks
  const [isCriteriaModal, setIsCriteriaModal] = useState(false);
  const [editingCriteria, setEditingCriteria] = useState(null);
  const [isMarkModal, setIsMarkModal] = useState(false);
  const [editingMarkRecord, setEditingMarkRecord] = useState(null);

  // Criteria Form State
  const [cName, setCName] = useState('');
  const [cWeight, setCWeight] = useState(25);
  const [cDesc, setCDesc] = useState('');

  // Mark Entry Form State (Rubrics)
  const [mProject, setMProject] = useState('');
  const [mStudent, setMStudent] = useState('');
  const [mStage, setMStage] = useState('REVIEW_1');
  const [mScores, setMScores] = useState({});
  const [mFeedback, setMFeedback] = useState('');

  // 1. Fetch Faculty Review Marks across all groups
  const { data: reviewMarksData, isLoading: isReviewMarksLoading } = useQuery({
    queryKey: ['allFacultyReviewMarks'],
    queryFn: async () => {
      const res = await API.get('/reviews/marks');
      return res.data;
    },
  });

  // 2. Fetch Review Events for dropdown filter
  const { data: reviewsListData } = useQuery({
    queryKey: ['marksReviewsFilterList'],
    queryFn: async () => {
      const res = await API.get('/reviews');
      return res.data?.reviews || [];
    },
  });

  // 3. Fetch Groups for dropdown filter
  const { data: groupsListData } = useQuery({
    queryKey: ['marksGroupsFilterList'],
    queryFn: async () => {
      const res = await API.get('/groups');
      return res.data?.groups || [];
    },
  });

  // 4. Fetch Rubric Criteria
  const { data: criteriaData, isLoading: isCriteriaLoading } = useQuery({
    queryKey: ['coordEvalCriteria'],
    queryFn: async () => {
      const res = await API.get('/evaluation/criteria');
      return res.data;
    },
  });

  // 5. Fetch Proposals / Projects
  const { data: proposalsData } = useQuery({
    queryKey: ['coordProposalsList'],
    queryFn: async () => {
      const res = await API.get('/proposals/assigned');
      return res.data;
    },
  });

  // 6. Fetch Rubric Student Marks
  const { data: rubricMarksData, isLoading: isRubricMarksLoading } = useQuery({
    queryKey: ['coordStudentMarks'],
    queryFn: async () => {
      const res = await API.get('/evaluation/marks');
      return res.data;
    },
  });

  // Save/Update Criteria Mutation
  const saveCriteriaMutation = useMutation({
    mutationFn: async (payload) => {
      if (editingCriteria) {
        const id = editingCriteria._id || editingCriteria.id;
        const res = await API.put(`/evaluation/criteria/${id}`, payload);
        return res.data;
      }
      const res = await API.post('/evaluation/criteria', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['coordEvalCriteria']);
      setIsCriteriaModal(false);
      setEditingCriteria(null);
      setCName('');
      setCDesc('');
    },
    onError: (err) => {
      alert(err.response?.data?.detail || err.response?.data?.message || 'Failed to save criteria.');
    },
  });

  // Delete Criteria Mutation
  const deleteCriteriaMutation = useMutation({
    mutationFn: async (id) => {
      const res = await API.delete(`/evaluation/criteria/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['coordEvalCriteria']);
    },
  });

  // Submit / Edit Rubric Student Marks Mutation
  const submitMarksMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await API.post('/evaluation/marks', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['coordStudentMarks']);
      setIsMarkModal(false);
      setEditingMarkRecord(null);
      setMProject('');
      setMStudent('');
      setMScores({});
      setMFeedback('');
    },
    onError: (err) => {
      alert(err.response?.data?.detail || err.response?.data?.message || 'Failed to submit marks.');
    },
  });

  if (isCriteriaLoading || isReviewMarksLoading) {
    return <LoadingSpinner text="Loading Marks & Faculty Evaluations..." />;
  }

  const reviewMarks = reviewMarksData?.marks || [];
  const reviews = reviewsListData || [];
  const groups = groupsListData || [];
  const criteria = criteriaData?.criteria || [];
  const proposals = proposalsData?.proposals || [];
  const rubricMarkRecords = rubricMarksData?.markRecords || [];
  const totalWeightage = criteria.reduce((sum, c) => sum + (c.weightagePercentage || 0), 0);

  // Filter Faculty Review Marks
  const filteredReviewMarks = reviewMarks.filter((m) => {
    const term = searchQuery.toLowerCase().trim();
    const matchSearch =
      !term ||
      (m.studentId?.name || '').toLowerCase().includes(term) ||
      (m.studentId?.enrollmentNumber || '').toLowerCase().includes(term) ||
      (m.groupId?.name || '').toLowerCase().includes(term) ||
      (m.groupId?.code || '').toLowerCase().includes(term) ||
      (m.facultyId?.name || '').toLowerCase().includes(term);

    const matchReview =
      selectedReviewFilter === 'ALL' ||
      (m.reviewId?._id || m.reviewId?.id) === selectedReviewFilter;

    const matchGroup =
      selectedGroupFilter === 'ALL' ||
      (m.groupId?._id || m.groupId?.id) === selectedGroupFilter;

    const matchStatus =
      selectedStatusFilter === 'ALL' ||
      (m.status || 'SUBMITTED') === selectedStatusFilter;

    return matchSearch && matchReview && matchGroup && matchStatus;
  });

  // Calculations for Metrics
  const uniqueGroupsGraded = new Set(filteredReviewMarks.map((m) => m.groupId?._id || m.groupId?.id).filter(Boolean)).size;
  const uniqueFacultyEvaluators = new Set(filteredReviewMarks.map((m) => m.facultyId?._id || m.facultyId?.id).filter(Boolean)).size;
  const avgPercentage = filteredReviewMarks.length > 0
    ? Math.round(
        filteredReviewMarks.reduce((acc, m) => {
          const max = m.reviewId?.maxMarks || 20;
          return acc + (m.marks / max) * 100;
        }, 0) / filteredReviewMarks.length
      )
    : 0;

  // Export Faculty Review Marks to CSV
  const downloadFacultyReviewCSV = () => {
    if (!filteredReviewMarks || filteredReviewMarks.length === 0) {
      alert('No evaluation records available to export.');
      return;
    }
    const headers = [
      'Group Code',
      'Group Name',
      'Faculty Evaluator',
      'Evaluator Email',
      'Student Name',
      'Enrollment No',
      'Student Email',
      'Review Title',
      'Review Type',
      'Marks Obtained',
      'Max Marks',
      'Percentage',
      'Status',
      'Faculty Feedback',
      'Evaluated Date',
    ];
    const rows = filteredReviewMarks.map((m) => {
      const maxM = m.reviewId?.maxMarks || 20;
      const pct = Math.round((m.marks / maxM) * 100);
      return [
        `"${m.groupId?.code || 'N/A'}"`,
        `"${m.groupId?.name || 'N/A'}"`,
        `"${m.facultyId?.name || 'Faculty'}"`,
        `"${m.facultyId?.email || ''}"`,
        `"${m.studentId?.name || 'Student'}"`,
        `"${m.studentId?.enrollmentNumber || 'N/A'}"`,
        `"${m.studentId?.email || ''}"`,
        `"${m.reviewId?.title || 'Review'}"`,
        `"${m.reviewId?.type || 'Review'}"`,
        m.marks,
        maxM,
        `"${pct}%"`,
        `"${m.status || 'SUBMITTED'}"`,
        `"${(m.feedback || '').replace(/"/g, '""')}"`,
        `"${m.createdAt ? new Date(m.createdAt).toLocaleDateString() : ''}"`,
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = `Faculty_Group_Evaluation_Marks_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export Rubric Engine Marks to CSV
  const downloadRubricCSV = () => {
    if (!rubricMarkRecords || rubricMarkRecords.length === 0) {
      alert('No mark records available to download.');
      return;
    }
    const headers = ['Student Name', 'Enrollment No', 'Project Title', 'Group Code', 'Review Stage', 'Total Score (100)', 'Grade', 'Evaluator'];
    const rows = rubricMarkRecords.map((m) => [
      `"${m.studentId?.name || 'Student'}"`,
      `"${m.studentId?.enrollmentNumber || 'N/A'}"`,
      `"${m.projectId?.title || 'N/A'}"`,
      `"${m.projectId?.groupId?.code || m.projectId?.groupId?.name || 'N/A'}"`,
      `"${m.reviewStage || 'N/A'}"`,
      m.totalMarksObtained || 0,
      `"${m.grade || 'N/A'}"`,
      `"${m.evaluatorId?.name || 'Faculty'}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = `Department_Rubric_Marks_Report_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openCriteriaModal = (c = null) => {
    if (c) {
      setEditingCriteria(c);
      setCName(c.name || '');
      setCWeight(c.weightagePercentage || 25);
      setCDesc(c.description || '');
    } else {
      setEditingCriteria(null);
      setCName('');
      setCWeight(25);
      setCDesc('');
    }
    setIsCriteriaModal(true);
  };

  const openMarkModal = (rec = null) => {
    if (rec) {
      setEditingMarkRecord(rec);
      setMProject(rec.projectId?._id || rec.projectId || '');
      setMStudent(rec.studentId?._id || rec.studentId || '');
      setMStage(rec.reviewStage || 'REVIEW_1');
      setMFeedback(rec.feedback || '');

      const initialScores = {};
      (rec.criteriaScores || []).forEach((cs) => {
        initialScores[cs.criteriaId] = cs.marksObtained;
      });
      setMScores(initialScores);
    } else {
      setEditingMarkRecord(null);
      setMProject(proposals[0]?._id || '');
      setMStudent(proposals[0]?.groupId?.leaderId?._id || '');
      setMStage('REVIEW_1');
      setMFeedback('');
      setMScores({});
    }
    setIsMarkModal(true);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* HEADER */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Award className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Marks & Evaluation Hub</h1>
              <StatusBadge status="ACTIVE" customLabel={`${userRole} Oversight`} />
            </div>
            <p className="text-sm text-slate-500 mt-1">
              View marks submitted by faculty to project groups, inspect review score sheets, and manage institutional evaluation rubrics.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {activeTab === 'FACULTY_REVIEWS' ? (
            <button
              onClick={downloadFacultyReviewCSV}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center space-x-1.5 transition"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Export Group Marks (CSV)</span>
            </button>
          ) : activeTab === 'RUBRICS' ? (
            <button
              onClick={() => openCriteriaModal(null)}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center space-x-1.5 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add Evaluation Criteria</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={downloadRubricCSV}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center space-x-1.5 transition"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>Export Rubric Report</span>
              </button>
              <button
                onClick={() => openMarkModal(null)}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center space-x-1.5 transition"
              >
                <GraduationCap className="w-4 h-4" />
                <span>Enter Marks</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex border-b border-slate-200 bg-white px-4 rounded-xl shadow-xs">
        <button
          onClick={() => setActiveTab('FACULTY_REVIEWS')}
          className={`py-3.5 px-5 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'FACULTY_REVIEWS'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Award className="w-4 h-4" />
          Faculty Review Marks (Group-wise) ({reviewMarks.length})
        </button>
        <button
          onClick={() => setActiveTab('RUBRICS')}
          className={`py-3.5 px-5 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'RUBRICS'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          Evaluation Criteria & Rubrics ({criteria.length})
        </button>
        <button
          onClick={() => setActiveTab('RUBRIC_MARKS')}
          className={`py-3.5 px-5 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'RUBRIC_MARKS'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          Rubric Engine Records ({rubricMarkRecords.length})
        </button>
      </div>

      {/* ============================================================ */}
      {/* TAB 1: FACULTY REVIEW MARKS (GROUP-WISE OVERSIGHT)            */}
      {/* ============================================================ */}
      {activeTab === 'FACULTY_REVIEWS' && (
        <div className="space-y-6">
          {/* METRIC KPI TILES */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <CheckCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Evaluations</p>
                <p className="text-xl font-black text-slate-800">{filteredReviewMarks.length}</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Groups Graded</p>
                <p className="text-xl font-black text-slate-800">{uniqueGroupsGraded}</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Average Score</p>
                <p className="text-xl font-black text-slate-800">{avgPercentage}%</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Faculty Evaluators</p>
                <p className="text-xl font-black text-slate-800">{uniqueFacultyEvaluators}</p>
              </div>
            </div>
          </div>

          {/* FILTERS TOOLBAR */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            <div className="flex flex-wrap items-center gap-3 flex-1">
              {/* Search Bar */}
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search student, roll, group, faculty..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Review Filter */}
              <select
                value={selectedReviewFilter}
                onChange={(e) => setSelectedReviewFilter(e.target.value)}
                className="border border-slate-200 rounded-lg text-xs font-semibold px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="ALL">All Review Events ({reviews.length})</option>
                {reviews.map((r) => (
                  <option key={r._id || r.id} value={r._id || r.id}>
                    {r.title} ({r.type || 'Review'})
                  </option>
                ))}
              </select>

              {/* Group Filter */}
              <select
                value={selectedGroupFilter}
                onChange={(e) => setSelectedGroupFilter(e.target.value)}
                className="border border-slate-200 rounded-lg text-xs font-semibold px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 max-w-[220px]"
              >
                <option value="ALL">All Groups ({groups.length})</option>
                {groups.map((g) => (
                  <option key={g._id || g.id} value={g._id || g.id}>
                    {g.code ? `[${g.code}] ` : ''}{g.name}
                  </option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="border border-slate-200 rounded-lg text-xs font-semibold px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="ALL">All Status</option>
                <option value="SUBMITTED">Submitted Only</option>
                <option value="DRAFT">Draft Only</option>
              </select>
            </div>

            <div className="text-xs font-bold text-slate-500 text-right">
              Showing {filteredReviewMarks.length} evaluation records
            </div>
          </div>

          {/* FACULTY GROUP MARKS TABLE */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            {filteredReviewMarks.length === 0 ? (
              <div className="py-16 text-center text-slate-500">
                <Award className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h4 className="text-base font-bold text-slate-700">No Review Marks Found</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                  No evaluation records match your current filter settings. When faculty submit marks in the Reviews Desk, they will appear here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">Group Code & Title</th>
                      <th className="px-4 py-3">Faculty Evaluator</th>
                      <th className="px-4 py-3">Student Name</th>
                      <th className="px-4 py-3">Enrollment No</th>
                      <th className="px-4 py-3">Review Event</th>
                      <th className="px-4 py-3">Marks Awarded</th>
                      <th className="px-4 py-3">Faculty Feedback</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredReviewMarks.map((m) => {
                      const maxMarks = m.reviewId?.maxMarks || 20;
                      const percentage = Math.round((m.marks / maxMarks) * 100);

                      return (
                        <tr key={m._id || m.id} className="hover:bg-slate-50/70 transition">
                          {/* Group Code & Title */}
                          <td className="px-4 py-3">
                            <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded text-[11px] border border-blue-200 mr-1.5">
                              {m.groupId?.code || 'GRP'}
                            </span>
                            <span className="font-semibold text-slate-800">{m.groupId?.name || 'Project Group'}</span>
                          </td>

                          {/* Faculty Evaluator */}
                          <td className="px-4 py-3">
                            <div className="font-semibold text-slate-900">{m.facultyId?.name || 'Faculty Guide'}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{m.facultyId?.email || ''}</div>
                          </td>

                          {/* Student Name */}
                          <td className="px-4 py-3 font-semibold text-slate-800">
                            {m.studentId?.name || 'Student'}
                          </td>

                          {/* Enrollment Number */}
                          <td className="px-4 py-3 font-mono text-slate-500">
                            {m.studentId?.enrollmentNumber || 'N/A'}
                          </td>

                          {/* Review Event */}
                          <td className="px-4 py-3">
                            <div className="font-bold text-slate-800">{m.reviewId?.title || 'Review'}</div>
                            <div className="text-[10px] text-slate-500">{m.reviewId?.type || 'Review'}</div>
                          </td>

                          {/* Marks Awarded */}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-mono font-bold text-slate-900">{m.marks}</span>
                              <span className="text-slate-400 font-normal">/ {maxMarks}</span>
                              <span
                                className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                                  percentage >= 75
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : percentage >= 50
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-rose-100 text-rose-800'
                                }`}
                              >
                                {percentage}%
                              </span>
                            </div>
                          </td>

                          {/* Feedback */}
                          <td className="px-4 py-3 text-slate-600 italic max-w-xs truncate" title={m.feedback || 'No feedback'}>
                            {m.feedback ? `"${m.feedback}"` : <span className="text-slate-400 not-italic">No feedback</span>}
                          </td>

                          {/* Status */}
                          <td className="px-4 py-3">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                m.status === 'SUBMITTED'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {m.status || 'SUBMITTED'}
                            </span>
                          </td>

                          {/* Date */}
                          <td className="px-4 py-3 text-right font-mono text-[10px] text-slate-400">
                            {m.createdAt ? new Date(m.createdAt).toLocaleDateString() : 'N/A'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 2: EVALUATION RUBRICS                                    */}
      {/* ============================================================ */}
      {activeTab === 'RUBRICS' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Department Rubrics</h3>
            <span
              className={`text-xs font-mono font-bold px-2.5 py-1 rounded-full ${
                totalWeightage === 100 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}
            >
              Total Weightage: {totalWeightage}% {totalWeightage === 100 ? '(Valid)' : '(Target: 100%)'}
            </span>
          </div>

          {criteria.length === 0 ? (
            <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-500 text-sm">
              No evaluation rubrics configured yet. Click "Add Rubric" to define evaluation criteria.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {criteria.map((c) => (
                <div key={c._id || c.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 relative group">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-slate-900 text-sm">{c.name}</h4>
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-800 font-mono font-bold text-xs rounded">
                        {c.weightagePercentage}%
                      </span>
                      <button
                        onClick={() => openCriteriaModal(c)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 rounded bg-white border border-slate-200"
                        title="Edit Rubric"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete rubric "${c.name}"?`)) deleteCriteriaMutation.mutate(c._id || c.id);
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded bg-white border border-slate-200"
                        title="Delete Rubric"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{c.description || 'No description provided.'}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 3: RUBRIC ENGINE STUDENT MARKS                           */}
      {/* ============================================================ */}
      {activeTab === 'RUBRIC_MARKS' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Student Rubric Records</h3>
            <span className="text-xs font-bold text-slate-500">{rubricMarkRecords.length} records</span>
          </div>

          {rubricMarkRecords.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-500 text-sm">
              <Award className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="font-bold text-slate-700">No Rubric Records Found</p>
              <p className="text-xs text-slate-400 mt-1">Click "Enter Marks" to score students against criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Student Name</th>
                    <th className="px-4 py-3">Enrollment</th>
                    <th className="px-4 py-3">Project / Group</th>
                    <th className="px-4 py-3">Stage</th>
                    <th className="px-4 py-3">Total Score</th>
                    <th className="px-4 py-3">Grade</th>
                    <th className="px-4 py-3">Evaluator</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rubricMarkRecords.map((m) => (
                    <tr key={m._id || m.id} className="hover:bg-slate-50 transition">
                      <td className="px-4 py-3 font-semibold text-slate-800">{m.studentId?.name || 'Student'}</td>
                      <td className="px-4 py-3 font-mono text-slate-500">{m.studentId?.enrollmentNumber || 'N/A'}</td>
                      <td className="px-4 py-3 text-slate-600">
                        <div className="font-semibold text-slate-800">{m.projectId?.title || 'Project'}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{m.projectId?.groupId?.code || ''}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-bold rounded">
                          {m.reviewStage}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-slate-900 text-sm">
                        {m.totalMarksObtained} / 100
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                            m.grade === 'A+' || m.grade === 'A'
                              ? 'bg-emerald-100 text-emerald-800'
                              : m.grade === 'B+' || m.grade === 'B'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {m.grade || 'A'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{m.evaluatorId?.name || 'Evaluator'}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => openMarkModal(m)}
                          className="px-3 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 rounded-lg text-xs font-semibold inline-flex items-center gap-1"
                        >
                          <Edit2 className="w-3.5 h-3.5" /> Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Criteria Modal */}
      {isCriteriaModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">{editingCriteria ? 'Edit Rubric Criteria' : 'Add Evaluation Rubric Criteria'}</h3>
              <button onClick={() => setIsCriteriaModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (cName) saveCriteriaMutation.mutate({ name: cName, weightagePercentage: Number(cWeight), description: cDesc });
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
                  placeholder="e.g. System Architecture & Code"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500"
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
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Description</label>
                <textarea
                  rows="3"
                  value={cDesc}
                  onChange={(e) => setCDesc(e.target.value)}
                  placeholder="Rubric grading guidelines..."
                  className="w-full p-3 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500"
                ></textarea>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setIsCriteriaModal(false)} className="px-4 py-2 text-slate-600 text-xs font-medium">Cancel</button>
                <button type="submit" disabled={saveCriteriaMutation.isPending} className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs">
                  {saveCriteriaMutation.isPending ? 'Saving...' : 'Save Rubric'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Enter / Edit Marks Modal (Rubrics) */}
      {isMarkModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">{editingMarkRecord ? 'Edit Student Marks' : 'Enter Student Marks'}</h3>
              <button onClick={() => setIsMarkModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const criteriaScores = criteria.map((c) => ({
                  criteriaId: c._id || c.id,
                  criteriaName: c.name,
                  weightagePercentage: c.weightagePercentage,
                  marksObtained: Number(mScores[c._id || c.id] || 0),
                  maxMarks: 100,
                }));

                submitMarksMutation.mutate({
                  projectId: mProject,
                  studentId: mStudent,
                  reviewStage: mStage,
                  criteriaScores,
                  feedback: mFeedback,
                });
              }}
              className="space-y-4 mt-4"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Select Project / Group *</label>
                <select
                  value={mProject}
                  onChange={(e) => setMProject(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold"
                  required
                >
                  {proposals.map((p) => (
                    <option key={p._id || p.id} value={p._id || p.id}>
                      {p.projectKey} - {p.title} ({p.groupId?.name || 'Group'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Review Stage</label>
                <select
                  value={mStage}
                  onChange={(e) => setMStage(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold"
                >
                  <option value="REVIEW_1">Review 1 (Proposal)</option>
                  <option value="REVIEW_2">Review 2 (Mid-Term)</option>
                  <option value="REVIEW_3">Review 3 (Testing)</option>
                  <option value="FINAL_VIVA">Final Viva</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-2">Criteria Marks Breakdown (0-100 per criteria)</label>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {criteria.map((c) => (
                    <div key={c._id || c.id} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                      <div>
                        <span className="font-bold text-xs text-slate-800">{c.name}</span>
                        <span className="block text-[10px] text-slate-500 font-mono">Weight: {c.weightagePercentage}%</span>
                      </div>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        required
                        value={mScores[c._id || c.id] || ''}
                        onChange={(e) => setMScores({ ...mScores, [c._id || c.id]: e.target.value })}
                        placeholder="Marks"
                        className="w-20 px-2 py-1 bg-white border border-slate-300 rounded text-xs font-mono font-bold text-right"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Feedback & Notes</label>
                <textarea
                  rows="2"
                  value={mFeedback}
                  onChange={(e) => setMFeedback(e.target.value)}
                  placeholder="Feedback for the student..."
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                ></textarea>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setIsMarkModal(false)} className="px-4 py-2 text-slate-600 text-xs font-medium">Cancel</button>
                <button type="submit" disabled={submitMarksMutation.isPending} className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs">
                  {submitMarksMutation.isPending ? 'Saving...' : 'Save Student Marks'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoordinatorMarksPage;

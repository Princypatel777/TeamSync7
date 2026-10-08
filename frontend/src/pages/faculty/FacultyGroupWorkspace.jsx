import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import API from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import {
  LayoutDashboard,
  Users,
  FolderGit2,
  Kanban,
  FileCode,
  Github,
  Calendar,
  Award,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  X,
  Clock,
  Send,
  ExternalLink,
} from 'lucide-react';

import StudentKanbanPage from '../student/StudentKanbanPage';
import StudentFilesPage from '../student/StudentFilesPage';
import StudentGithubPage from '../student/StudentGithubPage';
import FacultyProposalsPage from './FacultyProposalsPage';

const NoProjectEmptyState = () => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mb-4 text-amber-500">
      <AlertCircle className="w-8 h-8" />
    </div>
    <h2 className="text-lg font-bold text-slate-800">No Active Project</h2>
    <p className="text-slate-500 text-sm max-w-md mt-2">
      This group has not yet finalized and started a project. They must submit a proposal and get it approved before this module unlocks.
    </p>
  </div>
);

export const FacultyGroupWorkspace = () => {
  const { groupId } = useParams();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedStudentProfile, setSelectedStudentProfile] = useState(null);

  // Quick evaluation state inside workspace
  const [evalMarks, setEvalMarks] = useState({});
  const [evalFeedback, setEvalFeedback] = useState({});
  const [evalStage, setEvalStage] = useState('REVIEW_1');

  const { data: groupData, isLoading, error } = useQuery({
    queryKey: ['facultyGroupContext', groupId],
    queryFn: async () => {
      const res = await API.get(`/faculty/groups/${groupId}`);
      return res.data;
    },
  });

  const submitEvalMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await API.post('/evaluation/marks', payload);
      return res.data;
    },
    onSuccess: () => {
      alert('Student evaluation saved successfully!');
      queryClient.invalidateQueries(['facultyGroupContext', groupId]);
    },
    onError: (err) => {
      alert(err.response?.data?.message || 'Failed to submit marks');
    },
  });

  if (isLoading) return <LoadingSpinner text="Loading Group Workspace..." />;
  if (error) {
    return (
      <div className="p-8 text-center bg-white rounded-xl shadow-xs border border-rose-200 text-rose-600 max-w-lg mx-auto mt-10">
        <h3 className="font-bold text-lg mb-2">Access Denied</h3>
        <p>You are not assigned as a guide to this group or the group does not exist.</p>
        <Link to="/faculty/dashboard" className="text-blue-600 hover:underline mt-4 inline-block font-semibold">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const group = groupData?.group || {};
  const project = groupData?.project || null;
  const taskSummary = groupData?.taskSummary || { total: 0, done: 0 };
  const filesCount = groupData?.filesCount || 0;
  const github = groupData?.github || null;
  const latestEvaluation = groupData?.latestEvaluation || null;
  const reviews = groupData?.reviews || [];

  const progressPercent = taskSummary.total > 0
    ? Math.round((taskSummary.done / taskSummary.total) * 100)
    : 0;

  // The 8 Academic Sections required:
  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'project', label: 'Project', icon: FolderGit2 },
    { id: 'tasks', label: 'Tasks / Kanban', icon: Kanban },
    { id: 'files', label: 'Files', icon: FileCode },
    { id: 'github', label: 'GitHub', icon: Github },
    { id: 'reviews', label: 'Reviews', icon: Calendar },
    { id: 'marks', label: 'Marks & Feedback', icon: Award },
  ];

  const handleSaveStudentMark = (studentId) => {
    if (!project?._id) {
      alert('An approved project is required to record marks.');
      return;
    }
    const marksValue = Number(evalMarks[studentId] || 0);
    const feedbackValue = evalFeedback[studentId] || '';

    submitEvalMutation.mutate({
      projectId: project._id,
      studentId,
      reviewStage: evalStage,
      totalMarksObtained: marksValue,
      grade: marksValue >= 85 ? 'A+' : marksValue >= 75 ? 'A' : marksValue >= 60 ? 'B+' : 'B',
      feedback: feedbackValue,
      criteriaScores: [
        { criteriaName: 'Project Progress', weightagePercentage: 25, marksObtained: Math.round(marksValue * 0.25), maxMarks: 25 },
        { criteriaName: 'Technical Contribution', weightagePercentage: 25, marksObtained: Math.round(marksValue * 0.25), maxMarks: 25 },
        { criteriaName: 'Documentation & Code Quality', weightagePercentage: 25, marksObtained: Math.round(marksValue * 0.25), maxMarks: 25 },
        { criteriaName: 'Presentation & Teamwork', weightagePercentage: 25, marksObtained: Math.round(marksValue * 0.25), maxMarks: 25 },
      ],
    });
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 space-y-4">
      {/* Workspace Header */}
      <div className="bg-white px-6 py-4 border-b border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sticky top-0 z-10">
        <div className="flex items-center space-x-4">
          <Link
            to="/faculty/dashboard"
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors"
            title="Back to Faculty Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center space-x-3 mb-1">
              <span className="font-mono font-bold text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                {group?.name || group?.code || groupId}
              </span>
              <StatusBadge status={group?.status || 'ACTIVE'} />
              <span className="text-xs text-slate-400">
                Cycle: {group?.sgpCycleId?.name || 'SGP'}
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-800">
              {project?.title || 'No Approved Project'}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold px-2.5 py-1 rounded bg-blue-50 text-blue-700 border border-blue-200">
            Faculty Monitoring Mode
          </span>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6 px-6 pb-6">
        {/* Navigation Sidebar: 8 Academic Sections */}
        <div className="w-full md:w-60 shrink-0 bg-white border border-slate-200 rounded-xl p-3 shadow-xs self-start">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-white' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white border border-slate-200 rounded-xl p-6 shadow-xs min-h-[550px]">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Group Project Overview</h2>
                <p className="text-slate-500 text-sm mt-0.5">
                  Academic summary and progress metrics for {group.name || group.code}.
                </p>
              </div>

              {/* Top Metrics Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="text-xs font-bold text-slate-400 uppercase">Students</div>
                  <div className="text-2xl font-bold text-slate-800 mt-1">
                    {group.members?.length || 0}
                  </div>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="text-xs font-bold text-slate-400 uppercase">Tasks Progress</div>
                  <div className="text-2xl font-bold text-blue-600 mt-1">
                    {progressPercent}%
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {taskSummary.done} / {taskSummary.total} completed
                  </div>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="text-xs font-bold text-slate-400 uppercase">Shared Files</div>
                  <div className="text-2xl font-bold text-slate-800 mt-1">
                    {filesCount}
                  </div>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="text-xs font-bold text-slate-400 uppercase">GitHub Repo</div>
                  <div className="text-sm font-bold text-slate-800 mt-2 truncate">
                    {github ? (
                      <span className="text-emerald-600">Connected</span>
                    ) : (
                      <span className="text-slate-400">Not Linked</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Project Card */}
              {project && (
                <div className="p-5 bg-blue-50/50 border border-blue-100 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-800 uppercase tracking-wider">
                      Active Project Definition
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                      {project.status}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{project.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {project.description || 'No detailed description provided by the student group.'}
                  </p>
                </div>
              )}

              {/* Latest Evaluation Summary */}
              <div className="p-5 bg-slate-50 rounded-xl border border-slate-200">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Latest Evaluation Status
                </h4>
                {latestEvaluation ? (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="font-bold text-slate-800 text-sm">
                        {latestEvaluation.reviewStage}: Grade {latestEvaluation.grade} ({latestEvaluation.totalMarksObtained} pts)
                      </span>
                      <p className="text-xs text-slate-500 mt-0.5 italic">
                        Feedback: "{latestEvaluation.feedback || 'None'}"
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveTab('marks')}
                      className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold transition"
                    >
                      Update Evaluation
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">No evaluation recorded for this cycle yet.</span>
                    <button
                      onClick={() => setActiveTab('marks')}
                      className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold transition"
                    >
                      Conduct Evaluation
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: STUDENTS */}
          {activeTab === 'students' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Assigned Students</h2>
                <p className="text-slate-500 text-sm mt-0.5">
                  Group members collaborating on this academic project.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {group.members?.map((m) => {
                  const memberUser = m.userId || {};
                  return (
                    <div
                      key={m._id}
                      onClick={() => setSelectedStudentProfile(m)}
                      className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex items-center space-x-4 cursor-pointer hover:border-blue-400 hover:shadow-md transition-all group"
                    >
                      <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        {memberUser.name?.charAt(0) || 'S'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-slate-800 truncate group-hover:text-blue-700 transition-colors">
                          {memberUser.name || 'Student Member'}
                        </h3>
                        <p className="text-xs text-slate-500 truncate">{memberUser.email}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded uppercase">
                            {m.role || 'MEMBER'}
                          </span>
                          {memberUser.enrollmentNumber && (
                            <span className="text-[10px] font-mono px-2 py-0.5 bg-blue-50 text-blue-600 rounded font-semibold">
                              {memberUser.enrollmentNumber}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: PROJECT */}
          {activeTab === 'project' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Project Proposal & Specifications</h2>
                <p className="text-slate-500 text-sm mt-0.5">
                  Review student project proposal, objectives, and approval lifecycle.
                </p>
              </div>
              <FacultyProposalsPage specificGroupId={groupId} />
            </div>
          )}

          {/* TAB 4: TASKS / KANBAN */}
          {activeTab === 'tasks' && (
            project ? (
              <StudentKanbanPage
                facultyMode={true}
                specificProjectId={project._id}
                membersList={group.members}
              />
            ) : (
              <NoProjectEmptyState />
            )
          )}

          {/* TAB 5: FILES */}
          {activeTab === 'files' && (
            <StudentFilesPage
              facultyMode={true}
              specificProjectId={project?._id}
              specificGroupId={groupId}
            />
          )}

          {/* TAB 6: GITHUB */}
          {activeTab === 'github' && (
            project ? (
              <StudentGithubPage
                facultyMode={true}
                specificProjectId={project._id}
              />
            ) : (
              <NoProjectEmptyState />
            )
          )}

          {/* TAB 7: REVIEWS */}
          {activeTab === 'reviews' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Academic Reviews & Milestones</h2>
                <p className="text-slate-500 text-sm mt-0.5">
                  Scheduled review checkpoints and defense dates for this group.
                </p>
              </div>

              {reviews.length === 0 ? (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center">
                  <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <h4 className="font-bold text-slate-700">No Specific Reviews Scheduled</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Coordinator will schedule Review 1, Review 2, and Final Viva milestones.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {reviews.map((r) => (
                    <div
                      key={r._id}
                      className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs flex items-center justify-between"
                    >
                      <div>
                        <h4 className="font-bold text-slate-800">{r.title || 'SGP Review'}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Date: {new Date(r.reviewDate).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="text-xs font-bold px-2.5 py-1 rounded bg-blue-50 text-blue-700">
                        {r.status || 'SCHEDULED'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 8: MARKS & FEEDBACK */}
          {activeTab === 'marks' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Evaluation, Marks & Feedback</h2>
                  <p className="text-slate-500 text-sm mt-0.5">
                    Evaluate individual students using multi-criteria rubric scoring.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs font-semibold text-slate-600">Review Stage:</label>
                  <select
                    value={evalStage}
                    onChange={(e) => setEvalStage(e.target.value)}
                    className="border border-slate-300 rounded-lg text-xs font-bold px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="REVIEW_1">Review 1 (Progress)</option>
                    <option value="REVIEW_2">Review 2 (Implementation)</option>
                    <option value="REVIEW_3">Review 3 (Testing & Demo)</option>
                    <option value="FINAL_VIVA">Final Viva Examination</option>
                  </select>
                </div>
              </div>

              {/* Rubric explanation */}
              <div className="p-4 bg-purple-50/60 border border-purple-100 rounded-xl text-xs text-purple-900 space-y-1">
                <span className="font-bold uppercase tracking-wider block">Evaluation Criteria Rubric (100 Pts Total):</span>
                <p>• Technical Contribution (25 pts) • Project Progress (25 pts) • Code Quality & Documentation (25 pts) • Presentation & Teamwork (25 pts)</p>
              </div>

              {/* Students Evaluation Form */}
              <div className="space-y-4">
                {group.members?.map((m) => {
                  const memberUser = m.userId || {};
                  return (
                    <div
                      key={m._id}
                      className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-slate-900 text-base">
                            {memberUser.name || 'Student'}
                          </h4>
                          <span className="text-xs font-mono text-slate-500">
                            {memberUser.enrollmentNumber || memberUser.email}
                          </span>
                        </div>
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 uppercase">
                          {m.role || 'MEMBER'}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        <div>
                          <label className="text-xs font-semibold text-slate-700 block mb-1">
                            Total Marks (out of 100):
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            placeholder="e.g. 88"
                            value={evalMarks[memberUser._id] || ''}
                            onChange={(e) =>
                              setEvalMarks({ ...evalMarks, [memberUser._id]: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-slate-700 block mb-1">
                            Faculty Feedback & Comments:
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Good progress on DICOM parser. Needs better unit test coverage."
                            value={evalFeedback[memberUser._id] || ''}
                            onChange={(e) =>
                              setEvalFeedback({ ...evalFeedback, [memberUser._id]: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end pt-2">
                        <button
                          onClick={() => handleSaveStudentMark(memberUser._id)}
                          disabled={submitEvalMutation.isPending}
                          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg transition-colors shadow-xs inline-flex items-center gap-1.5"
                        >
                          <Send className="w-3.5 h-3.5" />
                          Save Marks for {memberUser.name?.split(' ')[0] || 'Student'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Student Profile Modal */}
      {selectedStudentProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative">
            <button
              onClick={() => setSelectedStudentProfile(null)}
              className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="h-20 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
            <div className="px-6 pb-6 text-center -mt-10">
              <div className="w-20 h-20 bg-white border-4 border-white rounded-full flex items-center justify-center mx-auto shadow-sm">
                <div className="w-full h-full bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl font-bold">
                  {selectedStudentProfile.userId?.name?.charAt(0) || 'S'}
                </div>
              </div>
              <h3 className="text-lg font-bold text-slate-800 mt-2">
                {selectedStudentProfile.userId?.name}
              </h3>
              <p className="text-xs font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded inline-block mt-1">
                {selectedStudentProfile.userId?.enrollmentNumber || 'N/A'}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {selectedStudentProfile.userId?.email}
              </p>
              <button
                onClick={() => setSelectedStudentProfile(null)}
                className="w-full mt-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyGroupWorkspace;

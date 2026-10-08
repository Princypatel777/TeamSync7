import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Users, BookOpen, AlertCircle, Clock, ChevronRight } from 'lucide-react';

export const FacultyDashboardPage = () => {
  const navigate = useNavigate();
  const { data, isLoading, error } = useQuery({
    queryKey: ['facultyGroupsSummary'],
    queryFn: async () => {
      const res = await API.get('/faculty/groups');
      return res.data;
    }
  });

  if (isLoading) return <LoadingSpinner text="Loading Faculty Dashboard..." />;
  if (error) return <div className="p-8 text-rose-500 font-bold">Failed to load groups. Make sure you are assigned by the Coordinator.</div>;

  const { summary = {}, groups = [] } = data;

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-8">
      {/* Welcome Banner */}
      <div className="bg-slate-900 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-10">
          <BookOpen className="w-48 h-48" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Faculty Guide Dashboard</h1>
        <p className="text-slate-300 text-sm max-w-xl">
          Welcome back. You are currently managing {summary.totalGroups} groups. Select a group below to enter its workspace and monitor proposals, requirements, tasks, and code.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-3">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Users className="w-5 h-5" /></div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Assigned Groups</p>
            <p className="text-xl font-bold text-slate-800">{summary.totalGroups || 0}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-3">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><BookOpen className="w-5 h-5" /></div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Pending Proposals</p>
            <p className="text-xl font-bold text-slate-800">{summary.pendingProposals || 0}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-3">
          <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><Clock className="w-5 h-5" /></div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Pending Reviews</p>
            <p className="text-xl font-bold text-slate-800">{summary.pendingReviews || 0}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-3">
          <div className="p-2 bg-rose-50 text-rose-600 rounded-lg"><AlertCircle className="w-5 h-5" /></div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Overdue Tasks</p>
            <p className="text-xl font-bold text-slate-800">{summary.overdueTasks || 0}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-3">
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><BookOpen className="w-5 h-5" /></div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Upcoming Evals</p>
            <p className="text-xl font-bold text-slate-800">{summary.upcomingEvaluations || 0}</p>
          </div>
        </div>
      </div>

      {/* My Assigned Groups */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-800">My Assigned Groups</h2>
        </div>
        
        {groups.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-700">No Groups Assigned</h3>
            <p className="text-slate-500 text-sm mt-1">You have not been assigned as a guide to any project groups by the Department Coordinator yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group) => (
              <div key={group._id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                <div className="p-5 flex-1 space-y-3">
                  {/* Group Header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800 text-base block">
                        {group.name || `Group ${group.code}`}
                      </span>
                      <span className="text-xs font-mono text-slate-400">
                        Code: {group.code}
                      </span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      group.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {group.status}
                    </span>
                  </div>
                  
                  {/* Project Title */}
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Project</span>
                    <h4 className="text-sm font-bold text-slate-900 line-clamp-1" title={group.activeProject ? group.activeProject.title : 'No Approved Project'}>
                      {group.activeProject ? group.activeProject.title : 'No Approved Project'}
                    </h4>
                  </div>
                  
                  {/* Students & Tasks Metrics */}
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <div className="font-bold text-slate-800">{group.studentCount || 0}</div>
                      <div className="text-[10px] text-slate-400 uppercase">Students</div>
                    </div>
                    <div className="bg-amber-50/60 p-2 rounded-lg border border-amber-100">
                      <div className="font-bold text-amber-700">{group.pendingTasksCount || 0}</div>
                      <div className="text-[10px] text-amber-600 uppercase">Pending</div>
                    </div>
                    <div className="bg-emerald-50/60 p-2 rounded-lg border border-emerald-100">
                      <div className="font-bold text-emerald-700">{group.completedTasksCount || 0}</div>
                      <div className="text-[10px] text-emerald-600 uppercase">Completed</div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-semibold text-slate-500">
                      <span>Overall Progress</span>
                      <span className="font-bold text-blue-600">{group.progress || 0}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${group.progress || 0}%` }}
                      />
                    </div>
                  </div>

                  {/* Upcoming Deadlines */}
                  {group.upcomingDeadlines && group.upcomingDeadlines.length > 0 && (
                    <div className="text-xs p-2.5 bg-rose-50/60 border border-rose-100 rounded-lg">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 block mb-1">
                        Upcoming Deadline:
                      </span>
                      <div className="flex items-center justify-between text-slate-700 font-medium">
                        <span className="truncate">{group.upcomingDeadlines[0].title}</span>
                        <span className="text-[10px] font-bold text-rose-600 ml-2 shrink-0">
                          {new Date(group.upcomingDeadlines[0].dueDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Latest Review / Evaluation */}
                  <div className="pt-2 border-t border-slate-100 text-xs">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                      Latest Evaluation:
                    </span>
                    {group.latestEvaluation ? (
                      <div className="flex items-center justify-between font-medium">
                        <span className="text-slate-700">{group.latestEvaluation.reviewStage}</span>
                        <span className="font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                          {group.latestEvaluation.totalMarksObtained} pts ({group.latestEvaluation.grade})
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">No evaluation conducted yet</span>
                    )}
                  </div>
                </div>
                
                <div className="p-3 border-t border-slate-100 bg-slate-50">
                  <button
                    onClick={() => {
                      navigate(`/faculty/group/${group._id}`);
                    }}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-xs"
                  >
                    <span>Open Group Workspace</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FacultyDashboardPage;

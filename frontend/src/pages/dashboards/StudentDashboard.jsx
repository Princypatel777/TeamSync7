import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../store/authStore';
import API from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  Users,
  CheckSquare,
  FolderGit2,
  Activity,
  Clock,
  Calendar,
  Award,
  UserCheck,
  FileCode,
  Github,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const StudentDashboard = () => {
  const { user } = useAuthStore();

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['studentDashboard'],
    queryFn: async () => {
      const res = await API.get('/student/dashboard');
      return res.data;
    },
  });

  if (isLoading) return <LoadingSpinner text="Loading student academic dashboard..." />;

  const data = dashboardData || {};
  const hasGroup = Boolean(data.hasGroup);
  const group = data.group || null;
  const mentor = data.mentor || null;
  const project = data.project || null;
  const tasks = data.tasks || { pending: 0, inProgress: 0, completed: 0, total: 0 };
  const deadlines = data.deadlines || [];
  const latestEvaluation = data.latestEvaluation || null;
  const progress = data.progress || { overall: 0, tasks: 0 };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <span className="px-2.5 py-1 text-xs font-semibold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 rounded-full border border-indigo-500/30">
              Academic SGP
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Cycle: {group?.sgpCycle || 'Current Semester'}
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight mt-2 text-white">
            Welcome back, {user?.name || 'Student'} 👋
          </h1>
          <p className="text-sm text-slate-300 mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
            <span>Enrollment: <strong className="font-mono text-white">{user?.enrollmentNumber || 'N/A'}</strong></span>
            <span>•</span>
            <span>Dept: <strong className="text-white">{group?.department || 'Information Technology'}</strong></span>
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            to="/student/group"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm inline-flex items-center gap-1.5"
          >
            <Users className="w-3.5 h-3.5" />
            My Group
          </Link>
          <Link
            to="/student/kanban"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors border border-slate-700 inline-flex items-center gap-1.5"
          >
            <CheckSquare className="w-3.5 h-3.5" />
            Tasks Board
          </Link>
        </div>
      </div>

      {/* 4 Core Summary Cards answering the key questions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Which group & mentor */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">My Group</span>
              <Users className="w-4 h-4 text-indigo-600" />
            </div>
            {hasGroup ? (
              <>
                <div className="text-base font-bold text-slate-800 truncate" title={group?.name}>
                  {group?.name || 'Group ' + (group?.code || '')}
                </div>
                <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                  <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 font-semibold">{group?.code}</span>
                  <span>{group?.membersCount || 1} members</span>
                </div>
              </>
            ) : (
              <>
                <div className="text-sm font-semibold text-rose-600">No Group Yet</div>
                <div className="text-xs text-slate-500 mt-1">Create or join a group via code</div>
              </>
            )}
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 text-xs">
            <span className="text-slate-400 block mb-0.5">Faculty Mentor:</span>
            {mentor ? (
              <span className="font-semibold text-slate-800 flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                {mentor.name}
              </span>
            ) : (
              <span className="text-amber-600 font-medium flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> Pending Allocation
              </span>
            )}
          </div>
        </div>

        {/* Card 2: What is my project */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">My Project</span>
              <FolderGit2 className="w-4 h-4 text-blue-600" />
            </div>
            {project ? (
              <>
                <div className="text-base font-bold text-slate-800 line-clamp-2" title={project.title}>
                  {project.title}
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                    project.status === 'APPROVED' || project.status === 'DEVELOPMENT_ACTIVE'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    {project.status}
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className="text-sm font-semibold text-slate-700">No Active Project</div>
                <div className="text-xs text-slate-500 mt-1">Submit proposal to begin</div>
              </>
            )}
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 text-xs">
            <Link to="/student/proposal" className="text-blue-600 font-medium hover:underline inline-flex items-center gap-1">
              View project details <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Card 3: Tasks assigned to me */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Tasks Assigned</span>
              <CheckSquare className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="grid grid-cols-3 gap-2 mt-2 text-center">
              <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                <div className="text-lg font-bold text-slate-800">{tasks.pending || 0}</div>
                <div className="text-[10px] text-slate-500 uppercase font-medium">Pending</div>
              </div>
              <div className="bg-amber-50 p-2 rounded-lg border border-amber-100">
                <div className="text-lg font-bold text-amber-700">{tasks.inProgress || 0}</div>
                <div className="text-[10px] text-amber-700 uppercase font-medium">In Prog</div>
              </div>
              <div className="bg-emerald-50 p-2 rounded-lg border border-emerald-100">
                <div className="text-lg font-bold text-emerald-700">{tasks.completed || 0}</div>
                <div className="text-[10px] text-emerald-700 uppercase font-medium">Done</div>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 text-xs">
            <Link to="/student/kanban" className="text-emerald-600 font-medium hover:underline inline-flex items-center gap-1">
              Go to Kanban board <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Card 4: Latest Evaluation / Marks */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Latest Marks</span>
              <Award className="w-4 h-4 text-purple-600" />
            </div>
            {latestEvaluation ? (
              <>
                <div className="flex items-baseline justify-between">
                  <div className="text-2xl font-extrabold text-slate-900">
                    {latestEvaluation.totalMarks}
                    <span className="text-xs font-normal text-slate-500 ml-1">
                      {latestEvaluation.maxMarks ? `/ ${latestEvaluation.maxMarks}` : 'pts'}
                    </span>
                  </div>
                  {latestEvaluation.grade && (
                    <span className="px-2 py-0.5 text-xs font-bold rounded-md bg-purple-100 text-purple-800 border border-purple-200">
                      Grade {latestEvaluation.grade}
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-600 font-medium mt-1 truncate">
                  {latestEvaluation.stage || 'SGP Review'}
                </div>
              </>
            ) : (
              <>
                <div className="text-sm font-semibold text-slate-700">No Evaluation Yet</div>
                <div className="text-xs text-slate-400 mt-1">Evaluations will appear after reviews</div>
              </>
            )}
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 text-xs">
            <Link to="/student/reviews" className="text-purple-600 font-medium hover:underline inline-flex items-center gap-1">
              View all reviews & marks <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Main 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Project Progress */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-600" />
                  Project Progress Overview
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Calculated based on group tasks completed vs total backlog items
                </p>
              </div>
              <span className="text-lg font-extrabold text-blue-600">
                {progress.overall || 0}%
              </span>
            </div>

            <div className="w-full bg-slate-100 rounded-full h-3 mb-6 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-600 to-indigo-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${progress.overall || 0}%` }}
              ></div>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-2 border-t border-slate-100">
              <div className="text-center p-3 rounded-lg bg-slate-50">
                <div className="text-xs font-semibold text-slate-500 uppercase">Tasks Completed</div>
                <div className="text-lg font-bold text-slate-800 mt-1">
                  {tasks.completed || 0} / {tasks.total || 0}
                </div>
              </div>
              <div className="text-center p-3 rounded-lg bg-slate-50">
                <div className="text-xs font-semibold text-slate-500 uppercase">Pending Tasks</div>
                <div className="text-lg font-bold text-amber-700 mt-1">
                  {tasks.pending + tasks.inProgress}
                </div>
              </div>
              <div className="text-center p-3 rounded-lg bg-slate-50">
                <div className="text-xs font-semibold text-slate-500 uppercase">Mentor Status</div>
                <div className="text-xs font-bold text-slate-800 mt-2 truncate">
                  {mentor ? mentor.name : 'Unassigned'}
                </div>
              </div>
            </div>
          </div>

          {/* Latest Evaluation & Feedback Details */}
          {latestEvaluation && (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-purple-600" />
                  <h3 className="text-base font-bold text-slate-800">
                    Latest Evaluation: {latestEvaluation.stage}
                  </h3>
                </div>
                <span className="text-xs text-slate-400">
                  Evaluated by: <strong className="text-slate-700">{latestEvaluation.evaluatorName}</strong>
                </span>
              </div>

              {latestEvaluation.feedback && (
                <div className="bg-purple-50/60 border border-purple-100 rounded-lg p-4 mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-800 block mb-1">
                    Faculty Mentor Feedback:
                  </span>
                  <p className="text-sm text-purple-950 italic">
                    "{latestEvaluation.feedback}"
                  </p>
                </div>
              )}

              {latestEvaluation.criteriaScores && latestEvaluation.criteriaScores.length > 0 && (
                <div className="space-y-2 mt-3">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Criteria-Wise Breakdown
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                    {latestEvaluation.criteriaScores.map((c, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-xs">
                        <span className="text-slate-700 font-medium">{c.criteriaName || 'Criterion'}</span>
                        <span className="font-bold text-slate-900 font-mono">
                          {c.marksObtained} / {c.maxMarks || 20}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Quick Academic Workspace Hub */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">
              Academic Project Workspace Links
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Link
                to="/student/group"
                className="p-3 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-xl transition text-center group"
              >
                <Users className="w-5 h-5 mx-auto text-slate-600 group-hover:text-indigo-600 mb-1" />
                <span className="text-xs font-semibold text-slate-700 group-hover:text-indigo-900 block">My Group</span>
              </Link>
              <Link
                to="/student/kanban"
                className="p-3 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 rounded-xl transition text-center group"
              >
                <CheckSquare className="w-5 h-5 mx-auto text-slate-600 group-hover:text-emerald-600 mb-1" />
                <span className="text-xs font-semibold text-slate-700 group-hover:text-emerald-900 block">Kanban Tasks</span>
              </Link>
              <Link
                to="/student/files"
                className="p-3 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 rounded-xl transition text-center group"
              >
                <FileCode className="w-5 h-5 mx-auto text-slate-600 group-hover:text-blue-600 mb-1" />
                <span className="text-xs font-semibold text-slate-700 group-hover:text-blue-900 block">Project Files</span>
              </Link>
              <Link
                to="/student/github"
                className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 rounded-xl transition text-center group"
              >
                <Github className="w-5 h-5 mx-auto text-slate-600 group-hover:text-slate-900 mb-1" />
                <span className="text-xs font-semibold text-slate-700 group-hover:text-slate-900 block">GitHub Sync</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column (1 span): Upcoming Deadlines & Group Members */}
        <div className="space-y-6">
          {/* Upcoming Deadlines */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
            <h3 className="text-base font-bold text-slate-800 flex items-center mb-4">
              <Clock className="w-4 h-4 mr-2 text-rose-500" />
              Upcoming Deadlines
            </h3>

            {deadlines.length > 0 ? (
              <div className="space-y-3">
                {deadlines.map((deadline, index) => (
                  <div
                    key={deadline.id || index}
                    className="flex items-start p-3 bg-slate-50 rounded-lg border border-slate-100 hover:border-slate-300 transition-colors"
                  >
                    <div
                      className={`mt-1 w-2.5 h-2.5 rounded-full mr-3 shrink-0 ${
                        deadline.urgency === 'high'
                          ? 'bg-rose-500'
                          : deadline.urgency === 'medium'
                          ? 'bg-amber-500'
                          : 'bg-blue-500'
                      }`}
                    ></div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-slate-800 truncate">
                        {deadline.title}
                      </div>
                      <div className="text-xs text-slate-500 mt-1 flex items-center justify-between">
                        <span className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          Due: {deadline.due}
                        </span>
                        {deadline.type === 'REVIEW' && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-700">
                            Review
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-slate-400">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-400 opacity-60" />
                <p className="text-xs font-medium">No pending deadlines close by!</p>
              </div>
            )}
          </div>

          {/* Academic Reminder Card */}
          <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-900 mb-2">
              SGP Evaluation Guideline
            </h4>
            <p className="text-xs text-blue-800 leading-relaxed">
              Faculty mentors evaluate individual contribution based on commit frequency, task delivery on Kanban, and attendance during milestone review stages.
            </p>
            <div className="mt-3 pt-3 border-t border-blue-200/60 flex items-center justify-between text-xs font-semibold text-blue-900">
              <span>Reviews & Marks:</span>
              <Link to="/student/reviews" className="underline hover:text-blue-700">Check Marks Desk</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;

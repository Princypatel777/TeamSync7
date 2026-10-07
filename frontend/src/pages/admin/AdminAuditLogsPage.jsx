import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import API from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  ShieldCheck,
  Clock,
  User,
  Terminal,
  Search,
  Filter,
  Trash2,
  Download,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  AlertCircle,
  FileCode,
  Activity,
  CheckCircle2,
} from 'lucide-react';

export const AdminAuditLogsPage = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAction, setSelectedAction] = useState('ALL');
  const [expandedLogId, setExpandedLogId] = useState(null);

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['adminAuditLogs', selectedAction, searchTerm],
    queryFn: async () => {
      const params = { limit: 100 };
      if (selectedAction !== 'ALL') params.action = selectedAction;
      if (searchTerm.trim()) params.search = searchTerm.trim();
      const res = await API.get('/platform/audit-logs', { params });
      return res.data;
    },
  });

  const deleteLogMutation = useMutation({
    mutationFn: async (logId) => {
      const res = await API.delete(`/platform/audit-logs/${logId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['adminAuditLogs']);
    },
    onError: (err) => {
      alert(err.response?.data?.detail || 'Failed to delete audit log entry.');
    },
  });

  if (isLoading) return <LoadingSpinner text="Loading System Audit Logs..." />;

  const logs = data?.logs || [];

  // Distinct actions for dropdown
  const actionTypes = [
    'ALL',
    'USER_LOGIN',
    'USER_LOGOUT',
    'NOTIFICATION_BROADCAST',
    'USER_CREATED',
    'USER_UPDATED',
    'USER_DELETED',
    'GROUP_CREATED',
    'GROUP_MEMBER_INVITED',
    'GROUP_INVITE_ACCEPTED',
    'GROUP_MEMBER_LEFT',
    'GROUP_JOINED_BY_CODE',
    'DEPARTMENT_CREATED',
    'EVALUATION_CRITERIA_CREATED',
  ];

  const getActionBadgeColor = (action) => {
    if (action.includes('LOGIN')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (action.includes('LOGOUT')) return 'bg-slate-100 text-slate-700 border-slate-200';
    if (action.includes('DELETED')) return 'bg-rose-50 text-rose-700 border-rose-200';
    if (action.includes('BROADCAST')) return 'bg-purple-50 text-purple-700 border-purple-200';
    if (action.includes('CREATED')) return 'bg-blue-50 text-blue-700 border-blue-200';
    return 'bg-amber-50 text-amber-700 border-amber-200';
  };

  const downloadCSV = () => {
    if (logs.length === 0) {
      alert('No audit logs to export.');
      return;
    }
    const headers = ['Action', 'Actor Name', 'Actor Role', 'IP Address', 'Target Entity', 'Target ID', 'Timestamp', 'Details'];
    const rows = logs.map((log) => [
      `"${log.action || ''}"`,
      `"${log.actorName || log.actor_name || log.userId?.name || 'System'}"`,
      `"${log.actorRole || log.actor_role || 'ADMIN'}"`,
      `"${log.ipAddress || log.ip_address || '127.0.0.1'}"`,
      `"${log.targetEntity || log.target_entity || ''}"`,
      `"${log.targetId || log.target_id || ''}"`,
      `"${log.createdAt || log.created_at ? new Date(log.createdAt || log.created_at).toLocaleString() : ''}"`,
      `"${JSON.stringify(log.details || {}).replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = `System_Audit_Trail_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* HEADER */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-slate-900 text-white rounded-xl shadow-xs">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold text-slate-800 tracking-tight">System Audit Trail & Security Logs</h1>
              <StatusBadge status="ACTIVE" customLabel="Security Enforcement" />
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Immutable forensic log tracking all user authentication, role broadcasts, group changes, and administrative actions.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg transition"
            title="Refresh Logs"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={downloadCSV}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center space-x-1.5 transition"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Export Logs (CSV)</span>
          </button>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto flex-1">
          {/* Search Input */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search actor, action, target entity, or IP..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-slate-500"
            />
          </div>

          {/* Action Filter */}
          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="border border-slate-200 rounded-lg text-xs font-semibold px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-slate-500"
          >
            {actionTypes.map((act) => (
              <option key={act} value={act}>
                {act === 'ALL' ? 'All System Actions' : act.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs font-bold text-slate-500">
          Showing {logs.length} audit entries
        </div>
      </div>

      {/* AUDIT LOGS LIST */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {logs.length === 0 ? (
          <div className="py-16 text-center text-slate-500">
            <Activity className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h4 className="text-base font-bold text-slate-700">No Audit Records Found</h4>
            <p className="text-xs text-slate-400 mt-1">
              No security or administrative activity matches your current search criteria.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {logs.map((log) => {
              const logId = log._id || log.id;
              const isExpanded = expandedLogId === logId;
              const actorName = log.actorName || log.actor_name || log.userId?.name || 'System';
              const actorRole = log.actorRole || log.actor_role || log.userId?.role || 'SYSTEM';
              const targetEntity = log.targetEntity || log.target_entity || 'System';
              const targetId = log.targetId || log.target_id || '';
              const ipAddress = log.ipAddress || log.ip_address || '127.0.0.1';
              const createdAt = log.createdAt || log.created_at;

              return (
                <div key={logId} className="p-4 hover:bg-slate-50/70 transition-colors">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center space-x-2.5 flex-wrap">
                        <span
                          className={`px-2.5 py-0.5 font-mono text-[10px] font-bold rounded-full border ${getActionBadgeColor(
                            log.action || ''
                          )}`}
                        >
                          {log.action}
                        </span>
                        <span className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          {actorName}
                        </span>
                        <span className="px-1.5 py-0.2 bg-slate-100 text-slate-600 font-mono text-[10px] rounded uppercase font-semibold">
                          {actorRole}
                        </span>
                      </div>

                      <div className="text-xs text-slate-500 font-mono flex items-center gap-2 flex-wrap">
                        <span>IP: <b className="text-slate-700">{ipAddress}</b></span>
                        <span>•</span>
                        <span>
                          Target: <b className="text-slate-700">{targetEntity}</b> {targetId && `(${targetId})`}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 shrink-0">
                      <span className="text-xs font-mono text-slate-400">
                        {createdAt ? new Date(createdAt).toLocaleString() : 'N/A'}
                      </span>

                      {/* Expand Details Button */}
                      {log.details && Object.keys(log.details).length > 0 && (
                        <button
                          type="button"
                          onClick={() => setExpandedLogId(isExpanded ? null : logId)}
                          className="p-1.5 text-slate-500 hover:text-slate-800 rounded bg-slate-100 hover:bg-slate-200 transition text-xs flex items-center gap-1 font-semibold"
                          title="View Payload Details"
                        >
                          <FileCode className="w-3.5 h-3.5" />
                          <span>{isExpanded ? 'Hide' : 'Details'}</span>
                          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                      )}

                      {/* Delete Log Button */}
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Delete audit log record for "${log.action}"?`)) {
                            deleteLogMutation.mutate(logId);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition"
                        title="Delete Log Entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Expandable JSON Details */}
                  {isExpanded && log.details && (
                    <div className="mt-3 p-3 bg-slate-900 text-slate-200 rounded-lg text-xs font-mono overflow-x-auto shadow-inner">
                      <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">
                        Payload Parameters & Metadata
                      </div>
                      <pre className="text-[11px] leading-relaxed">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAuditLogsPage;

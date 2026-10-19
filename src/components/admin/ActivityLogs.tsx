import React, { useState } from 'react';
import { ActivityLog } from '../../types';
import { History, Search, Filter } from 'lucide-react';
import { Badge } from '../common/Badge';

interface ActivityLogsProps {
  logs: ActivityLog[];
}

export const ActivityLogs: React.FC<ActivityLogsProps> = ({ logs }) => {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  const filtered = logs.filter(log => {
    const matchesSearch =
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.details.toLowerCase().includes(search.toLowerCase()) ||
      log.adminName.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (filterType !== 'all' && log.targetType !== filterType) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Administrative Activity Logs</h1>
        <p className="text-sm text-gray-600 mt-1">
          Immutable audit trail of administrative modifications, reviews, credential issuances, and security events.
        </p>
      </div>

      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search action logs..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009166]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-semibold text-gray-500">Filter Event:</span>
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="text-xs bg-white border border-gray-300 rounded-lg px-3 py-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#009166]"
          >
            <option value="all">All Events ({logs.length})</option>
            <option value="submission">Submission Reviews</option>
            <option value="certificate">Certificates</option>
            <option value="intern">Intern Accounts</option>
            <option value="course">Curriculum & Courses</option>
            <option value="announcement">Announcements</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#FAF9F6] border-b border-gray-200 text-xs uppercase font-bold text-gray-500">
              <tr>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">Administrator</th>
                <th className="px-6 py-4">Action</th>
                <th className="px-6 py-4">Event Details</th>
                <th className="px-6 py-4">Category</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                    No matching activity logs found.
                  </td>
                </tr>
              ) : (
                filtered.map(log => (
                  <tr key={log.id} className="hover:bg-gray-50/60 transition text-xs">
                    <td className="px-6 py-4 font-mono text-gray-500 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>

                    <td className="px-6 py-4 font-semibold text-gray-900 whitespace-nowrap">
                      {log.adminName}
                    </td>

                    <td className="px-6 py-4 font-bold text-[#009166]">
                      {log.action}
                    </td>

                    <td className="px-6 py-4 text-gray-700 leading-relaxed max-w-md">
                      {log.details}
                    </td>

                    <td className="px-6 py-4">
                      <span className="capitalize font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded text-[11px]">
                        {log.targetType}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

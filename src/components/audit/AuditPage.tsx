import { useState, useEffect } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { Search, Filter, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { auditService, type AuditLog } from '../../services/auditService';

type PageSize = 25 | 50 | 100 | 'all';

export function AuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
  const [displayedLogs, setDisplayedLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    actionType: '',
    entityType: '',
    userId: '',
    startDate: '',
    endDate: ''
  });

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<PageSize>(25);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadLogs();
  }, []);

  useEffect(() => {
    filterLogs();
  }, [logs, searchTerm, filters]);

  useEffect(() => {
    updateDisplayedLogs();
  }, [filteredLogs, currentPage, pageSize]);

  const loadLogs = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await auditService.getLogs();
      setLogs(data);
    } catch (err) {
      setError('Failed to load audit logs');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const filterLogs = () => {
    let filtered = [...logs];

    // Apply search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(log => 
        log.formatted_details?.toLowerCase().includes(search) ||
        log.user_email?.toLowerCase().includes(search) ||
        log.entity_type?.toLowerCase().includes(search)
      );
    }

    // Apply other filters
    if (filters.actionType) {
      filtered = filtered.filter(log => log.action_type === filters.actionType);
    }
    if (filters.entityType) {
      filtered = filtered.filter(log => log.entity_type === filters.entityType);
    }
    if (filters.userId) {
      filtered = filtered.filter(log => log.user_id === filters.userId);
    }
    if (filters.startDate) {
      filtered = filtered.filter(log => log.created_at >= filters.startDate);
    }
    if (filters.endDate) {
      filtered = filtered.filter(log => log.created_at <= filters.endDate);
    }

    setFilteredLogs(filtered);
    setCurrentPage(1);
    setTotalPages(Math.ceil(filtered.length / (pageSize === 'all' ? filtered.length : pageSize)));
  };

  const updateDisplayedLogs = () => {
    if (pageSize === 'all') {
      setDisplayedLogs(filteredLogs);
      return;
    }

    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    setDisplayedLogs(filteredLogs.slice(startIndex, endIndex));
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (newSize: PageSize) => {
    setPageSize(newSize);
    setCurrentPage(1);
    setTotalPages(Math.ceil(filteredLogs.length / (newSize === 'all' ? filteredLogs.length : newSize)));
  };

  const exportLogs = () => {
    const csv = [
      ['Date', 'User', 'Action', 'Entity Type', 'Details'].join(','),
      ...filteredLogs.map(log => [
        format(new Date(log.created_at), 'yyyy-MM-dd HH:mm:ss'),
        log.user_email,
        log.action_type,
        log.entity_type,
        `"${log.formatted_details?.replace(/"/g, '""')}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `audit_logs_${format(new Date(), 'yyyy-MM-dd_HHmmss')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getActionTypeColor = (actionType: string) => {
    switch (actionType) {
      case 'CREATE': return 'bg-green-500/10 text-green-400';
      case 'UPDATE': return 'bg-blue-500/10 text-blue-400';
      case 'DELETE': return 'bg-red-500/10 text-red-400';
      case 'LOGIN': return 'bg-purple-500/10 text-purple-400';
      case 'LOGOUT': return 'bg-orange-500/10 text-orange-400';
      case 'BACKUP': return 'bg-teal-500/10 text-teal-400';
      case 'RESTORE': return 'bg-indigo-500/10 text-indigo-400';
      case 'AUTO_DISTRIBUTE': return 'bg-amber-500/10 text-amber-400';
      default: return 'bg-gray-500/10 text-gray-400';
    }
  };

  const getEntityTypeDisplay = (entityType: string) => {
    const displayNames: Record<string, string> = {
      'VEHICLE': 'Vehicle',
      'VEHICLE_EXPENSE': 'Vehicle Expense',
      'PROFIT_DISTRIBUTION': 'Profit Distribution',
      'TRANSACTION': 'Transaction',
      'CATEGORY': 'Category',
      'USER': 'User',
      'SETTINGS': 'Settings',
      'GLOBAL_SETTINGS': 'Global Settings',
      'BACKUP': 'Backup',
      'SYSTEM': 'System'
    };
    return displayNames[entityType] || entityType;
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const formattedDate = format(date, 'MMM d, yyyy h:mm a');
    const timeAgo = formatDistanceToNow(date, { addSuffix: true });
    return (
      <div className="flex flex-col">
        <span>{formattedDate}</span>
        <span className="text-xs text-text-secondary">{timeAgo}</span>
      </div>
    );
  };

  const formatDetails = (details: string) => {
    // Format timestamps
    let formattedDetails = details.replace(
      /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+\+\d{2}:\d{2}/g,
      (match) => format(new Date(match), 'MMM d, yyyy h:mm a')
    );

    // Format vehicle info
    formattedDetails = formattedDetails.replace(
      /Auto-distributed profit for vehicle ID: [a-f0-9-]+/g,
      'Auto-distributed profit for vehicle'
    );

    return formattedDetails;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-text-primary">Audit Logs</h1>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search logs..."
              className="w-full px-4 py-2 pl-10 pr-4 bg-background border border-gray-700 rounded-lg text-text-primary placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-text-secondary" />
          </div>

          <button
            onClick={() => exportLogs()}
            className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
          >
            <Download className="w-5 h-5" />
            Export
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <select
          value={filters.actionType}
          onChange={(e) => setFilters(prev => ({ ...prev, actionType: e.target.value }))}
          className="px-3 py-2 bg-background border border-gray-700 rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50"
        >
          <option value="">All Actions</option>
          <option value="CREATE">Create</option>
          <option value="UPDATE">Update</option>
          <option value="DELETE">Delete</option>
          <option value="LOGIN">Login</option>
          <option value="LOGOUT">Logout</option>
          <option value="BACKUP">Backup</option>
          <option value="RESTORE">Restore</option>
          <option value="AUTO_DISTRIBUTE">Auto Distribute</option>
        </select>

        <select
          value={filters.entityType}
          onChange={(e) => setFilters(prev => ({ ...prev, entityType: e.target.value }))}
          className="px-3 py-2 bg-background border border-gray-700 rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50"
        >
          <option value="">All Entities</option>
          <option value="VEHICLE">Vehicle</option>
          <option value="VEHICLE_EXPENSE">Vehicle Expense</option>
          <option value="PROFIT_DISTRIBUTION">Profit Distribution</option>
          <option value="TRANSACTION">Transaction</option>
          <option value="CATEGORY">Category</option>
          <option value="USER">User</option>
          <option value="SETTINGS">Settings</option>
          <option value="GLOBAL_SETTINGS">Global Settings</option>
          <option value="BACKUP">Backup</option>
          <option value="SYSTEM">System</option>
        </select>

        <input
          type="date"
          value={filters.startDate}
          onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
          className="px-3 py-2 bg-background border border-gray-700 rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50"
        />

        <input
          type="date"
          value={filters.endDate}
          onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
          className="px-3 py-2 bg-background border border-gray-700 rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50"
        />
      </div>

      <div className="bg-card rounded-lg border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-background">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Date</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">User</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Action</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Entity</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {displayedLogs.map((log) => (
                <tr key={log.id} className="hover:bg-background/50 transition-colors">
                  <td className="px-4 py-2 text-sm text-text-primary whitespace-nowrap">
                    {formatTimestamp(log.created_at)}
                  </td>
                  <td className="px-4 py-2 text-sm text-text-primary">
                    {log.user_email}
                  </td>
                  <td className="px-4 py-2 text-sm">
                    <span className={`px-2 py-0.5 text-xs rounded-full ${getActionTypeColor(log.action_type)}`}>
                      {log.action_type}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-sm text-text-primary">
                    {getEntityTypeDisplay(log.entity_type)}
                  </td>
                  <td className="px-4 py-2 text-sm text-text-primary">
                    {formatDetails(log.formatted_details || '')}
                  </td>
                </tr>
              ))}
              {displayedLogs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-text-secondary">
                    No audit logs found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-card p-4 rounded-lg border border-gray-800">
        <div className="flex items-center gap-2">
          <span className="text-sm text-text-secondary">
            Showing {displayedLogs.length} of {filteredLogs.length} logs
          </span>
          <select
            value={pageSize.toString()}
            onChange={(e) => handlePageSizeChange(e.target.value === 'all' ? 'all' : Number(e.target.value) as PageSize)}
            className="px-2 py-1 bg-background border border-gray-700 rounded text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50"
          >
            <option value="25">25 per page</option>
            <option value="50">50 per page</option>
            <option value="100">100 per page</option>
            <option value="all">Show all</option>
          </select>
        </div>

        {pageSize !== 'all' && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-1 text-text-secondary hover:text-accent disabled:opacity-50 disabled:hover:text-text-secondary"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-1 rounded ${
                    currentPage === page
                      ? 'bg-accent text-white'
                      : 'text-text-secondary hover:bg-background'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-1 text-text-secondary hover:text-accent disabled:opacity-50 disabled:hover:text-text-secondary"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Plus, Car, DollarSign, FileText, FileSpreadsheet, Filter, Search, Edit2, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { vehicleService, type Vehicle, type VehicleFinancials } from '../../services/vehicleService';
import { VehicleModal } from './VehicleModal';
import { settingsService } from '../../services/settingsService';

type PageSize = 25 | 50 | 100 | 'all';
type SortField = 'date' | 'status' | 'purchase_price' | 'sale_price' | 'net_profit';
type SortDirection = 'asc' | 'desc';

export function VehicleList() {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState<VehicleFinancials[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<VehicleFinancials[]>([]);
  const [displayedVehicles, setDisplayedVehicles] = useState<VehicleFinancials[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'AVAILABLE' | 'SOLD'>('AVAILABLE');
  const [exchangeRate, setExchangeRate] = useState(3.6725);
  const [vehicleStats, setVehicleStats] = useState({
    totalValue: 0,
    availableCount: 0,
    totalCount: 0
  });

  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<PageSize>(25);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    Promise.all([
      loadVehicles(),
      loadGlobalSettings()
    ]).finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    filterVehicles();
  }, [vehicles, searchTerm, statusFilter, sortField, sortDirection]);

  useEffect(() => {
    updateDisplayedVehicles();
  }, [filteredVehicles, currentPage, pageSize]);

  useEffect(() => {
    updateVehicleStats();
  }, [vehicles]);

  const loadGlobalSettings = async () => {
    try {
      const settings = await settingsService.getSettings();
      if (settings?.exchange_rate) {
        setExchangeRate(settings.exchange_rate);
      }
    } catch (error) {
      console.error('Error loading global settings:', error);
    }
  };

  const updateVehicleStats = () => {
    const availableVehicles = vehicles.filter(v => v.status === 'AVAILABLE');
    setVehicleStats({
      totalValue: availableVehicles.reduce((sum, v) => sum + v.purchase_price, 0),
      availableCount: availableVehicles.length,
      totalCount: vehicles.length
    });
  };

  const convertToUSD = (aedAmount: number) => {
    return aedAmount / exchangeRate;
  };

  const loadVehicles = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await vehicleService.getVehicleFinancials();
      const sortedVehicles = data.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setVehicles(sortedVehicles);
    } catch (err) {
      setError('Failed to load vehicles');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const filterVehicles = () => {
    let filtered = [...vehicles];

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(vehicle => 
        vehicle.make.toLowerCase().includes(search) ||
        vehicle.model.toLowerCase().includes(search) ||
        vehicle.vin?.toLowerCase().includes(search) ||
        vehicle.year.toString().includes(search)
      );
    }

    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(vehicle => vehicle.status === statusFilter);
    }

    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case 'date':
          comparison = new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        case 'purchase_price':
          comparison = a.purchase_price - b.purchase_price;
          break;
        case 'sale_price':
          comparison = (a.sale_price || 0) - (b.sale_price || 0);
          break;
        case 'net_profit':
          comparison = a.net_profit - b.net_profit;
          break;
        default:
          comparison = 0;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    setFilteredVehicles(filtered);
    setCurrentPage(1);
    setTotalPages(Math.ceil(filtered.length / (pageSize === 'all' ? filtered.length : pageSize)));
  };

  const updateDisplayedVehicles = () => {
    if (pageSize === 'all') {
      setDisplayedVehicles(filteredVehicles);
      return;
    }

    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    setDisplayedVehicles(filteredVehicles.slice(startIndex, endIndex));
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (newSize: PageSize) => {
    setPageSize(newSize);
    setCurrentPage(1);
    setTotalPages(Math.ceil(filteredVehicles.length / (newSize === 'all' ? filteredVehicles.length : newSize)));
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleDelete = async (vehicleId: string) => {
    if (!window.confirm('Are you sure you want to delete this vehicle?')) return;

    try {
      setError(null);
      await vehicleService.deleteVehicle(vehicleId);
      await loadVehicles();
    } catch (err) {
      setError('Failed to delete vehicle');
      console.error(err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return 'bg-green-500/10 text-green-400';
      case 'SOLD': return 'bg-blue-500/10 text-blue-400';
      default: return 'bg-gray-500/10 text-gray-400';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="bg-card p-6 rounded-lg border border-gray-800">
        <div className="flex items-center gap-3 mb-4">
          <Car className="h-6 w-6 text-accent" />
          <h2 className="text-xl font-bold text-text-primary">Assets</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <p className="text-sm text-text-secondary mb-2">Total Value</p>
            <div>
              <p className="text-lg font-bold text-text-primary">
                AED {vehicleStats.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-sm text-text-secondary">
                USD {convertToUSD(vehicleStats.totalValue).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
          <div>
            <p className="text-sm text-text-secondary mb-2">Vehicle Count</p>
            <div>
              <p className="text-lg font-bold text-text-primary">
                {vehicleStats.availableCount} / {vehicleStats.totalCount}
              </p>
              <p className="text-sm text-text-secondary">Available / Total</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-text-primary">Vehicles</h1>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search vehicles..."
              className="w-full px-4 py-2 pl-10 pr-4 bg-background border border-gray-700 rounded-lg text-text-primary placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-text-secondary" />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className="px-4 py-2 bg-background border border-gray-700 rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50"
          >
            <option value="ALL">All Status</option>
            <option value="AVAILABLE">Available</option>
            <option value="SOLD">Sold</option>
          </select>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Vehicle
          </button>
        </div>
      </div>

      <div className="bg-card rounded-lg border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-background">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Vehicle</th>
                <th 
                  className="px-4 py-2 text-left text-xs font-medium text-text-secondary uppercase tracking-wider cursor-pointer hover:text-accent"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center gap-2">
                    Status
                    {sortField === 'status' && (
                      <span className="text-accent">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th 
                  className="px-4 py-2 text-left text-xs font-medium text-text-secondary uppercase tracking-wider cursor-pointer hover:text-accent"
                  onClick={() => handleSort('purchase_price')}
                >
                  <div className="flex items-center gap-2">
                    Purchase Price
                    {sortField === 'purchase_price' && (
                      <span className="text-accent">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th 
                  className="px-4 py-2 text-left text-xs font-medium text-text-secondary uppercase tracking-wider cursor-pointer hover:text-accent"
                  onClick={() => handleSort('sale_price')}
                >
                  <div className="flex items-center gap-2">
                    Sale Price
                    {sortField === 'sale_price' && (
                      <span className="text-accent">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th 
                  className="px-4 py-2 text-left text-xs font-medium text-text-secondary uppercase tracking-wider cursor-pointer hover:text-accent"
                  onClick={() => handleSort('net_profit')}
                >
                  <div className="flex items-center gap-2">
                    Net Profit
                    {sortField === 'net_profit' && (
                      <span className="text-accent">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Expenses</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {displayedVehicles.map((vehicle) => (
                <tr 
                  key={vehicle.id}
                  onClick={() => navigate(`/vehicles/${vehicle.id}`)}
                  className="hover:bg-background/50 transition-colors cursor-pointer"
                >
                  <td className="px-4 py-2 whitespace-nowrap">
                    <div className="flex items-center">
                      <Car className="w-4 h-4 text-accent mr-2" />
                      <div>
                        <div className="text-sm font-medium text-text-primary">
                          {vehicle.make} {vehicle.model}
                        </div>
                        <div className="text-xs text-text-secondary">
                          {vehicle.year} • VIN: {vehicle.vin}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusColor(vehicle.status)}`}>
                      {vehicle.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-text-primary">
                    AED {vehicle.purchase_price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-text-primary">
                    {vehicle.sale_price ? (
                      `AED ${vehicle.sale_price.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                    ) : '-'}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm">
                    <span className={vehicle.net_profit >= 0 ? 'text-green-400' : 'text-red-400'}>
                      AED {vehicle.net_profit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-red-400">
                    AED {vehicle.total_expenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-right">
                    <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleDelete(vehicle.id)}
                        className="p-1 text-text-secondary hover:text-red-400 transition-colors"
                        title="Delete Vehicle"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-card p-4 rounded-lg border border-gray-800">
        <div className="flex items-center gap-2">
          <span className="text-sm text-text-secondary">
            Showing {displayedVehicles.length} of {filteredVehicles.length} vehicles
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

      {showAddModal && (
        <VehicleModal
          onClose={() => setShowAddModal(false)}
          onSave={async (vehicle) => {
            try {
              await vehicleService.createVehicle(vehicle);
              await loadVehicles();
              setShowAddModal(false);
            } catch (err) {
              console.error(err);
              setError('Failed to create vehicle');
            }
          }}
        />
      )}
    </div>
  );
}

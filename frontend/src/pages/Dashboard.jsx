import { useQuery } from '@tanstack/react-query';
import { Package, TrendingUp, AlertTriangle, DollarSign, Archive } from 'lucide-react';
import { inventoryAPI } from '@/services/api';

const Dashboard = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['inventory-stats'],
    queryFn: () => inventoryAPI.getStats().then(res => res.data),
  });

  const statCards = [
    {
      title: 'Total Items',
      value: stats?.totalItems || 0,
      icon: Package,
      color: '#00d4ff',
      trend: '+12%'
    },
    {
      title: 'Active Items',
      value: stats?.activeItems || 0,
      icon: TrendingUp,
      color: '#4caf50',
      trend: '+8%'
    },
    {
      title: 'Low Stock',
      value: stats?.lowStockItems || 0,
      icon: AlertTriangle,
      color: '#ff9800',
      trend: '-3%'
    },
    {
      title: 'Total Value',
      value: `$${(stats?.totalValue || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: '#b537f2',
      trend: '+18%'
    },
  ];

  return (
    <div className="space-y-8 fade-in">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold gradient-text mb-2">Dashboard</h1>
        <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
          Welcome to SmartShelf Manager
        </p>
      </div>

      {/* Stats Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="stat-card">
              <div className="loading-shimmer h-32 rounded"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div 
                key={index} 
                className="stat-card hover-lift"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div 
                    className="w-14 h-14 rounded-xl flex items-center justify-center"
                    style={{ 
                      background: `${stat.color}20`,
                      border: `1px solid ${stat.color}30`
                    }}
                  >
                    <Icon size={28} style={{ color: stat.color }} />
                  </div>
                  <span 
                    className="text-sm font-bold px-3 py-1 rounded-full"
                    style={{
                      background: stat.trend.startsWith('+') ? 'rgba(76, 175, 80, 0.2)' : 'rgba(244, 67, 54, 0.2)',
                      color: stat.trend.startsWith('+') ? 'var(--success)' : 'var(--error)',
                      border: `1px solid ${stat.trend.startsWith('+') ? 'rgba(76, 175, 80, 0.3)' : 'rgba(244, 67, 54, 0.3)'}`
                    }}
                  >
                    {stat.trend}
                  </span>
                </div>
                <div>
                  <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold text-white">
                    {stat.value}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="glass-card p-6">
          <h2 className="text-2xl font-bold text-white mb-6">Recent Activity</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-lg hover:bg-white/5 transition-all">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center">
                <Package size={20} className="text-white" />
              </div>
              <div className="flex-1">
                <p className="text-white font-medium">New inventory item added</p>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Product SKU-12345 • 2 minutes ago</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-4 rounded-lg hover:bg-white/5 transition-all">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Archive size={20} className="text-white" />
              </div>
              <div className="flex-1">
                <p className="text-white font-medium">Pallet updated</p>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Pallet PAL-001 • 15 minutes ago</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-4 rounded-lg hover:bg-white/5 transition-all">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-orange-500 flex items-center justify-center">
                <TrendingUp size={20} className="text-white" />
              </div>
              <div className="flex-1">
                <p className="text-white font-medium">Shopify sync completed</p>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>45 products synced • 1 hour ago</p>
              </div>
            </div>
          </div>
        </div>

        {/* Alerts */}
        <div className="glass-card p-6">
          <h2 className="text-2xl font-bold text-white mb-6">Alerts</h2>
          {stats?.lowStockItems > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-lg" style={{ background: 'rgba(255, 152, 0, 0.1)', border: '1px solid rgba(255, 152, 0, 0.3)' }}>
                <AlertTriangle size={24} style={{ color: 'var(--warning)' }} />
                <div>
                  <p className="font-medium" style={{ color: 'var(--warning)' }}>Low Stock Alert</p>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {stats.lowStockItems} {stats.lowStockItems === 1 ? 'item is' : 'items are'} running low on stock
                  </p>
                </div>
              </div>
              <button className="btn-primary w-full">
                View Low Stock Items
              </button>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-cyan-500 flex items-center justify-center mx-auto mb-4">
                <TrendingUp size={32} className="text-white" />
              </div>
              <p className="text-white font-medium mb-2">All Good!</p>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                No alerts at the moment
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button className="glass-card p-6 hover-lift text-left group">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Package size={24} className="text-white" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Add Item</h3>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Add new inventory item
          </p>
        </button>
        
        <button className="glass-card p-6 hover-lift text-left group">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Archive size={24} className="text-white" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Create Pallet</h3>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Create new storage pallet
          </p>
        </button>
        
        <button className="glass-card p-6 hover-lift text-left group">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-orange-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <TrendingUp size={24} className="text-white" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Sync Shopify</h3>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Sync products with Shopify
          </p>
        </button>
      </div>
    </div>
  );
};

export default Dashboard;

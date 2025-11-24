import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, Archive, FileText, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '@/utils/store';

const Layout = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    sessionStorage.removeItem('leautotech_jwt');
    navigate('/');
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Inventory', href: '/inventory', icon: Package },
    { name: 'Pallets', href: '/pallets', icon: Archive },
    { name: 'Logs', href: '/logs', icon: FileText },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:sticky top-0 left-0 h-screen w-64 glass-card
        transform transition-transform duration-300 ease-in-out z-50
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full p-6">
          {/* Logo */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <img 
                src="/logo.jpg" 
                alt="LeautoTech" 
                className="w-12 h-12 object-contain glow"
                style={{ filter: 'drop-shadow(0 0 15px rgba(181, 55, 242, 0.6))' }}
              />
              <div>
                <h1 className="text-xl font-bold gradient-text">SmartShelf</h1>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Manager</p>
              </div>
            </div>
            <button 
              className="lg:hidden btn-icon"
              onClick={() => setSidebarOpen(false)}
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                      isActive
                        ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-white'
                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                    }`
                  }
                  style={({ isActive }) => isActive ? {
                    boxShadow: '0 4px 20px rgba(181, 55, 242, 0.3)'
                  } : {}}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.name}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* User Info */}
          <div className="pt-6 border-t" style={{ borderColor: 'var(--glass-border)' }}>
            <div className="flex items-center gap-3 mb-4 p-3 rounded-lg" style={{ background: 'rgba(255, 255, 255, 0.03)' }}>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-white font-bold">
                {user?.email?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user?.email || 'User'}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Logged in</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full btn-secondary justify-center"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar (Mobile) */}
        <header className="lg:hidden glass-card p-4 flex items-center justify-between sticky top-0 z-30">
          <button 
            className="btn-icon"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={20} />
          </button>
          <h1 className="text-lg font-bold gradient-text">SmartShelf Manager</h1>
          <div className="w-10" /> {/* Spacer */}
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 lg:p-8">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="p-6 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
          <p>&copy; 2025 LeautoTech. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export default Layout;

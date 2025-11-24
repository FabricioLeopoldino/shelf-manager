import { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/utils/store';
import Layout from '@/components/Layout';
import Dashboard from '@/pages/Dashboard';
import Inventory from '@/pages/Inventory';
import Pallets from '@/pages/Pallets';
import Logs from '@/pages/Logs';
import NotFound from '@/pages/NotFound';

function App() {
  const { token, setToken } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Check for token in URL (from LeautoTech Portal redirect)
    const urlToken = searchParams.get('token');
    
    if (urlToken) {
      setToken(urlToken);
      // Remove token from URL
      navigate(window.location.pathname, { replace: true });
    } else if (!token) {
      // Check sessionStorage for token
      const storedToken = sessionStorage.getItem('leautotech_jwt');
      if (storedToken) {
        setToken(storedToken);
      }
    }
  }, [searchParams, token, setToken, navigate]);

  // If no token, show access denied
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-bg">
        <div className="card max-w-md text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold mb-2">Acesso Negado</h1>
          <p className="text-gray-400 mb-6">
            Você precisa fazer login através do LeautoTech Portal para acessar este sistema.
          </p>
          <a 
            href={import.meta.env.VITE_PORTAL_URL || '/'} 
            className="btn btn-primary inline-flex"
          >
            Ir para o Portal
          </a>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="pallets" element={<Pallets />} />
        <Route path="logs" element={<Logs />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;

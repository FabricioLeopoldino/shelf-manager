import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-primary-500 mb-4">404</h1>
        <h2 className="text-3xl font-bold mb-4">Página Não Encontrada</h2>
        <p className="text-gray-400 mb-8">
          A página que você está procurando não existe ou foi movida.
        </p>
        <button
          onClick={() => navigate('/dashboard')}
          className="btn btn-primary inline-flex"
        >
          <Home className="w-5 h-5" />
          Voltar ao Dashboard
        </button>
      </div>
    </div>
  );
};

export default NotFound;

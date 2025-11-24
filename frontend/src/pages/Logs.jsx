import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileText, Filter } from 'lucide-react';
import { logAPI } from '@/services/api';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Logs = () => {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    action: '',
    entityType: '',
    userEmail: '',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['logs', page, filters],
    queryFn: () => logAPI.getAll({ page, limit: 50, ...filters }).then(res => res.data),
  });

  const getActionColor = (action) => {
    if (action.includes('CREATE')) return 'text-green-400';
    if (action.includes('UPDATE') || action.includes('QUANTITY')) return 'text-blue-400';
    if (action.includes('DELETE')) return 'text-red-400';
    if (action.includes('SYNC')) return 'text-purple-400';
    return 'text-gray-400';
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Logs</h1>
          <p className="text-gray-400">Histórico de atividades do sistema</p>
        </div>
      </div>

      <div className="card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Ação</label>
            <select
              value={filters.action}
              onChange={(e) => setFilters({ ...filters, action: e.target.value })}
              className="input"
            >
              <option value="">Todas</option>
              <option value="CREATE">Criar</option>
              <option value="UPDATE">Atualizar</option>
              <option value="DELETE">Delete</option>
              <option value="QUANTITY_UPDATE">Atualizar Quantity</option>
              <option value="SHOPIFY_SYNC">Sincronizar Shopify</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Tipo de Entidade</label>
            <select
              value={filters.entityType}
              onChange={(e) => setFilters({ ...filters, entityType: e.target.value })}
              className="input"
            >
              <option value="">Todos</option>
              <option value="Item">Item</option>
              <option value="Pallet">Pallet</option>
              <option value="System">Sistema</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Email do Usuário</label>
            <input
              type="text"
              placeholder="Filter por email..."
              value={filters.userEmail}
              onChange={(e) => setFilters({ ...filters, userEmail: e.target.value })}
              className="input"
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="card">
          <div className="animate-pulse space-y-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="h-16 bg-dark-border rounded"></div>
            ))}
          </div>
        </div>
      ) : data?.logs?.length > 0 ? (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Data/Hora</th>
                  <th>Ação</th>
                  <th>Tipo</th>
                  <th>Usuário</th>
                  <th>Detalhes</th>
                </tr>
              </thead>
              <tbody>
                {data.logs.map((log) => (
                  <tr key={log.id} className="hover:bg-dark-border/50 transition-colors">
                    <td className="text-sm">{formatDate(log.createdAt)}</td>
                    <td>
                      <span className={`font-semibold ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-info">{log.entityType}</span>
                    </td>
                    <td className="text-sm">{log.userEmail}</td>
                    <td className="text-sm text-gray-400">
                      {log.entityId && (
                        <span className="font-mono">ID: {log.entityId.substring(0, 8)}...</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {data?.pagination && (
            <div className="flex items-center justify-between p-4 border-t border-dark-border">
              <p className="text-sm text-gray-400">
                Mostrando {data.logs.length} de {data.pagination.total} logs
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                <span className="px-4 py-2">
                  Página {page} de {data.pagination.totalPages}
                </span>
                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={page >= data.pagination.totalPages}
                  className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Próxima
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="card text-center py-12">
          <FileText className="w-16 h-16 mx-auto mb-4 text-gray-600" />
          <h3 className="text-xl font-semibold mb-2">No logs found</h3>
          <p className="text-gray-400">
            {Object.values(filters).some(f => f) 
              ? 'Tente ajustar os filtros' 
              : 'Nenhuma atividade registrada ainda'}
          </p>
        </div>
      )}
    </div>
  );
};

export default Logs;

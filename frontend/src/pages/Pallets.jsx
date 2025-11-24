import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Edit, Trash2, Layers } from 'lucide-react';
import { palletAPI } from '@/services/api';

const Pallets = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['pallets', page, search],
    queryFn: () => palletAPI.getAll({ page, limit: 20, search }).then(res => res.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => palletAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['pallets']);
      alert('Pallet deletado com sucesso!');
    },
    onErrorr: (error) => {
      alert('Error ao deletar pallet: ' + (error.response?.data?.error || error.message));
    },
  });

  const handleDelete = (id) => {
    if (confirm('Tem certeza que deseja deletar este pallet?')) {
      deleteMutation.mutate(id);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'badge-success';
      case 'in_use': return 'badge-info';
      case 'full': return 'badge-warning';
      case 'maintenance': return 'badge-danger';
      default: return 'badge-info';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'available': return 'Disponível';
      case 'in_use': return 'Em Uso';
      case 'full': return 'Cheio';
      case 'maintenance': return 'Manutenção';
      default: return status;
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Pallets</h1>
          <p className="text-gray-400">Gerencie seus pallets e localizações</p>
        </div>
        <button className="btn btn-primary">
          <Plus className="w-5 h-5" />
          Novo Pallet
        </button>
      </div>

      <div className="card mb-6">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search por número ou localização..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10"
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="card">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-dark-border rounded"></div>
            ))}
          </div>
        </div>
      ) : data?.pallets?.length > 0 ? (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Número</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Capacidade</th>
                  <th>Carga Atual</th>
                  <th>Itens</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.pallets.map((pallet) => (
                  <tr key={pallet.id} className="hover:bg-dark-border/50 transition-colors">
                    <td className="font-mono text-sm font-semibold">{pallet.palletNumber}</td>
                    <td>{pallet.location || '-'}</td>
                    <td>
                      <span className={`badge ${getStatusColor(pallet.status)}`}>
                        {getStatusLabel(pallet.status)}
                      </span>
                    </td>
                    <td>{pallet.capacity}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-dark-darker rounded-full h-2 max-w-[100px]">
                          <div 
                            className={`h-2 rounded-full ${
                              pallet.currentLoad >= pallet.capacity 
                                ? 'bg-red-500' 
                                : pallet.currentLoad >= pallet.capacity * 0.8
                                ? 'bg-yellow-500'
                                : 'bg-green-500'
                            }`}
                            style={{ width: `${Math.min((pallet.currentLoad / pallet.capacity) * 100, 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-sm">{pallet.currentLoad}</span>
                      </div>
                    </td>
                    <td>{pallet.items?.length || 0}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-primary-500/10 rounded-lg text-primary-500 transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(pallet.id)}
                          className="p-2 hover:bg-red-500/10 rounded-lg text-red-500 transition-colors"
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

          {data?.pagination && (
            <div className="flex items-center justify-between p-4 border-t border-dark-border">
              <p className="text-sm text-gray-400">
                Mostrando {data.pallets.length} de {data.pagination.total} pallets
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
          <Layers className="w-16 h-16 mx-auto mb-4 text-gray-600" />
          <h3 className="text-xl font-semibold mb-2">No pallets found</h3>
          <p className="text-gray-400 mb-6">
            {search ? 'Tente ajustar sua busca' : 'Comece adicionando seu primeiro pallet'}
          </p>
          <button className="btn btn-primary inline-flex">
            <Plus className="w-5 h-5" />
            Add Pallet
          </button>
        </div>
      )}
    </div>
  );
};

export default Pallets;

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Edit, Trash2, Package } from 'lucide-react';
import { inventoryAPI } from '@/services/api';

const Inventory = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['inventory', page, search],
    queryFn: () => inventoryAPI.getAll({ page, limit: 20, search }).then(res => res.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => inventoryAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['inventory']);
      alert('Item deletado com sucesso!');
    },
    onErrorr: (error) => {
      alert('Error ao deletar item: ' + error.message);
    },
  });

  const handleDelete = (id) => {
    if (confirm('Tem certeza que deseja deletar este item?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Inventory</h1>
          <p className="text-gray-400">Gerencie seus itens de inventário</p>
        </div>
        <button className="btn btn-primary">
          <Plus className="w-5 h-5" />
          Novo Item
        </button>
      </div>

      <div className="card mb-6">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search por nome, SKU ou descrição..."
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
      ) : data?.items?.length > 0 ? (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Nome</th>
                  <th>Category</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((item) => (
                  <tr key={item.id} className="hover:bg-dark-border/50 transition-colors">
                    <td className="font-mono text-sm">{item.sku}</td>
                    <td className="font-medium">{item.name}</td>
                    <td>{item.category || '-'}</td>
                    <td>
                      <span className={`font-semibold ${
                        item.quantity <= item.minQuantity 
                          ? 'text-red-400' 
                          : 'text-green-400'
                      }`}>
                        {item.quantity}
                      </span>
                    </td>
                    <td>R$ {parseFloat(item.price).toFixed(2)}</td>
                    <td>
                      <span className={`badge ${
                        item.status === 'active' 
                          ? 'badge-success' 
                          : item.status === 'inactive'
                          ? 'badge-warning'
                          : 'badge-danger'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-primary-500/10 rounded-lg text-primary-500 transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(item.id)}
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
                Mostrando {data.items.length} de {data.pagination.total} itens
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
          <Package className="w-16 h-16 mx-auto mb-4 text-gray-600" />
          <h3 className="text-xl font-semibold mb-2">No items found</h3>
          <p className="text-gray-400 mb-6">
            {search ? 'Tente ajustar sua busca' : 'Comece adicionando seu primeiro item'}
          </p>
          <button className="btn btn-primary inline-flex">
            <Plus className="w-5 h-5" />
            Add Item
          </button>
        </div>
      )}
    </div>
  );
};

export default Inventory;

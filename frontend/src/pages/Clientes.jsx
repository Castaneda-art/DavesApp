import { useState, useEffect } from 'react';

export default function Clientes() {
  const [clients, setClients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    notes: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const fetchClients = async () => {
    try {
      const res = await fetch('https://davesapp.onrender.com/api/clients');
      const result = await res.json();
      if (result.success) {
        setClients(result.data);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch('https://davesapp.onrender.com/api/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const result = await res.json();
      
      if (result.success) {
        // Insertamos y reordenamos localmente
        setClients((prev) => [...prev, result.data].sort((a, b) => a.name.localeCompare(b.name)));
        
        // Limpiamos formulario
        setFormData({ name: '', phone: '', notes: '' });
      }
    } catch (error) {
      console.error('Error posting client:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrado reactivo en tiempo real
  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen w-full bg-[#150E08] text-gray-100 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto animate-fade-in space-y-8">
        <header className="mb-4">
          <h2 className="text-3xl font-bold text-white">Directorio de Clientes</h2>
          <p className="text-white/70 mt-1">Registra la informacion de contacto y las formulas de colorimetria.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Formulario de Registro */}
          <div className="bg-[#2C1E16] p-6 sm:p-8 rounded-2xl shadow-xl border border-[#3A2A1E] h-fit">
            <h3 className="text-xl font-semibold text-white mb-4">Nuevo Cliente</h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1">Nombre Completo</label>
              <input 
                type="text" 
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej. Ana Perez"
                className="bg-[#3A2A1E] text-white focus:ring-2 focus:ring-[#E29547] border-none rounded-lg p-3 w-full transition-all placeholder:text-white/30"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1">Telefono</label>
              <input 
                type="text" 
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Ej. 300 123 4567"
                className="bg-[#3A2A1E] text-white focus:ring-2 focus:ring-[#E29547] border-none rounded-lg p-3 w-full transition-all placeholder:text-white/30"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-1">Notas (Colorimetria, Preferencias)</label>
              <textarea 
                rows="4"
                value={formData.notes}
                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Ej. Base 7.0 con peroxido de 20 Vol. Cliente prefiere peinado liso."
                className="bg-[#3A2A1E] text-white focus:ring-2 focus:ring-[#E29547] border-none rounded-lg p-3 w-full transition-all resize-y min-h-[100px] placeholder:text-white/30"
              ></textarea>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full mt-4 bg-[#E29547] hover:bg-[#F2A65A] text-white py-3 rounded-lg font-bold transition-all disabled:opacity-50"
            >
              {isLoading ? 'Guardando...' : 'Registrar Cliente'}
            </button>
          </form>
        </div>

        {/* Directorio de Clientes y Buscador */}
        <div className="bg-[#2C1E16] p-6 sm:p-8 rounded-2xl shadow-xl border border-[#3A2A1E] flex flex-col max-h-[700px]">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h3 className="text-xl font-semibold text-white whitespace-nowrap">Directorio</h3>
            <input 
              type="text"
              placeholder="Buscar por nombre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 bg-[#3A2A1E] text-white focus:ring-2 focus:ring-[#E29547] border-none rounded-lg p-2.5 transition-all text-sm placeholder:text-white/30"
            />
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar flex flex-col gap-3">
            {filteredClients.length === 0 ? (
              <p className="text-white/50 text-center py-10">
                {clients.length === 0 ? 'No hay clientes registrados todavia.' : 'No se encontraron clientes con ese nombre.'}
              </p>
            ) : (
              filteredClients.map(client => (
                <div key={client.id} className="p-4 bg-[#1A120D] rounded-xl border border-[#3A2A1E] flex flex-col gap-2 transition-colors hover:border-[#E29547]/50">
                  <div className="flex justify-between items-start">
                    <p className="font-bold text-[#E29547] text-lg">{client.name}</p>
                    {client.phone && (
                      <span className="text-white/80 text-sm font-medium">{client.phone}</span>
                    )}
                  </div>
                  
                  {client.notes && (
                    <div className="bg-[#3A2A1E]/30 p-3 rounded-lg mt-1 border border-[#3A2A1E]">
                      <p className="text-sm text-white/90 whitespace-pre-wrap leading-relaxed">{client.notes}</p>
                    </div>
                  )}
                  
                  <p className="text-xs text-white/40 mt-1 font-medium">
                    Registrado el {new Date(client.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}

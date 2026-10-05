import { useState, useEffect } from 'react';
import { DollarSign, Inbox } from 'lucide-react';
export default function Caja() {
  const [transactions, setTransactions] = useState([]);
  const [clients, setClients] = useState([]);
  const [formData, setFormData] = useState({
    type: 'CORTE',
    amount: '',
    clientCategory: 'NUEVO',
    description: '',
    clientId: '',
    clientName: ''
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Nuevo estado para la calculadora de vuelto
  const [cashReceived, setCashReceived] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);

  const formatCOP = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const fetchTransactions = async () => {
    try {
      const res = await fetch('https://davesapp.onrender.com/api/transactions');
      const result = await res.json();
      if (result.success) {
        setTransactions(result.data);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

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
    fetchTransactions();
    fetchClients();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    let submitData = { ...formData };
    if (formData.clientCategory === 'HABITUAL' && formData.clientId) {
      const selectedClient = clients.find(c => c.id === formData.clientId);
      if (selectedClient) submitData.clientName = selectedClient.name;
    }

    try {
      const res = await fetch('https://davesapp.onrender.com/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });
      const result = await res.json();
      
      if (result.success) {
        setTransactions([result.data, ...transactions]);
        setFormData({
          type: 'CORTE',
          amount: '',
          clientCategory: 'NUEVO',
          description: '',
          clientId: '',
          clientName: ''
        });
        setCashReceived(''); // Limpiar efectivo recibido
        // Si fue una venta a un habitual, actualizamos la lista de clientes para ver la visita sumada
        if (submitData.clientCategory === 'HABITUAL') {
          fetchClients();
        }
      }
    } catch (error) {
      console.error('Error posting transaction:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Logica de Vuelto
  const amountToPay = parseFloat(formData.amount) || 0;
  const amountGiven = parseFloat(cashReceived) || 0;
  const changeToReturn = amountGiven - amountToPay;

  return (
    <div className="min-h-screen w-full bg-[#150E08] text-gray-100 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto animate-fade-in space-y-8">
        <header className="mb-4">
          <h2 className="text-3xl font-bold text-white">Caja y Transacciones</h2>
          <p className="text-white/70 mt-1">Registra ingresos por servicios y gastos del salon.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Formulario de Registro */}
          <div className="bg-[#2C1E16] rounded-2xl shadow-xl border border-[#3A2A1E] p-6 sm:p-8 h-fit">
            <h3 className="text-xl font-semibold text-white mb-4">Nueva Transaccion</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/90 mb-1">Tipo de Transaccion</label>
                <select 
                  value={formData.type}
                  onChange={e => {
                    setFormData({ ...formData, type: e.target.value });
                    if (e.target.value === 'GASTO_LOCAL') {
                      setCashReceived('');
                    }
                  }}
                  className="bg-[#3A2A1E] text-white focus:ring-2 focus:ring-[#E29547] border-none rounded-lg p-3 w-full transition-all"
                >
                  <option value="CORTE">Corte de Cabello</option>
                  <option value="VITRINA">Producto de Vitrina</option>
                  <option value="TRENZA_PEINADO">Trenza / Peinado</option>
                  <option value="GASTO_LOCAL">Gasto del Local (Salida)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/90 mb-1">Monto ($)</label>
                <input 
                  type="number" 
                  step="0.01"
                  required
                  value={formData.amount}
                  onChange={e => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="Ej. 15000"
                  className="bg-[#3A2A1E] text-white focus:ring-2 focus:ring-[#E29547] border-none rounded-lg p-3 w-full transition-all placeholder:text-white/30"
                />
              </div>

            {/* Calculadora de Vuelto (Opcional, solo en ingresos) */}
            {formData.type !== 'GASTO_LOCAL' && (
              <div className="p-4 bg-[#1A120D] rounded-xl border border-[#3A2A1E]">
                <label className="block text-sm font-medium text-white/90 mb-2">Efectivo recibido (Opcional)</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={cashReceived}
                  onChange={e => setCashReceived(e.target.value)}
                  placeholder="Ej. 50000"
                  className="bg-[#3A2A1E] text-white focus:ring-2 focus:ring-[#E29547] border-none rounded-lg p-3 w-full transition-all placeholder:text-white/30"
                />
                
                {cashReceived && amountGiven > 0 && (
                  <div className="mt-4 text-center">
                    <p className="text-sm text-white/70">Cambio a devolver</p>
                    <p className="text-4xl font-bold text-[#E29547] mt-1">
                      {formatCOP(Math.max(0, changeToReturn))}
                    </p>
                  </div>
                )}
              </div>
            )}

            {formData.type !== 'GASTO_LOCAL' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-1">Categoria del Cliente</label>
                  <select 
                    value={formData.clientCategory}
                    onChange={e => setFormData({ ...formData, clientCategory: e.target.value, clientId: '', clientName: '' })}
                    className="bg-[#3A2A1E] text-white focus:ring-2 focus:ring-[#E29547] border-none rounded-lg p-3 w-full transition-all"
                  >
                    <option value="NUEVO">Cliente Nuevo</option>
                    <option value="HABITUAL">Cliente Habitual</option>
                  </select>
                </div>

                {formData.clientCategory === 'NUEVO' && (
                  <div className="animate-fade-in space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-white/90 mb-1">Nombre del Cliente</label>
                      <input 
                        type="text" 
                        required
                        value={formData.clientName}
                        onChange={e => setFormData({ ...formData, clientName: e.target.value })}
                        placeholder="Ej. Maria Gomez"
                        className="bg-[#3A2A1E] text-white focus:ring-2 focus:ring-[#E29547] border-none rounded-lg p-3 w-full transition-all placeholder:text-white/30"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/90 mb-1">Temporada de Visita</label>
                      <select 
                        value={formData.seasonTag || 'Ninguna'}
                        onChange={e => setFormData({ ...formData, seasonTag: e.target.value })}
                        className="bg-[#3A2A1E] text-white focus:ring-2 focus:ring-[#E29547] border-none rounded-lg p-3 w-full transition-all"
                      >
                        <option value="Ninguna">Ninguna</option>
                        <option value="Amor y Amistad">Amor y Amistad</option>
                        <option value="Maraton Diciembre">Maraton Diciembre</option>
                        <option value="Fiestas de Empresa">Fiestas de Empresa</option>
                        <option value="Dia de la Madre">Dia de la Madre</option>
                      </select>
                    </div>
                  </div>
                )}

                {formData.clientCategory === 'HABITUAL' && (
                  <div className="animate-fade-in space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-white/90 mb-1">Buscar Cliente</label>
                      <input 
                        type="text" 
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        placeholder="Escribe para filtrar clientes..."
                        className="bg-[#3A2A1E] text-white focus:ring-2 focus:ring-[#E29547] border-none rounded-lg p-3 w-full transition-all placeholder:text-white/30"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/90 mb-1">Seleccionar Cliente</label>
                      <select 
                        required
                        value={formData.clientId}
                        onChange={e => setFormData({ ...formData, clientId: e.target.value })}
                        className="bg-[#3A2A1E] text-white focus:ring-2 focus:ring-[#E29547] border-none rounded-lg p-3 w-full transition-all"
                      >
                        <option value="">Seleccione un cliente...</option>
                        {filteredClients.map(client => (
                          <option key={client.id} value={client.id}>
                            {client.name} - {client.visitCount} visita(s)
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-white/90 mb-1">Descripcion</label>
              <input 
                type="text" 
                required
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder="Ej. Corte degradado"
                className="bg-[#3A2A1E] text-white focus:ring-2 focus:ring-[#E29547] border-none rounded-lg p-3 w-full transition-all placeholder:text-white/30"
              />
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full mt-6 bg-[#E29547] hover:bg-[#F2A65A] text-white py-3 rounded-lg font-bold transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#E29547]/30 active:scale-95 disabled:opacity-50 disabled:active:scale-100"
            >
              {isLoading ? 'Guardando...' : 'Registrar Transaccion'}
            </button>
          </form>
        </div>

        {/* Historial de Transacciones */}
        <div className="bg-[#2C1E16] rounded-2xl shadow-xl border border-[#3A2A1E] p-6 sm:p-8 flex flex-col max-h-[700px]">
          <h3 className="text-xl font-semibold text-white mb-4">�altimos Movimientos</h3>
          
          <div className="flex-1 overflow-y-auto space-y-1 pr-2 custom-scrollbar">
            {transactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 opacity-60 mt-10">
                <Inbox className="w-12 h-12 text-gray-400 mb-4" />
                <p className="text-gray-400">No hay transacciones registradas todavia.</p>
              </div>
            ) : (
              transactions.map(tx => {
                const isExpense = tx.type === 'GASTO_LOCAL';
                return (
                  <div key={tx.id} className="flex justify-between items-center p-4 border-b border-[#3A2A1E] hover:bg-[#3A2A1E]/50 transition-colors">
                    <div>
                      <p className="font-medium text-white/90">{tx.description}</p>
                      <div className="flex items-center gap-2 text-xs text-white/60 mt-1">
                        <span className="text-[#E29547] font-semibold">{tx.type.replace('_', ' ')}</span>
                        <span>â€¢</span>
                        <span>{new Date(tx.createdAt).toLocaleDateString()} {new Date(tx.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                    </div>
                    <div className={`text-xl font-bold ${isExpense ? 'text-red-400' : 'text-green-400'}`}>
                      {isExpense ? '-' : '+'}{formatCOP(Number(tx.amount))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}

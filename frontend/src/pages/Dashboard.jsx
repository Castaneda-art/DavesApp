import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, X, Scissors, ShoppingBag, Calendar, Clock, CalendarX } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const [localStatus, setLocalStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const [ingresosHoy, setIngresosHoy] = useState(0);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);
  const [clientesAtendidos, setClientesAtendidos] = useState(0);
  const [ingresosServicios, setIngresosServicios] = useState(0);
  const [ingresosProductos, setIngresosProductos] = useState(0);
  const [clientWaiting, setClientWaiting] = useState(false);

  // Meta Diaria Constante
  const META_DIARIA = 150000;

  const formatCOP = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const fetchStatus = async () => {
    try {
      const response = await fetch('https://davesapp.onrender.com/api/status');
      const result = await response.json();
      if (result.success && result.data && result.data.length > 0) {
        setLocalStatus(result.data[0]);
        setClientWaiting(result.data[0].clientWaiting ?? false);
      }
    } catch (error) {
      console.error('Error fetching local status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await fetch('https://davesapp.onrender.com/api/transactions');
      const result = await response.json();
      
      if (result.success && result.data) {
        const today = new Date();
        const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
        
        let totalHoy = 0;
        
        result.data.forEach(tx => {
          const txDate = new Date(tx.createdAt).getTime();
          const isAdmin = tx.performedBy && tx.performedBy.role === 'ADMINISTRADORA';
          
          if (txDate >= startOfToday && isAdmin) {
            if (tx.type === 'GASTO_LOCAL') {
              totalHoy -= Number(tx.amount);
            } else {
              totalHoy += Number(tx.amount);
            }
          }
        });
        
        setIngresosHoy(totalHoy);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setIsLoadingTransactions(false);
    }
  };

  const fetchDashboard = async () => {
    try {
      const response = await fetch('https://davesapp.onrender.com/api/dashboard');
      const result = await response.json();
      if (result.success) {
        setClientesAtendidos(result.clientesAtendidos);
        setIngresosServicios(result.ingresosServicios);
        setIngresosProductos(result.ingresosProductos);
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    }
  };

  const [isQuickCutting, setIsQuickCutting] = useState(false);
  const [isQuickSelling, setIsQuickSelling] = useState(false);
  
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [quickClientId, setQuickClientId] = useState('');
  const [quickProductId, setQuickProductId] = useState('');

  const fetchClients = async () => {
    try {
      const res = await fetch('https://davesapp.onrender.com/api/clients');
      const result = await res.json();
      if (result.success) setClients(result.data);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const fetchInventory = async () => {
    try {
      const res = await fetch('https://davesapp.onrender.com/api/inventory');
      const result = await res.json();
      if (result.success) setProducts(result.data.filter(p => p.stock > 0));
    } catch (error) {
      console.error('Error fetching inventory:', error);
    }
  };

  const [appointments, setAppointments] = useState([]);

  const fetchAppointments = async () => {
    try {
      const res = await fetch('https://davesapp.onrender.com/api/appointments');
      const result = await res.json();
      if (result.success) {
        setAppointments(result.data.filter(a => a.status === 'PENDIENTE'));
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  useEffect(() => {
    fetchStatus();
    fetchTransactions();
    fetchDashboard();
    fetchClients();
    fetchInventory();
    fetchAppointments();

    const pollingInterval = setInterval(() => {
      fetchStatus();
      fetchAppointments();
    }, 15000);
    return () => clearInterval(pollingInterval);
  }, []);

  const handleQuickCut = async () => {
    setIsQuickCutting(true);
    let payload = {};
    if (quickClientId) {
      payload = {
        type: 'CORTE',
        amount: 15000,
        clientCategory: 'HABITUAL',
        clientId: quickClientId,
        description: 'Corte rapido',
      };
    } else {
      payload = { 
        type: 'CORTE', 
        amount: 15000, 
        clientCategory: 'NUEVO', 
        clientName: 'Cliente de Paso', 
        description: 'Corte rapido', 
        seasonTag: 'Ninguna' 
      };
    }
    
    try {
      const res = await fetch('https://davesapp.onrender.com/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await res.json();
      
      if (result.success) {
        await fetchTransactions();
        await fetchDashboard();
        setQuickClientId('');
      }
    } catch (error) {
      console.error('Error in Quick Cut:', error);
    } finally {
      setIsQuickCutting(false);
    }
  };

  const handleQuickSale = async () => {
    if (!quickProductId) return;
    setIsQuickSelling(true);
    
    const product = products.find(p => p.id === quickProductId);
    if (!product) {
      setIsQuickSelling(false);
      return;
    }

    const payload = {
      type: 'VITRINA',
      amount: product.salePrice,
      clientCategory: 'NUEVO',
      clientName: 'Cliente de Paso',
      description: `Venta rapida de vitrina: ${product.name}`,
      productId: product.id
    };

    try {
      const res = await fetch('https://davesapp.onrender.com/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await res.json();
      
      if (result.success) {
        await fetchTransactions();
        await fetchDashboard();
        await fetchInventory();
        setQuickProductId('');
      }
    } catch (error) {
      console.error('Error in Quick Sale:', error);
    } finally {
      setIsQuickSelling(false);
    }
  };


  const handleClearAlert = async () => {
    try {
      const response = await fetch('https://davesapp.onrender.com/api/status/clear', { method: 'PUT' });
      const result = await response.json();
      if (result.success) {
        setClientWaiting(false);
      }
    } catch (error) {
      console.error('Error clearing alert:', error);
    }
  };

  const updateStatus = async (newStatus) => {
    if (!localStatus || !localStatus.id || isUpdating) return;

    setIsUpdating(true);
    try {
      const response = await fetch(`https://davesapp.onrender.com/api/status/${localStatus.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setLocalStatus(result.data);
      }
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusColors = (statusStr) => {
    switch (statusStr?.toUpperCase()) {
      case 'LIBRE':
        return { dotPing: 'bg-green-400', dotBase: 'bg-green-500', text: 'text-green-400' };
      case 'OCUPADO':
        return { dotPing: 'bg-yellow-400', dotBase: 'bg-yellow-500', text: 'text-yellow-400' };
      case 'ALMUERZO':
        return { dotPing: 'bg-red-400', dotBase: 'bg-red-500', text: 'text-red-400' };
      default:
        return { dotPing: 'bg-gray-400', dotBase: 'bg-gray-500', text: 'text-gray-400' };
    }
  };

  const statusColors = getStatusColors(localStatus?.status);
  
  // Calcular porcentaje de la meta (con un limite de 100% visualmente)
  const progressPercentage = Math.min(Math.max((ingresosHoy / META_DIARIA) * 100, 0), 100);

  return (
    <div className="min-h-screen w-full bg-[#150E08] text-gray-100 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto animate-fade-in space-y-8">

        {/* Banner de Alerta de Timbre */}
        {clientWaiting && (
          <div className="mb-6 bg-[#E29547]/20 border border-[#E29547] rounded-xl p-4 flex justify-between items-center shadow-md">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-[#E29547]/20 rounded-lg shrink-0">
                <Bell className="w-6 h-6 text-[#E29547]" />
              </div>
              <div>
                <p className="font-bold text-[#E29547] text-base">Un cliente ha tocado el timbre</p>
                <p className="text-[#E29547]/80 text-sm mt-0.5">Hay alguien esperando ser atendido en la recepcion.</p>
              </div>
            </div>
            <button
              onClick={handleClearAlert}
              className="flex items-center gap-2 bg-[#E29547] hover:bg-[#F2A65A] text-white px-4 py-2 rounded-lg text-sm font-bold transition-all shrink-0"
            >
              <X className="w-4 h-4" />
              Atender / Descartar
            </button>
          </div>
        )}

        <header className="mb-4">
          <h2 className="text-3xl font-bold text-white">Resumen del Dia</h2>
          <p className="text-white/70 mt-1">Bienvenido al panel de administracion de tu peluqueria.</p>
        </header>
        
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tarjeta de Ingresos */}
        <div className="bg-[#2C1E16] rounded-2xl shadow-xl border border-[#3A2A1E] p-6 sm:p-8 flex flex-col justify-between transition-colors duration-300 hover:border-[#E29547]/50">
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Ingresos de Hoy</h3>
            {isLoadingTransactions ? (
              <p className="text-3xl font-bold text-gray-400 mt-2">Cargando...</p>
            ) : (
              <>
                <p className={`text-4xl font-bold ${ingresosHoy < 0 ? 'text-red-400' : 'text-[#E29547]'} mb-2`}>
                  {formatCOP(ingresosHoy)}
                </p>
                <div className="flex items-center text-sm text-white/60 mb-1">
                  <span className="font-medium">Servicios:</span> {formatCOP(ingresosServicios)}
                  <span className="mx-1 text-[#3A2A1E]">|</span>
                  <span className="font-medium">Vitrina:</span> {formatCOP(ingresosProductos)}
                </div>
                
                {/* Barra de Progreso de Meta Diaria */}
                <div className="mt-5 bg-[#1A120D] p-3 rounded-lg border border-[#3A2A1E]">
                  <div className="flex justify-between items-center text-xs font-medium text-white/80 mb-1.5">
                    <span>Meta: {formatCOP(META_DIARIA)}</span>
                    <span>{progressPercentage.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-[#3A2A1E] rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-[#E29547] h-2 rounded-full transition-all duration-1000 ease-out" 
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>
                </div>
              </>
            )}
          </div>
          <button 
            onClick={() => navigate('/caja')}
            className="mt-5 w-full bg-[#E29547] hover:bg-[#F2A65A] text-white py-3 rounded-lg font-bold transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#E29547]/30 active:scale-95"
          >
            Ir a Caja
          </button>
        </div>

        {/* Tarjeta de Clientes */}
        <div className="bg-[#2C1E16] rounded-2xl shadow-xl border border-[#3A2A1E] p-6 sm:p-8 flex flex-col justify-between transition-colors duration-300 hover:border-[#E29547]/50">
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Clientes Atendidos</h3>
            <p className="text-4xl font-bold text-[#E29547]">{clientesAtendidos}</p>
          </div>
          <button 
            onClick={() => navigate('/clientes')}
            className="mt-6 w-full bg-[#E29547] hover:bg-[#F2A65A] text-white py-3 rounded-lg font-bold transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#E29547]/30 active:scale-95"
          >
            Ver Clientes
          </button>
        </div>

        {/* Tarjeta de Estado */}
        <div className="bg-[#2C1E16] rounded-2xl shadow-xl border border-[#3A2A1E] p-6 sm:p-8 flex flex-col justify-between transition-colors duration-300 hover:border-[#E29547]/50">
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Estado del Local</h3>
            
            {isLoading ? (
              <div className="flex items-center gap-3 mt-2">
                <span className="relative flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gray-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-gray-500"></span>
                </span>
                <p className="text-lg font-medium text-gray-400">Conectando...</p>
              </div>
            ) : localStatus ? (
              <>
                <div className="flex items-center gap-3 mt-2">
                  <span className="relative flex h-4 w-4">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${statusColors.dotPing} opacity-75`}></span>
                    <span className={`relative inline-flex rounded-full h-4 w-4 ${statusColors.dotBase}`}></span>
                  </span>
                  <p className={`text-2xl font-bold uppercase tracking-wider ${statusColors.text}`}>
                    {localStatus.status}
                  </p>
                </div>
                {localStatus.updatedAt && (
                  <p className="text-sm text-white/60 mt-4">
                    �altima actualizacion: {new Date(localStatus.updatedAt).toLocaleTimeString()}
                  </p>
                )}
              </>
            ) : (
              <div className="mt-2">
                <p className="text-xl font-medium text-white/60">Sin informacion</p>
              </div>
            )}
          </div>

          {/* Botonera de Actualizacion de Estado */}
          {localStatus && !isLoading && (
            <div className="mt-6 flex gap-2">
              <button 
                onClick={() => updateStatus('LIBRE')}
                disabled={isUpdating}
                className="flex-1 py-3 px-2 bg-[#1A120D] hover:bg-green-500/20 text-green-400 text-sm font-bold rounded-lg border border-green-500/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-green-500/30 active:scale-95 disabled:opacity-50 disabled:active:scale-100"
              >
                Libre
              </button>
              <button 
                onClick={() => updateStatus('OCUPADO')}
                disabled={isUpdating}
                className="flex-1 py-3 px-2 bg-[#1A120D] hover:bg-yellow-500/20 text-yellow-400 text-sm font-bold rounded-lg border border-yellow-500/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-yellow-500/30 active:scale-95 disabled:opacity-50 disabled:active:scale-100"
              >
                Ocupado
              </button>
              <button 
                onClick={() => updateStatus('ALMUERZO')}
                disabled={isUpdating}
                className="flex-1 py-3 px-2 bg-[#1A120D] hover:bg-red-500/20 text-red-400 text-sm font-bold rounded-lg border border-red-500/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-red-500/30 active:scale-95 disabled:opacity-50 disabled:active:scale-100"
              >
                Almuerzo
              </button>
            </div>
          )}
        </div>
        </div>
      </div>

      <div className="bg-[#2C1E16] rounded-2xl shadow-xl border border-[#3A2A1E] p-6 sm:p-8 mt-8 transition-colors duration-300 hover:border-[#E29547]/50">
        <h3 className="text-xl font-bold text-white mb-6">Proximas Citas (Hoy)</h3>
        {appointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 opacity-60">
            <CalendarX className="w-12 h-12 text-gray-400 mb-4" />
            <p className="text-gray-400">No hay citas pendientes para hoy.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {appointments.slice(0, 3).map(appt => (
              <div key={appt.id} className="bg-[#1A120D] p-4 rounded-xl border border-[#3A2A1E] transition-colors duration-300 hover:border-[#E29547]/50">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-white truncate">{appt.clientName}</h4>
                  <span className="text-[#E29547] flex items-center gap-1 text-sm font-bold">
                    <Clock className="w-3.5 h-3.5" />
                    {appt.expectedTime}
                  </span>
                </div>
                {appt.phone && <p className="text-sm text-white/50 mt-1">{appt.phone}</p>}
              </div>
            ))}
          </div>
        )}
        <button 
          onClick={() => navigate('/agenda')}
          className="w-full bg-[#1A120D] hover:bg-[#3A2A1E] border border-[#3A2A1E] text-white py-3 rounded-lg font-bold transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#E29547]/30 active:scale-95 flex items-center justify-center gap-2"
        >
          <Calendar className="w-5 h-5 text-[#E29547]" />
          Ver agenda completa
        </button>
      </div>

      <div className="bg-[#2C1E16] rounded-2xl shadow-xl border border-[#3A2A1E] p-6 sm:p-8 mt-8 transition-colors duration-300 hover:border-[#E29547]/50">
        <h3 className="text-xl font-bold text-white mb-6">Acciones Rapidas</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Columna 1: Corte Rapido */}
          <div className="flex flex-col">
            <select
              value={quickClientId}
              onChange={(e) => setQuickClientId(e.target.value)}
              className="bg-[#3A2A1E] text-white p-3 rounded-lg w-full mb-3 border-none focus:outline-none focus:ring-2 focus:ring-[#E29547]/70 focus:border-transparent transition-shadow"
            >
              <option value="">Opcional: Asignar a cliente habitual...</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            
            <button
              onClick={handleQuickCut}
              disabled={isQuickCutting}
              className="bg-[#E29547] hover:bg-[#F2A65A] text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#E29547]/30 active:scale-95 disabled:opacity-50 disabled:active:scale-100"
            >
              <Scissors className="w-5 h-5" />
              {isQuickCutting ? 'Registrando...' : 'Corte Rapido ($15.000)'}
            </button>
          </div>

          {/* Columna 2: Venta Vitrina */}
          <div className="flex flex-col">
            <select
              value={quickProductId}
              onChange={(e) => setQuickProductId(e.target.value)}
              className="bg-[#3A2A1E] text-white p-3 rounded-lg w-full mb-3 border-none focus:outline-none focus:ring-2 focus:ring-[#E29547]/70 focus:border-transparent transition-shadow"
            >
              <option value="">Requerido: Seleccionar producto...</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name} - {formatCOP(p.salePrice)}</option>
              ))}
            </select>
            
            <button
              onClick={handleQuickSale}
              disabled={!quickProductId || isQuickSelling}
              className="bg-[#E29547] hover:bg-[#F2A65A] text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#E29547]/30 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
            >
              <ShoppingBag className="w-5 h-5" />
              {isQuickSelling ? 'Vendiendo...' : 'Vender Producto'}
            </button>
          </div>
        </div>
      </div>
      
    </div>
  );
}

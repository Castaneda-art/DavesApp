import { useState, useEffect } from 'react';
import { Wallet, Image as ImageIcon, Clock, Inbox, ImageOff } from 'lucide-react';

export default function Colaboradora() {
  const [transactions, setTransactions] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [totalHoy, setTotalHoy] = useState(0);

  const [formData, setFormData] = useState({
    title: '',
    imageUrl: '',
    duration: '',
    price: ''
  });
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [collaboratorId, setCollaboratorId] = useState(null);
  const [txFormData, setTxFormData] = useState({
    amount: '',
    clientCategory: 'NUEVO',
    description: '',
    clientName: ''
  });
  const [isSubmittingTx, setIsSubmittingTx] = useState(false);

  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCOP = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const fetchData = async () => {
    try {
      const resTx = await fetch('https://davesapp.onrender.com/api/transactions/collaborator');
      const dataTx = await resTx.json();
      if (dataTx.success) {
        setTransactions(dataTx.data);
        const total = dataTx.data.reduce((sum, tx) => sum + Number(tx.amount), 0);
        setTotalHoy(total);
        setCollaboratorId(dataTx.collaboratorId);
      }

      const resGal = await fetch('https://davesapp.onrender.com/api/gallery');
      const dataGal = await resGal.json();
      if (dataGal.success) {
        setGallery(dataGal.data);
      }

      const resClients = await fetch('https://davesapp.onrender.com/api/clients');
      const dataClients = await resClients.json();
      if (dataClients.success) {
        setClients(dataClients.data);
      }
    } catch (error) {
      console.error('Error fetching collaborator data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    setIsSubmittingTx(true);
    try {
      const payload = {
        ...txFormData,
        type: 'TRENZA_PEINADO',
        performedById: collaboratorId
      };
      
      const res = await fetch('https://davesapp.onrender.com/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await res.json();
      
      if (result.success) {
        setTransactions([result.data, ...transactions]);
        setTotalHoy(prev => prev + Number(result.data.amount));
        setTxFormData({ amount: '', clientCategory: 'NUEVO', description: '', clientName: '' });
      }
    } catch (error) {
      console.error('Error adding transaction:', error);
    } finally {
      setIsSubmittingTx(false);
    }
  };

  const handleAddGalleryItem = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch('https://davesapp.onrender.com/api/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const result = await res.json();
      if (result.success) {
        setGallery([result.data, ...gallery]);
        setFormData({ title: '', imageUrl: '', duration: '', price: '' });
        setIsAdding(false);
      }
    } catch (error) {
      console.error('Error adding gallery item:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#150E08] text-gray-100 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto animate-fade-in space-y-8">
        <header className="mb-4">
          <h2 className="text-3xl font-bold text-white">Panel de la Colaboradora</h2>
          <p className="text-white/70 mt-1">GestiÃ³n de tu catÃ¡logo de diseÃ±os y cierre diario personal.</p>
        </header>

        <div className="space-y-8">
          
          {/* SECCIÃ“N A: Cierre de Caja Personal y Registro Express */}
          <section className="bg-[#2C1E16] rounded-2xl shadow-xl border border-[#3A2A1E] p-6 sm:p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
              <div>
                <h3 className="text-2xl font-semibold text-white flex items-center gap-2">
                  <Wallet className="text-[#E29547] w-6 h-6" />
                  Cierre de Caja
                </h3>
              <p className="text-white/70 mt-1">Total recaudado hoy en servicios de Trenzas y Peinados para tu liquidaciÃ³n.</p>
            </div>
            
            <div className="text-right bg-[#1A120D] p-6 rounded-xl border border-[#3A2A1E] min-w-[250px] w-full md:w-auto">
              <p className="text-sm font-medium text-white/80 mb-1">Tu Ingreso Neto Hoy</p>
              <p className="text-4xl font-bold text-[#E29547]">{formatCOP(totalHoy)}</p>
              <p className="text-xs text-white/50 mt-2">
                {transactions.length} servicio(s) realizados hoy
              </p>
            </div>
          </div>

          <div className="bg-[#1A120D] p-6 rounded-xl border border-[#3A2A1E]">
            <h4 className="text-lg font-medium text-white mb-4">Registrar Nuevo Servicio</h4>
            <form onSubmit={handleAddTransaction} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">Monto Cobrado ($)</label>
                <input 
                  type="number" required 
                  value={txFormData.amount} 
                  onChange={e => setTxFormData({...txFormData, amount: e.target.value})} 
                  className="bg-[#3A2A1E] text-white focus:ring-2 focus:ring-[#E29547] border-none rounded-lg p-3 w-full transition-all placeholder:text-white/30" 
                  placeholder="Ej. 35000" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">CategorÃ­a del Cliente</label>
                <select 
                  value={txFormData.clientCategory} 
                  onChange={e => setTxFormData({...txFormData, clientCategory: e.target.value})} 
                  className="bg-[#3A2A1E] text-white focus:ring-2 focus:ring-[#E29547] border-none rounded-lg p-3 w-full transition-all"
                >
                  <option value="NUEVO">Cliente Nuevo</option>
                  <option value="HABITUAL">Cliente Habitual</option>
                </select>
              </div>

              {txFormData.clientCategory === 'NUEVO' && (
                <div className="animate-fade-in space-y-4 md:col-span-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-1">Nombre del Cliente (Opcional)</label>
                      <input 
                        type="text" 
                        value={txFormData.clientName} 
                        onChange={e => setTxFormData({...txFormData, clientName: e.target.value})} 
                        className="bg-[#3A2A1E] text-white focus:ring-2 focus:ring-[#E29547] border-none rounded-lg p-3 w-full transition-all placeholder:text-white/30" 
                        placeholder="Ej. Ana RamÃ­rez" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-1">Temporada de Visita</label>
                      <select 
                        value={txFormData.seasonTag || 'Ninguna'}
                        onChange={e => setTxFormData({ ...txFormData, seasonTag: e.target.value })}
                        className="bg-[#3A2A1E] text-white focus:ring-2 focus:ring-[#E29547] border-none rounded-lg p-3 w-full transition-all"
                      >
                        <option value="Ninguna">Ninguna</option>
                        <option value="Amor y Amistad">Amor y Amistad</option>
                        <option value="MaratÃ³n Diciembre">MaratÃ³n Diciembre</option>
                        <option value="Fiestas de Empresa">Fiestas de Empresa</option>
                        <option value="DÃ­a de la Madre">DÃ­a de la Madre</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {txFormData.clientCategory === 'HABITUAL' && (
                <div className="animate-fade-in space-y-4 md:col-span-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-1">Buscar Cliente</label>
                      <input 
                        type="text" 
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        placeholder="Escribe para filtrar clientes..."
                        className="bg-[#3A2A1E] text-white focus:ring-2 focus:ring-[#E29547] border-none rounded-lg p-3 w-full transition-all placeholder:text-white/30"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-1">Seleccionar Cliente</label>
                      <select 
                        required
                        value={txFormData.clientId || ''}
                        onChange={e => setTxFormData({ ...txFormData, clientId: e.target.value })}
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
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">DescripciÃ³n del Servicio</label>
                <input 
                  type="text" required 
                  value={txFormData.description} 
                  onChange={e => setTxFormData({...txFormData, description: e.target.value})} 
                  className="bg-[#3A2A1E] text-white focus:ring-2 focus:ring-[#E29547] border-none rounded-lg p-3 w-full transition-all placeholder:text-white/30" 
                  placeholder="Ej. Trenzas con extensiones" 
                />
              </div>

              <div className="md:col-span-2 mt-2">
                <button type="submit" disabled={isSubmittingTx} className="w-full bg-[#E29547] hover:bg-[#F2A65A] text-white py-3 rounded-lg font-bold text-lg transition-all disabled:opacity-50">
                  {isSubmittingTx ? 'Guardando...' : 'Registrar Servicio Finalizado'}
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* Historial de Atenciones de Hoy */}
        <section className="bg-[#2C1E16] rounded-2xl shadow-xl border border-[#3A2A1E] p-8">
          <h3 className="text-2xl font-semibold text-white mb-6">Historial de Atenciones de Hoy</h3>
          <div className="space-y-2">
            {transactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 opacity-60 border border-dashed border-[#3A2A1E] rounded-xl mt-4">
                <Inbox className="w-12 h-12 text-gray-400 mb-4" />
                <p className="text-gray-400">No hay atenciones registradas hoy.</p>
              </div>
            ) : (
              transactions.map(tx => (
                <div key={tx.id} className="flex justify-between items-center p-4 border-b border-[#3A2A1E] hover:bg-[#3A2A1E]/50 transition-colors">
                  <div>
                    <p className="font-medium text-white/90">{tx.description}</p>
                    <div className="flex items-center gap-2 text-xs text-white/60 mt-1">
                      <span>{new Date(tx.createdAt).toLocaleDateString()} {new Date(tx.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                  </div>
                  <div className="text-xl font-bold text-green-400">
                    +{formatCOP(Number(tx.amount))}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* SECCIÃ“N B: GalerÃ­a de DiseÃ±os */}
        <section className="bg-[#2C1E16] rounded-2xl shadow-xl border border-[#3A2A1E] p-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <h3 className="text-2xl font-semibold text-white flex items-center gap-2">
                <ImageIcon className="text-white w-6 h-6" />
                CatÃ¡logo de DiseÃ±os
              </h3>
              <p className="text-white/70 mt-1">Muestra tu portafolio a los clientes con precios y tiempos.</p>
            </div>
            <button 
              onClick={() => setIsAdding(!isAdding)}
              className="bg-[#E29547] hover:bg-[#F2A65A] text-white px-5 py-2.5 rounded-lg transition-all font-bold text-sm shadow-md flex items-center gap-2"
            >
              {isAdding ? 'Cancelar' : 'Agregar Nuevo DiseÃ±o'}
            </button>
          </div>

          {/* Formulario colapsable */}
          {isAdding && (
            <div className="bg-[#1A120D] p-6 rounded-xl border border-[#3A2A1E] mb-8 animate-fade-in shadow-inner">
              <form onSubmit={handleAddGalleryItem} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1">TÃ­tulo del DiseÃ±o</label>
                  <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="bg-[#3A2A1E] text-white focus:ring-2 focus:ring-[#E29547] border-none rounded-lg p-3 w-full transition-all placeholder:text-white/30" placeholder="Ej. Trenzas Africanas" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1">URL de la FotografÃ­a</label>
                  <input type="url" required value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} className="bg-[#3A2A1E] text-white focus:ring-2 focus:ring-[#E29547] border-none rounded-lg p-3 w-full transition-all placeholder:text-white/30" placeholder="https://ejemplo.com/imagen.jpg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1">DuraciÃ³n Estimada</label>
                  <input type="text" required value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} className="bg-[#3A2A1E] text-white focus:ring-2 focus:ring-[#E29547] border-none rounded-lg p-3 w-full transition-all placeholder:text-white/30" placeholder="Ej. 2 horas y media" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1">Precio Sugerido ($)</label>
                  <input type="number" required value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="bg-[#3A2A1E] text-white focus:ring-2 focus:ring-[#E29547] border-none rounded-lg p-3 w-full transition-all placeholder:text-white/30" placeholder="Ej. 45000" />
                </div>
                <div className="md:col-span-2 mt-2">
                  <button type="submit" disabled={isLoading} className="w-full bg-[#E29547] hover:bg-[#F2A65A] text-white py-3 rounded-lg font-bold text-lg transition-all disabled:opacity-50">
                    {isLoading ? 'Guardando en la galerÃ­a...' : 'Guardar DiseÃ±o en el CatÃ¡logo'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Grid GalerÃ­a */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {gallery.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center p-8 opacity-60 mt-4 border-2 border-dashed border-[#3A2A1E] rounded-xl">
                <ImageOff className="w-12 h-12 text-gray-400 mb-4" />
                <p className="text-gray-400">AÃºn no tienes diseÃ±os. Sube tu primer trabajo para que los clientes lo vean.</p>
              </div>
            ) : (
              gallery.map(item => (
                <div key={item.id} className="bg-[#1A120D] rounded-xl overflow-hidden border border-[#3A2A1E] group hover:border-[#E29547] transition-all duration-300 shadow-md flex flex-col">
                  <div className="w-full aspect-square bg-[#3A2A1E]/50 overflow-hidden relative">
                    <img 
                      src={item.imageUrl} 
                      alt={item.title} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/400x400?text=Sin+Imagen' }}
                    />
                    <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-md text-white text-xs px-2.5 py-1 rounded-md border border-white/10 shadow-lg flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#E29547]" />
                      {item.duration}
                    </div>
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <h4 className="font-medium text-white mb-1 line-clamp-2 text-sm leading-snug">{item.title}</h4>
                    <p className="text-[#E29547] font-bold mt-auto text-lg">{formatCOP(item.price)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

      </div>
      </div>
    </div>
  );
}

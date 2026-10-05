import { useState, useEffect } from 'react';
import { Phone, User as UserIcon, Bell, Star, AlertCircle, CheckCircle, Image as ImageIcon } from 'lucide-react';

export default function VistaCliente() {
  const [step, setStep] = useState('PHONE_INPUT'); // PHONE_INPUT | REGISTER | VALIDATED
  
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [seasonTag, setSeasonTag] = useState('Ninguna');
  
  const [clientData, setClientData] = useState(null);
  const [localStatus, setLocalStatus] = useState(null);
  const [gallery, setGallery] = useState([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' }); // type: 'error' | 'success'

  const [expectedTime, setExpectedTime] = useState('');
  const [isBooking, setIsBooking] = useState(false);
  const [bookMessage, setBookMessage] = useState({ type: '', text: '' });

  const handleBook = async (e) => {
    e.preventDefault();
    setIsBooking(true);
    setBookMessage({ type: '', text: '' });
    try {
      const res = await fetch('http://localhost:3000/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          clientName: clientData.name, 
          phone: clientData.phone || phone, 
          expectedTime 
        })
      });
      const result = await res.json();
      if (result.success) {
        setBookMessage({ type: 'success', text: 'Cita agendada, te esperamos' });
        setExpectedTime('');
      } else {
        setBookMessage({ type: 'error', text: 'Error al agendar cita.' });
      }
    } catch (e) {
      setBookMessage({ type: 'error', text: 'Error de conexión.' });
    } finally {
      setIsBooking(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statusRes, galleryRes] = await Promise.all([
          fetch('http://localhost:3000/api/status'),
          fetch('http://localhost:3000/api/gallery')
        ]);
        
        const statusData = await statusRes.json();
        if (statusData.success && statusData.data.length > 0) {
          setLocalStatus(statusData.data[0]);
        }

        const galleryData = await galleryRes.json();
        if (galleryData.success) {
          setGallery(galleryData.data);
        }
      } catch (e) {
        console.error('Error obteniendo datos iniciales', e);
      }
    };
    fetchData();
  }, []);

  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    if (phone.length < 7) return;
    
    setIsLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      const res = await fetch('http://localhost:3000/api/auth/client', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      });
      const result = await res.json();
      
      if (result.success) {
        if (result.exists) {
          setClientData(result.data);
          setStep('VALIDATED');
        } else {
          setStep('REGISTER');
        }
      } else {
        setMessage({ type: 'error', text: 'Error del servidor al validar.' });
      }
    } catch (e) {
      setMessage({ type: 'error', text: 'No hay conexión con el servidor.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      const res = await fetch('http://localhost:3000/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, notes: 'Registro autónomo vía Vista Cliente', seasonTag })
      });
      const result = await res.json();
      
      if (result.success) {
        setClientData(result.data);
        setStep('VALIDATED');
      } else {
        setMessage({ type: 'error', text: 'Error en el proceso de registro.' });
      }
    } catch (e) {
      setMessage({ type: 'error', text: 'Error en el proceso de registro.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRingBell = async () => {
    setIsLoading(true);
    try {
      await fetch('http://localhost:3000/api/status/notify', { method: 'PUT' });
      setMessage({ type: 'success', text: 'El personal ha sido notificado. Por favor, toma asiento y en breve te atenderemos.' });
    } catch (e) {
      setMessage({ type: 'error', text: 'No se pudo enviar la notificacion. Intenta de nuevo.' });
    } finally {
      setIsLoading(false);
    }
  };

  const formatCOP = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div 
      className={step !== 'VALIDATED' 
        ? "relative min-h-screen w-full bg-cover bg-center flex items-center justify-center font-sans text-gray-100" 
        : "min-h-screen w-full bg-[#150E08] text-gray-100 flex items-center justify-center p-4 md:p-8 font-sans"
      }
      style={step !== 'VALIDATED' ? { backgroundImage: "url('https://pub-f33fcc608cb6407cb590042f167dab55.r2.dev/barber-shop-attributes-doodle-seamless-pattern_1284-11894.avif')" } : {}}
    >
      {step !== 'VALIDATED' && <div className="absolute inset-0 bg-[#1A120B]/85 z-0"></div>}

      {step !== 'VALIDATED' ? (
        <div className="relative z-10 bg-[#2C1E16] p-6 sm:p-10 rounded-2xl shadow-xl border border-[#3A2A1E] max-w-md w-full mx-auto animate-fade-in m-4">
          <h2 className="text-[#E29547] font-bold text-3xl mb-6 text-center">Bienvenido a DavesApp</h2>
          
          {message.text && (
            <div className={`p-4 rounded-lg mb-6 flex items-start gap-3 border ${
              message.type === 'error' 
                ? 'bg-red-900/20 border-red-500/50 text-red-400' 
                : 'bg-green-900/20 border-green-500/50 text-green-400'
            }`}>
              {message.type === 'error' ? <AlertCircle className="w-5 h-5 shrink-0" /> : <CheckCircle className="w-5 h-5 shrink-0" />}
              <span className="text-sm font-medium">{message.text}</span>
            </div>
          )}

          {/* PASO 1: PEDIR TELÉFONO */}
          {step === 'PHONE_INPUT' && (
            <div className="animate-fade-in text-center max-w-md mx-auto">
              <Phone className="w-12 h-12 text-[#E29547] mx-auto mb-4 opacity-80" />
              <p className="text-white opacity-70 text-sm mb-6">Por favor, ingresa tu número de teléfono para identificarte.</p>
              
              <form onSubmit={handlePhoneSubmit} className="space-y-4">
                <input 
                  type="tel" 
                  required 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Número de celular"
                  className="bg-[#3A2A1E] text-white focus:ring-2 focus:ring-[#E29547] border-none rounded-lg p-3 w-full text-center transition-all placeholder:text-white/30"
                />
                <button 
                  type="submit" 
                  disabled={isLoading || !phone}
                  className="bg-[#E29547] hover:bg-[#F2A65A] text-white font-bold rounded-lg transition-all p-3 w-full disabled:opacity-50"
                >
                  {isLoading ? 'Verificando...' : 'Ingresar'}
                </button>
              </form>
            </div>
          )}

          {/* PASO 2: REGISTRO (SI NO EXISTE) */}
          {step === 'REGISTER' && (
            <div className="animate-fade-in text-center max-w-md mx-auto">
              <UserIcon className="w-12 h-12 text-[#E29547] mx-auto mb-4 opacity-80" />
              <h2 className="text-xl font-semibold text-white mb-2">Es tu primera vez aquí</h2>
              <p className="text-white opacity-70 text-sm mb-6">Regístrate rápidamente para comenzar a acumular beneficios.</p>
              
              <form onSubmit={handleRegister} className="space-y-4 text-left">
                <div>
                  <label className="block text-sm font-medium text-white opacity-90 mb-1">Nombre Completo</label>
                  <input 
                    type="text" 
                    required 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Escribe tu nombre"
                    className="bg-[#3A2A1E] text-white focus:ring-2 focus:ring-[#E29547] border-none rounded-lg p-3 w-full transition-all placeholder:text-white/30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white opacity-90 mb-1">Temporada de Visita</label>
                  <select 
                    value={seasonTag}
                    onChange={(e) => setSeasonTag(e.target.value)}
                    className="bg-[#3A2A1E] text-white focus:ring-2 focus:ring-[#E29547] border-none rounded-lg p-3 w-full transition-all"
                  >
                    <option value="Ninguna">Ninguna</option>
                    <option value="Amor y Amistad">Amor y Amistad</option>
                    <option value="Maratón Diciembre">Maratón Diciembre</option>
                    <option value="Fiestas de Empresa">Fiestas de Empresa</option>
                    <option value="Día de la Madre">Día de la Madre</option>
                  </select>
                </div>
                <button 
                  type="submit" 
                  disabled={isLoading || !name}
                  className="bg-[#E29547] hover:bg-[#F2A65A] text-white font-bold rounded-lg transition-all p-3 w-full mt-4 disabled:opacity-50"
                >
                  {isLoading ? 'Creando perfil...' : 'Crear Perfil y Anunciarme'}
                </button>
                <button 
                  type="button" 
                  onClick={() => setStep('PHONE_INPUT')}
                  className="w-full text-white opacity-60 text-sm hover:opacity-100 transition-opacity mt-2"
                >
                  Volver atrás
                </button>
              </form>
            </div>
          )}
        </div>
      ) : (
        <div className="relative z-10 w-full max-w-5xl overflow-hidden m-4 space-y-6">
          {clientData && (
            <div className="animate-fade-in flex flex-col gap-6">
              
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 bg-[#2C1E16] p-6 rounded-2xl shadow-xl border border-[#3A2A1E]">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-1">
                    Hola, <span className="text-[#E29547]">{clientData.name.split(' ')[0]}</span>
                  </h2>
                  <p className="text-white/70">Qué bueno verte de nuevo.</p>
                </div>
                <div className="flex items-center gap-4 bg-[#1A120D] p-4 rounded-xl border border-[#3A2A1E]">
                  <div className="p-2 bg-yellow-500/10 rounded-lg">
                    <Star className="w-6 h-6 text-yellow-500" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-white/80 uppercase tracking-wider">Fidelización</p>
                    <p className="text-xl font-bold text-white">{clientData.visitCount || 1} <span className="text-sm font-normal opacity-70">visitas</span></p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Timbre Card */}
                <div className="bg-[#2C1E16] p-6 sm:p-8 rounded-2xl shadow-xl border border-[#3A2A1E] flex flex-col justify-between">
                  {localStatus ? (
                    <>
                      <div>
                        <h3 className="text-xl font-bold text-white mb-2">Atención Inmediata</h3>
                        <p className="text-white/70 text-sm mb-6">Si ya estás aquí, avísanos para atenderte.</p>
                      </div>
                      <div className="flex flex-col items-center flex-1 justify-center bg-[#1A120D] p-6 rounded-xl border border-[#3A2A1E] mb-6">
                        <p className="text-sm font-medium text-white/80 uppercase tracking-wider mb-4">Estado del Local</p>
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`w-4 h-4 rounded-full animate-pulse ${
                            localStatus.status === 'LIBRE' ? 'bg-green-500' :
                            localStatus.status === 'OCUPADO' ? 'bg-yellow-500' : 'bg-red-500'
                          }`} />
                          <span className={`text-2xl font-bold tracking-widest ${
                            localStatus.status === 'LIBRE' ? 'text-green-500' :
                            localStatus.status === 'OCUPADO' ? 'text-yellow-500' : 'text-red-500'
                          }`}>
                            {localStatus.status}
                          </span>
                        </div>
                      </div>
                      
                      <button 
                        onClick={handleRingBell}
                        disabled={isLoading || localStatus.status !== 'LIBRE' || message.type === 'success'}
                        className="w-full flex items-center justify-center gap-3 bg-[#E29547] hover:bg-[#F2A65A] text-white py-4 rounded-xl font-bold text-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 shadow-lg"
                      >
                        <Bell className="w-6 h-6" />
                        {isLoading ? 'Notificando...' : 'Tocar Timbre'}
                      </button>
                      {localStatus.status !== 'LIBRE' && !message.type && (
                        <p className="text-xs text-white/50 mt-3 text-center">El timbre solo está disponible cuando el local está LIBRE.</p>
                      )}
                    </>
                  ) : (
                    <p className="text-white/50 text-center">Conectando estado del local...</p>
                  )}
                </div>

                {/* Agendar Visita Card */}
                <div className="bg-[#2C1E16] p-6 sm:p-8 rounded-2xl shadow-xl border border-[#3A2A1E] flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Agendar Visita</h3>
                    <p className="text-white/70 text-sm mb-6">Reserva tu hora aproximada de llegada.</p>
                  </div>
                  
                  {bookMessage.text && (
                    <div className={`p-4 rounded-lg mb-6 flex items-start gap-3 border ${
                      bookMessage.type === 'error' 
                        ? 'bg-red-900/20 border-red-500/50 text-red-400' 
                        : 'bg-green-900/20 border-green-500/50 text-green-400'
                    }`}>
                      {bookMessage.type === 'error' ? <AlertCircle className="w-5 h-5 shrink-0" /> : <CheckCircle className="w-5 h-5 shrink-0" />}
                      <span className="text-sm font-medium">{bookMessage.text}</span>
                    </div>
                  )}

                  <form onSubmit={handleBook} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-white opacity-90 mb-1">Nombre</label>
                      <input 
                        type="text" 
                        required 
                        readOnly
                        value={clientData.name}
                        className="bg-[#3A2A1E] text-white opacity-70 cursor-not-allowed border-none rounded-lg p-3 w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white opacity-90 mb-1">Teléfono</label>
                      <input 
                        type="tel" 
                        required 
                        readOnly
                        value={clientData.phone || phone}
                        className="bg-[#3A2A1E] text-white opacity-70 cursor-not-allowed border-none rounded-lg p-3 w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white opacity-90 mb-1">Hora de llegada (Aprox)</label>
                      <input 
                        type="time" 
                        required 
                        value={expectedTime}
                        onChange={(e) => setExpectedTime(e.target.value)}
                        className="bg-[#3A2A1E] text-white focus:ring-2 focus:ring-[#E29547] border-none rounded-lg p-3 w-full transition-all"
                      />
                    </div>
                    <button 
                      type="submit" 
                      disabled={isBooking || !expectedTime}
                      className="bg-[#E29547] hover:bg-[#F2A65A] text-white font-bold rounded-lg transition-all p-3 w-full mt-2 disabled:opacity-50"
                    >
                      {isBooking ? 'Agendando...' : 'Confirmar Cita'}
                    </button>
                  </form>
                </div>
              </div>

              {/* Lado inferior: Catálogo */}
              <div className="bg-[#1A120D] p-6 rounded-2xl border border-[#3A2A1E] overflow-hidden flex flex-col">
                <div className="flex items-center gap-3 mb-6 shrink-0">
                  <ImageIcon className="w-6 h-6 text-[#E29547]" />
                  <h3 className="text-xl font-bold text-white">Catálogo de Servicios</h3>
                </div>
                
                <div className="flex-1 overflow-x-auto pb-4 custom-scrollbar">
                  {gallery.length === 0 ? (
                    <p className="text-white/50 text-center py-10 border border-dashed border-[#3A2A1E] rounded-xl">
                      No hay diseños disponibles en este momento.
                    </p>
                  ) : (
                    <div className="flex gap-4">
                      {gallery.map(item => (
                        <div key={item.id} className="min-w-[250px] bg-[#2C1E16] rounded-2xl overflow-hidden border border-[#3A2A1E] shadow-sm flex flex-col group hover:border-[#E29547] transition-all">
                          <div className="h-40 w-full overflow-hidden bg-[#1A120D]">
                            {item.imageUrl ? (
                              <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ImageIcon className="w-8 h-8 text-white opacity-20" />
                              </div>
                            )}
                          </div>
                          <div className="p-4 flex flex-col flex-1 justify-between">
                            <h4 className="font-bold text-white text-md leading-tight mb-2 line-clamp-2">{item.title}</h4>
                            <p className="text-[#E29547] font-semibold">{formatCOP(item.price)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

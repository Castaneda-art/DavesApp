import { useState, useEffect } from 'react';
import { UserPlus, Users, Mail, Phone, Lock, Calendar, CheckCircle, AlertCircle } from 'lucide-react';

export default function ColaboradorasAdmin() {
  const [colaboradoras, setColaboradoras] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: ''
  });

  const fetchColaboradoras = async () => {
    try {
      const token = localStorage.getItem('salon_token');
      const res = await fetch('https://davesapp.onrender.com/api/colaboradoras', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await res.json();
      if (result.success) {
        setColaboradoras(result.data);
      }
    } catch (error) {
      console.error('Error fetching colaboradoras:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchColaboradoras();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('salon_token');
      const res = await fetch('https://davesapp.onrender.com/api/colaboradoras', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const result = await res.json();

      if (result.success) {
        setMessage({ type: 'success', text: 'Colaboradora registrada con exito' });
        setColaboradoras(prev => [result.data, ...prev]);
        setFormData({ name: '', phone: '', email: '', password: '' });
      } else {
        setMessage({ type: 'error', text: result.message || 'Error al registrar colaboradora' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error de conexion con el servidor' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#150E08] text-gray-100 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto animate-fade-in space-y-8">
        <header className="mb-4">
          <h2 className="text-3xl font-bold text-white">Gestion de Colaboradoras</h2>
          <p className="text-white/70 mt-1">Registra y administra el equipo de trabajo y sus accesos al sistema.</p>
        </header>

        {message.text && (
          <div className={`p-4 rounded-xl flex items-center gap-3 border ${
            message.type === 'error'
              ? 'bg-red-900/20 border-red-500/50 text-red-400'
              : 'bg-green-900/20 border-green-500/50 text-green-400'
          }`}>
            {message.type === 'error' ? <AlertCircle className="w-5 h-5 shrink-0" /> : <CheckCircle className="w-5 h-5 shrink-0" />}
            <span className="text-sm font-medium">{message.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Formulario de Registro */}
          <div className="lg:col-span-1 bg-[#2C1E16] p-6 sm:p-8 rounded-2xl shadow-xl border border-[#3A2A1E] h-fit">
            <h3 className="text-xl font-semibold text-white mb-5 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-[#E29547]" />
              Nueva Colaboradora
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">Nombre Completo</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej. Carolina Lopez"
                  className="bg-[#3A2A1E] text-white focus:ring-2 focus:ring-[#E29547] border-none rounded-lg p-3 w-full transition-all placeholder:text-white/30"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">Telefono</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-white/40 absolute left-3 top-3.5" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Ej. 312 987 6543"
                    className="bg-[#3A2A1E] text-white focus:ring-2 focus:ring-[#E29547] border-none rounded-lg p-3 pl-10 w-full transition-all placeholder:text-white/30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">Correo Electronico</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-white/40 absolute left-3 top-3.5" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder="colaboradora@davesapp.com"
                    className="bg-[#3A2A1E] text-white focus:ring-2 focus:ring-[#E29547] border-none rounded-lg p-3 pl-10 w-full transition-all placeholder:text-white/30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">Contrasena Inicial</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-white/40 absolute left-3 top-3.5" />
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Minimo 6 caracteres"
                    className="bg-[#3A2A1E] text-white focus:ring-2 focus:ring-[#E29547] border-none rounded-lg p-3 pl-10 w-full transition-all placeholder:text-white/30"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-4 bg-[#E29547] hover:bg-[#F2A65A] text-white font-bold py-3 rounded-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#E29547]/30 active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? 'Registrando...' : 'Registrar Colaboradora'}
              </button>
            </form>
          </div>

          {/* Tabla / Lista de Colaboradoras */}
          <div className="lg:col-span-2 bg-[#2C1E16] p-6 sm:p-8 rounded-2xl shadow-xl border border-[#3A2A1E] flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-[#E29547]" />
                Equipo de Colaboradoras
              </h3>
              <span className="bg-[#1A120D] text-xs font-semibold px-3 py-1 rounded-full border border-[#3A2A1E] text-[#E29547]">
                {colaboradoras.length} registradas
              </span>
            </div>

            {isLoading ? (
              <p className="text-white/50 text-center py-10">Cargando colaboradoras...</p>
            ) : colaboradoras.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 opacity-60 border border-dashed border-[#3A2A1E] rounded-xl my-auto">
                <Users className="w-12 h-12 text-gray-400 mb-4" />
                <p className="text-gray-400 text-center font-medium">No hay colaboradoras registradas todavia.</p>
                <p className="text-xs text-gray-500 mt-1">Usa el formulario lateral para agregar a tu primera colaboradora.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-[#3A2A1E] text-white/60">
                      <th className="pb-3 font-semibold">Nombre</th>
                      <th className="pb-3 font-semibold">Contacto</th>
                      <th className="pb-3 font-semibold">Rol</th>
                      <th className="pb-3 font-semibold">Fecha de Ingreso</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#3A2A1E]">
                    {colaboradoras.map(c => (
                      <tr key={c.id} className="hover:bg-[#1A120D]/60 transition-colors">
                        <td className="py-4 font-bold text-white">
                          <p>{c.name}</p>
                          <span className="text-xs font-normal text-white/50">{c.email}</span>
                        </td>
                        <td className="py-4 text-white/80">
                          {c.phone || <span className="text-white/30 italic">Sin telefono</span>}
                        </td>
                        <td className="py-4">
                          <span className="bg-[#E29547]/20 text-[#E29547] border border-[#E29547]/30 text-xs px-2.5 py-1 rounded-md font-semibold">
                            {c.role}
                          </span>
                        </td>
                        <td className="py-4 text-white/60">
                          <span className="flex items-center gap-1.5 text-xs">
                            <Calendar className="w-3.5 h-3.5 text-[#E29547]" />
                            {new Date(c.createdAt).toLocaleDateString()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

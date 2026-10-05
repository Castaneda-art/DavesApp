import { useState, useEffect } from 'react';
import { Calendar, CheckCircle, XCircle, CalendarX } from 'lucide-react';

export default function Agenda() {
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAppointments = async () => {
    try {
      const res = await fetch('https://davesapp.onrender.com/api/appointments');
      const result = await res.json();
      if (result.success) {
        setAppointments(result.data);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`https://davesapp.onrender.com/api/appointments/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const result = await res.json();
      if (result.success) {
        fetchAppointments();
      }
    } catch (error) {
      console.error('Error updating appointment:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDIENTE': return 'text-yellow-400 bg-yellow-500/20';
      case 'COMPLETADO': return 'text-green-400 bg-green-500/20';
      case 'CANCELADO': return 'text-red-400 bg-red-500/20';
      default: return 'text-white bg-white/20';
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#150E08] text-gray-100 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto animate-fade-in space-y-8">
        <header className="mb-4">
          <h2 className="text-3xl font-bold text-white flex items-center gap-3">
            <Calendar className="w-8 h-8 text-[#E29547]" />
            Agenda del Dia
          </h2>
          <p className="text-white/70 mt-1">Gestion de citas y reservas para hoy.</p>
        </header>

        <div className="bg-[#2C1E16] rounded-2xl shadow-xl border border-[#3A2A1E] p-6 sm:p-8 transition-colors duration-300 hover:border-[#E29547]/50">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-8 opacity-60">
              <p className="text-gray-400 mt-4">Cargando citas...</p>
            </div>
          ) : appointments.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 opacity-60">
              <CalendarX className="w-12 h-12 text-gray-400 mb-4" />
              <p className="text-gray-400">No hay citas registradas para hoy.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {appointments.map((appt) => (
                <div key={appt.id} className="bg-[#1A120D] p-6 rounded-xl border border-[#3A2A1E] flex flex-col justify-between hover:border-[#E29547]/50 transition-colors duration-300">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-xl text-white line-clamp-1">{appt.clientName}</h3>
                      <span className={`rounded-full px-3 py-1 text-sm font-semibold uppercase tracking-wider ${getStatusColor(appt.status)}`}>
                        {appt.status}
                      </span>
                    </div>
                    <p className="text-[#E29547] font-semibold text-xl mb-1">{appt.expectedTime}</p>
                    {appt.phone && <p className="text-sm text-white/60 mb-4">{appt.phone}</p>}
                  </div>
                  
                  {appt.status === 'PENDIENTE' && (
                    <div className="flex gap-2 mt-4">
                      <button 
                        onClick={() => handleUpdateStatus(appt.id, 'COMPLETADO')}
                        className="flex-1 bg-green-900/30 hover:bg-green-900/50 text-green-400 py-2.5 rounded-lg font-bold text-sm border border-green-500/20 flex items-center justify-center gap-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-green-500/30 active:scale-95"
                      >
                        <CheckCircle className="w-4 h-4" /> Llego
                      </button>
                      <button 
                        onClick={() => handleUpdateStatus(appt.id, 'CANCELADO')}
                        className="flex-1 bg-red-900/30 hover:bg-red-900/50 text-red-400 py-2.5 rounded-lg font-bold text-sm border border-red-500/20 flex items-center justify-center gap-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-red-500/30 active:scale-95"
                      >
                        <XCircle className="w-4 h-4" /> Cancelar
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

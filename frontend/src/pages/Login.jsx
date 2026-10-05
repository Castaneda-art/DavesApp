import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('https://davesapp.onrender.com/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const result = await res.json();
      
      if (result.success) {
        localStorage.setItem('salon_token', result.data.token);
        localStorage.setItem('salon_role', result.data.role);
        localStorage.setItem('salon_name', result.data.name);
        if (result.data.role === 'COLABORADORA') {
          navigate('/colaboradora');
        } else {
          navigate('/');
        }
      } else {
        setError(result.message || 'Credenciales invalidas');
      }
    } catch (err) {
      setError('Error de conexion con el servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-cover bg-center" style={{ backgroundImage: "url('https://pub-f33fcc608cb6407cb590042f167dab55.r2.dev/barber-shop-attributes-doodle-seamless-pattern_1284-11894.avif')" }}>
      {/* Overlay oscuro para legibilidad */}
      <div className="absolute inset-0 bg-[#1A120B]/85"></div>

      {/* Contenedor del Formulario (Tarjeta) */}
      <div className="relative z-10 bg-[#2C1E16] p-8 sm:p-10 rounded-2xl shadow-2xl max-w-md w-full mx-auto m-4">
        
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#E29547] tracking-wide mb-2">DavesApp</h1>
          <p className="text-[#FAFAFA]/70 text-sm">Acceso exclusivo para el personal</p>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-500/50 text-red-400 p-3 rounded-lg text-sm text-center mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-[#FAFAFA]/90 mb-2 flex items-center gap-2">
              <User className="w-4 h-4 text-[#E29547]" />
              Usuario o Correo
            </label>
            <input 
              type="text" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-[#3A2A1E] text-white focus:ring-2 focus:ring-[#E29547] border-none rounded-lg p-3 w-full transition-all placeholder:text-[#FAFAFA]/30"
              placeholder="admin@davesapp.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#FAFAFA]/90 mb-2 flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#E29547]" />
              Contrasena
            </label>
            <input 
              type="password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-[#3A2A1E] text-white focus:ring-2 focus:ring-[#E29547] border-none rounded-lg p-3 w-full transition-all placeholder:text-[#FAFAFA]/30"
              placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="bg-[#E29547] hover:bg-[#F2A65A] text-white font-bold rounded-lg transition-all p-3 w-full mt-4 disabled:opacity-50"
          >
            {isLoading ? 'Autenticando...' : 'Ingresar'}
          </button>
        </form>
        
      </div>
    </div>
  );
}

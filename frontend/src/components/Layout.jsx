import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, DollarSign, Users, Store, Scissors, ShoppingBag, LogOut, Calendar } from 'lucide-react';

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const role = localStorage.getItem('salon_role');

  const navItems = [
    { name: 'Inicio', path: '/', icon: <Home size={20} />, roles: ['ADMINISTRADORA'] },
    { name: 'Caja/Transacciones', path: '/caja', icon: <DollarSign size={20} />, roles: ['ADMINISTRADORA'] },
    { name: 'Clientes', path: '/clientes', icon: <Users size={20} />, roles: ['ADMINISTRADORA'] },
    { name: 'Panel Colaboradora', path: '/colaboradora', icon: <Scissors size={20} />, roles: ['ADMINISTRADORA', 'COLABORADORA'] },
    { name: 'Vitrina', path: '/vitrina', icon: <ShoppingBag size={20} />, roles: ['ADMINISTRADORA'] },
    { name: 'Agenda', path: '/agenda', icon: <Calendar size={20} />, roles: ['ADMINISTRADORA'] },
  ];

  const filteredNavItems = navItems.filter(item => item.roles.includes(role));

  const handleLogout = () => {
    localStorage.removeItem('salon_token');
    localStorage.removeItem('salon_role');
    localStorage.removeItem('salon_name');
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-salon-dark text-salon-text font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-salon-dark border-r border-salon-card flex flex-col shadow-2xl">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-salon-accent tracking-wide">DavesApp</h1>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {filteredNavItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 p-3 rounded-lg transition-colors duration-200 ${
                  isActive 
                    ? 'bg-salon-accent text-white' 
                    : 'text-salon-text hover:bg-salon-card hover:text-salon-accent'
                }`}
              >
                {item.icon}
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-salon-card">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 p-3 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors duration-200"
          >
            <LogOut size={20} />
            <span className="font-medium">Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-salon-dark p-8">
        <Outlet />
      </main>
    </div>
  );
}

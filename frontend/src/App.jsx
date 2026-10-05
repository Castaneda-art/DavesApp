import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Caja from './pages/Caja';
import Clientes from './pages/Clientes';
import Colaboradora from './pages/Colaboradora';
import Vitrina from './pages/Vitrina';
import Agenda from './pages/Agenda';
import Login from './pages/Login';
import VistaCliente from './pages/VistaCliente';

// Componente para proteger las rutas administrativas
const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('salon_token');
  const role = localStorage.getItem('salon_role');
  
  if (!token) {
    // Si no hay token en LocalStorage, lo redirigimos a la pantalla de login
    return <Navigate to="/login" replace />;
  }

  // Si hay roles permitidos y el rol actual no estÃ¡ en la lista
  if (allowedRoles && !allowedRoles.includes(role)) {
    if (role === 'COLABORADORA') {
      return <Navigate to="/colaboradora" replace />;
    }
    return <Navigate to="/" replace />;
  }
  
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas PÃºblicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/publico" element={<VistaCliente />} />
        
        {/* Rutas Protegidas (Requieren autenticaciÃ³n) */}
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<ProtectedRoute allowedRoles={['ADMINISTRADORA']}><Dashboard /></ProtectedRoute>} />
          <Route path="caja" element={<ProtectedRoute allowedRoles={['ADMINISTRADORA']}><Caja /></ProtectedRoute>} />
          <Route path="clientes" element={<ProtectedRoute allowedRoles={['ADMINISTRADORA']}><Clientes /></ProtectedRoute>} />
          <Route path="colaboradora" element={<ProtectedRoute allowedRoles={['ADMINISTRADORA', 'COLABORADORA']}><Colaboradora /></ProtectedRoute>} />
          <Route path="vitrina" element={<ProtectedRoute allowedRoles={['ADMINISTRADORA']}><Vitrina /></ProtectedRoute>} />
          <Route path="agenda" element={<ProtectedRoute allowedRoles={['ADMINISTRADORA']}><Agenda /></ProtectedRoute>} />
        </Route>

        {/* Catch-all para redirigir a una ruta vÃ¡lida si se escribe cualquier otra cosa */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

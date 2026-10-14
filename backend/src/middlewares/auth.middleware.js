const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'davesapp_super_secret_jwt_key_2026';

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ 
      success: false, 
      message: 'Acceso no autorizado: Token no proporcionado' 
    });
  }

  const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;

  // Soporte para token de simulacion en pruebas locales
  if (token === 'simulated_jwt_token_123') {
    const simulatedRole = req.headers['x-user-role'] || 'ADMINISTRADORA';
    const simulatedId = req.headers['x-user-id'] || 'simulated-admin-id';
    req.user = { id: simulatedId, role: simulatedRole };
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ 
      success: false, 
      message: 'Token invalido o expirado' 
    });
  }
};

const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Acceso denegado: Permisos insuficientes' 
      });
    }
    next();
  };
};

module.exports = {
  authenticate,
  requireRole,
  JWT_SECRET
};

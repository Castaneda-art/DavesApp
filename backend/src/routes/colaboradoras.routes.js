const express = require('express');
const bcrypt = require('bcryptjs');
const prisma = require('../config/prisma');
const { authenticate, requireRole } = require('../middlewares/auth.middleware');

const router = express.Router();

// GET /api/colaboradoras - Listar colaboradoras (Solo Administradora)
router.get('/', authenticate, requireRole('ADMINISTRADORA'), async (req, res) => {
  try {
    const colaboradoras = await prisma.user.findMany({
      where: { role: 'COLABORADORA' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, data: colaboradoras });
  } catch (error) {
    console.error('Error al listar colaboradoras:', error);
    res.status(500).json({ success: false, message: 'Error interno al obtener colaboradoras' });
  }
});

// POST /api/colaboradoras - Registrar colaboradora (Solo Administradora)
router.post('/', authenticate, requireRole('ADMINISTRADORA'), async (req, res) => {
  const { name, phone, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ 
      success: false, 
      message: 'Nombre, correo y contrasena son obligatorios' 
    });
  }

  try {
    // Validar si el correo ya esta registrado
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'Ya existe un usuario con este correo electronico' 
      });
    }

    // Hashear contrasena con bcrypt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const nuevaColaboradora = await prisma.user.create({
      data: {
        name,
        phone: phone || null,
        email,
        password: hashedPassword,
        role: 'COLABORADORA'
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true
      }
    });

    res.status(201).json({ success: true, data: nuevaColaboradora });
  } catch (error) {
    console.error('Error al registrar colaboradora:', error);
    res.status(500).json({ success: false, message: 'Error interno al registrar colaboradora' });
  }
});

module.exports = router;

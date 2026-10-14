const express = require('express');
const prisma = require('../config/prisma');
const { authenticate, requireRole } = require('../middlewares/auth.middleware');

const router = express.Router();

// GET /api/collaborator/clients - Listar clientes propios de la colaboradora
router.get('/', authenticate, requireRole('COLABORADORA', 'ADMINISTRADORA'), async (req, res) => {
  try {
    const collaboratorId = req.user.id;

    const clients = await prisma.clientProfile.findMany({
      where: { createdById: collaboratorId },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, data: clients });
  } catch (error) {
    console.error('Error al obtener clientes de colaboradora:', error);
    res.status(500).json({ success: false, message: 'Error interno al obtener clientes' });
  }
});

// POST /api/collaborator/clients - Registrar cliente propio de la colaboradora
router.post('/', authenticate, requireRole('COLABORADORA', 'ADMINISTRADORA'), async (req, res) => {
  const { name, phone, notes } = req.body;
  const collaboratorId = req.user.id;

  if (!name) {
    return res.status(400).json({ 
      success: false, 
      message: 'El nombre del cliente es obligatorio' 
    });
  }

  try {
    const newClient = await prisma.clientProfile.create({
      data: {
        name,
        phone: phone || null,
        notes: notes || null,
        createdById: collaboratorId,
        category: 'HABITUAL',
        visitCount: 1
      }
    });

    res.status(201).json({ success: true, data: newClient });
  } catch (error) {
    console.error('Error al registrar cliente de colaboradora:', error);
    res.status(500).json({ success: false, message: 'Error interno al registrar cliente' });
  }
});

module.exports = router;

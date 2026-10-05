const express = require('express');
const cors = require('cors');
const prisma = require('./config/prisma');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// === ENDPOINTS DE AUTENTICACIÓN Y SEGURIDAD ===

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || user.password !== password) {
      return res.status(401).json({ success: false, message: 'Credenciales incorrectas' });
    }

    res.json({
      success: true,
      data: { 
        id: user.id, 
        name: user.name, 
        role: user.role, 
        token: 'simulated_jwt_token_123' 
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

app.post('/api/auth/client', async (req, res) => {
  const { phone } = req.body;
  try {
    const client = await prisma.clientProfile.findFirst({
      where: { phone }
    });
    if (client) {
      return res.json({ 
        success: true, 
        exists: true, 
        data: { ...client, visitCount: client.visitCount } 
      });
    }
    
    res.json({ success: true, exists: false });
  } catch (error) {
    console.error('Error validando cliente:', error);
    res.status(500).json({ success: false, message: 'Error de servidor' });
  }
});


// === ENDPOINTS RESTANTES (STATUS, CAJA, CLIENTES, COLABORADORA, VITRINA) ===

// Dashboard
app.get('/api/dashboard', async (req, res) => {
  try {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const admin = await prisma.user.findFirst({ where: { role: 'ADMINISTRADORA' } });
    const adminFilter = admin ? { performedById: admin.id } : {};

    const baseWhere = {
      createdAt: { gte: startOfDay, lte: endOfDay },
      ...adminFilter
    };

    const clientesAtendidos = await prisma.transaction.count({
      where: {
        ...baseWhere,
        type: { in: ['CORTE', 'TRENZA_PEINADO'] }
      }
    });

    const transactions = await prisma.transaction.findMany({
      where: baseWhere
    });

    let ingresosServicios = 0;
    let ingresosProductos = 0;

    transactions.forEach(tx => {
      if (tx.type === 'VITRINA') {
        ingresosProductos += tx.amount;
      } else if (tx.type === 'CORTE' || tx.type === 'TRENZA_PEINADO') {
        ingresosServicios += tx.amount;
      }
    });

    res.json({ success: true, clientesAtendidos, ingresosServicios, ingresosProductos });
  } catch (error) {
    console.error('Error en GET /api/dashboard:', error);
    res.status(500).json({ success: false, message: 'Error al obtener datos del dashboard' });
  }
});

// Status
app.get('/api/status', async (req, res) => {
  try {
    const statuses = await prisma.localStatus.findMany();
    res.json({ success: true, data: statuses });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error de base de datos' });
  }
});

app.put('/api/status/notify', async (req, res) => {
  try {
    const localStatus = await prisma.localStatus.findFirst();
    if (!localStatus) return res.status(404).json({ success: false, message: 'Estado no encontrado' });
    const updated = await prisma.localStatus.update({
      where: { id: localStatus.id },
      data: { clientWaiting: true }
    });
    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error en PUT /api/status/notify:', error);
    res.status(500).json({ success: false, message: 'Error al notificar' });
  }
});

app.put('/api/status/clear', async (req, res) => {
  try {
    const localStatus = await prisma.localStatus.findFirst();
    if (!localStatus) return res.status(404).json({ success: false, message: 'Estado no encontrado' });
    const updated = await prisma.localStatus.update({
      where: { id: localStatus.id },
      data: { clientWaiting: false }
    });
    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error en PUT /api/status/clear:', error);
    res.status(500).json({ success: false, message: 'Error al limpiar alerta' });
  }
});

app.put('/api/status/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const updatedStatus = await prisma.localStatus.update({
      where: { id: id },
      data: { status: status.toUpperCase() }
    });
    res.json({ success: true, data: updatedStatus });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al actualizar el estado' });
  }
});

// Caja / Transacciones
app.get('/api/transactions', async (req, res) => {
  try {
    const transactions = await prisma.transaction.findMany({ 
      orderBy: { createdAt: 'desc' },
      include: { performedBy: true }
    });
    res.json({ success: true, data: transactions });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener transacciones' });
  }
});

app.post('/api/transactions', async (req, res) => {
  const { type, amount, clientCategory, description, clientId, clientName, performedById, productId } = req.body;
  try {
    let user = null;
    if (performedById) {
      user = await prisma.user.findUnique({ where: { id: performedById } });
    }
    
    if (!user) {
      user = await prisma.user.findFirst({ where: { role: 'ADMINISTRADORA' } });
      if (!user) {
        user = await prisma.user.create({ data: { name: "Admin Administradora", role: "ADMINISTRADORA" } });
      }
    }

    let finalDescription = description || '';
    if (clientCategory === 'HABITUAL' && clientId) {
      await prisma.clientProfile.update({ 
        where: { id: clientId }, 
        data: { visitCount: { increment: 1 } } 
      });
      if (clientName) finalDescription = `${finalDescription} (Atención a: ${clientName})`.trim();
    } else if (clientCategory === 'NUEVO' && clientName) {
      finalDescription = `${finalDescription} (Atención a: ${clientName})`.trim();
      try {
        if (clientName.toLowerCase() === 'cliente de paso') {
          let existingPaso = await prisma.clientProfile.findFirst({
            where: { name: 'Cliente de Paso' }
          });
          if (existingPaso) {
            await prisma.clientProfile.update({
              where: { id: existingPaso.id },
              data: { visitCount: { increment: 1 } }
            });
          } else {
            await prisma.clientProfile.create({ data: { name: 'Cliente de Paso', createdById: user.id } });
          }
        } else {
          const { seasonTag } = req.body;
          const newClientData = { name: clientName, createdById: user.id };
          if (seasonTag && seasonTag !== 'Ninguna') newClientData.seasonTag = seasonTag;
          await prisma.clientProfile.create({ data: newClientData });
        }
      } catch (err) {
        console.error('Error auto-creando cliente:', err);
      }
    }

    if (type === 'VITRINA' && productId) {
      await prisma.product.update({
        where: { id: productId },
        data: { stock: { decrement: 1 } }
      });
    }

    const transaction = await prisma.transaction.create({
      data: {
        type,
        amount: parseFloat(amount),
        clientCategory: type === 'GASTO_LOCAL' ? null : clientCategory,
        description: finalDescription,
        performedById: user.id
      }
    });
    res.json({ success: true, data: transaction });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al crear la transacción' });
  }
});

// Clientes
app.get('/api/clients', async (req, res) => {
  try {
    const clients = await prisma.clientProfile.findMany({ orderBy: { name: 'asc' } });
    res.json({ success: true, data: clients });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener clientes' });
  }
});

app.post('/api/clients', async (req, res) => {
  const { name, phone, notes, age, seasonTag } = req.body;
  try {
    const admin = await prisma.user.findFirst({ where: { role: 'ADMINISTRADORA' } });
    if (!admin) throw new Error("No se encontró administradora");

    const data = { name, phone, notes, createdById: admin.id };
    if (age !== undefined) data.age = parseInt(age, 10);
    if (seasonTag && seasonTag !== 'Ninguna') data.seasonTag = seasonTag;

    const client = await prisma.clientProfile.create({ data });
    res.json({ success: true, data: client });
  } catch (error) {
    console.error("Error en POST /api/clients:", error);
    res.status(500).json({ error: error.message });
  }
});

// Colaboradora
app.get('/api/transactions/collaborator', async (req, res) => {
  try {
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const collaborator = await prisma.user.findFirst({ where: { role: 'COLABORADORA' } });
    
    if (!collaborator) {
      return res.json({ success: true, data: [] });
    }

    const transactions = await prisma.transaction.findMany({
      where: { 
        type: 'TRENZA_PEINADO', 
        createdAt: { gte: startOfToday },
        performedById: collaborator.id
      },
      orderBy: { createdAt: 'desc' },
      include: { performedBy: true }
    });
    res.json({ success: true, data: transactions, collaboratorId: collaborator.id });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener ingresos' });
  }
});

app.get('/api/gallery', async (req, res) => {
  try {
    const gallery = await prisma.galleryItem.findMany({ orderBy: { createdAt: 'desc' } });
    res.json({ success: true, data: gallery });
  } catch (error) {
    console.error("Error en GET /api/gallery:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/gallery', async (req, res) => {
  const { title, imageUrl, price } = req.body;
  try {
    const collaborator = await prisma.user.findFirst({ where: { role: 'COLABORADORA' } });
    if (!collaborator) throw new Error("No se encontró colaboradora");

    const item = await prisma.galleryItem.create({
      data: { 
        title, 
        imageUrl, 
        price: parseFloat(price), 
        collaboratorId: collaborator.id 
      }
    });
    res.json({ success: true, data: item });
  } catch (error) {
    console.error("Error en POST /api/gallery:", error);
    res.status(500).json({ error: error.message });
  }
});

// Vitrina
app.get('/api/inventory', async (req, res) => {
  try {
    const products = await prisma.product.findMany({ orderBy: { stock: 'asc' } });
    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener inventario' });
  }
});

app.post('/api/inventory', async (req, res) => {
  const { name, price, stock } = req.body;
  try {
    const product = await prisma.product.create({
      data: { 
        name, 
        salePrice: parseFloat(price), 
        stock: parseInt(stock, 10) 
      }
    });
    res.json({ success: true, data: product });
  } catch (error) {
    console.error("Error en POST /api/inventory:", error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/inventory/:id/sell', async (req, res) => {
  try {
    const product = await prisma.product.findUnique({ where: { id: req.params.id } });
    if (!product || product.stock < 1) {
      return res.status(400).json({ success: false, message: 'Sin stock' });
    }
    
    const admin = await prisma.user.findFirst({ where: { role: 'ADMINISTRADORA' } });
    if (!admin) throw new Error("No se encontró administradora");

    const updatedProduct = await prisma.product.update({
      where: { id: req.params.id },
      data: { stock: { decrement: 1 } }
    });
    
    await prisma.transaction.create({
      data: {
        type: 'VITRINA', 
        amount: product.salePrice, 
        performedById: admin.id, 
        description: `Venta de vitrina: ${product.name}`
      }
    });

    res.json({ success: true, data: updatedProduct });
  } catch (error) {
    console.error("Error en PUT /api/inventory/:id/sell:", error);
    res.status(500).json({ error: error.message });
  }
});
// Agenda / Citas
app.post('/api/appointments', async (req, res) => {
  const { clientName, phone, expectedTime } = req.body;
  try {
    const appointment = await prisma.appointment.create({
      data: { clientName, phone, expectedTime }
    });
    res.json({ success: true, data: appointment });
  } catch (error) {
    console.error("Error en POST /api/appointments:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/appointments', async (req, res) => {
  try {
    // Get today's start and end times
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const appointments = await prisma.appointment.findMany({
      where: {
        createdAt: {
          gte: startOfToday,
          lte: endOfToday
        }
      },
      orderBy: { expectedTime: 'asc' }
    });
    res.json({ success: true, data: appointments });
  } catch (error) {
    console.error("Error en GET /api/appointments:", error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/appointments/:id/status', async (req, res) => {
  const { status } = req.body;
  try {
    const appointment = await prisma.appointment.update({
      where: { id: req.params.id },
      data: { status }
    });
    res.json({ success: true, data: appointment });
  } catch (error) {
    console.error("Error en PUT /api/appointments/:id/status:", error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});

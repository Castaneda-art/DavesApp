const express = require('express');
const prisma = require('../config/prisma');

const router = express.Router();

// GET /api/dashboard/stats - Estadisticas agrupadas para graficas de Recharts
router.get('/stats', async (req, res) => {
  try {
    const dayNames = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
    const today = new Date();
    
    // 1. Obtener rango de los ultimos 7 dias
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    // Inicializar mapa de los ultimos 7 dias
    const weeklyDataMap = {};
    for (let i = 0; i < 7; i++) {
      const d = new Date(sevenDaysAgo);
      d.setDate(sevenDaysAgo.getDate() + i);
      const key = d.toISOString().split('T')[0];
      const dayLabel = `${dayNames[d.getDay()]} ${d.getDate()}`;
      weeklyDataMap[key] = {
        day: dayLabel,
        date: key,
        ingresos: 0,
        gastos: 0
      };
    }

    // Traer transacciones de los ultimos 7 dias
    const transactions = await prisma.transaction.findMany({
      where: {
        createdAt: {
          gte: sevenDaysAgo
        }
      }
    });

    // Agrupar ingresos y gastos por dia
    transactions.forEach(tx => {
      const txKey = new Date(tx.createdAt).toISOString().split('T')[0];
      if (weeklyDataMap[txKey]) {
        if (tx.type === 'GASTO_LOCAL') {
          weeklyDataMap[txKey].gastos += Number(tx.amount);
        } else {
          // CORTE, VITRINA, TRENZA_PEINADO
          weeklyDataMap[txKey].ingresos += Number(tx.amount);
        }
      }
    });

    const weeklyComparison = Object.values(weeklyDataMap);

    // 2. Proporcion de Clientes Habituales vs Nuevos
    const habitualesTxCount = await prisma.transaction.count({
      where: { clientCategory: 'HABITUAL' }
    });
    const nuevosTxCount = await prisma.transaction.count({
      where: { clientCategory: 'NUEVO' }
    });

    // Si no hay transacciones categorizadas aun, consultar la tabla ClientProfile
    let countHabituales = habitualesTxCount;
    let countNuevos = nuevosTxCount;

    if (countHabituales === 0 && countNuevos === 0) {
      countHabituales = await prisma.clientProfile.count({
        where: { category: 'HABITUAL' }
      });
      countNuevos = await prisma.clientProfile.count({
        where: { category: 'NUEVO' }
      });
    }

    const clientProportion = [
      { name: 'Habituales', value: countHabituales },
      { name: 'Nuevos', value: countNuevos }
    ];

    res.json({
      success: true,
      data: {
        weeklyComparison,
        clientProportion
      }
    });
  } catch (error) {
    console.error('Error al generar estadisticas para dashboard:', error);
    res.status(500).json({ success: false, message: 'Error al generar estadisticas' });
  }
});

module.exports = router;

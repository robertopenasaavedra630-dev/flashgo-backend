const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors());
app.use(express.json());

// Configuración de conexión a Supabase
const SUPABASE_URL = process.env.SUPABASE_URL || 'TU_SUPABASE_URL_AQUI';
const SUPABASE_KEY = process.env.SUPABASE_KEY || 'TU_SUPABASE_KEY_AQUI';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// RUTA DE PRUEBA
app.get('/', (req, res) => {
    res.send('Servidor de FlashGo activo y funcionando');
});

// RUTA: CALCULAR PRECIO ESTIMADO DEL VIAJE
app.post('/api/viajes/calcular-precio', async (req, res) => {
    const { provincia, categoria, distancia_km, tiempo_minutos } = req.body;

    try {
        const { data: tarifa, error } = await supabase
            .from('tarifas')
            .select('*')
            .eq('provincia', provincia)
            .eq('categoria', categoria)
            .eq('activa', true)
            .single();

        if (error || !tarifa) {
            return res.status(404).json({ error: 'Tarifa no encontrada para esta zona' });
        }

        let subtotal = Number(tarifa.tarifa_base) + 
                       (distancia_km * Number(tarifa.precio_km)) + 
                       (tiempo_minutos * Number(tarifa.precio_minuto));

        let precio_estimado = Math.max(subtotal, Number(tarifa.precio_minimo));

        res.json({
            provincia,
            categoria,
            distancia_km,
            tiempo_minutos,
            precio_estimado: Math.round(precio_estimado)
        });

    } catch (err) {
        res.status(500).json({ error: 'Error en el servidor al calcular precio' });
    }
});
const serverless = require('serverless-http');
module.exports.handler = serverless(app);


const express = require('express');
const axios = require('axios');
const app = express();
const PORT = 3000;

// Usamos la carpeta 'public' para servir los archivos estáticos (HTML, CSS, JS)
app.use(express.static('public'));

const apiURL = 'http://makeup-api.herokuapp.com/api/v1/products.json?brand=';
const marcas = ['maybelline', 'covergirl', 'milani', 'annasui', 'revlon', 'e.l.f', 'l\'oreal', 'clinique', 'nyx', 'glossier'];

// Endpoint para obtener los productos de las marcas
app.get('/productos', async (req, res) => {
    try {
        const promises = marcas.map(marca => axios.get(`${apiURL}${marca}`));
        const productosPorMarca = await Promise.all(promises);
        const todosLosProductos = productosPorMarca.flatMap(respuesta => respuesta.data);
        res.json(todosLosProductos); // Enviamos todos los productos como respuesta en formato JSON
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener productos' });
    }
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const port = 3000;

// Middlewares
app.use(bodyParser.json({ limit: '10mb' }));
app.use(cors());

// Conectar a MongoDB
mongoose.connect('mongodb://localhost:27017/autogpt', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Esquema y Modelo de Mongoose
const DataSchema = new mongoose.Schema({
    detectedParts: Object,
    model: String,
    year: Number,
    transmission: String,
    obdCode: String,
    obdDescription: String,
    image: String // Campo para la imagen en base64
});

const Data = mongoose.model('Data', DataSchema);

// Configuración de Google Generative AI
const genAI = new GoogleGenerativeAI({ apiKey: 'AIzaSyD1uxdNOvUme_8L8CYcBhdS-451HGCesL4' });

// Rutas
app.post('/saveData', async (req, res) => {
    try {
        const newData = new Data(req.body);
        const savedData = await newData.save();
        res.json(savedData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get('/getData', async (req, res) => {
    try {
        const data = await Data.find();
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/generateReport', async (req, res) => {
    const { model, year, transmission, obdCode, obdDescription, detectedParts, image } = req.body;

    const prompt = `
    Genera un reporte detallado del siguiente vehículo y su error OBD:
    Modelo del Auto: ${model}
    Año: ${year}
    Tipo de Transmisión: ${transmission}
    Código OBD: ${obdCode}
    Descripción del Código OBD: ${obdDescription}
    Partes Detectadas: ${JSON.stringify(detectedParts)}
    
    Enfócate en el error OBD y sus posibles soluciones.
    `;

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: image.split(',')[1], // Asumiendo que `image` es una URL de data base64
                    mimeType: 'image/png'
                }
            }
        ]);

        const report = result.response.text();
        res.json({ report });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});

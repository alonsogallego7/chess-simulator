import express from 'express';
const router = express.Router();

router.post('/start', (req, res) => {
    console.log("Jugador iniciando búsqueda...");
    res.json({ status: "searching", message: "Buscando oponente" });
});

router.post('/stop', (req, res) => {
    console.log("Búsqueda cancelada");
    res.json({ status: "stopped", message: "Búsqueda detenida" });
});

export default router;

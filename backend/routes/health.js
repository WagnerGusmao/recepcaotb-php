const express = require('express');
const router = express.Router();

/**
 * @route GET /api/health
 * @description Verifica a saúde da API
 * @access Public
 */
router.get('/', (req, res) => {
    res.status(200).json({
        status: 'ok',
        message: 'API está funcionando corretamente',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

module.exports = router;

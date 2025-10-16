const express = require('express');
const router = express.Router();
const backupManager = require('../backupManager');
const { verificarAuth, verificarTipo } = require('../auth');
const path = require('path');
const fs = require('fs');
const { BACKUP_TYPES } = backupManager;

// Rota para criar um novo backup completo
router.post('/backup', verificarAuth, verificarTipo(['administrador']), async (req, res) => {
    try {
        const backupFile = await backupManager.createBackup();
        res.json({
            success: true,
            message: 'Backup completo criado com sucesso',
            type: BACKUP_TYPES.FULL,
            backupFile: path.basename(backupFile)
        });
    } catch (error) {
        console.error('Erro ao criar backup completo:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao criar backup completo',
            error: error.message
        });
    }
});

// Rota para criar um backup apenas de cadastros
router.post('/backup/cadastro', verificarAuth, verificarTipo(['administrador']), async (req, res) => {
    try {
        const backupFile = await backupManager.createCadastroBackup();
        res.json({
            success: true,
            message: 'Backup de cadastros criado com sucesso',
            type: BACKUP_TYPES.CADASTRO,
            backupFile: path.basename(backupFile)
        });
    } catch (error) {
        console.error('Erro ao criar backup de cadastros:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao criar backup de cadastros',
            error: error.message
        });
    }
});

// Rota para criar um backup apenas de frequências
router.post('/backup/frequencia', verificarAuth, verificarTipo(['administrador']), async (req, res) => {
    try {
        const backupFile = await backupManager.createFrequenciaBackup();
        res.json({
            success: true,
            message: 'Backup de frequências criado com sucesso',
            type: BACKUP_TYPES.FREQUENCIA,
            backupFile: path.basename(backupFile)
        });
    } catch (error) {
        console.error('Erro ao criar backup de frequências:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao criar backup de frequências',
            error: error.message
        });
    }
});

// Rota para listar todos os backups disponíveis
router.get('/backups', verificarAuth, verificarTipo(['administrador']), async (req, res) => {
    console.log('\n=== NOVA REQUISIÇÃO PARA LISTAR BACKUPS ===');
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    console.log('Query params:', req.query);
    
    try {
        console.log('Buscando lista de backups...');
        const backups = await backupManager.listBackups();
        console.log(`Total de backups encontrados: ${backups.length}`);
        
        // Filtra por tipo, se especificado
        const { type } = req.query;
        let filteredBackups = backups;
        
        if (type && Object.values(BACKUP_TYPES).includes(type)) {
            console.log(`Filtrando por tipo: ${type}`);
            let typePrefix;
            if (type === 'cadastro') {
                typePrefix = 'cadastro_backup_';
            } else if (type === 'frequencia') {
                typePrefix = 'frequencia_backup_';
            } else {
                typePrefix = 'recepcaotb_backup_';
            }
            filteredBackups = backups.filter(backup => 
                backup.filename.startsWith(typePrefix)
            );
            console.log(`Backups após filtro (${type}):`, filteredBackups.length);
        }
        
        // Ordena por data de criação (mais recente primeiro)
        const sortedBackups = filteredBackups.sort((a, b) => 
            new Date(b.created) - new Date(a.created)
        );
        
        console.log('Enviando resposta com sucesso');
        res.json({
            success: true,
            message: 'Backups listados com sucesso',
            backups: sortedBackups.map(backup => {
                let backupType = 'full';
                if (backup.filename.startsWith('cadastro_backup_')) {
                    backupType = 'cadastro';
                } else if (backup.filename.startsWith('frequencia_backup_')) {
                    backupType = 'frequencia';
                } else if (backup.filename.startsWith('recepcaotb_backup_')) {
                    backupType = 'full';
                }
                
                return {
                    filename: backup.filename,
                    type: backupType,
                    created: backup.created,
                    size: backup.size,
                    formattedSize: formatFileSize(backup.size)
                };
            })
        });
    } catch (error) {
        console.error('Erro ao listar backups:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao listar backups',
            error: error.message
        });
    }
});

// Função auxiliar para formatar o tamanho do arquivo
function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + ' KB';
    else return (bytes / 1048576).toFixed(2) + ' MB';
}

// Rota para excluir um backup
router.delete('/backups/:filename', verificarAuth, verificarTipo(['administrador']), (req, res) => {
    try {
        const filePath = path.join(__dirname, '..', '..', 'backups', req.params.filename);
        
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                message: 'Arquivo de backup não encontrado'
            });
        }
        
        // Remover o arquivo
        fs.unlinkSync(filePath);
        
        res.json({
            success: true,
            message: 'Backup excluído com sucesso'
        });
    } catch (error) {
        console.error('Erro ao excluir backup:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao excluir backup',
            error: error.message
        });
    }
});

// Rota para baixar um backup específico
router.get('/backups/download/:filename', verificarAuth, verificarTipo(['administrador']), (req, res) => {
    try {
        const filePath = path.join(__dirname, '..', '..', 'backups', req.params.filename);
        
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                message: 'Arquivo de backup não encontrado'
            });
        }
        
        res.download(filePath);
    } catch (error) {
        console.error('Erro ao baixar backup:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao baixar backup',
            error: error.message
        });
    }
});

// Rota para restaurar um backup
router.post('/backups/restore', verificarAuth, verificarTipo(['administrador']), async (req, res) => {
    console.log('Recebida requisição para restaurar backup:', req.body);
    
    try {
        const { filename } = req.body;
        
        if (!filename) {
            console.error('Nome do arquivo não fornecido');
            return res.status(400).json({
                success: false,
                message: 'Nome do arquivo de backup é obrigatório'
            });
        }
        
        console.log(`Procurando arquivo de backup: ${filename}`);
        const backupPath = path.join(__dirname, '..', '..', 'backups', filename);
        
        if (!fs.existsSync(backupPath)) {
            const errorMsg = `Arquivo de backup não encontrado: ${backupPath}`;
            console.error(errorMsg);
            return res.status(404).json({
                success: false,
                message: errorMsg
            });
        }
        
        console.log(`Iniciando restauração do arquivo: ${backupPath}`);
        
        try {
            await backupManager.restoreBackup(backupPath);
            
            console.log('Backup restaurado com sucesso');
            
            res.json({
                success: true,
                message: 'Backup restaurado com sucesso',
                backupFile: filename
            });
        } catch (restoreError) {
            console.error('Erro durante a restauração:', restoreError);
            throw restoreError; // Re-lança o erro para ser tratado pelo catch externo
        }
    } catch (error) {
        console.error('Erro ao processar restauração de backup:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao restaurar backup',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

module.exports = router;

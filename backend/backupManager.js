const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const config = require('./config/database');

// Configurações
const BACKUP_DIR = path.join(__dirname, '..', 'backups');

// Tipos de backup
const BACKUP_TYPES = {
    FULL: 'full',
    CADASTRO: 'cadastro',
    FREQUENCIA: 'frequencia'
};

// Garante que o diretório de backup existe
function ensureBackupDir() {
    if (!fs.existsSync(BACKUP_DIR)) {
        fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }
}

// Gera um nome de arquivo de backup com timestamp e tipo
function generateBackupFilename(type = BACKUP_TYPES.FULL) {
    const now = new Date();
    const date = now.toISOString().split('T')[0];
    const time = now.toTimeString().split(' ')[0].replace(/:/g, '');
    
    let prefix = 'recepcaotb';
    if (type === BACKUP_TYPES.CADASTRO) {
        prefix = 'cadastro';
    } else if (type === BACKUP_TYPES.FREQUENCIA) {
        prefix = 'frequencia';
    }
    
    return `${prefix}_backup_${date}_${time}.sql`;
}

// Verifica se o mysqldump está instalado
function checkMySQLDumpInstalled() {
    return new Promise((resolve) => {
        exec('mysqldump --version', (error) => {
            resolve(!error);
        });
    });
}

// Função auxiliar para executar comandos
function executeCommand(command) {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                reject(new Error(`Erro no comando: ${error.message}`));
                return;
            }
            if (stderr) {
                console.warn('Aviso:', stderr);
            }
            resolve(stdout);
        });
    });
}

// Cria backup por tipo
async function createBackupByType(type = BACKUP_TYPES.FULL) {
    try {
        ensureBackupDir();
        const backupFile = path.join(BACKUP_DIR, generateBackupFilename(type));
        
        console.log(`Iniciando backup MySQL do tipo: ${type}`);
        
        const isDumpAvailable = await checkMySQLDumpInstalled();
        if (!isDumpAvailable) {
            throw new Error('mysqldump não está instalado');
        }
        
        const dbConfig = config.development.connection;
        let command;
        
        if (type === BACKUP_TYPES.FULL) {
            command = `mysqldump -h ${dbConfig.host} -u ${dbConfig.user} -p${dbConfig.password} ${dbConfig.database} > "${backupFile}"`;
        } else if (type === BACKUP_TYPES.CADASTRO) {
            command = `mysqldump -h ${dbConfig.host} -u ${dbConfig.user} -p${dbConfig.password} ${dbConfig.database} pessoas usuarios > "${backupFile}"`;
        } else if (type === BACKUP_TYPES.FREQUENCIA) {
            command = `mysqldump -h ${dbConfig.host} -u ${dbConfig.user} -p${dbConfig.password} ${dbConfig.database} frequencias > "${backupFile}"`;
        }
        
        await executeCommand(command);
        
        console.log(`Backup MySQL ${type} criado: ${backupFile}`);
        return backupFile;
        
    } catch (error) {
        console.error('Erro ao criar backup MySQL:', error);
        throw error;
    }
}

// Funções públicas de backup
async function createBackup() {
    return createBackupByType();
}

async function createCadastroBackup() {
    return createBackupByType(BACKUP_TYPES.CADASTRO);
}

async function createFrequenciaBackup() {
    return createBackupByType(BACKUP_TYPES.FREQUENCIA);
}

// Lista backups disponíveis
function listBackups() {
    return new Promise((resolve, reject) => {
        try {
            ensureBackupDir();
            
            fs.readdir(BACKUP_DIR, (err, files) => {
                if (err) {
                    return reject(new Error(`Erro ao acessar backups: ${err.message}`));
                }
                
                if (!files || files.length === 0) {
                    return resolve([]);
                }
                
                const backups = files
                    .filter(file => file.endsWith('.sql') && 
                        (file.startsWith('recepcaotb_backup_') || 
                         file.startsWith('cadastro_backup_') ||
                         file.startsWith('frequencia_backup_')))
                    .map(file => {
                        const filePath = path.join(BACKUP_DIR, file);
                        try {
                            const stats = fs.statSync(filePath);
                            return {
                                filename: file,
                                path: filePath,
                                created: stats.birthtime,
                                size: stats.size
                            };
                        } catch (error) {
                            return null;
                        }
                    })
                    .filter(backup => backup !== null)
                    .sort((a, b) => b.created - a.created);
                
                resolve(backups);
            });
        } catch (error) {
            reject(new Error(`Falha ao listar backups: ${error.message}`));
        }
    });
}

// Restaura backup MySQL
async function restoreBackup(backupFile) {
    try {
        if (!fs.existsSync(backupFile)) {
            throw new Error(`Backup não encontrado: ${backupFile}`);
        }
        
        const dbConfig = config.development.connection;
        const command = `mysql -h ${dbConfig.host} -u ${dbConfig.user} -p${dbConfig.password} ${dbConfig.database} < "${backupFile}"`;
        
        await executeCommand(command);
        
        console.log('Backup MySQL restaurado com sucesso');
        return true;
        
    } catch (error) {
        console.error('Erro ao restaurar backup:', error);
        throw error;
    }
}

// Remove backups antigos
async function cleanupOldBackups() {
    try {
        const backups = await listBackups();
        if (backups.length > 5) {
            const toDelete = backups.slice(5);
            for (const backup of toDelete) {
                fs.unlinkSync(backup.path);
                console.log(`Backup removido: ${backup.filename}`);
            }
        }
    } catch (error) {
        console.error('Erro ao limpar backups:', error);
    }
}

module.exports = {
    createBackup,
    createCadastroBackup,
    createFrequenciaBackup,
    listBackups,
    restoreBackup,
    cleanupOldBackups,
    BACKUP_TYPES
};

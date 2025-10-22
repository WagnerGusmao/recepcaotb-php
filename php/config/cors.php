<?php
/**
 * CORS Handler - Gerenciador de Política de Compartilhamento de Recursos Entre Origens
 * 
 * Este handler implementa uma política restritiva de CORS, permitindo apenas
 * origens específicas e confiáveis para acessar a API.
 * 
 * SEGURANÇA: Evita ataques CSRF e acesso não autorizado de domínios maliciosos
 */

class CorsHandler {
    private static $allowedOrigins = [];
    
    /**
     * Inicializa as origens permitidas baseado no ambiente
     */
    public static function init() {
        // Carregar origens do ambiente (se disponível)
        $production = $_ENV['PRODUCTION_URL'] ?? '';
        $environment = $_ENV['APP_ENV'] ?? 'production';
        
        // Origens de produção - ADICIONAR SEUS DOMÍNIOS AQUI
        self::$allowedOrigins = [
            'https://terradobugio.com',
            'https://www.terradobugio.com',
        ];
        
        // Adicionar URL de produção configurável
        if ($production && !empty(trim($production))) {
            self::$allowedOrigins[] = trim($production);
        }
        
        // Ambiente de desenvolvimento - permitir localhost
        if ($environment === 'development') {
            self::$allowedOrigins[] = 'http://localhost:8000';
            self::$allowedOrigins[] = 'http://127.0.0.1:8000';
            self::$allowedOrigins[] = 'http://localhost:3000'; // Para Vite/React em dev
            self::$allowedOrigins[] = 'http://127.0.0.1:3000';
        }
        
        // Log de origens permitidas (apenas em desenvolvimento)
        if ($environment === 'development') {
            error_log('CORS - Origens permitidas: ' . implode(', ', self::$allowedOrigins));
        }
    }
    
    /**
     * Processa headers CORS e valida origem
     */
    public static function handle() {
        self::init();
        
        // Obter origem da requisição
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
        
        // Verificar se a origem é permitida
        if (in_array($origin, self::$allowedOrigins)) {
            // Origem válida - permitir acesso
            header("Access-Control-Allow-Origin: $origin");
            header('Access-Control-Allow-Credentials: true');
            
            error_log("CORS - Origem permitida: $origin");
        } else {
            // Origem não autorizada - não enviar header CORS
            if (!empty($origin)) {
                error_log("CORS - Origem bloqueada: $origin");
            }
        }
        
        // Headers permitidos
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
        header('Access-Control-Max-Age: 86400'); // Cache preflight por 24 horas
        
        // Tratar requisição OPTIONS (preflight)
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(200);
            exit;
        }
    }
    
    /**
     * Valida se uma origem específica é permitida (útil para validação customizada)
     * 
     * @param string $origin URL da origem a validar
     * @return bool True se permitida, false caso contrário
     */
    public static function isOriginAllowed($origin) {
        self::init();
        return in_array($origin, self::$allowedOrigins);
    }
    
    /**
     * Adiciona origem permitida dinamicamente (usar com cautela)
     * 
     * @param string $origin URL da origem a adicionar
     */
    public static function addAllowedOrigin($origin) {
        if (!in_array($origin, self::$allowedOrigins)) {
            self::$allowedOrigins[] = $origin;
            error_log("CORS - Nova origem adicionada: $origin");
        }
    }
}

/**
 * Sanitizer - Proteção contra XSS (Cross-Site Scripting)
 * 
 * Este módulo fornece funções para escapar e sanitizar conteúdo HTML
 * antes de inserir no DOM, prevenindo ataques XSS.
 * 
 * @author Sistema Terra do Bugio
 * @version 1.0.0
 */

(function(window) {
    'use strict';

    /**
     * Escapa caracteres HTML especiais para prevenir XSS
     * 
     * @param {string|number|null|undefined} text - Texto a ser escapado
     * @returns {string} Texto escapado e seguro para inserir no HTML
     * 
     * @example
     * escapeHtml('<script>alert("XSS")</script>')
     * // Retorna: '&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;'
     */
    function escapeHtml(text) {
        // Tratar valores null/undefined
        if (text === null || text === undefined) {
            return '';
        }
        
        // Converter para string
        const str = String(text);
        
        // Mapa de caracteres perigosos -> entidades HTML
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;',
            '/': '&#x2F;',
            '`': '&#x60;',
            '=': '&#x3D;'
        };
        
        // Substituir caracteres perigosos
        return str.replace(/[&<>"'`=/]/g, function(char) {
            return map[char];
        });
    }

    /**
     * Sanitiza um objeto recursivamente, escapando todos os valores string
     * 
     * @param {*} obj - Objeto, array ou valor primitivo a sanitizar
     * @returns {*} Objeto sanitizado com todos os strings escapados
     * 
     * @example
     * sanitizeObject({ nome: '<script>alert(1)</script>', idade: 25 })
     * // Retorna: { nome: '&lt;script&gt;alert(1)&lt;/script&gt;', idade: 25 }
     */
    function sanitizeObject(obj) {
        // Primitivos e null
        if (typeof obj !== 'object' || obj === null) {
            return typeof obj === 'string' ? escapeHtml(obj) : obj;
        }
        
        // Arrays
        if (Array.isArray(obj)) {
            return obj.map(item => sanitizeObject(item));
        }
        
        // Objetos
        const sanitized = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                sanitized[key] = sanitizeObject(obj[key]);
            }
        }
        
        return sanitized;
    }

    /**
     * Sanitiza uma string removendo tags HTML completamente
     * Use quando não quiser nenhum HTML, apenas texto puro
     * 
     * @param {string} str - String a ser sanitizada
     * @returns {string} String sem tags HTML
     * 
     * @example
     * stripHtml('<b>Texto</b> com <script>alert(1)</script>')
     * // Retorna: 'Texto com alert(1)'
     */
    function stripHtml(str) {
        if (typeof str !== 'string') {
            return '';
        }
        
        // Criar elemento temporário para usar o parser do navegador
        const temp = document.createElement('div');
        temp.innerHTML = str;
        return temp.textContent || temp.innerText || '';
    }

    /**
     * Sanitiza atributos HTML para uso em URLs
     * Previne javascript: e data: URIs
     * 
     * @param {string} url - URL a ser sanitizada
     * @returns {string} URL segura ou string vazia se suspeita
     * 
     * @example
     * sanitizeUrl('javascript:alert(1)') // Retorna: ''
     * sanitizeUrl('https://example.com') // Retorna: 'https://example.com'
     */
    function sanitizeUrl(url) {
        if (typeof url !== 'string') {
            return '';
        }
        
        const trimmed = url.trim().toLowerCase();
        
        // Bloquear protocolos perigosos
        const dangerousProtocols = [
            'javascript:',
            'data:',
            'vbscript:',
            'file:',
            'about:'
        ];
        
        for (const protocol of dangerousProtocols) {
            if (trimmed.startsWith(protocol)) {
                console.warn('URL bloqueada por motivos de segurança:', url);
                return '';
            }
        }
        
        return url;
    }

    /**
     * Cria HTML seguro usando template strings com escape automático
     * 
     * @param {Array} strings - Array de strings do template literal
     * @param {...*} values - Valores a serem interpolados
     * @returns {string} HTML seguro com valores escapados
     * 
     * @example
     * const nome = '<script>alert(1)</script>';
     * const html = safeHtml`<div>Olá, ${nome}!</div>`;
     * // Retorna: '<div>Olá, &lt;script&gt;alert(1)&lt;/script&gt;!</div>'
     */
    function safeHtml(strings, ...values) {
        let result = '';
        
        for (let i = 0; i < strings.length; i++) {
            result += strings[i];
            
            if (i < values.length) {
                result += escapeHtml(values[i]);
            }
        }
        
        return result;
    }

    /**
     * Sanitiza input do usuário removendo caracteres de controle
     * 
     * @param {string} input - Input do usuário
     * @returns {string} Input sanitizado
     */
    function sanitizeInput(input) {
        if (typeof input !== 'string') {
            return '';
        }
        
        // Remover caracteres de controle exceto newline e tab
        return input.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '');
    }

    /**
     * Valida e sanitiza um email
     * 
     * @param {string} email - Email a validar
     * @returns {string|null} Email sanitizado ou null se inválido
     */
    function sanitizeEmail(email) {
        if (typeof email !== 'string') {
            return null;
        }
        
        const trimmed = email.trim().toLowerCase();
        
        // Regex básico para validação de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (!emailRegex.test(trimmed)) {
            return null;
        }
        
        return trimmed;
    }

    /**
     * Wrapper para innerHTML que sanitiza automaticamente
     * 
     * @param {HTMLElement} element - Elemento onde inserir HTML
     * @param {string} html - HTML a inserir (será escapado)
     * @param {boolean} trusted - Se true, não escapa o HTML (use com cuidado!)
     */
    function setInnerHTML(element, html, trusted = false) {
        if (!element || !(element instanceof HTMLElement)) {
            console.error('setInnerHTML: elemento inválido');
            return;
        }
        
        if (trusted) {
            console.warn('setInnerHTML: inserindo HTML não sanitizado - use com cuidado!');
            element.innerHTML = html;
        } else {
            element.textContent = html; // Usa textContent para escape automático
        }
    }

    // Exportar funções globalmente
    window.Sanitizer = {
        escapeHtml,
        sanitizeObject,
        stripHtml,
        sanitizeUrl,
        safeHtml,
        sanitizeInput,
        sanitizeEmail,
        setInnerHTML,
        
        // Aliases para compatibilidade
        escape: escapeHtml,
        clean: stripHtml
    };

    // Log de inicialização (apenas em desenvolvimento)
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.log('✓ Sanitizer carregado - Proteção XSS ativa');
    }

})(window);

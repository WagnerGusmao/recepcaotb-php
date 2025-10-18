<?php
/**
 * Configuração Global de Timezone
 * Sistema de Recepção Terra do Bugio - Versão PHP
 */

// Configurar timezone padrão para São Paulo (UTC-3)
date_default_timezone_set('America/Sao_Paulo');

// Função para formatar data/hora para exibição
function formatDateTime($datetime, $format = 'Y-m-d H:i:s') {
    if (empty($datetime)) {
        return null;
    }
    
    try {
        $date = new DateTime($datetime);
        return $date->format($format);
    } catch (Exception $e) {
        return $datetime; // Retorna original se não conseguir formatar
    }
}

// Função para formatar data para exibição brasileira
function formatDateBR($datetime) {
    if (empty($datetime)) {
        return null;
    }
    
    try {
        $date = new DateTime($datetime);
        return $date->format('d/m/Y');
    } catch (Exception $e) {
        return $datetime;
    }
}

// Função para formatar data/hora para exibição brasileira
function formatDateTimeBR($datetime) {
    if (empty($datetime)) {
        return null;
    }
    
    try {
        $date = new DateTime($datetime);
        return $date->format('d/m/Y H:i:s');
    } catch (Exception $e) {
        return $datetime;
    }
}

// Função para obter data/hora atual no timezone correto
function nowBR() {
    return date('Y-m-d H:i:s');
}

// Função para obter apenas a data atual
function todayBR() {
    return date('Y-m-d');
}
?>

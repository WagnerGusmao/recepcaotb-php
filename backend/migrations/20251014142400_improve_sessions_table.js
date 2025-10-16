/**
 * Adiciona colunas adicionais à tabela de sessões para melhorar a segurança e rastreabilidade
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
    // Adicionar colunas à tabela de sessões
    await knex.schema.alterTable('sessoes', function(table) {
        // Informações adicionais de segurança
        table.string('user_agent', 512).nullable().after('token');
        table.string('ip_address', 45).nullable().after('user_agent');
        
        // Adicionar coluna de data de atualização para rastrear atividade
        table.timestamp('updated_at').defaultTo(knex.fn.now()).after('created_at');
        
        // Adicionar coluna de revogação manual (útil para logout forçado)
        table.boolean('revogada').defaultTo(false).after('expires_at');
        table.timestamp('revogada_em').nullable().after('revogada');
        
        // Adicionar índice composto para consultas frequentes
        table.index(['usuario_id', 'revogada'], 'idx_sessoes_usuario_revogada');
        table.index('ip_address', 'idx_sessoes_ip');
    });

    // Atualizar a view de informações de sessão ativa
    await knex.raw(`
        CREATE OR REPLACE VIEW vw_sessoes_ativas AS
        SELECT 
            s.*, 
            u.nome as usuario_nome,
            u.email as usuario_email,
            u.tipo as usuario_tipo
        FROM sessoes s
        JOIN usuarios u ON s.usuario_id = u.id
        WHERE s.expires_at > NOW() 
        AND (s.revogada IS NULL OR s.revogada = 0)
    `);
};

/**
 * Reverte as alterações feitas na migração
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
    // Remover a view primeiro
    await knex.raw('DROP VIEW IF EXISTS vw_sessoes_ativas');
    
    // Remover as colunas adicionadas
    await knex.schema.alterTable('sessoes', function(table) {
        // Remover índices primeiro
        table.dropIndex(['usuario_id', 'revogada'], 'idx_sessoes_usuario_revogada');
        table.dropIndex('ip_address', 'idx_sessoes_ip');
        
        // Remover colunas
        table.dropColumn('user_agent');
        table.dropColumn('ip_address');
        table.dropColumn('updated_at');
        table.dropColumn('revogada');
        table.dropColumn('revogada_em');
    });
};

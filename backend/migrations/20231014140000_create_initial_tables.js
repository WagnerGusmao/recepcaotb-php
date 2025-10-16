exports.up = function(knex) {
    return knex.schema
        .createTable('pessoas', function(table) {
            table.increments('id').primary();
            table.string('nome', 255).notNullable();
            table.string('cpf', 14).nullable();
            table.date('nascimento').nullable();
            table.string('religiao', 100).nullable();
            table.string('cidade', 100).notNullable();
            table.string('estado', 2).notNullable();
            table.string('telefone', 20).nullable();
            table.string('email', 255).nullable();
            table.string('indicacao', 255).nullable();
            table.text('observacao').nullable();
            table.timestamp('created_at').defaultTo(knex.fn.now());
            
            // Índices
            table.index('nome', 'idx_pessoas_nome');
            table.index('cpf', 'idx_pessoas_cpf');
        })
        .createTable('usuarios', function(table) {
            table.increments('id').primary();
            table.string('nome', 255).notNullable();
            table.string('email', 255).notNullable().unique();
            table.string('senha', 255).notNullable();
            table.enum('tipo', ['geral', 'responsavel', 'administrador']).notNullable();
            table.integer('pessoa_id').unsigned().nullable();
            table.boolean('ativo').defaultTo(true);
            table.boolean('deve_trocar_senha').defaultTo(false);
            table.timestamp('created_at').defaultTo(knex.fn.now());
            
            // Chave estrangeira
            table.foreign('pessoa_id').references('id').inTable('pessoas').onDelete('SET NULL');
            
            // Índices
            table.index('email', 'idx_usuarios_email');
        })
        .createTable('frequencias', function(table) {
            table.increments('id').primary();
            table.integer('pessoa_id').unsigned().notNullable();
            table.string('tipo', 50).notNullable();
            table.integer('numero_senha').notNullable();
            table.date('data').notNullable();
            table.integer('numero_senha_tutor').nullable();
            table.integer('numero_senha_pet').nullable();
            table.timestamp('created_at').defaultTo(knex.fn.now());
            
            // Chave estrangeira
            table.foreign('pessoa_id').references('id').inTable('pessoas').onDelete('CASCADE');
            
            // Índices
            table.index('data', 'idx_frequencias_data');
            table.index('pessoa_id', 'idx_frequencias_pessoa_id');
            table.index('tipo', 'idx_frequencias_tipo');
        })
        .createTable('sessoes', function(table) {
            table.increments('id').primary();
            table.integer('usuario_id').unsigned().notNullable();
            table.string('token', 255).notNullable().unique();
            table.timestamp('expires_at').notNullable();
            table.timestamp('created_at').defaultTo(knex.fn.now());
            
            // Chave estrangeira
            table.foreign('usuario_id').references('id').inTable('usuarios').onDelete('CASCADE');
            
            // Índices
            table.index('token', 'idx_sessoes_token');
            table.index('expires_at', 'idx_sessoes_expires');
        });
};

exports.down = function(knex) {
    return knex.schema
        .dropTableIfExists('sessoes')
        .dropTableIfExists('frequencias')
        .dropTableIfExists('usuarios')
        .dropTableIfExists('pessoas');
};

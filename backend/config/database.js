module.exports = {
    development: {
        client: 'mysql2',
        connection: {
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || 'Yohanaw2@',
            database: process.env.DB_NAME || 'recepcaotb',
            charset: 'utf8mb4',
            supportBigNumbers: true,
            bigNumberStrings: true
        },
        migrations: {
            directory: './migrations',
            tableName: 'knex_migrations'
        },
        seeds: {
            directory: './seeds'
        },
        pool: {
            min: 2,
            max: 10
        },
        debug: false
    },
    production: {
        client: 'mysql2',
        connection: {
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'recepcaotb',
            charset: 'utf8mb4',
            supportBigNumbers: true,
            bigNumberStrings: true
        },
        migrations: {
            directory: './migrations',
            tableName: 'knex_migrations'
        },
        pool: {
            min: 2,
            max: 10
        }
    }
};

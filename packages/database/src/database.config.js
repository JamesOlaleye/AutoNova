"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDatabaseConfig = void 0;
const createDatabaseConfig = (entities) => ({
    type: 'mssql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '1433'),
    username: process.env.DB_USERNAME || 'sa',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE || 'autonova',
    entities,
    synchronize: process.env.DB_SYNCHRONIZE === 'true',
    logging: process.env.DB_LOGGING === 'true',
    options: {
        encrypt: process.env.DB_ENCRYPT === 'true',
        trustServerCertificate: true,
    },
});
exports.createDatabaseConfig = createDatabaseConfig;
//# sourceMappingURL=database.config.js.map
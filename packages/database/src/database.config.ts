import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import * as sql from 'mssql';

export const createDatabaseConfig = async (entities: any[], config: ConfigService): Promise<TypeOrmModuleOptions> => {
  const host     = config.get<string>('DB_HOST')     || 'localhost';
  const port     = parseInt(config.get<string>('DB_PORT') || '1433');
  const username = config.get<string>('DB_USERNAME') || 'sa';
  const password = config.get<string>('DB_PASSWORD');
  const database = config.get<string>('DB_DATABASE') || 'autonova';
  const instance = config.get<string>('DB_INSTANCE'); // e.g. SQLEXPRESS

  const pool = await sql.connect({
    user: username,
    password,
    server: host,
    port: instance ? undefined : port,
    options: {
      instanceName: instance || undefined,
      encrypt: false,
      trustServerCertificate: true,
    },
    database: 'master',
  });

  try {
    await pool.request().query(
      `IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'${database}') CREATE DATABASE [${database}]`,
    );
  } catch {
    // Another service already created the database — safe to ignore
  }
  await pool.close();

  return {
    type: 'mssql',
    host,
    port: instance ? undefined : port,
    username,
    password,
    database,
    entities,
    synchronize: config.get<string>('DB_SYNCHRONIZE') === 'true',
    logging: config.get<string>('DB_LOGGING') === 'true',
    retryAttempts: 10,
    retryDelay: 3000,
    options: {
      instanceName: instance || undefined,
      encrypt: config.get<string>('DB_ENCRYPT') === 'true',
      trustServerCertificate: true,
    },
  };
};

import { Database } from 'sqlite3';
import path from 'path';
import { DIContainer } from '../container/DIContainer';
import { AppConfig } from '../config/AppConfig';

let container: DIContainer;

export const initDatabase = async (config: AppConfig): Promise<DIContainer> => {
  return new Promise((resolve, reject) => {
    const dbPath = path.resolve(config.databasePath);
    
    const database = new Database(dbPath, async (err) => {
      if (err) {
        console.error('Database connection error:', err);
        reject(err);
        return;
      }

      try {
        container = new DIContainer(config, database);
        await container.initialize();

        console.log('✅ Database initialized successfully');
        console.log(`📁 Database path: ${dbPath}`);
        resolve(container);
      } catch (error) {
        console.error('Database initialization error:', error);
        reject(error);
      }
    });
  });
};

export const getContainer = (): DIContainer => {
  if (!container) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return container;
};

export const getDatabase = (): Database => {
  return getContainer().get('database');
};

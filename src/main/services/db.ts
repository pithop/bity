import { createRxDatabase, addRxPlugin, RxDatabase, RxCollection } from 'rxdb';
// import { getRxStorageSQLite } from 'rxdb/plugins/storage-sqlite'; // SQLite is part of RxDB Premium
import { getRxStorageMemory } from 'rxdb/plugins/storage-memory';
import { RxDBDevModePlugin } from 'rxdb/plugins/dev-mode';
import { RxDBUpdatePlugin } from 'rxdb/plugins/update';
import { RxDBQueryBuilderPlugin } from 'rxdb/plugins/query-builder';
import { RxDBJsonDumpPlugin } from 'rxdb/plugins/json-dump';
import { RxDBMigrationPlugin } from 'rxdb/plugins/migration-schema';
import sqlite3 from 'better-sqlite3';
import path from 'path';
import { app } from 'electron';

// Add plugins
addRxPlugin(RxDBDevModePlugin);
addRxPlugin(RxDBUpdatePlugin);
addRxPlugin(RxDBQueryBuilderPlugin);
addRxPlugin(RxDBJsonDumpPlugin);
addRxPlugin(RxDBMigrationPlugin);

// Define Schema
const orderSchema = {
    title: 'order schema',
    version: 0,
    primaryKey: 'id',
    type: 'object',
    properties: {
        id: {
            type: 'string',
            maxLength: 100
        },
        items: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    name: { type: 'string' },
                    price: { type: 'number' },
                    quantity: { type: 'number' }
                }
            }
        },
        total: {
            type: 'number'
        },
        status: {
            type: 'string',
            enum: ['pending', 'paid', 'cancelled'],
            default: 'pending'
        },
        createdAt: {
            type: 'string',
            format: 'date-time'
        }
    },
    required: ['id', 'items', 'total', 'createdAt']
};

export class DatabaseService {
    private db: RxDatabase | null = null;

    async initialize() {
        if (this.db) return this.db;

        const userDataPath = app.getPath('userData');
        const dbPath = path.join(userDataPath, 'zelty-killer.db');

        console.log('Initializing database at:', dbPath);

        // NOTE: RxStorageSQLite is a premium plugin in RxDB v15+.
        // For the free version, we use Memory storage for demonstration.
        // To use SQLite, you would need the premium license or a community adapter.
        const storage = getRxStorageMemory();

        this.db = await createRxDatabase({
            name: 'zeltykiller',
            storage: storage,
            multiInstance: false,
            ignoreDuplicate: true
        });

        await this.db.addCollections({
            orders: {
                schema: orderSchema
            }
        });

        console.log('Database initialized');
        return this.db;
    }

    getCollection(name: string): RxCollection {
        if (!this.db) throw new Error('Database not initialized');
        return this.db.collections[name];
    }

    // Placeholder for replication
    async setupReplication() {
        if (!this.db) return;
        console.log('Setting up replication...');
        // Implement replication logic here
    }
}

export const dbService = new DatabaseService();

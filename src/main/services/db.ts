import * as fs from 'fs';
import { createRxDatabase, addRxPlugin, RxDatabase, RxCollection, RxDocument } from 'rxdb';
import { getRxStorageMemory } from 'rxdb/plugins/storage-memory';
import { RxDBDevModePlugin } from 'rxdb/plugins/dev-mode';
import { RxDBUpdatePlugin } from 'rxdb/plugins/update';
import { RxDBQueryBuilderPlugin } from 'rxdb/plugins/query-builder';
import { RxDBJsonDumpPlugin } from 'rxdb/plugins/json-dump';
import { RxDBMigrationPlugin } from 'rxdb/plugins/migration-schema';
import path from 'path';
import { app } from 'electron';
import { cryptoService } from './crypto';
import { randomUUID } from 'node:crypto';

// Add plugins
addRxPlugin(RxDBDevModePlugin);
addRxPlugin(RxDBUpdatePlugin);
addRxPlugin(RxDBQueryBuilderPlugin);
addRxPlugin(RxDBJsonDumpPlugin);
addRxPlugin(RxDBMigrationPlugin);

// Define Interfaces
export interface OrderItem {
    name: string;
    price: number;
    quantity: number;
}

export interface Order {
    id: string;
    items: OrderItem[];
    total: number;
    status: 'pending' | 'paid' | 'cancelled';
    createdAt: string;
    // NF525 Fields
    fiscal_signature: string;
    previous_signature_hash: string;
}

export type OrderDocument = RxDocument<Order>;
export type OrderCollection = RxCollection<Order>;

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
        },
        fiscal_signature: {
            type: 'string'
        },
        previous_signature_hash: {
            type: 'string'
        }
    },
    required: ['id', 'items', 'total', 'createdAt', 'fiscal_signature', 'previous_signature_hash']
};

const productSchema = {
    title: 'product schema',
    version: 0,
    primaryKey: 'id',
    type: 'object',
    properties: {
        id: { type: 'string', maxLength: 100 },
        name: { type: 'string' },
        price: { type: 'number' },
        category: { type: 'string' },
        taxRate: { type: 'number' }
    },
    required: ['id', 'name', 'price']
};

const inventorySchema = {
    title: 'inventory schema',
    version: 0,
    primaryKey: 'productId',
    type: 'object',
    properties: {
        productId: { type: 'string', maxLength: 100 },
        quantity: { type: 'number' }, // PN-Counter logic will be handled by CRDTs or delta updates
        lastUpdated: { type: 'string', format: 'date-time' }
    },
    required: ['productId', 'quantity']
};

const settingsSchema = {
    title: 'settings schema',
    version: 0,
    primaryKey: 'id',
    type: 'object',
    properties: {
        id: { type: 'string', maxLength: 100 },
        storeName: { type: 'string' },
        address: { type: 'string' },
        siret: { type: 'string' },
        vatNumber: { type: 'string' },

        // Printer Configuration
        printerInterface: {
            type: 'string',
            enum: ['network', 'usb'],
            default: 'network'
        },
        printerIp: { type: 'string' },
        printerPort: { type: 'number' },
        printerUsbPath: { type: 'string' }, // e.g., /dev/usb/lp0 or VID:PID
        printerType: { type: 'string' } // epson, star
    },
    required: ['id']
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
        const storage = getRxStorageMemory();

        this.db = await createRxDatabase({
            name: 'zeltykiller',
            storage: storage,
            multiInstance: false,
            ignoreDuplicate: true
        });

        const eventSchema = {
            version: 0,
            primaryKey: 'id',
            type: 'object',
            properties: {
                id: {
                    type: 'string',
                    maxLength: 100
                },
                type: {
                    type: 'string',
                    enum: ['STARTUP', 'SHUTDOWN', 'ERROR', 'ARCHIVE', 'UPDATE']
                },
                description: {
                    type: 'string'
                },
                timestamp: {
                    type: 'string',
                    format: 'date-time'
                },
                signature: {
                    type: 'string'
                },
                previous_hash: {
                    type: 'string'
                }
            },
            required: ['id', 'type', 'timestamp', 'signature', 'previous_hash']
        };

        await this.db.addCollections({
            orders: {
                schema: orderSchema
            },
            products: {
                schema: productSchema
            },
            inventory: {
                schema: inventorySchema
            },
            events: {
                schema: eventSchema
            },
            settings: {
                schema: settingsSchema
            }
        });

        // Initialize default settings if not exists
        const settingsCollection = this.db.collections.settings;
        const existingSettings = await settingsCollection.findOne('main').exec();
        if (!existingSettings) {
            await settingsCollection.insert({
                id: 'main',
                storeName: 'My Awesome Restaurant',
                address: '123 Rue de Paris',
                siret: '00000000000000',
                vatNumber: 'FR00000000000',
                printerInterface: 'network',
                printerIp: '192.168.1.200',
                printerPort: 9100,
                printerUsbPath: '',
                printerType: 'epson'
            });
        }

        console.log('Database initialized');
        return this.db;
    }

    getCollection(name: string): RxCollection {
        if (!this.db) throw new Error('Database not initialized');
        return this.db.collections[name];
    }

    // Settings Management
    async getSettings() {
        const settingsCollection = this.getCollection('settings');
        const doc = await settingsCollection.findOne('main').exec();
        return doc ? doc.toJSON() : null;
    }

    async updateSettings(settings: any) {
        const settingsCollection = this.getCollection('settings');
        const doc = await settingsCollection.findOne('main').exec();
        if (doc) {
            return doc.patch(settings);
        }
        return settingsCollection.insert({ ...settings, id: 'main' });
    }

    async insertOrder(items: OrderItem[], total: number): Promise<OrderDocument> {
        const ordersCollection = this.getCollection('orders');

        // 1. Get the last order to find the previous signature
        // CRITICAL: We must ensure we get the absolute last fiscal event.
        // In a distributed system, this is hard, but for this local-first MVP, we trust the local chain.
        const lastOrder = await ordersCollection.findOne({
            selector: {},
            sort: [{ createdAt: 'desc' }]
        }).exec();

        let previousSignature = 'GENESIS_HASH_00000000000000000000000000000000';
        if (lastOrder) {
            previousSignature = lastOrder.fiscal_signature;
        }

        // 2. Prepare the new order object
        const orderId = randomUUID();
        const createdAt = new Date().toISOString();

        const newOrderData: Omit<Order, 'fiscal_signature'> = {
            id: orderId,
            items,
            total,
            status: 'pending',
            createdAt,
            previous_signature_hash: cryptoService.hash(previousSignature) // Store hash of prev sig for verification
        };

        // 3. Sign the order (Strict Chaining)
        // Formula: Sig = Sign( SHA256( Previous_Sig + Date + Total + ID ) )
        // We use a simplified version of the report's formula but ensuring all critical fields are bound.
        const dataToSign = `${previousSignature}|${createdAt}|${total.toFixed(2)}|${orderId}`;
        const signature = cryptoService.sign(dataToSign);

        // 4. Insert with signature
        const finalOrder: Order = {
            ...newOrderData,
            fiscal_signature: signature
        };

        return ordersCollection.insert(finalOrder);
    }

    // Product Management
    async getProducts() {
        const productsCollection = this.getCollection('products');
        return productsCollection.find().exec();
    }

    async addProduct(product: any) {
        const productsCollection = this.getCollection('products');
        return productsCollection.insert(product);
    }

    async updateProduct(product: any) {
        const productsCollection = this.getCollection('products');
        const doc = await productsCollection.findOne(product.id).exec();
        if (doc) {
            return doc.patch(product);
        }
        throw new Error('Product not found');
    }

    async deleteProduct(id: string) {
        const productsCollection = this.getCollection('products');
        const doc = await productsCollection.findOne(id).exec();
        if (doc) {
            return doc.remove();
        }
        throw new Error('Product not found');
    }

    async injectTestProducts() {
        const productsCollection = this.getCollection('products');
        const testProducts = [
            { id: 'test_1', name: 'Espresso', price: 2.50, category: 'Coffee', taxRate: 10 },
            { id: 'test_2', name: 'Cappuccino', price: 3.50, category: 'Coffee', taxRate: 10 },
            { id: 'test_3', name: 'Croissant', price: 1.80, category: 'Bakery', taxRate: 5.5 },
            { id: 'test_4', name: 'Orange Juice', price: 4.00, category: 'Drinks', taxRate: 10 },
            { id: 'test_5', name: 'Ham Sandwich', price: 6.50, category: 'Food', taxRate: 10 }
        ];

        // Upsert test products
        for (const product of testProducts) {
            await productsCollection.upsert(product);
        }
        return testProducts;
    }

    async clearProducts() {
        const productsCollection = this.getCollection('products');
        const allDocs = await productsCollection.find().exec();
        await Promise.all(allDocs.map(doc => doc.remove()));
        return true;
    }

    async getDailyTotal(date: Date) {
        const ordersCollection = this.getCollection('orders');
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        // In a real app with RxDB Query Builder, we'd use $gte and $lte
        // For MVP with basic find, we filter in memory (not efficient for large datasets but fine for MVP)
        const allOrders = await ordersCollection.find().exec();
        const dailyOrders = allOrders.filter(order => {
            const orderDate = new Date(order.createdAt);
            return orderDate >= startOfDay && orderDate <= endOfDay;
        });

        const totalSales = dailyOrders.reduce((sum, order) => sum + order.total, 0);
        const orderCount = dailyOrders.length;

        return {
            date: startOfDay.toISOString(),
            totalSales,
            orderCount,
            orders: dailyOrders.map(d => d.toJSON())
        };
    }

    async closeDay(date: Date) {
        const report = await this.getDailyTotal(date);

        // Create Archives Directory
        const archivePath = path.join(app.getPath('userData'), 'archives');
        if (!fs.existsSync(archivePath)) {
            fs.mkdirSync(archivePath, { recursive: true });
        }

        // Generate Filename: SIREN_DATE_Z.json (Using 'DEMO' as SIREN for now)
        const dateStr = new Date(date).toISOString().split('T')[0].replace(/-/g, '');
        const filename = `DEMO_${dateStr}_Z.json`;
        const filePath = path.join(archivePath, filename);

        // Save Archive
        fs.writeFileSync(filePath, JSON.stringify(report, null, 2));
        console.log(`Fiscal Archive saved to: ${filePath}`);

        return report;
    }

    // Placeholder for replication
    async setupReplication() {
        if (!this.db) return;
        console.log('Setting up replication...');
        // Implement replication logic here
    }
}

export const dbService = new DatabaseService();

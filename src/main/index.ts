import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { dbService } from './services/db';
import { printerManager } from './hardware/PrinterManager';
import { jetService } from './services/JetService';

let mainWindow: BrowserWindow | null = null;

async function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, '../preload/index.js'),
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: false // Required for some native modules if not strictly isolated
        }
    });

    if (process.env.NODE_ENV === 'development') {
        const port = 5173;
        const url = `http://localhost:${port}`;
        mainWindow.loadURL(url);
        mainWindow.webContents.openDevTools();
    } else {
        mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
    }

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.whenReady().then(async () => {
    try {
        await dbService.initialize();

        // Log Startup Event
        await jetService.logEvent('STARTUP', `Application started. Version: ${app.getVersion()}`);

        await createWindow();
    } catch (error) {
        console.error('Failed to initialize app:', error);
    }

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', async () => {
    if (process.platform !== 'darwin') {
        // Log Shutdown Event before quitting
        await jetService.logEvent('SHUTDOWN', 'Application closing normally.');
        app.quit();
    }
});

// IPC Handlers
ipcMain.handle('db-get-orders', async () => {
    const db = await dbService.initialize();
    const orders = await db.orders.find().exec();
    return orders.map(doc => doc.toJSON());
});

ipcMain.handle('db-add-order', async (event, { items, total }) => {
    const doc = await dbService.insertOrder(items, total);
    return doc.toJSON();
});

ipcMain.handle('hardware-print', async (event, data) => {
    await printerManager.printTicket(data);
    return { success: true };
});

// Product IPC
ipcMain.handle('db-get-products', async () => {
    const products = await dbService.getProducts();
    return products.map(doc => doc.toJSON());
});

ipcMain.handle('db-add-product', async (event, product) => {
    const doc = await dbService.addProduct(product);
    return doc.toJSON();
});

ipcMain.handle('db-update-product', async (event, product) => {
    const doc = await dbService.updateProduct(product);
    return doc.toJSON();
});

ipcMain.handle('db-delete-product', async (event, id) => {
    await dbService.deleteProduct(id);
    return { success: true };
});

ipcMain.handle('db-get-daily-total', async () => {
    const result = await dbService.getDailyTotal(new Date());
    return result;
});

ipcMain.handle('db-close-day', async () => {
    const result = await dbService.closeDay(new Date());
    return result;
});

ipcMain.handle('db-get-settings', async () => {
    return dbService.getSettings();
});

ipcMain.handle('db-update-settings', async (event, settings) => {
    return dbService.updateSettings(settings);
});

ipcMain.handle('db-inject-test-products', async () => {
    return dbService.injectTestProducts();
});

ipcMain.handle('db-clear-products', async () => {
    return dbService.clearProducts();
});

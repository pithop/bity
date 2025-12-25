import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { dbService } from './services/db';
import { printerManager } from './hardware/PrinterManager';

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
        await createWindow();
    } catch (error) {
        console.error('Failed to initialize app:', error);
    }

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

// IPC Handlers
ipcMain.handle('db-get-orders', async () => {
    const db = await dbService.initialize();
    const orders = await db.orders.find().exec();
    return orders.map(doc => doc.toJSON());
});

ipcMain.handle('db-add-order', async (event, order) => {
    const db = await dbService.initialize();
    const doc = await db.orders.insert(order);
    return doc.toJSON();
});

ipcMain.handle('hardware-print', async (event, data) => {
    await printerManager.printTicket(data);
    return { success: true };
});

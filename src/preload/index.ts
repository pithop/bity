import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
    db: {
        getOrders: () => ipcRenderer.invoke('db-get-orders'),
        addOrder: (order: any) => ipcRenderer.invoke('db-add-order', order),
        getProducts: () => ipcRenderer.invoke('db-get-products'),
        addProduct: (product: any) => ipcRenderer.invoke('db-add-product', product),
        updateProduct: (product: any) => ipcRenderer.invoke('db-update-product', product),
        deleteProduct: (id: string) => ipcRenderer.invoke('db-delete-product', id),
        getDailyTotal: () => ipcRenderer.invoke('db-get-daily-total'),
        closeDay: () => ipcRenderer.invoke('db-close-day'),
        getSettings: () => ipcRenderer.invoke('db-get-settings'),
        updateSettings: (settings: any) => ipcRenderer.invoke('db-update-settings', settings),
        injectTestProducts: () => ipcRenderer.invoke('db-inject-test-products'),
        clearProducts: () => ipcRenderer.invoke('db-clear-products')
    },
    hardware: {
        printTicket: (data: any) => ipcRenderer.invoke('hardware-print', data)
    }
});

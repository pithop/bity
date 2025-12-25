import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
    db: {
        getOrders: () => ipcRenderer.invoke('db-get-orders'),
        addOrder: (order: any) => ipcRenderer.invoke('db-add-order', order)
    },
    hardware: {
        printTicket: (data: any) => ipcRenderer.invoke('hardware-print', data)
    }
});

import React, { useEffect, useState } from 'react';

declare global {
    interface Window {
        api: {
            db: {
                getOrders: () => Promise<any[]>;
                addOrder: (order: any) => Promise<any>;
            };
            hardware: {
                printTicket: (data: any) => Promise<void>;
            };
        };
    }
}

function App() {
    const [orders, setOrders] = useState<any[]>([]);

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        try {
            const data = await window.api.db.getOrders();
            setOrders(data);
        } catch (error) {
            console.error('Failed to load orders:', error);
        }
    };

    const handleAddOrder = async () => {
        const newOrder = {
            id: Date.now().toString(),
            items: [{ name: 'Coffee', price: 2.5, quantity: 1 }],
            total: 2.5,
            createdAt: new Date().toISOString(),
            status: 'pending'
        };

        try {
            await window.api.db.addOrder(newOrder);
            await loadOrders();
        } catch (error) {
            console.error('Failed to add order:', error);
        }
    };

    const handlePrint = async (order: any) => {
        try {
            await window.api.hardware.printTicket(order);
            alert('Ticket sent to printer!');
        } catch (error) {
            console.error('Failed to print:', error);
        }
    };

    return (
        <div className="container">
            <h1>Zelty Killer POS</h1>
            <div className="actions">
                <button onClick={handleAddOrder}>New Order</button>
            </div>
            <div className="order-list">
                <h2>Recent Orders</h2>
                {orders.map((order) => (
                    <div key={order.id} className="order-card">
                        <p>ID: {order.id}</p>
                        <p>Total: ${order.total}</p>
                        <p>Status: {order.status}</p>
                        <button onClick={() => handlePrint(order)}>Print Ticket</button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default App;

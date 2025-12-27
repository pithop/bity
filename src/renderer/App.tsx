import React, { useEffect, useState } from 'react';
import { MainLayout } from './components/MainLayout';
import { Button } from './components/Button';
import { Card } from './components/Card';
import { POSScreen } from './components/POSScreen';
import { KitchenScreen } from './components/KitchenScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { DashboardScreen } from './components/DashboardScreen';
import { Printer, CheckCircle, Clock } from 'lucide-react';

declare global {
    interface Window {
        api: {
            db: {
                getOrders: () => Promise<any[]>;
                addOrder: (order: any) => Promise<any>;
                getProducts: () => Promise<any[]>;
                addProduct: (product: any) => Promise<any>;
                updateProduct: (product: any) => Promise<any>;
                deleteProduct: (id: string) => Promise<void>;
                getDailyTotal: () => Promise<{ totalSales: number; orderCount: number }>;
                closeDay: () => Promise<any>;
                getSettings: () => Promise<any>;
                updateSettings: (settings: any) => Promise<any>;
            };
            hardware: {
                printTicket: (data: any) => Promise<void>;
            };
        };
    }
}

function App() {
    const [activeTab, setActiveTab] = useState('pos');
    const [orders, setOrders] = useState<any[]>([]);

    useEffect(() => {
        // Poll for orders every 5 seconds to simulate real-time sync for now
        // In a real app, we'd use RxDB subscriptions
        loadOrders();
        const interval = setInterval(loadOrders, 5000);
        return () => clearInterval(interval);
    }, []);

    const loadOrders = async () => {
        try {
            const data = await window.api.db.getOrders();
            const sorted = data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setOrders(sorted);
        } catch (error) {
            console.error('Failed to load orders:', error);
        }
    };

    const handlePrint = async (order: any) => {
        try {
            await window.api.hardware.printTicket(order);
        } catch (error) {
            console.error('Failed to print:', error);
        }
    };

    const handleBumpOrder = async (orderId: string, nextStatus: string) => {
        // In a real app, we would update the status in the DB
        // For now, we'll just update local state to simulate it
        // TODO: Add updateOrder to IPC
        console.log(`Bumping order ${orderId} to ${nextStatus}`);

        // Optimistic update
        setOrders(prev => prev.map(o =>
            o.id === orderId ? { ...o, status: nextStatus } : o
        ));
    };

    return (
        <MainLayout activeTab={activeTab} onTabChange={setActiveTab}>
            {activeTab === 'pos' && <POSScreen />}

            {activeTab === 'kitchen' && (
                <KitchenScreen orders={orders} onBumpOrder={handleBumpOrder} />
            )}

            {activeTab === 'orders' && (
                <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <h2 style={{ fontSize: '1.5rem', color: 'var(--text-primary)' }}>Order History</h2>
                        <Button onClick={loadOrders} variant="secondary">Refresh</Button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                        {orders.map((order) => (
                            <Card key={order.id} variant="glass" padding="md">
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontFamily: 'monospace' }}>
                                        #{order.id.slice(0, 8)}
                                    </span>
                                    <span style={{
                                        padding: '4px 8px',
                                        borderRadius: '12px',
                                        background: order.status === 'paid' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                                        color: order.status === 'paid' ? 'var(--success)' : 'var(--warning)',
                                        fontSize: '0.75rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                    }}>
                                        {order.status === 'paid' ? <CheckCircle size={12} /> : <Clock size={12} />}
                                        {order.status}
                                    </span>
                                </div>

                                <div style={{ marginBottom: '16px' }}>
                                    {order.items.map((item: any, idx: number) => (
                                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-primary)', marginBottom: '4px' }}>
                                            <span>{item.quantity}x {item.name}</span>
                                            <span>${(item.price * item.quantity).toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>

                                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '1.25rem', fontWeight: 600 }}>${order.total.toFixed(2)}</span>
                                    <Button size="sm" variant="secondary" onClick={() => handlePrint(order)} icon={<Printer size={14} />}>
                                        Print
                                    </Button>
                                </div>

                                <div style={{ marginTop: '12px', fontSize: '0.7rem', color: 'var(--text-muted)', wordBreak: 'break-all' }}>
                                    <div style={{ marginBottom: '4px' }}>Sig: {order.fiscal_signature?.slice(0, 16)}...</div>
                                    <div>Prev: {order.previous_signature_hash?.slice(0, 16)}...</div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </>
            )}

            {activeTab === 'dashboard' && (
                <DashboardScreen orders={orders} />
            )}

            {activeTab === 'settings' && (
                <SettingsScreen />
            )}


        </MainLayout>
    );
}

export default App;

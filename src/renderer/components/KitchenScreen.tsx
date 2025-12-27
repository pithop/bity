import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Card } from './Card';
import { Button } from './Button';

interface KitchenScreenProps {
    orders: any[];
    onBumpOrder: (orderId: string, nextStatus: string) => void;
}

export const KitchenScreen: React.FC<KitchenScreenProps> = ({ orders, onBumpOrder }) => {
    // Filter only active orders for the kitchen
    const activeOrders = orders.filter(o => ['pending', 'preparing', 'ready'].includes(o.status));

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'var(--warning)';
            case 'preparing': return 'var(--info)';
            case 'ready': return 'var(--success)';
            default: return 'var(--text-muted)';
        }
    };

    const getElapsedTime = (createdAt: string) => {
        const diff = Date.now() - new Date(createdAt).getTime();
        const minutes = Math.floor(diff / 60000);
        return `${minutes}m`;
    };

    // Force re-render every minute to update elapsed time
    const [, setTick] = useState(0);
    useEffect(() => {
        const timer = setInterval(() => setTick(t => t + 1), 60000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '1.5rem', color: 'var(--text-primary)' }}>Kitchen Display System</h2>
                <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--warning)' }} />
                        <span>Pending</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--info)' }} />
                        <span>Preparing</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--success)' }} />
                        <span>Ready</span>
                    </div>
                </div>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '16px',
                overflowY: 'auto',
                paddingBottom: '20px'
            }}>
                <AnimatePresence>
                    {activeOrders.map((order) => (
                        <Card
                            key={order.id}
                            variant="glass"
                            padding="md"
                            style={{
                                borderLeft: `4px solid ${getStatusColor(order.status)}`,
                                display: 'flex',
                                flexDirection: 'column'
                            }}
                            layout
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
                                <div>
                                    <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>#{order.id.slice(0, 4)}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Table 12</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        color: getElapsedTime(order.createdAt).startsWith('1') ? 'var(--danger)' : 'var(--text-primary)',
                                        fontWeight: 600
                                    }}>
                                        <Clock size={16} />
                                        {getElapsedTime(order.createdAt)}
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: getStatusColor(order.status), textTransform: 'uppercase', fontWeight: 600 }}>
                                        {order.status}
                                    </div>
                                </div>
                            </div>

                            <div style={{ flex: 1, marginBottom: '20px' }}>
                                {order.items.map((item: any, idx: number) => (
                                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px', fontSize: '1.1rem' }}>
                                        <span style={{
                                            background: 'var(--bg-hover)',
                                            width: '32px',
                                            height: '32px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            borderRadius: '50%',
                                            fontWeight: 700
                                        }}>
                                            {item.quantity}
                                        </span>
                                        <span>{item.name}</span>
                                    </div>
                                ))}
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                {order.status === 'pending' && (
                                    <Button
                                        variant="primary"
                                        onClick={() => onBumpOrder(order.id, 'preparing')}
                                        style={{ gridColumn: 'span 2' }}
                                    >
                                        Start Preparing
                                    </Button>
                                )}
                                {order.status === 'preparing' && (
                                    <Button
                                        variant="success"
                                        onClick={() => onBumpOrder(order.id, 'ready')}
                                        style={{ background: 'var(--success)', gridColumn: 'span 2' }}
                                    >
                                        Mark Ready
                                    </Button>
                                )}
                                {order.status === 'ready' && (
                                    <Button
                                        variant="secondary"
                                        onClick={() => onBumpOrder(order.id, 'served')}
                                        style={{ gridColumn: 'span 2' }}
                                        icon={<CheckCircle size={18} />}
                                    >
                                        Served
                                    </Button>
                                )}
                            </div>
                        </Card>
                    ))}
                </AnimatePresence>

                {activeOrders.length === 0 && (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                        <div style={{ marginBottom: '16px' }}><CheckCircle size={48} /></div>
                        <h3>All caught up!</h3>
                        <p>No active orders in the kitchen.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

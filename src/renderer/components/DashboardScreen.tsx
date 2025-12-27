import React, { useMemo } from 'react';
import { Card } from './Card';
import { DollarSign, ShoppingBag, TrendingUp, Clock, Printer } from 'lucide-react';
import { Button } from './Button';

interface DashboardScreenProps {
    orders: any[];
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ orders }) => {
    const stats = useMemo(() => {
        const today = new Date().toDateString();
        const todaysOrders = orders.filter(o => new Date(o.createdAt).toDateString() === today);

        const totalSales = todaysOrders.reduce((sum, o) => sum + o.total, 0);
        const orderCount = todaysOrders.length;
        const avgTicket = orderCount > 0 ? totalSales / orderCount : 0;

        // Mock hourly data for the chart
        const hourlyData = Array.from({ length: 24 }, (_, i) => ({
            hour: i,
            sales: Math.floor(Math.random() * 200) // Simulated data
        }));

        return { totalSales, orderCount, avgTicket, hourlyData };
    }, [orders]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '1.75rem', marginBottom: '8px' }}>Dashboard</h2>
                <Button
                    variant="primary"
                    onClick={async () => {
                        if (!confirm('Print End of Day (Z-Ticket)? This will archive today\'s sales.')) return;
                        try {
                            // Use closeDay to generate archive AND get report
                            const report = await window.api.db.closeDay();
                            await window.api.hardware.printTicket({
                                type: 'Z-TICKET',
                                ...report
                            });
                            alert('Z-Ticket printed and archived successfully!');
                        } catch (e) {
                            console.error(e);
                            alert('Failed to print Z-Ticket');
                        }
                    }}
                    icon={<Printer size={18} />}
                >
                    Close Day (Z-Ticket)
                </Button>
            </div>

            {/* Key Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
                <Card variant="glass" padding="lg">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                        <div>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '4px' }}>Total Sales (Today)</div>
                            <div style={{ fontSize: '2rem', fontWeight: 700 }}>${stats.totalSales.toFixed(2)}</div>
                        </div>
                        <div style={{ padding: '12px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', color: 'var(--success)' }}>
                            <DollarSign size={24} />
                        </div>
                    </div>
                    <div style={{ color: 'var(--success)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <TrendingUp size={14} /> +12% from yesterday
                    </div>
                </Card>

                <Card variant="glass" padding="lg">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                        <div>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '4px' }}>Total Orders</div>
                            <div style={{ fontSize: '2rem', fontWeight: 700 }}>{stats.orderCount}</div>
                        </div>
                        <div style={{ padding: '12px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '12px', color: 'var(--primary-start)' }}>
                            <ShoppingBag size={24} />
                        </div>
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                        Avg. Ticket: ${stats.avgTicket.toFixed(2)}
                    </div>
                </Card>

                <Card variant="glass" padding="lg">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                        <div>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '4px' }}>Busy Hour</div>
                            <div style={{ fontSize: '2rem', fontWeight: 700 }}>12:00 PM</div>
                        </div>
                        <div style={{ padding: '12px', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '12px', color: 'var(--warning)' }}>
                            <Clock size={24} />
                        </div>
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                        Peak sales volume
                    </div>
                </Card>
            </div>

            {/* Sales Chart (CSS Bar Chart) */}
            <Card variant="default" padding="lg" style={{ height: '400px', display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ marginBottom: '24px' }}>Hourly Sales Performance</h3>
                <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', gap: '8px', paddingBottom: '24px' }}>
                    {stats.hourlyData.map((d) => (
                        <div key={d.hour} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                            <div
                                style={{
                                    width: '100%',
                                    background: 'linear-gradient(to top, var(--primary-start), var(--primary-end))',
                                    borderRadius: '4px',
                                    height: `${(d.sales / 200) * 100}%`,
                                    minHeight: '4px',
                                    opacity: 0.8,
                                    transition: 'height 0.5s ease'
                                }}
                            />
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{d.hour}</span>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
};

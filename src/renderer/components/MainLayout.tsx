import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, ShoppingCart, Settings, History, ChefHat } from 'lucide-react';
import { Button } from './Button';

interface MainLayoutProps {
    children: React.ReactNode;
    activeTab: string;
    onTabChange: (tab: string) => void;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children, activeTab, onTabChange }) => {
    const navItems = [
        { id: 'pos', icon: <ShoppingCart size={20} />, label: 'POS' },
        { id: 'orders', icon: <History size={20} />, label: 'Orders' },
        { id: 'kitchen', icon: <ChefHat size={20} />, label: 'Kitchen' },
        { id: 'dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
        { id: 'settings', icon: <Settings size={20} />, label: 'Settings' },
    ];

    return (
        <div style={{ display: 'flex', height: '100vh', background: 'transparent' }}>
            {/* Sidebar */}
            <motion.aside
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                style={{
                    width: '80px',
                    background: 'var(--bg-panel)',
                    borderRight: '1px solid var(--border-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: '20px 0',
                    gap: '16px',
                    zIndex: 10
                }}
            >
                <div style={{ marginBottom: '20px', color: 'var(--primary-start)' }}>
                    <LayoutDashboard size={32} />
                </div>

                {navItems.map((item) => (
                    <Button
                        key={item.id}
                        variant={activeTab === item.id ? 'primary' : 'ghost'}
                        size="md"
                        onClick={() => onTabChange(item.id)}
                        style={{
                            width: '48px',
                            height: '48px',
                            padding: 0,
                            borderRadius: '12px',
                            background: activeTab === item.id ? 'var(--primary)' : 'transparent',
                            color: activeTab === item.id ? '#fff' : 'var(--text-secondary)'
                        }}
                        title={item.label}
                    >
                        {item.icon}
                    </Button>
                ))}
            </motion.aside>



            {/* Main Content */}
            <main style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                {/* Header ... */}
                <header style={{
                    height: '64px',
                    borderBottom: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 24px',
                    background: 'var(--bg-panel)',
                    backdropFilter: 'none'
                }}>
                    <h1 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 600 }}>Zelty Killer</h1>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <span style={{ color: 'var(--success)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'currentColor' }} />
                            Online
                        </span>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--bg-hover)' }} />
                    </div>
                </header>

                <div style={{ flex: 1, overflow: 'auto', padding: '24px', position: 'relative' }}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            style={{ height: '100%' }}
                        >
                            {children}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
};

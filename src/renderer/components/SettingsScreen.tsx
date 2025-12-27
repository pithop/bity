import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Save, Store, Coffee, Printer, Settings as SettingsIcon } from 'lucide-react';
import { Button } from './Button';
import { Card } from './Card';

interface Product {
    id: string;
    name: string;
    price: number;
    category: string;
    taxRate: number;
}

interface Settings {
    storeName: string;
    address: string;
    siret: string;
    vatNumber: string;
    printerIp: string;
    printerPort: number;
    printerType: string;
    printerInterface: 'network' | 'usb';
    printerUsbPath: string;
}

export const SettingsScreen: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'general' | 'hardware' | 'menu'>('general');
    const [products, setProducts] = useState<Product[]>([]);
    const [settings, setSettings] = useState<Settings>({
        storeName: '',
        address: '',
        siret: '',
        vatNumber: '',
        printerIp: '',
        printerPort: 9100,
        printerType: 'epson',
        printerInterface: 'network',
        printerUsbPath: ''
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);

    // New Product Form State
    const [newProduct, setNewProduct] = useState({
        name: '',
        price: '',
        category: 'Coffee',
        taxRate: 20
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [productsData, settingsData] = await Promise.all([
                window.api.db.getProducts(),
                window.api.db.getSettings()
            ]);
            setProducts(productsData);
            if (settingsData) {
                setSettings(settingsData);
            }
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveSettings = async () => {
        try {
            await window.api.db.updateSettings(settings);
            alert('Settings saved successfully!');
        } catch (error) {
            console.error('Failed to save settings:', error);
            alert('Failed to save settings');
        }
    };

    const handleAddProduct = async () => {
        if (!newProduct.name || !newProduct.price) return;

        try {
            const product = {
                id: Date.now().toString(),
                name: newProduct.name,
                price: parseFloat(newProduct.price),
                category: newProduct.category,
                taxRate: newProduct.taxRate
            };

            await window.api.db.addProduct(product);
            const updatedProducts = await window.api.db.getProducts();
            setProducts(updatedProducts);
            setIsAdding(false);
            setNewProduct({ name: '', price: '', category: 'Coffee', taxRate: 20 });
        } catch (error) {
            console.error('Failed to add product:', error);
        }
    };

    const handleDeleteProduct = async (id: string) => {
        if (!confirm('Are you sure you want to delete this product?')) return;
        try {
            await window.api.db.deleteProduct(id);
            const updatedProducts = await window.api.db.getProducts();
            setProducts(updatedProducts);
        } catch (error) {
            console.error('Failed to delete product:', error);
        }
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '2rem', marginBottom: '8px' }}>Settings</h2>
                <p style={{ color: 'var(--text-secondary)' }}>Manage your store configuration and menu.</p>
            </div>

            <div style={{ display: 'flex', gap: '32px', flex: 1, overflow: 'hidden' }}>
                {/* Sidebar Navigation */}
                <div style={{ width: '240px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {[
                        { id: 'general', label: 'General', icon: <Store size={18} /> },
                        { id: 'hardware', label: 'Hardware', icon: <Printer size={18} /> },
                        { id: 'menu', label: 'Menu Management', icon: <Coffee size={18} /> }
                    ].map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id as any)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                width: '100%',
                                padding: '12px 16px',
                                background: activeTab === item.id ? 'var(--bg-hover)' : 'transparent',
                                color: activeTab === item.id ? 'var(--primary)' : 'var(--text-secondary)',
                                border: 'none',
                                borderLeft: activeTab === item.id ? '3px solid var(--primary)' : '3px solid transparent',
                                borderRadius: '0 8px 8px 0',
                                cursor: 'pointer',
                                fontSize: '0.95rem',
                                fontWeight: activeTab === item.id ? 600 : 400,
                                transition: 'all 0.2s',
                                textAlign: 'left'
                            }}
                            onMouseEnter={(e) => {
                                if (activeTab !== item.id) e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                            }}
                            onMouseLeave={(e) => {
                                if (activeTab !== item.id) e.currentTarget.style.background = 'transparent';
                            }}
                        >
                            {item.icon}
                            {item.label}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div style={{ flex: 1, overflowY: 'auto', paddingRight: '8px' }}>

                    {/* GENERAL TAB */}
                    {activeTab === 'general' && (
                        <Card variant="glass" padding="lg">
                            <h3 style={{ fontSize: '1.25rem', marginBottom: '24px' }}>Store Information</h3>
                            <div style={{ display: 'grid', gap: '20px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Store Name</label>
                                    <input
                                        type="text"
                                        value={settings.storeName}
                                        onChange={e => setSettings({ ...settings, storeName: e.target.value })}
                                    />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Address</label>
                                    <input
                                        type="text"
                                        value={settings.address}
                                        onChange={e => setSettings({ ...settings, address: e.target.value })}
                                    />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>SIRET</label>
                                        <input
                                            type="text"
                                            value={settings.siret}
                                            onChange={e => setSettings({ ...settings, siret: e.target.value })}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>VAT Number</label>
                                        <input
                                            type="text"
                                            value={settings.vatNumber}
                                            onChange={e => setSettings({ ...settings, vatNumber: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div style={{ marginTop: '16px' }}>
                                    <Button variant="primary" onClick={handleSaveSettings} icon={<Save size={18} />}>
                                        Save Changes
                                    </Button>
                                </div>

                                <div style={{ marginTop: '32px', borderTop: '1px solid var(--border-subtle)', paddingTop: '24px' }}>
                                    <h4 style={{ fontSize: '1rem', marginBottom: '16px', color: 'var(--text-secondary)' }}>Test Mode</h4>
                                    <div style={{ display: 'flex', gap: '16px' }}>
                                        <Button
                                            variant="secondary"
                                            onClick={async () => {
                                                if (confirm('Load test products? This will add demo items.')) {
                                                    await window.api.db.injectTestProducts();
                                                    loadData();
                                                    alert('Test products loaded!');
                                                }
                                            }}
                                        >
                                            Load Test Data
                                        </Button>
                                        <Button
                                            variant="danger"
                                            onClick={async () => {
                                                if (confirm('Clear ALL products? This cannot be undone.')) {
                                                    await window.api.db.clearProducts();
                                                    loadData();
                                                    alert('All products cleared!');
                                                }
                                            }}
                                        >
                                            Clear All Data
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    )}

                    {/* HARDWARE TAB */}
                    {activeTab === 'hardware' && (
                        <Card variant="glass" padding="lg">
                            <h3 style={{ fontSize: '1.25rem', marginBottom: '24px' }}>Printer Configuration</h3>
                            <div style={{ display: 'grid', gap: '20px' }}>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Connection Type</label>
                                    <select
                                        value={settings.printerInterface}
                                        onChange={e => setSettings({ ...settings, printerInterface: e.target.value as 'network' | 'usb' })}
                                    >
                                        <option value="network">Network (Ethernet/WiFi)</option>
                                        <option value="usb">USB Direct</option>
                                    </select>
                                </div>

                                {settings.printerInterface === 'network' ? (
                                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Printer IP Address</label>
                                            <input
                                                type="text"
                                                placeholder="192.168.1.200"
                                                value={settings.printerIp}
                                                onChange={e => setSettings({ ...settings, printerIp: e.target.value })}
                                            />
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Port</label>
                                            <input
                                                type="number"
                                                value={settings.printerPort}
                                                onChange={e => setSettings({ ...settings, printerPort: parseInt(e.target.value) })}
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>USB Path / Device ID</label>
                                        <input
                                            type="text"
                                            placeholder="/dev/usb/lp0 or VID:PID"
                                            value={settings.printerUsbPath}
                                            onChange={e => setSettings({ ...settings, printerUsbPath: e.target.value })}
                                        />
                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                            Linux: /dev/usb/lp0 | Windows: Printer Name
                                        </p>
                                    </div>
                                )}

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Driver Type</label>
                                    <select
                                        value={settings.printerType}
                                        onChange={e => setSettings({ ...settings, printerType: e.target.value })}
                                    >
                                        <option value="epson">EPSON (Standard)</option>
                                        <option value="star">Star Micronics</option>
                                    </select>
                                </div>
                                <div style={{ marginTop: '16px' }}>
                                    <Button variant="primary" onClick={handleSaveSettings} icon={<Save size={18} />}>
                                        Save Configuration
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    )}

                    {/* MENU TAB */}
                    {activeTab === 'menu' && (
                        <Card variant="glass" padding="lg">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                <h3 style={{ fontSize: '1.25rem' }}>Menu Items</h3>
                                <Button onClick={() => setIsAdding(!isAdding)} icon={<Plus size={18} />}>
                                    Add Product
                                </Button>
                            </div>

                            <AnimatePresence>
                                {isAdding && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        style={{ overflow: 'hidden', marginBottom: '24px' }}
                                    >
                                        <div style={{
                                            display: 'grid',
                                            gridTemplateColumns: '2fr 1fr 1fr 1fr auto',
                                            gap: '12px',
                                            background: 'rgba(255,255,255,0.05)',
                                            padding: '16px',
                                            borderRadius: 'var(--radius-md)',
                                            alignItems: 'end'
                                        }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Name</label>
                                                <input
                                                    type="text"
                                                    placeholder="e.g. Espresso"
                                                    value={newProduct.name}
                                                    onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                                                />
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Price ($)</label>
                                                <input
                                                    type="number"
                                                    placeholder="0.00"
                                                    value={newProduct.price}
                                                    onChange={e => setNewProduct({ ...newProduct, price: e.target.value })}
                                                />
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Category</label>
                                                <select
                                                    value={newProduct.category}
                                                    onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}
                                                >
                                                    <option>Coffee</option>
                                                    <option>Bakery</option>
                                                    <option>Dessert</option>
                                                    <option>Drinks</option>
                                                    <option>Food</option>
                                                </select>
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>VAT (%)</label>
                                                <input
                                                    type="number"
                                                    value={newProduct.taxRate}
                                                    onChange={e => setNewProduct({ ...newProduct, taxRate: parseInt(e.target.value) })}
                                                />
                                            </div>
                                            <Button variant="primary" onClick={handleAddProduct} icon={<Save size={18} />}>
                                                Save
                                            </Button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Product List */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {isLoading ? (
                                    <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading products...</div>
                                ) : products.length === 0 ? (
                                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', border: '1px dashed var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
                                        No products found. Add your first item!
                                    </div>
                                ) : (
                                    products.map(product => (
                                        <motion.div
                                            key={product.id}
                                            layout
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                padding: '16px',
                                                background: 'rgba(255,255,255,0.02)',
                                                borderRadius: 'var(--radius-md)',
                                                border: '1px solid transparent'
                                            }}
                                            whileHover={{ background: 'rgba(255,255,255,0.05)', borderColor: 'var(--border-subtle)' }}
                                        >
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: 600 }}>{product.name}</div>
                                                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{product.category}</div>
                                            </div>
                                            <div style={{ width: '100px', textAlign: 'right', fontWeight: 600, color: 'var(--primary)' }}>
                                                ${product.price.toFixed(2)}
                                            </div>
                                            <div style={{ width: '80px', textAlign: 'right', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                                {product.taxRate}% VAT
                                            </div>
                                            <div style={{ marginLeft: '24px' }}>
                                                <button
                                                    onClick={() => handleDeleteProduct(product.id)}
                                                    style={{
                                                        background: 'transparent',
                                                        border: 'none',
                                                        color: 'var(--danger)',
                                                        cursor: 'pointer',
                                                        padding: '8px',
                                                        borderRadius: 'var(--radius-sm)',
                                                        display: 'flex'
                                                    }}
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </div>
                        </Card>
                    )}
                </div>
            </div>

        </div >
    );
};

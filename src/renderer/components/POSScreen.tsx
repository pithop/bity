import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Trash2, CreditCard, Banknote, ChevronRight } from 'lucide-react';
import { Button } from './Button';
import { Card } from './Card';
import { CATEGORIES } from '../data/mock';
import { PaymentModal } from './PaymentModal';
import { ProductCard } from './ProductCard';


interface CartItem {
    id: string;
    productId: string;
    name: string;
    price: number;
    quantity: number;
}

export const POSScreen: React.FC = () => {
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [cart, setCart] = useState<CartItem[]>([]);
    const [processing, setProcessing] = useState(false);

    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

    const [products, setProducts] = useState<any[]>([]);

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try {
            const data = await window.api.db.getProducts();
            setProducts(data);
        } catch (error) {
            console.error('Failed to load products:', error);
        }
    };

    const filteredProducts = useMemo(() => {
        return products.filter(p => {
            const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
            const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [products, selectedCategory, searchQuery]);

    const addToCart = (product: any) => {
        setCart(prev => {
            const existing = prev.find(item => item.productId === product.id);
            if (existing) {
                return prev.map(item =>
                    item.productId === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prev, {
                id: Date.now().toString(),
                productId: product.id,
                name: product.name,
                price: product.price,
                quantity: 1
            }];
        });
    };

    const removeFromCart = (productId: string) => {
        setCart(prev => prev.filter(item => item.productId !== productId));
    };

    const updateQuantity = (productId: string, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.productId === productId) {
                const newQty = item.quantity + delta;
                return newQty > 0 ? { ...item, quantity: newQty } : item;
            }
            return item;
        }));
    };

    const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const [orderType, setOrderType] = useState<'DINE_IN' | 'TAKEAWAY'>('DINE_IN');

    // ... (existing useEffects)

    // ... (existing helper functions)

    const handleCheckoutClick = () => {
        if (cart.length === 0) return;
        setIsPaymentModalOpen(true);
    };

    const handlePaymentConfirm = async (method: 'cash' | 'card') => {
        try {
            // Transform cart to order format with VAT calculation
            const orderItems = cart.map(item => {
                // MVP VAT Logic:
                // If Takeaway AND original tax rate was 10% (Food), lower it to 5.5%.
                // Alcohol (20%) stays 20%.
                // We need to find the original product to get its base tax rate.
                const product = products.find(p => p.id === item.productId);
                let appliedTaxRate = product?.taxRate || 20; // Default to 20 if unknown

                if (orderType === 'TAKEAWAY' && appliedTaxRate === 10) {
                    appliedTaxRate = 5.5;
                }

                return {
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    taxRate: appliedTaxRate
                };
            });

            await window.api.db.addOrder({
                items: orderItems,
                total: cartTotal,
                paymentMethod: method,
                type: orderType // Store the type for reporting
            });

            setCart([]);
            setOrderType('DINE_IN'); // Reset to default
        } catch (error) {
            console.error('Checkout failed:', error);
            throw error; // Re-throw for modal to handle
        }
    };

    return (
        <>
            <div style={{ display: 'flex', height: 'calc(100vh - 120px)', gap: '24px' }}>
                {/* Left Side: Products */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Categories & Search */}
                    <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '4px' }}>
                        {CATEGORIES.map(cat => (
                            <Button
                                key={cat}
                                variant={selectedCategory === cat ? 'primary' : 'secondary'}
                                onClick={() => setSelectedCategory(cat)}
                                size="sm"
                            >
                                {cat}
                            </Button>
                        ))}
                        <div style={{ marginLeft: 'auto', position: 'relative' }}>
                            <Search size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{
                                    background: 'var(--bg-panel)',
                                    border: '1px solid var(--border-subtle)',
                                    borderRadius: 'var(--radius-full)',
                                    padding: '8px 16px 8px 36px',
                                    color: 'var(--text-primary)',
                                    outline: 'none',
                                    width: '200px'
                                }}
                            />
                        </div>
                    </div>

                    {/* Product Grid */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                        gap: '16px',
                        overflowY: 'auto',
                        paddingRight: '8px'
                    }}>
                        {filteredProducts.map(product => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                onClick={() => addToCart(product)}
                            />
                        ))}
                    </div>
                </div>

                {/* Right Side: Cart */}
                <Card variant="glass" padding="none" style={{ width: '400px', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2 style={{ fontSize: '1.25rem' }}>Current Order</h2>

                        {/* Order Type Toggle */}
                        <div style={{ display: 'flex', background: 'var(--bg-app)', borderRadius: 'var(--radius-full)', padding: '4px' }}>
                            <button
                                onClick={() => setOrderType('DINE_IN')}
                                style={{
                                    background: orderType === 'DINE_IN' ? 'var(--primary-start)' : 'transparent',
                                    color: orderType === 'DINE_IN' ? '#fff' : 'var(--text-secondary)',
                                    border: 'none',
                                    borderRadius: 'var(--radius-full)',
                                    padding: '6px 12px',
                                    fontSize: '0.85rem',
                                    fontWeight: 500,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                Sur Place
                            </button>
                            <button
                                onClick={() => setOrderType('TAKEAWAY')}
                                style={{
                                    background: orderType === 'TAKEAWAY' ? 'var(--accent-start)' : 'transparent',
                                    color: orderType === 'TAKEAWAY' ? '#fff' : 'var(--text-secondary)',
                                    border: 'none',
                                    borderRadius: 'var(--radius-full)',
                                    padding: '6px 12px',
                                    fontSize: '0.85rem',
                                    fontWeight: 500,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                A Emporter
                            </button>
                        </div>
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <AnimatePresence>
                            {cart.map(item => (
                                <motion.div
                                    key={item.productId}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: 'var(--radius-md)' }}
                                >
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 500 }}>{item.name}</div>
                                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>${item.price.toFixed(2)}</div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-app)', borderRadius: 'var(--radius-full)', padding: '4px' }}>
                                            <button onClick={(e) => { e.stopPropagation(); updateQuantity(item.productId, -1); }} style={{ width: 24, height: 24, borderRadius: '50%', border: 'none', background: 'var(--bg-hover)', color: '#fff', cursor: 'pointer' }}>-</button>
                                            <span style={{ minWidth: '20px', textAlign: 'center', fontSize: '0.9rem' }}>{item.quantity}</span>
                                            <button onClick={(e) => { e.stopPropagation(); updateQuantity(item.productId, 1); }} style={{ width: 24, height: 24, borderRadius: '50%', border: 'none', background: 'var(--primary-start)', color: '#fff', cursor: 'pointer' }}>+</button>
                                        </div>
                                        <button onClick={(e) => { e.stopPropagation(); removeFromCart(item.productId); }} style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}>
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        {cart.length === 0 && (
                            <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '40px' }}>
                                Cart is empty
                            </div>
                        )}
                    </div>

                    <div style={{ padding: '20px', background: 'rgba(0,0,0,0.2)', borderTop: '1px solid var(--border-subtle)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                            <span>VAT Mode</span>
                            <span style={{ color: orderType === 'TAKEAWAY' ? 'var(--accent-light)' : 'var(--text-primary)' }}>
                                {orderType === 'TAKEAWAY' ? 'Reduced (5.5%)' : 'Standard (10%/20%)'}
                            </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontSize: '1.5rem', fontWeight: 700 }}>
                            <span>Total</span>
                            <span>${cartTotal.toFixed(2)}</span>
                        </div>

                        <Button
                            variant="success"
                            size="lg"
                            style={{
                                width: '100%',
                                justifyContent: 'space-between',
                                height: '64px',
                                fontSize: '1.25rem',
                                boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)'
                            }}
                            disabled={cart.length === 0}
                            onClick={handleCheckoutClick}
                        >
                            <span style={{ fontWeight: 700 }}>Checkout</span>
                            <ChevronRight size={24} />
                        </Button>
                    </div>
                </Card>
            </div>

            <PaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                total={cartTotal}
                onConfirm={handlePaymentConfirm}
            />
        </>
    );
};

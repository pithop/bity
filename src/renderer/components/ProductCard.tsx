import React from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';

interface ProductCardProps {
    product: {
        id: string;
        name: string;
        price: number;
        category: string;
        image?: string;
    };
    onClick: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onClick }) => {
    return (
        <motion.div
            whileHover={{ y: -4, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            style={{
                position: 'relative',
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                cursor: 'pointer',
                height: '160px',
                display: 'flex',
                flexDirection: 'column',
                border: '1px solid var(--border-subtle)',
                boxShadow: 'var(--shadow-sm)',
                transition: 'border-color 0.2s, box-shadow 0.2s'
            }}
            className="product-card"
        >
            {/* Image Placeholder or Actual Image */}
            <div style={{
                height: '80px',
                background: 'linear-gradient(135deg, var(--bg-hover) 0%, var(--bg-panel) 100%)',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Gradient Overlay */}
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 100%)'
                }} />

                <div style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    background: 'rgba(0,0,0,0.4)',
                    backdropFilter: 'blur(4px)',
                    padding: '4px 8px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.75rem',
                    color: 'rgba(255,255,255,0.9)'
                }}>
                    {product.category}
                </div>
            </div>

            <div style={{ padding: '12px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div style={{ fontWeight: 600, fontSize: '1rem', lineHeight: '1.2' }}>
                    {product.name}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{
                        fontWeight: 700,
                        fontSize: '1.1rem',
                        color: 'var(--primary-start)',
                        textShadow: '0 0 20px rgba(99, 102, 241, 0.3)'
                    }}>
                        ${product.price.toFixed(2)}
                    </div>

                    <div style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        background: 'var(--bg-hover)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--text-primary)'
                    }}>
                        <Plus size={16} />
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

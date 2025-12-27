import React, { useState } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { X, CreditCard, Banknote, Check, ArrowRight, Wallet } from 'lucide-react';
import { Button } from './Button';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    total: number;
    onConfirm: (method: 'cash' | 'card') => Promise<void>;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, total, onConfirm }) => {
    const [method, setMethod] = useState<'cash' | 'card' | null>(null);
    const [processing, setProcessing] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleConfirm = async () => {
        if (!method) return;
        setProcessing(true);
        try {
            await onConfirm(method);
            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                setMethod(null);
                onClose();
            }, 2500);
        } catch (error) {
            console.error('Payment failed', error);
        } finally {
            setProcessing(false);
        }
    };

    const containerVariants: Variants = {
        hidden: { opacity: 0, scale: 0.95, y: 20 },
        visible: {
            opacity: 1,
            scale: 1,
            y: 0,
            transition: { type: 'spring', duration: 0.5, bounce: 0.3 }
        },
        exit: { opacity: 0, scale: 0.95, y: 20 }
    };

    const cardVariants: Variants = {
        hover: { scale: 1.02, y: -4, boxShadow: '0 20px 30px -10px rgba(0,0,0,0.5)' },
        tap: { scale: 0.98 },
        selected: {
            borderColor: 'var(--primary)',
            background: 'var(--primary-light)',
            boxShadow: '0 0 0 2px var(--primary)'
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop with Blur */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            background: 'rgba(0, 0, 0, 0.6)',
                            backdropFilter: 'blur(12px)',
                            zIndex: 50,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        {/* Modal Container */}
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                background: 'rgba(24, 24, 27, 0.85)',
                                backdropFilter: 'blur(20px)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '32px',
                                padding: '40px',
                                width: '100%',
                                maxWidth: '520px',
                                position: 'relative',
                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                                overflow: 'hidden'
                            }}
                        >


                            <button
                                onClick={onClose}
                                style={{
                                    position: 'absolute',
                                    top: '24px',
                                    right: '24px',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: 'none',
                                    borderRadius: '50%',
                                    width: '36px',
                                    height: '36px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'var(--text-muted)',
                                    cursor: 'pointer',
                                    zIndex: 10,
                                    transition: 'all 0.2s'
                                }}
                            >
                                <X size={20} />
                            </button>

                            {!success ? (
                                <div style={{ position: 'relative', zIndex: 1 }}>
                                    <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                                        <div style={{
                                            fontSize: '0.875rem',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.1em',
                                            color: 'var(--text-secondary)',
                                            marginBottom: '8px'
                                        }}>
                                            Total Amount
                                        </div>
                                        <div style={{
                                            fontSize: '3.5rem',
                                            fontWeight: 800,
                                            color: 'var(--text-primary)',
                                            letterSpacing: '-0.02em'
                                        }}>
                                            ${total.toFixed(2)}
                                        </div>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '40px' }}>
                                        {/* Card Option */}
                                        <motion.div
                                            variants={cardVariants}
                                            whileHover="hover"
                                            whileTap="tap"
                                            animate={method === 'card' ? 'selected' : {}}
                                            onClick={() => setMethod('card')}
                                            style={{
                                                background: 'rgba(255,255,255,0.03)',
                                                border: '1px solid rgba(255,255,255,0.08)',
                                                borderRadius: '24px',
                                                padding: '24px',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                gap: '16px',
                                                transition: 'border-color 0.2s'
                                            }}
                                        >
                                            <div style={{
                                                width: '64px',
                                                height: '64px',
                                                borderRadius: '20px',
                                                background: 'var(--primary)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                boxShadow: '0 10px 20px -5px rgba(99, 102, 241, 0.4)'
                                            }}>
                                                <CreditCard size={32} color="white" />
                                            </div>
                                            <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>Card Payment</div>
                                        </motion.div>

                                        {/* Cash Option */}
                                        <motion.div
                                            variants={cardVariants}
                                            whileHover="hover"
                                            whileTap="tap"
                                            animate={method === 'cash' ? 'selected' : {}}
                                            onClick={() => setMethod('cash')}
                                            style={{
                                                background: 'rgba(255,255,255,0.03)',
                                                border: '1px solid rgba(255,255,255,0.08)',
                                                borderRadius: '24px',
                                                padding: '24px',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                gap: '16px',
                                                transition: 'border-color 0.2s'
                                            }}
                                        >
                                            <div style={{
                                                width: '64px',
                                                height: '64px',
                                                borderRadius: '20px',
                                                background: 'var(--success)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                boxShadow: '0 10px 20px -5px rgba(16, 185, 129, 0.4)'
                                            }}>
                                                <Banknote size={32} color="white" />
                                            </div>
                                            <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>Cash Payment</div>
                                        </motion.div>
                                    </div>

                                    <Button
                                        variant="primary"
                                        size="lg"
                                        style={{
                                            width: '100%',
                                            height: '64px',
                                            fontSize: '1.2rem',
                                            borderRadius: '16px',
                                            background: !method ? 'var(--bg-hover)' : 'var(--primary)',
                                            color: !method ? 'var(--text-muted)' : 'white'
                                        }}
                                        disabled={!method || processing}
                                        loading={processing}
                                        onClick={handleConfirm}
                                    >
                                        {processing ? 'Processing...' : (
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                Confirm Payment <ArrowRight size={24} />
                                            </span>
                                        )}
                                    </Button>
                                </div>
                            ) : (
                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: '60px 0',
                                    position: 'relative',
                                    zIndex: 1
                                }}>
                                    <motion.div
                                        initial={{ scale: 0, rotate: -180 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                                        style={{
                                            width: '120px',
                                            height: '120px',
                                            borderRadius: '50%',
                                            background: 'var(--success)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            marginBottom: '32px',
                                            boxShadow: '0 0 40px var(--success)'
                                        }}
                                    >
                                        <Check size={64} color="white" strokeWidth={3} />
                                    </motion.div>
                                    <motion.h3
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                        style={{ fontSize: '2rem', marginBottom: '12px', fontWeight: 700 }}
                                    >
                                        Payment Successful
                                    </motion.h3>
                                    <motion.p
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.4 }}
                                        style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}
                                    >
                                        Receipt is printing...
                                    </motion.p>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

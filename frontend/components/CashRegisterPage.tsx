import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useProducts } from '../context/ProductContext';
import { Product } from '../types';

interface CartItem extends Product {
    cartInstanceId: number;
}

type ConnectionStatus = 'connecting' | 'connected' | 'disconnected';

const ConnectionIndicator: React.FC<{ status: ConnectionStatus }> = ({ status }) => {
    const statusMap = {
        connecting: { text: "Connexion...", color: "bg-yellow-500" },
        connected: { text: "Connecté", color: "bg-green-500" },
        disconnected: { text: "Déconnecté", color: "bg-red-500" },
    };
    const { text, color } = statusMap[status];

    return (
        <div className="flex items-center space-x-2 text-xs text-gray-500">
            <span className={`h-2 w-2 rounded-full ${color} animate-pulse`}></span>
            <span>{text} au service de scan en temps réel.</span>
        </div>
    );
};


const ScanInput: React.FC<{ onScan: (id: string) => void }> = ({ onScan }) => {
    const [scannedId, setScannedId] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);
    
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const handleScan = (e: React.FormEvent) => {
        e.preventDefault();
        if (scannedId.trim()) {
            onScan(scannedId.trim());
            setScannedId('');
        }
    };
    
    return (
        <form onSubmit={handleScan} className="p-6 bg-white rounded-lg shadow-md">
            <label htmlFor="scan-input" className="block text-sm font-medium text-gray-700 mb-1">
                Simuler le scan d'un produit
            </label>
            <div className="flex space-x-2">
                <input 
                    ref={inputRef}
                    id="scan-input"
                    type="text" 
                    value={scannedId} 
                    onChange={(e) => setScannedId(e.target.value)}
                    placeholder="Entrer le code QR ici..."
                    className="flex-grow block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
                <button type="submit" className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                    Ajouter
                </button>
            </div>
             <p className="mt-2 text-xs text-gray-500">En situation réelle avec QRbot, les produits s'ajouteront automatiquement.</p>
        </form>
    );
};

const Cart: React.FC<{
    items: CartItem[];
    onRemoveItem: (item: CartItem) => void;
    onFinalizeSale: () => void;
}> = ({ items, onRemoveItem, onFinalizeSale }) => {
    const total = items.reduce((sum, item) => sum + item.price, 0);

    return (
        <div className="p-6 bg-white rounded-lg shadow-md flex flex-col h-full">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Vente en cours</h2>
            <div className="flex-grow overflow-y-auto border-t border-b border-gray-200 -mx-6 px-6 py-2">
                {items.length === 0 ? (
                    <p className="text-gray-500 text-center py-10">Scannez un produit pour commencer.</p>
                ) : (
                    <ul className="divide-y divide-gray-200">
                        {items.map((item) => (
                            <li key={item.cartInstanceId} className="py-3 flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-900">{item.name}</p>
                                    <p className="text-sm text-gray-500">{item.price.toFixed(2)} €</p>
                                </div>
                                <button onClick={() => onRemoveItem(item)} className="text-red-500 hover:text-red-700">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            <div className="mt-auto pt-4">
                 <div className="flex justify-between items-center text-2xl font-bold text-gray-800 py-4 border-t-2 border-dashed">
                    <span>Total</span>
                    <span>{total.toFixed(2)} €</span>
                </div>
                <button 
                    onClick={onFinalizeSale} 
                    disabled={items.length === 0}
                    className="w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    Finaliser la Vente
                </button>
            </div>
        </div>
    );
};

const CashRegisterPage: React.FC = () => {
    const { getProductById, adjustStock } = useProducts();
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting');
    
    const handleScan = useCallback((id: string) => {
        const product = getProductById(id);
        if (!product) {
            alert(`Produit non trouvé pour le code: ${id}`);
            return;
        }

        if (product.stock <= 0) {
            alert("Ce produit est en rupture de stock.");
            return;
        }

        if (adjustStock(id, -1)) {
            const newItem: CartItem = {
                ...product,
                stock: product.stock - 1,
                cartInstanceId: Date.now() + Math.random(),
            };
            setCartItems(prevItems => [newItem, ...prevItems]);
        } else {
             alert("Stock insuffisant pour ajouter ce produit.");
        }
    }, [getProductById, adjustStock]);

    useEffect(() => {
        const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${wsProtocol}//${window.location.host}`;
        
        let ws: WebSocket | null = null;
        // FIX: Use ReturnType<typeof setTimeout> for browser compatibility instead of NodeJS.Timeout
        let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
        
        const connect = () => {
            // Use the /api path for Vercel deployment, which will be handled by our backend function.
             ws = new WebSocket(wsUrl, 'optional-protocol');

            ws.onopen = () => {
                console.log('WebSocket connected');
                setConnectionStatus('connected');
                 if(reconnectTimeout) clearTimeout(reconnectTimeout);
            };

            ws.onmessage = (event) => {
                console.log('Received from WS:', event.data);
                handleScan(event.data);
            };

            ws.onclose = () => {
                console.log('WebSocket disconnected');
                setConnectionStatus('disconnected');
                // Attempt to reconnect after a delay
                reconnectTimeout = setTimeout(connect, 5000);
            };

            ws.onerror = (err) => {
                console.error('WebSocket error:', err);
                ws?.close();
            };
        }

        connect();

        return () => {
            if(reconnectTimeout) clearTimeout(reconnectTimeout);
            ws?.close();
        };
    }, [handleScan]);

    const handleRemoveItem = (itemToRemove: CartItem) => {
        adjustStock(itemToRemove.id, 1);
        setCartItems(prevItems => prevItems.filter(item => item.cartInstanceId !== itemToRemove.cartInstanceId));
    };

    const handleFinalizeSale = () => {
        if (window.confirm(`Confirmer la vente pour un total de ${cartItems.reduce((sum, item) => sum + item.price, 0).toFixed(2)} € ?`)) {
            setCartItems([]);
            alert("Vente finalisée avec succès !");
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-h-[calc(100vh-10rem)]">
            <div className="space-y-4">
                <ScanInput onScan={handleScan} />
                <ConnectionIndicator status={connectionStatus} />
            </div>
            <div className="h-full">
                <Cart items={cartItems} onRemoveItem={handleRemoveItem} onFinalizeSale={handleFinalizeSale} />
            </div>
        </div>
    );
};

export default CashRegisterPage;
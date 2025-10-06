
import React from 'react';
import { CartItem } from '../types.ts';
import { TrashIcon, PlusIcon } from './Icons.tsx';

interface CartSidebarProps {
    cartItems: CartItem[];
    onClose: () => void;
    onUpdateQuantity: (productId: number, quantity: number) => void;
    onRemoveItem: (productId: number) => void;
}

const CartSidebar: React.FC<CartSidebarProps> = ({ cartItems, onClose, onUpdateQuantity, onRemoveItem }) => {

    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return (
        <div className="fixed inset-0 z-50">
            {/* Overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-60 transition-opacity" onClick={onClose}></div>

            {/* Sidebar */}
            <div className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-xl flex flex-col transform transition-transform duration-300 ease-in-out translate-x-0">
                <header className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-xl font-bold text-gray-800">Meu Carrinho</h2>
                    <button onClick={onClose} className="text-2xl text-gray-500 hover:text-gray-800">&times;</button>
                </header>
                
                {cartItems.length > 0 ? (
                    <>
                        <div className="flex-grow overflow-y-auto p-4 space-y-4">
                            {cartItems.map(item => (
                                <div key={item.productId} className="flex items-start gap-4">
                                    <img src={item.imageUrl} alt={item.name} className="h-20 w-20 object-contain border rounded-md p-1" />
                                    <div className="flex-grow">
                                        <p className="text-sm font-semibold text-gray-800">{item.name}</p>
                                        <p className="text-lg font-bold text-gray-900 mt-1">R$ {item.price.toFixed(2)}</p>
                                        <div className="flex items-center border rounded-md w-fit mt-2">
                                            <button onClick={() => onUpdateQuantity(item.productId, item.quantity - 1)} className="px-2 py-1 text-gray-600 hover:bg-gray-100 rounded-l-md">-</button>
                                            <span className="px-3 text-sm">{item.quantity}</span>
                                            <button onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)} className="px-2 py-1 text-gray-600 hover:bg-gray-100 rounded-r-md">+</button>
                                        </div>
                                    </div>
                                    <button onClick={() => onRemoveItem(item.productId)} className="text-gray-400 hover:text-red-500 p-1">
                                        <TrashIcon className="h-5 w-5"/>
                                    </button>
                                </div>
                            ))}
                        </div>

                        <footer className="p-4 border-t bg-gray-50">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-lg font-semibold text-gray-700">Subtotal:</span>
                                <span className="text-2xl font-bold text-gray-900">R$ {subtotal.toFixed(2)}</span>
                            </div>
                             <button className="w-full bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 transition-colors">
                                Finalizar Compra
                            </button>
                             <button onClick={onClose} className="w-full mt-2 text-sm text-gray-600 hover:text-black">
                                Continuar comprando
                            </button>
                        </footer>
                    </>
                ) : (
                    <div className="flex-grow flex flex-col items-center justify-center text-center p-4">
                        <img src="https://atacadao.com.br/costco/images/empty-cart.svg" alt="Carrinho Vazio" className="w-40 h-40 mb-4" />
                        <h3 className="text-xl font-bold text-gray-800">Seu carrinho está vazio</h3>
                        <p className="text-gray-500 mt-2">Adicione produtos para vê-los aqui.</p>
                        <button onClick={onClose} className="mt-6 bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700">Começar a comprar</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CartSidebar;

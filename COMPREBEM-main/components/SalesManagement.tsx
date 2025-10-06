import React, { useState, useMemo, useRef, useEffect } from 'react';
import { AppState, Order, Quote, AbandonedCart, User, Product, SalesRepresentative, OrderItem } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { ChevronLeftIcon, ChevronRightIcon, UploadIcon, PlusIcon, TrashIcon, EyeIcon, PencilIcon } from './Icons';

interface SalesManagementProps {
    appState: AppState;
    setAppState: React.Dispatch<React.SetStateAction<AppState>>;
}

type SalesTab = 'orders' | 'quotes' | 'b2b' | 'abandonedCarts' | 'directSales';

const Toast: React.FC<{ message: string; onClear: () => void }> = ({ message, onClear }) => {
    useEffect(() => {
        const timer = setTimeout(onClear, 3000);
        return () => clearTimeout(timer);
    }, [onClear]);

    return (
        <div className="fixed bottom-5 right-5 bg-green-600 text-white py-3 px-5 rounded-lg shadow-lg z-[100] animate-bounce">
            {message}
        </div>
    );
};

const OrderDetailsModal: React.FC<{ order: Order; onClose: () => void }> = ({ order, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-2xl">
            <h2 className="text-2xl font-bold mb-4">Detalhes do Pedido #{order.id}</h2>
            <div className="text-sm space-y-2 mb-4">
                <p><strong>Cliente:</strong> {order.customerName} ({order.customerEmail})</p>
                <p><strong>Data:</strong> {new Date(order.date + 'T00:00:00').toLocaleDateString()}</p>
                <p><strong>Total:</strong> R$ {order.total.toFixed(2)}</p>
            </div>
            <h3 className="font-semibold mb-2">Itens:</h3>
            <ul className="border rounded-md p-2 max-h-48 overflow-y-auto">
                {order.items.map(item => (
                    <li key={item.productId} className="flex justify-between p-1">
                        <span>{item.productName} (x{item.quantity})</span>
                        <span>R$ {(item.price * item.quantity).toFixed(2)}</span>
                    </li>
                ))}
            </ul>
            <button onClick={onClose} className="mt-6 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg w-full">Fechar</button>
        </div>
    </div>
);

const QuoteFormModal: React.FC<{
    quote: Quote | null;
    onClose: () => void;
    onSave: (quote: Quote) => void;
    users: User[];
    products: Product[];
}> = ({ quote, onClose, onSave, users, products }) => {
    const isNew = quote === null;
    const [formData, setFormData] = useState<Quote>(quote || {
        id: uuidv4(), customerName: '', total: 0, status: 'Rascunho', createdAt: new Date().toISOString().split('T')[0], items: []
    });

    const handleItemChange = (index: number, field: 'productId' | 'quantity', value: any) => {
        const newItems = [...formData.items];
        const product = products.find(p => p.id === Number(value));
        if (field === 'productId') {
            newItems[index] = { ...newItems[index], productId: Number(value), productName: product?.name || '', price: product?.price || 0 };
        } else {
            newItems[index] = { ...newItems[index], quantity: Number(value) };
        }
        updateQuote(newItems);
    };

    const addItem = () => updateQuote([...formData.items, { productId: 0, productName: '', quantity: 1, price: 0 }]);
    const removeItem = (index: number) => updateQuote(formData.items.filter((_, i) => i !== index));

    const updateQuote = (items: OrderItem[]) => {
        const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        setFormData(prev => ({ ...prev, items, total }));
    };

    const handleSave = () => {
        if (!formData.customerName || formData.items.length === 0 || formData.items.some(i => i.productId === 0)) {
            alert('Selecione um cliente e adicione pelo menos um produto válido.');
            return;
        }
        onSave(formData);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl max-h-[90vh] flex flex-col">
                <h2 className="text-2xl font-bold mb-4">{isNew ? 'Novo Orçamento' : 'Editar Orçamento'}</h2>
                <div className="flex-grow overflow-y-auto pr-2">
                    <select value={formData.customerName} onChange={e => setFormData(prev => ({...prev, customerName: e.target.value}))} className="w-full p-2 border rounded-md mb-4" required>
                        <option value="">Selecione um Cliente</option>
                        {users.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
                    </select>
                    {formData.items.map((item, index) => (
                         <div key={index} className="flex items-center gap-2 mb-2">
                            <select value={item.productId} onChange={e => handleItemChange(index, 'productId', e.target.value)} className="flex-grow p-2 border rounded-md bg-white">
                                <option value={0}>Selecione um Produto</option>
                                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                            <input type="number" value={item.quantity} onChange={e => handleItemChange(index, 'quantity', e.target.value)} min="1" className="w-24 p-2 border rounded-md" placeholder="Qtd."/>
                            <button onClick={() => removeItem(index)} className="p-2 text-red-500 hover:bg-red-100 rounded-full"><TrashIcon className="h-5 w-5"/></button>
                        </div>
                    ))}
                     <button onClick={addItem} className="text-sm font-semibold text-blue-600 mt-2">+ Adicionar Produto</button>
                </div>
                <div className="flex-shrink-0 border-t pt-4 mt-4">
                    <div className="flex justify-between items-center mb-4">
                        <span className="font-bold text-lg">Total do Orçamento:</span>
                        <span className="font-bold text-xl">R$ {formData.total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={onClose} className="bg-gray-200 py-2 px-4 rounded-lg">Cancelar</button>
                        <button onClick={handleSave} className="bg-blue-600 text-white py-2 px-4 rounded-lg">Salvar Orçamento</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- View Components ---

const OrdersView: React.FC<{ orders: Order[], onStatusChange: (id: string, status: Order['status']) => void, onViewDetails: (order: Order) => void }> = ({ orders, onStatusChange, onViewDetails }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;
    const totalPages = Math.ceil(orders.length / ITEMS_PER_PAGE);
    const paginatedOrders = orders.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const statusClasses: Record<Order['status'], string> = { 'Pendente': 'bg-yellow-100 text-yellow-800', 'Pago': 'bg-blue-100 text-blue-800', 'Enviado': 'bg-indigo-100 text-indigo-800', 'Entregue': 'bg-green-100 text-green-800', 'Cancelado': 'bg-red-100 text-red-800' };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold mb-4">Todos os Pedidos</h3>
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="text-xs uppercase bg-gray-100"><tr><th className="px-4 py-3 text-left">Pedido</th><th className="px-4 py-3 text-left">Cliente</th><th className="px-4 py-3 text-left">Data</th><th className="px-4 py-3 text-left">Total</th><th className="px-4 py-3 text-left">Status</th><th className="px-4 py-3 text-right">Ações</th></tr></thead>
                    <tbody>
                        {paginatedOrders.map(order => (
                            <tr key={order.id} className="border-b hover:bg-gray-50">
                                <td className="px-4 py-3 font-mono">{order.id}</td>
                                <td className="px-4 py-3 font-medium">{order.customerName}</td>
                                <td className="px-4 py-3">{new Date(order.date + 'T00:00:00').toLocaleDateString()}</td>
                                <td className="px-4 py-3">R$ {order.total.toFixed(2)}</td>
                                <td className="px-4 py-3"><select value={order.status} onChange={e => onStatusChange(order.id, e.target.value as any)} className={`p-1 text-xs font-semibold rounded-full border-0 focus:ring-2 focus:ring-blue-400 ${statusClasses[order.status]}`}><option>Pendente</option><option>Pago</option><option>Enviado</option><option>Entregue</option><option>Cancelado</option></select></td>
                                <td className="px-4 py-3 text-right"><button onClick={() => onViewDetails(order)} className="p-1 text-blue-600 hover:bg-blue-100 rounded-full"><EyeIcon className="h-5 w-5"/></button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {/* Pagination */}
        </div>
    );
};

const QuotesView: React.FC<{ quotes: Quote[], onNew: () => void, onEdit: (q: Quote) => void, onDelete: (id: string) => void }> = ({ quotes, onNew, onEdit, onDelete }) => {
    const statusClasses: Record<Quote['status'], string> = { 'Rascunho': 'bg-gray-200', 'Enviado': 'bg-blue-100 text-blue-800', 'Aceito': 'bg-green-100 text-green-800', 'Recusado': 'bg-red-100 text-red-800' };
    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4"><h3 className="text-xl font-bold">Orçamentos B2B</h3><button onClick={onNew} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2"><PlusIcon className="h-5 w-5"/>Novo Orçamento</button></div>
            <table className="w-full text-sm">
                <thead className="text-xs uppercase bg-gray-100"><tr><th className="p-3 text-left">Orçamento</th><th className="p-3 text-left">Cliente</th><th className="p-3 text-left">Total</th><th className="p-3 text-left">Status</th><th className="p-3 text-right">Ações</th></tr></thead>
                <tbody>{quotes.map(q => <tr key={q.id} className="border-t">
                    <td className="p-3 font-mono">{q.id}</td><td className="p-3 font-medium">{q.customerName}</td><td className="p-3">R$ {q.total.toFixed(2)}</td><td className="p-3"><span className={`px-2 py-1 text-xs rounded-full ${statusClasses[q.status]}`}>{q.status}</span></td>
                    <td className="p-3 text-right space-x-1"><button onClick={() => onEdit(q)} className="p-1 text-blue-600 hover:bg-blue-100 rounded-full"><PencilIcon className="h-5 w-5"/></button><button onClick={() => onDelete(q.id)} className="p-1 text-red-500 hover:bg-red-100 rounded-full"><TrashIcon className="h-5 w-5"/></button></td>
                </tr>)}</tbody>
            </table>
        </div>
    );
};

const AbandonedCartsView: React.FC<{ carts: AbandonedCart[], showToast: (msg: string) => void }> = ({ carts, showToast }) => {
    return (
         <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold mb-4">Recuperação de Carrinhos Abandonados</h3>
            <div className="space-y-4">
                {carts.map(cart => (
                    <div key={cart.id} className="p-4 border rounded-lg flex justify-between items-center">
                        <div>
                            <p className="font-semibold">{cart.customerEmail}</p>
                            <p className="text-sm text-gray-600">{cart.items.length} itens - Total: <span className="font-bold">R$ {cart.total.toFixed(2)}</span></p>
                            <p className="text-xs text-gray-400">Visto por último em: {new Date(cart.lastSeen).toLocaleString()}</p>
                        </div>
                        <button onClick={() => showToast(`E-mail de recuperação enviado para ${cart.customerEmail}!`)} className="bg-green-600 text-white font-semibold py-2 px-3 text-sm rounded-lg">Enviar E-mail</button>
                    </div>
                ))}
            </div>
        </div>
    );
};


const SalesManagement: React.FC<SalesManagementProps> = ({ appState, setAppState }) => {
    const [activeTab, setActiveTab] = useState<SalesTab>('orders');
    const [toastMessage, setToastMessage] = useState('');
    const [isOrderModalOpen, setOrderModalOpen] = useState(false);
    const [isQuoteModalOpen, setQuoteModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [editingQuote, setEditingQuote] = useState<Quote | null>(null);

    const showToast = (message: string) => setToastMessage(message);
    const handleClearToast = () => setToastMessage('');

    const allProducts = useMemo(() => appState.productSections.flatMap(s => s.products), [appState.productSections]);

    const handleSaveQuote = (quote: Quote) => {
        setAppState(prev => {
            const exists = prev.quotes.some(q => q.id === quote.id);
            const newQuotes = exists ? prev.quotes.map(q => q.id === quote.id ? quote : q) : [quote, ...prev.quotes];
            return { ...prev, quotes: newQuotes };
        });
        showToast('Orçamento salvo com sucesso!');
    };

    const handleDeleteQuote = (id: string) => {
        if(window.confirm('Excluir este orçamento?')) {
            setAppState(prev => ({ ...prev, quotes: prev.quotes.filter(q => q.id !== id) }));
            showToast('Orçamento excluído!');
        }
    };

    const handleOrderStatusChange = (orderId: string, status: Order['status']) => {
        setAppState(prev => ({
            ...prev,
            orders: prev.orders.map(o => o.id === orderId ? { ...o, status } : o)
        }));
    };
    
    const tabs: { id: SalesTab, label: string }[] = [
        { id: 'orders', label: 'Pedidos' },
        { id: 'quotes', label: 'Orçamentos' },
        { id: 'b2b', label: 'Vendas B2B' },
        { id: 'abandonedCarts', label: 'Carrinhos Abandonados' },
        { id: 'directSales', label: 'Venda Direta (PDV)' },
    ];

    const renderTabContent = () => {
        switch(activeTab) {
            case 'orders': return <OrdersView orders={appState.orders} onStatusChange={handleOrderStatusChange} onViewDetails={(order) => { setSelectedOrder(order); setOrderModalOpen(true); }} />;
            case 'quotes': return <QuotesView quotes={appState.quotes} onNew={() => { setEditingQuote(null); setQuoteModalOpen(true); }} onEdit={(q) => { setEditingQuote(q); setQuoteModalOpen(true); }} onDelete={handleDeleteQuote} />;
            case 'abandonedCarts': return <AbandonedCartsView carts={appState.abandonedCarts} showToast={showToast} />;
            case 'b2b':
            case 'directSales':
            default: return <div className="p-8 bg-white rounded-lg shadow-md text-center">Conteúdo para a aba "{tabs.find(t => t.id === activeTab)?.label}" em desenvolvimento.</div>;
        }
    };
    
    return (
        <div className="space-y-6">
            {toastMessage && <Toast message={toastMessage} onClear={handleClearToast} />}
            {isOrderModalOpen && selectedOrder && <OrderDetailsModal order={selectedOrder} onClose={() => setOrderModalOpen(false)} />}
            {isQuoteModalOpen && <QuoteFormModal quote={editingQuote} onClose={() => setQuoteModalOpen(false)} onSave={handleSaveQuote} users={appState.users} products={allProducts} />}

            <h2 className="text-3xl font-bold text-gray-800">Gerenciamento de Vendas</h2>
            <div className="bg-white rounded-lg shadow-sm p-2">
                <nav className="flex space-x-2 overflow-x-auto">
                    {tabs.map(tab => (
                        <button 
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-shrink-0 px-4 py-2 rounded-md text-sm font-medium ${activeTab === tab.id ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>
            <div>{renderTabContent()}</div>
        </div>
    );
};

export default SalesManagement;


import React, { useState, useMemo } from 'react';
import { Subscription, User, ProductSectionData, Product, SubscriptionProduct } from '../types';
import { ChevronLeftIcon, ChevronRightIcon } from './Icons';
import { v4 as uuidv4 } from 'uuid';

interface SubscriptionManagementProps {
  subscriptions: Subscription[];
  setSubscriptions: React.Dispatch<React.SetStateAction<Subscription[]>>;
  users: User[];
  productSections: ProductSectionData[];
}

const SubscriptionFormModal: React.FC<{
    subscription: Subscription | null;
    onClose: () => void;
    onSave: (subscription: Subscription) => void;
    users: User[];
    products: Product[];
}> = ({ subscription, onClose, onSave, users, products }) => {
    const isNew = subscription === null;
    const [formData, setFormData] = useState<Subscription>(subscription || {
        id: uuidv4(),
        userId: 0,
        customerName: '',
        products: [{ productId: 0, quantity: 1 }],
        frequency: 'Mensal',
        status: 'Ativa',
        nextDeliveryDate: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString().split('T')[0],
    });

    const handleUserChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const userId = Number(e.target.value);
        const user = users.find(u => u.id === userId);
        setFormData(prev => ({
            ...prev,
            userId: userId,
            customerName: user ? user.name : '',
        }));
    };
    
    const handleProductChange = (index: number, field: 'productId' | 'quantity', value: string) => {
        const newProducts = [...formData.products];
        newProducts[index] = { ...newProducts[index], [field]: Number(value) };
        setFormData(prev => ({ ...prev, products: newProducts }));
    };

    const handleAddProduct = () => {
        setFormData(prev => ({ ...prev, products: [...prev.products, { productId: 0, quantity: 1 }] }));
    };

    const handleRemoveProduct = (indexToRemove: number) => {
        setFormData(prev => ({ ...prev, products: formData.products.filter((_, index) => index !== indexToRemove) }));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.userId) {
            alert('Por favor, selecione um cliente.');
            return;
        }
        if (formData.products.some(p => p.productId === 0 || p.quantity <= 0)) {
             alert('Por favor, selecione produtos válidos e defina uma quantidade maior que zero.');
            return;
        }
        onSave(formData);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold mb-6">{isNew ? 'Adicionar Assinatura' : 'Editar Assinatura'}</h2>
                <form onSubmit={handleSave} className="space-y-4">
                    <div>
                        <label htmlFor="userId" className="block text-sm font-medium text-gray-700">Cliente</label>
                        <select id="userId" value={formData.userId} onChange={handleUserChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" required>
                            <option value="">Selecione um cliente</option>
                            {users.map(user => <option key={user.id} value={user.id}>{user.name}</option>)}
                        </select>
                    </div>

                    <div className="border-t pt-4">
                        <h3 className="text-lg font-semibold mb-3 text-gray-800">Produtos da Assinatura</h3>
                        <div className="space-y-2">
                            {formData.products.map((p, index) => (
                                <div key={index} className="grid grid-cols-12 gap-2 items-center">
                                    <select value={p.productId} onChange={e => handleProductChange(index, 'productId', e.target.value)} className="col-span-8 mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3">
                                        <option value="">Selecione um produto</option>
                                        {products.map(prod => <option key={prod.id} value={prod.id}>{prod.name}</option>)}
                                    </select>
                                    <input type="number" min="1" value={p.quantity} onChange={e => handleProductChange(index, 'quantity', e.target.value)} className="col-span-3 mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />
                                    <button type="button" onClick={() => handleRemoveProduct(index)} className="col-span-1 text-red-500 hover:text-red-700 p-1"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                                </div>
                            ))}
                        </div>
                        <button type="button" onClick={handleAddProduct} className="mt-3 text-sm text-blue-600 hover:text-blue-800 font-semibold">+ Adicionar Produto</button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
                            <label htmlFor="frequency" className="block text-sm font-medium text-gray-700">Frequência</label>
                            <select name="frequency" id="frequency" value={formData.frequency} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3">
                                <option>Semanal</option>
                                <option>Quinzenal</option>
                                <option>Mensal</option>
                            </select>
                        </div>
                         <div>
                            <label htmlFor="nextDeliveryDate" className="block text-sm font-medium text-gray-700">Próxima Entrega</label>
                            <input type="date" name="nextDeliveryDate" id="nextDeliveryDate" value={formData.nextDeliveryDate} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />
                        </div>
                    </div>
                     <div>
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
                        <select name="status" id="status" value={formData.status} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3">
                            <option>Ativa</option>
                            <option>Pausada</option>
                            <option>Cancelada</option>
                        </select>
                    </div>
                    <div className="flex justify-end space-x-4 pt-4">
                        <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300">Cancelar</button>
                        <button type="submit" className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700">Salvar Assinatura</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const SubscriptionManagement: React.FC<SubscriptionManagementProps> = ({ subscriptions, setSubscriptions, users, productSections }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;
    
    const allProducts = useMemo(() => productSections.flatMap(s => s.products), [productSections]);

    const totalPages = Math.ceil(subscriptions.length / ITEMS_PER_PAGE);
    const paginatedSubscriptions = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return subscriptions.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [subscriptions, currentPage]);
    
    const statusClasses: { [key: string]: string } = {
        'Ativa': 'bg-green-100 text-green-800',
        'Pausada': 'bg-yellow-100 text-yellow-800',
        'Cancelada': 'bg-red-100 text-red-800'
    };

    const handleAdd = () => {
        setEditingSubscription(null);
        setIsModalOpen(true);
    };

    const handleEdit = (sub: Subscription) => {
        setEditingSubscription(sub);
        setIsModalOpen(true);
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Tem certeza que deseja excluir esta assinatura?')) {
            setSubscriptions(prev => prev.filter(s => s.id !== id));
        }
    };
    
    const handleSave = (sub: Subscription) => {
        setSubscriptions(prev => {
            const exists = prev.some(s => s.id === sub.id);
            if (exists) {
                return prev.map(s => s.id === sub.id ? sub : s);
            }
            return [sub, ...prev];
        });
    };

    return (
        <div>
            {isModalOpen && <SubscriptionFormModal subscription={editingSubscription} onClose={() => setIsModalOpen(false)} onSave={handleSave} users={users} products={allProducts} />}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800">Gestão de Assinaturas</h2>
                <button onClick={handleAdd} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 shadow-sm">
                    Adicionar Assinatura
                </button>
            </div>
            
            <div className="bg-white rounded-lg shadow-md overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-600">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                        <tr>
                            <th scope="col" className="px-6 py-3">Cliente</th>
                            <th scope="col" className="px-6 py-3">Status</th>
                            <th scope="col" className="px-6 py-3">Frequência</th>
                            <th scope="col" className="px-6 py-3">Próxima Entrega</th>
                            <th scope="col" className="px-6 py-3 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedSubscriptions.map(sub => (
                            <tr key={sub.id} className="bg-white border-b hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium text-gray-900">{sub.customerName}</td>
                                <td className="px-6 py-4"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClasses[sub.status]}`}>{sub.status}</span></td>
                                <td className="px-6 py-4">{sub.frequency}</td>
                                <td className="px-6 py-4">{new Date(sub.nextDeliveryDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</td>
                                <td className="px-6 py-4 text-right whitespace-nowrap">
                                    <button onClick={() => handleEdit(sub)} className="font-medium text-blue-600 hover:underline">Editar</button>
                                    <button onClick={() => handleDelete(sub.id)} className="font-medium text-red-600 hover:underline ml-4">Excluir</button>
                                </td>
                            </tr>
                        ))}
                         {subscriptions.length === 0 && (
                            <tr><td colSpan={5} className="text-center py-8 text-gray-500">Nenhuma assinatura encontrada.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
            <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
                <span>Mostrando {paginatedSubscriptions.length > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0} a {Math.min(currentPage * ITEMS_PER_PAGE, subscriptions.length)} de {subscriptions.length} resultados</span>
                {totalPages > 1 && (
                    <div className="flex items-center space-x-1">
                        <button onClick={() => setCurrentPage(p => p - 1)} className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50" disabled={currentPage === 1}><ChevronLeftIcon className="h-5 w-5"/></button>
                        <span className="px-4 py-2 rounded-md bg-blue-100 text-blue-600 font-bold">{currentPage}</span>
                        <button onClick={() => setCurrentPage(p => p + 1)} className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50" disabled={currentPage === totalPages}><ChevronRightIcon className="h-5 w-5"/></button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SubscriptionManagement;
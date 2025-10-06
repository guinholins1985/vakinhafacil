
import React, { useState, useMemo } from 'react';
import { AppState, Supplier, PurchaseOrder, OrderItem, Product, StockOptimization, SupplierIntegration } from '../types.ts';
import { TruckIcon, ClipboardDocumentCheckIcon, StarIcon, PresentationChartLineIcon, PlusIcon, TrashIcon, ArchiveBoxIcon, Cog6ToothIcon, SparklesIcon } from './Icons.tsx';
import { v4 as uuidv4 } from 'uuid';

interface SupplyChainManagementProps {
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
}

const PurchaseOrderModal: React.FC<{
    order: PurchaseOrder | null;
    onClose: () => void;
    onSave: (order: PurchaseOrder) => void;
    suppliers: Supplier[];
    products: Product[];
}> = ({ order, onClose, onSave, suppliers, products }) => {
    const isNew = order === null;
    const [formData, setFormData] = useState<PurchaseOrder>(order || {
        id: `PO-${Date.now().toString().slice(-6)}`, supplierId: '', supplierName: '', date: new Date().toISOString().split('T')[0], total: 0, status: 'Rascunho', items: []
    });

    const handleItemChange = (index: number, field: 'productId' | 'quantity', value: any) => {
        const newItems = [...formData.items];
        const product = products.find(p => p.id === Number(value));
        if (field === 'productId') {
            newItems[index] = { ...newItems[index], productId: Number(value), productName: product?.name || '', price: product?.price || 0 };
        } else {
            newItems[index] = { ...newItems[index], quantity: Number(value) };
        }
        updateTotal(newItems);
    };

    const addItem = () => updateItems([...formData.items, { productId: 0, productName: '', quantity: 1, price: 0 }]);
    const removeItem = (index: number) => updateItems(formData.items.filter((_, i) => i !== index));

    const updateItems = (items: OrderItem[]) => {
        const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        setFormData(prev => ({ ...prev, items, total }));
    };
    const updateTotal = (items: OrderItem[]) => {
        const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        setFormData(prev => ({...prev, items, total }));
    };

    const handleSupplierChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const supplier = suppliers.find(s => s.id === e.target.value);
        setFormData(p => ({...p, supplierId: supplier?.id || '', supplierName: supplier?.name || ''}));
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl max-h-[90vh] flex flex-col">
                <h2 className="text-xl font-bold mb-4">{isNew ? 'Nova Ordem de Compra' : `Editar OC ${formData.id}`}</h2>
                <div className="flex-grow overflow-y-auto pr-2">
                    <select onChange={handleSupplierChange} value={formData.supplierId} className="w-full p-2 border rounded-md mb-4 bg-white" required>
                        <option value="">Selecione o Fornecedor</option>
                        {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
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
                    <button onClick={addItem} className="text-blue-600 font-semibold text-sm flex items-center gap-1 mt-2"><PlusIcon className="h-4 w-4"/>Adicionar Item</button>
                </div>
                <div className="border-t pt-4 mt-4">
                    <div className="flex justify-between items-center mb-4">
                        <span className="font-bold text-lg">Total:</span>
                        <span className="font-bold text-xl">R$ {formData.total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-end gap-2">
                        <button onClick={onClose} className="bg-gray-200 py-2 px-4 rounded-lg">Cancelar</button>
                        <button onClick={() => { onSave(formData); onClose(); }} className="bg-blue-600 text-white py-2 px-4 rounded-lg">Salvar Ordem</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const SupplierModal: React.FC<{
    supplier: Supplier | null;
    onClose: () => void;
    onSave: (supplier: Supplier) => void;
}> = ({ supplier, onClose, onSave }) => {
    const isNew = supplier === null;
    const [formData, setFormData] = useState<Supplier>(supplier || {
        id: uuidv4(), name: '', esgScore: 0, onTimeDeliveryRate: 0, qualityScore: 0, status: 'Ativo'
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const numValue = ['esgScore', 'onTimeDeliveryRate', 'qualityScore'].includes(name) ? parseFloat(value) : value;
        setFormData(p => ({...p, [name]: numValue }));
    };
    
    return (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
                 <h2 className="text-xl font-bold mb-4">{isNew ? 'Novo Fornecedor' : 'Editar Fornecedor'}</h2>
                 <form onSubmit={(e) => { e.preventDefault(); onSave(formData); onClose(); }} className="space-y-4">
                    <div><label>Nome</label><input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full p-2 border rounded-md" required/></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label>Score ESG (/10)</label><input type="number" name="esgScore" value={formData.esgScore} onChange={handleChange} step="0.1" min="0" max="10" className="w-full p-2 border rounded-md"/></div>
                        <div><label>Entrega no Prazo (%)</label><input type="number" name="onTimeDeliveryRate" value={formData.onTimeDeliveryRate} onChange={handleChange} step="0.01" min="0" max="1" className="w-full p-2 border rounded-md"/></div>
                        <div><label>Score de Qualidade (/5)</label><input type="number" name="qualityScore" value={formData.qualityScore} onChange={handleChange} step="0.1" min="0" max="5" className="w-full p-2 border rounded-md"/></div>
                        <div><label>Status</label><select name="status" value={formData.status} onChange={handleChange} className="w-full p-2 border rounded-md bg-white"><option>Ativo</option><option>Inativo</option></select></div>
                    </div>
                    <div className="flex justify-end gap-2 pt-4"><button type="button" onClick={onClose} className="bg-gray-200 py-2 px-4 rounded-lg">Cancelar</button><button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded-lg">Salvar</button></div>
                 </form>
            </div>
        </div>
    );
};

const SupplyChainManagement: React.FC<SupplyChainManagementProps> = ({ appState, setAppState }) => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isPOModalOpen, setIsPOModalOpen] = useState(false);
    const [editingPO, setEditingPO] = useState<PurchaseOrder | null>(null);
    const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
    const [isOptimizing, setIsOptimizing] = useState(false);

    const allProducts = useMemo(() => appState.productSections.flatMap(s => s.products), [appState.productSections]);

    const handleSavePO = (order: PurchaseOrder) => {
        setAppState(prev => {
            const exists = prev.purchaseOrders.some(po => po.id === order.id);
            const newPOs = exists ? prev.purchaseOrders.map(po => po.id === order.id ? order : po) : [order, ...prev.purchaseOrders];
            return {...prev, purchaseOrders: newPOs};
        });
    };
    
    const handleDeletePO = (id: string) => {
        if(window.confirm('Tem certeza que deseja excluir esta Ordem de Compra?')){
            setAppState(p => ({...p, purchaseOrders: p.purchaseOrders.filter(po => po.id !== id)}));
        }
    };
    
    const handleSaveSupplier = (supplier: Supplier) => {
        setAppState(prev => {
            const exists = prev.suppliers.some(s => s.id === supplier.id);
            const newSuppliers = exists ? prev.suppliers.map(s => s.id === supplier.id ? supplier : s) : [supplier, ...prev.suppliers];
            return {...prev, suppliers: newSuppliers};
        });
    };

    const handleDeleteSupplier = (id: string) => {
        if(window.confirm('Tem certeza? Isso pode afetar ordens de compra existentes.')){
            setAppState(p => ({...p, suppliers: p.suppliers.filter(s => s.id !== id)}));
        }
    };

    const handleOptimizeStock = () => {
        setIsOptimizing(true);
        setTimeout(() => {
            setAppState(prev => {
                const newOptimizations = prev.stockOptimizations.map(opt => {
                    const randomAction = ['Repor', 'Transferir', 'OK'][Math.floor(Math.random() * 3)];
                    return { ...opt, actionNeeded: randomAction as any };
                });
                return { ...prev, stockOptimizations: newOptimizations };
            });
            setIsOptimizing(false);
            alert('Otimização de estoque concluída!');
        }, 2500);
    };
    
    const tabs = [
        { id: 'dashboard', label: 'Dashboard', icon: PresentationChartLineIcon },
        { id: 'suppliers', label: 'Fornecedores', icon: TruckIcon },
        { id: 'purchase_orders', label: 'Ordens de Compra', icon: ClipboardDocumentCheckIcon },
        { id: 'forecast', label: 'Previsão de Demanda', icon: StarIcon },
        { id: 'inventory', label: 'Otimização de Estoque', icon: ArchiveBoxIcon },
        { id: 'integrations', label: 'Integrações', icon: Cog6ToothIcon },
    ];
    
    const renderTabContent = () => {
        switch(activeTab) {
            case 'dashboard': return <DashboardView suppliers={appState.suppliers} />;
            case 'suppliers': return <SuppliersView suppliers={appState.suppliers} onEdit={(s) => { setEditingSupplier(s); setIsSupplierModalOpen(true); }} onNew={() => { setEditingSupplier(null); setIsSupplierModalOpen(true); }} onDelete={handleDeleteSupplier} />;
            case 'purchase_orders': return <PurchaseOrdersView orders={appState.purchaseOrders} onNew={() => { setEditingPO(null); setIsPOModalOpen(true); }} onEdit={(o) => {setEditingPO(o); setIsPOModalOpen(true)}} onDelete={handleDeletePO} />;
            case 'forecast': return <DemandForecastView forecasts={appState.demandForecasts} />;
            case 'inventory': return <InventoryOptimizationView optimizations={appState.stockOptimizations} onOptimize={handleOptimizeStock} isOptimizing={isOptimizing} />;
            case 'integrations': return <IntegrationsView integrations={appState.supplierIntegrations} />;
            default: return null;
        }
    }

    return (
        <div className="space-y-6">
            {isPOModalOpen && <PurchaseOrderModal order={editingPO} onClose={() => setIsPOModalOpen(false)} onSave={handleSavePO} suppliers={appState.suppliers} products={allProducts} />}
            {isSupplierModalOpen && <SupplierModal supplier={editingSupplier} onClose={() => setIsSupplierModalOpen(false)} onSave={handleSaveSupplier} />}
            <h2 className="text-3xl font-bold text-gray-800">Gestão de Cadeia de Suprimentos</h2>
             <div className="bg-white rounded-lg shadow-sm p-2"><nav className="flex space-x-2">{tabs.map(tab => (<button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center px-4 py-2 rounded-md text-sm font-medium ${activeTab === tab.id ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}`}><tab.icon className="h-5 w-5 mr-2"/>{tab.label}</button>))}</nav></div>
            <div>{renderTabContent()}</div>
        </div>
    );
};

const DashboardView: React.FC<{ suppliers: Supplier[] }> = ({ suppliers }) => {
    const kpis = useMemo(() => {
        const activeSuppliers = suppliers.filter(s => s.status === 'Ativo');
        if (activeSuppliers.length === 0) return { avgOntime: 0, avgQuality: 0, inventoryTurnover: 0, orderAccuracy: 0};
        return {
            avgOntime: activeSuppliers.reduce((sum, s) => sum + s.onTimeDeliveryRate, 0) / activeSuppliers.length * 100,
            avgQuality: activeSuppliers.reduce((sum, s) => sum + s.qualityScore, 0) / activeSuppliers.length,
            inventoryTurnover: 4.2, // Mock data
            orderAccuracy: 98.7, // Mock data
        }
    }, [suppliers]);
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow"><p className="text-sm">Entrega no Prazo (Média)</p><p className="text-2xl font-bold">{kpis.avgOntime.toFixed(1)}%</p></div>
            <div className="bg-white p-4 rounded-lg shadow"><p className="text-sm">Giro de Estoque</p><p className="text-2xl font-bold">{kpis.inventoryTurnover}</p></div>
            <div className="bg-white p-4 rounded-lg shadow"><p className="text-sm">Precisão dos Pedidos</p><p className="text-2xl font-bold">{kpis.orderAccuracy}%</p></div>
            <div className="bg-white p-4 rounded-lg shadow"><p className="text-sm">Qualidade (Média)</p><p className="text-2xl font-bold">{kpis.avgQuality.toFixed(1)}/5.0</p></div>
        </div>
    );
};

const SuppliersView: React.FC<{ suppliers: Supplier[], onNew: () => void, onEdit: (s: Supplier) => void, onDelete: (id: string) => void }> = ({ suppliers, onNew, onEdit, onDelete }) => (
    <div className="bg-white p-6 rounded-lg shadow-md">
         <div className="flex justify-between items-center mb-4"><h3 className="text-xl font-bold">Gestão de Fornecedores</h3><button onClick={onNew} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg">Novo Fornecedor</button></div>
        <table className="w-full text-sm">
            <thead className="bg-gray-50"><tr><th className="p-2 text-left">Fornecedor</th><th className="p-2 text-left">Entrega no Prazo</th><th className="p-2 text-left">Qualidade</th><th className="p-2 text-left">Score ESG</th><th className="p-2 text-left">Status</th><th className="p-2 text-right">Ações</th></tr></thead>
            <tbody>{suppliers.map(s => (<tr key={s.id} className="border-t"><td className="p-2 font-semibold">{s.name}</td><td className="p-2">{(s.onTimeDeliveryRate * 100).toFixed(1)}%</td><td className="p-2">{s.qualityScore.toFixed(1)}/5.0</td><td className="p-2">{s.esgScore.toFixed(1)}/10</td><td className="p-2">{s.status}</td><td className="p-2 text-right space-x-2"><button onClick={() => onEdit(s)} className="text-blue-600 font-semibold">Editar</button><button onClick={() => onDelete(s.id)} className="text-red-600 font-semibold">Excluir</button></td></tr>))}</tbody>
        </table>
    </div>
);

const PurchaseOrdersView: React.FC<{ orders: PurchaseOrder[], onNew: () => void, onEdit: (o: PurchaseOrder) => void, onDelete: (id: string) => void }> = ({ orders, onNew, onEdit, onDelete }) => (
    <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4"><h3 className="text-xl font-bold">Ordens de Compra</h3><button onClick={onNew} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg">Nova Ordem</button></div>
        <table className="w-full text-sm">
             <thead className="bg-gray-50"><tr><th className="p-2 text-left">OC</th><th className="p-2 text-left">Fornecedor</th><th className="p-2 text-left">Data</th><th className="p-2 text-left">Total</th><th className="p-2 text-left">Status</th><th className="p-2 text-right">Ações</th></tr></thead>
             <tbody>{orders.map(o => (<tr key={o.id} className="border-t"><td className="p-2 font-mono">{o.id}</td><td className="p-2">{o.supplierName}</td><td className="p-2">{o.date}</td><td className="p-2">R$ {o.total.toFixed(2)}</td><td className="p-2">{o.status}</td><td className="p-2 text-right space-x-2"><button onClick={() => onEdit(o)} className="text-blue-600 font-semibold">Editar</button><button onClick={() => onDelete(o.id)} className="text-red-600 font-semibold">Excluir</button></td></tr>))}</tbody>
        </table>
    </div>
);

const DemandForecastView: React.FC<{ forecasts: any[] }> = ({ forecasts }) => (
    <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-bold mb-4">Previsão de Demanda com IA (Próximos 30 dias)</h3>
        <table className="w-full text-sm">
            <thead className="bg-gray-50"><tr><th className="p-2 text-left">Produto</th><th className="p-2 text-left">Demanda Prevista</th><th className="p-2 text-left">Estoque Atual</th><th className="p-2 text-left">Alerta</th></tr></thead>
            <tbody>{forecasts.map(f => {const needsAttention = f.currentStock < f.predictedDemand; return (<tr key={f.productId} className="border-t"><td className="p-2">{f.productName}</td><td className="p-2">{f.predictedDemand} un.</td><td className={`p-2 font-semibold ${needsAttention ? 'text-red-600' : ''}`}>{f.currentStock} un.</td><td className="p-2">{needsAttention && <span className="text-xs font-bold text-white bg-red-500 px-2 py-1 rounded-full">Risco de Ruptura</span>}</td></tr>)})}</tbody>
        </table>
    </div>
);

const InventoryOptimizationView: React.FC<{ optimizations: StockOptimization[], onOptimize: () => void, isOptimizing: boolean }> = ({ optimizations, onOptimize, isOptimizing }) => (
    <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Otimização de Estoque (IA)</h3>
            <button onClick={onOptimize} disabled={isOptimizing} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 disabled:bg-blue-300">
                <SparklesIcon className={`h-5 w-5 ${isOptimizing ? 'animate-spin' : ''}`} />
                {isOptimizing ? 'Otimizando...' : 'Otimizar Estoque com IA'}
            </button>
        </div>
        <table className="w-full text-sm">
            <thead className="bg-gray-50"><tr><th className="p-2 text-left">Produto</th><th className="p-2 text-left">Armazém</th><th className="p-2 text-left">Nível Atual</th><th className="p-2 text-left">Nível Ótimo</th><th className="p-2 text-left">Ação Sugerida</th></tr></thead>
            <tbody>{optimizations.map(opt => (<tr key={`${opt.productId}-${opt.warehouseId}`} className="border-t"><td className="p-2">{opt.productName}</td><td className="p-2">{opt.warehouseId}</td><td className="p-2">{opt.currentLevel}</td><td className="p-2">{opt.optimalLevel}</td><td className={`p-2 font-bold ${opt.actionNeeded !== 'OK' ? 'text-yellow-600' : 'text-green-600'}`}>{opt.actionNeeded}</td></tr>))}</tbody>
        </table>
    </div>
);

const IntegrationsView: React.FC<{ integrations: SupplierIntegration[] }> = ({ integrations }) => (
    <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-bold mb-4">Integração de Fornecedores</h3>
        <table className="w-full text-sm">
            <thead className="bg-gray-50"><tr><th className="p-2 text-left">Fornecedor</th><th className="p-2 text-left">Status da Integração</th><th className="p-2 text-right">Ações</th></tr></thead>
            <tbody>{integrations.map(i => (<tr key={i.supplierId} className="border-t"><td className="p-2 font-semibold">{i.supplierName}</td><td className="p-2">{i.status}</td><td className="p-2 text-right"><button className="text-blue-600 font-semibold">Gerenciar</button></td></tr>))}</tbody>
        </table>
    </div>
);


export default SupplyChainManagement;
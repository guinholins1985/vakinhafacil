import React, { useState, useMemo } from 'react';
import { Seller, Dispute, SellerPayout, CommissionRule } from '../types.ts';
import { v4 as uuidv4 } from 'uuid';
import { PresentationChartLineIcon, UsersIcon, ReceiptPercentIcon, BanknotesIcon, PencilIcon, PlusIcon, TrashIcon, CheckCircleIcon } from './Icons.tsx';

interface MarketplaceProps {
  sellers: Seller[];
  disputes: Dispute[];
  sellerPayouts: SellerPayout[];
  commissionRules: CommissionRule[];
  setSellers: React.Dispatch<React.SetStateAction<Seller[]>>;
  setDisputes: React.Dispatch<React.SetStateAction<Dispute[]>>;
  setSellerPayouts: React.Dispatch<React.SetStateAction<SellerPayout[]>>;
  setCommissionRules: React.Dispatch<React.SetStateAction<CommissionRule[]>>;
}

const SellerModal: React.FC<{ seller: Seller | null; onSave: (seller: Seller) => void; onClose: () => void; }> = ({ seller, onSave, onClose }) => {
    const [formData, setFormData] = useState<Seller>(seller || { id: uuidv4(), name: '', contactEmail: '', joinDate: new Date().toISOString().split('T')[0], gvm: 0, rating: 0, status: 'Pendente' });
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));
    return (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h3 className="text-lg font-bold mb-4">{seller ? 'Editar Vendedor' : 'Novo Vendedor'}</h3>
                <form onSubmit={e => { e.preventDefault(); onSave(formData); }} className="space-y-4">
                    <input name="name" value={formData.name} onChange={handleChange} placeholder="Nome do Vendedor" className="w-full p-2 border rounded" required/>
                    <input type="email" name="contactEmail" value={formData.contactEmail} onChange={handleChange} placeholder="Email de Contato" className="w-full p-2 border rounded" required/>
                    <select name="status" value={formData.status} onChange={handleChange} className="w-full p-2 border rounded bg-white"><option>Ativo</option><option>Pendente</option><option>Rejeitado</option></select>
                    <div className="flex justify-end gap-2"><button type="button" onClick={onClose} className="bg-gray-200 py-2 px-4 rounded-lg">Cancelar</button><button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded-lg">Salvar</button></div>
                </form>
            </div>
        </div>
    );
};

const DisputeModal: React.FC<{ dispute: Dispute; onSave: (dispute: Dispute) => void; onClose: () => void; }> = ({ dispute, onSave, onClose }) => {
    const [resolution, setResolution] = useState('');
    const handleResolve = () => {
        onSave({ ...dispute, status: 'Resolvido', resolution, resolvedAt: new Date().toISOString() });
        onClose();
    };
    return (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg">
                <h3 className="text-lg font-bold mb-4">Resolver Disputa (Pedido: {dispute.orderId})</h3>
                <p className="text-sm mb-2"><strong>Motivo:</strong> {dispute.reason}</p>
                <textarea value={resolution} onChange={e => setResolution(e.target.value)} placeholder="Adicione notas sobre a resolução..." className="w-full p-2 border rounded h-24 mb-4" />
                <div className="flex justify-end gap-2"><button type="button" onClick={onClose} className="bg-gray-200 py-2 px-4 rounded-lg">Cancelar</button><button onClick={handleResolve} className="bg-blue-600 text-white py-2 px-4 rounded-lg">Marcar como Resolvido</button></div>
            </div>
        </div>
    );
};


const Marketplace: React.FC<MarketplaceProps> = ({ sellers, disputes, sellerPayouts, commissionRules, setSellers, setDisputes, setSellerPayouts, setCommissionRules }) => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [editingSeller, setEditingSeller] = useState<Seller | null>(null);
    const [resolvingDispute, setResolvingDispute] = useState<Dispute | null>(null);

    const kpis = useMemo(() => ({
        totalSellers: sellers.length,
        activeSellers: sellers.filter(s => s.status === 'Ativo').length,
        totalGVM: sellers.reduce((sum, s) => sum + s.gvm, 0),
        pendingPayouts: sellerPayouts.filter(p => p.status === 'Pendente').reduce((sum, p) => sum + p.amount, 0),
    }), [sellers, sellerPayouts]);

    const tabs = [
        { id: 'dashboard', label: 'Dashboard', icon: PresentationChartLineIcon },
        { id: 'sellers', label: 'Vendedores', icon: UsersIcon },
        { id: 'payouts', label: 'Repasses', icon: BanknotesIcon },
        { id: 'commissions', label: 'Comissões', icon: ReceiptPercentIcon },
        { id: 'disputes', label: 'Disputas', icon: UsersIcon },
    ];

    const handleSaveSeller = (seller: Seller) => {
        setSellers(prev => prev.find(s => s.id === seller.id) ? prev.map(s => s.id === seller.id ? seller : s) : [seller, ...prev]);
        setEditingSeller(null);
    };

    const handleSaveDispute = (dispute: Dispute) => {
        setDisputes(prev => prev.map(d => d.id === dispute.id ? dispute : d));
        setResolvingDispute(null);
    };
    
    const renderTabContent = () => {
        switch(activeTab) {
            case 'dashboard': return <DashboardView kpis={kpis} sellers={sellers} />;
            case 'sellers': return <SellersView sellers={sellers} setSellers={setSellers} onEdit={setEditingSeller} />;
            case 'payouts': return <PayoutsView payouts={sellerPayouts} setPayouts={setSellerPayouts} sellers={sellers} />;
            case 'commissions': return <CommissionsView rules={commissionRules} setRules={setCommissionRules} />;
            case 'disputes': return <DisputesView disputes={disputes} onResolve={setResolvingDispute} />;
            default: return null;
        }
    };

    return (
        <div className="space-y-6">
            {editingSeller !== undefined && <SellerModal seller={editingSeller} onSave={handleSaveSeller} onClose={() => setEditingSeller(undefined)} />}
            {resolvingDispute && <DisputeModal dispute={resolvingDispute} onSave={handleSaveDispute} onClose={() => setResolvingDispute(null)} />}

            <h2 className="text-3xl font-bold text-gray-800">Gerenciamento de Marketplace</h2>
            <div className="bg-white rounded-lg shadow-sm p-2"><nav className="flex space-x-2">{tabs.map(tab => (<button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center px-4 py-2 rounded-md text-sm font-medium ${activeTab === tab.id ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}`}><tab.icon className="h-5 w-5 mr-2"/>{tab.label}</button>))}</nav></div>
            <div>{renderTabContent()}</div>
        </div>
    );
};

const DashboardView: React.FC<{ kpis: any, sellers: Seller[] }> = ({ kpis, sellers }) => {
    const topSellers = [...sellers].sort((a,b) => b.gvm - a.gvm).slice(0, 5);
    const maxGVM = Math.max(...topSellers.map(s => s.gvm), 1);
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg shadow"><p className="text-sm text-gray-500">Total de Vendedores</p><p className="text-2xl font-bold">{kpis.totalSellers}</p></div>
                <div className="bg-white p-4 rounded-lg shadow"><p className="text-sm text-gray-500">Vendedores Ativos</p><p className="text-2xl font-bold">{kpis.activeSellers}</p></div>
                <div className="bg-white p-4 rounded-lg shadow"><p className="text-sm text-gray-500">GVM (Mês)</p><p className="text-2xl font-bold">R$ {kpis.totalGVM.toLocaleString()}</p></div>
                <div className="bg-white p-4 rounded-lg shadow"><p className="text-sm text-gray-500">Repasses Pendentes</p><p className="text-2xl font-bold">R$ {kpis.pendingPayouts.toLocaleString()}</p></div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-bold mb-4">Top 5 Vendedores por GVM</h3>
                <div className="space-y-3">{topSellers.map(s => <div key={s.id}><p className="text-sm font-semibold">{s.name}</p><div className="w-full bg-gray-200 h-4 rounded"><div className="bg-blue-500 h-4 rounded" style={{width: `${(s.gvm / maxGVM) * 100}%`}}></div></div></div>)}</div>
            </div>
        </div>
    );
};

const SellersView: React.FC<{ sellers: Seller[], setSellers: React.Dispatch<React.SetStateAction<Seller[]>>, onEdit: (s: Seller | null) => void }> = ({ sellers, setSellers, onEdit }) => {
    const handleStatusChange = (id: string, status: Seller['status']) => setSellers(prev => prev.map(s => s.id === id ? { ...s, status } : s));
    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4"><h3 className="text-xl font-bold">Vendedores Cadastrados</h3><button onClick={() => onEdit(null)} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2"><PlusIcon className="h-5 w-5"/>Novo Vendedor</button></div>
            <table className="w-full text-sm">
                <thead className="bg-gray-50"><tr><th className="p-2 text-left">Nome</th><th className="p-2 text-left">GVM (Mês)</th><th className="p-2 text-left">Status</th><th className="p-2 text-right">Ações</th></tr></thead>
                <tbody>{sellers.map(s => (<tr key={s.id} className="border-t"><td className="p-2"><div className="font-semibold">{s.name}</div><div className="text-xs text-gray-500">{s.contactEmail}</div></td><td className="p-2">R$ {s.gvm.toLocaleString()}</td><td className="p-2">{s.status}</td><td className="p-2 text-right space-x-2"><button onClick={() => onEdit(s)} className="text-blue-600"><PencilIcon className="h-5 w-5"/></button>{s.status === 'Pendente' && (<><button onClick={() => handleStatusChange(s.id, 'Ativo')} className="font-medium text-green-600">Aprovar</button><button onClick={() => handleStatusChange(s.id, 'Rejeitado')} className="font-medium text-red-600">Rejeitar</button></>)}</td></tr>))}</tbody>
            </table>
        </div>
    );
};

const PayoutsView: React.FC<{ payouts: SellerPayout[], sellers: Seller[], setPayouts: React.Dispatch<React.SetStateAction<SellerPayout[]>> }> = ({ payouts, sellers, setPayouts }) => {
    const handleStatusChange = (id: string, status: SellerPayout['status']) => setPayouts(prev => prev.map(p => p.id === id ? { ...p, status } : p));
    const handleGeneratePayouts = () => {
        if (!window.confirm("Isso irá gerar novos repasses pendentes para todos vendedores ativos. Deseja continuar?")) return;
        const newPayouts = sellers.filter(s => s.status === 'Ativo').map(s => ({ id: `PAY-${uuidv4().slice(0,4)}`, sellerId: s.id, sellerName: s.name, period: 'Nov/2023', amount: s.gvm * 0.88, status: 'Pendente' as 'Pendente' }));
        setPayouts(prev => [...newPayouts, ...prev]);
        alert(`${newPayouts.length} novos repasses gerados.`);
    };
    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4"><h3 className="text-xl font-bold">Repasses para Vendedores</h3><button onClick={handleGeneratePayouts} className="bg-green-600 text-white font-bold py-2 px-4 rounded-lg">Gerar Repasses do Período</button></div>
            <table className="w-full text-sm">
                <thead className="bg-gray-50"><tr><th className="p-2 text-left">ID</th><th className="p-2 text-left">Vendedor</th><th className="p-2 text-left">Valor</th><th className="p-2 text-left">Status</th><th className="p-2 text-right">Ações</th></tr></thead>
                <tbody>{payouts.map(p => (<tr key={p.id} className="border-t"><td className="p-2 font-mono">{p.id}</td><td className="p-2">{p.sellerName}</td><td className="p-2">R$ {p.amount.toLocaleString()}</td><td className="p-2">{p.status}</td><td className="p-2 text-right">{p.status === 'Pendente' && <button onClick={() => handleStatusChange(p.id, 'Pago')} className="text-green-600 font-semibold">Marcar como Pago</button>}</td></tr>))}</tbody>
            </table>
        </div>
    );
};

const CommissionsView: React.FC<{ rules: CommissionRule[], setRules: React.Dispatch<React.SetStateAction<CommissionRule[]>> }> = ({ rules, setRules }) => {
    const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const category = (form.elements.namedItem('category') as HTMLInputElement).value;
        const commissionRate = parseFloat((form.elements.namedItem('rate') as HTMLInputElement).value);
        if (category && !isNaN(commissionRate)) {
            setRules(prev => [...prev, { id: uuidv4(), category, commissionRate }]);
            form.reset();
        }
    };
    const handleDelete = (id: string) => setRules(prev => prev.filter(r => r.id !== id));
    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold mb-4">Comissão Flexível por Categoria</h3>
            <form onSubmit={handleSave} className="flex gap-4 mb-6 p-4 bg-gray-50 rounded-lg border">
                <input name="category" placeholder="Nome da Categoria" className="flex-grow p-2 border rounded-md" required />
                <input name="rate" type="number" step="0.1" placeholder="Comissão (%)" className="w-32 p-2 border rounded-md" required />
                <button type="submit" className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg">Adicionar</button>
            </form>
            <div className="space-y-2 max-w-lg mx-auto">
                {rules.map(rule => (<div key={rule.id} className="flex items-center justify-between p-2 border rounded-lg"><span>{rule.category}</span><div className="flex items-center gap-2"><span className="font-bold">{rule.commissionRate}%</span><button onClick={()=>handleDelete(rule.id)} className="text-red-500"><TrashIcon className="h-4 w-4"/></button></div></div>))}
            </div>
        </div>
    );
};

const DisputesView: React.FC<{ disputes: Dispute[], onResolve: (d: Dispute) => void }> = ({ disputes, onResolve }) => (
    <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-bold mb-4">Mediação de Disputas</h3>
        <table className="w-full text-sm">
            <thead className="bg-gray-50"><tr><th className="p-2 text-left">Pedido</th><th className="p-2 text-left">Motivo</th><th className="p-2 text-left">Status</th><th className="p-2 text-right">Ações</th></tr></thead>
            <tbody>{disputes.map(d => (<tr key={d.id} className="border-t"><td className="p-2 font-mono">{d.orderId}</td><td className="p-2">{d.reason}</td><td className="p-2">{d.status}</td><td className="p-2 text-right">{d.status === 'Aberto' && <button onClick={() => onResolve(d)} className="font-medium text-blue-600">Resolver</button>}</td></tr>))}</tbody>
        </table>
    </div>
);

export default Marketplace;
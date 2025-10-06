import React, { useState, useMemo } from 'react';
import { AppState, ProductCarbonFootprint, BlockchainTrace, PackagingLog, SustainableIncentive, Product } from '../types.ts';
import { LeafIcon, GlobeAltIcon, PlusIcon, PencilIcon, TrashIcon, SparklesIcon } from './Icons.tsx';
import { v4 as uuidv4 } from 'uuid';
import { GoogleGenAI, Type } from "@google/genai";

interface SustainabilityManagementProps {
    appState: AppState;
    setAppState: React.Dispatch<React.SetStateAction<AppState>>;
}

// --- Reusable Components ---
const Modal: React.FC<{ title: string; children: React.ReactNode; }> = ({ title, children }) => (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
        <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] flex flex-col">
            <h3 className="text-xl font-bold mb-4 flex-shrink-0">{title}</h3>
            {children}
        </div>
    </div>
);

const ToggleSwitch: React.FC<{ checked: boolean; onChange: (c: boolean) => void; }> = ({ checked, onChange }) => (
     <label className="flex items-center cursor-pointer"><div className="relative"><input type="checkbox" className="sr-only peer" checked={checked} onChange={(e) => onChange(e.target.checked)} /><div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-green-500 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div></div></label>
);

// --- Modals for CRUD ---

const CarbonFootprintModal: React.FC<{ footprint: ProductCarbonFootprint | null; products: Product[]; onSave: (fp: ProductCarbonFootprint) => void; onClose: () => void; }> = ({ footprint, products, onSave, onClose }) => {
    const isNew = footprint === null;
    const [formData, setFormData] = useState<ProductCarbonFootprint>(footprint || { productId: '', productName: '', footprintKgCO2e: 0 });

    const handleProductChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const product = products.find(p => p.code === e.target.value);
        if (product) {
            setFormData(p => ({ ...p, productId: product.code, productName: product.name }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.productId) { alert('Selecione um produto.'); return; }
        onSave(formData);
        onClose();
    };

    return (
        <Modal title={isNew ? 'Adicionar Pegada de Carbono' : 'Editar Pegada de Carbono'}>
            <form onSubmit={handleSubmit} className="space-y-4 flex-grow">
                <select value={formData.productId} onChange={handleProductChange} className="w-full p-2 border rounded bg-white" required>
                    <option value="">Selecione um Produto</option>
                    {products.map(p => <option key={p.id} value={p.code}>{p.name}</option>)}
                </select>
                <input type="number" step="0.01" min="0" value={formData.footprintKgCO2e} onChange={e => setFormData(p => ({...p, footprintKgCO2e: parseFloat(e.target.value)}))} placeholder="Pegada de Carbono (kg CO₂e)" className="w-full p-2 border rounded" required />
                <div className="flex justify-end gap-2 pt-4 border-t"><button type="button" onClick={onClose} className="bg-gray-200 py-2 px-4 rounded-lg">Cancelar</button><button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded-lg">Salvar</button></div>
            </form>
        </Modal>
    );
};

const PackagingModal: React.FC<{ item: PackagingLog | null; onSave: (item: PackagingLog) => void; onClose: () => void; }> = ({ item, onSave, onClose }) => {
    const isNew = item === null;
    const [formData, setFormData] = useState<PackagingLog>(item || { id: uuidv4(), type: '', recyclablePercentage: 100, unitsUsedLastMonth: 0 });
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setFormData(p => ({...p, [e.target.name]: e.target.type === 'number' ? parseFloat(e.target.value) : e.target.value }));
    return (
        <Modal title={isNew ? 'Adicionar Embalagem' : 'Editar Embalagem'}>
            <form onSubmit={e => {e.preventDefault(); onSave(formData); onClose();}} className="space-y-4 flex-grow">
                <input name="type" value={formData.type} onChange={handleChange} placeholder="Tipo de Embalagem" className="w-full p-2 border rounded" required />
                <input name="recyclablePercentage" type="number" min="0" max="100" value={formData.recyclablePercentage} onChange={handleChange} placeholder="% Reciclável" className="w-full p-2 border rounded" required />
                <input name="unitsUsedLastMonth" type="number" min="0" value={formData.unitsUsedLastMonth} onChange={handleChange} placeholder="Unidades/Mês" className="w-full p-2 border rounded" required />
                <div className="flex justify-end gap-2 pt-4 border-t"><button type="button" onClick={onClose} className="bg-gray-200 py-2 px-4 rounded-lg">Cancelar</button><button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded-lg">Salvar</button></div>
            </form>
        </Modal>
    );
};

const IncentiveModal: React.FC<{ incentive: SustainableIncentive | null; onSave: (inc: SustainableIncentive) => void; onClose: () => void; }> = ({ incentive, onSave, onClose }) => {
    const isNew = incentive === null;
    const [formData, setFormData] = useState<SustainableIncentive>(incentive || { id: uuidv4(), name: '', description: '', isActive: true });
    const [aiPrompt, setAiPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerate = async () => {
        if (!aiPrompt) return;
        setIsGenerating(true);
        try {
            const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
            const prompt = `Gere uma ideia para um incentivo sustentável para clientes de supermercado com o tema "${aiPrompt}". Forneça um nome (name) e uma descrição (description) para o incentivo.`;
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            name: { type: Type.STRING },
                            description: { type: Type.STRING }
                        },
                        required: ['name', 'description']
                    }
                }
            });
            const result = JSON.parse(response.text);
            if (result.name) setFormData(p => ({ ...p, name: result.name }));
            if (result.description) setFormData(p => ({ ...p, description: result.description }));
        } catch(e) { console.error(e); alert("Falha ao gerar com IA."); }
        finally { setIsGenerating(false); }
    };
    
    return (
        <Modal title={isNew ? 'Novo Incentivo' : 'Editar Incentivo'}>
            <div className="p-3 border rounded-lg bg-blue-50 border-blue-200 space-y-2 mb-4">
                <h4 className="font-semibold text-sm text-gray-800 flex items-center gap-2"><SparklesIcon className="h-5 w-5 text-blue-600"/>Assistente IA</h4>
                <div className="flex gap-2"><input value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} placeholder="Tema (ex: reduzir plástico)" className="w-full p-2 border rounded-md text-sm" /><button type="button" onClick={handleGenerate} disabled={isGenerating || !aiPrompt} className="bg-blue-600 text-white font-bold py-2 px-3 rounded-lg text-sm flex items-center gap-2"><SparklesIcon className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />Gerar</button></div>
            </div>
            <form onSubmit={e => {e.preventDefault(); onSave(formData); onClose();}} className="space-y-4 flex-grow">
                <input name="name" value={formData.name} onChange={e => setFormData(p => ({...p, name: e.target.value}))} placeholder="Nome do Incentivo" className="w-full p-2 border rounded" required />
                <textarea name="description" value={formData.description} onChange={e => setFormData(p => ({...p, description: e.target.value}))} placeholder="Descrição" className="w-full p-2 border rounded h-20" required />
                <div className="flex justify-between items-center"><label>Ativo</label><ToggleSwitch checked={formData.isActive} onChange={c => setFormData(p => ({...p, isActive: c}))} /></div>
                <div className="flex justify-end gap-2 pt-4 border-t"><button type="button" onClick={onClose} className="bg-gray-200 py-2 px-4 rounded-lg">Cancelar</button><button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded-lg">Salvar</button></div>
            </form>
        </Modal>
    );
};

// --- View Components ---

const DashboardView: React.FC<{appState: AppState}> = ({ appState }) => {
    const kpis = useMemo(() => ({
        avgFootprint: appState.productCarbonFootprints.reduce((s,p) => s + p.footprintKgCO2e, 0) / (appState.productCarbonFootprints.length || 1),
        traceableProducts: appState.blockchainTraces.length,
        avgRecyclability: appState.packagingLogs.reduce((s,p) => s + p.recyclablePercentage, 0) / (appState.packagingLogs.length || 1),
        activeIncentives: appState.sustainableIncentives.filter(i => i.isActive).length,
    }), [appState]);

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow"><p className="text-sm">Pegada Média/Prod.</p><p className="text-2xl font-bold">{kpis.avgFootprint.toFixed(2)} <span className="text-base">kg CO₂e</span></p></div>
            <div className="bg-white p-4 rounded-lg shadow"><p className="text-sm">Produtos Rastreáveis</p><p className="text-2xl font-bold">{kpis.traceableProducts}</p></div>
            <div className="bg-white p-4 rounded-lg shadow"><p className="text-sm">Reciclabilidade Média</p><p className="text-2xl font-bold">{kpis.avgRecyclability.toFixed(0)}%</p></div>
            <div className="bg-white p-4 rounded-lg shadow"><p className="text-sm">Incentivos Ativos</p><p className="text-2xl font-bold">{kpis.activeIncentives}</p></div>
        </div>
    );
};

// --- Main Component ---
const SustainabilityManagement: React.FC<SustainabilityManagementProps> = ({ appState, setAppState }) => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [modal, setModal] = useState<{type: string | null, data: any}>({ type: null, data: null });
    const allProducts = useMemo(() => appState.productSections.flatMap(s => s.products), [appState.productSections]);

    const handleSave = (item: any, collection: keyof AppState) => {
        setAppState(prev => {
            const items = prev[collection] as any[];
            const exists = items.some(i => i.id === item.id || (i.productId && i.productId === item.productId));
            const newItems = exists ? items.map(i => (i.id === item.id || i.productId === item.productId) ? item : i) : [item, ...items];
            return { ...prev, [collection]: newItems };
        });
    };

    const handleDelete = (id: string, collection: keyof AppState, key: 'id' | 'productId' = 'id') => {
        if (window.confirm("Tem certeza que deseja excluir?")) {
            setAppState(prev => ({ ...prev, [collection]: (prev[collection] as any[]).filter(i => i[key] !== id) }));
        }
    };
    
    const tabs = [ { id: 'dashboard', label: 'Dashboard' }, { id: 'carbon_footprint', label: 'Pegada de Carbono' }, { id: 'traceability', label: 'Rastreabilidade' }, { id: 'packaging', label: 'Embalagens' }, { id: 'incentives', label: 'Incentivos' }, ];

    const renderModals = () => {
        switch(modal.type) {
            case 'carbon': return <CarbonFootprintModal footprint={modal.data} products={allProducts} onClose={() => setModal({type: null, data: null})} onSave={(fp) => handleSave(fp, 'productCarbonFootprints')} />;
            case 'packaging': return <PackagingModal item={modal.data} onClose={() => setModal({type: null, data: null})} onSave={(item) => handleSave(item, 'packagingLogs')} />;
            case 'incentive': return <IncentiveModal incentive={modal.data} onClose={() => setModal({type: null, data: null})} onSave={(inc) => handleSave(inc, 'sustainableIncentives')} />;
            default: return null;
        }
    };
    
    return (
        <div className="space-y-6">
            {renderModals()}
            <div className="flex items-center gap-3"> <GlobeAltIcon className="h-8 w-8 text-green-600"/> <h2 className="text-3xl font-bold text-gray-800">Sustentabilidade & ESG</h2> </div>
            <div className="bg-white rounded-lg shadow-sm p-2"><nav className="flex space-x-2">{tabs.map(tab => (<button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center px-4 py-2 rounded-md text-sm font-medium ${activeTab === tab.id ? 'bg-green-600 text-white' : 'hover:bg-gray-100'}`}>{tab.label}</button>))}</nav></div>
            
            {activeTab === 'dashboard' && <DashboardView appState={appState} />}
            {activeTab === 'carbon_footprint' && <div className="bg-white p-6 rounded-lg shadow-md"><div className="flex justify-between items-center mb-4"><h3 className="text-xl font-bold">Pegada de Carbono</h3><button onClick={() => setModal({type:'carbon', data:null})} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2"><PlusIcon className="h-5 w-5"/>Adicionar</button></div><table className="w-full text-sm"><thead><tr className="bg-gray-100"><th className="p-3 text-left">Produto</th><th className="p-3 text-left">Pegada (kg CO₂e)</th><th className="p-3 text-right">Ações</th></tr></thead><tbody>{appState.productCarbonFootprints.map(p => (<tr key={p.productId} className="border-b"><td className="p-3 font-medium">{p.productName}</td><td className="p-3">{p.footprintKgCO2e.toFixed(2)} kg</td><td className="p-3 text-right space-x-2"><button onClick={() => setModal({type: 'carbon', data: p})} className="p-1 text-blue-600"><PencilIcon className="h-5 w-5"/></button><button onClick={() => handleDelete(p.productId, 'productCarbonFootprints', 'productId')} className="p-1 text-red-500"><TrashIcon className="h-5 w-5"/></button></td></tr>))}</tbody></table></div>}
            {activeTab === 'traceability' && <div className="bg-white p-6 rounded-lg shadow-md"><h3 className="text-xl font-bold mb-4">Rastreabilidade (Blockchain)</h3><div className="space-y-3">{appState.blockchainTraces.map(t => (<div key={t.productId} className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg"><h4 className="font-bold text-blue-800">{t.productName}</h4><p className="text-sm">Origem: {t.origin}</p><p className="text-xs mt-1">Último Scan: {t.lastScan}</p></div>))}</div></div>}
            {activeTab === 'packaging' && <div className="bg-white p-6 rounded-lg shadow-md"><div className="flex justify-between items-center mb-4"><h3 className="text-xl font-bold">Embalagens</h3><button onClick={() => setModal({type:'packaging', data:null})} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2"><PlusIcon className="h-5 w-5"/>Adicionar</button></div><table className="w-full text-sm"><thead><tr className="bg-gray-100"><th className="p-3 text-left">Tipo</th><th className="p-3 text-left">% Reciclável</th><th className="p-3 text-left">Uso/Mês</th><th className="p-3 text-right">Ações</th></tr></thead><tbody>{appState.packagingLogs.map(log => (<tr key={log.id} className="border-b"><td className="p-3 font-medium">{log.type}</td><td className="p-3"><div className="w-full bg-gray-200 h-4 rounded"><div className="bg-green-500 h-4 rounded text-white text-xs text-center font-bold" style={{width: `${log.recyclablePercentage}%`}}>{log.recyclablePercentage}%</div></div></td><td className="p-3">{log.unitsUsedLastMonth.toLocaleString()} un.</td><td className="p-3 text-right space-x-2"><button onClick={() => setModal({type: 'packaging', data: log})} className="p-1 text-blue-600"><PencilIcon className="h-5 w-5"/></button><button onClick={() => handleDelete(log.id, 'packagingLogs')} className="p-1 text-red-500"><TrashIcon className="h-5 w-5"/></button></td></tr>))}</tbody></table></div>}
            {activeTab === 'incentives' && <div className="bg-white p-6 rounded-lg shadow-md"><div className="flex justify-between items-center mb-4"><h3 className="text-xl font-bold">Incentivos</h3><button onClick={() => setModal({type:'incentive', data:null})} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2"><PlusIcon className="h-5 w-5"/>Adicionar</button></div><div className="space-y-3">{appState.sustainableIncentives.map(i => (<div key={i.id} className="p-3 border rounded-lg flex justify-between items-center"><div><p className="font-semibold">{i.name}</p><p className="text-xs text-gray-500">{i.description}</p></div><div className="flex items-center gap-4"><ToggleSwitch checked={i.isActive} onChange={(c) => handleSave({...i, isActive: c}, 'sustainableIncentives')} /><button onClick={() => setModal({type: 'incentive', data: i})} className="p-1 text-blue-600"><PencilIcon className="h-5 w-5"/></button><button onClick={() => handleDelete(i.id, 'sustainableIncentives')} className="p-1 text-red-500"><TrashIcon className="h-5 w-5"/></button></div></div>))}</div></div>}
        </div>
    );
};

export default SustainabilityManagement;
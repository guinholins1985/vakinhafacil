import React, { useState } from 'react';
import { AppState, LanguageSetting, CurrencySetting, RegionalContent, InternationalShipment } from '../types.ts';
import { PlusIcon, PencilIcon, TrashIcon } from './Icons.tsx';
import { v4 as uuidv4 } from 'uuid';

interface InternationalizationProps {
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
}

// --- Reusable Modal Component ---
const Modal: React.FC<{ title: string; onClose: () => void; children: React.ReactNode; }> = ({ title, onClose, children }) => (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
        <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-4 flex-shrink-0">
                <h3 className="text-lg font-bold">{title}</h3>
                <button onClick={onClose} className="text-2xl font-semibold">&times;</button>
            </div>
            {children}
        </div>
    </div>
);

// --- Modals for each section ---
const LanguageCurrencyModal: React.FC<{
    item: LanguageSetting | CurrencySetting | null;
    type: 'language' | 'currency';
    onSave: (item: LanguageSetting | CurrencySetting) => void;
    onClose: () => void;
}> = ({ item, type, onSave, onClose }) => {
    const isNew = item === null;
    const [formData, setFormData] = useState(item || { id: uuidv4(), name: '', code: '', isEnabled: true });

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData as LanguageSetting | CurrencySetting);
        onClose();
    };

    return (
        <Modal title={isNew ? `Nova ${type === 'language' ? 'Língua' : 'Moeda'}` : `Editar ${type === 'language' ? 'Língua' : 'Moeda'}`} onClose={onClose}>
            <form onSubmit={handleSave} className="space-y-4">
                <input value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} placeholder="Nome (Ex: Dólar Americano)" className="w-full p-2 border rounded" required />
                <input value={formData.code} onChange={e => setFormData(p => ({ ...p, code: e.target.value }))} placeholder="Código (Ex: USD)" className="w-full p-2 border rounded" required />
                <div className="flex justify-end gap-2 pt-4 border-t"><button type="button" onClick={onClose} className="bg-gray-200 py-2 px-4 rounded-lg">Cancelar</button><button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded-lg">Salvar</button></div>
            </form>
        </Modal>
    );
};

const RegionalContentModal: React.FC<{
    content: RegionalContent | null;
    onSave: (rc: RegionalContent) => void;
    onClose: () => void;
}> = ({ content, onSave, onClose }) => {
    const [formData, setFormData] = useState(content || { id: uuidv4(), region: '', promoText: '', bannerImageUrl: '' });
    const handleSave = (e: React.FormEvent) => { e.preventDefault(); onSave(formData); onClose(); };
    return (
        <Modal title={content ? 'Editar Conteúdo Regional' : 'Novo Conteúdo Regional'} onClose={onClose}>
             <form onSubmit={handleSave} className="space-y-4">
                <input value={formData.region} onChange={e => setFormData(p => ({ ...p, region: e.target.value }))} placeholder="Região (Ex: Europa)" className="w-full p-2 border rounded" required />
                <input value={formData.promoText} onChange={e => setFormData(p => ({ ...p, promoText: e.target.value }))} placeholder="Texto Promocional" className="w-full p-2 border rounded" />
                <input value={formData.bannerImageUrl} onChange={e => setFormData(p => ({ ...p, bannerImageUrl: e.target.value }))} placeholder="URL da Imagem do Banner" className="w-full p-2 border rounded" />
                <div className="flex justify-end gap-2 pt-4 border-t"><button type="button" onClick={onClose} className="bg-gray-200 py-2 px-4 rounded-lg">Cancelar</button><button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded-lg">Salvar</button></div>
             </form>
        </Modal>
    );
};

const ShipmentModal: React.FC<{
    shipment: InternationalShipment | null;
    onSave: (s: InternationalShipment) => void;
    onClose: () => void;
}> = ({ shipment, onSave, onClose }) => {
    const [formData, setFormData] = useState(shipment || { id: uuidv4(), orderId: '', destinationCountry: '', carrier: '', customsStatus: 'Em Análise' });
    const handleSave = (e: React.FormEvent) => { e.preventDefault(); onSave(formData); onClose(); };
    return (
        <Modal title={shipment ? 'Editar Remessa' : 'Nova Remessa Internacional'} onClose={onClose}>
             <form onSubmit={handleSave} className="space-y-4">
                <input value={formData.orderId} onChange={e => setFormData(p => ({ ...p, orderId: e.target.value }))} placeholder="ID do Pedido" className="w-full p-2 border rounded" required />
                <input value={formData.destinationCountry} onChange={e => setFormData(p => ({ ...p, destinationCountry: e.target.value }))} placeholder="País de Destino" className="w-full p-2 border rounded" required />
                <input value={formData.carrier} onChange={e => setFormData(p => ({ ...p, carrier: e.target.value }))} placeholder="Transportadora" className="w-full p-2 border rounded" required />
                <select value={formData.customsStatus} onChange={e => setFormData(p => ({ ...p, customsStatus: e.target.value as any }))} className="w-full p-2 border rounded bg-white">
                    <option>Em Análise</option><option>Liberado</option><option>Retido</option>
                </select>
                <div className="flex justify-end gap-2 pt-4 border-t"><button type="button" onClick={onClose} className="bg-gray-200 py-2 px-4 rounded-lg">Cancelar</button><button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded-lg">Salvar</button></div>
             </form>
        </Modal>
    );
};

const Internationalization: React.FC<InternationalizationProps> = ({ appState, setAppState }) => {
    const [activeTab, setActiveTab] = useState('settings');
    const [modal, setModal] = useState<{ type: string | null, data?: any }>({ type: null });

    const handleSave = (item: any, collection: keyof AppState) => {
        setAppState(prev => {
            const items = prev[collection] as any[];
            const exists = items.some(i => i.id === item.id);
            const newItems = exists ? items.map(i => (i.id === item.id) ? item : i) : [item, ...items];
            return { ...prev, [collection]: newItems };
        });
        setModal({ type: null });
    };

    const handleDelete = (id: string, collection: keyof AppState) => {
        if (window.confirm("Tem certeza que deseja excluir este item?")) {
            setAppState(prev => ({
                ...prev,
                [collection]: (prev[collection] as { id: string }[]).filter(i => i.id !== id)
            }));
        }
    };

    const handleToggle = (id: string, collection: 'languageSettings' | 'currencySettings') => {
        setAppState(prev => ({
            ...prev,
            [collection]: prev[collection].map(item =>
                item.id === id ? { ...item, isEnabled: !item.isEnabled } : item
            )
        }));
    };
    
    const handleShipmentStatusChange = (shipmentId: string, status: InternationalShipment['customsStatus']) => {
        setAppState(prev => ({
            ...prev,
            internationalShipments: prev.internationalShipments.map(s => s.id === shipmentId ? { ...s, status } : s)
        }));
    };

    const tabs = [
        { id: 'settings', label: 'Idiomas e Moedas' },
        { id: 'content', label: 'Conteúdo Regional' },
        { id: 'logistics', label: 'Logística Internacional' },
    ];

    const customsStatusClasses = { 'Liberado': 'bg-green-100 text-green-800', 'Em Análise': 'bg-yellow-100 text-yellow-800', 'Retido': 'bg-red-100 text-red-800' };

    const renderTabContent = () => {
        switch(activeTab) {
            case 'settings':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <div className="flex justify-between items-center mb-4"><h3 className="text-xl font-bold">Idiomas</h3><button onClick={() => setModal({ type: 'language' })} className="bg-blue-600 text-white font-bold py-1 px-3 rounded-lg flex items-center gap-1 text-sm"><PlusIcon className="h-4 w-4"/> Adicionar</button></div>
                            <div className="space-y-3">{appState.languageSettings.map(lang => (<div key={lang.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg group"><div><span>{lang.name} ({lang.code})</span></div><div className="flex items-center gap-3"><label className="flex items-center cursor-pointer"><div className="relative"><input type="checkbox" className="sr-only peer" checked={lang.isEnabled} onChange={() => handleToggle(lang.id, 'languageSettings')} /><div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-green-500 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div></div></label><div className="flex opacity-0 group-hover:opacity-100"><button onClick={() => setModal({ type: 'language', data: lang })} className="p-1 text-blue-600"><PencilIcon className="h-4 w-4"/></button><button onClick={() => handleDelete(lang.id, 'languageSettings')} className="p-1 text-red-500"><TrashIcon className="h-4 w-4"/></button></div></div></div>))}</div>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <div className="flex justify-between items-center mb-4"><h3 className="text-xl font-bold">Moedas</h3><button onClick={() => setModal({ type: 'currency' })} className="bg-blue-600 text-white font-bold py-1 px-3 rounded-lg flex items-center gap-1 text-sm"><PlusIcon className="h-4 w-4"/> Adicionar</button></div>
                            <div className="space-y-3">{appState.currencySettings.map(curr => (<div key={curr.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg group"><span>{curr.name} ({curr.code})</span><div className="flex items-center gap-3"><label className="flex items-center cursor-pointer"><div className="relative"><input type="checkbox" className="sr-only peer" checked={curr.isEnabled} onChange={() => handleToggle(curr.id, 'currencySettings')} /><div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-green-500 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div></div></label><div className="flex opacity-0 group-hover:opacity-100"><button onClick={() => setModal({ type: 'currency', data: curr })} className="p-1 text-blue-600"><PencilIcon className="h-4 w-4"/></button><button onClick={() => handleDelete(curr.id, 'currencySettings')} className="p-1 text-red-500"><TrashIcon className="h-4 w-4"/></button></div></div></div>))}</div>
                        </div>
                    </div>
                );
            case 'content':
                return (
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="flex justify-between items-center mb-4"><h3 className="text-xl font-bold">Adaptação Cultural por Região</h3><button onClick={() => setModal({ type: 'regionalContent' })} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2"><PlusIcon className="h-5 w-5"/>Adicionar Região</button></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{appState.regionalContents.map(rc => (<div key={rc.id} className="p-4 border rounded-lg group relative"><div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100"><button onClick={() => setModal({ type: 'regionalContent', data: rc })} className="p-1 bg-white rounded-full shadow"><PencilIcon className="h-4 w-4 text-blue-600"/></button><button onClick={() => handleDelete(rc.id, 'regionalContents')} className="p-1 bg-white rounded-full shadow"><TrashIcon className="h-4 w-4 text-red-500"/></button></div><h4 className="font-bold text-lg">{rc.region}</h4><p className="text-sm my-2 p-2 bg-gray-100 rounded">"{rc.promoText}"</p><img src={rc.bannerImageUrl} alt={`Banner for ${rc.region}`} className="w-full h-auto rounded-md" /></div>))}</div>
                    </div>
                );
            case 'logistics':
                 return (
                    <div className="bg-white p-6 rounded-lg shadow-md">
                         <div className="flex justify-between items-center mb-4"><h3 className="text-xl font-bold">Logística Internacional</h3><button onClick={() => setModal({ type: 'shipment' })} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2"><PlusIcon className="h-5 w-5"/>Adicionar Remessa</button></div>
                        <table className="w-full text-sm">
                            <thead className="text-xs uppercase bg-gray-100"><tr><th className="px-4 py-3 text-left">Pedido</th><th className="px-4 py-3 text-left">Destino</th><th className="px-4 py-3 text-left">Transportadora</th><th className="px-4 py-3 text-left">Status Alfândega</th><th className="px-4 py-3 text-right">Ações</th></tr></thead>
                            <tbody>{appState.internationalShipments.map(s => (<tr key={s.id} className="border-b hover:bg-gray-50">
                                <td className="px-4 py-3 font-mono">{s.orderId}</td>
                                <td className="px-4 py-3">{s.destinationCountry}</td>
                                <td className="px-4 py-3">{s.carrier}</td>
                                <td className="px-4 py-3"><select value={s.customsStatus} onChange={(e) => handleShipmentStatusChange(s.id, e.target.value as any)} className={`px-2 py-1 text-xs font-semibold rounded-full border-0 focus:ring-2 focus:ring-blue-400 appearance-none ${customsStatusClasses[s.customsStatus]}`}><option>Em Análise</option><option>Liberado</option><option>Retido</option></select></td>
                                <td className="px-4 py-3 text-right space-x-1"><button onClick={() => setModal({ type: 'shipment', data: s })} className="p-1 text-blue-600 hover:bg-blue-100 rounded-full"><PencilIcon className="h-5 w-5"/></button><button onClick={() => handleDelete(s.id, 'internationalShipments')} className="p-1 text-red-500 hover:bg-red-100 rounded-full"><TrashIcon className="h-5 w-5"/></button></td>
                            </tr>))}</tbody>
                        </table>
                    </div>
                );
            default: return null;
        }
    };

    return (
        <div className="space-y-6">
            {modal.type === 'language' && <LanguageCurrencyModal item={modal.data} type="language" onClose={() => setModal({ type: null })} onSave={(item) => handleSave(item, 'languageSettings')} />}
            {modal.type === 'currency' && <LanguageCurrencyModal item={modal.data} type="currency" onClose={() => setModal({ type: null })} onSave={(item) => handleSave(item, 'currencySettings')} />}
            {modal.type === 'regionalContent' && <RegionalContentModal content={modal.data} onClose={() => setModal({ type: null })} onSave={(item) => handleSave(item, 'regionalContents')} />}
            {modal.type === 'shipment' && <ShipmentModal shipment={modal.data} onClose={() => setModal({ type: null })} onSave={(item) => handleSave(item, 'internationalShipments')} />}

            <h2 className="text-3xl font-bold text-gray-800">Internacionalização</h2>
            <div className="bg-white rounded-lg shadow-sm p-2">
                <nav className="flex space-x-2">
                    {tabs.map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-4 py-2 rounded-md text-sm font-medium ${activeTab === tab.id ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}`}>
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>
            <div>{renderTabContent()}</div>
        </div>
    );
};

export default Internationalization;

import React, { useState } from 'react';
import { AppState, Contract, License, ComplianceAudit } from '../types.ts';
import { ShieldCheckIcon, DocumentTextIcon, CalendarIcon, PlusIcon, PencilIcon, TrashIcon } from './Icons.tsx';
import { v4 as uuidv4 } from 'uuid';

interface LegalComplianceProps {
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

// --- Specific Modals for each section ---
const ContractModal: React.FC<{ contract: Contract | null; onSave: (c: Contract) => void; onClose: () => void; }> = ({ contract, onSave, onClose }) => {
    const [formData, setFormData] = useState<Contract>(contract || { id: uuidv4(), name: '', vendor: '', endDate: '', status: 'Ativo' });
    const handleSave = (e: React.FormEvent) => { e.preventDefault(); onSave(formData); onClose(); };
    return (
        <Modal title={contract ? 'Editar Contrato' : 'Novo Contrato'} onClose={onClose}>
            <form onSubmit={handleSave} className="space-y-4">
                <input value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} placeholder="Nome do Contrato" className="w-full p-2 border rounded" required />
                <input value={formData.vendor} onChange={e => setFormData(p => ({ ...p, vendor: e.target.value }))} placeholder="Fornecedor" className="w-full p-2 border rounded" required />
                <input type="date" value={formData.endDate} onChange={e => setFormData(p => ({ ...p, endDate: e.target.value }))} className="w-full p-2 border rounded" required />
                <select value={formData.status} onChange={e => setFormData(p => ({ ...p, status: e.target.value as any }))} className="w-full p-2 border rounded bg-white">
                    <option>Ativo</option><option>Expirando</option><option>Expirado</option>
                </select>
                <div className="flex justify-end gap-2 pt-4 border-t"><button type="button" onClick={onClose} className="bg-gray-200 py-2 px-4 rounded-lg">Cancelar</button><button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded-lg">Salvar</button></div>
            </form>
        </Modal>
    );
};

const LicenseModal: React.FC<{ license: License | null; onSave: (l: License) => void; onClose: () => void; }> = ({ license, onSave, onClose }) => {
    const [formData, setFormData] = useState<License>(license || { id: uuidv4(), name: '', expiryDate: '', status: 'Válido' });
    const handleSave = (e: React.FormEvent) => { e.preventDefault(); onSave(formData); onClose(); };
    return (
        <Modal title={license ? 'Editar Licença' : 'Nova Licença'} onClose={onClose}>
            <form onSubmit={handleSave} className="space-y-4">
                <input value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} placeholder="Nome da Licença/Alvará" className="w-full p-2 border rounded" required />
                <input type="date" value={formData.expiryDate} onChange={e => setFormData(p => ({ ...p, expiryDate: e.target.value }))} className="w-full p-2 border rounded" required />
                <select value={formData.status} onChange={e => setFormData(p => ({ ...p, status: e.target.value as any }))} className="w-full p-2 border rounded bg-white">
                    <option>Válido</option><option>Expirando</option>
                </select>
                <div className="flex justify-end gap-2 pt-4 border-t"><button type="button" onClick={onClose} className="bg-gray-200 py-2 px-4 rounded-lg">Cancelar</button><button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded-lg">Salvar</button></div>
            </form>
        </Modal>
    );
};

const AuditModal: React.FC<{ audit: ComplianceAudit | null; onSave: (a: ComplianceAudit) => void; onClose: () => void; }> = ({ audit, onSave, onClose }) => {
    const [formData, setFormData] = useState<ComplianceAudit>(audit || { id: uuidv4(), area: '', date: new Date().toISOString().split('T')[0], result: 'Conforme', details: '' });
    const handleSave = (e: React.FormEvent) => { e.preventDefault(); onSave(formData); onClose(); };
    return (
        <Modal title={audit ? 'Editar Auditoria' : 'Nova Auditoria'} onClose={onClose}>
            <form onSubmit={handleSave} className="space-y-4">
                <input value={formData.area} onChange={e => setFormData(p => ({ ...p, area: e.target.value }))} placeholder="Área Auditada" className="w-full p-2 border rounded" required />
                <input type="date" value={formData.date} onChange={e => setFormData(p => ({ ...p, date: e.target.value }))} className="w-full p-2 border rounded" required />
                <textarea value={formData.details} onChange={e => setFormData(p => ({ ...p, details: e.target.value }))} placeholder="Detalhes e Observações" className="w-full p-2 border rounded h-24" />
                <select value={formData.result} onChange={e => setFormData(p => ({ ...p, result: e.target.value as any }))} className="w-full p-2 border rounded bg-white">
                    <option>Conforme</option><option>Não Conforme</option>
                </select>
                <div className="flex justify-end gap-2 pt-4 border-t"><button type="button" onClick={onClose} className="bg-gray-200 py-2 px-4 rounded-lg">Cancelar</button><button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded-lg">Salvar</button></div>
            </form>
        </Modal>
    );
};


const LegalCompliance: React.FC<LegalComplianceProps> = ({ appState, setAppState }) => {
    const [activeTab, setActiveTab] = useState('contracts');
    const [modal, setModal] = useState<{ type: 'contract' | 'license' | 'audit' | null, data: any }>({ type: null, data: null });
    
    const handleSave = <T extends { id: string }>(item: T, collection: keyof AppState) => {
        setAppState(prev => {
            const items = prev[collection] as T[];
            const exists = items.some(i => i.id === item.id);
            const newItems = exists ? items.map(i => i.id === item.id ? item : i) : [item, ...items];
            return { ...prev, [collection]: newItems };
        });
        setModal({ type: null, data: null });
    };

    const handleDelete = (id: string, collection: keyof AppState) => {
        if (window.confirm("Tem certeza que deseja excluir este item?")) {
            setAppState(prev => ({
                ...prev,
                [collection]: (prev[collection] as { id: string }[]).filter(i => i.id !== id)
            }));
        }
    };

    const tabs = [
        { id: 'contracts', label: 'Gestão de Contratos' },
        { id: 'licenses', label: 'Licenças e Alvarás' },
        { id: 'audits', label: 'Auditoria e LGPD' },
    ];
    
    const contractStatusClasses = { 'Ativo': 'bg-green-100 text-green-800', 'Expirando': 'bg-yellow-100 text-yellow-800', 'Expirado': 'bg-red-100 text-red-800' };
    const licenseStatusClasses = { 'Válido': 'bg-green-100 text-green-800', 'Expirando': 'bg-yellow-100 text-yellow-800' };
    const auditResultClasses = { 'Conforme': 'bg-green-100 text-green-800', 'Não Conforme': 'bg-red-100 text-red-800' };

    const renderTabContent = () => {
        switch(activeTab) {
            case 'contracts':
                return (
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold">Contratos</h3>
                            <button onClick={() => setModal({ type: 'contract', data: null })} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2"><PlusIcon className="h-5 w-5"/>Adicionar Contrato</button>
                        </div>
                        <table className="w-full text-sm">
                            <thead className="text-xs uppercase bg-gray-100"><tr><th className="px-4 py-3 text-left">Contrato</th><th className="px-4 py-3 text-left">Fornecedor</th><th className="px-4 py-3 text-left">Vencimento</th><th className="px-4 py-3 text-left">Status</th><th className="px-4 py-3 text-right">Ações</th></tr></thead>
                            <tbody>
                                {appState.contracts.map(c => (
                                    <tr key={c.id} className="border-b hover:bg-gray-50">
                                        <td className="px-4 py-3 font-medium">{c.name}</td>
                                        <td className="px-4 py-3">{c.vendor}</td>
                                        <td className="px-4 py-3">{new Date(c.endDate).toLocaleDateString()}</td>
                                        <td className="px-4 py-3"><span className={`px-2 py-1 text-xs rounded-full ${contractStatusClasses[c.status]}`}>{c.status}</span></td>
                                        <td className="px-4 py-3 text-right space-x-2">
                                            <button onClick={() => setModal({ type: 'contract', data: c })} className="p-1 text-blue-600 hover:bg-blue-100 rounded-full"><PencilIcon className="h-5 w-5"/></button>
                                            <button onClick={() => handleDelete(c.id, 'contracts')} className="p-1 text-red-500 hover:bg-red-100 rounded-full"><TrashIcon className="h-5 w-5"/></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                );
            case 'licenses':
                return (
                     <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold">Licenças e Alvarás</h3>
                             <button onClick={() => setModal({ type: 'license', data: null })} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2"><PlusIcon className="h-5 w-5"/>Adicionar Licença</button>
                        </div>
                        <div className="space-y-4">
                           {appState.licenses.map(l => (
                                <div key={l.id} className="p-4 border rounded-lg flex items-center justify-between group">
                                    <div>
                                        <p className="font-bold text-gray-800">{l.name}</p>
                                        <p className="text-sm text-gray-500">Expira em: {new Date(l.expiryDate).toLocaleDateString()}</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${licenseStatusClasses[l.status]}`}>{l.status}</span>
                                        <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => setModal({ type: 'license', data: l })} className="p-1 text-blue-600 hover:bg-blue-100 rounded-full"><PencilIcon className="h-5 w-5"/></button>
                                            <button onClick={() => handleDelete(l.id, 'licenses')} className="p-1 text-red-500 hover:bg-red-100 rounded-full"><TrashIcon className="h-5 w-5"/></button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 'audits':
                 return (
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold text-gray-800">Auditoria de Conformidade</h3>
                                <button onClick={() => setModal({ type: 'audit', data: null })} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2"><PlusIcon className="h-5 w-5"/>Nova Auditoria</button>
                            </div>
                            {appState.complianceAudits.map(a => (
                                <div key={a.id} className="p-3 bg-gray-50 rounded-lg mb-2 group">
                                    <div className="flex justify-between items-center">
                                        <p className="font-semibold">{a.area} - {new Date(a.date).toLocaleDateString()}</p>
                                        <div className="flex items-center gap-4">
                                            <span className={`px-2 py-1 text-xs rounded-full ${auditResultClasses[a.result]}`}>{a.result}</span>
                                            <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => setModal({ type: 'audit', data: a })} className="p-1 text-blue-600 hover:bg-blue-100 rounded-full"><PencilIcon className="h-5 w-5"/></button>
                                                <button onClick={() => handleDelete(a.id, 'complianceAudits')} className="p-1 text-red-500 hover:bg-red-100 rounded-full"><TrashIcon className="h-5 w-5"/></button>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1">{a.details}</p>
                                </div>
                            ))}
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h3 className="text-xl font-bold text-gray-800 mb-4">Proteção de Dados (LGPD)</h3>
                            <ul className="space-y-2 text-sm">
                                <li className="flex items-center gap-2"><ShieldCheckIcon className="h-5 w-5 text-green-500"/> Política de Privacidade: <strong>Atualizada</strong></li>
                                <li className="flex items-center gap-2"><ShieldCheckIcon className="h-5 w-5 text-green-500"/> Canal de Solicitação de Dados: <strong>Ativo</strong></li>
                                <li className="flex items-center gap-2"><ShieldCheckIcon className="h-5 w-5 text-yellow-500"/> Mapeamento de Dados: <strong>Revisão Pendente</strong></li>
                            </ul>
                        </div>
                    </div>
                );
            default: return null;
        }
    };

    return (
        <div className="space-y-6">
            {modal.type === 'contract' && <ContractModal contract={modal.data} onClose={() => setModal({type: null, data: null})} onSave={(item) => handleSave(item, 'contracts')} />}
            {modal.type === 'license' && <LicenseModal license={modal.data} onClose={() => setModal({type: null, data: null})} onSave={(item) => handleSave(item, 'licenses')} />}
            {modal.type === 'audit' && <AuditModal audit={modal.data} onClose={() => setModal({type: null, data: null})} onSave={(item) => handleSave(item, 'complianceAudits')} />}

            <h2 className="text-3xl font-bold text-gray-800">Jurídico e Compliance</h2>
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

export default LegalCompliance;

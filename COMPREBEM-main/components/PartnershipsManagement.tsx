

import React, { useState } from 'react';
import { AppState, StrategicPartner } from '../types.ts';
import { UsersIcon, PlusIcon, PencilIcon, TrashIcon } from './Icons.tsx';
import { v4 as uuidv4 } from 'uuid';

interface PartnershipsManagementProps {
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
}

const PartnerModal: React.FC<{
    partner: StrategicPartner | null;
    onClose: () => void;
    onSave: (partner: StrategicPartner) => void;
}> = ({ partner, onClose, onSave }) => {
    const isNew = partner === null;
    const [formData, setFormData] = useState<StrategicPartner>(
        partner || {
            id: uuidv4(),
            name: '',
            type: '',
            status: 'Ativo',
        }
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(p => ({ ...p, [name]: value }));
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h3 className="text-lg font-bold mb-4">{isNew ? 'Adicionar Novo Parceiro' : 'Editar Parceiro'}</h3>
                <form onSubmit={handleSave} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="text-sm font-medium">Nome do Parceiro</label>
                        <input id="name" name="name" value={formData.name} onChange={handleChange} className="w-full p-2 border rounded-md" required />
                    </div>
                    <div>
                        <label htmlFor="type" className="text-sm font-medium">Tipo de Parceria</label>
                        <input id="type" name="type" value={formData.type} onChange={handleChange} placeholder="Ex: Logística, Marketing, Tecnologia" className="w-full p-2 border rounded-md" required />
                    </div>
                    <div>
                        <label htmlFor="status" className="text-sm font-medium">Status</label>
                        <select id="status" name="status" value={formData.status} onChange={handleChange} className="w-full p-2 border rounded-md bg-white">
                            <option value="Ativo">Ativo</option>
                            <option value="Inativo">Inativo</option>
                        </select>
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                        <button type="button" onClick={onClose} className="bg-gray-200 py-2 px-4 rounded-lg">Cancelar</button>
                        <button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded-lg">Salvar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const PartnershipsManagement: React.FC<PartnershipsManagementProps> = ({ appState, setAppState }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPartner, setEditingPartner] = useState<StrategicPartner | null>(null);

    const handleSavePartner = (partner: StrategicPartner) => {
        setAppState(prev => {
            const exists = prev.strategicPartners.some(p => p.id === partner.id);
            const newPartners = exists
                ? prev.strategicPartners.map(p => p.id === partner.id ? partner : p)
                : [partner, ...prev.strategicPartners];
            return { ...prev, strategicPartners: newPartners };
        });
    };

    const handleDeletePartner = (partnerId: string) => {
        if (window.confirm('Tem certeza que deseja remover este parceiro?')) {
            setAppState(prev => ({
                ...prev,
                strategicPartners: prev.strategicPartners.filter(p => p.id !== partnerId)
            }));
        }
    };
    
    const handleStatusToggle = (partnerId: string) => {
        setAppState(prev => ({
            ...prev,
            strategicPartners: prev.strategicPartners.map(p => 
                p.id === partnerId 
                    ? { ...p, status: p.status === 'Ativo' ? 'Inativo' : 'Ativo' }
                    : p
            )
        }));
    };
    
    const statusClasses: Record<StrategicPartner['status'], string> = {
        'Ativo': 'bg-green-100 text-green-800',
        'Inativo': 'bg-gray-200 text-gray-700',
    };
    
    return (
        <div className="space-y-6">
            {isModalOpen && <PartnerModal partner={editingPartner} onClose={() => setIsModalOpen(false)} onSave={handleSavePartner} />}
            <h2 className="text-3xl font-bold text-gray-800">Gestão de Parcerias Estratégicas</h2>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-800">Parceiros</h3>
                    <button onClick={() => { setEditingPartner(null); setIsModalOpen(true); }} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 flex items-center gap-2">
                        <PlusIcon className="h-5 w-5"/> Adicionar Parceiro
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-600">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                            <tr>
                                <th className="px-4 py-3">Parceiro</th>
                                <th className="px-4 py-3">Tipo</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {appState.strategicPartners.map(partner => (
                                <tr key={partner.id} className="border-b hover:bg-gray-50">
                                    <td className="px-4 py-3 font-medium text-gray-900">{partner.name}</td>
                                    <td className="px-4 py-3">{partner.type}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClasses[partner.status]}`}>
                                            {partner.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right space-x-2">
                                        <button onClick={() => handleStatusToggle(partner.id)} className="font-medium text-blue-600 hover:underline">
                                            {partner.status === 'Ativo' ? 'Desativar' : 'Ativar'}
                                        </button>
                                        <button onClick={() => { setEditingPartner(partner); setIsModalOpen(true); }} className="p-1 text-blue-600 hover:bg-blue-100 rounded-full"><PencilIcon className="h-5 w-5"/></button>
                                        <button onClick={() => handleDeletePartner(partner.id)} className="p-1 text-red-500 hover:bg-red-100 rounded-full"><TrashIcon className="h-5 w-5"/></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                     {appState.strategicPartners.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                            Nenhum parceiro cadastrado.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PartnershipsManagement;
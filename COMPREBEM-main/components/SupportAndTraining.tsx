import React, { useState, useMemo } from 'react';
import { AppState, SupportTicket, FAQ, TrainingModule } from '../types.ts';
import { LifebuoyIcon, BookOpenIcon, AcademicCapIcon, PlusIcon, PencilIcon, TrashIcon } from './Icons.tsx';
import { v4 as uuidv4 } from 'uuid';

interface SupportAndTrainingProps {
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
}

// --- Reusable Modal ---
const Modal: React.FC<{ title: string; onClose: () => void; children: React.ReactNode; }> = ({ title, onClose, children }) => (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
        <div className="bg-white rounded-lg p-6 w-full max-w-xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-4 flex-shrink-0">
                <h3 className="text-lg font-bold">{title}</h3>
                <button onClick={onClose} className="text-2xl font-semibold">&times;</button>
            </div>
            {children}
        </div>
    </div>
);


// --- Ticket View ---
const statusClasses: Record<SupportTicket['status'], string> = {
    'Aberto': 'bg-red-100 text-red-800',
    'Em Andamento': 'bg-yellow-100 text-yellow-800',
    'Fechado': 'bg-green-100 text-green-800',
};

const TicketsView: React.FC<Pick<SupportAndTrainingProps, 'appState' | 'setAppState'>> = ({ appState, setAppState }) => {
    const handleTicketStatusChange = (ticketId: string, status: SupportTicket['status']) => {
        setAppState(prev => ({
            ...prev,
            supportTickets: prev.supportTickets.map(t => t.id === ticketId ? { ...t, status } : t)
        }));
    };
    
    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold mb-4">Central de Tickets de Suporte</h3>
             <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-xs uppercase">
                        <tr>
                            <th className="p-3 text-left">ID</th>
                            <th className="p-3 text-left">Assunto</th>
                            <th className="p-3 text-left">Usuário</th>
                            <th className="p-3 text-left">Data</th>
                            <th className="p-3 text-left">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(appState.supportTickets || []).map(ticket => (
                            <tr key={ticket.id} className="border-t hover:bg-gray-50">
                                <td className="p-3 font-mono">{ticket.id}</td>
                                <td className="p-3 font-semibold">{ticket.subject}</td>
                                <td className="p-3">{ticket.user}</td>
                                <td className="p-3">{new Date(ticket.createdAt).toLocaleDateString()}</td>
                                <td className="p-3">
                                    <select 
                                        value={ticket.status} 
                                        onChange={(e) => handleTicketStatusChange(ticket.id, e.target.value as SupportTicket['status'])}
                                        className={`px-2 py-1 text-xs font-semibold rounded-full border-0 focus:ring-2 focus:ring-blue-400 appearance-none ${statusClasses[ticket.status]}`}
                                    >
                                        <option value="Aberto">Aberto</option>
                                        <option value="Em Andamento">Em Andamento</option>
                                        <option value="Fechado">Fechado</option>
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// --- FAQ View & Modal ---
const FaqView: React.FC<{ faqs: FAQ[]; onEdit: (faq: FAQ) => void; onDelete: (id: string) => void; onNew: (category?: string) => void; }> = ({ faqs, onEdit, onDelete, onNew }) => {
    const faqsByCategory = useMemo(() => {
        return (faqs || []).reduce((acc, faq) => {
            const category = faq.category;
            if (!acc[category]) acc[category] = [];
            acc[category].push(faq);
            return acc;
        }, {} as Record<string, FAQ[]>);
    }, [faqs]);

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Base de Conhecimento (FAQ)</h3>
                <button onClick={() => onNew()} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2">
                    <PlusIcon className="h-5 w-5"/> Adicionar Pergunta
                </button>
            </div>
            <div className="space-y-6">
                {Object.keys(faqsByCategory).length > 0 ? Object.keys(faqsByCategory).map((category) => {
                    const categoryFaqs = faqsByCategory[category];
                    return (
                    <div key={category}>
                        <h4 className="font-bold text-lg mb-2 text-gray-700">{category}</h4>
                        <div className="space-y-2">
                            {categoryFaqs.map(faq => (
                                <details key={faq.id} className="bg-gray-50 rounded-lg p-3 group">
                                    <summary className="font-semibold cursor-pointer flex justify-between items-center">
                                        {faq.question}
                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={(e) => {e.preventDefault(); onEdit(faq);}} className="p-1 text-blue-600 hover:bg-blue-100 rounded-full"><PencilIcon className="h-4 w-4"/></button>
                                            <button onClick={(e) => {e.preventDefault(); onDelete(faq.id);}} className="p-1 text-red-500 hover:bg-red-100 rounded-full"><TrashIcon className="h-4 w-4"/></button>
                                        </div>
                                    </summary>
                                    <p className="text-sm text-gray-600 mt-2 pt-2 border-t">{faq.answer}</p>
                                </details>
                            ))}
                        </div>
                    </div>
                )}) : <p className="text-center text-gray-500 py-8">Nenhuma pergunta frequente cadastrada.</p>}
            </div>
        </div>
    );
};

const FaqModal: React.FC<{ faq: Partial<FAQ> | null; onSave: (faq: FAQ) => void; onClose: () => void; }> = ({ faq, onSave, onClose }) => {
    const [formData, setFormData] = useState<Partial<FAQ>>(faq || { category: 'Geral' });
    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ id: formData.id || uuidv4(), question: formData.question || '', answer: formData.answer || '', category: formData.category || 'Geral' });
    };
    return (
         <Modal title={faq?.id ? 'Editar Pergunta' : 'Nova Pergunta'} onClose={onClose}>
            <form onSubmit={handleSave} className="space-y-4 flex flex-col flex-grow">
                <div className="flex-grow space-y-4">
                    <input value={formData.question || ''} onChange={e => setFormData(p => ({...p, question: e.target.value}))} placeholder="Pergunta" className="w-full p-2 border rounded" required />
                    <textarea value={formData.answer || ''} onChange={e => setFormData(p => ({...p, answer: e.target.value}))} placeholder="Resposta" className="w-full p-2 border rounded h-24" required />
                    <input value={formData.category || ''} onChange={e => setFormData(p => ({...p, category: e.target.value}))} placeholder="Categoria" className="w-full p-2 border rounded" required />
                </div>
                <div className="flex justify-end gap-2 border-t pt-4"><button type="button" onClick={onClose} className="bg-gray-200 py-2 px-4 rounded-lg">Cancelar</button><button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded-lg">Salvar</button></div>
            </form>
        </Modal>
    );
};

// --- Training View & Modal ---
const TrainingView: React.FC<{ modules: TrainingModule[]; onNew: () => void; onEdit: (module: TrainingModule) => void; onDelete: (id: string) => void; }> = ({ modules, onNew, onEdit, onDelete }) => (
     <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Plataforma de Treinamento Interno</h3>
            <button onClick={onNew} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2">
                <PlusIcon className="h-5 w-5"/> Adicionar Módulo
            </button>
        </div>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
             {(modules || []).map(module => (
                 <div key={module.id} className="border rounded-lg p-4 group relative">
                     <h4 className="font-bold text-gray-800">{module.title}</h4>
                     <p className="text-sm text-blue-600 font-semibold">{module.category}</p>
                     <p className="text-xs text-gray-500 mt-2">{module.duration} minutos</p>
                      <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => onEdit(module)} className="p-1 text-blue-600 hover:bg-blue-100 rounded-full"><PencilIcon className="h-4 w-4"/></button>
                        <button onClick={() => onDelete(module.id)} className="p-1 text-red-500 hover:bg-red-100 rounded-full"><TrashIcon className="h-4 w-4"/></button>
                    </div>
                 </div>
             ))}
             {(modules || []).length === 0 && <p className="text-center text-gray-500 py-8 col-span-full">Nenhum módulo de treinamento cadastrado.</p>}
         </div>
    </div>
);

const TrainingModal: React.FC<{ module: TrainingModule | null; onSave: (module: TrainingModule) => void; onClose: () => void; }> = ({ module, onSave, onClose }) => {
    const [formData, setFormData] = useState<TrainingModule>(module || { id: uuidv4(), title: '', category: '', duration: 30 });
     const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };
    return (
        <Modal title={module ? 'Editar Módulo' : 'Novo Módulo'} onClose={onClose}>
            <form onSubmit={handleSave} className="space-y-4 flex flex-col flex-grow">
                <div className="flex-grow space-y-4">
                    <input value={formData.title} onChange={e => setFormData(p => ({...p, title: e.target.value}))} placeholder="Título do Módulo" className="w-full p-2 border rounded" required />
                    <input value={formData.category} onChange={e => setFormData(p => ({...p, category: e.target.value}))} placeholder="Categoria" className="w-full p-2 border rounded" required />
                    <input type="number" value={formData.duration} onChange={e => setFormData(p => ({...p, duration: Number(e.target.value)}))} placeholder="Duração (minutos)" className="w-full p-2 border rounded" required />
                </div>
                <div className="flex justify-end gap-2 border-t pt-4"><button type="button" onClick={onClose} className="bg-gray-200 py-2 px-4 rounded-lg">Cancelar</button><button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded-lg">Salvar</button></div>
            </form>
        </Modal>
    );
};

// --- Main Component ---
const SupportAndTraining: React.FC<SupportAndTrainingProps> = ({ appState, setAppState }) => {
    const [activeTab, setActiveTab] = useState('tickets');
    const [modal, setModal] = useState<{type: 'faq' | 'training' | null, data?: FAQ | TrainingModule | Partial<FAQ>}>({type: null});

    const handleSaveFaq = (faq: FAQ) => {
        setAppState(prev => {
            const exists = prev.faqs.some(f => f.id === faq.id);
            const newFaqs = exists ? prev.faqs.map(f => f.id === faq.id ? faq : f) : [...prev.faqs, faq];
            return { ...prev, faqs: newFaqs };
        });
        setModal({type: null});
    };
    const handleDeleteFaq = (id: string) => {
        if (window.confirm("Tem certeza que deseja excluir esta pergunta?")) {
            setAppState(prev => ({ ...prev, faqs: prev.faqs.filter(f => f.id !== id) }));
        }
    };
    
    const handleSaveModule = (module: TrainingModule) => {
        setAppState(prev => {
            const exists = (prev.trainingModules || []).some(m => m.id === module.id);
            const newModules = exists ? (prev.trainingModules || []).map(m => m.id === module.id ? module : m) : [...(prev.trainingModules || []), module];
            return { ...prev, trainingModules: newModules };
        });
        setModal({type: null});
    };
    const handleDeleteModule = (id: string) => {
        if (window.confirm("Tem certeza que deseja excluir este módulo?")) {
            setAppState(prev => ({...prev, trainingModules: (prev.trainingModules || []).filter(m => m.id !== id)}));
        }
    };

    const tabs = [
        { id: 'tickets', label: 'Tickets de Suporte', icon: LifebuoyIcon },
        { id: 'faq', label: 'FAQ', icon: BookOpenIcon },
        { id: 'training', label: 'Treinamentos', icon: AcademicCapIcon },
    ];
    
    const renderContent = () => {
        switch(activeTab) {
            case 'tickets': return <TicketsView appState={appState} setAppState={setAppState} />;
            case 'faq': return <FaqView faqs={appState.faqs} onEdit={(faq) => setModal({type: 'faq', data: faq})} onDelete={handleDeleteFaq} onNew={(category) => setModal({type: 'faq', data: {category: category || 'Geral'}})} />;
            case 'training': return <TrainingView modules={appState.trainingModules} onNew={() => setModal({type: 'training'})} onEdit={(module) => setModal({type: 'training', data: module})} onDelete={handleDeleteModule} />;
            default: return null;
        }
    }

    return (
        <div className="space-y-6">
            {modal.type === 'faq' && <FaqModal faq={modal.data || null} onClose={() => setModal({type: null})} onSave={handleSaveFaq} />}
            {modal.type === 'training' && <TrainingModal module={modal.data as TrainingModule | null} onClose={() => setModal({type: null})} onSave={handleSaveModule} />}
            
            <h2 className="text-3xl font-bold text-gray-800">Suporte 360° e Treinamento</h2>

            <div className="bg-white rounded-lg shadow-sm p-2">
                <nav className="flex space-x-2 overflow-x-auto pb-2">
                    {tabs.map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-shrink-0 flex items-center px-4 py-2 rounded-md text-sm font-medium ${activeTab === tab.id ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                            <tab.icon className="h-5 w-5 mr-2" />
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>
            
            <div>{renderContent()}</div>
        </div>
    );
};

export default SupportAndTraining;
import React, { useState } from 'react';
import { AppState, EmployeeSurvey, OnboardingTask, Benefit, PDI, PDIGoal, TeamMember } from '../types.ts';
import { UserIcon, BookOpenIcon, StarIcon, PlusIcon, PencilIcon, TrashIcon } from './Icons.tsx';
import { v4 as uuidv4 } from 'uuid';

interface EmployeeExperienceProps {
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
}

// --- Generic Modal ---
const Modal: React.FC<{ title: string; onClose: () => void; children: React.ReactNode; }> = ({ title, onClose, children }) => (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
        <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-4"><h3 className="text-lg font-bold">{title}</h3><button onClick={onClose} className="text-2xl">&times;</button></div>
            {children}
        </div>
    </div>
);

// --- Surveys ---
const SurveyModal: React.FC<{ onSave: (title: string) => void; onClose: () => void; }> = ({ onSave, onClose }) => {
    const [title, setTitle] = useState('');
    return <Modal title="Criar Nova Pesquisa" onClose={onClose}><input value={title} onChange={e => setTitle(e.target.value)} placeholder="Título da Pesquisa (Ex: Pesquisa de Clima Q4)" className="w-full p-2 border rounded" /><div className="flex justify-end gap-2 mt-4"><button onClick={() => { if(title.trim()) onSave(title.trim()); }} className="bg-blue-600 text-white py-2 px-4 rounded-lg">Criar e Ativar</button></div></Modal>;
};

// --- Onboarding ---
const OnboardingTaskModal: React.FC<{ task: OnboardingTask | null; onSave: (task: OnboardingTask) => void; onClose: () => void; }> = ({ task, onSave, onClose }) => {
    const [formData, setFormData] = useState(task || { id: uuidv4(), title: '', description: '', status: 'Pendente' as const });
    return <Modal title={task ? 'Editar Tarefa' : 'Nova Tarefa de Onboarding'} onClose={onClose}><form onSubmit={e => { e.preventDefault(); onSave(formData); }} className="space-y-4"><input value={formData.title} onChange={e => setFormData(p => ({...p, title: e.target.value}))} placeholder="Título da Tarefa" className="w-full p-2 border rounded" required /><textarea value={formData.description} onChange={e => setFormData(p => ({...p, description: e.target.value}))} placeholder="Descrição" className="w-full p-2 border rounded h-20" /><div className="flex justify-end gap-2"><button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded-lg">Salvar</button></div></form></Modal>;
};

// --- Benefits ---
const BenefitModal: React.FC<{ benefit: Benefit | null; onSave: (benefit: Benefit) => void; onClose: () => void; }> = ({ benefit, onSave, onClose }) => {
    const [formData, setFormData] = useState(benefit || { id: uuidv4(), name: '', description: '' });
    return <Modal title={benefit ? 'Editar Benefício' : 'Novo Benefício'} onClose={onClose}><form onSubmit={e => { e.preventDefault(); onSave(formData); }} className="space-y-4"><input value={formData.name} onChange={e => setFormData(p => ({...p, name: e.target.value}))} placeholder="Nome do Benefício" className="w-full p-2 border rounded" required /><textarea value={formData.description} onChange={e => setFormData(p => ({...p, description: e.target.value}))} placeholder="Descrição" className="w-full p-2 border rounded h-20" /><div className="flex justify-end gap-2"><button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded-lg">Salvar</button></div></form></Modal>;
};

// --- PDI ---
const PDIGoalModal: React.FC<{ goal: PDIGoal | null; onSave: (goal: PDIGoal) => void; onClose: () => void; }> = ({ goal, onSave, onClose }) => {
    const [formData, setFormData] = useState(goal || { id: uuidv4(), description: '', status: 'A Fazer' as const, targetDate: '' });
    return <Modal title={goal ? 'Editar Meta' : 'Nova Meta de PDI'} onClose={onClose}><form onSubmit={e => { e.preventDefault(); onSave(formData); }} className="space-y-4"><textarea value={formData.description} onChange={e => setFormData(p => ({...p, description: e.target.value}))} placeholder="Descrição da meta" className="w-full p-2 border rounded h-20" /><input type="date" value={formData.targetDate} onChange={e => setFormData(p => ({...p, targetDate: e.target.value}))} className="w-full p-2 border rounded" /><select value={formData.status} onChange={e => setFormData(p => ({...p, status: e.target.value as any}))} className="w-full p-2 border rounded bg-white"><option>A Fazer</option><option>Em Progresso</option><option>Concluído</option></select><div className="flex justify-end gap-2"><button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded-lg">Salvar Meta</button></div></form></Modal>;
};


const EmployeeExperience: React.FC<EmployeeExperienceProps> = ({ appState, setAppState }) => {
    const [activeTab, setActiveTab] = useState('surveys');
    const [modal, setModal] = useState<{ type: string | null, data?: any }>({ type: null });

    const handleSave = <T extends { id: string }>(item: T, collection: keyof AppState) => {
        setAppState(prev => {
            const items = prev[collection] as T[];
            const exists = items.some(i => i.id === item.id);
            const newItems = exists ? items.map(i => i.id === item.id ? item : i) : [item, ...items];
            return { ...prev, [collection]: newItems };
        });
        setModal({ type: null });
    };

    const handleDelete = (id: string, collection: keyof AppState) => {
        if (window.confirm("Tem certeza?")) {
            setAppState(prev => ({...prev, [collection]: (prev[collection] as {id:string}[]).filter(i => i.id !== id) }));
        }
    };
    
    // PDI Specific Handlers
    const handleSavePdiGoal = (pdiId: string, goal: PDIGoal) => {
        setAppState(prev => ({
            ...prev,
            pdIs: prev.pdIs.map(pdi => pdi.id === pdiId ? {
                ...pdi,
                goals: pdi.goals.some(g => g.id === goal.id) ? pdi.goals.map(g => g.id === goal.id ? goal : g) : [...pdi.goals, goal]
            } : pdi)
        }));
        setModal({ type: null });
    };
    
    const handleDeletePdiGoal = (pdiId: string, goalId: string) => {
         if (window.confirm("Tem certeza?")) {
            setAppState(prev => ({
                ...prev,
                pdIs: prev.pdIs.map(pdi => pdi.id === pdiId ? { ...pdi, goals: pdi.goals.filter(g => g.id !== goalId) } : pdi)
            }));
        }
    };

    const tabs = [
        { id: 'surveys', label: 'Pesquisas de Clima' },
        { id: 'onboarding', label: 'Onboarding de Talentos' },
        { id: 'benefits', label: 'Gestão de Benefícios' },
        { id: 'development', label: 'Desenvolvimento e PDI' },
    ];

    const renderTabContent = () => {
        switch(activeTab) {
            case 'surveys': return <SurveysView surveys={appState.employeeSurveys} onNew={() => setModal({type: 'survey'})} />;
            case 'onboarding': return <OnboardingView tasks={appState.onboardingTasks} onNew={() => setModal({type: 'onboardingTask'})} onEdit={(task) => setModal({type: 'onboardingTask', data: task})} onDelete={(id) => handleDelete(id, 'onboardingTasks')} onToggleStatus={(id) => setAppState(prev => ({...prev, onboardingTasks: prev.onboardingTasks.map(t => t.id === id ? {...t, status: t.status === 'Pendente' ? 'Concluído' : 'Pendente'} : t)}))} />;
            case 'benefits': return <BenefitsView benefits={appState.benefits} onNew={() => setModal({type: 'benefit'})} onEdit={(benefit) => setModal({type: 'benefit', data: benefit})} onDelete={(id) => handleDelete(id, 'benefits')} />;
            case 'development': return <DevelopmentView team={appState.teamMembers} pdIs={appState.pdIs} onNewGoal={(pdi) => setModal({type: 'pdiGoal', data: {pdi}})} onEditGoal={(pdi, goal) => setModal({type: 'pdiGoal', data: {pdi, goal}})} onDeleteGoal={handleDeletePdiGoal} onSavePDI={(pdi) => handleSave(pdi, 'pdIs')} onGoalStatusChange={(pdiId, goalId, status) => setAppState(p => ({...p, pdIs: p.pdIs.map(pdi => pdi.id === pdiId ? {...pdi, goals: pdi.goals.map(g => g.id === goalId ? {...g, status} : g)} : pdi) }))} />;
            default: return null;
        }
    };
    
    return (
        <div className="space-y-6">
            {modal.type === 'survey' && <SurveyModal onClose={() => setModal({type: null})} onSave={(title) => handleSave({id: uuidv4(), title, status: 'Aberto', participationRate: 0, satisfactionScore: 0}, 'employeeSurveys')} />}
            {modal.type === 'onboardingTask' && <OnboardingTaskModal task={modal.data} onClose={() => setModal({type: null})} onSave={(item) => handleSave(item, 'onboardingTasks')} />}
            {modal.type === 'benefit' && <BenefitModal benefit={modal.data} onClose={() => setModal({type: null})} onSave={(item) => handleSave(item, 'benefits')} />}
            {modal.type === 'pdiGoal' && <PDIGoalModal goal={modal.data.goal} onClose={() => setModal({type: null})} onSave={(item) => handleSavePdiGoal(modal.data.pdi.id, item)} />}
            
            <h2 className="text-3xl font-bold text-gray-800">Recursos Humanos: Experiência do Colaborador</h2>
            <div className="bg-white rounded-lg shadow-sm p-2"><nav className="flex space-x-2">{tabs.map(tab => <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-4 py-2 rounded-md text-sm font-medium ${activeTab === tab.id ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}`}>{tab.label}</button>)}</nav></div>
            <div>{renderTabContent()}</div>
        </div>
    );
};

const SurveysView: React.FC<{surveys: EmployeeSurvey[], onNew: () => void}> = ({surveys, onNew}) => (
    <div className="space-y-6"><div className="text-right"><button onClick={onNew} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 ml-auto"><PlusIcon className="h-5 w-5"/> Nova Pesquisa</button></div>{surveys.map(s => <div key={s.id} className="bg-white p-6 rounded-lg shadow-md"><div className="flex justify-between items-start"><div><h3 className="text-xl font-bold">{s.title}</h3><span className={`text-xs font-bold px-2 py-1 rounded-full ${s.status === 'Aberto' ? 'bg-green-100 text-green-800' : 'bg-gray-200'}`}>{s.status}</span></div></div><div className="grid grid-cols-2 gap-6 mt-6"><div className="p-4 bg-gray-50 rounded-lg text-center"><p className="text-sm">Participação</p><p className="text-4xl font-bold text-blue-600">{s.participationRate}%</p></div><div className="p-4 bg-gray-50 rounded-lg text-center"><p className="text-sm">Satisfação (eNPS)</p><p className="text-4xl font-bold text-green-600">{s.satisfactionScore.toFixed(1)}<span className="text-lg">/10</span></p></div></div></div>)}</div>
);
const OnboardingView: React.FC<{tasks: OnboardingTask[], onNew: () => void, onEdit: (t: OnboardingTask) => void, onDelete: (id: string) => void, onToggleStatus: (id: string) => void}> = ({tasks, onNew, onEdit, onDelete, onToggleStatus}) => (
    <div className="bg-white p-6 rounded-lg shadow-md"><div className="flex justify-between items-center mb-4"><h3 className="text-xl font-bold">Jornada de Onboarding</h3><button onClick={onNew} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2"><PlusIcon className="h-5 w-5"/>Nova Tarefa</button></div><ul className="space-y-2">{tasks.map(t => <li key={t.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg group"><input type="checkbox" className="h-5 w-5" checked={t.status==='Concluído'} onChange={() => onToggleStatus(t.id)} /><div><p className={`font-semibold ${t.status==='Concluído' && 'line-through text-gray-500'}`}>{t.title}</p><p className="text-xs text-gray-500">{t.description}</p></div><div className="ml-auto flex gap-1 opacity-0 group-hover:opacity-100"><button onClick={() => onEdit(t)} className="p-1 text-blue-600"><PencilIcon className="h-4 w-4"/></button><button onClick={() => onDelete(t.id)} className="p-1 text-red-500"><TrashIcon className="h-4 w-4"/></button></div></li>)}</ul></div>
);
const BenefitsView: React.FC<{benefits: Benefit[], onNew: () => void, onEdit: (b: Benefit) => void, onDelete: (id: string) => void}> = ({benefits, onNew, onEdit, onDelete}) => (
    <div className="bg-white p-6 rounded-lg shadow-md"><div className="flex justify-between items-center mb-4"><h3 className="text-xl font-bold">Clube de Benefícios</h3><button onClick={onNew} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2"><PlusIcon className="h-5 w-5"/>Novo Benefício</button></div><div className="grid grid-cols-2 gap-4">{benefits.map(b => <div key={b.id} className="p-4 border rounded-lg group"><div className="flex justify-between items-start"><h4 className="font-bold text-lg">{b.name}</h4><div className="flex gap-1 opacity-0 group-hover:opacity-100"><button onClick={() => onEdit(b)} className="p-1 text-blue-600"><PencilIcon className="h-4 w-4"/></button><button onClick={() => onDelete(b.id)} className="p-1 text-red-500"><TrashIcon className="h-4 w-4"/></button></div></div><p className="text-sm text-gray-600">{b.description}</p></div>)}</div></div>
);
const DevelopmentView: React.FC<{team: TeamMember[], pdIs: PDI[], onNewGoal:(pdi: PDI)=>void, onEditGoal:(pdi:PDI, goal:PDIGoal)=>void, onDeleteGoal:(pdiId:string, goalId:string)=>void, onSavePDI:(pdi:PDI)=>void, onGoalStatusChange: (pdiId: string, goalId: string, status: PDIGoal['status']) => void}> = ({team, pdIs, onNewGoal, onEditGoal, onDeleteGoal, onSavePDI, onGoalStatusChange}) => {
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>(team[0]?.id || '');
    const selectedPDI = pdIs.find(p => p.employeeId === selectedEmployeeId);
    const goalStatuses: PDIGoal['status'][] = ['A Fazer', 'Em Progresso', 'Concluído'];
    const handleCreatePDI = () => {
        const employee = team.find(t => t.id === selectedEmployeeId);
        if(!employee) return;
        onSavePDI({id: uuidv4(), employeeId: selectedEmployeeId, employeeName: employee.name, goals: [], status: 'Ativo' });
    };
    return (
        <div className="bg-white p-6 rounded-lg shadow-md"><h3 className="text-xl font-bold mb-4">Plano de Desenvolvimento Individual (PDI)</h3><select value={selectedEmployeeId} onChange={e => setSelectedEmployeeId(e.target.value)} className="w-full max-w-sm p-2 border rounded-md bg-white mb-4"><option value="">Selecione um colaborador</option>{team.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select>
        {selectedEmployeeId ? (selectedPDI ? <div className="space-y-4"><div className="flex justify-between items-center"><h4 className="font-semibold">Metas para {selectedPDI.employeeName}</h4><button onClick={() => onNewGoal(selectedPDI)} className="bg-blue-600 text-white font-bold text-sm py-1 px-3 rounded-lg flex items-center gap-1"><PlusIcon className="h-4 w-4"/>Nova Meta</button></div>{selectedPDI.goals.map(g => <div key={g.id} className="p-3 bg-gray-50 rounded-lg group"><div className="flex justify-between"><p className="text-sm">{g.description}</p><div className="flex gap-1 opacity-0 group-hover:opacity-100"><button onClick={() => onEditGoal(selectedPDI, g)} className="p-1 text-blue-600"><PencilIcon className="h-4 w-4"/></button><button onClick={() => onDeleteGoal(selectedPDI.id, g.id)} className="p-1 text-red-500"><TrashIcon className="h-4 w-4"/></button></div></div><div className="flex items-center gap-4 mt-2"><p className="text-xs">Prazo: {g.targetDate}</p><select value={g.status} onChange={e => onGoalStatusChange(selectedPDI.id, g.id, e.target.value as any)} className="text-xs p-1 rounded-md border">{goalStatuses.map(s=><option key={s}>{s}</option>)}</select></div></div>)}</div> : <div className="text-center p-8"><button onClick={handleCreatePDI} className="bg-green-600 text-white font-bold py-3 px-6 rounded-lg">Criar PDI para este colaborador</button></div>) : <div className="text-center p-8 text-gray-500">Selecione um colaborador para ver seu PDI.</div>}
        </div>
    );
};

export default EmployeeExperience;
import React, { useState } from 'react';
import { AppState, ABTest, EmployeeIdea, StartupPartnership, TrendReport, Patent } from '../types.ts';
import { LightBulbIcon, PlusIcon, PencilIcon, TrashIcon, SparklesIcon, ArrowUpIcon } from './Icons.tsx';
import { v4 as uuidv4 } from 'uuid';
import { GoogleGenAI, Type } from "@google/genai";

interface RDManagementProps {
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
}

const RDManagement: React.FC<RDManagementProps> = ({ appState, setAppState }) => {
    const [activeTab, setActiveTab] = useState('ab_testing');

    // Modal states
    const [isTestModalOpen, setTestModalOpen] = useState(false);
    const [editingTest, setEditingTest] = useState<ABTest | null>(null);
    const [isIdeaModalOpen, setIdeaModalOpen] = useState(false);
    const [isStartupModalOpen, setStartupModalOpen] = useState(false);
    const [editingStartup, setEditingStartup] = useState<StartupPartnership | null>(null);
    const [isPatentModalOpen, setPatentModalOpen] = useState(false);
    const [editingPatent, setEditingPatent] = useState<Patent | null>(null);

    // AI states
    const [trendTopic, setTrendTopic] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    const tabs = [
        { id: 'ab_testing', label: 'Testes A/B' },
        { id: 'ideas', label: 'Banco de Ideias' },
        { id: 'partnerships', label: 'Parcerias com Startups' },
        { id: 'trends', label: 'Monitor de Tendências' },
        { id: 'patents', label: 'Gestão de Patentes' },
    ];
    
    // Handlers
    const handleSave = <T extends {id: string}>(item: T, collection: keyof AppState, callback?: () => void) => {
        setAppState(prev => {
            const items = prev[collection] as T[];
            const exists = items.some(i => i.id === item.id);
            const newItems = exists ? items.map(i => i.id === item.id ? item : i) : [item, ...items];
            return { ...prev, [collection]: newItems };
        });
        callback?.();
    };

    const handleDelete = (id: string, collection: keyof AppState) => {
        if (window.confirm("Tem certeza que deseja excluir este item?")) {
            setAppState(prev => ({
                ...prev,
                [collection]: (prev[collection] as {id: string}[]).filter(i => i.id !== id)
            }));
        }
    };
    
    const handleGenerateTrend = async () => {
        if (!trendTopic) return;
        setIsGenerating(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `Como um analista de tendências de mercado, gere um relatório conciso, baseado nas informações e dados mais recentes disponíveis hoje, sobre "${trendTopic}" para um e-commerce de varejo. Forneça um título para o relatório e um resumo (summary) de 2-3 frases sobre a oportunidade.`;
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            title: { type: Type.STRING },
                            summary: { type: Type.STRING }
                        },
                        required: ['title', 'summary']
                    }
                }
            });
            const result = JSON.parse(response.text);

            if (result.title && result.summary) {
                const newReport: TrendReport = {
                    id: uuidv4(),
                    title: result.title,
                    summary: result.summary,
                    source: 'IA - Gemini',
                };
                handleSave(newReport, 'trendReports');
                setTrendTopic('');
            } else {
                alert("A IA não retornou um formato esperado. Tente novamente.");
            }
        } catch (error) {
            console.error("AI Error:", error);
            alert("Falha ao gerar relatório com a IA.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleVote = (ideaId: string) => {
        setAppState(prev => ({
            ...prev,
            employeeIdeas: prev.employeeIdeas.map(idea => idea.id === ideaId ? {...idea, votes: idea.votes + 1} : idea)
        }));
    };

    const renderTabContent = () => {
        // ... (Modal and View components will be defined below)
        switch(activeTab) {
            case 'ab_testing': return <ABTestingView tests={appState.abTests} onEdit={(test) => { setEditingTest(test); setTestModalOpen(true); }} onNew={() => { setEditingTest(null); setTestModalOpen(true); }} onDelete={(id) => handleDelete(id, 'abTests')} />;
            case 'ideas': return <IdeasView ideas={appState.employeeIdeas} onNew={() => setIdeaModalOpen(true)} onVote={handleVote} onStatusChange={(id, status) => handleSave({ ...appState.employeeIdeas.find(i=>i.id===id)!, status }, 'employeeIdeas')} />;
            case 'partnerships': return <PartnershipsView partnerships={appState.startupPartnerships} onEdit={(p) => { setEditingStartup(p); setStartupModalOpen(true); }} onNew={() => { setEditingStartup(null); setStartupModalOpen(true); }} onDelete={(id) => handleDelete(id, 'startupPartnerships')} />;
            case 'trends': return <TrendsView reports={appState.trendReports} onGenerate={handleGenerateTrend} topic={trendTopic} setTopic={setTrendTopic} isGenerating={isGenerating} onDelete={(id) => handleDelete(id, 'trendReports')} />;
            case 'patents': return <PatentsView patents={appState.patents} onEdit={(p) => { setEditingPatent(p); setPatentModalOpen(true); }} onNew={() => { setEditingPatent(null); setPatentModalOpen(true); }} onDelete={(id) => handleDelete(id, 'patents')} />;
            default: return null;
        }
    };
    
    return (
        <div className="space-y-6">
            {isTestModalOpen && <TestModal test={editingTest} onClose={() => setTestModalOpen(false)} onSave={(test) => handleSave(test, 'abTests', () => setTestModalOpen(false))} />}
            {isIdeaModalOpen && <IdeaModal onClose={() => setIdeaModalOpen(false)} onSave={(idea) => handleSave(idea, 'employeeIdeas', () => setIdeaModalOpen(false))} />}
            {isStartupModalOpen && <StartupModal startup={editingStartup} onClose={() => setStartupModalOpen(false)} onSave={(startup) => handleSave(startup, 'startupPartnerships', () => setStartupModalOpen(false))} />}
            {isPatentModalOpen && <PatentModal patent={editingPatent} onClose={() => setPatentModalOpen(false)} onSave={(patent) => handleSave(patent, 'patents', () => setPatentModalOpen(false))} />}
            
            <h2 className="text-3xl font-bold text-gray-800">Gestão de Inovações e P&D</h2>
            <div className="bg-white rounded-lg shadow-sm p-2">
                <nav className="flex space-x-2 overflow-x-auto">
                    {tabs.map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-shrink-0 flex items-center px-4 py-2 rounded-md text-sm font-medium ${activeTab === tab.id ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                           <LightBulbIcon className="h-5 w-5 mr-2" /> {tab.label}
                        </button>
                    ))}
                </nav>
            </div>
            <div>{renderTabContent()}</div>
        </div>
    );
};

// --- View Components ---

const ABTestingView: React.FC<{tests: ABTest[], onNew: () => void, onEdit: (t: ABTest) => void, onDelete: (id: string) => void}> = ({tests, onNew, onEdit, onDelete}) => {
    const testStatusClasses = {'Em Andamento': 'bg-blue-100 text-blue-800', 'Concluído': 'bg-green-100 text-green-800'};
    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4"><h3 className="text-xl font-bold">Laboratório de Testes A/B</h3><button onClick={onNew} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2"><PlusIcon className="h-5 w-5"/>Novo Teste</button></div>
            <table className="w-full text-sm">
                <thead className="text-xs uppercase bg-gray-100"><tr><th className="p-3 text-left">Produto/Métrica</th><th className="p-3 text-center">Conv. A</th><th className="p-3 text-center">Conv. B</th><th className="p-3 text-center">Vencedor</th><th className="p-3 text-left">Status</th><th className="p-3 text-right">Ações</th></tr></thead>
                <tbody>{tests.map(test => (<tr key={test.id} className="border-t hover:bg-gray-50"><td className="p-3"><p className="font-medium">{test.productName}</p><p className="text-xs text-gray-500">{test.metric}</p></td><td className="p-3 text-center">{test.variantA_conversion}%</td><td className="p-3 text-center">{test.variantB_conversion}%</td><td className={`p-3 text-center font-bold ${test.winner !== 'Inconclusivo' ? 'text-green-600' : ''}`}>{test.winner}</td><td className="p-3"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${testStatusClasses[test.status]}`}>{test.status}</span></td><td className="p-3 text-right space-x-1"><button onClick={() => onEdit(test)} className="p-1 text-blue-600 hover:bg-blue-100 rounded-full"><PencilIcon className="h-5 w-5"/></button><button onClick={() => onDelete(test.id)} className="p-1 text-red-500 hover:bg-red-100 rounded-full"><TrashIcon className="h-5 w-5"/></button></td></tr>))}</tbody>
            </table>
        </div>
    );
};
const IdeasView: React.FC<{ideas: EmployeeIdea[], onNew: () => void, onVote: (id: string) => void, onStatusChange: (id: string, status: EmployeeIdea['status']) => void}> = ({ideas, onNew, onVote, onStatusChange}) => {
    const ideaStatusClasses = {'Recebida': 'bg-gray-200 text-gray-800', 'Em Análise': 'bg-yellow-100 text-yellow-800', 'Aprovada': 'bg-green-100 text-green-800', 'Rejeitada': 'bg-red-100 text-red-800'};
    const ideaStatuses: EmployeeIdea['status'][] = ['Recebida', 'Em Análise', 'Aprovada', 'Rejeitada'];
    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4"><h3 className="text-xl font-bold">Banco de Ideias</h3><button onClick={onNew} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2"><PlusIcon className="h-5 w-5"/>Enviar Ideia</button></div>
            <div className="space-y-4">{[...ideas].sort((a,b) => b.votes - a.votes).map(idea => (<div key={idea.id} className="p-4 border rounded-lg flex items-center justify-between"><div className="flex items-center gap-4"><button onClick={() => onVote(idea.id)} className="flex flex-col items-center p-2 rounded-lg bg-gray-100 hover:bg-gray-200"><ArrowUpIcon className="h-5 w-5"/><span className="text-sm font-bold">{idea.votes}</span></button><div><p className="font-bold text-gray-800">{idea.title}</p><p className="text-xs text-gray-500">Por: {idea.submittedBy} ({idea.department})</p></div></div><div className="flex items-center gap-4"><select value={idea.status} onChange={(e) => onStatusChange(idea.id, e.target.value as any)} className={`p-1 text-xs font-semibold rounded-full border-0 focus:ring-2 focus:ring-blue-400 ${ideaStatusClasses[idea.status]}`}>{ideaStatuses.map(s => <option key={s} value={s}>{s}</option>)}</select></div></div>))}</div>
        </div>
    );
};
const PartnershipsView: React.FC<{partnerships: StartupPartnership[], onNew: () => void, onEdit: (p: StartupPartnership) => void, onDelete: (id: string) => void}> = ({partnerships, onNew, onEdit, onDelete}) => (
    <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4"><h3 className="text-xl font-bold">Parcerias com Startups</h3><button onClick={onNew} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2"><PlusIcon className="h-5 w-5"/>Registrar</button></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{partnerships.map(p => (<div key={p.id} className="p-4 bg-gray-50 rounded-lg group relative"><div className="absolute top-2 right-2 flex opacity-0 group-hover:opacity-100 transition-opacity"><button onClick={() => onEdit(p)} className="p-1 text-blue-600 hover:bg-blue-100 rounded-full"><PencilIcon className="h-4 w-4"/></button><button onClick={() => onDelete(p.id)} className="p-1 text-red-500 hover:bg-red-100 rounded-full"><TrashIcon className="h-4 w-4"/></button></div><p className="font-bold">{p.startupName}</p><p className="text-sm text-gray-600">Área: {p.area}</p><p className="text-xs font-semibold mt-2 bg-white px-2 py-1 rounded-full inline-block border">{p.status}</p></div>))}</div>
    </div>
);
const TrendsView: React.FC<{reports: TrendReport[], onGenerate: () => void, topic: string, setTopic: (s:string) => void, isGenerating: boolean, onDelete: (id: string) => void}> = ({reports, onGenerate, topic, setTopic, isGenerating, onDelete}) => (
    <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex gap-2 mb-4 p-4 bg-gray-50 rounded-lg border"><input value={topic} onChange={e => setTopic(e.target.value)} placeholder="Tópico de tendência (ex: Consumo sustentável)" className="w-full p-2 border rounded"/><button onClick={onGenerate} disabled={isGenerating || !topic} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 disabled:bg-blue-300 w-52 justify-center"><SparklesIcon className={`h-5 w-5 ${isGenerating ? 'animate-spin' : ''}`}/>{isGenerating ? 'Gerando...' : 'Gerar com IA'}</button></div>
        <div className="space-y-4">{reports.map(report => (<div key={report.id} className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg group relative"><button onClick={() => onDelete(report.id)} className="absolute top-2 right-2 p-1 text-red-500 hover:bg-red-100 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><TrashIcon className="h-4 w-4"/></button><h4 className="font-bold text-blue-800">{report.title}</h4><p className="text-sm text-blue-700 mt-1">{report.summary}</p><p className="text-xs text-gray-500 mt-2">Fonte: {report.source}</p></div>))}</div>
    </div>
);
const PatentsView: React.FC<{patents: Patent[], onNew: () => void, onEdit: (p: Patent) => void, onDelete: (id: string) => void}> = ({patents, onNew, onEdit, onDelete}) => (
    <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4"><h3 className="text-xl font-bold">Gestão de Patentes</h3><button onClick={onNew} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2"><PlusIcon className="h-5 w-5"/>Registrar Patente</button></div>
        <table className="w-full text-sm">
            <thead className="text-xs uppercase bg-gray-100"><tr><th className="p-3 text-left">Nome</th><th className="p-3 text-left">Nº Registro</th><th className="p-3 text-left">Vencimento</th><th className="p-3 text-left">Status</th><th className="p-3 text-right">Ações</th></tr></thead>
            <tbody>{patents.map(p => (<tr key={p.id} className="border-t hover:bg-gray-50"><td className="p-3 font-medium">{p.name}</td><td className="p-3 font-mono">{p.registrationNumber}</td><td className="p-3">{new Date(p.expiryDate  + 'T00:00:00').toLocaleDateString()}</td><td className="p-3 font-semibold">{p.status}</td><td className="p-3 text-right space-x-1"><button onClick={() => onEdit(p)} className="p-1 text-blue-600 hover:bg-blue-100 rounded-full"><PencilIcon className="h-5 w-5"/></button><button onClick={() => onDelete(p.id)} className="p-1 text-red-500 hover:bg-red-100 rounded-full"><TrashIcon className="h-5 w-5"/></button></td></tr>))}</tbody>
        </table>
    </div>
);

// --- Modal Components ---
const Modal: React.FC<{children: React.ReactNode, title: string}> = ({children, title}) => (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
        <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] flex flex-col">
            <h3 className="text-lg font-bold mb-4 flex-shrink-0">{title}</h3>
            {children}
        </div>
    </div>
);
const TestModal: React.FC<{test: ABTest | null, onSave: (t: ABTest) => void, onClose: () => void}> = ({test, onSave, onClose}) => {
    const [data, setData] = useState<ABTest>(test || { id: uuidv4(), productName: '', metric: '', variantA_conversion: 0, variantB_conversion: 0, winner: 'Inconclusivo', status: 'Em Andamento' });
    const handleChange = (e: React.ChangeEvent<HTMLInputElement|HTMLSelectElement>) => setData(p => ({...p, [e.target.name]: e.target.value}));
    return <Modal title={test ? 'Editar Teste' : 'Novo Teste'}><form onSubmit={e => { e.preventDefault(); onSave(data); }} className="space-y-4 flex-grow"><input name="productName" value={data.productName} onChange={handleChange} placeholder="Produto ou Página" className="w-full p-2 border rounded" required/><input name="metric" value={data.metric} onChange={handleChange} placeholder="Métrica Principal (Ex: Taxa de Conversão)" className="w-full p-2 border rounded" required/><select name="status" value={data.status} onChange={handleChange} className="w-full p-2 border rounded bg-white"><option>Em Andamento</option><option>Concluído</option></select><div className="flex justify-end gap-2 pt-4 border-t"><button type="button" onClick={onClose} className="bg-gray-200 py-2 px-4 rounded-lg">Cancelar</button><button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded-lg">Salvar</button></div></form></Modal>;
};
const IdeaModal: React.FC<{onSave: (i: EmployeeIdea) => void, onClose: () => void}> = ({onSave, onClose}) => {
    const [data, setData] = useState({ title: '', submittedBy: '', department: ''});
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setData(p => ({...p, [e.target.name]: e.target.value}));
    const handleSubmit = () => { onSave({id: uuidv4(), ...data, votes: 0, status: 'Recebida'}); onClose(); };
    return <Modal title="Enviar Nova Ideia"><form onSubmit={handleSubmit} className="space-y-4 flex-grow"><input name="title" value={data.title} onChange={handleChange} placeholder="Título da Ideia" className="w-full p-2 border rounded" required/><input name="submittedBy" value={data.submittedBy} onChange={handleChange} placeholder="Seu Nome" className="w-full p-2 border rounded" required/><input name="department" value={data.department} onChange={handleChange} placeholder="Seu Departamento" className="w-full p-2 border rounded" required/><div className="flex justify-end gap-2 pt-4 border-t"><button type="button" onClick={onClose} className="bg-gray-200 py-2 px-4 rounded-lg">Cancelar</button><button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded-lg">Enviar</button></div></form></Modal>;
};
const StartupModal: React.FC<{startup: StartupPartnership | null, onSave: (s: StartupPartnership) => void, onClose: () => void}> = ({startup, onSave, onClose}) => {
    const [data, setData] = useState<StartupPartnership>(startup || { id: uuidv4(), startupName: '', area: '', status: 'Contato Inicial' });
    const handleChange = (e: React.ChangeEvent<HTMLInputElement|HTMLSelectElement>) => setData(p => ({...p, [e.target.name]: e.target.value}));
    return <Modal title={startup ? 'Editar Parceria' : 'Nova Parceria'}><form onSubmit={e => { e.preventDefault(); onSave(data); }} className="space-y-4 flex-grow"><input name="startupName" value={data.startupName} onChange={handleChange} placeholder="Nome da Startup" className="w-full p-2 border rounded" required/><input name="area" value={data.area} onChange={handleChange} placeholder="Área de Atuação" className="w-full p-2 border rounded" required/><select name="status" value={data.status} onChange={handleChange} className="w-full p-2 border rounded bg-white"><option>Contato Inicial</option><option>Piloto</option><option>Integrado</option></select><div className="flex justify-end gap-2 pt-4 border-t"><button type="button" onClick={onClose} className="bg-gray-200 py-2 px-4 rounded-lg">Cancelar</button><button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded-lg">Salvar</button></div></form></Modal>;
};
const PatentModal: React.FC<{patent: Patent | null, onSave: (p: Patent) => void, onClose: () => void}> = ({patent, onSave, onClose}) => {
    const [data, setData] = useState<Patent>(patent || { id: uuidv4(), name: '', registrationNumber: '', status: 'Pendente', expiryDate: '' });
    const handleChange = (e: React.ChangeEvent<HTMLInputElement|HTMLSelectElement>) => setData(p => ({...p, [e.target.name]: e.target.value}));
    return <Modal title={patent ? 'Editar Patente' : 'Nova Patente'}><form onSubmit={e => { e.preventDefault(); onSave(data); }} className="space-y-4 flex-grow"><input name="name" value={data.name} onChange={handleChange} placeholder="Nome/Descrição da Patente" className="w-full p-2 border rounded" required/><input name="registrationNumber" value={data.registrationNumber} onChange={handleChange} placeholder="Número de Registro" className="w-full p-2 border rounded" required/><input name="expiryDate" type="date" value={data.expiryDate} onChange={handleChange} className="w-full p-2 border rounded" required/><select name="status" value={data.status} onChange={handleChange} className="w-full p-2 border rounded bg-white"><option>Pendente</option><option>Ativa</option></select><div className="flex justify-end gap-2 pt-4 border-t"><button type="button" onClick={onClose} className="bg-gray-200 py-2 px-4 rounded-lg">Cancelar</button><button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded-lg">Salvar</button></div></form></Modal>;
};


export default RDManagement;
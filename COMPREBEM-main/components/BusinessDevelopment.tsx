import React, { useState } from 'react';
import { AppState, FranchiseUnit, MarketAnalysis, ExpansionScenario, DueDiligenceReport } from '../types.ts';
import { BuildingStorefrontIcon, SparklesIcon, PlusIcon, PencilIcon, TrashIcon } from './Icons.tsx';
import { GoogleGenAI, Type } from "@google/genai";
import { v4 as uuidv4 } from 'uuid';

interface BusinessDevelopmentProps {
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
}

// --- Modals ---
const FranchiseModal: React.FC<{
    franchise: FranchiseUnit | null;
    onClose: () => void;
    onSave: (franchise: FranchiseUnit) => void;
}> = ({ franchise, onClose, onSave }) => {
    const isNew = franchise === null;
    const [formData, setFormData] = useState<FranchiseUnit>(franchise || {
        id: uuidv4(), name: '', location: '', monthlyRevenue: 0, performance: 0, openingDate: new Date().toISOString().split('T')[0], manager: ''
    });
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(p => ({ ...p, [name]: (name === 'monthlyRevenue' || name === 'performance') ? parseFloat(value) : value }));
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg">
                <h3 className="text-lg font-bold mb-4">{isNew ? 'Adicionar Franquia' : 'Editar Franquia'}</h3>
                <form onSubmit={e => { e.preventDefault(); onSave(formData); onClose(); }} className="space-y-4">
                    <div><label className="text-sm">Nome da Unidade</label><input name="name" value={formData.name} onChange={handleChange} className="w-full p-2 border rounded" required /></div>
                    <div><label className="text-sm">Localização</label><input name="location" value={formData.location} onChange={handleChange} className="w-full p-2 border rounded" required /></div>
                    <div><label className="text-sm">Gerente Responsável</label><input name="manager" value={formData.manager} onChange={handleChange} className="w-full p-2 border rounded" /></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="text-sm">Data de Abertura</label><input name="openingDate" type="date" value={formData.openingDate} onChange={handleChange} className="w-full p-2 border rounded" /></div>
                        <div><label className="text-sm">Receita Mensal (R$)</label><input name="monthlyRevenue" type="number" value={formData.monthlyRevenue} onChange={handleChange} className="w-full p-2 border rounded" /></div>
                    </div>
                    <div><label className="text-sm">Performance da Meta (%)</label><input name="performance" type="number" value={formData.performance} onChange={handleChange} className="w-full p-2 border rounded" /></div>
                    <div className="flex justify-end gap-2 pt-2"><button type="button" onClick={onClose} className="bg-gray-200 py-2 px-4 rounded-lg">Cancelar</button><button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded-lg">Salvar</button></div>
                </form>
            </div>
        </div>
    );
};

// --- Main Component ---
const BusinessDevelopment: React.FC<BusinessDevelopmentProps> = ({ appState, setAppState }) => {
    const [activeTab, setActiveTab] = useState('market_analysis');
    
    // States for AI interactions
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isSimulating, setIsSimulating] = useState(false);
    const [isDiligent, setIsDiligent] = useState(false);
    const [isBenchmarking, setIsBenchmarking] = useState(false);
    const [marketNiche, setMarketNiche] = useState('');
    const [expansionData, setExpansionData] = useState({ location: '', investment: 5000000, type: 'Loja Completa' });
    const [diligenceCompany, setDiligenceCompany] = useState('');
    
    // States for Modals
    const [isFranchiseModalOpen, setIsFranchiseModalOpen] = useState(false);
    const [editingFranchise, setEditingFranchise] = useState<FranchiseUnit | null>(null);

    const tabs = [
        { id: 'market_analysis', label: 'Análise de Mercado' },
        { id: 'expansion', label: 'Simulador de Expansão' },
        { id: 'franchises', label: 'Gestão de Franquias' },
        { id: 'due_diligence', label: 'Due Diligence' },
        { id: 'benchmarking', label: 'Benchmarking' },
    ];
    
    // --- AI Handlers ---
    const handleMarketAnalysis = async () => {
        if (!marketNiche) return;
        setIsAnalyzing(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `Como um consultor de negócios para o Atacadão, analise a oportunidade de mercado para o nicho de "${marketNiche}", baseando-se nos dados e tendências de consumo mais atuais. Forneça um score de oportunidade (0 a 10) e um resumo dos prós e contras.`;
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            score: { type: Type.NUMBER },
                            summary: { type: Type.STRING }
                        },
                        required: ['score', 'summary']
                    }
                }
            });
            const result = JSON.parse(response.text);
            if (result.score !== undefined && result.summary) {
                const newAnalysis: MarketAnalysis = { id: uuidv4(), niche: marketNiche, opportunityScore: result.score, summary: result.summary };
                setAppState(p => ({ ...p, marketAnalyses: [newAnalysis, ...p.marketAnalyses] }));
            }
        } finally { setIsAnalyzing(false); }
    };
    
    const handleExpansionSimulation = async () => {
        if (!expansionData.location) return;
        setIsSimulating(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `Simule o potencial de abrir uma nova loja Atacadão do tipo "${expansionData.type}" em "${expansionData.location}" com um investimento de R$ ${expansionData.investment.toLocaleString()}, considerando o cenário econômico e demográfico atual da região. Forneça um ROI previsto (em porcentagem, apenas o número) e um resumo da oportunidade, incluindo desafios e pontos fortes.`;
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            roi: { type: Type.NUMBER },
                            summary: { type: Type.STRING }
                        },
                        required: ['roi', 'summary']
                    }
                }
            });
            const result = JSON.parse(response.text);
            if (result.roi !== undefined && result.summary) {
                const newScenario: ExpansionScenario = { id: uuidv4(), location: expansionData.location, investment: expansionData.investment, predictedROI: result.roi, summary: result.summary };
                setAppState(p => ({ ...p, expansionScenarios: [newScenario, ...p.expansionScenarios] }));
            }
        } finally { setIsSimulating(false); }
    };

    const handleDueDiligence = async () => {
        if (!diligenceCompany) return;
        setIsDiligent(true);
        try {
             const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `Realize uma análise de due diligence de alto nível, buscando as informações públicas mais recentes, para uma parceria com a empresa "${diligenceCompany}". Forneça um nível de risco (uma das seguintes strings: 'Baixo', 'Médio', 'Alto') e um resumo dos principais pontos de atenção e sinergias.`;
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            risk: { type: Type.STRING },
                            summary: { type: Type.STRING }
                        },
                        required: ['risk', 'summary']
                    }
                }
            });
            const result = JSON.parse(response.text);
             if (result.risk && result.summary) {
                const newReport: DueDiligenceReport = { id: uuidv4(), companyName: diligenceCompany, riskLevel: result.risk as any, summary: result.summary };
                setAppState(p => ({ ...p, dueDiligenceReports: [newReport, ...p.dueDiligenceReports] }));
            }
        } finally { setIsDiligent(false); }
    };
    
    const handleBenchmarkRefresh = () => {
        setIsBenchmarking(true);
        setTimeout(() => { setIsBenchmarking(false); alert("Análise de concorrentes atualizada (simulação).")}, 2000);
    }
    
    // --- CRUD Handlers ---
    const handleSaveFranchise = (franchise: FranchiseUnit) => {
        setAppState(prev => {
            const exists = prev.franchiseUnits.some(f => f.id === franchise.id);
            const newFranchises = exists ? prev.franchiseUnits.map(f => f.id === franchise.id ? franchise : f) : [franchise, ...prev.franchiseUnits];
            return { ...prev, franchiseUnits: newFranchises };
        });
    };
    const handleDeleteFranchise = (id: string) => {
        if(window.confirm('Excluir esta franquia?')) {
            setAppState(prev => ({...prev, franchiseUnits: prev.franchiseUnits.filter(f => f.id !== id)}));
        }
    };

    // --- Render ---
    const riskLevelClasses = { 'Baixo': 'bg-green-100 text-green-800', 'Médio': 'bg-yellow-100 text-yellow-800', 'Alto': 'bg-red-100 text-red-800' };

    const renderTabContent = () => {
        switch(activeTab) {
            case 'market_analysis': return <div className="bg-white p-6 rounded-lg shadow-md"><div className="flex gap-2 mb-4"><input value={marketNiche} onChange={e => setMarketNiche(e.target.value)} placeholder="Ex: Comida vegana congelada" className="w-full p-2 border rounded"/><button onClick={handleMarketAnalysis} disabled={isAnalyzing} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 disabled:bg-blue-300 w-48 justify-center"><SparklesIcon className={`h-5 w-5 ${isAnalyzing ? 'animate-spin' : ''}`}/>{isAnalyzing ? 'Analisando...' : 'Analisar com IA'}</button></div><div>{appState.marketAnalyses.map(a => <div key={a.id} className="p-4 mb-2 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg"><div className="flex justify-between items-start"><h4 className="font-bold text-blue-800">{a.niche}</h4><span className="text-sm font-bold text-blue-600">Score: {a.opportunityScore}/10</span></div><p className="text-sm text-blue-700 mt-1">{a.summary}</p></div>)}</div></div>;
            case 'expansion': return <div className="bg-white p-6 rounded-lg shadow-md"><div className="flex gap-4 mb-4 items-end"><input value={expansionData.location} onChange={e => setExpansionData({...expansionData, location: e.target.value})} placeholder="Localização (Ex: Curitiba, PR)" className="w-full p-2 border rounded"/><input type="number" value={expansionData.investment} onChange={e => setExpansionData({...expansionData, investment: Number(e.target.value)})} className="w-64 p-2 border rounded"/><button onClick={handleExpansionSimulation} disabled={isSimulating} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 disabled:bg-blue-300 w-48 justify-center"><SparklesIcon className={`h-5 w-5 ${isSimulating ? 'animate-spin' : ''}`}/>{isSimulating ? 'Simulando...' : 'Simular com IA'}</button></div><div className="grid grid-cols-1 md:grid-cols-2 gap-4">{appState.expansionScenarios.map(s => <div key={s.id} className="p-4 border rounded-lg"><h4 className="font-bold text-lg text-gray-800">{s.location}</h4><div className="my-2 space-y-1"><p className="text-sm">Investimento: <span className="font-semibold">R$ {s.investment.toLocaleString()}</span></p><p className="text-sm">ROI Previsto (IA): <span className="font-semibold text-green-600">{s.predictedROI}%</span></p></div><p className="text-xs text-gray-600 p-2 bg-gray-50 rounded">{s.summary}</p></div>)}</div></div>;
            case 'franchises': return <div className="bg-white p-6 rounded-lg shadow-md"><div className="flex justify-between items-center mb-4"><h3 className="text-xl font-bold">Unidades Franqueadas</h3><button onClick={() => { setEditingFranchise(null); setIsFranchiseModalOpen(true); }} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2"><PlusIcon className="h-5 w-5"/>Nova Franquia</button></div><table className="w-full text-sm"><thead><tr className="bg-gray-50"><th className="p-2 text-left">Unidade</th><th className="p-2 text-left">Receita (Mês)</th><th className="p-2 text-left">Performance</th><th className="p-2 text-right">Ações</th></tr></thead><tbody>{appState.franchiseUnits.map(u => <tr key={u.id} className="border-t"><td className="p-2"><p className="font-semibold">{u.name}</p><p className="text-xs text-gray-500">{u.location}</p></td><td className="p-2">R$ {u.monthlyRevenue.toLocaleString()}</td><td className="p-2"><div className="w-full bg-gray-200 h-2 rounded"><div className={`h-2 rounded ${u.performance >= 100 ? 'bg-green-500' : 'bg-blue-500'}`} style={{width:`${Math.min(u.performance, 100)}%`}}></div></div><span className="text-xs">{u.performance.toFixed(1)}%</span></td><td className="p-2 text-right space-x-1"><button onClick={() => { setEditingFranchise(u); setIsFranchiseModalOpen(true); }} className="p-1 text-blue-600 hover:bg-blue-100 rounded-full"><PencilIcon className="h-4 w-4"/></button><button onClick={() => handleDeleteFranchise(u.id)} className="p-1 text-red-500 hover:bg-red-100 rounded-full"><TrashIcon className="h-4 w-4"/></button></td></tr>)}</tbody></table></div>;
            case 'due_diligence': return <div className="bg-white p-6 rounded-lg shadow-md"><div className="flex gap-2 mb-4"><input value={diligenceCompany} onChange={e => setDiligenceCompany(e.target.value)} placeholder="Nome da empresa para analisar" className="w-full p-2 border rounded"/><button onClick={handleDueDiligence} disabled={isDiligent} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 disabled:bg-blue-300 w-52 justify-center"><SparklesIcon className={`h-5 w-5 ${isDiligent ? 'animate-spin' : ''}`}/>{isDiligent ? 'Analisando...' : 'Analisar com IA'}</button></div><div className="space-y-3">{appState.dueDiligenceReports.map(r => <div key={r.id} className="p-3 border rounded-lg"><div className="flex justify-between items-center"><p className="font-semibold">{r.companyName}</p><span className={`px-2 py-1 text-xs font-semibold rounded-full ${riskLevelClasses[r.riskLevel]}`}>{r.riskLevel}</span></div><p className="text-sm text-gray-600 mt-2">{r.summary}</p></div>)}</div></div>;
            case 'benchmarking': return <div className="bg-white p-6 rounded-lg shadow-md"><div className="flex justify-between items-center mb-4"><h3 className="text-xl font-bold">Benchmarking de Concorrentes</h3><button onClick={handleBenchmarkRefresh} disabled={isBenchmarking} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 disabled:bg-blue-300"><SparklesIcon className={`h-5 w-5 ${isBenchmarking ? 'animate-spin' : ''}`}/>{isBenchmarking ? 'Atualizando...' : 'Atualizar Análise'}</button></div><p className="text-center text-gray-500 py-8">Análise de concorrentes em desenvolvimento.</p></div>;
            default: return null;
        }
    };

    return (
        <div className="space-y-6">
            {isFranchiseModalOpen && <FranchiseModal franchise={editingFranchise} onClose={() => setIsFranchiseModalOpen(false)} onSave={handleSaveFranchise} />}
            <h2 className="text-3xl font-bold text-gray-800">Business Development & Expansão</h2>
            <div className="bg-white rounded-lg shadow-sm p-2">
                <nav className="flex space-x-2">
                    {tabs.map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-4 py-2 rounded-md text-sm font-medium ${activeTab === tab.id ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}`}>
                           <BuildingStorefrontIcon className="h-5 w-5 mr-2"/> {tab.label}
                        </button>
                    ))}
                </nav>
            </div>
            <div>{renderTabContent()}</div>
        </div>
    );
};

export default BusinessDevelopment;
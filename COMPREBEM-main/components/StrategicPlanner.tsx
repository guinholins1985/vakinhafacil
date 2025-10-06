import React, { useState, useMemo } from 'react';
import { AppState } from '../types.ts';
import { SparklesIcon, LightBulbIcon, DocumentTextIcon } from './Icons.tsx';
import { GoogleGenAI, Type } from "@google/genai";

interface StrategicPlannerProps {
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
  showToast: (message: string) => void;
}

// Reusable component for AI sections
const AIModuleCard: React.FC<{ title: string; icon: React.FC<any>; children: React.ReactNode }> = ({ title, icon: Icon, children }) => (
    <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Icon className="h-6 w-6 text-blue-600" />
            {title}
        </h3>
        {children}
    </div>
);

// SWOT Analysis Component
const SWOTAnalysis: React.FC<{ appState: AppState; showToast: (msg: string) => void; }> = ({ appState, showToast }) => {
    const [topic, setTopic] = useState('Nosso e-commerce CompreBem');
    const [isGenerating, setIsGenerating] = useState(false);
    const [swotResult, setSwotResult] = useState<{ strengths: string[]; weaknesses: string[]; opportunities: string[]; threats: string[] } | null>(null);

    const handleGenerate = async () => {
        if (!topic) return;
        setIsGenerating(true);
        setSwotResult(null);
        try {
            const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
            const prompt = `Aja como um consultor de negócios sênior. Para o tópico "${topic}", no contexto de um supermercado e-commerce chamado CompreBem, gere uma análise SWOT considerando o cenário de mercado de hoje. Retorne um objeto JSON com quatro arrays: "strengths", "weaknesses", "opportunities", e "threats". Cada array deve conter 3 a 4 strings concisas descrevendo os pontos.`;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
                            weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
                            opportunities: { type: Type.ARRAY, items: { type: Type.STRING } },
                            threats: { type: Type.ARRAY, items: { type: Type.STRING } },
                        },
                        required: ['strengths', 'weaknesses', 'opportunities', 'threats']
                    }
                }
            });

            const result = JSON.parse(response.text);
            setSwotResult(result);
            showToast("Análise SWOT gerada com sucesso!");
        } catch (error) {
            console.error("SWOT Generation Error:", error);
            showToast("Falha ao gerar análise SWOT.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <AIModuleCard title="Gerador de Análise SWOT" icon={SparklesIcon}>
            <div className="flex gap-2 mb-4">
                <input
                    type="text"
                    value={topic}
                    onChange={e => setTopic(e.target.value)}
                    placeholder="Tópico para análise (ex: delivery rápido)"
                    className="w-full p-2 border rounded-md"
                />
                <button onClick={handleGenerate} disabled={isGenerating || !topic} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 disabled:bg-blue-300 w-48 justify-center">
                    <SparklesIcon className={`h-5 w-5 ${isGenerating ? 'animate-spin' : ''}`} />
                    {isGenerating ? 'Analisando...' : 'Analisar'}
                </button>
            </div>
            {swotResult && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                        <h4 className="font-bold text-green-800">Forças</h4>
                        <ul className="list-disc list-inside text-sm text-green-700 mt-2">
                            {swotResult.strengths.map((item, i) => <li key={i}>{item}</li>)}
                        </ul>
                    </div>
                    <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                        <h4 className="font-bold text-yellow-800">Fraquezas</h4>
                        <ul className="list-disc list-inside text-sm text-yellow-700 mt-2">
                            {swotResult.weaknesses.map((item, i) => <li key={i}>{item}</li>)}
                        </ul>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                        <h4 className="font-bold text-blue-800">Oportunidades</h4>
                        <ul className="list-disc list-inside text-sm text-blue-700 mt-2">
                            {swotResult.opportunities.map((item, i) => <li key={i}>{item}</li>)}
                        </ul>
                    </div>
                    <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                        <h4 className="font-bold text-red-800">Ameaças</h4>
                        <ul className="list-disc list-inside text-sm text-red-700 mt-2">
                            {swotResult.threats.map((item, i) => <li key={i}>{item}</li>)}
                        </ul>
                    </div>
                </div>
            )}
        </AIModuleCard>
    );
};

// Initiative Generator Component
const InitiativeGenerator: React.FC<{ showToast: (msg: string) => void; }> = ({ showToast }) => {
    const [goal, setGoal] = useState('Aumentar a retenção de clientes em 15%');
    const [isGenerating, setIsGenerating] = useState(false);
    const [initiatives, setInitiatives] = useState<{ title: string; description: string }[] | null>(null);

    const handleGenerate = async () => {
        if (!goal) return;
        setIsGenerating(true);
        setInitiatives(null);
        try {
            const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
            const prompt = `Aja como um planejador estratégico. Para o objetivo de negócio "${goal}", no contexto de um supermercado e-commerce, gere 3 a 4 iniciativas estratégicas concretas, alinhadas com as tendências de mercado e comportamento do consumidor atuais, para alcançar esse objetivo. Retorne um array de objetos JSON. Cada objeto deve ter "title" (o nome da iniciativa) e "description" (uma breve explicação de como implementá-la).`;
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                title: { type: Type.STRING },
                                description: { type: Type.STRING }
                            },
                            required: ['title', 'description']
                        }
                    }
                }
            });
            setInitiatives(JSON.parse(response.text));
            showToast("Iniciativas geradas com sucesso!");
        } catch (error) {
            console.error("Initiative Generation Error:", error);
            showToast("Falha ao gerar iniciativas.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <AIModuleCard title="Gerador de Iniciativas Estratégicas" icon={LightBulbIcon}>
            <div className="flex gap-2 mb-4">
                <input
                    type="text"
                    value={goal}
                    onChange={e => setGoal(e.target.value)}
                    placeholder="Objetivo de negócio (ex: expandir para Curitiba)"
                    className="w-full p-2 border rounded-md"
                />
                <button onClick={handleGenerate} disabled={isGenerating || !goal} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 disabled:bg-blue-300 w-48 justify-center">
                    <SparklesIcon className={`h-5 w-5 ${isGenerating ? 'animate-spin' : ''}`} />
                    {isGenerating ? 'Gerando...' : 'Gerar'}
                </button>
            </div>
            {initiatives && (
                <div className="space-y-3 mt-4">
                    {initiatives.map((item, i) => (
                        <div key={i} className="p-3 bg-gray-50 rounded-lg border">
                            <h4 className="font-bold text-gray-800">{item.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                        </div>
                    ))}
                </div>
            )}
        </AIModuleCard>
    );
};

// Executive Summary Component
const ExecutiveSummary: React.FC<{ appState: AppState; showToast: (msg: string) => void; }> = ({ appState, showToast }) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [summary, setSummary] = useState('');
    
    const metrics = useMemo(() => {
        const validOrders = appState.orders.filter(o => o.status !== 'Cancelado');
        const totalRevenue = validOrders.reduce((sum, o) => sum + o.total, 0);
        return {
            totalRevenue: totalRevenue.toFixed(2),
            orderCount: validOrders.length,
            customerCount: appState.users.filter(u => u.role === 'Cliente').length,
        };
    }, [appState.orders, appState.users]);

    const handleGenerate = async () => {
        setIsGenerating(true);
        setSummary('');
        try {
            const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
            const prompt = `Você é o CEO do supermercado e-commerce CompreBem. Com base nos seguintes dados de performance do último período: ${JSON.stringify(metrics)}, escreva um resumo executivo otimista e conciso para a diretoria sobre o estado atual do negócio, com base nos dados de performance mais recentes fornecidos, destacando uma conquista e um ponto de foco para o futuro.`;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });

            setSummary(response.text);
            showToast("Resumo executivo gerado!");
        } catch (error) {
            console.error("Summary Generation Error:", error);
            showToast("Falha ao gerar resumo.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <AIModuleCard title="Gerador de Resumo Executivo" icon={DocumentTextIcon}>
            <button onClick={handleGenerate} disabled={isGenerating} className="bg-blue-600 text-white font-bold py-3 px-5 rounded-lg w-full flex items-center justify-center gap-2 disabled:bg-blue-300 mb-4">
                <SparklesIcon className={`h-5 w-5 ${isGenerating ? 'animate-spin' : ''}`} />
                {isGenerating ? 'Analisando dados e escrevendo...' : 'Gerar Resumo com Base nos Dados Atuais'}
            </button>
            {summary && (
                <div className="p-4 bg-gray-50 rounded-lg border whitespace-pre-wrap font-serif text-gray-700">
                    {summary}
                </div>
            )}
        </AIModuleCard>
    );
};


// Main Component
const StrategicPlanner: React.FC<StrategicPlannerProps> = (props) => {
    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold text-gray-800">Planejador Estratégico com IA</h2>
            <SWOTAnalysis {...props} />
            <InitiativeGenerator {...props} />
            <ExecutiveSummary {...props} />
        </div>
    );
};

export default StrategicPlanner;
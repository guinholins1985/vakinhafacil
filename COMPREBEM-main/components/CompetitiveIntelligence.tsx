import React, { useState } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { AppState, SWOTItem } from '../types.ts';
import { EyeIcon, ScaleIcon, TrashIcon, SparklesIcon, CheckCircleIcon } from './Icons.tsx';
import { v4 as uuidv4 } from 'uuid';

interface CompetitiveIntelligenceProps {
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
}

const initialPriceData = [
    { id: 1, name: 'Arroz Agulhinha Tipo 1 Camil 5kg', ourPrice: 25.99, competitorA: 26.50, competitorB: 25.89 },
    { id: 2, name: 'Feijão Carioca Tipo 1 Kicaldo 1kg', ourPrice: 8.79, competitorA: 8.75, competitorB: 9.10 },
    { id: 3, name: 'Óleo de Soja Soya 900ml', ourPrice: 5.49, competitorA: 5.80, competitorB: 5.49 },
    { id: 4, name: 'Café Torrado e Moído Pilão 500g', ourPrice: 18.90, competitorA: 19.50, competitorB: 18.75 },
    { id: 5, name: 'Leite Condensado Moça 395g', ourPrice: 6.99, competitorA: 7.25, competitorB: 6.95 },
];

const PricingMonitor: React.FC = () => {
    const [priceData, setPriceData] = useState(initialPriceData);
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncSuccess, setSyncSuccess] = useState(false);

    const handleSyncPrices = async () => {
        setIsSyncing(true);
        setSyncSuccess(false);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

            const productListForPrompt = priceData.map(p => ({ id: p.id, name: p.name, ourPrice: p.ourPrice }));
            
            const prompt = `Aja como um analista de inteligência competitiva para o e-commerce Atacadão.
            Para a lista de produtos a seguir, simule uma busca na web e encontre os preços de hoje de dois grandes concorrentes fictícios (Concorrente A e Concorrente B).
            Os preços dos concorrentes devem ser realistas, variando ligeiramente para mais ou para menos em relação ao nosso preço.
            Retorne os dados EXATAMENTE no formato JSON especificado no schema, mantendo os IDs e nomes originais.
            
            Nossos produtos:
            ${JSON.stringify(productListForPrompt, null, 2)}
            `;

            const responseSchema = {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        id: { type: Type.NUMBER },
                        name: { type: Type.STRING },
                        ourPrice: { type: Type.NUMBER },
                        competitorA: { type: Type.NUMBER },
                        competitorB: { type: Type.NUMBER },
                    },
                    required: ['id', 'name', 'ourPrice', 'competitorA', 'competitorB'],
                },
            };

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: responseSchema,
                },
            });

            const updatedDataFromAI = JSON.parse(response.text);

            const mergedData = priceData.map(originalItem => {
                const aiItem = updatedDataFromAI.find((item: any) => item.id === originalItem.id);
                return aiItem ? { ...originalItem, ...aiItem } : originalItem;
            });

            setPriceData(mergedData);
            setSyncSuccess(true);
            setTimeout(() => setSyncSuccess(false), 3000);

        } catch (error) {
            console.error("Erro ao sincronizar preços com IA:", error);
            alert("Falha ao buscar preços dos concorrentes. Tente novamente mais tarde.");
        } finally {
            setIsSyncing(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
                 <h3 className="text-xl font-bold">Preços dos Concorrentes (Produtos Chave)</h3>
                 <button onClick={handleSyncPrices} disabled={isSyncing} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 disabled:bg-blue-300">
                    <SparklesIcon className={`h-5 w-5 ${isSyncing ? 'animate-spin' : ''}`} />
                    {isSyncing ? 'Sincronizando...' : 'Sincronizar Preços'}
                 </button>
            </div>
            {syncSuccess && <div className="mb-4 p-3 bg-green-100 text-green-800 border border-green-200 rounded-lg text-sm flex items-center gap-2"><CheckCircleIcon className="h-5 w-5" />Preços sincronizados com sucesso!</div>}
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-xs uppercase">
                        <tr>
                            <th className="p-3 text-left">Produto</th>
                            <th className="p-3 text-center">Nosso Preço</th>
                            <th className="p-3 text-center">Concorrente A</th>
                            <th className="p-3 text-center">Concorrente B</th>
                            <th className="p-3 text-left">Sugestão (IA)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {priceData.map(item => {
                            const cheapestCompetitor = Math.min(item.competitorA, item.competitorB);
                            const isCheapest = item.ourPrice <= cheapestCompetitor;
                            const difference = item.ourPrice - cheapestCompetitor;
                            
                            const getPriceClass = (competitorPrice: number) => {
                                if (competitorPrice < item.ourPrice) return 'text-red-600 font-semibold';
                                if (competitorPrice > item.ourPrice) return 'text-green-600';
                                return 'text-gray-600';
                            }
                            
                            return (
                                <tr key={item.id} className="border-t">
                                    <td className="p-3 font-semibold">{item.name}</td>
                                    <td className="p-3 text-center font-bold text-blue-600">R$ {item.ourPrice.toFixed(2)}</td>
                                    <td className={`p-3 text-center ${getPriceClass(item.competitorA)}`}>R$ {item.competitorA.toFixed(2)}</td>
                                    <td className={`p-3 text-center ${getPriceClass(item.competitorB)}`}>R$ {item.competitorB.toFixed(2)}</td>
                                    <td className="p-3 text-xs font-semibold">{isCheapest ? <span className="text-green-600">Manter Preço (Mais Barato)</span> : <span className="text-yellow-600">Ajustar (R$ {difference.toFixed(2)} mais caro)</span>}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const SWOTAnalysis: React.FC<{
    items: SWOTItem[];
    setAppState: React.Dispatch<React.SetStateAction<AppState>>;
}> = ({ items, setAppState }) => {
    const categories: SWOTItem['category'][] = ['Strengths', 'Weaknesses', 'Opportunities', 'Threats'];
    const categoryTitles = {
        'Strengths': 'Forças (Strengths)',
        'Weaknesses': 'Fraquezas (Weaknesses)',
        'Opportunities': 'Oportunidades (Opportunities)',
        'Threats': 'Ameaças (Threats)'
    };
    const categoryColors = {
        'Strengths': 'bg-green-100 border-green-300 text-green-800',
        'Weaknesses': 'bg-yellow-100 border-yellow-300 text-yellow-800',
        'Opportunities': 'bg-blue-100 border-blue-300 text-blue-800',
        'Threats': 'bg-red-100 border-red-300 text-red-800'
    };

    const handleAddItem = (category: SWOTItem['category'], text: string) => {
        if (!text.trim()) return;
        const newItem: SWOTItem = { id: uuidv4(), category, text: text.trim() };
        setAppState(prev => ({ ...prev, swotItems: [...prev.swotItems, newItem] }));
    };

    const handleDeleteItem = (id: string) => {
        setAppState(prev => ({ ...prev, swotItems: prev.swotItems.filter(item => item.id !== id) }));
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
             <h3 className="text-xl font-bold mb-4">Análise SWOT Estratégica</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {categories.map(category => (
                     <div key={category} className={`p-4 rounded-lg border ${categoryColors[category].split(' ')[1]}`}>
                         <h4 className={`font-bold mb-3 ${categoryColors[category].split(' ')[2]}`}>{categoryTitles[category]}</h4>
                         <div className={`space-y-2 mb-3 min-h-[100px] p-2 rounded-md ${categoryColors[category].split(' ')[0]}`}>
                             {items.filter(item => item.category === category).map(item => (
                                 <div key={item.id} className="flex items-center justify-between bg-white p-2 rounded text-sm group shadow-sm">
                                     <span>{item.text}</span>
                                     <button onClick={() => handleDeleteItem(item.id)} className="opacity-0 group-hover:opacity-100 text-red-500"><TrashIcon className="h-4 w-4"/></button>
                                 </div>
                             ))}
                         </div>
                         <form onSubmit={(e) => { e.preventDefault(); const input = e.currentTarget.elements[0] as HTMLInputElement; handleAddItem(category, input.value); input.value = ''; }} className="flex gap-2">
                             <input type="text" placeholder="Adicionar item..." className="w-full p-1 border rounded text-sm"/>
                             <button type="submit" className="bg-white border rounded px-2 text-sm font-semibold">+</button>
                         </form>
                     </div>
                 ))}
             </div>
        </div>
    );
};


const CompetitiveIntelligence: React.FC<CompetitiveIntelligenceProps> = ({ appState, setAppState }) => {
    const [activeTab, setActiveTab] = useState('pricing');

    const tabs = [
        { id: 'pricing', label: 'Monitoramento de Preços' },
        { id: 'swot', label: 'Análise SWOT' },
    ];

    const renderContent = () => {
        switch(activeTab) {
            case 'pricing': return <PricingMonitor />;
            case 'swot': return <SWOTAnalysis items={appState.swotItems} setAppState={setAppState} />;
            default: return null;
        }
    };
    
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <EyeIcon className="h-8 w-8 text-blue-600"/>
                <h2 className="text-3xl font-bold text-gray-800">Inteligência Competitiva</h2>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-2">
                <nav className="flex space-x-2">
                    {tabs.map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-4 py-2 rounded-md text-sm font-medium ${activeTab === tab.id ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}`}>
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>
            <div>{renderContent()}</div>
        </div>
    );
};

export default CompetitiveIntelligence;
import React, { useMemo, useState } from 'react';
import { AnalyticsInsight, Order, User, ProductSectionData } from '../types.ts';
import { CurrencyDollarIcon, ShoppingCartIcon, UsersIcon, PresentationChartLineIcon, SparklesIcon } from './Icons.tsx';
import { GoogleGenAI, Type } from "@google/genai";
import { v4 as uuidv4 } from 'uuid';

interface AnalyticsBIProps {
    insights: AnalyticsInsight[];
    setInsights: React.Dispatch<React.SetStateAction<AnalyticsInsight[]>>;
    orders: Order[];
    users: User[];
    productSections: ProductSectionData[];
}

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
        <div className="bg-blue-100 text-blue-600 p-3 rounded-full mr-4">{icon}</div>
        <div>
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
    </div>
);

const HorizontalBarChart: React.FC<{ title: string; data: { label: string; value: number }[] }> = ({ title, data }) => {
    const maxValue = Math.max(...data.map(d => d.value), 0);
    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-bold text-gray-800 mb-4">{title}</h3>
            <div className="space-y-3">
                {data.map(({ label, value }) => (
                    <div key={label} className="flex items-center gap-2 text-sm">
                        <div className="w-1/3 truncate font-medium text-gray-700" title={label}>{label}</div>
                        <div className="w-2/3 bg-gray-200 rounded-full h-5">
                            <div
                                className="bg-blue-500 h-5 rounded-full flex items-center justify-end px-2 text-white text-xs font-bold"
                                style={{ width: `${maxValue > 0 ? (value / maxValue) * 100 : 0}%` }}
                            >
                                {value}
                            </div>
                        </div>
                    </div>
                ))}
                {data.length === 0 && <p className="text-sm text-gray-500">Dados insuficientes.</p>}
            </div>
        </div>
    );
};

const AnalyticsBI: React.FC<AnalyticsBIProps> = ({ insights, setInsights, orders, users, productSections }) => {
    const [isGenerating, setIsGenerating] = useState(false);

    const metrics = useMemo(() => {
        const validOrders = orders.filter(o => o.status !== 'Cancelado');
        const totalRevenue = validOrders.reduce((sum, o) => sum + o.total, 0);
        const orderCount = validOrders.length;
        const customerCount = users.filter(u => u.role === 'Cliente').length;
        const avgTicket = orderCount > 0 ? totalRevenue / orderCount : 0;
        
        const allProducts = productSections.flatMap(s => s.products);
        const productMap = new Map(allProducts.map(p => [p.id, p.name]));
        
        const topProducts = validOrders
            .flatMap(o => o.items)
            .reduce((acc, item) => {
                acc[item.productId] = (acc[item.productId] || 0) + item.quantity;
                return acc;
            }, {} as Record<string, number>);

        const topProductsData = Object.entries(topProducts)
            .sort((a: [string, number], b: [string, number]) => b[1] - a[1])
            .slice(0, 5)
            .map(([productId, value]) => ({ 
                label: productMap.get(Number(productId)) || `Produto ID ${productId}`, 
                value 
            }));

        return {
            totalRevenue,
            orderCount,
            customerCount,
            avgTicket,
            topProductsData,
        };
    }, [orders, users, productSections]);
    
    const handleGenerateInsights = async () => {
        setIsGenerating(true);
        try {
            const ai = new GoogleGenAI({apiKey: process.env.API_KEY});

            const dataSummary = {
                totalRevenue: metrics.totalRevenue,
                orderCount: metrics.orderCount,
                customerCount: metrics.customerCount,
                avgTicket: metrics.avgTicket,
                topProducts: metrics.topProductsData.map(p => ({ name: p.label, unitsSold: p.value })),
            };

            const prompt = `Aja como um analista de BI para um e-commerce. Baseado neste resumo de dados: ${JSON.stringify(dataSummary, null, 2)}, forneça 3 insights acionáveis para crescer o negócio. Cada insight deve ter um título e uma descrição.`;

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
                            required: ['title', 'description'],
                        }
                    },
                }
            });

            const newInsightsData = JSON.parse(response.text);
            
            if (Array.isArray(newInsightsData)) {
                const newInsights = newInsightsData.map((insight: any) => ({
                    id: uuidv4(),
                    title: insight.title,
                    description: insight.description,
                    generatedAt: new Date().toISOString(),
                }));

                setInsights(prev => [...newInsights, ...prev]);
            } else {
                console.error("AI returned data that is not an array:", newInsightsData);
                alert("A resposta da IA não pôde ser processada em um formato de lista válido.");
            }

        } catch (error) {
            console.error("Erro ao gerar insights:", error);
            alert("Falha ao gerar insights com a IA. Verifique o console.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold text-gray-800">Analytics & Business Intelligence</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Receita Total" value={`R$ ${metrics.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} icon={<CurrencyDollarIcon className="h-6 w-6"/>} />
                <StatCard title="Total de Pedidos" value={metrics.orderCount.toLocaleString('pt-BR')} icon={<ShoppingCartIcon className="h-6 w-6"/>} />
                <StatCard title="Ticket Médio" value={`R$ ${metrics.avgTicket.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} icon={<PresentationChartLineIcon className="h-6 w-6"/>} />
                <StatCard title="Total de Clientes" value={metrics.customerCount.toLocaleString('pt-BR')} icon={<UsersIcon className="h-6 w-6"/>} />
            </div>

            <div className="grid grid-cols-1 gap-6">
                <HorizontalBarChart title="Top 5 Produtos Mais Vendidos (por unidades)" data={metrics.topProductsData} />
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-800">Insights (Gerados por IA)</h3>
                    <button onClick={handleGenerateInsights} disabled={isGenerating} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 disabled:bg-blue-300">
                        <SparklesIcon className={`h-5 w-5 ${isGenerating ? 'animate-spin' : ''}`} />
                        {isGenerating ? 'Gerando...' : 'Gerar Novos Insights'}
                    </button>
                </div>
                <div className="space-y-4">
                {insights.length > 0 ? insights.map(insight => (
                    <div key={insight.id} className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
                        <h4 className="font-bold text-blue-800">{insight.title}</h4>
                        <p className="text-sm text-blue-700">{insight.description}</p>
                        <p className="text-xs text-gray-500 mt-1">Gerado em: {new Date(insight.generatedAt).toLocaleString('pt-BR')}</p>
                    </div>
                )) : (
                    <div className="text-center py-8 text-gray-500">
                        <p>Nenhum insight gerado recentemente.</p>
                        <p>Clique em "Gerar Novos Insights" para que a IA analise seus dados.</p>
                    </div>
                )}
                </div>
            </div>
        </div>
    );
};

export default AnalyticsBI;
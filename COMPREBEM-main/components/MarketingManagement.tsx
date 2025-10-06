
import React, { useState, useRef } from 'react';
import { SocialPost, MarketingCampaign, Affiliate, AppState } from '../types.ts';
import { 
    PlusIcon, PencilIcon, TrashIcon, 
    FacebookIcon, InstagramIcon, XIcon, SparklesIcon, UsersIcon, ClipboardDocumentCheckIcon,
    ReceiptPercentIcon, UploadIcon
} from './Icons.tsx';
import { v4 as uuidv4 } from 'uuid';
import { GoogleGenAI, Type } from "@google/genai";

interface MarketingManagementProps {
    appState: AppState;
    setAppState: React.Dispatch<React.SetStateAction<AppState>>;
}

const campaignStatusColors: Record<MarketingCampaign['status'], string> = {
    'Planejamento': 'bg-gray-200 text-gray-800',
    'Ativa': 'bg-green-100 text-green-800 animate-pulse',
    'Pausada': 'bg-yellow-100 text-yellow-800',
    'Concluída': 'bg-blue-100 text-blue-800',
};

const socialStatusColors: Record<SocialPost['status'], string> = {
    'Agendado': 'bg-blue-100 text-blue-800',
    'Publicado': 'bg-green-100 text-green-800',
    'Falha': 'bg-red-100 text-red-800',
};

const affiliateStatusColors: Record<Affiliate['status'], string> = {
    'Ativo': 'bg-green-100 text-green-800',
    'Inativo': 'bg-gray-200 text-gray-700',
    'Pendente': 'bg-yellow-100 text-yellow-800',
};


// --- Campaigns Section ---
const CampaignsView: React.FC<Pick<MarketingManagementProps, 'appState' | 'setAppState'>> = ({ appState, setAppState }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCampaign, setEditingCampaign] = useState<MarketingCampaign | null>(null);

    const handleSave = (campaign: MarketingCampaign) => {
        setAppState(prev => {
            const exists = prev.campaigns.some(c => c.id === campaign.id);
            const newCampaigns = exists ? prev.campaigns.map(c => c.id === campaign.id ? campaign : c) : [campaign, ...prev.campaigns];
            return {...prev, campaigns: newCampaigns };
        });
    };
    
    const handleDelete = (id: string) => {
        if(window.confirm('Tem certeza que deseja excluir esta campanha?')) {
             setAppState(prev => ({...prev, campaigns: prev.campaigns.filter(c => c.id !== id)}));
        }
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            {isModalOpen && <CampaignModal campaign={editingCampaign} onClose={() => setIsModalOpen(false)} onSave={handleSave} />}
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Gerenciador de Campanhas</h3>
                <button onClick={() => { setEditingCampaign(null); setIsModalOpen(true); }} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2"><PlusIcon className="h-5 w-5"/>Nova Campanha</button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-xs uppercase">
                        <tr>
                            <th className="p-3 text-left">Campanha</th>
                            <th className="p-3 text-left">Período</th>
                            <th className="p-3 text-left">Orçamento</th>
                            <th className="p-3 text-center">Mídia</th>
                            <th className="p-3 text-left">Status</th>
                            <th className="p-3 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {appState.campaigns.map(c => (
                            <tr key={c.id} className="border-t hover:bg-gray-50">
                                <td className="p-3 font-semibold">{c.name}</td>
                                <td className="p-3">{new Date(c.startDate).toLocaleDateString()} - {c.endDate ? new Date(c.endDate).toLocaleDateString() : 'N/D'}</td>
                                <td className="p-3">R$ {c.budget.toLocaleString()}</td>
                                <td className="p-3 text-center font-semibold">{(c.mediaAssets?.length ?? 0) > 0 ? c.mediaAssets?.length : '—'}</td>
                                <td className="p-3"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${campaignStatusColors[c.status]}`}>{c.status}</span></td>
                                <td className="p-3 text-right space-x-2">
                                    <button onClick={() => { setEditingCampaign(c); setIsModalOpen(true); }} className="p-1 text-blue-600 hover:bg-blue-100 rounded-full"><PencilIcon className="h-5 w-5"/></button>
                                    <button onClick={() => handleDelete(c.id)} className="p-1 text-red-500 hover:bg-red-100 rounded-full"><TrashIcon className="h-5 w-5"/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const CampaignModal: React.FC<{ campaign: MarketingCampaign | null; onClose: () => void; onSave: (c: MarketingCampaign) => void }> = ({ campaign, onClose, onSave }) => {
    const [formData, setFormData] = useState<MarketingCampaign>(campaign || { id: uuidv4(), name: '', channel: 'Social Media', status: 'Planejamento', roi: 0, startDate: new Date().toISOString().split('T')[0], endDate: '', budget: 0, targetAudience: '', mediaAssets: [] });
    const [aiPrompt, setAiPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
    const [videoGenerationStatus, setVideoGenerationStatus] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(p => ({...p, [name]: ['budget', 'roi'].includes(name) ? Number(value) : value }));
    };

    const handleGenerateIdeas = async () => {
        if (!aiPrompt) return;
        setIsGenerating(true);
        try {
            const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `Gere ideias para uma campanha de marketing com o objetivo de "${aiPrompt}". Forneça um nome de campanha criativo e uma breve descrição do público-alvo ideal. Considere as tendências de marketing digital mais atuais.`,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            name: { type: Type.STRING, description: "Nome criativo para a campanha." },
                            audience: { type: Type.STRING, description: "Descrição do público-alvo ideal." }
                        },
                        required: ['name', 'audience']
                    }
                }
            });
            const result = JSON.parse(response.text);
            if (result.name) setFormData(p => ({ ...p, name: result.name }));
            if (result.audience) setFormData(p => ({ ...p, targetAudience: result.audience }));
        } catch (error) {
            console.error("AI Error:", error);
            alert("Falha ao gerar ideias com a IA.");
        } finally {
            setIsGenerating(false);
        }
    };
    
    const handleGenerateVideo = async () => {
        if (!formData.name) {
            alert('Por favor, defina um nome para a campanha primeiro.');
            return;
        }
        setIsGeneratingVideo(true);
        setVideoGenerationStatus('Iniciando geração de vídeo...');
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `Vídeo curto de marketing para uma campanha chamada "${formData.name}", direcionada para "${formData.targetAudience}". Estilo vibrante e chamativo, adequado para ${formData.channel}. Use um estilo visual moderno e que gere alto engajamento nas redes sociais hoje.`;
            let operation = await ai.models.generateVideos({
                model: 'veo-2.0-generate-001',
                prompt: prompt,
                config: { numberOfVideos: 1 }
            });
            while (!operation.done) {
                setVideoGenerationStatus("Processando vídeo...");
                await new Promise(resolve => setTimeout(resolve, 10000));
                operation = await ai.operations.getVideosOperation({ operation: operation });
            }
            const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
            if (downloadLink) {
                setVideoGenerationStatus('Baixando vídeo...');
                const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
                const videoBlob = await response.blob();
                const videoObjectUrl = URL.createObjectURL(videoBlob);
                setFormData(prev => ({ ...prev, mediaAssets: [...(prev.mediaAssets || []), videoObjectUrl] }));
                setVideoGenerationStatus('Vídeo adicionado!');
            } else { throw new Error('Link não encontrado.'); }
        } catch (error) {
            console.error("Erro ao gerar vídeo com IA:", error);
            setVideoGenerationStatus(`Erro: ${(error as Error).message}`);
        } finally {
            setTimeout(() => { setIsGeneratingVideo(false); setVideoGenerationStatus(''); }, 3000);
        }
    };

    const handleMediaImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            for (const file of e.target.files) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setFormData(prev => ({ ...prev, mediaAssets: [...(prev.mediaAssets || []), reader.result as string] }));
                };
                reader.readAsDataURL(file);
            }
        }
    };

    const handleRemoveMedia = (indexToRemove: number) => {
        setFormData(prev => ({ ...prev, mediaAssets: prev.mediaAssets?.filter((_, index) => index !== indexToRemove) }));
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[60] p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] flex flex-col">
                <h3 className="text-xl font-bold mb-4">{campaign ? 'Editar Campanha' : 'Nova Campanha'}</h3>
                <form onSubmit={e => { e.preventDefault(); onSave(formData); onClose(); }} className="space-y-4 overflow-y-auto pr-2">
                    <div className="p-3 border rounded-lg bg-blue-50 border-blue-200 space-y-2">
                        <div className="flex items-center gap-2"><SparklesIcon className="h-5 w-5 text-blue-600" /><h4 className="font-semibold text-sm text-gray-800">Assistente IA de Campanha</h4></div>
                        <div className="flex gap-2"><input value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} placeholder="Objetivo da campanha (ex: Vender mais café)" className="w-full p-2 border rounded-md text-sm" /><button type="button" onClick={handleGenerateIdeas} disabled={isGenerating || !aiPrompt} className="bg-blue-600 text-white font-bold py-2 px-3 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 flex items-center gap-2 text-sm"><SparklesIcon className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />{isGenerating ? 'Gerando...' : 'Idéias'}</button></div>
                    </div>

                    <input name="name" value={formData.name} onChange={handleChange} placeholder="Nome da Campanha" className="w-full p-2 border rounded" required/>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="text-xs">Data de Início</label><input name="startDate" type="date" value={formData.startDate} onChange={handleChange} className="w-full p-2 border rounded" /></div>
                        <div><label className="text-xs">Data de Fim</label><input name="endDate" type="date" value={formData.endDate || ''} onChange={handleChange} className="w-full p-2 border rounded" /></div>
                        <div><label className="text-xs">Orçamento</label><input name="budget" type="number" value={formData.budget} onChange={handleChange} placeholder="Orçamento" className="w-full p-2 border rounded" /></div>
                        <div><label className="text-xs">Status</label><select name="status" value={formData.status} onChange={handleChange} className="w-full p-2 border rounded bg-white">{['Planejamento', 'Ativa', 'Pausada', 'Concluída'].map(s=><option key={s} value={s}>{s}</option>)}</select></div>
                    </div>
                    <textarea name="targetAudience" value={formData.targetAudience} onChange={handleChange} placeholder="Público-alvo" className="w-full p-2 border rounded h-20" />
                    
                    <div>
                        <label className="text-sm font-medium">Mídia da Campanha</label>
                        <div className="mt-1 p-4 border-2 border-dashed rounded-lg">
                            <div className="flex items-center justify-center gap-4">
                                <button type="button" onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 font-semibold py-2 px-3 rounded-lg hover:bg-gray-100 text-sm"><UploadIcon className="h-5 w-5"/> Importar Mídia</button>
                                <input type="file" ref={fileInputRef} multiple className="hidden" accept="image/*,video/*" onChange={handleMediaImport} />
                                <button type="button" onClick={handleGenerateVideo} disabled={isGeneratingVideo || !formData.name} className="flex items-center gap-2 bg-blue-600 text-white font-semibold py-2 px-3 rounded-lg hover:bg-blue-700 text-sm disabled:bg-blue-300">
                                    <SparklesIcon className={`h-5 w-5 ${isGeneratingVideo ? 'animate-spin' : ''}`}/> {isGeneratingVideo ? 'Gerando...' : 'Gerar Vídeo com IA'}
                                </button>
                            </div>
                            {isGeneratingVideo && ( <div className="text-center mt-4"><p className="text-sm text-blue-700">{videoGenerationStatus}</p></div> )}
                            {(formData.mediaAssets?.length ?? 0) > 0 && (<div className="mt-4 grid grid-cols-4 gap-4">{formData.mediaAssets?.map((assetUrl, index) => (<div key={index} className="relative group">
                                {assetUrl.startsWith('blob:') ? (
                                    <video src={assetUrl} className="h-24 w-full object-cover rounded-md border" />
                                ) : (
                                    <img src={assetUrl} alt={`Ativo ${index + 1}`} className="h-24 w-full object-cover rounded-md border" />
                                )}
                                <button type="button" onClick={() => handleRemoveMedia(index)} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"><TrashIcon className="h-4 w-4" /></button>
                            </div>))}</div>)}
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t mt-auto"><button type="button" onClick={onClose} className="bg-gray-200 py-2 px-4 rounded-lg">Cancelar</button><button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded-lg">Salvar</button></div>
                </form>
            </div>
        </div>
    );
};

// --- Social Media Section ---
const SocialPostsView: React.FC<Pick<MarketingManagementProps, 'appState' | 'setAppState'>> = ({ appState, setAppState }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPost, setEditingPost] = useState<SocialPost | null>(null);

    const handleSave = (post: SocialPost) => {
        setAppState(prev => {
            const exists = prev.socialPosts.some(p => p.id === post.id);
            const newPosts = exists ? prev.socialPosts.map(p => p.id === post.id ? post : p) : [post, ...prev.socialPosts];
            return {...prev, socialPosts: newPosts.sort((a,b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime()) };
        });
    };
    
    const handleDelete = (id: string) => {
        if(window.confirm('Tem certeza que deseja excluir este post?')) {
             setAppState(prev => ({...prev, socialPosts: prev.socialPosts.filter(p => p.id !== id)}));
        }
    }
    
    const SocialIcon = ({ platform }: { platform: SocialPost['platform'] }) => {
        const icons = { Facebook: FacebookIcon, Instagram: InstagramIcon, Twitter: XIcon };
        const Icon = icons[platform];
        return <Icon className="h-5 w-5" />;
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            {isModalOpen && <SocialPostModal post={editingPost} onClose={() => setIsModalOpen(false)} onSave={handleSave} />}
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Agendador de Redes Sociais</h3>
                <button onClick={() => { setEditingPost(null); setIsModalOpen(true); }} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2"><PlusIcon className="h-5 w-5"/>Agendar Post</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {appState.socialPosts.map(post => (
                    <div key={post.id} className="border rounded-lg p-4 space-y-3 flex flex-col">
                        <div className="flex justify-between items-center"><SocialIcon platform={post.platform} /><span className={`px-2 py-0.5 text-xs rounded-full ${socialStatusColors[post.status]}`}>{post.status}</span></div>
                        <p className="text-sm h-20 overflow-hidden flex-grow">{post.content}</p>
                        {post.imageUrl && <img src={post.imageUrl} alt="post visual" className="w-full h-24 object-cover rounded"/>}
                        <div className="text-xs text-gray-500 pt-2 border-t">Agendado para: {new Date(post.scheduledAt).toLocaleString('pt-BR')}</div>
                        <div className="flex gap-2">
                            <button onClick={() => { setEditingPost(post); setIsModalOpen(true); }} className="text-blue-600 text-xs font-semibold">Editar</button>
                            <button onClick={() => handleDelete(post.id)} className="text-red-500 text-xs font-semibold">Excluir</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const SocialPostModal: React.FC<{
    post: SocialPost | null;
    onClose: () => void;
    onSave: (post: SocialPost) => void;
}> = ({ post, onClose, onSave }) => {
    const isNew = post === null;
    const [formData, setFormData] = useState<SocialPost>(post || {
        id: uuidv4(),
        platform: 'Facebook',
        content: '',
        scheduledAt: new Date().toISOString().slice(0, 16),
        status: 'Agendado'
    });
    const [aiPrompt, setAiPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData(p => ({ ...p, [e.target.name]: e.target.value }));
    };

    const handleGenerateContent = async () => {
        if (!aiPrompt) return;
        setIsGenerating(true);
        try {
            const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `Gere um post para rede social (${formData.platform}) com o tema "${aiPrompt}". O post deve ser curto, engajante, profissional e relevante para os acontecimentos e tendências atuais.`,
            });
            setFormData(p => ({ ...p, content: response.text }));
        } catch (error) {
            console.error("AI Error:", error);
            alert("Falha ao gerar conteúdo com a IA.");
        } finally {
            setIsGenerating(false);
        }
    };
    
    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[60] p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg">
                <h3 className="text-xl font-bold mb-4">{isNew ? 'Agendar Novo Post' : 'Editar Post'}</h3>
                <form onSubmit={handleSave} className="space-y-4">
                    <div className="p-3 border rounded-lg bg-blue-50 border-blue-200 space-y-2">
                        <h4 className="font-semibold text-sm text-gray-800 flex items-center gap-2"><SparklesIcon className="h-5 w-5 text-blue-600"/>Gerador de Conteúdo IA</h4>
                        <div className="flex gap-2">
                            <input value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} placeholder="Tema do post (ex: promoção de carnes)" className="w-full p-2 border rounded-md text-sm" />
                            <button type="button" onClick={handleGenerateContent} disabled={isGenerating || !aiPrompt} className="bg-blue-600 text-white font-bold py-2 px-3 rounded-lg text-sm flex items-center gap-2 disabled:bg-blue-300">
                                <SparklesIcon className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
                                {isGenerating ? 'Gerando...' : 'Gerar'}
                            </button>
                        </div>
                    </div>
                    <div>
                        <label className="text-sm">Plataforma</label>
                        <select name="platform" value={formData.platform} onChange={handleChange} className="w-full p-2 border rounded bg-white">
                            <option>Facebook</option>
                            <option>Instagram</option>
                            <option>Twitter</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-sm">Conteúdo</label>
                        <textarea name="content" value={formData.content} onChange={handleChange} className="w-full p-2 border rounded h-32" required />
                    </div>
                    <div>
                        <label className="text-sm">URL da Imagem (Opcional)</label>
                        <input name="imageUrl" value={formData.imageUrl || ''} onChange={handleChange} className="w-full p-2 border rounded" />
                    </div>
                    <div>
                        <label className="text-sm">Agendar Para</label>
                        <input name="scheduledAt" type="datetime-local" value={formData.scheduledAt} onChange={handleChange} className="w-full p-2 border rounded" required />
                    </div>
                    <div className="flex justify-end gap-2 pt-4 border-t">
                        <button type="button" onClick={onClose} className="bg-gray-200 py-2 px-4 rounded-lg">Cancelar</button>
                        <button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded-lg">Salvar Post</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- Affiliates Section ---
const AffiliatesView: React.FC<Pick<MarketingManagementProps, 'appState' | 'setAppState'>> = ({ appState, setAppState }) => {
    const handleStatusChange = (id: string, status: Affiliate['status']) => {
        setAppState(prev => ({
            ...prev,
            affiliates: prev.affiliates.map(a => a.id === id ? { ...a, status } : a)
        }));
    };
    
    const handleDelete = (id: string) => {
        if (window.confirm('Tem certeza que deseja excluir este afiliado?')) {
            setAppState(prev => ({
                ...prev,
                affiliates: prev.affiliates.filter(a => a.id !== id)
            }));
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold">Programa de Afiliados</h3>
            <table className="w-full text-sm mt-4">
                <thead className="bg-gray-50 text-xs uppercase">
                    <tr>
                        <th className="p-3 text-left">Afiliado</th>
                        <th className="p-3 text-left">Vendas Totais</th>
                        <th className="p-3 text-left">Comissão</th>
                        <th className="p-3 text-left">Status</th>
                        <th className="p-3 text-right">Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {appState.affiliates.map(a => (
                        <tr key={a.id} className="border-t">
                            <td className="p-3 font-semibold">{a.name}</td>
                            <td className="p-3">R$ {a.totalSales.toLocaleString()}</td>
                            <td className="p-3">{a.commissionRate}%</td>
                            <td className="p-3"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${affiliateStatusColors[a.status]}`}>{a.status}</span></td>
                            <td className="p-3 text-right space-x-2">
                                {a.status === 'Pendente' && <button onClick={() => handleStatusChange(a.id, 'Ativo')} className="font-medium text-green-600">Aprovar</button>}
                                <button onClick={() => handleDelete(a.id)} className="p-1 text-red-500 hover:bg-red-100 rounded-full inline-flex items-center justify-center"><TrashIcon className="h-5 w-5"/></button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

// --- Main Marketing Component ---
const MarketingManagement: React.FC<MarketingManagementProps> = ({ appState, setAppState }) => {
    const [activeTab, setActiveTab] = useState('campaigns');
    
    const tabs = [
        { id: 'campaigns', label: 'Campanhas', icon: ClipboardDocumentCheckIcon },
        { id: 'social', label: 'Redes Sociais', icon: UsersIcon },
        { id: 'affiliates', label: 'Afiliados', icon: ReceiptPercentIcon },
    ];

    const renderContent = () => {
        switch(activeTab) {
            case 'campaigns': return <CampaignsView appState={appState} setAppState={setAppState} />;
            case 'social': return <SocialPostsView appState={appState} setAppState={setAppState} />;
            case 'affiliates': return <AffiliatesView appState={appState} setAppState={setAppState} />;
            default: return null;
        }
    };
    
    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-800">Gerenciamento de Marketing</h2>
            <div className="bg-white rounded-lg shadow-sm p-2">
                <nav className="flex space-x-2">
                    {tabs.map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center px-4 py-2 rounded-md text-sm font-medium ${activeTab === tab.id ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}`}>
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

export default MarketingManagement;
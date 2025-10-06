import React, { useState, useMemo, useEffect, useRef } from 'react';
import { AppState, FairEvent, FairMeeting, Product } from '../types.ts';
import { CalendarIcon, PlusIcon, PencilIcon, TrashIcon, VideoCameraIcon, DocumentArrowDownIcon, CheckCircleIcon, SparklesIcon } from './Icons.tsx';
import { v4 as uuidv4 } from 'uuid';
import { GoogleGenAI, Type } from "@google/genai";

interface FairsAndEventsProps {
    appState: AppState;
    setAppState: React.Dispatch<React.SetStateAction<AppState>>;
}

// --- Modals ---

const EventModal: React.FC<{ event: FairEvent | null; onSave: (event: FairEvent) => void; onClose: () => void; }> = ({ event, onSave, onClose }) => {
    const isNew = event === null;
    const [formData, setFormData] = useState<FairEvent>(event || { id: uuidv4(), name: '', startDate: '', location: '', description: '', responsible: '' });
    const handleSave = (e: React.FormEvent) => { e.preventDefault(); onSave(formData); onClose(); };
    return (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-xl">
                <h3 className="text-lg font-bold mb-4">{isNew ? 'Agendar Novo Evento' : 'Editar Evento'}</h3>
                <form onSubmit={handleSave} className="space-y-4">
                    <input value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} placeholder="Nome do Evento" className="w-full p-2 border rounded" required />
                    <div className="grid grid-cols-2 gap-4">
                        <input type="date" value={formData.startDate} onChange={e => setFormData(p => ({ ...p, startDate: e.target.value }))} className="w-full p-2 border rounded" required />
                        <input type="date" value={formData.endDate || ''} onChange={e => setFormData(p => ({ ...p, endDate: e.target.value }))} className="w-full p-2 border rounded" />
                    </div>
                    <input value={formData.location} onChange={e => setFormData(p => ({ ...p, location: e.target.value }))} placeholder="Localização" className="w-full p-2 border rounded" />
                    <input value={formData.responsible} onChange={e => setFormData(p => ({ ...p, responsible: e.target.value }))} placeholder="Responsável" className="w-full p-2 border rounded" />
                    <textarea value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} placeholder="Descrição" className="w-full p-2 border rounded h-24" />
                    <div className="flex justify-end gap-2"><button type="button" onClick={onClose} className="bg-gray-200 py-2 px-4 rounded-lg">Cancelar</button><button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded-lg">Salvar</button></div>
                </form>
            </div>
        </div>
    );
};

const MeetingModal: React.FC<{ meeting: FairMeeting | null; onSave: (meeting: FairMeeting) => void; onClose: () => void; events: FairEvent[] }> = ({ meeting, onSave, onClose, events }) => {
    const isNew = meeting === null;
    const [formData, setFormData] = useState<FairMeeting>(meeting || { id: uuidv4(), eventId: '', subject: '', dateTime: '', participants: '', location: '' });
    const handleSave = (e: React.FormEvent) => { e.preventDefault(); onSave(formData); onClose(); };
    return (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-xl">
                <h3 className="text-lg font-bold mb-4">{isNew ? 'Agendar Nova Reunião' : 'Editar Reunião'}</h3>
                <form onSubmit={handleSave} className="space-y-4">
                    <select value={formData.eventId} onChange={e => setFormData(p => ({...p, eventId: e.target.value}))} className="w-full p-2 border rounded bg-white" required>
                        <option value="">Selecione um Evento</option>
                        {events.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                    </select>
                    <input value={formData.subject} onChange={e => setFormData(p => ({...p, subject: e.target.value}))} placeholder="Assunto da Reunião" className="w-full p-2 border rounded" required />
                    <input type="datetime-local" value={formData.dateTime} onChange={e => setFormData(p => ({...p, dateTime: e.target.value}))} className="w-full p-2 border rounded" required />
                    <input value={formData.participants} onChange={e => setFormData(p => ({...p, participants: e.target.value}))} placeholder="Participantes (separados por vírgula)" className="w-full p-2 border rounded" />
                    <input value={formData.location} onChange={e => setFormData(p => ({...p, location: e.target.value}))} placeholder="Local ou Link da Reunião" className="w-full p-2 border rounded" />
                    <div className="flex justify-end gap-2"><button type="button" onClick={onClose} className="bg-gray-200 py-2 px-4 rounded-lg">Cancelar</button><button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded-lg">Salvar</button></div>
                </form>
            </div>
        </div>
    );
};

// --- Tool Modals ---
const VirtualStandModal: React.FC<{ onClose: () => void, products: Product[] }> = ({ onClose, products }) => {
    const [title, setTitle] = useState("Bem-vindo ao nosso Stand!");
    const [description, setDescription] = useState("Explore nossas novidades e ofertas exclusivas para o evento.");
    const [videoUrl, setVideoUrl] = useState("https://www.youtube.com/embed/dQw4w9WgXcQ");
    const [featuredProducts, setFeaturedProducts] = useState<number[]>([]);
    const [aiPrompt, setAiPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
    const [videoGenerationStatus, setVideoGenerationStatus] = useState('');

    const toggleProduct = (id: number) => {
        setFeaturedProducts(prev => prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]);
    };

    const handleGenerateContent = async () => {
        if (!aiPrompt) return;
        setIsGenerating(true);
        try {
            const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
            const prompt = `Gere um título e uma breve descrição para um stand virtual em um evento sobre "${aiPrompt}". Use uma linguagem moderna, atual e convidativa.`;
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            title: { type: Type.STRING },
                            description: { type: Type.STRING }
                        },
                        required: ['title', 'description']
                    }
                }
            });
            const result = JSON.parse(response.text);
            if (result.title) setTitle(result.title);
            if (result.description) setDescription(result.description);
        } catch (e) {
            console.error("AI generation failed", e);
            alert("Falha ao gerar conteúdo com IA.");
        } finally {
            setIsGenerating(false);
        }
    };
    
    const handleGenerateVideo = async () => {
        if (!title) {
            alert('Por favor, defina um título para o stand primeiro.');
            return;
        }
        setIsGeneratingVideo(true);
        setVideoGenerationStatus('Iniciando a criação do vídeo... Isso pode levar alguns minutos.');
    
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `Crie um vídeo de boas-vindas para um stand virtual de um evento. Título: "${title}". Descrição: "${description}". Estilo de vídeo moderno e dinâmico, seguindo as últimas tendências de motion design, convidativo, mostrando produtos de supermercado de forma abstrata.`;
    
            let operation = await ai.models.generateVideos({
                model: 'veo-2.0-generate-001',
                prompt: prompt,
                config: { numberOfVideos: 1 }
            });
    
            const messages = [ "Renderizando os primeiros quadros...", "A IA está trabalhando...", "Compilando as cenas...", "Quase pronto..." ];
            let messageIndex = 0;
    
            while (!operation.done) {
                setVideoGenerationStatus(messages[messageIndex % messages.length]);
                messageIndex++;
                await new Promise(resolve => setTimeout(resolve, 10000));
                operation = await ai.operations.getVideosOperation({ operation: operation });
            }
    
            const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    
            if (downloadLink) {
                setVideoGenerationStatus('Download do vídeo...');
                const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
                const videoBlob = await response.blob();
                const videoObjectUrl = URL.createObjectURL(videoBlob);
                setVideoUrl(videoObjectUrl);
                setVideoGenerationStatus('Vídeo gerado!');
            } else {
                throw new Error('Link para download não encontrado.');
            }
    
        } catch (error) {
            console.error("Erro ao gerar vídeo com IA:", error);
            setVideoGenerationStatus(`Erro: ${(error as Error).message}`);
        } finally {
            setTimeout(() => {
                 setIsGeneratingVideo(false);
                 setVideoGenerationStatus('');
            }, 5000);
        }
    };


    return (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] flex flex-col">
                <h3 className="text-xl font-bold mb-4">Configurar Stand Virtual</h3>
                <div className="grid grid-cols-2 gap-6 flex-grow overflow-hidden">
                    <div className="flex flex-col gap-4 overflow-y-auto pr-2">
                        <div className="p-3 border rounded-lg bg-blue-50 border-blue-200 space-y-2">
                            <h4 className="font-semibold text-sm text-gray-800 flex items-center gap-2"><SparklesIcon className="h-5 w-5 text-blue-600"/>Assistente de Conteúdo IA</h4>
                            <div className="flex gap-2"><input value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} placeholder="Tema do evento (ex: produtos de verão)" className="w-full p-2 border rounded-md text-sm" /><button type="button" onClick={handleGenerateContent} disabled={isGenerating || !aiPrompt} className="bg-blue-600 text-white font-bold py-2 px-3 rounded-lg text-sm flex items-center gap-2"><SparklesIcon className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />Gerar</button></div>
                        </div>
                        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Título do Stand" className="w-full p-2 border rounded" />
                        <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Descrição do Stand" className="w-full p-2 border rounded h-20 text-sm" />
                        <div className="flex items-center gap-2 mt-1">
                            <input value={videoUrl} onChange={e => setVideoUrl(e.target.value)} placeholder="URL do Vídeo de Boas-vindas (embed)" className="w-full p-2 border rounded" />
                            <button 
                                type="button"
                                onClick={handleGenerateVideo}
                                disabled={isGeneratingVideo || !title}
                                title="Gerar vídeo com IA"
                                className="bg-blue-600 text-white font-bold p-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 flex items-center gap-1"
                            >
                                <SparklesIcon className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="border rounded-lg p-2">
                            <h4 className="font-semibold text-sm mb-2">Produtos em Destaque</h4>
                            <div className="max-h-48 overflow-y-auto space-y-1">
                                {products.map(p => <label key={p.id} className="flex items-center gap-2 text-sm p-1 rounded hover:bg-gray-100"><input type="checkbox" checked={featuredProducts.includes(p.id)} onChange={() => toggleProduct(p.id)} /> {p.name}</label>)}
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-100 p-4 rounded-lg flex flex-col items-center">
                        <h4 className="text-lg font-bold text-gray-800 text-center">{title}</h4>
                        <p className="text-sm text-gray-600 text-center my-2">{description}</p>
                        <div className="my-2 w-full aspect-video bg-black rounded-md overflow-hidden flex items-center justify-center">
                            {isGeneratingVideo ? (
                                <div className="text-center text-white p-4 w-full">
                                    <div className="w-full bg-blue-900 rounded-full h-1.5 mb-2"><div className="bg-blue-400 h-1.5 rounded-full animate-pulse" style={{width: '100%'}}></div></div>
                                    <p className="text-sm">{videoGenerationStatus}</p>
                                </div>
                            ) : videoUrl.startsWith('blob:') ? (
                                <video key={videoUrl} src={videoUrl} controls autoPlay muted loop className="w-full h-full object-cover"></video>
                            ) : (
                                <iframe width="100%" height="100%" src={videoUrl} title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
                            )}
                        </div>
                        <div className="grid grid-cols-3 gap-2 w-full mt-2">
                            {products.filter(p => featuredProducts.includes(p.id)).slice(0, 3).map(p => <div key={p.id} className="bg-white p-1 rounded border"><img src={p.imageUrls[0]} alt={p.name} className="h-16 w-full object-contain" /><p className="text-xs truncate text-center mt-1">{p.name}</p></div>)}
                        </div>
                    </div>
                </div>
                 <div className="flex justify-end gap-2 pt-4 border-t mt-4"><button type="button" onClick={onClose} className="bg-gray-200 py-2 px-4 rounded-lg">Fechar</button><button onClick={() => { alert('Configurações salvas!'); onClose(); }} className="bg-blue-600 text-white py-2 px-4 rounded-lg">Salvar</button></div>
            </div>
        </div>
    );
};

const DigitalCatalogModal: React.FC<{ onClose: () => void, products: Product[] }> = ({ onClose, products }) => {
    const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
    const [catalogTitle, setCatalogTitle] = useState('Catálogo de Produtos');
    const [catalogIntro, setCatalogIntro] = useState('');
    const [aiPrompt, setAiPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    const toggleProduct = (id: number) => setSelectedProducts(prev => prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]);

    const handleGenerateCatalog = async () => {
        if (!aiPrompt) return;
        setIsGenerating(true);
        try {
            const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
            const productList = products.map(p => p.name).join(', ');
            const prompt = `Aja como um especialista em marketing. Crie o conteúdo para um catálogo de produtos com o tema "${aiPrompt}".
1.  **Título:** Crie um título criativo para o catálogo.
2.  **Introdução:** Escreva uma introdução curta e atrativa (1-2 frases).
3.  **Seleção de Produtos:** Da lista a seguir, escolha os 5 produtos mais relevantes para o tema, considerando a sazonalidade e tendências atuais de consumo. Lista de produtos: ${productList}.
Retorne os nomes exatos dos produtos escolhidos.`;
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            title: { type: Type.STRING },
                            introduction: { type: Type.STRING },
                            products: {
                                type: Type.ARRAY,
                                items: { type: Type.STRING }
                            }
                        },
                        required: ['title', 'introduction', 'products']
                    }
                }
            });
            const result = JSON.parse(response.text);
            
            if(result.title) setCatalogTitle(result.title);
            if(result.introduction) setCatalogIntro(result.introduction);
            if(result.products) {
                const suggestedNames = result.products;
                // This logic finds products whose names include the names suggested by the AI.
                const suggestedIds = products.filter(p => suggestedNames.some(suggestedName => p.name.toLowerCase().includes(suggestedName.toLowerCase()))).map(p => p.id);
                setSelectedProducts(suggestedIds);
            }
        } catch(e) {
            console.error("AI catalog generation failed", e);
            alert("Falha ao gerar conteúdo com IA.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDownload = () => { alert(`Catálogo gerado com ${selectedProducts.length} produtos! Download simulado.`); onClose(); };

    return (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] flex flex-col">
                <h3 className="text-xl font-bold mb-4">Gerador de Catálogo Digital</h3>
                <div className="p-3 border rounded-lg bg-blue-50 border-blue-200 space-y-2 mb-4">
                    <h4 className="font-semibold text-sm text-gray-800 flex items-center gap-2"><SparklesIcon className="h-5 w-5 text-blue-600"/>Assistente de Catálogo IA</h4>
                    <div className="flex gap-2"><input value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} placeholder="Tema do catálogo (ex: ofertas de inverno)" className="w-full p-2 border rounded-md text-sm" /><button type="button" onClick={handleGenerateCatalog} disabled={isGenerating || !aiPrompt} className="bg-blue-600 text-white font-bold py-2 px-3 rounded-lg text-sm flex items-center gap-2"><SparklesIcon className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />Gerar</button></div>
                </div>
                <input value={catalogTitle} onChange={e => setCatalogTitle(e.target.value)} className="w-full p-2 border rounded font-bold mb-2" />
                <textarea value={catalogIntro} onChange={e => setCatalogIntro(e.target.value)} placeholder="Introdução (opcional)..." className="w-full p-2 border rounded text-sm h-16 mb-2" />
                <div className="border rounded-lg p-2 flex-grow overflow-y-auto">
                    {products.map(p => <label key={p.id} className="flex items-center gap-2 text-sm p-2 rounded hover:bg-gray-100"><input type="checkbox" checked={selectedProducts.includes(p.id)} onChange={() => toggleProduct(p.id)} /> <img src={p.imageUrls[0]} className="h-8 w-8 object-contain" /> {p.name}</label>)}
                </div>
                <div className="flex justify-end gap-2 pt-4 border-t mt-4"><button type="button" onClick={onClose} className="bg-gray-200 py-2 px-4 rounded-lg">Fechar</button><button onClick={handleDownload} className="bg-blue-600 text-white py-2 px-4 rounded-lg flex items-center gap-2"><DocumentArrowDownIcon className="h-5 w-5"/>Gerar PDF</button></div>
            </div>
        </div>
    );
};

const DigitalCheckinModal: React.FC<{ onClose: () => void, events: FairEvent[] }> = ({ onClose, events }) => {
    const [selectedEventId, setSelectedEventId] = useState<string>(events[0]?.id || '');
    const [checkins, setCheckins] = useState<{ id: number; message: string; }[]>([]);
    const intervalRef = useRef<number>();
    const checkinCounter = useRef(0);

    useEffect(() => {
        const generateAndAddCheckin = async () => {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const randomName = ['Ana', 'Bruno', 'Carla', 'Daniel', 'Elisa'][Math.floor(Math.random() * 5)];
            const eventName = events.find(e => e.id === selectedEventId)?.name || 'nosso evento';
            const prompt = `Gere uma mensagem de boas-vindas curta, criativa e personalizada para "${randomName}", que acabou de fazer check-in no evento "${eventName}".`;
        
            try {
                const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
                const message = response.text;
                checkinCounter.current += 1;
                setCheckins(prev => [{ id: checkinCounter.current, message }, ...prev.slice(0, 4)]);
            } catch (e) {
                console.error("AI check-in message generation failed", e);
                checkinCounter.current += 1;
                const fallbackMessage = `Bem-vindo(a), ${randomName}! Aproveite o evento. - ${new Date().toLocaleTimeString()}`;
                setCheckins(prev => [{ id: checkinCounter.current, message: fallbackMessage }, ...prev.slice(0, 4)]);
            }
        };

        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
        setCheckins([]);
        checkinCounter.current = 0;
        
        if (selectedEventId) {
            generateAndAddCheckin(); // Generate one immediately
            intervalRef.current = window.setInterval(generateAndAddCheckin, 5000);
        }
        
        return () => clearInterval(intervalRef.current);
    }, [selectedEventId, events]);

    return (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-xl">
                 <h3 className="text-xl font-bold mb-4">Ferramenta de Check-in Digital com IA</h3>
                 <select value={selectedEventId} onChange={e => setSelectedEventId(e.target.value)} className="w-full p-2 border rounded bg-white mb-4">
                    {events.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                 </select>
                 <div className="flex gap-6">
                    <div className="w-48 h-48 bg-gray-100 p-2 border rounded flex items-center justify-center">
                        <img src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${selectedEventId}`} alt="QR Code" />
                    </div>
                    <div className="flex-grow">
                        <h4 className="font-semibold">Check-ins Recentes</h4>
                        <ul className="text-sm space-y-2 mt-2">
                            {checkins.map(c => <li key={c.id} className="p-3 bg-green-50 rounded text-green-800 border-l-4 border-green-400">{c.message}</li>)}
                        </ul>
                    </div>
                 </div>
                 <button onClick={onClose} className="bg-gray-200 py-2 px-4 rounded-lg mt-4 w-full">Fechar</button>
            </div>
        </div>
    );
};


const FairsAndEvents: React.FC<FairsAndEventsProps> = ({ appState, setAppState }) => {
    const [activeTab, setActiveTab] = useState('events');
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<FairEvent | null>(null);
    const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
    const [editingMeeting, setEditingMeeting] = useState<FairMeeting | null>(null);
    const [activeTool, setActiveTool] = useState<string | null>(null);

    const tabs = [ { id: 'events', label: 'Eventos' }, { id: 'meetings', label: 'Agenda de Reuniões' }, { id: 'tools', label: 'Ferramentas' } ];
    
    const allProducts = useMemo(() => appState.productSections.flatMap(s => s.products), [appState.productSections]);

    const handleSaveEvent = (event: FairEvent) => {
        setAppState(p => {
            const exists = p.fairEvents.some(e => e.id === event.id);
            return {...p, fairEvents: exists ? p.fairEvents.map(e => e.id === event.id ? event : e) : [event, ...p.fairEvents]};
        });
    };
    const handleDeleteEvent = (id: string) => { if(window.confirm('Excluir este evento?')) setAppState(p => ({...p, fairEvents: p.fairEvents.filter(e => e.id !== id)})) };
    
    const handleSaveMeeting = (meeting: FairMeeting) => {
        setAppState(p => {
            const exists = p.fairMeetings.some(m => m.id === meeting.id);
            return {...p, fairMeetings: exists ? p.fairMeetings.map(m => m.id === meeting.id ? meeting : m) : [meeting, ...p.fairMeetings]};
        });
    };
    const handleDeleteMeeting = (id: string) => { if(window.confirm('Excluir esta reunião?')) setAppState(p => ({...p, fairMeetings: p.fairMeetings.filter(m => m.id !== id)})) };

    const renderContent = () => {
        switch(activeTab) {
            case 'events': return <div className="bg-white p-6 rounded-lg shadow-md"><div className="flex justify-between items-center mb-4"><h3 className="text-xl font-bold">Eventos Agendados</h3><button onClick={() => {setEditingEvent(null); setIsEventModalOpen(true)}} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2"><PlusIcon className="h-5 w-5"/>Agendar Evento</button></div><div className="space-y-4">{appState.fairEvents.map(e => <div key={e.id} className="p-3 border rounded-lg group"><div className="flex justify-between"><h4 className="font-bold">{e.name}</h4><div className="flex gap-2 opacity-0 group-hover:opacity-100"><button onClick={() => {setEditingEvent(e); setIsEventModalOpen(true)}} className="p-1 text-blue-600"><PencilIcon className="h-4 w-4"/></button><button onClick={() => handleDeleteEvent(e.id)} className="p-1 text-red-500"><TrashIcon className="h-4 w-4"/></button></div></div><p className="text-sm text-gray-600">{e.location}</p><p className="text-xs text-gray-500">{new Date(e.startDate  + 'T00:00:00').toLocaleDateString()} a {e.endDate ? new Date(e.endDate + 'T00:00:00').toLocaleDateString() : 'N/D'}</p></div>)}</div></div>;
            case 'meetings': return <div className="bg-white p-6 rounded-lg shadow-md"><div className="flex justify-between items-center mb-4"><h3 className="text-xl font-bold">Reuniões Agendadas</h3><button onClick={() => {setEditingMeeting(null); setIsMeetingModalOpen(true)}} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2"><PlusIcon className="h-5 w-5"/>Agendar Reunião</button></div><div className="space-y-2">{appState.fairMeetings.map(m => <div key={m.id} className="p-2 border-b group"><div className="flex justify-between"><p className="font-semibold">{m.subject}</p><div className="flex gap-2 opacity-0 group-hover:opacity-100"><button onClick={() => {setEditingMeeting(m); setIsMeetingModalOpen(true)}} className="p-1 text-blue-600"><PencilIcon className="h-4 w-4"/></button><button onClick={() => handleDeleteMeeting(m.id)} className="p-1 text-red-500"><TrashIcon className="h-4 w-4"/></button></div></div><p className="text-xs text-gray-500">{new Date(m.dateTime).toLocaleString()}</p></div>)}</div></div>;
            case 'tools': return <div className="grid grid-cols-1 md:grid-cols-3 gap-4">{[{id: 'stand', title: 'Stand Virtual', icon: VideoCameraIcon}, {id: 'catalog', title: 'Catálogo Digital', icon: DocumentArrowDownIcon}, {id: 'checkin', title: 'Check-in Digital', icon: CheckCircleIcon}].map(tool => <div key={tool.id} className="bg-white p-6 rounded-lg shadow-md text-center"><tool.icon className="h-8 w-8 mx-auto text-blue-600 mb-2" /><h3 className="text-lg font-bold">{tool.title}</h3><button onClick={() => setActiveTool(tool.id)} className="mt-4 bg-gray-200 font-semibold py-2 px-4 rounded-lg w-full">Configurar</button></div>)}</div>;
        }
    };
    
    return (
        <div className="space-y-6">
            {isEventModalOpen && <EventModal event={editingEvent} onClose={() => setIsEventModalOpen(false)} onSave={handleSaveEvent} />}
            {isMeetingModalOpen && <MeetingModal meeting={editingMeeting} onClose={() => setIsMeetingModalOpen(false)} onSave={handleSaveMeeting} events={appState.fairEvents} />}
            {activeTool === 'stand' && <VirtualStandModal onClose={() => setActiveTool(null)} products={allProducts} />}
            {activeTool === 'catalog' && <DigitalCatalogModal onClose={() => setActiveTool(null)} products={allProducts} />}
            {activeTool === 'checkin' && <DigitalCheckinModal onClose={() => setActiveTool(null)} events={appState.fairEvents} />}

            <h2 className="text-3xl font-bold text-gray-800">Feiras e Eventos</h2>
            <div className="bg-white rounded-lg shadow-sm p-2"><nav className="flex space-x-2">{tabs.map(tab => <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-4 py-2 rounded-md text-sm font-medium ${activeTab === tab.id ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}`}>{tab.label}</button>)}</nav></div>
            <div>{renderContent()}</div>
        </div>
    );
};

export default FairsAndEvents;
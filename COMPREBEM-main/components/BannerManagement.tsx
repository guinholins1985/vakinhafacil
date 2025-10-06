import React, { useState, useRef } from 'react';
import { AppState, Banner, AffiliateLink, AdSenseConfig } from '../types.ts';
import { TrashIcon, SparklesIcon, UploadIcon, StarIcon, CodeBracketIcon } from './Icons.tsx';
import { GoogleGenAI } from "@google/genai";
import { v4 as uuidv4 } from 'uuid';

// --- Shared Components ---
const ToggleSwitch: React.FC<{ checked: boolean, onChange: (checked: boolean) => void, labelOn?: string, labelOff?: string }> = ({ checked, onChange, labelOn, labelOff }) => (
    <label className="flex items-center cursor-pointer">
        <div className="relative">
            <input type="checkbox" className="sr-only peer" checked={checked} onChange={(e) => onChange(e.target.checked)} />
            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-green-500 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
        </div>
    </label>
);

// --- Banner Management Components ---
const BannerPreview: React.FC<{ bannerData: Banner }> = ({ bannerData }) => {
    if (!bannerData.imageUrl) {
        return <div className="h-40 bg-gray-100 flex items-center justify-center text-gray-500 text-sm rounded-lg border">A pré-visualização aparecerá aqui</div>;
    }
    return (
        <div className="relative h-40 w-full bg-gray-200 rounded-lg overflow-hidden border">
            <img src={bannerData.imageUrl} alt="Banner Preview" className="w-full h-full object-cover" />
            <div 
                className="absolute inset-0 flex flex-col items-center justify-center text-center p-2 bg-black/30"
                style={{ color: bannerData.textColor || '#FFFFFF' }}
            >
                {bannerData.title && <h2 className="text-2xl font-bold drop-shadow-md">{bannerData.title}</h2>}
                {bannerData.subtitle && <p className="text-sm mt-1 drop-shadow">{bannerData.subtitle}</p>}
                {bannerData.buttonText && (
                    <button className="mt-2 bg-white text-gray-800 font-bold py-1 px-3 rounded-md text-xs">
                        {bannerData.buttonText}
                    </button>
                )}
            </div>
        </div>
    );
};

const BannerFormModal: React.FC<{ banner: Banner | null; onClose: () => void; onSave: (banner: Banner) => void; }> = ({ banner, onClose, onSave }) => {
    const isNew = banner === null;
    const [formData, setFormData] = useState<Banner>(banner || {
        id: 0, imageUrl: '', altText: '', link: '#', isActive: true, title: '', subtitle: '', textColor: '#FFFFFF', buttonText: '', position: 'hero',
    });
    const [isGenerating, setIsGenerating] = useState(false);
    const [aiPrompt, setAiPrompt] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const isCheckbox = type === 'checkbox' && 'checked' in e.target;
        setFormData(prev => ({ ...prev, [name]: isCheckbox ? (e.target as HTMLInputElement).checked : value }));
    };

    const handleImageImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onloadend = () => setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const handleGenerateImage = async () => {
        if (!aiPrompt) return;
        setIsGenerating(true);
        try {
            const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
            const response = await ai.models.generateImages({
                model: 'imagen-4.0-generate-001', prompt: `Banner para e-commerce de supermercado: ${aiPrompt}`, config: { numberOfImages: 1, outputMimeType: 'image/jpeg', aspectRatio: '16:9' }
            });
            const imageUrl = `data:image/jpeg;base64,${response.generatedImages[0].image.imageBytes}`;
            setFormData(prev => ({ ...prev, imageUrl }));
        } catch (error) {
            console.error("Erro ao gerar imagem com IA:", error);
            alert("Falha ao gerar a imagem. Tente novamente.");
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl max-h-full flex flex-col">
                <h2 className="text-2xl font-bold mb-4 flex-shrink-0">{isNew ? 'Adicionar Novo Banner' : 'Editar Banner'}</h2>
                <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-8 overflow-y-auto pr-2">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Imagem do Banner</label>
                            <div className="space-y-3 p-3 border rounded-md bg-gray-50">
                                <div className="flex gap-2"><input type="text" placeholder="Descreva a imagem para a IA..." value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} className="flex-grow p-2 border rounded-md text-sm" /><button type="button" onClick={handleGenerateImage} disabled={isGenerating || !aiPrompt} className="flex items-center gap-2 bg-blue-600 text-white font-bold py-2 px-3 rounded-lg hover:bg-blue-700 disabled:bg-blue-300"><SparklesIcon className="h-4 w-4" />{isGenerating ? 'Gerando...' : 'Gerar'}</button></div>
                                <div className="flex items-center text-xs text-gray-400"><div className="flex-grow border-t"></div><span className="flex-shrink mx-2">OU</span><div className="flex-grow border-t"></div></div>
                                <div className="flex gap-2"><input type="text" name="imageUrl" placeholder="Cole a URL da imagem" value={formData.imageUrl} onChange={handleChange} className="flex-grow p-2 border rounded-md text-sm" /><button type="button" onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 font-semibold py-2 px-3 rounded-lg hover:bg-gray-100"><UploadIcon className="h-4 w-4" /> Importar</button><input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageImport} /></div>
                            </div>
                        </div>
                        <div><label className="block text-sm font-medium text-gray-700">Link de Redirecionamento</label><input type="text" name="link" placeholder="https://..." value={formData.link} onChange={handleChange} className="mt-1 block w-full border rounded-md p-2" /></div>
                        <div><label className="block text-sm font-medium text-gray-700">Texto Alternativo (Acessibilidade)</label><input type="text" name="altText" value={formData.altText} onChange={handleChange} className="mt-1 block w-full border rounded-md p-2" required /></div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Posicionamento no Site</label>
                            <select name="position" value={formData.position} onChange={handleChange} className="mt-1 block w-full border rounded-md p-2 bg-white">
                                <option value="hero">Carrossel Principal (Hero)</option>
                                <option value="sidebar">Barra Lateral</option>
                                <option value="inline">Meio da Página (Inline)</option>
                                <option value="middle">Meio da Página (Entre Seções)</option>
                                <option value="footer">Rodapé</option>
                            </select>
                        </div>
                        <div className="flex items-center"><input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} className="h-4 w-4 rounded" /><label className="ml-2 block text-sm">Ativo</label></div>
                    </div>
                    <div className="space-y-3">
                        <h3 className="font-semibold text-gray-800">Visualizador e Conteúdo (Opcional)</h3>
                        <BannerPreview bannerData={formData} />
                        <div className="grid grid-cols-2 gap-2"><div><label className="block text-xs font-medium">Título</label><input type="text" name="title" value={formData.title} onChange={handleChange} className="mt-1 block w-full border rounded-md p-1 text-sm" /></div><div><label className="block text-xs font-medium">Subtítulo</label><input type="text" name="subtitle" value={formData.subtitle || ''} onChange={handleChange} className="mt-1 block w-full border rounded-md p-1 text-sm" /></div></div>
                        <div className="grid grid-cols-2 gap-2 items-center"><div><label className="block text-xs font-medium">Texto do Botão</label><input type="text" name="buttonText" value={formData.buttonText || ''} onChange={handleChange} className="mt-1 block w-full border rounded-md p-1 text-sm" /></div><div><label className="block text-xs font-medium">Cor do Texto</label><input type="color" name="textColor" value={formData.textColor} onChange={handleChange} className="mt-1 block w-full h-8 border rounded-md" /></div></div>
                    </div>
                </form>
                <div className="flex justify-end space-x-4 pt-4 mt-4 border-t flex-shrink-0"><button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300">Cancelar</button><button type="submit" formAction="submit" onClick={handleSave} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700">Salvar Banner</button></div>
            </div>
        </div>
    );
};

// --- Monetization Components ---
const AffiliateLinksManager: React.FC<{ links: AffiliateLink[]; setLinks: (updater: React.SetStateAction<AffiliateLink[]>) => void; }> = ({ links, setLinks }) => {
    const handleSave = (link: AffiliateLink) => {
        setLinks(prev => {
            const exists = prev.some(l => l.id === link.id);
            return exists ? prev.map(l => l.id === link.id ? link : l) : [link, ...prev];
        });
    };
    const handleDelete = (id: string) => {
        if(window.confirm('Excluir este link de afiliado?')) {
            setLinks(prev => prev.filter(l => l.id !== id));
        }
    };
    const handleToggle = (id: string, isActive: boolean) => {
        setLinks(prev => prev.map(l => l.id === id ? {...l, isActive} : l));
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold mb-4">Links de Afiliados</h3>
            {/* Simple form for new link */}
            <form onSubmit={(e) => { e.preventDefault(); const form = e.currentTarget; const name = (form.elements.namedItem('name') as HTMLInputElement).value; const url = (form.elements.namedItem('url') as HTMLInputElement).value; if(name && url) { handleSave({id: uuidv4(), name, url, isActive: true}); form.reset(); } }} className="flex gap-4 mb-6 p-4 bg-gray-50 rounded-lg border">
                <input name="name" placeholder="Nome do Link (Ex: Amazon)" className="flex-grow p-2 border rounded-md" required />
                <input name="url" placeholder="URL do Afiliado" className="flex-grow p-2 border rounded-md" required />
                <button type="submit" className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg">Adicionar</button>
            </form>
            {/* List of links */}
            <div className="space-y-2">
                {links.map(link => (
                    <div key={link.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                        <div>
                            <p className="font-semibold">{link.name}</p>
                            <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 truncate">{link.url}</a>
                        </div>
                        <div className="flex items-center gap-4">
                            <ToggleSwitch checked={link.isActive} onChange={c => handleToggle(link.id, c)} />
                            <button onClick={() => handleDelete(link.id)} className="text-red-500 hover:text-red-700"><TrashIcon className="h-5 w-5"/></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const AdSenseManager: React.FC<{ config: AdSenseConfig; setConfig: (updater: React.SetStateAction<AdSenseConfig>) => void; }> = ({ config, setConfig }) => {
    const [localConfig, setLocalConfig] = useState(config);
    const handleSave = () => {
        setConfig(localConfig);
        alert('Configurações do AdSense salvas!');
    };
    return (
        <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-6 pb-4 border-b">
                <h3 className="text-xl font-bold text-gray-800">Integração com Google AdSense</h3>
                <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">{localConfig.isEnabled ? 'Ativado' : 'Desativado'}</span>
                    <ToggleSwitch checked={localConfig.isEnabled} onChange={c => setLocalConfig(p => ({...p, isEnabled: c}))} />
                </div>
            </div>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Publisher ID</label>
                    <input type="text" value={localConfig.publisherId} onChange={e => setLocalConfig(p => ({...p, publisherId: e.target.value}))} placeholder="ca-pub-XXXXXXXXXXXXXXXX" className="mt-1 block w-full border rounded-md p-2 font-mono" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Ad Slot ID</label>
                    <input type="text" value={localConfig.slotId} onChange={e => setLocalConfig(p => ({...p, slotId: e.target.value}))} placeholder="Slot ID do anúncio" className="mt-1 block w-full border rounded-md p-2 font-mono" />
                </div>
            </div>
            <div className="mt-6 text-right">
                <button onClick={handleSave} className="bg-blue-600 text-white font-bold py-2 px-5 rounded-lg">Salvar Configurações</button>
            </div>
        </div>
    );
};


// --- Main Component ---
interface BannerManagementProps {
    appState: AppState;
    setAppState: React.Dispatch<React.SetStateAction<AppState>>;
    showToast: (message: string) => void;
}

const BannerManagement: React.FC<BannerManagementProps> = ({ appState, setAppState, showToast }) => {
    const [activeTab, setActiveTab] = useState('banners');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBanner, setEditingBanner] = useState<Banner | null>(null);

    const { banners, affiliateLinks, adsenseConfig } = appState;

    const handleSaveBanner = (banner: Banner) => {
        const isNew = !banners.some(b => b.id === banner.id && banner.id !== 0);
        
        if (isNew) {
            const newBanner = { ...banner, id: Date.now() }; // Assign local ID
            setAppState(prev => ({...prev, banners: [newBanner, ...prev.banners]}));
            showToast('Banner criado com sucesso!');
        } else {
            setAppState(prev => ({...prev, banners: prev.banners.map(b => b.id === banner.id ? banner : b)}));
            showToast('Banner atualizado com sucesso!');
        }
    };
    
    const handleDeleteBanner = (id: number) => {
        if(window.confirm('Excluir este banner?')) {
            setAppState(prev => ({ ...prev, banners: prev.banners.filter(b => b.id !== id) }));
            showToast('Banner excluído com sucesso!');
        }
    };

    const handleToggleBanner = (id: number, isActive: boolean) => {
        setAppState(prev => ({...prev, banners: prev.banners.map(b => b.id === id ? {...b, isActive} : b)}));
        showToast('Status do banner atualizado!');
    };

    const tabs = [
        { id: 'banners', label: 'Banners' },
        { id: 'affiliates', label: 'Links de Afiliados' },
        { id: 'adsense', label: 'Google AdSense' },
    ];
    
    const renderContent = () => {
        switch(activeTab) {
            case 'banners': return (
                <div>
                    <div className="text-right mb-4">
                        <button onClick={() => { setEditingBanner(null); setIsModalOpen(true); }} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg">Adicionar Banner</button>
                    </div>
                    <div className="bg-white rounded-lg shadow-md overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-600">
                             <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                                <tr>
                                    <th scope="col" className="px-6 py-3 w-32">Pré-visualização</th><th scope="col" className="px-6 py-3">Título / Texto Alt</th><th scope="col" className="px-6 py-3">Status</th><th scope="col" className="px-6 py-3 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {banners.map((banner) => (
                                    <tr key={banner.id} className="bg-white border-b hover:bg-gray-50">
                                        <td className="px-6 py-4"><img src={banner.imageUrl} alt={banner.altText} className="h-12 w-24 rounded-md object-cover bg-gray-100 border" /></td>
                                        <td className="px-6 py-4 font-medium text-gray-900"><div className="font-bold">{banner.title || banner.altText}</div><a href={banner.link} className="text-xs text-blue-600 hover:underline truncate">{banner.link}</a></td>
                                        <td className="px-6 py-4"><ToggleSwitch checked={banner.isActive} onChange={(c) => handleToggleBanner(banner.id, c)} /></td>
                                        <td className="px-6 py-4 text-right whitespace-nowrap">
                                            <button onClick={() => { setEditingBanner(banner); setIsModalOpen(true); }} className="font-medium text-blue-600 hover:underline">Editar</button>
                                            <button onClick={() => handleDeleteBanner(banner.id)} className="font-medium text-red-600 hover:underline ml-4">Excluir</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {banners.length === 0 && <p className="text-center py-8 text-gray-500">Nenhum banner encontrado.</p>}
                    </div>
                </div>
            );
            case 'affiliates': return <AffiliateLinksManager links={affiliateLinks} setLinks={(updater) => setAppState(s => ({...s, affiliateLinks: typeof updater === 'function' ? updater(s.affiliateLinks) : updater}))} />;
            case 'adsense': return <AdSenseManager config={adsenseConfig} setConfig={(updater) => setAppState(s => ({...s, adsenseConfig: typeof updater === 'function' ? updater(s.adsenseConfig) : updater}))} />;
            default: return null;
        }
    };

    return (
        <div className="space-y-6">
            {isModalOpen && <BannerFormModal banner={editingBanner} onClose={() => setIsModalOpen(false)} onSave={handleSaveBanner} />}
            <h2 className="text-3xl font-bold text-gray-800">Gestão de Banners e Monetização</h2>
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

export default BannerManagement;
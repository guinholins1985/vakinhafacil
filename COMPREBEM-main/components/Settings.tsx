import React, { useState, useRef } from 'react';
import { AppState, PresetTheme, Integration, SecuritySettings, PaymentMethod, SiteIdentity, PaymentGateway, ThemeColors, TypographySettings, HomePageContent, CategoryPromoItem } from '../types';
import { PaletteIcon, TypeIcon, Square3Stack3DIcon, CreditCardIcon, ShieldCheckIcon, IdentificationIcon, ChevronDownIcon, KeyIcon, CodeBracketIcon, GoogleIcon, FacebookIcon, MailIcon, AdminIcon, ShoppingCartIcon, MarketingIcon, UploadIcon, SparklesIcon, PlusIcon, TrashIcon } from './Icons';
import { GoogleGenAI } from "@google/genai";

// --- Helper to convert file to data URL ---
const fileToDataUrl = (file: File | Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

interface SettingsProps {
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
  onApplyPresetTheme: (preset: PresetTheme) => void;
}

const Accordion: React.FC<{ title: string; icon: React.FC<any>; children: React.ReactNode; defaultOpen?: boolean }> = ({ title, icon: Icon, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div className="border rounded-lg bg-white shadow-sm">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 rounded-t-lg">
                <div className="flex items-center">
                    <Icon className="h-5 w-5 mr-3 text-gray-600"/>
                    <h3 className="text-lg font-bold text-gray-800">{title}</h3>
                </div>
                <ChevronDownIcon className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && <div className="p-6 border-t">{children}</div>}
        </div>
    );
};

const ToggleSwitch: React.FC<{ checked: boolean, onChange: (checked: boolean) => void, labelOn?: string, labelOff?: string }> = ({ checked, onChange, labelOn, labelOff }) => (
    <label className="flex items-center cursor-pointer">
         {labelOff && <span className={`mr-3 text-sm font-medium ${!checked ? 'text-gray-900' : 'text-gray-400'}`}>{labelOff}</span>}
        <div className="relative">
            <input type="checkbox" className="sr-only peer" checked={checked} onChange={(e) => onChange(e.target.checked)} />
            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
        </div>
        {labelOn && <span className={`ml-3 text-sm font-medium ${checked ? 'text-gray-900' : 'text-gray-400'}`}>{labelOn}</span>}
    </label>
);

const ImageUploader: React.FC<{ label: string; currentUrl: string; onUpload: (url: string) => void; }> = ({ label, currentUrl, onUpload }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setIsUploading(true);
            try {
                const url = await fileToDataUrl(e.target.files[0]);
                onUpload(url);
            } catch (error) {
                console.error("Upload failed:", error);
                alert("Falha no upload da imagem.");
            } finally {
                setIsUploading(false);
            }
        }
    };
    
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <div className="flex items-center gap-4">
                <img src={currentUrl} alt={`${label} Preview`} className="h-12 w-12 rounded-md border p-1 object-contain bg-gray-50" />
                <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 font-semibold py-2 px-3 rounded-lg hover:bg-gray-100 text-sm disabled:bg-gray-200">
                    <UploadIcon className="h-4 w-4" /> {isUploading ? 'Enviando...' : 'Importar'}
                </button>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/png, image/jpeg, image/svg+xml, image/x-icon" onChange={handleFileChange} />
            </div>
        </div>
    );
};

const presetThemes: PresetTheme[] = [
    { name: 'Padrão Atacadão', colors: { primary: '#004f9e', secondary: '#249f49', 'header-bg': '#2c2a29', 'header-text': '#ffffff', 'footer-bg': '#333333', 'footer-text': '#FFFFFF' } },
    { name: 'Vibrante', colors: { primary: '#6a0dad', secondary: '#ff7f50', 'header-bg': '#4B0082', 'header-text': '#ffffff', 'footer-bg': '#333', 'footer-text': '#fff'} },
    { name: 'Natureza', colors: { primary: '#006400', secondary: '#ffdf00', 'header-bg': '#013220', 'header-text': '#ffffff', 'footer-bg': '#3e4444', 'footer-text': '#ffffff' } },
    { name: 'Oceano Profundo', colors: { primary: '#0a2342', secondary: '#2ca58d', 'header-bg': '#021a31', 'header-text': '#ffffff', 'footer-bg': '#0a2342', 'footer-text': '#FFFFFF' } },
    { name: 'Clean & Modern', colors: { primary: '#1e293b', secondary: '#475569', 'header-bg': '#ffffff', 'header-text': '#1e293b', 'footer-bg': '#1e293b', 'footer-text': '#ffffff' }},
    { name: 'Luxo', colors: { primary: '#D4AF37', secondary: '#4A4A4A', 'header-bg': 'linear-gradient(to right, #141E30, #243B55)', 'header-text': '#D4AF37', 'footer-bg': '#141E30', 'footer-text': '#D4AF37' }},
    { name: 'Pôr do Sol', colors: { primary: '#c33764', secondary: '#1d2671', 'header-bg': 'linear-gradient(to right, #F37335, #FDC830)', 'header-text': '#ffffff', 'footer-bg': '#232526', 'footer-text': '#ffffff' }},
    { name: 'Aurora Boreal', colors: { primary: '#4c5fd7', secondary: '#10b981', 'header-bg': 'linear-gradient(to right, #0f2027, #203a43, #2c5364)', 'header-text': '#ffffff', 'footer-bg': '#0f2027', 'footer-text': '#ffffff' }},
    { name: 'Doce Cítrico', colors: { primary: '#e96443', secondary: '#904e95', 'header-bg': 'linear-gradient(to right, #f12711, #f5af19)', 'header-text': '#ffffff', 'footer-bg': '#3a1c71', 'footer-text': '#ffffff' }},
    { name: 'Lavanda Fresca', colors: { primary: '#8e44ad', secondary: '#2ecc71', 'header-bg': '#9b59b6', 'header-text': '#ffffff', 'footer-bg': '#2c3e50', 'footer-text': '#ecf0f1' }},
    { name: 'Executivo', colors: { primary: '#2c3e50', secondary: '#bdc3c7', 'header-bg': '#34495e', 'header-text': '#ffffff', 'footer-bg': '#2c3e50', 'footer-text': '#bdc3c7' }},
    { name: 'Verde Esmeralda', colors: { primary: '#009b4d', secondary: '#00c6ad', 'header-bg': 'linear-gradient(to right, #00467f, #a5cc82)', 'header-text': '#ffffff', 'footer-bg': '#00203FFF', 'footer-text': '#ADEFD1FF' }},
    { name: 'Rubi Intenso', colors: { primary: '#e52d27', secondary: '#b31217', 'header-bg': 'linear-gradient(to right, #D31027, #EA384D)', 'header-text': '#ffffff', 'footer-bg': '#1f1c2c', 'footer-text': '#ffffff' }},
    { name: 'Outono Aconchegante', colors: { primary: '#c0392b', secondary: '#d35400', 'header-bg': '#e67e22', 'header-text': '#ffffff', 'footer-bg': '#78332d', 'footer-text': '#ffffff' }},
    { name: 'Tecnologia', colors: { primary: '#00c3ff', secondary: '#ffff1c', 'header-bg': 'linear-gradient(to right, #1f1c2c, #928dab)', 'header-text': '#ffffff', 'footer-bg': '#1f1c2c', 'footer-text': '#ffffff' }},
    { name: 'Rosa Delicado', colors: { primary: '#e8a', secondary: '#f9d', 'header-bg': '#fce', 'header-text': '#c7a', 'footer-bg': '#e8a', 'footer-text': '#fff' }},
    { name: 'Azul Sereno', colors: { primary: '#3498db', secondary: '#2980b9', 'header-bg': '#5dade2', 'header-text': '#ffffff', 'footer-bg': '#2c3e50', 'footer-text': '#ffffff' }},
    { name: 'Areia e Mar', colors: { primary: '#f39c12', secondary: '#3498db', 'header-bg': '#f7dc6f', 'header-text': '#875a0e', 'footer-bg': '#2980b9', 'footer-text': '#ffffff' }},
    { name: 'Grafite', colors: { primary: '#34495e', secondary: '#95a5a6', 'header-bg': '#2c3e50', 'header-text': '#ecf0f1', 'footer-bg': '#bdc3c7', 'footer-text': '#2c3e50' }},
    { name: 'Ametista', colors: { primary: '#9b59b6', secondary: '#8e44ad', 'header-bg': 'linear-gradient(to right, #8e2de2, #4a00e0)', 'header-text': '#ffffff', 'footer-bg': '#3e1a53', 'footer-text': '#ffffff' }},
];

const availableFonts: { name: string, family: string }[] = [
    { name: 'Inter', family: "'Inter', sans-serif" },
    { name: 'Roboto', family: "'Roboto', sans-serif" },
    { name: 'Open Sans', family: "'Open Sans', sans-serif" },
    { name: 'Lato', family: "'Lato', sans-serif" },
    { name: 'Montserrat', family: "'Montserrat', sans-serif" },
    { name: 'Oswald', family: "'Oswald', sans-serif" },
    { name: 'Source Sans Pro', family: "'Source Sans Pro', sans-serif" },
    { name: 'Slabo 27px', family: "'Slabo 27px', serif" },
    { name: 'Raleway', family: "'Raleway', sans-serif" },
    { name: 'PT Sans', family: "'PT Sans', sans-serif" },
    { name: 'Merriweather', family: "'Merriweather', serif" },
    { name: 'Noto Sans', family: "'Noto Sans', sans-serif" },
    { name: 'Nunito Sans', family: "'Nunito Sans', sans-serif" },
    { name: 'Concert One', family: "'Concert One', cursive" },
    { name: 'Poppins', family: "'Poppins', sans-serif" },
    { name: 'Ubuntu', family: "'Ubuntu', sans-serif" },
    { name: 'Playfair Display', family: "'Playfair Display', serif" },
    { name: 'Fira Sans', family: "'Fira Sans', sans-serif" },
    { name: 'Rubik', family: "'Rubik', sans-serif" },
    { name: 'Work Sans', family: "'Work Sans', sans-serif" },
    { name: 'Dosis', family: "'Dosis', sans-serif" },
    { name: 'Libre Baskerville', family: "'Libre Baskerville', serif" },
    { name: 'Arimo', family: "'Arimo', sans-serif" },
    { name: 'Cabin', family: "'Cabin', sans-serif" },
    { name: 'Bitter', family: "'Bitter', serif" },
    { name: 'Lora', family: "'Lora', serif" },
    { name: 'Anton', family: "'Anton', sans-serif" },
    { name: 'Pacifico', family: "'Pacifico', cursive" },
    { name: 'Exo 2', family: "'Exo 2', sans-serif" },
    { name: 'Quicksand', family: "'Quicksand', sans-serif" },
    { name: 'Josefin Sans', family: "'Josefin Sans', sans-serif" },
    { name: 'Mulish', family: "'Mulish', sans-serif" },
    { name: 'Titillium Web', family: "'Titillium Web', sans-serif" },
    { name: 'Comfortaa', family: "'Comfortaa', cursive" },
    { name: 'Abel', family: "'Abel', sans-serif" },
    { name: 'Archivo', family: "'Archivo', sans-serif" },
    { name: 'Asap', family: "'Asap', sans-serif" },
    { name: 'Barlow', family: "'Barlow', sans-serif" },
    { name: 'Bebas Neue', family: "'Bebas Neue', cursive" },
    { name: 'Cormorant Garamond', family: "'Cormorant Garamond', serif" },
    { name: 'Crimson Text', family: "'Crimson Text', serif" },
    { name: 'Dancing Script', family: "'Dancing Script', cursive" },
    { name: 'DM Sans', family: "'DM Sans', sans-serif" },
    { name: 'Eczar', family: "'Eczar', serif" },
    { name: 'Faustina', family: "'Faustina', serif" },
    { name: 'Fjalla One', family: "'Fjalla One', sans-serif" },
    { name: 'Frank Ruhl Libre', family: "'Frank Ruhl Libre', serif" },
    { name: 'IBM Plex Sans', family: "'IBM Plex Sans', sans-serif" },
    { name: 'Inconsolata', family: "'Inconsolata', monospace" },
    { name: 'Indie Flower', family: "'Indie Flower', cursive" },
    { name: 'JetBrains Mono', family: "'JetBrains Mono', monospace" },
    { name: 'Jura', family: "'Jura', sans-serif" },
    { name: 'Karla', family: "'Karla', sans-serif" },
    { name: 'Libre Franklin', family: "'Libre Franklin', sans-serif" },
    { name: 'Manrope', family: "'Manrope', sans-serif" },
    { name: 'Maven Pro', family: "'Maven Pro', sans-serif" },
    { name: 'Mukta', family: "'Mukta', sans-serif" },
    { name: 'Nanum Gothic', family: "'Nanum Gothic', sans-serif" },
    { name: 'Overpass', family: "'Overpass', sans-serif" },
    { name: 'Oxygen', family: "'Oxygen', sans-serif" },
    { name: 'PT Serif', family: "'PT Serif', serif" },
    { name: 'Rajdhani', family: "'Rajdhani', sans-serif" },
    { name: 'Red Hat Display', family: "'Red Hat Display', sans-serif" },
    { name: 'Ruda', family: "'Ruda', sans-serif" },
    { name: 'Shadows Into Light', family: "'Shadows Into Light', cursive" },
    { name: 'Signika', family: "'Signika', sans-serif" },
    { name: 'Space Mono', family: "'Space Mono', monospace" },
    { name: 'Spectral', family: "'Spectral', serif" },
    { name: 'Teko', family: "'Teko', sans-serif" },
    { name: 'Vollkorn', family: "'Vollkorn', serif" },
    { name: 'Zilla Slab', family: "'Zilla Slab', serif" },
    { name: 'Yantramanav', family: "'Yantramanav', sans-serif" },
    { name: 'BioRhyme', family: "'BioRhyme', serif" },
    { name: 'Chivo', family: "'Chivo', sans-serif" },
    { name: 'Domine', family: "'Domine', serif" },
    { name: 'Heebo', family: "'Heebo', sans-serif" },
    { name: 'Hind', family: "'Hind', sans-serif" },
    { name: 'Kanit', family: "'Kanit', sans-serif" },
    { name: 'Martel Sans', family: "'Martel Sans', sans-serif" },
    { name: 'Merriweather Sans', family: "'Merriweather Sans', sans-serif" },
    { name: 'Monda', family: "'Monda', sans-serif" },
    { name: 'Noto Serif', family: "'Noto Serif', serif" },
    { name: 'Nunito', family: "'Nunito', sans-serif" },
    { name: 'Old Standard TT', family: "'Old Standard TT', serif" },
    { name: 'Pathway Gothic One', family: "'Pathway Gothic One', sans-serif" },
    { name: 'Play', family: "'Play', sans-serif" },
    { name: 'Prompt', family: "'Prompt', sans-serif" },
    { name: 'Quantico', family: "'Quantico', sans-serif" },
    { name: 'Rakkas', family: "'Rakkas', cursive" },
    { name: 'Righteous', family: "'Righteous', cursive" },
    { name: 'Roboto Condensed', family: "'Roboto Condensed', sans-serif" },
    { name: 'Roboto Mono', family: "'Roboto Mono', monospace" },
    { name: 'Roboto Slab', family: "'Roboto Slab', serif" },
    { name: 'Ropa Sans', family: "'Ropa Sans', sans-serif" },
    { name: 'Rubik Mono One', family: "'Rubik Mono One', sans-serif" },
    { name: 'Sarabun', family: "'Sarabun', sans-serif" },
    { name: 'Source Code Pro', family: "'Source Code Pro', monospace" },
    { name: 'Taviraj', family: "'Taviraj', serif" },
    { name: 'Tinos', family: "'Tinos', serif" },
    { name: 'Trirong', family: "'Trirong', serif" },
    { name: 'Varela Round', family: "'Varela Round', sans-serif" },
    { name: 'Vesper Libre', family: "'Vesper Libre', serif" },
    { name: 'Yrsa', family: "'Yrsa', serif" }
];

const ThemeCard: React.FC<{ theme: PresetTheme, onClick: () => void }> = ({ theme, onClick }) => (
    <button onClick={onClick} className="border-2 rounded-lg p-3 text-left hover:border-blue-500 transition-all w-full focus:outline-none focus:ring-2 focus:ring-blue-400">
        <div className="h-16 w-full rounded-md mb-2 flex flex-col overflow-hidden">
            <div className="h-1/2 w-full" style={{background: theme.colors['header-bg']}}></div>
            <div className="h-1/2 w-full flex">
                <div className="w-1/2 h-full" style={{backgroundColor: theme.colors.primary}}></div>
                <div className="w-1/2 h-full" style={{backgroundColor: theme.colors.secondary}}></div>
            </div>
        </div>
        <p className="text-sm font-semibold text-center">{theme.name}</p>
    </button>
);


const IntegrationCard: React.FC<{ integration: Integration; onUpdate: (updatedIntegration: Integration) => void; icon: React.ReactNode }> = ({ integration, onUpdate, icon }) => (
    <div className="p-4 border rounded-lg flex items-center justify-between bg-gray-50">
        <div className="flex items-center">
            <div className="w-10 h-10 mr-4 flex items-center justify-center">{icon}</div>
            <div>
                <p className="font-bold text-gray-800">{integration.name}</p>
                <input type="text" value={integration.apiKey} onChange={e => onUpdate({...integration, apiKey: e.target.value})} placeholder="ID ou Chave de API" className="text-xs p-1 border rounded-md w-48 mt-1" disabled={!integration.enabled} />
            </div>
        </div>
        <ToggleSwitch checked={integration.enabled} onChange={checked => onUpdate({...integration, enabled: checked})} />
    </div>
);

const GatewayCard: React.FC<{ gateway: PaymentGateway; onUpdate: (gateway: PaymentGateway) => void; }> = ({ gateway, onUpdate }) => (
    <div className="p-4 border rounded-lg bg-gray-50">
        <div className="flex justify-between items-center mb-4">
            <h4 className="font-bold text-lg text-gray-800">{gateway.name}</h4>
            <ToggleSwitch checked={gateway.enabled} onChange={enabled => onUpdate({ ...gateway, enabled })} />
        </div>
        <div className="space-y-3">
            <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Public Key / Client ID</label>
                <input 
                    type="text" 
                    value={gateway.publicKey} 
                    onChange={e => onUpdate({ ...gateway, publicKey: e.target.value })} 
                    className="w-full p-2 border rounded-md text-sm font-mono disabled:bg-gray-200"
                    disabled={!gateway.enabled}
                    placeholder="Cole sua chave pública aqui"
                />
            </div>
            <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Secret Key / Client Secret</label>
                <input 
                    type="password" 
                    value={gateway.secretKey} 
                    onChange={e => onUpdate({ ...gateway, secretKey: e.target.value })} 
                    className="w-full p-2 border rounded-md text-sm font-mono disabled:bg-gray-200"
                    disabled={!gateway.enabled}
                    placeholder="••••••••••••••••••••"
                />
            </div>
        </div>
    </div>
);

const PaymentMethodCard: React.FC<{
    method: PaymentMethod;
    onToggle: (id: string, enabled: boolean) => void;
    onIconUpdate: (id: string, url: string) => void;
}> = ({ method, onToggle, onIconUpdate }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [aiPrompt, setAiPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setIsGenerating(true);
            try {
                const url = await fileToDataUrl(e.target.files[0]);
                onIconUpdate(method.id, url);
            } catch (error) {
                console.error(error);
                alert("Falha no upload do ícone.");
            } finally {
                setIsGenerating(false);
            }
        }
    };

    const handleGenerateIcon = async () => {
        if (!aiPrompt) return;
        setIsGenerating(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const fullPrompt = `Modern icon for a payment method flag: '${aiPrompt}'. Clean, simple vector style, flat design, suitable for a modern web interface, on a white background.`;
            const response = await ai.models.generateImages({
                model: 'imagen-4.0-generate-001',
                prompt: fullPrompt,
                config: { numberOfImages: 1, outputMimeType: 'image/jpeg', aspectRatio: '1:1' }
            });
            const base64ImageBytes = response.generatedImages[0].image.imageBytes;
            const imageUrl = `data:image/jpeg;base64,${base64ImageBytes}`;
            
            onIconUpdate(method.id, imageUrl);
            setAiPrompt('');
        } catch (error) {
            console.error("Error generating icon with AI:", error);
            alert("Falha ao gerar o ícone com IA. Verifique o console para mais detalhes.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="p-4 border rounded-lg bg-gray-50 space-y-3 flex flex-col justify-between">
            <div>
                <div className="flex justify-between items-center">
                    <p className="text-sm font-semibold text-gray-800">{method.name}</p>
                    <ToggleSwitch checked={method.enabled} onChange={checked => onToggle(method.id, checked)} />
                </div>
                <div className="flex justify-center my-3">
                    <img src={method.iconUrl} alt={method.name} className="h-10 object-contain bg-white p-1 border rounded-md shadow-sm" />
                </div>
            </div>
            <div className="space-y-3">
                <div>
                    <label className="text-xs font-medium text-gray-600">URL do Ícone</label>
                    <div className="flex gap-2 mt-1">
                        <input
                            type="text"
                            value={method.iconUrl}
                            onChange={(e) => onIconUpdate(method.id, e.target.value)}
                            className="w-full p-1 border border-gray-300 rounded-md text-xs bg-white"
                        />
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="p-2 bg-white border border-gray-300 rounded-md hover:bg-gray-100"
                            aria-label="Importar imagem"
                            disabled={isGenerating}
                        >
                            <UploadIcon className="h-4 w-4 text-gray-600" />
                        </button>
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                    </div>
                </div>
                <div className="pt-3 border-t">
                    <label className="text-xs font-medium text-gray-600">Gerar Ícone com IA</label>
                    <div className="flex gap-2 mt-1">
                        <input
                            type="text"
                            placeholder={`Ex: Bandeira ${method.name} estilo neon`}
                            value={aiPrompt}
                            onChange={(e) => setAiPrompt(e.target.value)}
                            className="w-full p-1 border border-gray-300 rounded-md text-xs bg-white"
                            disabled={isGenerating}
                        />
                        <button
                            type="button"
                            onClick={handleGenerateIcon}
                            className="p-2 w-10 flex justify-center items-center bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
                            aria-label="Gerar com IA"
                            disabled={isGenerating || !aiPrompt}
                        >
                            {isGenerating ? 
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> :
                                <SparklesIcon className="h-4 w-4" />
                            }
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};


const Settings: React.FC<SettingsProps> = ({ appState, setAppState, onApplyPresetTheme }) => {
  const [activeTab, setActiveTab] = useState('general');
  
  const handleSiteIdentityUpdate = (field: keyof SiteIdentity, value: any) => {
    setAppState(prev => ({ ...prev, siteIdentity: {...prev.siteIdentity, [field]: value }}));
  };

  const handleTypographyUpdate = (field: keyof TypographySettings, value: any) => {
    setAppState(prev => ({ ...prev, typography: {...prev.typography, [field]: value }}));
  };

  const handleThemeColorChange = (key: keyof ThemeColors, value: string) => {
      setAppState(prev => ({
          ...prev,
          theme: { ...prev.theme, [key]: value }
      }));
  };
  
  const handleIntegrationUpdate = (updatedIntegration: Integration) => {
      setAppState(prev => ({
          ...prev,
          integrations: prev.integrations.map(i => i.id === updatedIntegration.id ? updatedIntegration : i)
      }));
  };

  const handleGatewayUpdate = (updatedGateway: PaymentGateway) => {
      setAppState(prev => ({
          ...prev,
          paymentGateways: prev.paymentGateways.map(g => g.id === updatedGateway.id ? updatedGateway : g)
      }));
  };
  
  const handleSecurityUpdate = (key: keyof SecuritySettings, value: any) => {
      setAppState(prev => ({
          ...prev,
          securitySettings: { ...prev.securitySettings, [key]: value }
      }));
  };

  const handlePaymentMethodToggle = (id: string, enabled: boolean) => {
      setAppState(prev => ({
          ...prev,
          footerSettings: {
              ...prev.footerSettings,
              paymentMethods: prev.footerSettings.paymentMethods.map(p => p.id === id ? { ...p, enabled } : p)
          }
      }));
  };

  const handlePaymentMethodIconUpdate = (id: string, url: string) => {
      setAppState(prev => ({
          ...prev,
          footerSettings: {
              ...prev.footerSettings,
              paymentMethods: prev.footerSettings.paymentMethods.map(p => p.id === id ? { ...p, iconUrl: url } : p)
          }
      }));
  };
  
  const handleFooterLinkChange = (sectionId: string, linkId: string, field: 'text' | 'url', value: string) => {
      setAppState(prev => ({
          ...prev,
          footerSettings: {
              ...prev.footerSettings,
              sections: prev.footerSettings.sections.map(s => s.id === sectionId ? {
                  ...s,
                  links: s.links.map(l => l.id === linkId ? { ...l, [field]: value } : l)
              } : s)
          }
      }));
  };
  
  const handlePromoChange = (promoId: number, field: 'title' | 'subtitle' | 'imageUrl', value: string) => {
      setAppState(prev => ({
          ...prev,
          promos: prev.promos.map(p => p.id === promoId ? { ...p, [field]: value } : p)
      }));
  };

  const handleHomePageContentChange = (field: keyof HomePageContent, value: string) => {
    setAppState(prev => ({
        ...prev,
        homePage: {
            ...prev.homePage,
            [field]: value
        }
    }));
  };

    const handleAddPromo = () => {
        const newPromo: CategoryPromoItem = {
            id: Date.now(),
            title: 'Nova Promoção',
            subtitle: 'Subtítulo',
            imageUrl: 'https://via.placeholder.com/200x250'
        };
        setAppState(prev => ({
            ...prev,
            promos: [...prev.promos, newPromo]
        }));
    };

    const handleRemovePromo = (promoId: number) => {
        if (window.confirm('Tem certeza que deseja remover este item?')) {
            setAppState(prev => ({
                ...prev,
                promos: prev.promos.filter(p => p.id !== promoId)
            }));
        }
    };

  const tabs = [
    { id: 'general', label: 'Aparência', icon: PaletteIcon },
    { id: 'content', label: 'Conteúdo', icon: TypeIcon },
    { id: 'integrations', label: 'Integrações', icon: Square3Stack3DIcon },
    { id: 'payments', label: 'Pagamentos', icon: CreditCardIcon },
    { id: 'security', label: 'Segurança', icon: ShieldCheckIcon },
  ];
  
  const integrationIcons = {
      google_analytics: <GoogleIcon className="h-8 w-8" />,
      facebook_pixel: <FacebookIcon className="h-8 w-8 text-blue-600" />,
      mailchimp: <MailIcon className="h-8 w-8 text-gray-700" />,
      erp_sap: <AdminIcon className="h-8 w-8 text-blue-800" />,
      vtex_oms: <ShoppingCartIcon className="h-8 w-8 text-pink-500" />
  };

  const renderContent = () => {
    switch(activeTab) {
      case 'general':
        return (
          <div className="space-y-6">
            <Accordion title="Identidade Visual e Tipografia" icon={IdentificationIcon} defaultOpen>
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    <div className="space-y-6">
                        <ImageUploader label="Logo" currentUrl={appState.siteIdentity.logoUrl} onUpload={url => handleSiteIdentityUpdate('logoUrl', url)} />
                        <ImageUploader label="Favicon" currentUrl={appState.siteIdentity.faviconUrl} onUpload={url => handleSiteIdentityUpdate('faviconUrl', url)} />
                    </div>
                    <div className="space-y-6 p-4 bg-gray-50 rounded-lg border">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Posicionamento da Logo</label>
                            <div className="mt-2"><ToggleSwitch checked={appState.siteIdentity.logoCentered} onChange={c => handleSiteIdentityUpdate('logoCentered', c)} labelOff="Esquerda" labelOn="Centralizado" /></div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Redimensionamento da Logo (Altura)</label>
                            <div className="flex items-center gap-4">
                                <input type="range" min="20" max="100" value={appState.siteIdentity.logoHeight} onChange={e => handleSiteIdentityUpdate('logoHeight', Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                                <span className="font-bold text-sm">{appState.siteIdentity.logoHeight}px</span>
                            </div>
                        </div>
                        <div>
                             <label htmlFor="logoEffect" className="block text-sm font-medium text-gray-700">Efeitos Visuais na Logo</label>
                             <select id="logoEffect" name="logoEffect" value={appState.siteIdentity.logoEffect} onChange={e => handleSiteIdentityUpdate('logoEffect', e.target.value)} className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                                <option value="none">Nenhum</option>
                                <option value="shadow">Sombra</option>
                                <option value="grayscale">Escala de Cinza</option>
                                <option value="sepia">Sépia</option>
                             </select>
                        </div>
                        <div className="border-t pt-4">
                            <label htmlFor="fontFamily" className="block text-sm font-medium text-gray-700">Fonte Principal</label>
                            <select id="fontFamily" name="fontFamily" value={appState.typography.fontFamily} onChange={e => handleTypographyUpdate('fontFamily', e.target.value)} className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm">
                                {availableFonts.map(font => (
                                    <option key={font.name} value={font.family} style={{ fontFamily: font.family }}>
                                        {font.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tamanho da Fonte Base</label>
                            <div className="flex items-center gap-4">
                                <input type="range" min="12" max="20" step="1" value={appState.typography.baseSize} onChange={e => handleTypographyUpdate('baseSize', Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                                <span className="font-bold text-sm">{appState.typography.baseSize}px</span>
                            </div>
                        </div>
                    </div>
                </div>
            </Accordion>
            <Accordion title="Galeria de Templates de Estilo" icon={PaletteIcon}>
                <p className="text-sm text-gray-600 mb-4">Selecione um template para aplicar um novo esquema de cores e estilos ao seu site. Inclui opções com cores sólidas e gradientes.</p>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {presetThemes.map(theme => (
                        <ThemeCard key={theme.name} theme={theme} onClick={() => onApplyPresetTheme(theme)} />
                    ))}
                </div>
            </Accordion>
            <Accordion title="Editor de Tema Atual" icon={PaletteIcon}>
                <p className="text-sm text-gray-600 mb-4">Ajuste fino das cores do tema aplicado. Para gradientes, use a sintaxe CSS, ex: `linear-gradient(to right, #ff0000, #00ff00)`.</p>
                 <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    {Object.entries(appState.theme).map(([key, value]) => (
                        <div key={key}>
                            <label className="capitalize text-sm font-medium text-gray-700 mb-1 block">{key.replace(/-/g, ' ')}</label>
                            <div className="flex items-center border rounded-md focus-within:ring-2 focus-within:ring-blue-500">
                                <input
                                    type="text"
                                    value={value}
                                    onChange={(e) => handleThemeColorChange(key as keyof ThemeColors, e.target.value)}
                                    className="w-full p-2 border-0 rounded-md bg-transparent focus:outline-none"
                                />
                                {typeof value === 'string' && !value.includes('gradient') && (
                                     <input 
                                        type="color" 
                                        value={value}
                                        onChange={(e) => handleThemeColorChange(key as keyof ThemeColors, e.target.value)}
                                        className="h-8 w-10 p-0 border-0 rounded-r-md cursor-pointer"
                                    />
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </Accordion>
          </div>
        );
    case 'content':
        return (
            <div className="space-y-6">
                <Accordion title="Conteúdo da Página Inicial" icon={TypeIcon} defaultOpen>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-semibold text-gray-700">Título da Seção de Categorias</label>
                            <input 
                                type="text" 
                                value={appState.homePage.categoryPromoTitle} 
                                onChange={e => handleHomePageContentChange('categoryPromoTitle', e.target.value)} 
                                className="w-full p-2 border rounded-md mt-1"
                            />
                        </div>
                        <div className="border-t pt-4">
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="text-sm font-semibold text-gray-700">Itens de Promoção de Categoria</h4>
                                <button onClick={handleAddPromo} className="bg-blue-500 text-white text-xs font-bold py-1 px-2 rounded-md flex items-center gap-1 hover:bg-blue-600">
                                    <PlusIcon className="h-4 w-4" /> Adicionar Item
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {appState.promos.map(promo => (
                                    <div key={promo.id} className="p-3 border rounded-lg space-y-2 bg-gray-50 relative group">
                                        <button onClick={() => handleRemovePromo(promo.id)} className="absolute top-2 right-2 p-1 bg-white rounded-full text-red-500 opacity-0 group-hover:opacity-100 hover:bg-red-100 transition-opacity">
                                            <TrashIcon className="h-4 w-4" />
                                        </button>
                                        <div>
                                            <label className="text-xs font-semibold text-gray-600">Título</label>
                                            <input type="text" value={promo.title} onChange={e => handlePromoChange(promo.id, 'title', e.target.value)} className="w-full p-1 border rounded-md text-sm"/>
                                        </div>
                                        <div>
                                            <label className="text-xs font-semibold text-gray-600">Subtítulo</label>
                                            <input type="text" value={promo.subtitle} onChange={e => handlePromoChange(promo.id, 'subtitle', e.target.value)} className="w-full p-1 border rounded-md text-sm"/>
                                        </div>
                                        <div>
                                            <label className="text-xs font-semibold text-gray-600">URL da Imagem</label>
                                            <input type="text" value={promo.imageUrl} onChange={e => handlePromoChange(promo.id, 'imageUrl', e.target.value)} className="w-full p-1 border rounded-md text-sm"/>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </Accordion>
                <Accordion title="Conteúdo do Rodapé" icon={TypeIcon}>
                    {appState.footerSettings.sections.map(section => (
                         <div key={section.id} className="mb-4">
                            <h4 className="font-bold mb-2">{section.title}</h4>
                            {section.links.map(link => (
                                <div key={link.id} className="flex gap-2 items-center mb-1">
                                    <input type="text" placeholder="Texto do Link" value={link.text} onChange={e => handleFooterLinkChange(section.id, link.id, 'text', e.target.value)} className="w-1/2 p-1 border rounded-md text-sm" />
                                    <input type="text" placeholder="URL" value={link.url} onChange={e => handleFooterLinkChange(section.id, link.id, 'url', e.target.value)} className="w-1/2 p-1 border rounded-md text-sm" />
                                </div>
                            ))}
                         </div>
                    ))}
                </Accordion>
            </div>
        );
    case 'integrations':
        return (
             <div className="space-y-6">
                <Accordion title="Marketing e Analytics" icon={MarketingIcon} defaultOpen>
                    <div className="space-y-3">
                       <IntegrationCard integration={appState.integrations.find(i => i.id === 'google_analytics')!} onUpdate={handleIntegrationUpdate} icon={integrationIcons.google_analytics} />
                       <IntegrationCard integration={appState.integrations.find(i => i.id === 'facebook_pixel')!} onUpdate={handleIntegrationUpdate} icon={integrationIcons.facebook_pixel} />
                       <IntegrationCard integration={appState.integrations.find(i => i.id === 'mailchimp')!} onUpdate={handleIntegrationUpdate} icon={integrationIcons.mailchimp} />
                    </div>
                </Accordion>
                 <Accordion title="Plataformas e ERP" icon={Square3Stack3DIcon}>
                    <div className="space-y-3">
                       <IntegrationCard integration={appState.integrations.find(i => i.id === 'erp_sap')!} onUpdate={handleIntegrationUpdate} icon={integrationIcons.erp_sap} />
                       <IntegrationCard integration={appState.integrations.find(i => i.id === 'vtex_oms')!} onUpdate={handleIntegrationUpdate} icon={integrationIcons.vtex_oms} />
                    </div>
                </Accordion>
             </div>
        );
    case 'payments':
        return (
             <div className="space-y-6">
                <Accordion title="Gateways de Pagamento" icon={KeyIcon} defaultOpen>
                    <p className="text-sm text-gray-600 mb-4">Configure as chaves de API para seus gateways de pagamento. As informações inseridas são seguras.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {appState.paymentGateways.map(gateway => (
                            <GatewayCard key={gateway.id} gateway={gateway} onUpdate={handleGatewayUpdate} />
                        ))}
                    </div>
                </Accordion>
                <Accordion title="Métodos de Pagamento (Checkout)" icon={CreditCardIcon}>
                    <p className="text-sm text-gray-600 mb-4">Habilite ou desabilite os métodos de pagamento que aparecerão no seu site e atualize seus ícones.</p>
                     <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {appState.footerSettings.paymentMethods.map(method => (
                           <PaymentMethodCard 
                                key={method.id} 
                                method={method} 
                                onToggle={handlePaymentMethodToggle} 
                                onIconUpdate={handlePaymentMethodIconUpdate} 
                            />
                        ))}
                     </div>
                </Accordion>
             </div>
        );
    case 'security':
        return (
             <div className="space-y-6">
                <Accordion title="Configurações de Segurança" icon={ShieldCheckIcon} defaultOpen>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-4 border rounded-lg">
                            <div>
                                <h4 className="font-semibold">Autenticação de Dois Fatores (2FA)</h4>
                                <p className="text-sm text-gray-500">Requer um código de verificação para logins de administradores.</p>
                            </div>
                            <ToggleSwitch checked={appState.securitySettings.is2FAEnabled} onChange={checked => handleSecurityUpdate('is2FAEnabled', checked)} />
                        </div>
                         <div className="p-4 border rounded-lg">
                            <h4 className="font-semibold">Nível de Detecção de Fraude (IA)</h4>
                            <p className="text-sm text-gray-500 mb-3">Define a sensibilidade do sistema automático de análise de risco de pedidos.</p>
                             <div className="flex space-x-4">
                                {(['baixo', 'médio', 'alto'] as const).map(level => (
                                    <label key={level} className="flex items-center">
                                        <input type="radio" name="fraudLevel" value={level} checked={appState.securitySettings.fraudDetectionLevel === level} onChange={e => handleSecurityUpdate('fraudDetectionLevel', e.target.value)} className="mr-2"/>
                                        <span className="capitalize">{level}</span>
                                    </label>
                                ))}
                             </div>
                        </div>
                        <div className="p-4 border rounded-lg">
                             <h4 className="font-semibold">Política de Retenção de Dados</h4>
                             <p className="text-sm text-gray-500 mb-2">Tempo que os dados de pedidos e usuários inativos serão mantidos no sistema.</p>
                            <div className="flex items-center gap-2">
                                <input type="number" value={appState.securitySettings.dataRetentionDays} onChange={e => handleSecurityUpdate('dataRetentionDays', Number(e.target.value))} className="w-24 p-2 border rounded-md" />
                                <span className="text-sm text-gray-700">dias</span>
                            </div>
                        </div>
                    </div>
                </Accordion>
             </div>
        );
      default:
        return <div className="text-center p-8 bg-gray-50 rounded-lg"><p>Configurações para <span className="font-bold capitalize">{activeTab}</span> não implementadas.</p></div>
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-800">Configurações Gerais</h2>
      <div className="bg-white rounded-lg shadow-sm p-2">
          <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto pb-2">
              {tabs.map(tab => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-shrink-0 flex items-center px-3 py-2 sm:px-4 sm:py-2 rounded-md text-sm font-medium ${activeTab === tab.id ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                      <tab.icon className="h-5 w-5 mr-2" />
                      {tab.label}
                  </button>
              ))}
          </nav>
      </div>
      <div className="bg-gray-100 p-4 sm:p-6 rounded-lg">
        {renderContent()}
      </div>
    </div>
  );
};

export default Settings;
import React, { useState, useRef } from 'react';
import type { LoginPageConfig } from '../types.ts';
import { GoogleIcon, FacebookIcon, UploadIcon, SparklesIcon } from './Icons.tsx';
import { GoogleGenAI, Type } from "@google/genai";

interface LoginPageConfigProps {
    config: LoginPageConfig;
    setConfig: React.Dispatch<React.SetStateAction<LoginPageConfig>>;
}

const defaultLoginPageConfig: LoginPageConfig = {
    backgroundType: 'color', 
    backgroundColor: '#f3f4f6', 
    backgroundGradient: 'linear-gradient(to right, #4facfe, #00f2fe)', 
    backgroundImageUrl: '', 
    logoUrl: 'https://atacadao.com.br/logo.svg', 
    welcomeTitle: 'Bem-vindo ao Painel', 
    welcomeSubtitle: 'Faça login para continuar', 
    layout: 'centered', 
    enableGoogleLogin: true, 
    enableFacebookLogin: false
};

const LoginPreview: React.FC<{ config: LoginPageConfig }> = ({ config }) => {
    const backgroundStyle = () => {
        switch (config.backgroundType) {
            case 'color': return { backgroundColor: config.backgroundColor };
            case 'gradient': return { background: config.backgroundGradient };
            case 'image': return { backgroundImage: `url(${config.backgroundImageUrl || 'https://images.unsplash.com/photo-1618005182384-a83a89db7a7a?q=80&w=1974'})`, backgroundSize: 'cover', backgroundPosition: 'center' };
            default: return {};
        }
    };

    const Form = () => (
        <div className="w-full max-w-sm bg-white p-8 rounded-xl shadow-2xl">
            <img src={config.logoUrl} alt="Logo" className="h-12 mx-auto mb-4 object-contain" />
            <h2 className="text-2xl font-bold text-center text-gray-800">{config.welcomeTitle}</h2>
            <p className="text-center text-gray-500 mb-6">{config.welcomeSubtitle}</p>
            <div className="space-y-4">
                <input type="email" placeholder="E-mail" className="w-full p-3 border rounded-lg" defaultValue="email@example.com" />
                <input type="password" placeholder="Senha" className="w-full p-3 border rounded-lg" defaultValue="••••••••" />
                <button className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg">Entrar</button>
            </div>
            { (config.enableGoogleLogin || config.enableFacebookLogin) && <div className="flex items-center my-4"><div className="flex-grow border-t"></div><span className="flex-shrink mx-2 text-xs text-gray-400">OU</span><div className="flex-grow border-t"></div></div> }
            <div className="flex justify-center gap-4">
                {config.enableGoogleLogin && <button className="p-2 border rounded-full hover:bg-gray-100"><GoogleIcon className="h-6 w-6" /></button>}
                {config.enableFacebookLogin && <button className="p-2 border rounded-full hover:bg-gray-100"><FacebookIcon className="h-6 w-6 text-blue-700" /></button>}
            </div>
        </div>
    );

    return (
        <div className="w-full h-full flex items-center justify-center rounded-lg" style={backgroundStyle()}>
            {config.layout === 'centered' && <Form />}
            {config.layout === 'side-image' && (
                 <div className="w-full max-w-4xl h-[500px] flex bg-white rounded-xl shadow-2xl overflow-hidden">
                    <div className="w-1/2 hidden md:block bg-gray-200" style={{ backgroundImage: `url(${config.backgroundImageUrl || 'https://images.unsplash.com/photo-1583344443336-d485de43a8e3?q=80&w=1974'})`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
                    <div className="w-full md:w-1/2 flex items-center justify-center p-4">
                        <div className="w-full max-w-sm">
                            <img src={config.logoUrl} alt="Logo" className="h-10 mx-auto mb-2 object-contain" />
                            <h2 className="text-xl font-bold text-center text-gray-800">{config.welcomeTitle}</h2>
                            <p className="text-center text-gray-500 text-sm mb-4">{config.welcomeSubtitle}</p>
                            <div className="space-y-3">
                                <input type="email" placeholder="E-mail" className="w-full p-2 border rounded-lg text-sm" defaultValue="email@example.com" />
                                <input type="password" placeholder="Senha" className="w-full p-2 border rounded-lg text-sm" defaultValue="••••••••" />
                                <button className="w-full bg-blue-600 text-white font-bold py-2 rounded-lg">Entrar</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const Accordion: React.FC<{ title: string; children: React.ReactNode; defaultOpen?: boolean }> = ({ title, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div className="border rounded-lg bg-white shadow-sm">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center p-3 font-semibold bg-gray-50 text-gray-700 hover:bg-gray-100 rounded-t-lg">
                <span>{title}</span>
                <span className="text-xl">{isOpen ? '−' : '+'}</span>
            </button>
            {isOpen && <div className="p-4 border-t">{children}</div>}
        </div>
    );
};

const LoginPageConfig: React.FC<LoginPageConfigProps> = ({ config, setConfig }) => {
    const [localConfig, setLocalConfig] = useState(config);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [aiTextPrompt, setAiTextPrompt] = useState('');
    const [isGeneratingText, setIsGeneratingText] = useState(false);
    const [aiImagePrompt, setAiImagePrompt] = useState('');
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);
    const fileInputRefLogo = useRef<HTMLInputElement>(null);
    const fileInputRefBg = useRef<HTMLInputElement>(null);
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'logoUrl' | 'backgroundImageUrl') => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => setLocalConfig(p => ({ ...p, [field]: event.target?.result as string }));
            reader.readAsDataURL(e.target.files[0]);
        }
    };
    
    const showSuccess = (message: string) => {
        setSuccessMessage(message);
        setTimeout(() => setSuccessMessage(null), 3000);
    };

    const handleSave = () => {
        setConfig(localConfig);
        showSuccess('Configurações salvas com sucesso!');
    };

    const handleReset = () => {
        if (window.confirm('Tem certeza que deseja restaurar as configurações padrão?')) {
            setLocalConfig(defaultLoginPageConfig);
            showSuccess('Configurações restauradas.');
        }
    };

    const handleGenerateText = async () => {
        if (!aiTextPrompt) return;
        setIsGeneratingText(true);
        try {
            const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
            const prompt = `Gere um título de boas-vindas e um subtítulo para uma página de login de um painel administrativo com o tema "${aiTextPrompt}". O tom deve ser profissional e moderno.`;
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            title: { type: Type.STRING },
                            subtitle: { type: Type.STRING }
                        },
                        required: ['title', 'subtitle']
                    }
                }
            });
            const result = JSON.parse(response.text);
            setLocalConfig(p => ({
                ...p,
                welcomeTitle: result.title || p.welcomeTitle,
                welcomeSubtitle: result.subtitle || p.welcomeSubtitle,
            }));
        } catch (e) {
            console.error(e);
            alert('Falha ao gerar textos com a IA.');
        } finally {
            setIsGeneratingText(false);
        }
    };

    const handleGenerateBgImage = async () => {
        if (!aiImagePrompt) return;
        setIsGeneratingImage(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const fullPrompt = `Plano de fundo para uma página de login de um painel administrativo, estético, profissional, seguindo as tendências de design de UI/UX atuais, com tema: "${aiImagePrompt}". Sem texto.`;
            const response = await ai.models.generateImages({
                model: 'imagen-4.0-generate-001',
                prompt: fullPrompt,
                config: { numberOfImages: 1, outputMimeType: 'image/jpeg', aspectRatio: '16:9' }
            });
            const base64ImageBytes = response.generatedImages[0].image.imageBytes;
            const imageUrl = `data:image/jpeg;base64,${base64ImageBytes}`;
            setLocalConfig(p => ({ ...p, backgroundImageUrl: imageUrl, backgroundType: 'image' }));
        } catch (error) {
            console.error("Error generating BG image with AI:", error);
            alert("Falha ao gerar a imagem de fundo com IA.");
        } finally {
            setIsGeneratingImage(false);
        }
    };
    
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative">
             {successMessage && <div className="fixed top-20 right-5 bg-green-500 text-white py-2 px-4 rounded-lg shadow-lg z-50 animate-bounce">{successMessage}</div>}
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-800">Customizar Página de Login</h2>
                    <div className="flex gap-2">
                        <button onClick={handleReset} className="text-sm font-semibold text-gray-600 hover:text-red-600">Restaurar Padrões</button>
                        <button onClick={handleSave} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg">Salvar Alterações</button>
                    </div>
                </div>

                <Accordion title="Aparência" defaultOpen>
                     <div className="space-y-3">
                         <h4 className="font-semibold">Plano de Fundo</h4>
                         <div className="flex gap-2">
                             <button onClick={() => setLocalConfig(p => ({...p, backgroundType: 'color'}))} className={`flex-1 py-2 rounded-md text-sm ${localConfig.backgroundType === 'color' ? 'bg-blue-600 text-white' : 'bg-gray-100 border'}`}>Cor Sólida</button>
                             <button onClick={() => setLocalConfig(p => ({...p, backgroundType: 'gradient'}))} className={`flex-1 py-2 rounded-md text-sm ${localConfig.backgroundType === 'gradient' ? 'bg-blue-600 text-white' : 'bg-gray-100 border'}`}>Gradiente</button>
                             <button onClick={() => setLocalConfig(p => ({...p, backgroundType: 'image'}))} className={`flex-1 py-2 rounded-md text-sm ${localConfig.backgroundType === 'image' ? 'bg-blue-600 text-white' : 'bg-gray-100 border'}`}>Imagem</button>
                        </div>
                        {localConfig.backgroundType === 'color' && <input type="color" value={localConfig.backgroundColor} onChange={e => setLocalConfig(p => ({ ...p, backgroundColor: e.target.value }))} className="w-full h-10 p-1 border rounded-md" />}
                        {localConfig.backgroundType === 'gradient' && <input type="text" value={localConfig.backgroundGradient} onChange={e => setLocalConfig(p => ({ ...p, backgroundGradient: e.target.value }))} placeholder="ex: linear-gradient(...)" className="w-full p-2 border rounded-md" />}
                        {localConfig.backgroundType === 'image' && <button type="button" onClick={() => fileInputRefBg.current?.click()} className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 py-2 rounded-lg font-semibold hover:bg-gray-100"><UploadIcon className="h-5 w-5"/> Importar Imagem de Fundo</button>}
                        <input type="file" ref={fileInputRefBg} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'backgroundImageUrl')} />
                        <div className="p-3 border rounded-lg bg-blue-50 border-blue-200 space-y-2">
                            <h5 className="font-semibold text-sm text-gray-800 flex items-center gap-2"><SparklesIcon className="h-5 w-5 text-blue-600"/>Gerar Imagem de Fundo com IA</h5>
                            <div className="flex gap-2"><input value={aiImagePrompt} onChange={e => setAiImagePrompt(e.target.value)} placeholder="Descreva uma imagem (ex: formas geométricas abstratas)" className="w-full p-2 border rounded-md text-sm" /><button type="button" onClick={handleGenerateBgImage} disabled={isGeneratingImage || !aiImagePrompt} className="bg-blue-600 text-white font-bold py-2 px-3 rounded-lg text-sm flex items-center gap-2 disabled:bg-blue-300 w-28 justify-center"><SparklesIcon className={`h-4 w-4 ${isGeneratingImage ? 'animate-spin' : ''}`} />{isGeneratingImage ? 'Gerando...' : 'Gerar'}</button></div>
                        </div>
                    </div>
                </Accordion>
                <Accordion title="Conteúdo">
                    <div className="space-y-4">
                        <div className="p-3 border rounded-lg bg-blue-50 border-blue-200 space-y-2">
                            <h4 className="font-semibold text-sm text-gray-800 flex items-center gap-2"><SparklesIcon className="h-5 w-5 text-blue-600"/>Gerar Textos com IA</h4>
                            <div className="flex gap-2"><input value={aiTextPrompt} onChange={e => setAiTextPrompt(e.target.value)} placeholder="Tema (ex: Boas-vindas corporativo)" className="w-full p-2 border rounded-md text-sm" /><button type="button" onClick={handleGenerateText} disabled={isGeneratingText || !aiTextPrompt} className="bg-blue-600 text-white font-bold py-2 px-3 rounded-lg text-sm flex items-center gap-2 disabled:bg-blue-300 w-28 justify-center"><SparklesIcon className={`h-4 w-4 ${isGeneratingText ? 'animate-spin' : ''}`} />{isGeneratingText ? 'Gerando...' : 'Gerar'}</button></div>
                        </div>
                        <div className="flex gap-4 items-center"><img src={localConfig.logoUrl} className="h-10 bg-white border rounded p-1 object-contain" /><button type="button" onClick={() => fileInputRefLogo.current?.click()} className="text-sm font-semibold text-blue-600">Alterar Logo</button></div>
                        <input type="file" ref={fileInputRefLogo} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'logoUrl')} />
                        <input type="text" value={localConfig.welcomeTitle} onChange={e => setLocalConfig(p => ({ ...p, welcomeTitle: e.target.value }))} placeholder="Título de Boas-vindas" className="w-full p-2 border rounded-md" />
                        <input type="text" value={localConfig.welcomeSubtitle} onChange={e => setLocalConfig(p => ({ ...p, welcomeSubtitle: e.target.value }))} placeholder="Subtítulo" className="w-full p-2 border rounded-md" />
                    </div>
                </Accordion>
                <Accordion title="Funcionalidades">
                    <div className="space-y-3">
                        <select value={localConfig.layout} onChange={e => setLocalConfig(p => ({...p, layout: e.target.value as any}))} className="w-full p-2 bg-white border rounded-md">
                            <option value="centered">Formulário Centralizado</option>
                            <option value="side-image">Imagem na Lateral</option>
                        </select>
                        <div className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-50"><label>Login com Google</label><input type="checkbox" className="h-5 w-5 rounded" checked={localConfig.enableGoogleLogin} onChange={e => setLocalConfig(p => ({...p, enableGoogleLogin: e.target.checked}))} /></div>
                        <div className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-50"><label>Login com Facebook</label><input type="checkbox" className="h-5 w-5 rounded" checked={localConfig.enableFacebookLogin} onChange={e => setLocalConfig(p => ({...p, enableFacebookLogin: e.target.checked}))} /></div>
                    </div>
                </Accordion>
            </div>
            <div className="bg-gray-200 p-4 rounded-lg shadow-inner min-h-[600px]">
                <LoginPreview config={localConfig} />
            </div>
        </div>
    );
};

export default LoginPageConfig;
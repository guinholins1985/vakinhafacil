import React, { useState, useRef } from 'react';
import { Product, ProductSectionData } from '../types';
import { UploadIcon, TrashIcon, SparklesIcon, DocumentTextIcon, CubeIcon, GlobeAltIcon, VideoCameraIcon } from './Icons';
import { GoogleGenAI, Type } from "@google/genai";


// --- Helper to convert file to data URL ---
const fileToDataUrl = (file: File | Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

// --- AI Components ---
const AiAssistant: React.FC<{
    productName: string;
    isGenerating: { text: boolean; image: boolean; };
    onGenerateText: () => void;
    onGenerateImage: () => void;
    onGenerateAll: () => void;
    generationStep: string;
    groundingSources: any[];
}> = ({ productName, isGenerating, onGenerateText, onGenerateImage, onGenerateAll, generationStep, groundingSources }) => {
    const isBusy = isGenerating.text || isGenerating.image;
    
    return (
        <div className="p-4 border rounded-lg bg-blue-50 border-blue-200 space-y-4">
            <div className="flex justify-between items-center">
                <div className="flex items-center">
                    <SparklesIcon className="h-6 w-6 text-blue-600 mr-3" />
                    <div>
                        <h4 className="font-bold text-gray-800">Assistente de Conteúdo IA</h4>
                        <p className="text-xs text-gray-600">Gere textos e imagens a partir de fontes oficiais e atualizadas na internet.</p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={onGenerateAll}
                    disabled={isBusy || !productName}
                    className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    <SparklesIcon className="h-5 w-5"/>
                    {isBusy ? 'Gerando...' : 'Gerar Tudo com IA'}
                </button>
            </div>
             {isBusy && (
                <div className="w-full bg-blue-200 rounded-full h-2.5">
                    <div className="bg-blue-600 h-2.5 rounded-full animate-pulse" style={{width: '100%'}}></div>
                    <p className="mt-1 text-sm text-blue-700 text-center">{generationStep || 'Aguarde...'}</p>
                </div>
            )}
            {groundingSources.length > 0 && !isGenerating.text && (
                <div className="pt-3 mt-3 border-t border-blue-200">
                    <h5 className="text-xs font-bold text-gray-700 mb-2 flex items-center"><GlobeAltIcon className="h-4 w-4 mr-2"/> Fontes da Pesquisa Web</h5>
                    <div className="flex flex-wrap gap-2">
                        {groundingSources.map((source, index) => (
                            source.web && (
                                <a
                                    key={index}
                                    href={source.web.uri}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title={source.web.title}
                                    className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full hover:bg-blue-200 truncate max-w-xs"
                                >
                                    {source.web.title}
                                </a>
                            )
                        ))}
                    </div>
                </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                 <button type="button" onClick={onGenerateText} disabled={isBusy || !productName} className="flex items-center justify-center gap-2 p-2 border rounded-md bg-white hover:bg-gray-50 disabled:bg-gray-200 disabled:cursor-not-allowed text-sm">
                    <DocumentTextIcon className="h-5 w-5"/> Gerar Texto
                </button>
                 <button type="button" onClick={onGenerateImage} disabled={isBusy || !productName} className="flex items-center justify-center gap-2 p-2 border rounded-md bg-white hover:bg-gray-50 disabled:bg-gray-200 disabled:cursor-not-allowed text-sm">
                    <CubeIcon className="h-5 w-5"/> Gerar Imagem
                </button>
            </div>
        </div>
    );
};


// --- Main Components ---
const ProductFormModal: React.FC<{
    product: Product | null;
    onClose: () => void;
    onSave: (product: Product, sectionId: string) => void;
    sections: ProductSectionData[];
}> = ({ product, onClose, onSave, sections }) => {
    const isNew = product === null;
    const [formData, setFormData] = useState<Product>(product || {
        id: Date.now(),
        code: '',
        name: '',
        description: '',
        imageUrls: [],
        price: 0,
        originalPrice: 0,
        stock: 0,
        tags: [],
        videoUrl: '',
    });
    const [selectedSectionId, setSelectedSectionId] = useState<string>(() => {
        if (product) {
            return sections.find(s => s.products.some(p => p.id === product.id))?.id || '';
        }
        return sections[0]?.id || '';
    });
    
    // AI State
    const [isGenerating, setIsGenerating] = useState({ text: false, image: false });
    const [generationStep, setGenerationStep] = useState('');
    const [groundingSources, setGroundingSources] = useState<any[]>([]);
    const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
    const [videoGenerationStatus, setVideoGenerationStatus] = useState('');

    const fileInputRef = useRef<HTMLInputElement>(null);
    const aiTextFetched = useRef(false);
    
    // --- AI Handlers ---
    const handleGenerateText = async (baseName?: string) => {
        const nameToGenerate = baseName || formData.name;
        if (!nameToGenerate || isGenerating.text) return false;

        setIsGenerating(prev => ({ ...prev, text: true }));
        setGroundingSources([]);
        aiTextFetched.current = true;
        
        try {
            const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
            setGenerationStep('Pesquisando na web e gerando textos...');
            const currentYear = new Date().getFullYear();
            const prompt = `Gere conteúdo para um produto de e-commerce chamado "${nameToGenerate}". Pesquise na internet por fontes oficiais e atuais para fornecer: um título SEO otimizado, uma descrição de venda detalhada e oficial do produto, e uma lista de 7 a 10 tags e palavras-chave relevantes para SEO em ${currentYear}. Responda com um objeto JSON contendo as chaves: "title", "description", e "tags".`;
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    tools: [{googleSearch: {}}],
                }
            });

            const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
            setGroundingSources(sources);

            let jsonString = response.text;
            const match = jsonString.match(/```json\n([\s\S]*?)\n```/);
            if (match) {
                jsonString = match[1];
            }

            const result = JSON.parse(jsonString);

            const newName = result.title || formData.name;
            const newDescription = result.description || formData.description;
            const newTags = result.tags || formData.tags;

            setFormData(prev => ({ ...prev, name: newName, description: newDescription, tags: newTags }));
            setGenerationStep('Textos gerados com sucesso!');
            return true;
        } catch (error) {
            console.error("Erro ao gerar ou processar texto com IA:", error);
            setGenerationStep("Erro ao gerar texto.");
            return false;
        } finally {
            setIsGenerating(prev => ({ ...prev, text: false }));
        }
    };
    
    const handleGenerateImage = async (): Promise<boolean> => {
        if (!formData.name || isGenerating.image) return false;
        setIsGenerating(prev => ({ ...prev, image: true }));
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            setGenerationStep('Criando prompt para imagem...');
            const prompt = `Fotografia de produto de alta qualidade para e-commerce: '${formData.name}'. ${formData.description}. Fundo branco, limpo e profissional, iluminação de estúdio. Estilo de fotografia de produto moderno e de alta conversão, popular atualmente.`;
            setGenerationStep('Contatando IA de imagem...');
            const response = await ai.models.generateImages({
                model: 'imagen-4.0-generate-001', prompt, config: { numberOfImages: 1, outputMimeType: 'image/jpeg', aspectRatio: '1:1' }
            });
            setGenerationStep('Processando imagem...');
            const base64ImageBytes = response.generatedImages[0].image.imageBytes;
            const imageUrl = `data:image/jpeg;base64,${base64ImageBytes}`;
            
            setFormData(prev => ({ ...prev, imageUrls: [imageUrl, ...prev.imageUrls.slice(0, 4)] }));
            setGenerationStep('Imagem gerada com sucesso!');
            return true;
        } catch (error) {
            console.error("Erro ao gerar imagem com IA:", error);
            setGenerationStep("Erro ao gerar imagem.");
            return false;
        } finally {
            setIsGenerating(prev => ({ ...prev, image: false }));
        }
    };
    
    const handleGenerateAll = async () => {
        const textSuccess = await handleGenerateText();
        if (textSuccess) {
            // Wait a moment for state to update for better image prompt
            await new Promise(r => setTimeout(r, 100));
            await handleGenerateImage();
        }
        setGenerationStep('');
    };

    const handleGenerateVideo = async () => {
        if (!formData.name) {
            alert('Por favor, insira o nome do produto primeiro.');
            return;
        }
        setIsGeneratingVideo(true);
        setVideoGenerationStatus('Iniciando a criação do vídeo... Isso pode levar alguns minutos.');
    
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `Vídeo de produto de alta qualidade para e-commerce: '${formData.name}'. ${formData.description}. Estilo cinematográfico, limpo, profissional, destacando os detalhes do produto, com estilo de edição e visual moderno e dinâmico, popular nas redes sociais hoje.`;
    
            let operation = await ai.models.generateVideos({
                model: 'veo-2.0-generate-001',
                prompt: prompt,
                config: { numberOfVideos: 1 }
            });
    
            const messages = [ "Aquecendo os motores de vídeo...", "Renderizando os primeiros quadros...", "A IA está trabalhando na sua obra-prima...", "Compilando as cenas...", "Quase pronto, adicionando os toques finais...", ];
            let messageIndex = 0;
    
            while (!operation.done) {
                setVideoGenerationStatus(messages[messageIndex % messages.length]);
                messageIndex++;
                await new Promise(resolve => setTimeout(resolve, 10000)); // Poll every 10 seconds
                operation = await ai.operations.getVideosOperation({ operation: operation });
            }
    
            const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    
            if (downloadLink) {
                setVideoGenerationStatus('Download do vídeo em andamento...');
                const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
                if (!response.ok) {
                    throw new Error(`Falha no download do vídeo: ${response.statusText}`);
                }
                const videoBlob = await response.blob();
                const videoObjectUrl = URL.createObjectURL(videoBlob);
                setFormData(prev => ({ ...prev, videoUrl: videoObjectUrl }));
                setVideoGenerationStatus('Vídeo gerado com sucesso!');
            } else {
                throw new Error('Link para download do vídeo não encontrado.');
            }
    
        } catch (error) {
            console.error("Erro ao gerar vídeo com IA:", error);
            setVideoGenerationStatus(`Erro ao gerar vídeo: ${(error as Error).message}`);
        } finally {
            setTimeout(() => {
                 setIsGeneratingVideo(false);
                 setVideoGenerationStatus('');
            }, 5000); // Keep success/error message for a bit
        }
    };
    
    const handleNameBlur = () => {
        if (isNew && formData.name && !aiTextFetched.current) {
            handleGenerateText(formData.name);
        }
    };
    // --- End AI Handlers ---

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'price' || name === 'stock' || name === 'originalPrice' ? Number(value) : value }));
    };

    const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({...prev, tags: e.target.value.split(',').map(tag => tag.trim())}));
    };
    
    const handleImageImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            try {
                const imageUrl = await fileToDataUrl(file);
                setFormData(prev => ({ ...prev, imageUrls: [imageUrl, ...prev.imageUrls] }));
            } catch (error) {
                console.error("Error converting image:", error);
                alert("Falha ao importar a imagem.");
            }
        }
    };

    const handleRemoveImage = (indexToRemove: number) => {
        setFormData(prev => ({ ...prev, imageUrls: prev.imageUrls.filter((_, index) => index !== indexToRemove) }));
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData, selectedSectionId);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl max-h-[90vh] flex flex-col">
                <h2 className="text-2xl font-bold mb-4 flex-shrink-0">{isNew ? 'Adicionar Produto' : 'Editar Produto'}</h2>
                <form id="product-form" onSubmit={handleSave} className="space-y-4 overflow-y-auto pr-2 flex-grow">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div><label className="text-sm font-medium">Nome do Produto</label><input type="text" name="name" value={formData.name} onChange={handleChange} onBlur={handleNameBlur} className="w-full p-2 border rounded-md" required /></div>
                         <div><label className="text-sm font-medium">Código do Produto (SKU)</label><input type="text" name="code" value={formData.code} onChange={handleChange} className="w-full p-2 border rounded-md" required /></div>
                    </div>
                    
                    <AiAssistant 
                        productName={formData.name}
                        isGenerating={isGenerating}
                        onGenerateText={() => handleGenerateText()}
                        onGenerateImage={handleGenerateImage}
                        onGenerateAll={handleGenerateAll}
                        generationStep={generationStep}
                        groundingSources={groundingSources}
                    />

                    <div><label className="text-sm font-medium">Descrição</label><textarea name="description" value={formData.description} onChange={handleChange} rows={4} className="w-full p-2 border rounded-md" /></div>
                    
                    <div>
                        <label className="text-sm font-medium">Imagens</label>
                        <div className="p-2 border rounded-md mt-1 space-y-2 min-h-[120px]">
                            {formData.imageUrls.length > 0 && (
                                <div className="grid grid-cols-5 gap-2">
                                    {formData.imageUrls.map((url, i) => (
                                        <div key={`${url.substring(0, 30)}-${i}`} className="relative group">
                                            <img src={url} className="h-24 w-full object-cover rounded-md border" />
                                            <button type="button" onClick={() => handleRemoveImage(i)} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Remover imagem"><TrashIcon className="h-4 w-4" /></button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div className="flex gap-2"><input type="text" placeholder="Adicionar URL da imagem" onBlur={e => e.target.value && setFormData(f => ({...f, imageUrls: [...f.imageUrls, e.target.value]}))} className="flex-grow p-2 border rounded-md text-sm" /><button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 bg-gray-200 rounded-md hover:bg-gray-300 flex items-center gap-2 text-sm"><UploadIcon className="h-5 w-5"/> Importar</button><input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageImport} /></div>
                        </div>
                    </div>
                     
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-gray-700">Preço Original (De:)</label>
                            <input type="number" step="0.01" name="originalPrice" value={formData.originalPrice || ''} onChange={handleChange} className="w-full p-2 border rounded-md mt-1" placeholder="Ex: 29.99" />
                            <p className="text-xs text-gray-500 mt-1">Opcional. Mostrado riscado se for maior que o preço final.</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700">Preço Final de Venda (Por:)</label>
                            <input type="number" step="0.01" name="price" value={formData.price} onChange={handleChange} className="w-full p-2 border rounded-md mt-1" required placeholder="Ex: 19.99" />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700">Estoque</label>
                            <input type="number" name="stock" value={formData.stock} onChange={handleChange} className="w-full p-2 border rounded-md mt-1" required />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700">Categoria</label>
                            <select value={selectedSectionId} onChange={e => setSelectedSectionId(e.target.value)} className="w-full p-2 border rounded-md mt-1 bg-white" required>
                                <option value="" disabled>Selecione</option>
                                {sections.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                            </select>
                        </div>
                    </div>
                    <div><label className="text-sm font-medium">Tags (separadas por vírgula)</label><input type="text" name="tags" value={formData.tags.join(', ')} onChange={handleTagsChange} className="w-full p-2 border rounded-md" /></div>

                    <div>
                        <label className="text-sm font-medium">Vídeo do Produto (Opcional)</label>
                        <div className="flex items-center gap-2 mt-1">
                            <input 
                                type="text" 
                                name="videoUrl" 
                                value={formData.videoUrl || ''} 
                                onChange={handleChange} 
                                className="w-full p-2 border rounded-md" 
                                placeholder="https://youtube.com/..." 
                            />
                            <button 
                                type="button"
                                onClick={handleGenerateVideo}
                                disabled={isGenerating.image || isGenerating.text || isGeneratingVideo || !formData.name}
                                title="Gerar vídeo com IA"
                                className="bg-blue-600 text-white font-bold p-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 flex items-center gap-1"
                            >
                                <VideoCameraIcon className="h-5 w-5" />
                                <SparklesIcon className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    {(isGeneratingVideo || (formData.videoUrl && formData.videoUrl.startsWith('blob:'))) && (
                        <div className="p-4 border rounded-lg bg-gray-50">
                            {isGeneratingVideo ? (
                                <div className="text-center">
                                    <div className="w-full bg-blue-200 rounded-full h-2.5 mb-2">
                                        <div className="bg-blue-600 h-2.5 rounded-full animate-pulse" style={{width: '100%'}}></div>
                                    </div>
                                    <p className="text-sm text-blue-700">{videoGenerationStatus}</p>
                                </div>
                            ) : formData.videoUrl && (
                                <div>
                                    <h4 className="font-semibold text-sm mb-2">Pré-visualização do Vídeo</h4>
                                    <video key={formData.videoUrl} controls className="w-full rounded-md max-h-60" src={formData.videoUrl}></video>
                                </div>
                            )}
                        </div>
                    )}

                </form>
                <div className="flex justify-end space-x-4 pt-4 border-t mt-4 flex-shrink-0">
                    <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 py-2 px-4 rounded-lg">Cancelar</button>
                    <button type="submit" form="product-form" className="bg-blue-600 text-white py-2 px-4 rounded-lg">Salvar Produto</button>
                </div>
            </div>
        </div>
    );
};

interface ProductManagementProps {
    productSections: ProductSectionData[];
    setProductSections: React.Dispatch<React.SetStateAction<ProductSectionData[]>>;
    showToast: (message: string) => void;
}

const ProductManagement: React.FC<ProductManagementProps> = ({ productSections, setProductSections, showToast }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [isBulkGenerating, setIsBulkGenerating] = useState(false);
    const [bulkProgress, setBulkProgress] = useState({ current: 0, total: 0 });
    const xlsImportRef = useRef<HTMLInputElement>(null);


    const handleSaveProduct = (product: Product, sectionId: string) => {
        const isNew = !productSections.flatMap(s => s.products).some(p => p.id === product.id);

        if (isNew) {
            const newProduct = { ...product, id: Date.now() }; // Assign new ID for local state
            setProductSections(prev => prev.map(section => 
                section.id === sectionId 
                    ? { ...section, products: [newProduct, ...section.products] }
                    : section
            ));
            showToast('Produto criado!');
        } else {
             setProductSections(prevSections => {
                // Remove from old section first
                const sectionsWithoutOld = prevSections.map(s => ({
                    ...s,
                    products: s.products.filter(p => p.id !== product.id)
                }));
                // Add to new section
                return sectionsWithoutOld.map(s => 
                    s.id === sectionId 
                        ? { ...s, products: [product, ...s.products] } 
                        : s
                );
            });
            showToast('Produto atualizado!');
        }
    };

    const handleDeleteProduct = (productId: number) => {
        if (window.confirm('Tem certeza que deseja excluir este produto?')) {
            setProductSections(prev => prev.map(section => ({
                ...section,
                products: section.products.filter(p => p.id !== productId)
            })));
            showToast('Produto excluído!');
        }
    };
    
    const handleBulkGenerate = async () => {
        if (!window.confirm('Isso irá usar a IA para preencher dados de todos os produtos com descrição ou imagem faltando. Pode levar algum tempo e consumir API. Deseja continuar?')) return;

        setIsBulkGenerating(true);
        const incompleteProducts: Product[] = [];
        productSections.forEach(section => {
            section.products.forEach(product => {
                const hasPlaceholderImage = product.imageUrls.some(url => url.includes('via.placeholder.com'));
                if ((!product.description || product.description.trim() === '') || hasPlaceholderImage) {
                    incompleteProducts.push(product);
                }
            });
        });

        if (incompleteProducts.length === 0) {
            showToast('Nenhum produto com conteúdo incompleto encontrado.');
            setIsBulkGenerating(false);
            return;
        }

        setBulkProgress({ current: 0, total: incompleteProducts.length });
        
        const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
        let successCount = 0;

        for (let i = 0; i < incompleteProducts.length; i++) {
            const product = incompleteProducts[i];
            setBulkProgress({ current: i + 1, total: incompleteProducts.length });

            try {
                let updatedProductData: Product = { ...product };
                let hasBeenUpdated = false;

                const needsText = !product.description || product.description.trim() === '';
                const needsImage = product.imageUrls.some(url => url.includes('via.placeholder.com'));

                if (needsText) {
                    const textPrompt = `Gere conteúdo para um produto de e-commerce chamado "${product.name}". Forneça: um título SEO otimizado, uma descrição de venda detalhada e oficial do produto, e uma lista de 7 a 10 tags. Responda com um objeto JSON com chaves: "title", "description", e "tags".`;
                    
                    const textResponse = await ai.models.generateContent({
                        model: 'gemini-2.5-flash', 
                        contents: textPrompt,
                        config: { 
                            responseMimeType: "application/json", 
                            responseSchema: {
                                type: Type.OBJECT,
                                properties: {
                                    title: { type: Type.STRING, description: "Título otimizado para SEO." },
                                    description: { type: Type.STRING, description: "Descrição detalhada do produto." },
                                    tags: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Lista de tags relevantes." }
                                },
                                required: ['title', 'description', 'tags']
                            } 
                        }
                    });
                    
                    if (textResponse.text) {
                        const textResult = JSON.parse(textResponse.text);
                        updatedProductData.name = textResult.title || product.name;
                        updatedProductData.description = textResult.description || product.description;
                        updatedProductData.tags = textResult.tags || product.tags;
                        hasBeenUpdated = true;
                    } else {
                         console.warn(`Text generation failed for ${product.name}: Empty response.`);
                    }
                }

                if (needsImage) {
                    const imagePrompt = `Fotografia de produto de alta qualidade para e-commerce: '${updatedProductData.name}'. Fundo branco, limpo e profissional, iluminação de estúdio.`;
                    const imageResponse = await ai.models.generateImages({
                        model: 'imagen-4.0-generate-001', prompt: imagePrompt, config: { numberOfImages: 1, outputMimeType: 'image/jpeg', aspectRatio: '1:1' }
                    });

                    if (imageResponse.generatedImages?.[0]?.image?.imageBytes) {
                        const base64 = imageResponse.generatedImages[0].image.imageBytes;
                        const imageUrl = `data:image/jpeg;base64,${base64}`;
                        
                        const existingImages = updatedProductData.imageUrls.filter(url => !url.includes('via.placeholder.com'));
                        updatedProductData.imageUrls = [imageUrl, ...existingImages];

                        hasBeenUpdated = true;
                    } else {
                        console.warn(`Image generation failed for ${product.name}: Empty response.`);
                    }
                }
                
                if (hasBeenUpdated) {
                    successCount++;
                    setProductSections(currentSections => 
                        currentSections.map(section => ({
                            ...section,
                            products: section.products.map(p => p.id === updatedProductData.id ? updatedProductData : p)
                        }))
                    );
                }

                await new Promise(resolve => setTimeout(resolve, 1500)); // Rate limiting

            } catch (error) {
                console.error(`Falha ao gerar conteúdo para o produto ${product.name}:`, error);
            }
        }
        
        setIsBulkGenerating(false);
        setBulkProgress({ current: 0, total: 0 });
        showToast(`Geração em massa concluída! ${successCount} de ${incompleteProducts.length} produtos foram atualizados.`);
    };
    
    const handleImportFromXLS = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            // In a real app, you'd use a library like SheetJS (xlsx) to parse the file.
            // Here, we'll simulate the process.
            console.log(`Simulating import from file: ${event.target.files[0].name}`);

            const newProductsFromXLS: Product[] = [
              {
                id: Date.now() + 1,
                code: 'XLS-001',
                name: 'Biscoito Recheado Trakinas Chocolate 126g',
                description: 'Delicioso biscoito de chocolate com recheio de baunilha, a alegria da garotada.',
                imageUrls: ['https://atacadao.com.br/costco/images/products/trakinas.png'],
                price: 2.99,
                originalPrice: 3.50,
                stock: 500,
                tags: ['biscoito', 'trakinas', 'lanche', 'chocolate'],
                specifications: { "Marca": "Trakinas", "Sabor": "Chocolate", "Peso": "126g" }
              },
              {
                id: Date.now() + 2,
                code: 'XLS-002',
                name: 'Refrigerante Coca-Cola Garrafa 2L',
                description: 'O sabor inconfundível da Coca-Cola, agora em garrafa de 2 litros para compartilhar com a família e amigos.',
                imageUrls: ['https://atacadao.com.br/costco/images/products/coca-cola-2l.png'],
                price: 8.50,
                stock: 400,
                tags: ['refrigerante', 'coca-cola', 'bebida', 'gaseificada'],
                specifications: { "Marca": "Coca-Cola", "Volume": "2L" }
              }
            ];
            
            let productsToAdd: Product[] = [];
            let skippedCount = 0;

            setProductSections(prev => {
                const newSections = [...prev];
                if (newSections.length > 0) {
                    const existingCodes = new Set(newSections.flatMap(s => s.products).map(p => p.code));
                    productsToAdd = newProductsFromXLS.filter(p => !existingCodes.has(p.code));
                    skippedCount = newProductsFromXLS.length - productsToAdd.length;
                    
                    newSections[0] = {
                        ...newSections[0],
                        products: [...productsToAdd, ...newSections[0].products]
                    };
                } else {
                    newSections.push({ id: 'imported_section', title: 'Produtos Importados', products: newProductsFromXLS });
                    productsToAdd = newProductsFromXLS;
                }
                return newSections;
            });
            
            if (productsToAdd.length > 0) {
                showToast(`${productsToAdd.length} produtos importados com sucesso!`);
            }
            if (skippedCount > 0) {
                setTimeout(() => showToast(`${skippedCount} produtos foram ignorados por já existirem (mesmo código).`), 1000);
            }
             if (productsToAdd.length === 0 && skippedCount > 0) {
                 showToast('Nenhum produto novo importado. Todos os códigos já existem.');
            }


            // Reset file input value to allow re-importing the same file
            if (xlsImportRef.current) {
                xlsImportRef.current.value = '';
            }
        }
    };


    return (
        <div>
            {isModalOpen && <ProductFormModal product={editingProduct} onClose={() => { setIsModalOpen(false); setEditingProduct(null); }} onSave={handleSaveProduct} sections={productSections} />}
            
            <input
                type="file"
                ref={xlsImportRef}
                className="hidden"
                accept=".xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                onChange={handleImportFromXLS}
            />

            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <h2 className="text-3xl font-bold text-gray-800">Gerenciamento de Produtos</h2>
                <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-end">
                     <button 
                        onClick={handleBulkGenerate} 
                        disabled={isBulkGenerating}
                        className="bg-purple-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 disabled:bg-purple-300 disabled:cursor-not-allowed"
                    >
                        <SparklesIcon className="h-5 w-5" />
                        {isBulkGenerating ? `Gerando... (${bulkProgress.current}/${bulkProgress.total})` : 'Gerar Conteúdo em Massa'}
                    </button>
                    <button 
                        onClick={() => xlsImportRef.current?.click()}
                        className="bg-green-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-green-700"
                    >
                        <UploadIcon className="h-5 w-5" />
                        Importar de XLS
                    </button>
                    <button onClick={() => { setEditingProduct(null); setIsModalOpen(true); }} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg">Adicionar Produto</button>
                </div>
            </div>
            <div className="space-y-6">
                {productSections.map(section => (
                    <div key={section.id} className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-xl font-bold mb-4">{section.title}</h3>
                        <div className="overflow-x-auto">
                           <table className="w-full text-sm">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                    <tr>
                                        <th className="p-2 w-16">Imagem</th><th className="p-2 text-left">Código</th><th className="p-2 text-left">Nome</th><th className="p-2 text-left">Preço</th><th className="p-2 text-left">Estoque</th><th className="p-2 text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                {section.products.map(product => (
                                    <tr key={product.id} className="border-t">
                                        <td className="p-2"><img src={product.imageUrls[0]} className="h-12 w-12 object-cover rounded-md bg-gray-100" /></td>
                                        <td className="p-2 font-mono text-xs">{product.code}</td>
                                        <td className="p-2 font-medium">{product.name}</td>
                                        <td className="p-2">R$ {product.price.toFixed(2)}</td>
                                        <td className="p-2">{product.stock}</td>
                                        <td className="p-2 text-right space-x-4">
                                            <button onClick={() => { setEditingProduct(product); setIsModalOpen(true); }} className="text-blue-600 font-semibold">Editar</button>
                                            <button onClick={() => handleDeleteProduct(product.id)} className="text-red-600 font-semibold">Excluir</button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                           </table>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProductManagement;
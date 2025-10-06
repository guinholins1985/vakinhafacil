import React, { useState, useMemo } from 'react';
import { AppState, Product, BlockchainTrace, VoiceCommerceConfig, VRShowroomConfig } from '../types.ts';
import { CubeTransparentIcon, ChipIcon, CubeIcon, UserIcon, CheckCircleIcon } from './Icons.tsx';
import { v4 as uuidv4 } from 'uuid';

interface InnovationsProps {
    appState: AppState;
    setAppState: React.Dispatch<React.SetStateAction<AppState>>;
}

// --- Reusable Components ---
const ToggleSwitch: React.FC<{ checked: boolean, onChange: (c: boolean) => void }> = ({ checked, onChange }) => (
    <label className="flex items-center cursor-pointer"><div className="relative"><input type="checkbox" className="sr-only peer" checked={checked} onChange={(e) => onChange(e.target.checked)} /><div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div></div></label>
);

// --- Modals for Configuration ---

const ARConfigModal: React.FC<{
    onClose: () => void;
    allProducts: Product[];
    enabledIds: number[];
    onToggle: (productId: number) => void;
}> = ({ onClose, allProducts, enabledIds, onToggle }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const filteredProducts = allProducts.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] flex flex-col">
                <h3 className="text-xl font-bold mb-4">Configurar Realidade Aumentada (AR)</h3>
                <input type="search" placeholder="Buscar produto..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full p-2 border rounded-md mb-4" />
                <div className="flex-grow overflow-y-auto pr-2">
                    {filteredProducts.map(product => (
                        <div key={product.id} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <img src={product.imageUrls[0]} alt={product.name} className="h-10 w-10 object-contain rounded-md bg-gray-100" />
                                <span className="text-sm font-medium">{product.name}</span>
                            </div>
                            <ToggleSwitch checked={enabledIds.includes(product.id)} onChange={() => onToggle(product.id)} />
                        </div>
                    ))}
                </div>
                <button onClick={onClose} className="mt-4 bg-blue-600 text-white font-bold py-2 px-4 rounded-lg w-full">Fechar</button>
            </div>
        </div>
    );
};

const BlockchainConfigModal: React.FC<{
    onClose: () => void;
    allProducts: Product[];
    onRegister: (trace: BlockchainTrace) => void;
}> = ({ onClose, allProducts, onRegister }) => {
    const [productId, setProductId] = useState('');
    const [batch, setBatch] = useState('');
    const [origin, setOrigin] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);

    const handleRegister = () => {
        const product = allProducts.find(p => p.id === Number(productId));
        if (!product || !batch || !origin) {
            alert('Por favor, preencha todos os campos.');
            return;
        }
        setIsRegistering(true);
        setTimeout(() => {
            const newTrace: BlockchainTrace = {
                productId: product.code,
                productName: product.name,
                origin,
                lastScan: `Registrado no Lote ${batch} em ${new Date().toLocaleDateString()}`
            };
            onRegister(newTrace);
            setIsRegistering(false);
            onClose();
        }, 1500);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg">
                <h3 className="text-xl font-bold mb-4">Registrar Lote em Blockchain</h3>
                <div className="space-y-4">
                    <select value={productId} onChange={e => setProductId(e.target.value)} className="w-full p-2 border rounded-md bg-white"><option value="">Selecione o Produto</option>{allProducts.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
                    <input value={batch} onChange={e => setBatch(e.target.value)} placeholder="Número do Lote" className="w-full p-2 border rounded-md" />
                    <input value={origin} onChange={e => setOrigin(e.target.value)} placeholder="Informação de Origem" className="w-full p-2 border rounded-md" />
                </div>
                <div className="flex justify-end gap-2 mt-6"><button onClick={onClose} className="bg-gray-200 py-2 px-4 rounded-lg">Cancelar</button><button onClick={handleRegister} disabled={isRegistering} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg w-40">{isRegistering ? 'Registrando...' : 'Registrar'}</button></div>
            </div>
        </div>
    );
};

const VoiceCommerceModal: React.FC<{
    onClose: () => void;
    config: VoiceCommerceConfig;
    onSave: (config: VoiceCommerceConfig) => void;
}> = ({ onClose, config, onSave }) => {
    const [localConfig, setLocalConfig] = useState(config);

    return (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h3 className="text-xl font-bold mb-4">Configurar Voice Commerce</h3>
                <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg"><span>Ativar Compras por Voz</span><ToggleSwitch checked={localConfig.isEnabled} onChange={c => setLocalConfig(p => ({...p, isEnabled: c}))}/></div>
                    <div><label className="text-sm font-medium">Frase de Ativação</label><input value={localConfig.invocationPhrase} onChange={e => setLocalConfig(p => ({...p, invocationPhrase: e.target.value}))} className="w-full p-2 border rounded-md mt-1"/></div>
                </div>
                <div className="flex justify-end gap-2 mt-6"><button onClick={onClose} className="bg-gray-200 py-2 px-4 rounded-lg">Cancelar</button><button onClick={() => { onSave(localConfig); onClose(); }} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg">Salvar</button></div>
            </div>
        </div>
    );
};

const VRShowroomModal: React.FC<{
    onClose: () => void;
    config: VRShowroomConfig;
    onSave: (config: VRShowroomConfig) => void;
    allProducts: Product[];
}> = ({ onClose, config, onSave, allProducts }) => {
    const [localConfig, setLocalConfig] = useState(config);
    const toggleProduct = (id: number) => {
        setLocalConfig(prev => {
            const featuredProductIds = prev.featuredProductIds.includes(id) ? prev.featuredProductIds.filter(pId => pId !== id) : [...prev.featuredProductIds, id];
            return { ...prev, featuredProductIds };
        });
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] flex flex-col">
                <h3 className="text-xl font-bold mb-4">Configurar Showroom Virtual (VR)</h3>
                <div className="flex-grow grid grid-cols-2 gap-6 overflow-hidden">
                    <div className="space-y-4 overflow-y-auto pr-2">
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"><span>Ativar Showroom VR</span><ToggleSwitch checked={localConfig.isEnabled} onChange={c => setLocalConfig(p => ({...p, isEnabled: c}))}/></div>
                        <div><h4 className="text-sm font-medium mb-2">Tema do Ambiente</h4><div className="flex gap-2">{(['Moderno', 'Industrial', 'Aconchegante'] as const).map(t => <button key={t} onClick={() => setLocalConfig(p => ({...p, theme: t}))} className={`flex-1 py-2 text-sm rounded-md ${localConfig.theme === t ? 'bg-blue-600 text-white' : 'bg-white border'}`}>{t}</button>)}</div></div>
                        <div className="border rounded-lg p-2"><h4 className="font-semibold text-sm mb-2">Produtos em Destaque</h4><div className="max-h-60 overflow-y-auto space-y-1">{allProducts.map(p => <label key={p.id} className="flex items-center gap-2 text-sm p-1 rounded hover:bg-gray-100"><input type="checkbox" checked={localConfig.featuredProductIds.includes(p.id)} onChange={() => toggleProduct(p.id)} /> {p.name}</label>)}</div></div>
                    </div>
                    <div className="bg-gray-800 text-white p-4 rounded-lg flex flex-col items-center justify-center text-center">
                        <p className="text-xs uppercase tracking-widest">{localConfig.theme}</p>
                        <h4 className="text-lg font-bold">Preview do Showroom</h4>
                        <CubeIcon className="h-24 w-24 my-4 opacity-50"/>
                        <p className="font-semibold">Produtos em Destaque:</p>
                        <p className="text-sm opacity-80">{localConfig.featuredProductIds.length} itens selecionados</p>
                    </div>
                </div>
                 <div className="flex justify-end gap-2 pt-4 border-t mt-4"><button onClick={onClose} className="bg-gray-200 py-2 px-4 rounded-lg">Cancelar</button><button onClick={() => { onSave(localConfig); onClose(); }} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg">Salvar</button></div>
            </div>
        </div>
    );
};

// --- Main Component ---
const Innovations: React.FC<InnovationsProps> = ({ appState, setAppState }) => {
    const [activeModal, setActiveModal] = useState<string | null>(null);
    const allProducts = useMemo(() => appState.productSections.flatMap(s => s.products), [appState.productSections]);

    // --- Handlers to update state ---
    const handleToggleAR = (productId: number) => {
        setAppState(prev => ({
            ...prev,
            arEnabledProductIds: prev.arEnabledProductIds.includes(productId)
                ? prev.arEnabledProductIds.filter(id => id !== productId)
                : [...prev.arEnabledProductIds, productId]
        }));
    };

    const handleRegisterTrace = (trace: BlockchainTrace) => {
        setAppState(prev => ({...prev, blockchainTraces: [trace, ...prev.blockchainTraces]}));
    };

    const handleSaveVoiceConfig = (config: VoiceCommerceConfig) => {
        setAppState(prev => ({...prev, voiceCommerceConfig: config}));
    };
    
    const handleSaveVRConfig = (config: VRShowroomConfig) => {
        setAppState(prev => ({...prev, vrShowroomConfig: config}));
    };
    
    const features = [
        { id: 'ar', title: "Realidade Aumentada (AR)", description: "Permita que clientes visualizem produtos em 3D em seu próprio espaço antes de comprar.", icon: CubeTransparentIcon, enabled: appState.arEnabledProductIds.length > 0 },
        { id: 'blockchain', title: "Blockchain para Rastreabilidade", description: "Garanta a autenticidade e o histórico de produtos de alto valor com registros imutáveis.", icon: CubeIcon, enabled: appState.blockchainTraces.length > 0 },
        { id: 'voice', title: "Voice Commerce", description: "Habilite compras por comando de voz através de assistentes como Alexa e Google Assistant.", icon: UserIcon, enabled: appState.voiceCommerceConfig.isEnabled },
        { id: 'vr', title: "Showroom em Realidade Virtual (VR)", description: "Crie uma experiência de loja imersiva para eventos online e feiras virtuais.", icon: CubeIcon, enabled: appState.vrShowroomConfig.isEnabled },
    ];
    
    return (
        <div className="space-y-6">
            {activeModal === 'ar' && <ARConfigModal onClose={() => setActiveModal(null)} allProducts={allProducts} enabledIds={appState.arEnabledProductIds} onToggle={handleToggleAR} />}
            {activeModal === 'blockchain' && <BlockchainConfigModal onClose={() => setActiveModal(null)} allProducts={allProducts} onRegister={handleRegisterTrace} />}
            {activeModal === 'voice' && <VoiceCommerceModal onClose={() => setActiveModal(null)} config={appState.voiceCommerceConfig} onSave={handleSaveVoiceConfig} />}
            {activeModal === 'vr' && <VRShowroomModal onClose={() => setActiveModal(null)} config={appState.vrShowroomConfig} onSave={handleSaveVRConfig} allProducts={allProducts} />}

            <h2 className="text-3xl font-bold text-gray-800">Inovações Tecnológicas</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 {features.map(feature => (
                    <div key={feature.id} className="bg-white p-6 rounded-lg shadow-md">
                        <div className="flex items-center mb-3">
                            <div className="text-blue-600 mr-4"><feature.icon className="h-8 w-8"/></div>
                            <h3 className="text-lg font-bold text-gray-800">{feature.title}</h3>
                            <span className={`ml-auto text-xs font-semibold px-2 py-0.5 rounded-full ${feature.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700'}`}>
                                {feature.enabled ? 'Ativo' : 'Inativo'}
                            </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-4 h-10">{feature.description}</p>
                        <button onClick={() => setActiveModal(feature.id)} className="w-full bg-gray-200 text-gray-800 text-sm font-bold py-2 px-4 rounded-lg hover:bg-gray-300">
                            Configurar
                        </button>
                    </div>
                 ))}
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Monitor de IoT (Internet das Coisas)</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {appState.iotDevices.map(device => (
                        <div key={device.id} className="p-4 bg-gray-50 rounded-lg">
                            <div className="flex justify-between items-center"><p className="font-semibold text-gray-700">{device.name}</p><div className={`w-3 h-3 rounded-full ${{Online: 'bg-green-500', Offline: 'bg-gray-400', Alerta: 'bg-red-500 animate-pulse'}[device.status]}`} title={device.status}></div></div>
                            <p className="text-xs text-gray-500">{device.type}</p>
                            <p className="text-2xl font-bold text-gray-900 mt-2">{device.value}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Innovations;
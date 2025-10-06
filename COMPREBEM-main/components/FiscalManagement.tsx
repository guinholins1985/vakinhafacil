import React, { useState, useMemo } from 'react';
import { AppState, NFe, FiscalConfig } from '../types.ts';
import { DocumentTextIcon, Cog6ToothIcon, DocumentChartBarIcon, EyeIcon, DocumentArrowDownIcon, CheckCircleIcon, ShieldCheckIcon } from './Icons.tsx';

interface FiscalManagementProps {
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
}

// --- Modals and Helper Components ---

const DanfeModal: React.FC<{ nfe: NFe; onClose: () => void }> = ({ nfe, onClose }) => (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl max-h-[90vh] flex flex-col">
            <h2 className="text-xl font-bold mb-4 border-b pb-2">DANFE - Documento Auxiliar da Nota Fiscal Eletrônica</h2>
            <div className="flex-grow overflow-y-auto p-2 bg-gray-50 rounded">
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="border p-2 rounded"><strong>Nº NF-e:</strong> {nfe.number}</div>
                    <div className="border p-2 rounded"><strong>Pedido:</strong> {nfe.orderId}</div>
                    <div className="border p-2 rounded col-span-2"><strong>Cliente:</strong> Cliente Exemplo (Nome obtido do Pedido)</div>
                    <div className="border p-2 rounded"><strong>Data de Emissão:</strong> {new Date(nfe.issueDate).toLocaleDateString()}</div>
                    <div className="border p-2 rounded"><strong>Valor Total:</strong> <span className="font-bold">R$ {nfe.amount.toFixed(2)}</span></div>
                </div>
                <div className="mt-4">
                    <h3 className="font-bold text-center my-2">Itens da Nota Fiscal</h3>
                    <table className="w-full text-xs">
                        <thead className="bg-gray-200">
                            <tr>
                                <th className="p-1 text-left">Produto</th>
                                <th className="p-1 text-center">Qtd.</th>
                                <th className="p-1 text-right">Valor Unit.</th>
                                <th className="p-1 text-right">Valor Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* Dados simulados de itens */}
                            <tr className="border-b"><td className="p-1">Produto A</td><td className="p-1 text-center">2</td><td className="p-1 text-right">R$ 50,00</td><td className="p-1 text-right">R$ 100,00</td></tr>
                            <tr className="border-b"><td className="p-1">Produto B</td><td className="p-1 text-center">1</td><td className="p-1 text-right">R$ { (nfe.amount - 100).toFixed(2) }</td><td className="p-1 text-right">R$ { (nfe.amount - 100).toFixed(2) }</td></tr>
                        </tbody>
                    </table>
                </div>
                <p className="text-center text-xs mt-4 text-gray-500">Documento simulado para fins de demonstração.</p>
            </div>
            <div className="flex justify-end gap-4 mt-4 flex-shrink-0">
                <button onClick={() => alert('Imprimindo DANFE... (simulação)')} className="bg-gray-600 text-white font-bold py-2 px-4 rounded-lg">Imprimir</button>
                <button onClick={onClose} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg">Fechar</button>
            </div>
        </div>
    </div>
);


const FiscalManagement: React.FC<FiscalManagementProps> = ({ appState, setAppState }) => {
    const [activeTab, setActiveTab] = useState('dashboard');

    const tabs = [
        { id: 'dashboard', label: 'Dashboard Fiscal', icon: DocumentChartBarIcon },
        { id: 'nfe', label: 'Notas Fiscais (NF-e)', icon: DocumentTextIcon },
        { id: 'taxes', label: 'Apuração de Impostos', icon: DocumentChartBarIcon },
        { id: 'reports', label: 'Obrigações (SPED)', icon: DocumentArrowDownIcon },
        { id: 'config', label: 'Configurações', icon: Cog6ToothIcon },
    ];
    
    const renderContent = () => {
        switch(activeTab) {
            case 'dashboard': return <DashboardView appState={appState} />;
            case 'nfe': return <NFeView nfes={appState.nfes} setAppState={setAppState} />;
            case 'taxes': return <TaxesView />;
            case 'reports': return <ReportsView />;
            case 'config': return <ConfigView config={appState.fiscalConfig} setConfig={(updater) => setAppState(s => ({...s, fiscalConfig: typeof updater === 'function' ? updater(s.fiscalConfig) : updater}))} />;
            default: return null;
        }
    }
    
    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-800">Gestão Fiscal e Tributária</h2>
            <div className="bg-white rounded-lg shadow-sm p-2"><nav className="flex space-x-2 overflow-x-auto">{tabs.map(tab => (<button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center px-4 py-2 rounded-md text-sm font-medium ${activeTab === tab.id ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}`}><tab.icon className="h-5 w-5 mr-2"/>{tab.label}</button>))}</nav></div>
            <div>{renderContent()}</div>
        </div>
    );
};

// --- Tab Components ---
const DashboardView: React.FC<{ appState: AppState }> = ({ appState }) => {
    const { nfes, fiscalConfig } = appState;
    const summary = useMemo(() => ({
        totalIssued: nfes.filter(n => n.status === 'Emitida').reduce((s, n) => s + n.amount, 0),
        pendingCount: nfes.filter(n => n.status === 'Pendente').length,
        canceledCount: nfes.filter(n => n.status === 'Cancelada').length,
    }), [nfes]);

    const certExpiryDate = new Date(fiscalConfig.digitalCertificateExpiry);
    const daysToCertExpiry = Math.ceil((certExpiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow"><p className="text-sm text-gray-500">Total Emitido (Mês)</p><p className="text-2xl font-bold">R$ {summary.totalIssued.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p></div>
                <div className="bg-white p-6 rounded-lg shadow"><p className="text-sm text-gray-500">NF-e Pendentes</p><p className="text-2xl font-bold">{summary.pendingCount}</p></div>
                <div className="bg-white p-6 rounded-lg shadow"><p className="text-sm text-gray-500">NF-e Canceladas</p><p className="text-2xl font-bold">{summary.canceledCount}</p></div>
                <div className="bg-white p-6 rounded-lg shadow"><p className="text-sm text-gray-500">Próximo Imposto (ICMS)</p><p className="text-2xl font-bold">R$ 12.345,67</p></div>
            </div>
            {daysToCertExpiry <= 30 && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                    <h4 className="font-bold text-yellow-800">Alerta Fiscal</h4>
                    <p className="text-sm text-yellow-700">Seu certificado digital expira em {daysToCertExpiry} dias. Renove-o para continuar emitindo notas fiscais.</p>
                </div>
            )}
        </div>
    );
};

const NFeView: React.FC<{ nfes: NFe[], setAppState: React.Dispatch<React.SetStateAction<AppState>> }> = ({ nfes, setAppState }) => {
    const [selectedNfe, setSelectedNfe] = useState<NFe | null>(null);

    const handleCancel = (nfeId: string) => {
        if(window.confirm(`Tem certeza que deseja cancelar a NF-e ${nfeId}?`)){
            setAppState(prev => ({
                ...prev,
                nfes: prev.nfes.map(n => n.id === nfeId ? { ...n, status: 'Cancelada' } : n)
            }));
            alert(`NF-e ${nfeId} cancelada com sucesso.`);
        }
    }

    const statusClasses = {
        'Emitida': 'bg-green-100 text-green-800',
        'Pendente': 'bg-yellow-100 text-yellow-800',
        'Cancelada': 'bg-red-100 text-red-800',
    };

    return (
        <>
            {selectedNfe && <DanfeModal nfe={selectedNfe} onClose={() => setSelectedNfe(null)} />}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold mb-4">Documentos Fiscais Emitidos</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-xs uppercase"><tr><th className="p-3 text-left">Número</th><th className="p-3 text-left">Pedido</th><th className="p-3 text-left">Data</th><th className="p-3 text-left">Valor</th><th className="p-3 text-left">Status</th><th className="p-3 text-right">Ações</th></tr></thead>
                        <tbody>{nfes.map(nfe => (<tr key={nfe.id} className="border-t hover:bg-gray-50"><td className="p-3 font-mono">{nfe.number}</td><td className="p-3 font-mono">{nfe.orderId}</td><td className="p-3">{new Date(nfe.issueDate).toLocaleDateString()}</td><td className="p-3">R$ {nfe.amount.toFixed(2)}</td><td className="p-3"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusClasses[nfe.status]}`}>{nfe.status}</span></td><td className="p-3 text-right space-x-4"><button onClick={() => setSelectedNfe(nfe)} className="font-medium text-blue-600 hover:underline">Ver DANFE</button>{nfe.status === 'Emitida' && <button onClick={() => handleCancel(nfe.id)} className="font-medium text-red-600 hover:underline">Cancelar</button>}</td></tr>))}</tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

const TaxesView: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [taxes, setTaxes] = useState({ icms: 0, ipi: 0, pis: 0 });

    const handleCalculate = () => {
        setIsLoading(true);
        setTimeout(() => {
            setTaxes({ icms: 12345.67, ipi: 5432.10, pis: 8765.43 });
            setIsLoading(false);
        }, 1500);
    }
    
    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Apuração de Impostos (Mês Atual)</h3>
                <button onClick={handleCalculate} disabled={isLoading} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg disabled:bg-blue-300">
                    {isLoading ? 'Calculando...' : 'Calcular Impostos'}
                </button>
            </div>
            <div className="space-y-3">
                <div className="flex justify-between p-3 bg-gray-50 rounded-lg"><span>ICMS a Recolher</span><span className="font-bold">R$ {taxes.icms.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span></div>
                <div className="flex justify-between p-3 bg-gray-50 rounded-lg"><span>IPI a Recolher</span><span className="font-bold">R$ {taxes.ipi.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span></div>
                <div className="flex justify-between p-3 bg-gray-50 rounded-lg"><span>PIS/COFINS a Recolher</span><span className="font-bold">R$ {taxes.pis.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span></div>
            </div>
        </div>
    );
};

const ReportsView: React.FC = () => {
    const [generating, setGenerating] = useState<'fiscal' | 'contrib' | null>(null);
    const [generated, setGenerated] = useState<'fiscal' | 'contrib' | null>(null);

    const handleGenerate = (type: 'fiscal' | 'contrib') => {
        setGenerating(type);
        setGenerated(null);
        setTimeout(() => {
            setGenerating(null);
            setGenerated(type);
        }, 2000);
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <h3 className="text-xl font-bold mb-2">SPED Fiscal</h3>
                <p className="text-sm text-gray-500 mb-4">Gere o arquivo EFD ICMS IPI para o período fiscal atual.</p>
                <button onClick={() => handleGenerate('fiscal')} disabled={generating === 'fiscal'} className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 disabled:bg-blue-300">
                    {generating === 'fiscal' ? 'Gerando...' : 'Gerar SPED Fiscal'}
                </button>
                {generated === 'fiscal' && <p className="text-sm text-green-600 font-semibold mt-2 flex items-center justify-center gap-1"><CheckCircleIcon className="h-4 w-4"/>Arquivo gerado com sucesso!</p>}
            </div>
             <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <h3 className="text-xl font-bold mb-2">SPED Contribuições</h3>
                <p className="text-sm text-gray-500 mb-4">Gere o arquivo EFD Contribuições para o período fiscal atual.</p>
                <button onClick={() => handleGenerate('contrib')} disabled={generating === 'contrib'} className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 disabled:bg-blue-300">
                     {generating === 'contrib' ? 'Gerando...' : 'Gerar SPED Contribuições'}
                </button>
                {generated === 'contrib' && <p className="text-sm text-green-600 font-semibold mt-2 flex items-center justify-center gap-1"><CheckCircleIcon className="h-4 w-4"/>Arquivo gerado com sucesso!</p>}
            </div>
        </div>
    );
};

const ConfigView: React.FC<{ config: FiscalConfig, setConfig: (updater: React.SetStateAction<FiscalConfig>) => void }> = ({ config, setConfig }) => {
    const [localConfig, setLocalConfig] = useState(config);

    const handleSave = () => {
        setConfig(localConfig);
        alert('Configurações salvas!');
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto">
            <h3 className="text-xl font-bold mb-4">Configurações Fiscais</h3>
            <div className="space-y-4">
                <div><label className="text-sm font-medium">Nome da Empresa</label><input type="text" value={localConfig.companyName} onChange={e => setLocalConfig(p => ({...p, companyName: e.target.value}))} className="w-full p-2 border rounded-md"/></div>
                <div><label className="text-sm font-medium">CNPJ</label><input type="text" value={localConfig.cnpj} onChange={e => setLocalConfig(p => ({...p, cnpj: e.target.value}))} className="w-full p-2 border rounded-md"/></div>
                <div><label className="text-sm font-medium">Inscrição Estadual</label><input type="text" value={localConfig.ie} onChange={e => setLocalConfig(p => ({...p, ie: e.target.value}))} className="w-full p-2 border rounded-md"/></div>
                <div><label className="text-sm font-medium">Regime Tributário</label><select value={localConfig.taxRegime} onChange={e => setLocalConfig(p => ({...p, taxRegime: e.target.value as any}))} className="w-full p-2 border rounded-md bg-white"><option>Simples Nacional</option><option>Lucro Presumido</option><option>Lucro Real</option></select></div>
                <div>
                    <label className="text-sm font-medium flex items-center gap-2"><ShieldCheckIcon className="h-5 w-5"/>Certificado Digital A1</label>
                    <input type="file" className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
                    <p className="text-xs text-gray-500 mt-1">Válido até: {new Date(localConfig.digitalCertificateExpiry).toLocaleDateString()}</p>
                </div>
                <button onClick={handleSave} className="w-full bg-blue-600 text-white font-bold py-2 rounded-lg mt-4">Salvar Configurações</button>
            </div>
        </div>
    );
};


export default FiscalManagement;
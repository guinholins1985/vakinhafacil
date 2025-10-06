import React, { useState, useMemo, useEffect } from 'react';
import { AppState, CyberAttackSimulation, FraudAnalysisLog, AntiFraudRule, Order, User } from '../types.ts';
import { ShieldExclamationIcon, PresentationChartLineIcon, ScaleIcon, Cog6ToothIcon, PlusIcon, PencilIcon, TrashIcon, CheckCircleIcon, ShieldCheckIcon, SparklesIcon } from './Icons.tsx';
import { v4 as uuidv4 } from 'uuid';

interface RiskManagementProps {
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
}

// --- Modals ---

const TransactionModal: React.FC<{
    log: FraudAnalysisLog;
    order: Order | undefined;
    user: User | undefined;
    onClose: () => void;
    onAction: (logId: string, action: FraudAnalysisLog['action']) => void;
}> = ({ log, order, user, onClose, onAction }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
            <h2 className="text-xl font-bold mb-4">Analisar Transação - Pedido {log.orderId}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <h3 className="font-bold text-red-800">Alerta de Risco</h3>
                    <p className="text-3xl font-bold text-red-600 my-2">{log.riskScore}<span className="text-lg">/100</span></p>
                    <p><strong>Motivo:</strong> {log.reason}</p>
                    <p><strong>Ação Sugerida (IA):</strong> {log.action}</p>
                </div>
                <div className="space-y-3">
                    <div><h3 className="font-semibold">Detalhes do Pedido</h3>
                        {order ? (
                            <div className="text-xs space-y-1 mt-1">
                                <p><strong>Data:</strong> {new Date(order.date).toLocaleDateString()}</p>
                                <p><strong>Total:</strong> R$ {order.total.toFixed(2)}</p>
                                <p><strong>Itens:</strong> {order.items.length}</p>
                            </div>
                        ) : <p className="text-xs text-gray-500">Detalhes do pedido não encontrados.</p>}
                    </div>
                     <div><h3 className="font-semibold">Detalhes do Cliente</h3>
                        {user ? (
                            <div className="text-xs space-y-1 mt-1">
                                <p><strong>Nome:</strong> {user.name}</p>
                                <p><strong>Email:</strong> {user.email}</p>
                                <p><strong>Cliente desde:</strong> N/A</p>
                                <p><strong>Pedidos Anteriores:</strong> N/A</p>
                            </div>
                        ) : <p className="text-xs text-gray-500">Detalhes do cliente não encontrados.</p>}
                    </div>
                </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
                <button onClick={onClose} className="bg-gray-200 py-2 px-4 rounded-lg">Fechar</button>
                <button onClick={() => onAction(log.id, 'Bloqueado')} className="bg-red-600 text-white py-2 px-4 rounded-lg">Bloquear Pedido</button>
                <button onClick={() => onAction(log.id, 'Aprovado')} className="bg-green-600 text-white py-2 px-4 rounded-lg">Aprovar Manualmente</button>
            </div>
        </div>
    </div>
);

const RuleModal: React.FC<{
    rule: AntiFraudRule | null;
    onClose: () => void;
    onSave: (rule: AntiFraudRule) => void;
}> = ({ rule, onClose, onSave }) => {
    const isNew = rule === null;
    const [formData, setFormData] = useState<AntiFraudRule>(rule || { id: uuidv4(), description: '', action: 'Sinalizar', isActive: true });

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
                <h3 className="text-lg font-bold mb-4">{isNew ? 'Criar Nova Regra' : 'Editar Regra'}</h3>
                <form onSubmit={handleSave} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium">Descrição da Regra</label>
                        <textarea value={formData.description} onChange={e => setFormData(p => ({...p, description: e.target.value}))} className="w-full p-2 border rounded-md mt-1 h-24" placeholder="Ex: Bloquear pedidos com mais de 3 cartões diferentes na última hora." required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium">Ação</label>
                            <select value={formData.action} onChange={e => setFormData(p => ({...p, action: e.target.value as any}))} className="w-full p-2 border rounded-md mt-1 bg-white">
                                <option value="Sinalizar">Sinalizar para Análise</option>
                                <option value="Bloquear">Bloquear Automaticamente</option>
                            </select>
                        </div>
                         <div>
                            <label className="text-sm font-medium">Status</label>
                            <div className="mt-2"><label className="flex items-center gap-2"><input type="checkbox" checked={formData.isActive} onChange={e => setFormData(p => ({...p, isActive: e.target.checked}))} />Ativa</label></div>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-4"><button type="button" onClick={onClose} className="bg-gray-200 py-2 px-4 rounded-lg">Cancelar</button><button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded-lg">Salvar Regra</button></div>
                </form>
            </div>
        </div>
    );
};


// --- Tab Components ---

const DashboardView: React.FC<{ appState: AppState }> = ({ appState }) => {
    const kpis = useMemo(() => {
        const totalTransactions = appState.orders.length;
        const blocked = appState.fraudAnalysisLogs.filter(l => l.action === 'Bloqueado').length;
        const flagged = appState.fraudAnalysisLogs.filter(l => l.action === 'Sinalizado').length;
        const approved = totalTransactions - blocked - flagged;
        const fraudRate = totalTransactions > 0 ? (blocked / totalTransactions) * 100 : 0;
        
        return {
            blockedCount: blocked,
            flaggedCount: flagged,
            approvedCount: approved,
            fraudRate: fraudRate.toFixed(2),
        };
    }, [appState.fraudAnalysisLogs, appState.orders]);

    const highRiskLogs = useMemo(() => appState.fraudAnalysisLogs.filter(l => l.riskScore > 70).slice(0, 5), [appState.fraudAnalysisLogs]);
    
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg shadow"><p className="text-sm text-gray-500">Transações Bloqueadas</p><p className="text-2xl font-bold text-red-600">{kpis.blockedCount}</p></div>
                <div className="bg-white p-4 rounded-lg shadow"><p className="text-sm text-gray-500">Transações Sinalizadas</p><p className="text-2xl font-bold text-yellow-600">{kpis.flaggedCount}</p></div>
                <div className="bg-white p-4 rounded-lg shadow"><p className="text-sm text-gray-500">Transações Aprovadas</p><p className="text-2xl font-bold text-green-600">{kpis.approvedCount}</p></div>
                <div className="bg-white p-4 rounded-lg shadow"><p className="text-sm text-gray-500">Índice de Fraude</p><p className="text-2xl font-bold">{kpis.fraudRate}%</p></div>
            </div>
             <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-bold mb-4">Ações por Risco</h3>
                <div className="flex items-end gap-2 h-40">
                    <div className="bg-green-500 w-1/3 rounded-t" style={{ height: `${(kpis.approvedCount / appState.orders.length)*100}%` }} title={`Aprovadas: ${kpis.approvedCount}`}></div>
                    <div className="bg-yellow-500 w-1/3 rounded-t" style={{ height: `${(kpis.flaggedCount / appState.orders.length) * 100}%` }} title={`Sinalizadas: ${kpis.flaggedCount}`}></div>
                    <div className="bg-red-500 w-1/3 rounded-t" style={{ height: `${(kpis.blockedCount / appState.orders.length) * 100}%` }} title={`Bloqueadas: ${kpis.blockedCount}`}></div>
                </div>
            </div>
            <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-bold mb-4">Alertas de Alto Risco</h3>
                 <ul className="space-y-2 text-sm">
                    {highRiskLogs.map(log => (
                        <li key={log.id} className="flex justify-between items-center p-2 bg-red-50 rounded-md">
                            <span className="font-mono text-xs">{log.orderId}</span>
                            <span className="font-bold text-red-600">{log.riskScore}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

const CyberSecurityView: React.FC<{
    simulations: CyberAttackSimulation[];
    setAppState: React.Dispatch<React.SetStateAction<AppState>>;
}> = ({ simulations, setAppState }) => {
    const [simulationType, setSimulationType] = useState<CyberAttackSimulation['type']>('Phishing');
    const [isSimulating, setIsSimulating] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const handleLaunch = () => {
        setIsSimulating(true);
        setSuccessMessage('');
        setTimeout(() => {
            const newSimulation: CyberAttackSimulation = {
                id: uuidv4(),
                date: new Date().toISOString(),
                type: simulationType,
                result: Math.random() > 0.3 ? 'Detectado' : 'Não Detectado',
            };
            setAppState(prev => ({...prev, cyberAttackSimulations: [newSimulation, ...prev.cyberAttackSimulations]}));
            setIsSimulating(false);
            setSuccessMessage(`Simulação de ${simulationType} concluída!`);
            setTimeout(() => setSuccessMessage(''), 3000);
        }, 2000);
    };
    
    const resultClasses = { 'Detectado': 'bg-green-100 text-green-800', 'Não Detectado': 'bg-red-100 text-red-800' };

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold mb-4">Simulador de Ataques Cibernéticos</h3>
                <div className="p-4 bg-gray-50 rounded-lg border flex items-end gap-4">
                    <div className="flex-grow">
                        <label className="text-sm font-medium">Tipo de Simulação</label>
                        <select value={simulationType} onChange={e => setSimulationType(e.target.value as any)} className="w-full p-2 border rounded-md mt-1 bg-white">
                            <option>Phishing</option>
                            <option>DDoS</option>
                            <option>Ransomware</option>
                        </select>
                    </div>
                    <button onClick={handleLaunch} disabled={isSimulating} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 disabled:bg-blue-300">
                        <SparklesIcon className={`h-5 w-5 ${isSimulating ? 'animate-spin' : ''}`} />
                        {isSimulating ? 'Simulando...' : 'Iniciar Simulação'}
                    </button>
                </div>
                {successMessage && <div className="mt-4 p-3 bg-green-100 text-green-800 rounded-lg flex items-center gap-2"><CheckCircleIcon className="h-5 w-5"/>{successMessage}</div>}
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold mb-4">Histórico de Simulações</h3>
                <table className="w-full text-sm">
                    <thead className="text-xs uppercase bg-gray-100"><tr><th className="p-3 text-left">Data</th><th className="p-3 text-left">Tipo</th><th className="p-3 text-left">Resultado</th></tr></thead>
                    <tbody>
                        {simulations.map(sim => (
                            <tr key={sim.id} className="border-b hover:bg-gray-50">
                                <td className="p-3">{new Date(sim.date).toLocaleString()}</td>
                                <td className="p-3">{sim.type}</td>
                                <td className="p-3"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${resultClasses[sim.result]}`}>{sim.result}</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};


// --- Main Component ---
const RiskManagement: React.FC<RiskManagementProps> = ({ appState, setAppState }) => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [modal, setModal] = useState<{type: 'transaction' | 'rule' | null, data?: any}>({ type: null });

    const tabs = [
        { id: 'dashboard', label: 'Dashboard de Risco', icon: PresentationChartLineIcon },
        { id: 'analysis', label: 'Análise de Transações', icon: ScaleIcon },
        { id: 'rules', label: 'Regras Anti-Fraude', icon: Cog6ToothIcon },
        { id: 'cyber_security', label: 'Cyber Security', icon: ShieldCheckIcon },
    ];
    
    const handleSave = <T extends { id: string }>(item: T, collection: keyof AppState) => {
        setAppState(prev => {
            const items = prev[collection] as T[];
            const exists = items.some(i => i.id === item.id);
            const newItems = exists ? items.map(i => i.id === item.id ? item : i) : [item, ...items];
            return { ...prev, [collection]: newItems };
        });
        setModal({ type: null });
    };

    const handleDelete = (id: string, collection: keyof AppState) => {
        if (window.confirm("Excluir esta regra?")) {
            setAppState(prev => ({ ...prev, [collection]: (prev[collection] as any[]).filter(i => i.id !== id) }));
        }
    };

    const handleTransactionAction = (logId: string, action: FraudAnalysisLog['action']) => {
        setAppState(prev => ({
            ...prev,
            fraudAnalysisLogs: prev.fraudAnalysisLogs.map(log => log.id === logId ? { ...log, action } : log)
        }));
        setModal({ type: null });
    };
    
    const renderContent = () => {
        switch(activeTab) {
            case 'dashboard': return <DashboardView appState={appState} />;
            case 'analysis': return <div className="bg-white p-6 rounded-lg shadow-md"><h3 className="text-xl font-bold mb-4">Logs de Análise de Fraude</h3><div className="space-y-3">{appState.fraudAnalysisLogs.map(log => <div key={log.id} className="p-3 border rounded-lg flex justify-between items-center"><span className="font-mono text-xs">{log.orderId}</span><span>Score: <span className="font-bold">{log.riskScore}</span></span><span>{log.reason}</span><span className={`px-2 py-1 text-xs font-semibold rounded-full ${{'Aprovado':'bg-green-100','Sinalizado':'bg-yellow-100','Bloqueado':'bg-red-100'}[log.action]}`}>{log.action}</span><button onClick={() => setModal({ type: 'transaction', data: log })} className="text-blue-600 font-semibold">Analisar</button></div>)}</div></div>;
            case 'rules': return <div className="bg-white p-6 rounded-lg shadow-md"><div className="flex justify-between items-center mb-4"><h3 className="text-xl font-bold">Regras Anti-Fraude</h3><button onClick={() => setModal({type: 'rule'})} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2"><PlusIcon className="h-5 w-5"/>Nova Regra</button></div><div className="space-y-3">{appState.antiFraudRules.map(rule => <div key={rule.id} className="p-3 border rounded-lg flex justify-between items-center group"><div><p>{rule.description}</p><p className="text-xs font-semibold">{rule.action === 'Sinalizar' ? 'Ação: Sinalizar' : 'Ação: Bloquear'}</p></div><div className="flex items-center gap-4"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${rule.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-200'}`}>{rule.isActive ? 'Ativa' : 'Inativa'}</span><div className="flex opacity-0 group-hover:opacity-100"><button onClick={() => setModal({type: 'rule', data: rule})} className="p-1 text-blue-600"><PencilIcon className="h-4 w-4"/></button><button onClick={() => handleDelete(rule.id, 'antiFraudRules')} className="p-1 text-red-500"><TrashIcon className="h-4 w-4"/></button></div></div></div>)}</div></div>;
            case 'cyber_security': return <CyberSecurityView simulations={appState.cyberAttackSimulations} setAppState={setAppState} />;
            default: return null;
        }
    }
    
    return (
        <div className="space-y-6">
            {modal.type === 'transaction' && <TransactionModal log={modal.data} order={appState.orders.find(o => o.id === modal.data.orderId)} user={appState.users.find(u => u.email === appState.orders.find(o => o.id === modal.data.orderId)?.customerEmail)} onClose={() => setModal({type: null})} onAction={handleTransactionAction} />}
            {modal.type === 'rule' && <RuleModal rule={modal.data} onClose={() => setModal({type:null})} onSave={(rule) => handleSave(rule, 'antiFraudRules')} />}
            
            <h2 className="text-3xl font-bold text-gray-800">Riscos e Prevenção a Fraudes</h2>
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

export default RiskManagement;
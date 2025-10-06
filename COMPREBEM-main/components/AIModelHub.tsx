import React, { useState } from 'react';
import { AIModel, AppState } from '../types';

interface AIModelHubProps {
    aiModels: AIModel[];
    setAIModels: (updater: React.SetStateAction<AIModel[]>) => void;
    showToast: (message: string) => void;
}

const ToggleSwitch: React.FC<{ checked: boolean, onChange: (checked: boolean) => void }> = ({ checked, onChange }) => (
    <label className="flex items-center cursor-pointer">
        <div className="relative">
            <input type="checkbox" className="sr-only peer" checked={checked} onChange={(e) => onChange(e.target.checked)} />
            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
        </div>
    </label>
);


const AIModelHub: React.FC<AIModelHubProps> = ({ aiModels, setAIModels, showToast }) => {
    const [testingId, setTestingId] = useState<string | null>(null);

    const handleToggle = (id: string) => {
        setAIModels(prev => prev.map(model => 
            model.id === id ? { ...model, enabled: !model.enabled } : model
        ));
    };

    const handleTest = (id: string) => {
        setTestingId(id);
        // Simulate API call
        setTimeout(() => {
            const success = Math.random() > 0.3; // 70% chance of success
            setAIModels(prev => prev.map(model =>
                model.id === id ? { ...model, status: success ? 'Online' : 'Offline' } : model
            ));
            setTestingId(null);
            showToast(`Teste para o modelo ${id} concluído: ${success ? 'Online' : 'Offline'}`);
        }, 1500 + Math.random() * 1000);
    };

    const statusInfo: Record<AIModel['status'], { color: string, text: string }> = {
        'Online': { color: 'bg-green-500', text: 'Online' },
        'Offline': { color: 'bg-red-500', text: 'Offline' },
        'Untested': { color: 'bg-gray-400', text: 'Não Testado' }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-800">Hub de Modelos IA</h2>
            <p className="text-gray-600">
                Gerencie os modelos de IA disponíveis para geração de conteúdo. Ative, desative e teste a conectividade de cada modelo para garantir o funcionamento adequado das automações.
            </p>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="w-full text-sm text-left text-gray-600">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3">Status</th>
                            <th scope="col" className="px-6 py-3">Modelo</th>
                            <th scope="col" className="px-6 py-3">Provedor</th>
                            <th scope="col" className="px-6 py-3">Tipo</th>
                            <th scope="col" className="px-6 py-3">Ativado</th>
                            <th scope="col" className="px-6 py-3 text-center">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {aiModels.map(model => (
                            <tr key={model.id} className="bg-white border-b hover:bg-gray-50">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <div className={`h-2.5 w-2.5 rounded-full ${statusInfo[model.status].color}`}></div>
                                        <span>{statusInfo[model.status].text}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 font-mono text-gray-900 text-xs">
                                    {model.fullName}
                                </td>
                                <td className="px-6 py-4 capitalize">
                                    {model.provider}
                                </td>
                                <td className="px-6 py-4">
                                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                        {model.type}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <ToggleSwitch checked={model.enabled} onChange={() => handleToggle(model.id)} />
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <button
                                        onClick={() => handleTest(model.id)}
                                        disabled={testingId === model.id}
                                        className="font-medium text-blue-600 hover:underline disabled:text-gray-400 disabled:cursor-wait"
                                    >
                                        {testingId === model.id ? 'Testando...' : 'Testar'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AIModelHub;

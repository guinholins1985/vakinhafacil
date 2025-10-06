import React, { useState, useMemo } from 'react';
import { AppState, ExternalIntegration } from '../types.ts';
import { CheckCircleIcon } from './Icons.tsx';

interface IntegrationsManagerProps {
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
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

const IntegrationCard: React.FC<{
    integration: ExternalIntegration;
    onUpdate: (updatedIntegration: ExternalIntegration) => void;
}> = ({ integration, onUpdate }) => {

    const handleCredentialChange = (key: string, value: string) => {
        const newCredentials = { ...integration.credentials, [key]: value };
        onUpdate({ ...integration, credentials: newCredentials });
    };

    const isConfigured = useMemo(() => {
        return integration.requiredFields.every(field => integration.credentials[field.key]?.trim() !== '');
    }, [integration.credentials, integration.requiredFields]);
    
    const status = integration.enabled ? (isConfigured ? 'Conectado' : 'Não Configurado') : 'Desativado';
    const statusColor = integration.enabled ? (isConfigured ? 'text-green-600' : 'text-yellow-600') : 'text-gray-500';

    return (
        <div className="bg-white p-6 rounded-lg shadow-md border">
            <div className="flex justify-between items-start">
                <div>
                    <h4 className="text-lg font-bold text-gray-800">{integration.name}</h4>
                    <p className="text-sm text-gray-500">{integration.description}</p>
                </div>
                <ToggleSwitch checked={integration.enabled} onChange={enabled => onUpdate({ ...integration, enabled })} />
            </div>
            <div className="mt-4 pt-4 border-t space-y-3">
                {integration.requiredFields.map(field => (
                    <div key={field.key}>
                        <label className="block text-sm font-medium text-gray-700">{field.label}</label>
                        <input
                            type={field.type}
                            value={integration.credentials[field.key] || ''}
                            onChange={e => handleCredentialChange(field.key, e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder={`Insira seu ${field.label}`}
                            disabled={!integration.enabled}
                        />
                    </div>
                ))}
            </div>
            <div className="mt-4 text-right">
                <span className={`text-sm font-semibold ${statusColor}`}>{status}</span>
            </div>
        </div>
    );
};


const IntegrationsManager: React.FC<IntegrationsManagerProps> = ({ appState, setAppState, showToast }) => {

    const handleUpdateIntegration = (updatedIntegration: ExternalIntegration) => {
        setAppState(prev => ({
            ...prev,
            externalIntegrations: (Array.isArray(prev.externalIntegrations) ? prev.externalIntegrations : []).map(i =>
                i.id === updatedIntegration.id ? updatedIntegration : i
            )
        }));
        showToast(`Integração ${updatedIntegration.name} atualizada!`);
    };

    // FIX: The type of `appState.externalIntegrations` can be inferred as `unknown` in some environments,
    // causing `integrations.map` later on to fail. Using `Array.isArray` as a type guard ensures it is treated as an array.
    const integrationsByCategory = useMemo(() => {
        const integrationsList = Array.isArray(appState.externalIntegrations) ? appState.externalIntegrations : [];
        return integrationsList.reduce((acc, integration) => {
            const category = integration.category;
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(integration);
            return acc;
        }, {} as Record<string, ExternalIntegration[]>);
    }, [appState.externalIntegrations]);

    return (
        <div className="space-y-8">
             <h2 className="text-3xl font-bold text-gray-800">Gerenciador de Integrações</h2>
             <p className="text-gray-600">
                Gerencie as chaves de API e configurações para serviços externos. As informações salvas aqui são para fins de demonstração e não devem ser usadas em produção.
             </p>
            {Object.entries(integrationsByCategory).map(([category, integrations]) => (
                <div key={category}>
                    <h3 className="text-2xl font-bold text-gray-700 mb-4">{category}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* FIX: Add Array.isArray check to guard against `integrations` being 'unknown'.
                            This can happen if TypeScript's type inference fails due to loosely typed props
                            being passed from parent components (e.g., via an `any` type). */}
                        {Array.isArray(integrations) && integrations.map(integration => (
                            <IntegrationCard
                                key={integration.id}
                                integration={integration}
                                onUpdate={handleUpdateIntegration}
                            />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default IntegrationsManager;
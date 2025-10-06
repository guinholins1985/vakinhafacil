import React, { useState } from 'react';
import { AppState } from '../types.ts';
import { CodeBracketIcon, SaveIcon } from './Icons.tsx';

interface CodeEditorProps {
    appState: AppState;
    setAppState: React.Dispatch<React.SetStateAction<AppState>>;
    showToast: (message: string) => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ appState, setAppState, showToast }) => {
    // State is now unified into a single customCode field.
    const [customCode, setCustomCode] = useState(appState.customCode || '');

    const handleSave = () => {
        setAppState(prev => ({
            ...prev,
            customCode, // Save the unified code
        }));
        showToast('Código salvo e aplicado ao site!');
    };

    const commonTextAreaStyles: React.CSSProperties = {
        fontFamily: 'monospace',
        fontSize: '14px',
        lineHeight: '1.5',
        backgroundColor: '#1e293b', // bg-slate-800
        color: '#e2e8f0', // text-slate-200
        border: '1px solid #334155', // border-slate-700
        borderRadius: '8px',
        padding: '1rem',
        minHeight: '60vh', // Make the editor taller
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                    <CodeBracketIcon className="h-8 w-8" />
                    Editor de Código (HTML/CSS)
                </h2>
                <button
                    onClick={handleSave}
                    className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-blue-700"
                >
                    <SaveIcon className="h-5 w-5" />
                    Salvar e Aplicar
                </button>
            </div>

            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                <p className="font-bold text-yellow-800">Atenção!</p>
                <p className="text-sm text-yellow-700">
                    Alterações feitas aqui podem quebrar o layout ou a funcionalidade do site. Use com cuidado. Para adicionar CSS, utilize a tag <code>&lt;style&gt;</code>.
                </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Editor de Código Unificado</h3>
                <p className="text-sm text-gray-600 mb-4">
                    O código adicionado aqui será injetado no topo da página. Você pode adicionar tanto HTML (ex: banners de aviso) quanto CSS (dentro de tags <code>&lt;style&gt;...&lt;/style&gt;</code>).
                </p>
                <textarea
                    value={customCode}
                    onChange={(e) => setCustomCode(e.target.value)}
                    style={commonTextAreaStyles}
                    className="w-full"
                    placeholder={`<!-- Exemplo de CSS -->
<style>
  body {
    background-color: #f0f0f0;
  }
</style>

<!-- Exemplo de HTML -->
<div style="text-align: center; background-color: yellow; padding: 5px;">
  Site em promoção!
</div>`}
                    aria-label="Editor de Código unificado para HTML e CSS"
                />
            </div>
        </div>
    );
};

export default CodeEditor;

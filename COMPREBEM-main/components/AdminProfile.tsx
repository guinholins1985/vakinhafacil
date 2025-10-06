import React, { useState, useRef } from 'react';
import { AdminProfile } from '../types.ts';
import { UploadIcon, ShieldCheckIcon, BellIcon, UserCircleIcon, DocumentTextIcon } from './Icons.tsx';

interface AdminProfileProps {
    profile: AdminProfile;
    setProfile: React.Dispatch<React.SetStateAction<AdminProfile>>;
}

const ToggleSwitch: React.FC<{ checked: boolean, onChange: (checked: boolean) => void }> = ({ checked, onChange }) => (
    <label className="flex items-center cursor-pointer">
        <div className="relative">
            <input type="checkbox" className="sr-only peer" checked={checked} onChange={(e) => onChange(e.target.checked)} />
            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
        </div>
    </label>
);

const SuccessToast: React.FC<{ message: string }> = ({ message }) => (
    <div className="fixed top-5 right-5 bg-green-600 text-white py-3 px-5 rounded-lg shadow-lg z-[100] animate-bounce">
        {message}
    </div>
);

const AdminProfileComponent: React.FC<AdminProfileProps> = ({ profile, setProfile }) => {
    const [formData, setFormData] = useState(profile);
    const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const showSuccess = (message: string) => {
        setSuccessMessage(message);
        setTimeout(() => setSuccessMessage(null), 3000);
    };
    
    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({...prev, [e.target.name]: e.target.value}));
    };
    
    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPasswords(prev => ({...prev, [e.target.name]: e.target.value}));
    };
    
    const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const updatedProfile = {...formData, avatarUrl: event.target?.result as string };
                setFormData(updatedProfile);
                setProfile(updatedProfile);
                showSuccess('Avatar atualizado!');
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };
    
    const handleProfileSave = (e: React.FormEvent) => {
        e.preventDefault();
        setProfile(formData);
        showSuccess('Perfil atualizado com sucesso!');
    };
    
    const handlePasswordSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (passwords.new !== passwords.confirm) {
            alert('A nova senha e a confirmação não correspondem.');
            return;
        }
        if (passwords.new.length < 8) {
            alert('A nova senha deve ter pelo menos 8 caracteres.');
            return;
        }
        // In a real app, you'd call an API here.
        showSuccess('Senha alterada com sucesso!');
        setPasswords({ current: '', new: '', confirm: '' });
    };

    const handleNotificationChange = (key: keyof AdminProfile['notificationSettings']) => {
        const newSettings = {
            ...formData.notificationSettings,
            [key]: !formData.notificationSettings[key]
        };
        const updatedProfile = {...formData, notificationSettings: newSettings};
        setFormData(updatedProfile);
        setProfile(updatedProfile); // Persist change immediately for better UX
        showSuccess('Preferências de notificação salvas.');
    };

    const activityHistory = [
        { id: 1, action: 'Login bem-sucedido', ip: '192.168.1.1', time: 'Há 5 minutos' },
        { id: 2, action: 'Alteração de senha', ip: '192.168.1.1', time: 'Há 2 horas' },
        { id: 3, action: 'Login bem-sucedido', ip: '10.0.0.5', time: 'Ontem às 15:30' },
    ];

    return (
        <div className="space-y-8">
            {successMessage && <SuccessToast message={successMessage} />}
            <h2 className="text-3xl font-bold text-gray-800">Meu Perfil</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* --- Left Column --- */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2"><UserCircleIcon className="h-6 w-6"/>Informações Pessoais</h3>
                        <form onSubmit={handleProfileSave} className="space-y-6">
                            <div className="flex items-center gap-6">
                                <img src={formData.avatarUrl} alt="Avatar" className="h-24 w-24 rounded-full object-cover ring-2 ring-offset-2 ring-blue-300" />
                                <div>
                                    <button type="button" onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 font-semibold py-2 px-3 rounded-lg hover:bg-gray-100 text-sm">
                                        <UploadIcon className="h-4 w-4" /> Alterar Foto
                                    </button>
                                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                                    <p className="text-xs text-gray-500 mt-2">PNG ou JPG, recomendado 200x200px.</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div><label className="text-sm font-medium">Nome</label><input type="text" name="name" value={formData.name} onChange={handleProfileChange} className="w-full p-2 border rounded-md mt-1" /></div>
                                <div><label className="text-sm font-medium">Email</label><input type="email" value={formData.email} className="w-full p-2 border rounded-md bg-gray-100 mt-1 cursor-not-allowed" readOnly /></div>
                            </div>
                            <div className="text-right border-t pt-4"><button type="submit" className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700">Salvar Informações</button></div>
                        </form>
                    </div>
                    
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2"><ShieldCheckIcon className="h-6 w-6"/>Segurança da Conta</h3>
                        <form onSubmit={handlePasswordSave} className="space-y-4 border-b pb-6 mb-6">
                            <h4 className="font-semibold">Alterar Senha</h4>
                            <div><label className="text-sm font-medium">Senha Atual</label><input type="password" name="current" value={passwords.current} onChange={handlePasswordChange} className="w-full p-2 border rounded-md mt-1" /></div>
                            <div><label className="text-sm font-medium">Nova Senha</label><input type="password" name="new" value={passwords.new} onChange={handlePasswordChange} className="w-full p-2 border rounded-md mt-1" /></div>
                            <div><label className="text-sm font-medium">Confirmar Nova Senha</label><input type="password" name="confirm" value={passwords.confirm} onChange={handlePasswordChange} className="w-full p-2 border rounded-md mt-1" /></div>
                            <div className="text-right"><button type="submit" className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700">Alterar Senha</button></div>
                        </form>
                        <div className="flex justify-between items-center">
                            <div>
                                <h4 className="font-semibold flex items-center gap-2">Autenticação de Dois Fatores (2FA)</h4>
                                <p className="text-sm text-gray-500">Adicione uma camada extra de segurança à sua conta.</p>
                            </div>
                            <ToggleSwitch checked={formData.enable2FA} onChange={c => setFormData(p => ({...p, enable2FA: c}))} />
                        </div>
                    </div>
                </div>

                {/* --- Right Column --- */}
                <div className="lg:col-span-1 space-y-8">
                     <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2"><BellIcon className="h-6 w-6"/>Preferências de Notificação</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center"><p className="text-sm">Receber e-mail para novos pedidos</p><ToggleSwitch checked={formData.notificationSettings.newOrders} onChange={() => handleNotificationChange('newOrders')} /></div>
                            <div className="flex justify-between items-center"><p className="text-sm">Receber e-mail para novos tickets de suporte</p><ToggleSwitch checked={formData.notificationSettings.supportTickets} onChange={() => handleNotificationChange('supportTickets')} /></div>
                            <div className="flex justify-between items-center"><p className="text-sm">Receber relatório semanal de performance</p><ToggleSwitch checked={formData.notificationSettings.weeklyReports} onChange={() => handleNotificationChange('weeklyReports')} /></div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2"><DocumentTextIcon className="h-6 w-6"/>Histórico de Atividade Recente</h3>
                        <ul className="text-sm space-y-2">{activityHistory.map(item => <li key={item.id} className="flex justify-between p-2 bg-gray-50 rounded-md"><span>{item.action} <span className="text-gray-500">(IP: {item.ip})</span></span><span className="text-gray-500">{item.time}</span></li>)}</ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminProfileComponent;

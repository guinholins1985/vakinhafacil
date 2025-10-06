
import React, { useState } from 'react';
import { User } from '../types.ts';
import { GoogleIcon, FacebookIcon } from './Icons.tsx';

interface LoginModalProps {
    onClose: () => void;
    onLogin: (user: { name: string; email: string; role: 'Admin' | 'Cliente' }) => void;
    users: User[];
}

const LoginModal: React.FC<LoginModalProps> = ({ onClose, onLogin, users }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Admin login check
        if (email === '@admin' && password === 'admin123') {
            onLogin({ name: 'Admin', email: 'admin@atacadao.com', role: 'Admin' });
            return;
        }
        
        // Regular user login check (simple email check for demo)
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (user) {
            // In a real app, you'd check the password hash here
            onLogin({ name: user.name, email: user.email, role: user.role });
        } else {
            setError('Usuário ou senha inválidos.');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md relative" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-2xl text-gray-400 hover:text-gray-700">&times;</button>
                
                <img src="https://atacadao.com.br/logo.svg" alt="Logo" className="h-12 mx-auto mb-6 object-contain" />
                
                <h2 className="text-2xl font-bold text-center text-gray-800">Acesse sua conta</h2>
                <p className="text-center text-gray-500 mb-6">Para continuar, faça login ou crie sua conta.</p>

                {error && <p className="bg-red-100 text-red-700 p-3 rounded-lg text-center text-sm mb-4">{error}</p>}
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="text-sm font-medium text-gray-700">Email ou Usuário do Admin</label>
                        <input 
                            type="text" 
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="seuemail@exemplo.com" 
                            className="w-full p-3 border border-gray-300 rounded-lg mt-1" 
                            required
                         />
                    </div>
                     <div>
                        <label htmlFor="password" className="text-sm font-medium text-gray-700">Senha</label>
                        <input 
                            type="password" 
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••" 
                            className="w-full p-3 border border-gray-300 rounded-lg mt-1" 
                            required
                        />
                         <a href="#" className="text-xs text-blue-600 hover:underline mt-1 block text-right">Esqueci minha senha</a>
                    </div>
                    <button type="submit" className="w-full bg-orange-500 text-white font-bold py-3 rounded-lg hover:bg-orange-600 transition-colors">
                        Entrar
                    </button>
                </form>

                <div className="flex items-center my-6">
                    <div className="flex-grow border-t border-gray-300"></div>
                    <span className="flex-shrink mx-4 text-sm text-gray-500">ou entre com</span>
                    <div className="flex-grow border-t border-gray-300"></div>
                </div>

                <div className="flex justify-center gap-4">
                    <button className="p-3 border rounded-full hover:bg-gray-100 transition-colors">
                        <GoogleIcon className="h-6 w-6 text-gray-600" />
                    </button>
                    <button className="p-3 border rounded-full hover:bg-gray-100 transition-colors">
                        <FacebookIcon className="h-6 w-6 text-blue-700" />
                    </button>
                </div>
                 <p className="text-center text-sm text-gray-600 mt-8">
                    Não tem uma conta? <a href="#" className="font-bold text-blue-600 hover:underline">Cadastre-se</a>
                </p>
            </div>
        </div>
    );
};

export default LoginModal;

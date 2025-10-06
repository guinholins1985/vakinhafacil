
import React, { useState, useMemo } from 'react';
import { User, Order } from '../types';
import { ChevronLeftIcon, ChevronRightIcon, TrashIcon } from './Icons';

interface UserManagementProps {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  orders: Order[];
  showToast: (message: string) => void;
}

const UserFormModal: React.FC<{
    user: User | null;
    onClose: () => void;
    onSave: (user: User) => void;
}> = ({ user, onClose, onSave }) => {
    const isNewUser = user === null;
    const [formData, setFormData] = useState<User>(user || {
        id: 0, // Placeholder, local logic will generate
        name: '',
        email: '',
        role: 'Cliente',
        status: 'Ativo',
        lastLogin: new Date().toISOString(),
        loyaltyTier: 'Bronze',
        tags: [],
        notes: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-lg max-h-full overflow-y-auto">
                <h2 className="text-2xl font-bold mb-6">{isNewUser ? 'Adicionar Novo Usuário' : 'Editar Usuário'}</h2>
                <form onSubmit={handleSave} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nome Completo</label>
                        <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" required />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">E-mail</label>
                        <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" required />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="role" className="block text-sm font-medium text-gray-700">Função</label>
                            <select name="role" id="role" value={formData.role} onChange={handleChange} className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3">
                                <option>Cliente</option>
                                <option>Admin</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
                            <select name="status" id="status" value={formData.status} onChange={handleChange} className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3">
                                <option>Ativo</option>
                                <option>Inativo</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="loyaltyTier" className="block text-sm font-medium text-gray-700">Nível de Fidelidade</label>
                        <select name="loyaltyTier" id="loyaltyTier" value={formData.loyaltyTier} onChange={handleChange} className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3">
                            <option>Bronze</option>
                            <option>Prata</option>
                            <option>Ouro</option>
                            <option>Platina</option>
                        </select>
                    </div>
                     <div>
                        <label htmlFor="tags" className="block text-sm font-medium text-gray-700">Tags (separadas por vírgula)</label>
                        <input type="text" name="tags" id="tags" value={(formData.tags || []).join(', ')} onChange={e => setFormData(p => ({...p, tags: e.target.value.split(',').map(t => t.trim())}))} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"/>
                    </div>
                     <div>
                        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Anotações Internas</label>
                        <textarea name="notes" id="notes" value={formData.notes || ''} onChange={handleChange} rows={3} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"></textarea>
                    </div>
                    <div className="flex justify-end space-x-4 pt-4">
                        <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300">Cancelar</button>
                        <button type="submit" className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700">Salvar Usuário</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const UserManagement: React.FC<UserManagementProps> = ({ users, setUsers, orders, showToast }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [roleFilter, setRoleFilter] = useState('Todos');
    const [statusFilter, setStatusFilter] = useState('Todos');
    const ITEMS_PER_PAGE = 10;
    
    const usersWithSales = useMemo(() => {
        return users.map(user => {
            const userOrders = orders.filter(o => o.customerEmail === user.email && o.status !== 'Cancelado');
            const totalSpent = userOrders.reduce((acc, order) => acc + order.total, 0);
            return { ...user, totalSpent, orderCount: userOrders.length };
        });
    }, [users, orders]);

    const filteredUsers = useMemo(() => {
        return usersWithSales.filter(user => {
            const searchMatch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase());
            const roleMatch = roleFilter === 'Todos' || user.role === roleFilter;
            const statusMatch = statusFilter === 'Todos' || user.status === statusFilter;
            return searchMatch && roleMatch && statusMatch;
        });
    }, [usersWithSales, searchTerm, roleFilter, statusFilter]);
    
    const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
    const paginatedUsers = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredUsers.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredUsers, currentPage]);

    const handleAddUser = () => {
        setEditingUser(null);
        setIsModalOpen(true);
    };

    const handleEditUser = (user: User) => {
        setEditingUser(user);
        setIsModalOpen(true);
    };

    const handleSaveUser = (userToSave: User) => {
        const isNew = !users.some(u => u.id === userToSave.id);

        if (isNew) {
            const newUser = { ...userToSave, id: Date.now() }; // Assign a temp local ID
            setUsers(prev => [newUser, ...prev]);
            showToast('Usuário criado com sucesso!');
        } else {
            setUsers(prev => prev.map(u => u.id === userToSave.id ? userToSave : u));
            showToast('Usuário atualizado com sucesso!');
        }
    };

    const handleDeleteUser = (userId: number) => {
        if (window.confirm('Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.')) {
            setUsers(prev => prev.filter(u => u.id !== userId));
            showToast('Usuário excluído com sucesso!');
        }
    };

    return (
        <div>
            {isModalOpen && <UserFormModal user={editingUser} onClose={() => setIsModalOpen(false)} onSave={handleSaveUser} />}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800">Gestão de Usuários</h2>
                <button onClick={handleAddUser} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                    Adicionar Usuário
                </button>
            </div>
            
            <div className="mb-4 p-4 bg-white rounded-lg shadow-md grid grid-cols-1 md:grid-cols-3 gap-4">
                <input 
                    type="text"
                    placeholder="Pesquisar por nome ou e-mail..."
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 md:col-span-1"
                    value={searchTerm}
                    onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                />
                 <select onChange={e => { setRoleFilter(e.target.value); setCurrentPage(1); }} className="w-full p-2 border border-gray-300 rounded-md bg-white">
                    <option value="Todos">Todos os Papéis</option>
                    <option value="Cliente">Cliente</option>
                    <option value="Admin">Admin</option>
                </select>
                <select onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }} className="w-full p-2 border border-gray-300 rounded-md bg-white">
                    <option value="Todos">Todos os Status</option>
                    <option value="Ativo">Ativo</option>
                    <option value="Inativo">Inativo</option>
                </select>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-600">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                        <tr>
                            <th scope="col" className="px-6 py-3">Nome</th>
                            <th scope="col" className="px-6 py-3">Nível Fidel.</th>
                            <th scope="col" className="px-6 py-3">Total Gasto</th>
                            <th scope="col" className="px-6 py-3">Status</th>
                            <th scope="col" className="px-6 py-3">Último Login</th>
                            <th scope="col" className="px-6 py-3 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedUsers.map(user => (
                            <tr key={user.id} className="bg-white border-b hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium text-gray-900">
                                    <div className="font-bold">{user.name}</div>
                                    <div className="text-xs text-gray-500">{user.email}</div>
                                </td>
                                <td className="px-6 py-4">{user.loyaltyTier || 'N/A'}</td>
                                <td className="px-6 py-4">
                                    <div className="font-semibold">R$ {user.totalSpent.toFixed(2)}</div>
                                    <div className="text-xs text-gray-500">{user.orderCount} pedidos</div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${user.status === 'Ativo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {user.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4">{new Date(user.lastLogin).toLocaleString('pt-BR')}</td>
                                <td className="px-6 py-4 text-right space-x-2">
                                    <button onClick={() => handleEditUser(user)} className="font-medium text-blue-600 hover:underline">Editar</button>
                                    <button onClick={() => handleDeleteUser(user.id)} className="p-1 text-red-500 hover:bg-red-100 rounded-full"><TrashIcon className="h-5 w-5"/></button>
                                </td>
                            </tr>
                        ))}
                         {filteredUsers.length === 0 && (
                            <tr><td colSpan={6} className="text-center py-8 text-gray-500">Nenhum usuário encontrado.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
             <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
                <span>Mostrando {paginatedUsers.length > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0} a {Math.min(currentPage * ITEMS_PER_PAGE, filteredUsers.length)} de {filteredUsers.length} resultados</span>
                {totalPages > 1 && (
                    <div className="flex items-center space-x-1">
                        <button onClick={() => setCurrentPage(p => p - 1)} className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50" disabled={currentPage === 1}><ChevronLeftIcon className="h-5 w-5"/></button>
                        <span className="px-4 py-2 rounded-md bg-blue-100 text-blue-600 font-bold">{currentPage}</span>
                        <button onClick={() => setCurrentPage(p => p + 1)} className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50" disabled={currentPage === totalPages}><ChevronRightIcon className="h-5 w-5"/></button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserManagement;
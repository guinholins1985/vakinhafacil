
import React, { useState, useMemo } from 'react';
import { User, Order } from '../types';
import { UserIcon, ShoppingCartIcon, FinancialIcon, StarIcon, MailIcon, MessageIcon, DocumentTextIcon } from './Icons';

interface CRMManagementProps {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  orders: Order[];
}

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-gray-100 p-4 rounded-lg flex items-center">
        <div className="bg-blue-100 text-blue-600 p-2 rounded-full mr-3">{icon}</div>
        <div>
            <p className="text-xs text-gray-500">{title}</p>
            <p className="text-lg font-bold text-gray-800">{value}</p>
        </div>
    </div>
);

const CRMManagement: React.FC<CRMManagementProps> = ({ users, setUsers, orders }) => {
  const [selectedUser, setSelectedUser] = useState<User | null>(users[0] || null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeDetailTab, setActiveDetailTab] = useState('overview');

  const filteredUsers = useMemo(() => {
    return users.filter(user => 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  const selectedUserDetails = useMemo(() => {
    if (!selectedUser) return null;
    const userOrders = orders.filter(o => o.customerEmail === selectedUser.email && o.status !== 'Cancelado').sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const totalSpent = userOrders.reduce((acc, order) => acc + order.total, 0);
    const avgTicket = userOrders.length > 0 ? totalSpent / userOrders.length : 0;
    return {
        totalSpent,
        orderCount: userOrders.length,
        avgTicket,
        lastPurchase: userOrders.length > 0 ? new Date(userOrders[0].date  + 'T00:00:00').toLocaleDateString('pt-BR') : 'N/A',
        orders: userOrders,
    };
  }, [selectedUser, orders]);

  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    setActiveDetailTab('overview');
  };

  const handleAddTag = (userId: number, newTag: string) => {
    if (newTag && newTag.trim() !== '') {
      setUsers(prevUsers => prevUsers.map(u => 
        u.id === userId ? { ...u, tags: [...(u.tags || []), newTag.trim()] } : u
      ));
      if (selectedUser?.id === userId) {
        setSelectedUser(prev => prev ? { ...prev, tags: [...(prev.tags || []), newTag.trim()] } : null);
      }
    }
  };

  const handleSaveNote = (userId: number, newNote: string) => {
      setUsers(prevUsers => prevUsers.map(u => u.id === userId ? { ...u, notes: newNote } : u));
      if (selectedUser?.id === userId) {
        setSelectedUser(prev => prev ? { ...prev, notes: newNote } : null);
      }
      alert('Anotação salva!');
  };

  const communicationIcons = {
    Email: <MailIcon className="h-5 w-5 text-gray-500"/>,
    Chamada: <UserIcon className="h-5 w-5 text-gray-500"/>,
    Ticket: <MessageIcon className="h-5 w-5 text-gray-500"/>,
    Nota: <DocumentTextIcon className="h-5 w-5 text-gray-500"/>
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 h-[calc(100vh-10rem)]">
      <div className="md:w-1/3 bg-white p-4 rounded-lg shadow-md flex flex-col">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Clientes</h3>
        <input 
          type="search" 
          placeholder="Buscar cliente..." 
          className="w-full p-2 border rounded-md mb-4" 
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <ul className="space-y-2 overflow-y-auto flex-grow">
          {filteredUsers.map(user => (
            <li key={user.id} onClick={() => handleSelectUser(user)} className={`p-3 rounded-lg cursor-pointer transition-colors ${selectedUser?.id === user.id ? 'bg-blue-600 text-white' : 'hover:bg-gray-50'}`}>
              <p className={`font-semibold ${selectedUser?.id === user.id ? 'text-white' : 'text-gray-800'}`}>{user.name}</p>
              <p className={`text-xs ${selectedUser?.id === user.id ? 'text-blue-200' : 'text-gray-500'}`}>{user.email}</p>
            </li>
          ))}
        </ul>
      </div>
      <div className="md:w-2/3 bg-white p-6 rounded-lg shadow-md overflow-y-auto">
        {selectedUser && selectedUserDetails ? (
          <div className="space-y-6">
            <div className="flex items-center gap-4 pb-4 border-b">
              <img src={`https://i.pravatar.cc/150?u=${selectedUser.email}`} className="h-16 w-16 rounded-full" alt={selectedUser.name} />
              <div>
                <h2 className="text-2xl font-bold">{selectedUser.name}</h2>
                <p className="text-sm text-gray-600">{selectedUser.email}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {(selectedUser.tags || []).map(tag => (
                      <span key={tag} className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard title="Total Gasto" value={`R$ ${selectedUserDetails.totalSpent.toFixed(2)}`} icon={<FinancialIcon className="h-5 w-5"/>} />
                <StatCard title="Pedidos" value={selectedUserDetails.orderCount.toString()} icon={<ShoppingCartIcon className="h-5 w-5"/>} />
                <StatCard title="Ticket Médio" value={`R$ ${selectedUserDetails.avgTicket.toFixed(2)}`} icon={<FinancialIcon className="h-5 w-5"/>} />
                <StatCard title="Última Compra" value={selectedUserDetails.lastPurchase} icon={<ShoppingCartIcon className="h-5 w-5"/>} />
            </div>
            
            <div>
              <div className="border-b">
                  <nav className="flex space-x-4">
                      <button onClick={() => setActiveDetailTab('overview')} className={`py-2 px-1 text-sm font-medium ${activeDetailTab === 'overview' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}>Visão Geral</button>
                      <button onClick={() => setActiveDetailTab('orders')} className={`py-2 px-1 text-sm font-medium ${activeDetailTab === 'orders' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}>Histórico de Pedidos</button>
                      <button onClick={() => setActiveDetailTab('communication')} className={`py-2 px-1 text-sm font-medium ${activeDetailTab === 'communication' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}>Comunicação</button>
                  </nav>
              </div>
              <div className="py-4">
                  {activeDetailTab === 'overview' && (
                      <div className="space-y-4">
                          <div>
                              <h4 className="font-semibold mb-2">Anotações Internas</h4>
                              <textarea defaultValue={selectedUser.notes} onBlur={(e) => handleSaveNote(selectedUser.id, e.target.value)} className="w-full h-24 p-2 border rounded-md text-sm" placeholder="Adicionar anotação sobre o cliente..."></textarea>
                          </div>
                           <div>
                              <h4 className="font-semibold mb-2">Tags</h4>
                              <form onSubmit={(e) => { e.preventDefault(); const input = e.currentTarget.elements[0] as HTMLInputElement; handleAddTag(selectedUser.id, input.value); input.value = ''; }} className="flex gap-2">
                                  <input placeholder="Adicionar nova tag" className="w-full p-2 border rounded-md text-sm" />
                                  <button type="submit" className="bg-blue-100 text-blue-700 px-4 rounded-md text-sm font-semibold">Adicionar</button>
                              </form>
                          </div>
                      </div>
                  )}
                  {activeDetailTab === 'orders' && (
                      <ul className="space-y-2">
                          {selectedUserDetails.orders.map(order => (
                              <li key={order.id} className="flex justify-between items-center p-2 bg-gray-50 rounded-md text-sm">
                                  <span>Pedido #{order.id} - {new Date(order.date + 'T00:00:00').toLocaleDateString()}</span>
                                  <span>R$ {order.total.toFixed(2)}</span>
                                  <span>{order.status}</span>
                              </li>
                          ))}
                      </ul>
                  )}
                  {activeDetailTab === 'communication' && (
                      <ul className="space-y-3">
                          {(selectedUser.communicationLog || []).map(log => (
                              <li key={log.id} className="flex gap-3 p-2 border-b">
                                  {communicationIcons[log.type]}
                                  <div>
                                      <p className="text-sm font-semibold">{log.type} em {new Date(log.date).toLocaleString()}</p>
                                      <p className="text-sm text-gray-600">{log.summary}</p>
                                  </div>
                              </li>
                          ))}
                      </ul>
                  )}
              </div>
            </div>

          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
            <UserIcon className="h-16 w-16 mb-4 text-gray-300" />
            <h3 className="text-xl font-bold">Selecione um cliente</h3>
            <p>Escolha um cliente na lista à esquerda para ver seus detalhes.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CRMManagement;

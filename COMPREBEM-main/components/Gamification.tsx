import React, { useState } from 'react';
import { AppState, User, Mission, SalesRepresentative, Badge, TeamMission } from '../types.ts';
import { TrophyIcon, FlagIcon, UsersIcon, PlusIcon, PencilIcon, TrashIcon } from './Icons.tsx';
import { BADGES, TEAM_MISSIONS } from '../constants.ts';
import { v4 as uuidv4 } from 'uuid';

interface GamificationProps {
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
}

const MissionFormModal: React.FC<{
    mission: Mission | null;
    onClose: () => void;
    onSave: (mission: Mission) => void;
}> = ({ mission, onClose, onSave }) => {
    const isNew = mission === null;
    const [formData, setFormData] = useState<Mission>(mission || {
        id: uuidv4(),
        title: '',
        description: '',
        points: 50,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(p => ({ ...p, [name]: name === 'points' ? parseInt(value) || 0 : value }));
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title || !formData.description) {
            alert("Por favor, preencha todos os campos.");
            return;
        }
        onSave(formData);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h3 className="text-lg font-bold mb-4">{isNew ? 'Criar Nova Missão' : 'Editar Missão'}</h3>
                <form onSubmit={handleSave} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium">Título da Missão</label>
                        <input name="title" value={formData.title} onChange={handleChange} className="w-full p-2 border rounded-md" required />
                    </div>
                    <div>
                        <label className="text-sm font-medium">Descrição</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} className="w-full p-2 border rounded-md h-24" required />
                    </div>
                    <div>
                        <label className="text-sm font-medium">Pontos de Recompensa</label>
                        <input name="points" type="number" value={formData.points} onChange={handleChange} className="w-full p-2 border rounded-md" required />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <button type="button" onClick={onClose} className="bg-gray-200 py-2 px-4 rounded-lg">Cancelar</button>
                        <button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded-lg">Salvar Missão</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const Gamification: React.FC<GamificationProps> = ({ appState, setAppState }) => {
  const [activeTab, setActiveTab] = useState('customer');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMission, setEditingMission] = useState<Mission | null>(null);

  const customerLeaderboard = appState.users
    .filter(u => u.role === 'Cliente' && u.gamification)
    .sort((a, b) => (b.gamification?.points || 0) - (a.gamification?.points || 0))
    .slice(0, 10);
    
  const teamLeaderboard = [...appState.salesReps]
    .sort((a, b) => b.points - a.points)
    .slice(0, 10);

  const tabs = [
    { id: 'customer', label: 'Gamificação de Clientes' },
    { id: 'team', label: 'Gamificação da Equipe' },
  ];

  const handleSaveMission = (mission: Mission) => {
    setAppState(prev => {
        const exists = prev.missions.some(m => m.id === mission.id);
        const newMissions = exists ? prev.missions.map(m => m.id === mission.id ? mission : m) : [mission, ...prev.missions];
        return {...prev, missions: newMissions};
    });
  };

  const handleDeleteMission = (id: string) => {
      if (window.confirm("Tem certeza que deseja excluir esta missão?")) {
          setAppState(prev => ({...prev, missions: prev.missions.filter(m => m.id !== id)}));
      }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'team':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Leaderboard de Vendedores</h3>
              <ul className="space-y-3">
                {teamLeaderboard.map((rep, index) => (
                  <li key={rep.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600 mr-4">
                        {index === 0 ? <TrophyIcon className="h-6 w-6 text-yellow-500"/> : index + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{rep.name}</p>
                        <div className="flex items-center gap-1 mt-1">
                          {rep.badges.map(badgeId => {
                            const badge = BADGES.find(b => b.id === badgeId);
                            if (!badge) return null;
                            return <badge.icon key={badge.id} className="h-5 w-5 text-blue-500"><title>{badge.name}</title></badge.icon>;
                          })}
                        </div>
                      </div>
                    </div>
                    <div className="font-bold text-lg text-blue-600">{rep.points} pts</div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="lg:col-span-1 space-y-6">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Emblemas Disponíveis</h3>
                     <div className="space-y-3">
                        {BADGES.map(badge => (
                            <div key={badge.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <badge.icon className="h-8 w-8 text-blue-600 flex-shrink-0" />
                                <div>
                                    <p className="font-semibold text-sm">{badge.name}</p>
                                    <p className="text-xs text-gray-500">{badge.description}</p>
                                </div>
                            </div>
                        ))}
                     </div>
                </div>
                 <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Desafios da Equipe</h3>
                     <div className="space-y-3">
                        {TEAM_MISSIONS.map(mission => (
                             <div key={mission.id} className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                                <div className="flex items-center gap-3">
                                    <FlagIcon className="h-5 w-5 text-blue-600"/>
                                    <p className="font-semibold text-blue-800">{mission.title}</p>
                                </div>
                                <p className="text-sm text-blue-700 mt-1">{mission.description}</p>
                                <p className="text-sm font-bold text-blue-600 mt-2">+{mission.points} pontos</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
          </div>
        );
      case 'customer':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Leaderboard de Clientes</h3>
              <ul className="space-y-3">
                {customerLeaderboard.map((user, index) => (
                  <li key={user.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex items-center">
                       <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600 mr-4">
                         {index === 0 ? <TrophyIcon className="h-6 w-6 text-yellow-500"/> : index + 1}
                       </div>
                      <div>
                        <p className="font-semibold text-gray-800">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.loyaltyTier}</p>
                      </div>
                    </div>
                    <div className="font-bold text-lg text-blue-600">{user.gamification?.points} pts</div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">Gestão de Missões</h3>
                <button onClick={() => { setEditingMission(null); setIsModalOpen(true); }} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2">
                    <PlusIcon className="h-5 w-5" />
                    Criar Nova Missão
                </button>
              </div>
              <div className="space-y-3">
                {appState.missions.map(mission => (
                  <div key={mission.id} className="p-4 rounded-lg bg-gray-50 border flex justify-between items-center">
                    <div>
                        <p className="font-semibold text-gray-800">{mission.title}</p>
                        <p className="text-sm text-gray-600">{mission.description}</p>
                        <p className="text-sm font-bold text-blue-600 mt-1">+{mission.points} pontos</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => { setEditingMission(mission); setIsModalOpen(true); }} className="p-2 text-blue-600 hover:bg-blue-100 rounded-full"><PencilIcon className="h-5 w-5" /></button>
                        <button onClick={() => handleDeleteMission(mission.id)} className="p-2 text-red-500 hover:bg-red-100 rounded-full"><TrashIcon className="h-5 w-5" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {isModalOpen && <MissionFormModal mission={editingMission} onClose={() => setIsModalOpen(false)} onSave={handleSaveMission} />}
      <h2 className="text-3xl font-bold text-gray-800">Plataforma de Gamificação</h2>
      <div className="bg-white rounded-lg shadow-sm p-2">
          <nav className="flex space-x-2">
              {tabs.map(tab => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-4 py-2 rounded-md text-sm font-medium ${activeTab === tab.id ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}`}>
                      {tab.label}
                  </button>
              ))}
          </nav>
      </div>
      <div>{renderTabContent()}</div>
    </div>
  );
};

export default Gamification;
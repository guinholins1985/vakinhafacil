import React, { useState } from 'react';
import { ProjectTask, TeamMember, CalendarEvent, WikiArticle } from '../types.ts';
import { KanbanIcon, CalendarIcon, BookOpenIcon, UsersIcon, TrophyIcon, PlusIcon, PencilIcon, TrashIcon, ChevronLeftIcon, ChevronRightIcon } from './Icons.tsx';
import { v4 as uuidv4 } from 'uuid';

interface CollaborationToolsProps {
    tasks: ProjectTask[];
    setTasks: React.Dispatch<React.SetStateAction<ProjectTask[]>>;
    teamMembers: TeamMember[];
    setTeamMembers: React.Dispatch<React.SetStateAction<TeamMember[]>>;
    events: CalendarEvent[];
    setEvents: React.Dispatch<React.SetStateAction<CalendarEvent[]>>;
    articles: WikiArticle[];
    setArticles: React.Dispatch<React.SetStateAction<WikiArticle[]>>;
}

// --- Modals ---
const Modal: React.FC<{ children: React.ReactNode; title: string; onClose: () => void; }> = ({ children, title, onClose }) => (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
        <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-4"><h3 className="text-lg font-bold">{title}</h3><button onClick={onClose} className="text-2xl">&times;</button></div>
            {children}
        </div>
    </div>
);

const TaskModal: React.FC<{ task: Partial<ProjectTask> | null; onSave: (task: ProjectTask) => void; onClose: () => void; }> = ({ task, onSave, onClose }) => {
    const [content, setContent] = useState(task?.content || '');
    const [assignee, setAssignee] = useState(task?.assignee || '');
    const handleSave = () => { onSave({ id: task?.id || uuidv4(), content, assignee, status: task?.status || 'To Do' }); onClose(); };
    return <Modal title={task?.id ? "Editar Tarefa" : "Nova Tarefa"} onClose={onClose}><div className="space-y-4"><textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Descrição da tarefa..." className="w-full p-2 border rounded h-24" /><input value={assignee} onChange={e => setAssignee(e.target.value)} placeholder="Responsável (opcional)" className="w-full p-2 border rounded" /><div className="flex justify-end gap-2"><button onClick={handleSave} className="bg-blue-600 text-white py-2 px-4 rounded-lg">Salvar</button></div></div></Modal>
};

const EventModal: React.FC<{ event: Partial<CalendarEvent> | null; onSave: (event: CalendarEvent) => void; onClose: () => void; }> = ({ event, onSave, onClose }) => {
    const [title, setTitle] = useState(event?.title || '');
    const [date, setDate] = useState(event?.date || new Date().toISOString().split('T')[0]);
    const handleSave = () => { onSave({ id: event?.id || uuidv4(), title, date }); onClose(); };
    return <Modal title={event?.id ? "Editar Evento" : "Novo Evento"} onClose={onClose}><div className="space-y-4"><input value={title} onChange={e => setTitle(e.target.value)} placeholder="Título do evento" className="w-full p-2 border rounded" /><input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full p-2 border rounded" /><div className="flex justify-end gap-2"><button onClick={handleSave} className="bg-blue-600 text-white py-2 px-4 rounded-lg">Salvar</button></div></div></Modal>
};

const ArticleModal: React.FC<{ article: WikiArticle | null; onSave: (article: WikiArticle) => void; onClose: () => void; }> = ({ article, onSave, onClose }) => {
    const [title, setTitle] = useState(article?.title || '');
    const [content, setContent] = useState(article?.content || '');
    const handleSave = () => { onSave({ id: article?.id || uuidv4(), title, content, lastUpdated: new Date().toISOString() }); onClose(); };
    return <Modal title={article ? "Editar Artigo" : "Novo Artigo"} onClose={onClose}><div className="space-y-4"><input value={title} onChange={e => setTitle(e.target.value)} placeholder="Título do artigo" className="w-full p-2 border rounded" /><textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Conteúdo..." className="w-full p-2 border rounded h-48" /><div className="flex justify-end gap-2"><button onClick={handleSave} className="bg-blue-600 text-white py-2 px-4 rounded-lg">Salvar</button></div></div></Modal>
};

const MemberModal: React.FC<{ member: TeamMember | null; onSave: (member: TeamMember) => void; onClose: () => void; }> = ({ member, onSave, onClose }) => {
    const [data, setData] = useState<TeamMember>(member || { id: uuidv4(), name: '', role: '', avatar: '', points: 0 });
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setData(p => ({ ...p, [e.target.name]: e.target.name === 'points' ? parseInt(e.target.value) : e.target.value }));
    return <Modal title={member ? "Editar Membro" : "Novo Membro"} onClose={onClose}><form onSubmit={e => {e.preventDefault(); onSave(data); onClose()}} className="space-y-4"><input name="name" value={data.name} onChange={handleChange} placeholder="Nome" className="w-full p-2 border rounded" required/><input name="role" value={data.role} onChange={handleChange} placeholder="Cargo" className="w-full p-2 border rounded" required/><input name="avatar" value={data.avatar} onChange={handleChange} placeholder="Iniciais (Avatar)" className="w-full p-2 border rounded" required/><input name="points" type="number" value={data.points} onChange={handleChange} placeholder="Pontos" className="w-full p-2 border rounded" required/><div className="flex justify-end gap-2"><button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded-lg">Salvar</button></div></form></Modal>
};


// --- Sub-components ---
const KanbanBoard: React.FC<Pick<CollaborationToolsProps, 'tasks' | 'setTasks'> & { onEdit: (t: ProjectTask) => void, onNew: (status: ProjectTask['status']) => void }> = ({ tasks, setTasks, onEdit, onNew }) => {
    const columns: ProjectTask['status'][] = ['To Do', 'In Progress', 'Done'];
    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, taskId: string) => e.dataTransfer.setData("taskId", taskId);
    const handleDrop = (e: React.DragEvent<HTMLDivElement>, status: ProjectTask['status']) => { const taskId = e.dataTransfer.getData("taskId"); setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status } : t)); };
    const handleDelete = (id: string) => { if(window.confirm('Excluir esta tarefa?')) setTasks(prev => prev.filter(t => t.id !== id)) };
    
    return (<div className="grid grid-cols-1 md:grid-cols-3 gap-6">{columns.map(status => (<div key={status} className="bg-gray-100 rounded-lg p-4" onDrop={(e) => handleDrop(e, status)} onDragOver={(e) => e.preventDefault()}><div className="flex justify-between items-center mb-4"><h4 className="font-bold text-gray-700">{status}</h4><button onClick={() => onNew(status)} className="text-blue-600 font-bold text-xl">+</button></div><div className="space-y-3 min-h-[200px]">{tasks.filter(t => t.status === status).map(task => (<div key={task.id} className="bg-white p-3 rounded-md shadow-sm cursor-grab group relative" draggable onDragStart={(e) => handleDragStart(e, task.id)}><div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100"><button onClick={() => onEdit(task)} className="p-1 text-blue-600"><PencilIcon className="h-4 w-4"/></button><button onClick={() => handleDelete(task.id)} className="p-1 text-red-500"><TrashIcon className="h-4 w-4"/></button></div><p className="text-sm text-gray-800">{task.content}</p>{task.assignee && <p className="text-xs text-gray-500 mt-2">@{task.assignee}</p>}</div>))}</div></div>))}</div>);
};

const TeamCalendar: React.FC<{ events: CalendarEvent[], onEdit: (e: CalendarEvent) => void, onNew: (date: string) => void }> = ({ events, onEdit, onNew }) => {
    const [date, setDate] = useState(new Date());
    const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const monthDays = Array.from({ length: firstDay + daysInMonth }, (_, i) => i < firstDay ? null : i - firstDay + 1);
    
    return (<div className="bg-white p-6 rounded-lg shadow-md"><div className="flex justify-between items-center mb-4"><button onClick={() => setDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))}><ChevronLeftIcon className="h-6 w-6"/></button><h3 className="text-lg font-bold">{date.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}</h3><button onClick={() => setDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))}><ChevronRightIcon className="h-6 w-6"/></button></div><div className="grid grid-cols-7 gap-1 text-center text-sm">{weekdays.map(d => <div key={d} className="font-bold">{d}</div>)}{monthDays.map((day, i) => (<div key={i} className={`p-2 border rounded-md min-h-[80px] ${day ? 'bg-white' : 'bg-gray-50'}`} onClick={() => day && onNew(new Date(date.getFullYear(), date.getMonth(), day).toISOString().split('T')[0])}>{day && <span className="font-semibold">{day}</span>}{events.filter(e => new Date(e.date + "T00:00:00").toDateString() === new Date(date.getFullYear(), date.getMonth(), day||0).toDateString()).map(e => <div key={e.id} onClick={(ev) => {ev.stopPropagation(); onEdit(e);}} className="text-xs bg-blue-100 text-blue-800 p-1 rounded mt-1 truncate cursor-pointer">{e.title}</div>)}</div>))}</div></div>);
};

const InternalWiki: React.FC<{ articles: WikiArticle[], onEdit: (a: WikiArticle) => void, onNew: () => void, onDelete: (id: string) => void }> = ({ articles, onEdit, onNew, onDelete }) => {
    const [selectedArticle, setSelectedArticle] = useState<WikiArticle | null>(articles[0] || null);

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Wiki Interna / Base de Conhecimento</h3>
                <button onClick={onNew} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2">
                    <PlusIcon className="h-5 w-5"/> Novo Artigo
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[500px] border rounded-lg p-4">
                <div className="md:col-span-1 border-r pr-4 overflow-y-auto">
                    <ul className="space-y-2">
                        {articles.map(article => (
                            <li key={article.id}>
                                <button
                                    onClick={() => setSelectedArticle(article)}
                                    className={`w-full text-left p-3 rounded-md transition-colors ${selectedArticle?.id === article.id ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-50'}`}
                                >
                                    <p className="font-semibold">{article.title}</p>
                                    <p className="text-xs text-gray-500">
                                        Atualizado em: {new Date(article.lastUpdated).toLocaleDateString()}
                                    </p>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="md:col-span-2 overflow-y-auto">
                    {selectedArticle ? (
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-2xl font-bold">{selectedArticle.title}</h2>
                                <div className="flex gap-2">
                                    <button onClick={() => onEdit(selectedArticle)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-full"><PencilIcon className="h-5 w-5"/></button>
                                    <button onClick={() => { onDelete(selectedArticle.id); setSelectedArticle(null); }} className="p-2 text-red-500 hover:bg-red-100 rounded-full"><TrashIcon className="h-5 w-5"/></button>
                                </div>
                            </div>
                            <div className="prose max-w-none text-gray-700 whitespace-pre-wrap">
                                {selectedArticle.content}
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                            <BookOpenIcon className="h-16 w-16 mb-4"/>
                            <p>Selecione um artigo para ler</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const TeamGamification: React.FC<{ teamMembers: TeamMember[], onEdit: (m: TeamMember) => void, onNew: () => void, onDelete: (id: string) => void }> = ({ teamMembers, onEdit, onNew, onDelete }) => (
    <div className="bg-white p-6 rounded-lg shadow-md"><div className="flex justify-between items-center mb-4"><h3 className="text-lg font-bold mb-4">Gamificação da Equipe</h3><button onClick={onNew} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2"><PlusIcon className="h-5 w-5"/>Novo Membro</button></div><ul className="space-y-3">{teamMembers.sort((a,b) => b.points - a.points).map((member, index) => (<li key={member.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 group">
        <div className="flex items-center"><div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center font-bold text-gray-600 mr-3">{member.avatar}</div><div><p className="font-semibold text-gray-800">{member.name}</p><p className="text-xs text-gray-500">{member.role}</p></div></div>
        <div className="flex items-center gap-4"><div className="text-right"><p className="font-bold text-lg text-blue-600">{member.points} pts</p>{index === 0 && <p className="text-xs text-yellow-500 font-semibold flex items-center justify-end"><TrophyIcon className="h-4 w-4 mr-1"/>Líder</p>}</div><div className="flex gap-1 opacity-0 group-hover:opacity-100"><button onClick={() => onEdit(member)} className="p-1 text-blue-600"><PencilIcon className="h-4 w-4"/></button><button onClick={() => onDelete(member.id)} className="p-1 text-red-500"><TrashIcon className="h-4 w-4"/></button></div></div>
    </li>))}</ul></div>
);


const CollaborationTools: React.FC<CollaborationToolsProps> = (props) => {
    const [activeTab, setActiveTab] = useState('kanban');
    const [modal, setModal] = useState<{type: string | null, data: any}>({type: null, data: null});

    const handleSave = <T extends {id:string}>(item: T, setter: React.Dispatch<React.SetStateAction<T[]>>) => {
        setter(prev => {
            const exists = prev.some(i => i.id === item.id);
            return exists ? prev.map(i => i.id === item.id ? item : i) : [item, ...prev];
        });
        setModal({type: null, data: null});
    }
    
    const tabs = [{ id: 'kanban', label: 'Gestão de Projetos', icon: KanbanIcon }, { id: 'calendar', label: 'Calendário', icon: CalendarIcon }, { id: 'wiki', label: 'Wiki', icon: BookOpenIcon }, { id: 'team', label: 'Equipe', icon: UsersIcon },];

    const renderTabContent = () => {
        switch (activeTab) {
            case 'kanban': return <KanbanBoard tasks={props.tasks} setTasks={props.setTasks} onEdit={(t) => setModal({type: 'task', data: t})} onNew={(status) => setModal({type: 'task', data: {status}})} />;
            case 'calendar': return <TeamCalendar events={props.events} onEdit={(e) => setModal({type: 'event', data: e})} onNew={(date) => setModal({type: 'event', data: {date}})} />;
            case 'wiki': return <InternalWiki articles={props.articles} onEdit={(a) => setModal({type: 'article', data: a})} onNew={() => setModal({type: 'article', data: null})} onDelete={(id) => props.setArticles(p => p.filter(i => i.id !== id))} />;
            case 'team': return <TeamGamification teamMembers={props.teamMembers} onEdit={(m) => setModal({type: 'member', data: m})} onNew={() => setModal({type: 'member', data: null})} onDelete={(id) => props.setTeamMembers(p => p.filter(i => i.id !== id))} />;
            default: return null;
        }
    };

    return (
        <div className="space-y-6">
            {modal.type === 'task' && <TaskModal task={modal.data} onClose={() => setModal({type: null, data: null})} onSave={(item) => handleSave(item, props.setTasks)} />}
            {modal.type === 'event' && <EventModal event={modal.data} onClose={() => setModal({type: null, data: null})} onSave={(item) => handleSave(item, props.setEvents)} />}
            {modal.type === 'article' && <ArticleModal article={modal.data} onClose={() => setModal({type: null, data: null})} onSave={(item) => handleSave(item, props.setArticles)} />}
            {modal.type === 'member' && <MemberModal member={modal.data} onClose={() => setModal({type: null, data: null})} onSave={(item) => handleSave(item, props.setTeamMembers)} />}
            
            <h2 className="text-3xl font-bold text-gray-800">Ferramentas de Colaboração</h2>
            <div className="bg-white rounded-lg shadow-sm p-2"><nav className="flex space-x-2 overflow-x-auto">{tabs.map(tab => (<button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-shrink-0 px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center ${activeTab === tab.id ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}><tab.icon className="h-5 w-5 mr-2" />{tab.label}</button>))}</nav></div>
            <div>{renderTabContent()}</div>
        </div>
    );
};

export default CollaborationTools;
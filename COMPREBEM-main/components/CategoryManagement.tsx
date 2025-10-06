import React, { useState } from 'react';
import { AppState, Category } from '../types.ts';
import { PlusIcon, PencilIcon, TrashIcon } from './Icons.tsx';
import { v4 as uuidv4 } from 'uuid';

interface CategoryManagementProps {
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
  showToast: (message: string) => void;
}

const CategoryModal: React.FC<{
    category: Category | null;
    onClose: () => void;
    onSave: (category: Category) => void;
}> = ({ category, onClose, onSave }) => {
    const isNew = category === null;
    const [formData, setFormData] = useState<Category>(category || {
        id: uuidv4(),
        name: '',
        url: '#',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">{isNew ? 'Adicionar Nova Categoria' : 'Editar Categoria'}</h2>
                <form onSubmit={handleSave} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="text-sm font-medium">Nome da Categoria</label>
                        <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} className="w-full p-2 border rounded-md mt-1" required />
                    </div>
                    <div>
                        <label htmlFor="url" className="text-sm font-medium">URL (Link)</label>
                        <input type="text" name="url" id="url" value={formData.url} onChange={handleChange} className="w-full p-2 border rounded-md mt-1" required />
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                        <button type="button" onClick={onClose} className="bg-gray-200 py-2 px-4 rounded-lg">Cancelar</button>
                        <button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded-lg">Salvar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const CategoryManagement: React.FC<CategoryManagementProps> = ({ appState, setAppState, showToast }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const { categories } = appState;

    const handleSave = (category: Category) => {
        setAppState(prev => {
            const exists = prev.categories.some(c => c.id === category.id);
            const newCategories = exists
                ? prev.categories.map(c => (c.id === category.id ? category : c))
                : [...prev.categories, category];
            showToast(exists ? 'Categoria atualizada!' : 'Categoria criada!');
            return { ...prev, categories: newCategories };
        });
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Tem certeza que deseja excluir esta categoria?')) {
            setAppState(prev => ({
                ...prev,
                categories: prev.categories.filter(c => c.id !== id),
            }));
            showToast('Categoria excluída!');
        }
    };

    const openModal = (category: Category | null) => {
        setEditingCategory(category);
        setIsModalOpen(true);
    };

    return (
        <div>
            {isModalOpen && <CategoryModal category={editingCategory} onClose={() => setIsModalOpen(false)} onSave={handleSave} />}
            
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-800">Gerenciamento de Categorias</h2>
                    <button onClick={() => openModal(null)} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2">
                        <PlusIcon className="h-5 w-5" />
                        Adicionar Categoria
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th className="p-3 text-left">Nome</th>
                                <th className="p-3 text-left">URL</th>
                                <th className="p-3 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.map(category => (
                                <tr key={category.id} className="border-t hover:bg-gray-50">
                                    <td className="p-3 font-medium">{category.name}</td>
                                    <td className="p-3 font-mono text-xs">{category.url}</td>
                                    <td className="p-3 text-right space-x-2">
                                        <button onClick={() => openModal(category)} className="p-1 text-blue-600 hover:bg-blue-100 rounded-full">
                                            <PencilIcon className="h-5 w-5" />
                                        </button>
                                        <button onClick={() => handleDelete(category.id)} className="p-1 text-red-500 hover:bg-red-100 rounded-full">
                                            <TrashIcon className="h-5 w-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default CategoryManagement;
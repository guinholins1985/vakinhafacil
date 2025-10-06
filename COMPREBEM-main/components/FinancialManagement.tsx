
import React, { useMemo, useState } from 'react';
import { Order, Invoice, Expense } from '../types';
import { FinancialIcon, PlusIcon, DocumentChartBarIcon, BanknotesIcon, PencilIcon, TrashIcon, DocumentArrowDownIcon, TableCellsIcon } from './Icons';
import { v4 as uuidv4 } from 'uuid';

interface FinancialManagementProps {
    orders: Order[];
    invoices: Invoice[];
    expenses: Expense[];
    setInvoices: React.Dispatch<React.SetStateAction<Invoice[]>>;
    setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
}

// --- Reusable & New Components ---

const ExpenseFormModal: React.FC<{
    expense: Expense | null;
    onClose: () => void;
    onSave: (expense: Expense) => void;
}> = ({ expense, onClose, onSave }) => {
    const isNew = expense === null;
    const [formData, setFormData] = useState<Expense>(expense || {
        id: uuidv4(),
        date: new Date().toISOString().split('T')[0],
        category: 'Outros',
        description: '',
        amount: 0,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(p => ({ ...p, [name]: name === 'amount' ? parseFloat(value) : value }));
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.description || formData.amount <= 0) {
            alert('Por favor, preencha a descrição e um valor maior que zero.');
            return;
        }
        onSave(formData);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h3 className="text-lg font-bold mb-4">{isNew ? 'Lançar Nova Despesa' : 'Editar Despesa'}</h3>
                <form onSubmit={handleSave} className="space-y-4">
                    <div><label className="text-sm">Data</label><input type="date" name="date" value={formData.date} onChange={handleChange} className="w-full p-2 border rounded-md" required /></div>
                    <div><label className="text-sm">Categoria</label><select name="category" value={formData.category} onChange={handleChange} className="w-full p-2 border rounded-md bg-white">
                        {['Marketing', 'Salários', 'Inventário', 'Operações', 'Outros'].map(cat => <option key={cat}>{cat}</option>)}
                    </select></div>
                    <div><label className="text-sm">Descrição</label><input name="description" value={formData.description} onChange={handleChange} className="w-full p-2 border rounded-md" required /></div>
                    <div><label className="text-sm">Valor (R$)</label><input type="number" name="amount" value={formData.amount} onChange={handleChange} step="0.01" min="0" className="w-full p-2 border rounded-md" required /></div>
                    <div className="flex justify-end gap-2 pt-2"><button type="button" onClick={onClose} className="bg-gray-200 py-2 px-4 rounded-lg">Cancelar</button><button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded-lg">Salvar</button></div>
                </form>
            </div>
        </div>
    );
};

const InvoiceFormModal: React.FC<{
    invoice: Invoice | null;
    onClose: () => void;
    onSave: (invoice: Invoice) => void;
    orders: Order[];
}> = ({ invoice, onClose, onSave, orders }) => {
    const isNew = invoice === null;
    const [formData, setFormData] = useState<Invoice>(invoice || {
        id: `INV-${Date.now().toString().slice(-6)}`,
        orderId: '',
        customerName: '',
        amount: 0,
        dueDate: new Date().toISOString().split('T')[0],
        status: 'Pendente',
    });

    const handleOrderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const orderId = e.target.value;
        const selectedOrder = orders.find(o => o.id === orderId);
        if (selectedOrder) {
            setFormData(p => ({
                ...p,
                orderId: selectedOrder.id,
                customerName: selectedOrder.customerName,
                amount: selectedOrder.total,
            }));
        }
    };
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(p => ({...p, [e.target.name]: e.target.value}));
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.orderId) {
            alert('Por favor, selecione um pedido.');
            return;
        }
        onSave(formData);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg">
                 <h3 className="text-lg font-bold mb-4">{isNew ? 'Gerar Nova Fatura' : 'Editar Fatura'}</h3>
                 <form onSubmit={handleSave} className="space-y-4">
                     <div><label className="text-sm">Pedido de Origem</label><select value={formData.orderId} onChange={handleOrderChange} className="w-full p-2 border rounded-md bg-white" required>
                        <option value="">Selecione um Pedido</option>
                        {orders.map(o => <option key={o.id} value={o.id}>{o.id} - {o.customerName}</option>)}
                     </select></div>
                     <div className="grid grid-cols-2 gap-4">
                        <div><label className="text-sm">Cliente</label><input value={formData.customerName} className="w-full p-2 border rounded-md bg-gray-100" readOnly /></div>
                        <div><label className="text-sm">Valor (R$)</label><input type="number" value={formData.amount} onChange={handleChange} name="amount" className="w-full p-2 border rounded-md" /></div>
                        <div><label className="text-sm">Vencimento</label><input type="date" value={formData.dueDate} onChange={handleChange} name="dueDate" className="w-full p-2 border rounded-md" /></div>
                        <div><label className="text-sm">Status</label><select value={formData.status} onChange={handleChange} name="status" className="w-full p-2 border rounded-md bg-white">
                            {['Pendente', 'Paga', 'Atrasada'].map(s => <option key={s}>{s}</option>)}
                        </select></div>
                     </div>
                     <div className="flex justify-end gap-2 pt-2"><button type="button" onClick={onClose} className="bg-gray-200 py-2 px-4 rounded-lg">Cancelar</button><button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded-lg">Salvar Fatura</button></div>
                 </form>
            </div>
        </div>
    );
};

const CashFlowChart: React.FC<{ invoices: Invoice[], expenses: Expense[] }> = ({ invoices, expenses }) => {
    const data = useMemo(() => {
        const months = Array.from({ length: 6 }, (_, i) => {
            const d = new Date();
            d.setHours(0, 0, 0, 0);
            d.setDate(1); // Avoid day-of-month issues when going back
            d.setMonth(d.getMonth() - i);
            return { month: d.getMonth(), year: d.getFullYear(), label: d.toLocaleString('pt-BR', { month: 'short' }).replace('.', ''), revenue: 0, expense: 0 };
        }).reverse();

        invoices.forEach(inv => {
            if (inv.status === 'Paga') {
                const invDate = new Date(inv.dueDate + 'T00:00:00');
                const monthData = months.find(m => m.month === invDate.getMonth() && m.year === invDate.getFullYear());
                if (monthData) monthData.revenue += inv.amount;
            }
        });
        expenses.forEach(exp => {
            const expDate = new Date(exp.date + 'T00:00:00');
            const monthData = months.find(m => m.month === expDate.getMonth() && m.year === expDate.getFullYear());
            if (monthData) monthData.expense += exp.amount;
        });
        
        return months;
    }, [invoices, expenses]);

    const maxVal = Math.max(...data.flatMap(d => [d.revenue, d.expense]), 1);

    return (
         <div className="bg-white p-6 rounded-lg shadow"><h3 className="text-xl font-bold mb-4">Fluxo de Caixa (Últimos 6 Meses)</h3>
            <div className="h-64 flex justify-around items-end gap-4 border-l border-b p-2">
                {data.map(d => (
                    <div key={`${d.year}-${d.month}`} className="flex-1 flex flex-col items-center justify-end">
                        <div className="flex justify-center items-end h-full gap-1 w-full">
                            <div title={`Receita: R$ ${d.revenue.toLocaleString()}`} className="bg-green-400 w-1/2 rounded-t hover:opacity-80 transition-opacity" style={{ height: `${(d.revenue / maxVal) * 100}%` }}></div>
                            <div title={`Despesa: R$ ${d.expense.toLocaleString()}`} className="bg-red-400 w-1/2 rounded-t hover:opacity-80 transition-opacity" style={{ height: `${(d.expense / maxVal) * 100}%` }}></div>
                        </div>
                        <p className="text-xs mt-1 capitalize font-medium">{d.label}</p>
                    </div>
                ))}
            </div>
             <div className="flex justify-center items-center gap-4 mt-2 text-sm">
                <div className="flex items-center gap-1"><div className="w-3 h-3 bg-green-400 rounded-sm"></div>Receita</div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 bg-red-400 rounded-sm"></div>Despesa</div>
            </div>
        </div>
    );
};

const ExportButtons: React.FC = () => (
    <div className="flex gap-2">
        <button onClick={() => alert('Exportando para PDF... (simulação)')} className="bg-gray-600 text-white font-bold py-2 px-3 rounded-lg text-sm flex items-center gap-1 hover:bg-gray-700"><DocumentArrowDownIcon className="h-4 w-4"/>PDF</button>
        <button onClick={() => alert('Exportando para XLS... (simulação)')} className="bg-gray-600 text-white font-bold py-2 px-3 rounded-lg text-sm flex items-center gap-1 hover:bg-gray-700"><TableCellsIcon className="h-4 w-4"/>XLS</button>
    </div>
);


const FinancialManagement: React.FC<FinancialManagementProps> = (props) => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
    const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
    const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

    const handleSaveInvoice = (invoice: Invoice) => {
        props.setInvoices(prev => {
            const exists = prev.some(i => i.id === invoice.id);
            return exists ? prev.map(i => i.id === invoice.id ? invoice : i) : [invoice, ...prev];
        });
    };

    const handleSaveExpense = (expense: Expense) => {
        props.setExpenses(prev => {
            const exists = prev.some(e => e.id === expense.id);
            return exists ? prev.map(e => e.id === expense.id ? expense : e) : [expense, ...prev];
        });
    };

    const handleDeleteExpense = (id: string) => {
        if(window.confirm('Tem certeza que deseja excluir esta despesa?')) {
            props.setExpenses(prev => prev.filter(e => e.id !== id));
        }
    }

    const tabs = [
        { id: 'dashboard', label: 'Dashboard', icon: FinancialIcon },
        { id: 'invoices', label: 'Faturas', icon: DocumentChartBarIcon },
        { id: 'expenses', label: 'Despesas', icon: BanknotesIcon },
        { id: 'reports', label: 'Relatórios', icon: DocumentChartBarIcon },
    ];
    
    const renderContent = () => {
        switch(activeTab) {
            case 'dashboard': return <DashboardView invoices={props.invoices} expenses={props.expenses} />;
            case 'invoices': return <InvoicesView invoices={props.invoices} onNew={() => { setEditingInvoice(null); setIsInvoiceModalOpen(true); }} onEdit={(inv) => { setEditingInvoice(inv); setIsInvoiceModalOpen(true); }} />;
            case 'expenses': return <ExpensesView expenses={props.expenses} onNew={() => { setEditingExpense(null); setIsExpenseModalOpen(true); }} onEdit={(exp) => { setEditingExpense(exp); setIsExpenseModalOpen(true); }} onDelete={handleDeleteExpense} />;
            case 'reports': return <ReportsView invoices={props.invoices} expenses={props.expenses} />;
            default: return null;
        }
    };
    
    return (
        <div className="space-y-6">
            {isInvoiceModalOpen && <InvoiceFormModal invoice={editingInvoice} onClose={() => setIsInvoiceModalOpen(false)} onSave={handleSaveInvoice} orders={props.orders} />}
            {isExpenseModalOpen && <ExpenseFormModal expense={editingExpense} onClose={() => setIsExpenseModalOpen(false)} onSave={handleSaveExpense} />}
            <h2 className="text-3xl font-bold text-gray-800">Gestão Financeira</h2>
            <div className="bg-white rounded-lg shadow-sm p-2"><nav className="flex space-x-2">{tabs.map(tab => (<button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center px-4 py-2 rounded-md text-sm font-medium ${activeTab === tab.id ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}`}><tab.icon className="h-5 w-5 mr-2"/>{tab.label}</button>))}</nav></div>
            <div>{renderContent()}</div>
        </div>
    );
};

// --- Tab Components ---
const DashboardView: React.FC<{invoices: Invoice[], expenses: Expense[]}> = ({ invoices, expenses }) => {
    const summary = useMemo(() => ({
        totalBilled: invoices.reduce((s, i) => s + i.amount, 0),
        totalPaid: invoices.filter(i => i.status === 'Paga').reduce((s, i) => s + i.amount, 0),
        totalPending: invoices.filter(i => i.status === 'Pendente').reduce((s, i) => s + i.amount, 0),
        totalExpenses: expenses.reduce((s, e) => s + e.amount, 0),
    }), [invoices, expenses]);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg shadow"><p className="text-sm text-gray-500">Faturamento Total</p><p className="text-2xl font-bold">R$ {summary.totalBilled.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p></div>
                <div className="bg-white p-4 rounded-lg shadow"><p className="text-sm text-gray-500">Receita</p><p className="text-2xl font-bold text-green-600">R$ {summary.totalPaid.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p></div>
                <div className="bg-white p-4 rounded-lg shadow"><p className="text-sm text-gray-500">Despesas</p><p className="text-2xl font-bold text-red-600">R$ {summary.totalExpenses.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p></div>
                <div className="bg-white p-4 rounded-lg shadow"><p className="text-sm text-gray-500">Contas a Receber</p><p className="text-2xl font-bold text-yellow-600">R$ {summary.totalPending.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p></div>
            </div>
            <CashFlowChart invoices={invoices} expenses={expenses} />
        </div>
    );
};

const InvoicesView: React.FC<{invoices: Invoice[], onNew: () => void, onEdit: (inv: Invoice) => void}> = ({ invoices, onNew, onEdit }) => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Faturas</h3>
                <div className="flex items-center gap-4">
                    <ExportButtons />
                    <button onClick={onNew} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2"><PlusIcon className="h-5 w-5"/>Gerar Fatura</button>
                </div>
            </div>
            <table className="w-full text-sm">
                <thead className="bg-gray-50"><tr><th className="p-2 text-left">Fatura</th><th className="p-2 text-left">Cliente</th><th className="p-2 text-left">Valor</th><th className="p-2 text-left">Vencimento</th><th className="p-2 text-left">Status</th><th className="p-2 text-right">Ações</th></tr></thead>
                <tbody>{invoices.map(inv => (<tr key={inv.id} className="border-t"><td className="p-2 font-mono">{inv.id}</td><td className="p-2">{inv.customerName}</td><td className="p-2">R$ {inv.amount.toFixed(2)}</td><td className="p-2">{new Date(inv.dueDate + 'T00:00:00').toLocaleDateString()}</td><td className="p-2">{inv.status}</td><td className="p-2 text-right"><button onClick={() => onEdit(inv)} className="text-blue-600"><PencilIcon className="h-5 w-5"/></button></td></tr>))}</tbody>
            </table>
        </div>
    );
};

const ExpensesView: React.FC<{expenses: Expense[], onNew: () => void, onEdit: (exp: Expense) => void, onDelete: (id: string) => void}> = ({ expenses, onNew, onEdit, onDelete }) => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Controle de Despesas</h3>
                <div className="flex items-center gap-4">
                    <ExportButtons />
                    <button onClick={onNew} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2"><PlusIcon className="h-5 w-5"/>Lançar Despesa</button>
                </div>
            </div>
             <table className="w-full text-sm">
                <thead className="bg-gray-50"><tr><th className="p-2 text-left">Data</th><th className="p-2 text-left">Categoria</th><th className="p-2 text-left">Descrição</th><th className="p-2 text-right">Valor</th><th className="p-2 text-right">Ações</th></tr></thead>
                <tbody>{expenses.map(exp => (<tr key={exp.id} className="border-t"><td className="p-2">{new Date(exp.date + 'T00:00:00').toLocaleDateString()}</td><td className="p-2">{exp.category}</td><td className="p-2">{exp.description}</td><td className="p-2 text-right font-semibold text-red-600">R$ {exp.amount.toFixed(2)}</td><td className="p-2 text-right flex justify-end gap-2"><button onClick={() => onEdit(exp)} className="text-blue-600"><PencilIcon className="h-5 w-5"/></button><button onClick={() => onDelete(exp.id)} className="text-red-500"><TrashIcon className="h-5 w-5"/></button></td></tr>))}</tbody>
            </table>
        </div>
    );
};

const ReportsView: React.FC<{invoices: Invoice[], expenses: Expense[]}> = ({ invoices, expenses }) => {
    const revenue = invoices.filter(i => i.status === 'Paga').reduce((s, i) => s + i.amount, 0);
    const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Relatórios Financeiros</h3>
                <ExportButtons />
            </div>
            <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                    <h4 className="font-bold">DRE - Demonstrativo de Resultados (Simplificado)</h4>
                    <div className="text-sm mt-2 space-y-1">
                        <div className="flex justify-between"><span>(+) Receita Bruta</span><span className="font-semibold text-green-600">R$ {revenue.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span></div>
                        <div className="flex justify-between"><span>(-) Despesas Operacionais</span><span className="font-semibold text-red-600">R$ {totalExpenses.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span></div>
                        <div className="flex justify-between border-t pt-1 mt-1"><span>(=) Lucro/Prejuízo</span><span className="font-bold text-lg">R$ {(revenue - totalExpenses).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FinancialManagement;
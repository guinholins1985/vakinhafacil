
import React, { useState, useMemo, useEffect } from 'react';
import { DeliveryRoute, Warehouse, Vehicle } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { TruckIcon, MapIcon, WrenchScrewdriverIcon, ArchiveBoxIcon, PresentationChartLineIcon, ArrowPathIcon, SparklesIcon, CheckCircleIcon } from './Icons';

interface LogisticsManagementProps {
    vehicles: Vehicle[];
    setVehicles: React.Dispatch<React.SetStateAction<Vehicle[]>>;
    deliveryRoutes: DeliveryRoute[];
    warehouses: Warehouse[];
    setWarehouses: React.Dispatch<React.SetStateAction<Warehouse[]>>;
}

// --- Modals ---
const VehicleFormModal: React.FC<{ vehicle: Vehicle | null; onClose: () => void; onSave: (vehicle: Vehicle) => void; }> = ({ vehicle, onClose, onSave }) => {
    const isNew = vehicle === null;
    const [formData, setFormData] = useState<Vehicle>(vehicle || { id: uuidv4(), model: '', plate: '', type: 'Carro', status: 'Disponível', lastMaintenance: new Date().toISOString().split('T')[0], nextMaintenance: '', assignedDriver: '', fuelConsumption: 0 });
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setFormData(p => ({ ...p, [e.target.name]: e.target.name === 'fuelConsumption' ? parseFloat(e.target.value) : e.target.value }));
    const handleSave = (e: React.FormEvent) => { e.preventDefault(); onSave(formData); onClose(); };
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
                <h2 className="text-xl font-bold mb-4">{isNew ? 'Adicionar Veículo' : 'Editar Veículo'}</h2>
                <form onSubmit={handleSave} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="text-sm">Modelo</label><input type="text" name="model" value={formData.model} onChange={handleChange} className="w-full p-2 border rounded-md" required /></div>
                        <div><label className="text-sm">Placa</label><input type="text" name="plate" value={formData.plate} onChange={handleChange} className="w-full p-2 border rounded-md" required /></div>
                        <div><label className="text-sm">Tipo</label><select name="type" value={formData.type} onChange={handleChange} className="w-full p-2 border rounded-md bg-white">{['Carro', 'Moto', 'Van', 'Caminhão', 'Drone', 'Robô'].map(t => <option key={t}>{t}</option>)}</select></div>
                        <div><label className="text-sm">Status</label><select name="status" value={formData.status} onChange={handleChange} className="w-full p-2 border rounded-md bg-white">{['Disponível', 'Em Rota', 'Manutenção'].map(t => <option key={t}>{t}</option>)}</select></div>
                        <div><label className="text-sm">Última Manutenção</label><input type="date" name="lastMaintenance" value={formData.lastMaintenance} onChange={handleChange} className="w-full p-2 border rounded-md" /></div>
                        <div><label className="text-sm">Próxima Manutenção</label><input type="date" name="nextMaintenance" value={formData.nextMaintenance || ''} onChange={handleChange} className="w-full p-2 border rounded-md" /></div>
                        <div><label className="text-sm">Motorista</label><input type="text" name="assignedDriver" value={formData.assignedDriver} onChange={handleChange} className="w-full p-2 border rounded-md" /></div>
                        <div><label className="text-sm">Consumo (km/L)</label><input type="number" step="0.1" name="fuelConsumption" value={formData.fuelConsumption} onChange={handleChange} className="w-full p-2 border rounded-md" /></div>
                    </div>
                    <div className="flex justify-end gap-2"><button type="button" onClick={onClose} className="bg-gray-200 py-2 px-4 rounded-lg">Cancelar</button><button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded-lg">Salvar</button></div>
                </form>
            </div>
        </div>
    );
};

const RouteDetailsModal: React.FC<{ route: DeliveryRoute, vehicle: Vehicle | undefined; onClose: () => void; }> = ({ route, vehicle, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl">
             <h2 className="text-xl font-bold mb-4">Detalhes da Rota {route.id}</h2>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative bg-gray-200 rounded-lg h-80 flex items-center justify-center overflow-hidden">
                    <MapIcon className="h-24 w-24 text-gray-400"/>
                    <div className="absolute bottom-4 left-4 right-4 bg-white/80 p-2 rounded-lg backdrop-blur-sm">
                        <p className="text-sm font-bold">Progresso da Rota</p>
                        <div className="w-full bg-gray-300 h-3 rounded-full mt-1"><div className="bg-blue-500 h-3 rounded-full" style={{width:`${route.progress}%`}}></div></div>
                    </div>
                </div>
                <div className="space-y-4">
                    <div><h3 className="font-semibold text-gray-800">Informações</h3>
                        <div className="text-sm space-y-1 mt-2">
                            <p><strong>Motorista:</strong> {route.driverName}</p>
                            <p><strong>Veículo:</strong> {vehicle?.model} ({vehicle?.plate})</p>
                            <p><strong>Status:</strong> {route.status}</p>
                        </div>
                    </div>
                    <div><h3 className="font-semibold text-gray-800">Paradas ({route.stops.length})</h3>
                        <ul className="text-sm space-y-2 h-48 overflow-y-auto pr-2 mt-2 border-t pt-2">
                            {route.stops.map((stop, i) => <li key={i} className="flex items-center gap-2 p-1 rounded-md even:bg-gray-50"><CheckCircleIcon className={`h-4 w-4 flex-shrink-0 ${stop.status === 'Entregue' ? 'text-green-500' : 'text-gray-300'}`}/><span>{stop.address}</span></li>)}
                        </ul>
                    </div>
                </div>
             </div>
             <button onClick={onClose} className="w-full mt-6 bg-gray-200 py-2 rounded-lg hover:bg-gray-300 font-semibold">Fechar</button>
        </div>
    </div>
);

const MaintenanceModal: React.FC<{ vehicle: Vehicle; onClose: () => void; onSave: (vehicle: Vehicle, date: string) => void; }> = ({ vehicle, onClose, onSave }) => {
    const [date, setDate] = useState(vehicle.nextMaintenance || new Date().toISOString().split('T')[0]);
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm">
                <h3 className="text-lg font-bold mb-4">Agendar Manutenção</h3>
                <p className="text-sm mb-2">Veículo: <span className="font-semibold">{vehicle.model} - {vehicle.plate}</span></p>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full p-2 border rounded-md mb-4" />
                <div className="flex justify-end gap-2"><button type="button" onClick={onClose} className="bg-gray-200 py-2 px-4 rounded-lg">Cancelar</button><button onClick={() => { onSave(vehicle, date); onClose(); }} className="bg-blue-600 text-white py-2 px-4 rounded-lg">Agendar</button></div>
            </div>
        </div>
    );
};

const StockTransferModal: React.FC<{
    warehouses: Warehouse[];
    onClose: () => void;
    onConfirm: (transfer: { fromId: string; toId: string; sku: string; quantity: number }) => void;
}> = ({ warehouses, onClose, onConfirm }) => {
    const [fromId, setFromId] = useState(warehouses[0]?.id || '');
    const [toId, setToId] = useState(warehouses[1]?.id || '');
    const [sku, setSku] = useState('');
    const [quantity, setQuantity] = useState(1);

    const handleConfirm = () => {
        if (!fromId || !toId || !sku || quantity <= 0 || fromId === toId) {
            alert("Por favor, preencha todos os campos corretamente e certifique-se que os armazéns de origem e destino são diferentes.");
            return;
        }
        onConfirm({ fromId, toId, sku, quantity });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
                <h3 className="text-lg font-bold mb-4">Transferir Estoque</h3>
                <div className="space-y-4">
                    <div><label className="text-sm font-medium">De</label><select value={fromId} onChange={e => setFromId(e.target.value)} className="w-full p-2 border rounded-md bg-white mt-1">{warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}</select></div>
                    <div><label className="text-sm font-medium">Para</label><select value={toId} onChange={e => setToId(e.target.value)} className="w-full p-2 border rounded-md bg-white mt-1">{warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}</select></div>
                    <div><label className="text-sm font-medium">Produto (SKU)</label><input type="text" placeholder="SKU-001" value={sku} onChange={e => setSku(e.target.value)} className="w-full p-2 border rounded-md mt-1"/></div>
                    <div><label className="text-sm font-medium">Quantidade</label><input type="number" placeholder="100" value={quantity} onChange={e => setQuantity(Number(e.target.value))} min="1" className="w-full p-2 border rounded-md mt-1"/></div>
                </div>
                <div className="flex justify-end gap-2 mt-6"><button type="button" onClick={onClose} className="bg-gray-200 py-2 px-4 rounded-lg">Cancelar</button><button onClick={handleConfirm} className="bg-blue-600 text-white py-2 px-4 rounded-lg">Confirmar Transferência</button></div>
            </div>
        </div>
    );
};


// --- Main Component ---
const LogisticsManagement: React.FC<LogisticsManagementProps> = ({ vehicles, setVehicles, deliveryRoutes, warehouses, setWarehouses }) => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
    const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
    const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
    const [selectedRoute, setSelectedRoute] = useState<DeliveryRoute | null>(null);
    
    const kpis = useMemo(() => ({
        onTimeRate: 92.3,
        fleetUtilization: (deliveryRoutes.filter(r => r.status === 'Em Rota').length / vehicles.length) * 100,
        avgDeliveryTime: 45,
        totalWarehouseCapacity: warehouses.reduce((sum, w) => sum + w.capacity, 0),
        totalWarehouseStock: warehouses.reduce((sum, w) => sum + w.currentStock, 0),
    }), [deliveryRoutes, vehicles, warehouses]);

    const tabs = [
        { id: 'dashboard', label: 'Dashboard', icon: PresentationChartLineIcon },
        { id: 'routes', label: 'Rotas de Entrega', icon: MapIcon },
        { id: 'warehouses', label: 'Armazéns', icon: ArchiveBoxIcon },
        { id: 'fleet', label: 'Frota', icon: TruckIcon },
    ];

    const handleSaveVehicle = (vehicle: Vehicle) => {
        setVehicles(prev => {
            const exists = prev.some(v => v.id === vehicle.id);
            return exists ? prev.map(v => v.id === vehicle.id ? vehicle : v) : [vehicle, ...prev];
        });
    };
    
    const handleSaveMaintenance = (vehicle: Vehicle, date: string) => {
        setVehicles(prev => prev.map(v => v.id === vehicle.id ? {...v, nextMaintenance: date, status: 'Manutenção' } : v));
    };

    const handleStockTransfer = (transfer: { fromId: string; toId: string; sku: string; quantity: number }) => {
        setWarehouses(prev => prev.map(w => {
            if (w.id === transfer.fromId) return { ...w, currentStock: w.currentStock - transfer.quantity };
            if (w.id === transfer.toId) return { ...w, currentStock: w.currentStock + transfer.quantity };
            return w;
        }));
        alert(`Transferência de ${transfer.quantity} unidades do SKU ${transfer.sku} realizada com sucesso!`);
    };
    
    const renderTabContent = () => {
        switch(activeTab) {
            case 'dashboard': return <DashboardView kpis={kpis} />;
            case 'routes': return <RoutesView routes={deliveryRoutes} onViewDetails={setSelectedRoute} />;
            case 'warehouses': return <WarehousesView warehouses={warehouses} onTransfer={() => setIsTransferModalOpen(true)} />;
            case 'fleet': return <FleetView vehicles={vehicles} onEdit={(v) => { setEditingVehicle(v); setIsVehicleModalOpen(true); }} onAdd={() => { setEditingVehicle(null); setIsVehicleModalOpen(true); }} onScheduleMaintenance={(v) => { setEditingVehicle(v); setIsMaintenanceModalOpen(true); }} />;
            default: return null;
        }
    }
    
    return (
        <div className="space-y-6">
            {isVehicleModalOpen && <VehicleFormModal vehicle={editingVehicle} onClose={() => setIsVehicleModalOpen(false)} onSave={handleSaveVehicle} />}
            {isMaintenanceModalOpen && editingVehicle && <MaintenanceModal vehicle={editingVehicle} onClose={() => setIsMaintenanceModalOpen(false)} onSave={handleSaveMaintenance} />}
            {isTransferModalOpen && <StockTransferModal warehouses={warehouses} onClose={() => setIsTransferModalOpen(false)} onConfirm={handleStockTransfer} />}
            {selectedRoute && <RouteDetailsModal route={selectedRoute} vehicle={vehicles.find(v => v.id === selectedRoute.vehicleId)} onClose={() => setSelectedRoute(null)} />}

            <h2 className="text-3xl font-bold text-gray-800">Gerenciamento de Logística</h2>
            <div className="bg-white rounded-lg shadow-sm p-2"><nav className="flex space-x-2">{tabs.map(tab => (<button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center px-4 py-2 rounded-md text-sm font-medium ${activeTab === tab.id ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}`}><tab.icon className="h-5 w-5 mr-2"/>{tab.label}</button>))}</nav></div>
            <div>{renderTabContent()}</div>
        </div>
    );
};

// --- Tab Components ---
const DashboardView: React.FC<{ kpis: any }> = ({ kpis }) => (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow"><p className="text-sm text-gray-500">Taxa de Entrega no Prazo</p><p className="text-2xl font-bold">{kpis.onTimeRate}%</p></div>
        <div className="bg-white p-4 rounded-lg shadow"><p className="text-sm text-gray-500">Utilização da Frota</p><p className="text-2xl font-bold">{kpis.fleetUtilization.toFixed(1)}%</p></div>
        <div className="bg-white p-4 rounded-lg shadow"><p className="text-sm text-gray-500">Tempo Médio de Entrega</p><p className="text-2xl font-bold">{kpis.avgDeliveryTime} min</p></div>
        <div className="bg-white p-4 rounded-lg shadow"><p className="text-sm text-gray-500">Ocupação dos Armazéns</p><p className="text-2xl font-bold">{(kpis.totalWarehouseStock / kpis.totalWarehouseCapacity * 100).toFixed(1)}%</p></div>
    </div>
);

const RoutesView: React.FC<{ routes: DeliveryRoute[], onViewDetails: (route: DeliveryRoute) => void }> = ({ routes, onViewDetails }) => {
    const [isOptimizing, setIsOptimizing] = useState(false);
    const onOptimize = () => {
        setIsOptimizing(true);
        setTimeout(() => {
            setIsOptimizing(false);
            alert('Rotas otimizadas com sucesso pela IA!');
        }, 2000);
    };
    return (
    <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4"><h3 className="text-xl font-bold">Rotas Ativas</h3><button onClick={onOptimize} disabled={isOptimizing} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 disabled:bg-blue-300"><SparklesIcon className={`h-5 w-5 ${isOptimizing ? 'animate-spin' : ''}`}/>{isOptimizing ? 'Otimizando...' : 'Otimizar Rotas com IA'}</button></div>
        <table className="w-full text-sm">
            <thead className="bg-gray-50"><tr><th className="p-2 text-left">Rota</th><th className="p-2 text-left">Motorista</th><th className="p-2 text-left">Status</th><th className="p-2 text-left">Progresso</th><th className="p-2 text-right">Ações</th></tr></thead>
            <tbody>{routes.map(r => (<tr key={r.id} className="border-t"><td className="p-2 font-mono">{r.id}</td><td className="p-2">{r.driverName}</td><td className="p-2">{r.status}</td><td className="p-2"><div className="w-full bg-gray-200 h-2 rounded-full"><div className="bg-blue-500 h-2 rounded-full" style={{width:`${r.progress}%`}}></div></div></td><td className="p-2 text-right"><button onClick={()=>onViewDetails(r)} className="text-blue-600 font-semibold">Detalhes</button></td></tr>))}</tbody>
        </table>
    </div>
)};

const WarehousesView: React.FC<{ warehouses: Warehouse[], onTransfer: () => void }> = ({ warehouses, onTransfer }) => (
    <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4"><h3 className="text-xl font-bold">Gerenciamento de Armazéns</h3><button onClick={onTransfer} className="bg-green-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2"><ArrowPathIcon className="h-5 w-5"/>Transferir Estoque</button></div>
        <table className="w-full text-sm">
            <thead className="bg-gray-50"><tr><th className="p-2 text-left">Armazém</th><th className="p-2 text-left">Localização</th><th className="p-2 text-left">Ocupação</th><th className="p-2 text-left">Temp.</th><th className="p-2 text-left">Segurança</th><th className="p-2 text-right">Ações</th></tr></thead>
            <tbody>{warehouses.map(w => { const usage = w.currentStock / w.capacity * 100; return (<tr key={w.id} className="border-t"><td className="p-2">{w.name}</td><td className="p-2">{w.location}</td><td className="p-2">{usage.toFixed(1)}%</td><td className="p-2">{w.temperature}°C</td><td className="p-2">{w.security}</td><td className="p-2 text-right"><button className="text-blue-600 font-semibold">Gerenciar</button></td></tr>);})}</tbody>
        </table>
    </div>
);

const FleetView: React.FC<{ vehicles: Vehicle[], onEdit: (v: Vehicle) => void, onAdd: () => void, onScheduleMaintenance: (v: Vehicle) => void }> = ({ vehicles, onEdit, onAdd, onScheduleMaintenance }) => (
    <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4"><h3 className="text-xl font-bold">Frota de Veículos</h3><button onClick={onAdd} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg">Adicionar Veículo</button></div>
        <table className="w-full text-sm">
            <thead className="bg-gray-50"><tr><th className="p-2 text-left">Modelo</th><th className="p-2 text-left">Placa</th><th className="p-2 text-left">Status</th><th className="p-2 text-left">Próxima Manutenção</th><th className="p-2 text-right">Ações</th></tr></thead>
            <tbody>{vehicles.map(v => (<tr key={v.id} className="border-t"><td className="p-2">{v.model}</td><td className="p-2 font-mono">{v.plate}</td><td className="p-2">{v.status}</td><td className="p-2">{v.nextMaintenance ? new Date(v.nextMaintenance + 'T00:00:00').toLocaleDateString() : 'N/A'}</td><td className="p-2 text-right space-x-4"><button onClick={() => onScheduleMaintenance(v)} className="font-medium text-yellow-600">Manutenção</button><button onClick={() => onEdit(v)} className="text-blue-600 font-semibold">Editar</button></td></tr>))}</tbody>
        </table>
    </div>
);

export default LogisticsManagement;
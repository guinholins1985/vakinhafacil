
import React, { useMemo } from 'react';
import { User, Order, ProductSectionData, DashboardData } from '../types';
import { SalesIcon, OrdersIcon, NewUsersIcon, UserIcon } from './Icons';

interface DashboardProps {
    users: User[];
    orders: Order[];
    productSections: ProductSectionData[];
}

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
        <div className="bg-blue-100 text-blue-600 p-3 rounded-full mr-4">
            {icon}
        </div>
        <div>
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
    </div>
);

const SalesChart: React.FC<{ data: { day: string; sales: number }[] }> = ({ data }) => {
    const maxSales = Math.max(...data.map(d => d.sales), 0);
    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Vendas (Últimos 7 dias)</h3>
            <div className="flex justify-between items-end h-48 space-x-2">
                {data.map(({ day, sales }) => (
                    <div key={day} className="flex-1 flex flex-col items-center justify-end">
                        <div 
                            className="w-full bg-blue-500 rounded-t-md hover:bg-blue-600 transition-colors" 
                            style={{ height: `${maxSales > 0 ? (sales / maxSales) * 100 : 0}%` }}
                            title={`R$ ${sales.toFixed(2)}`}
                        ></div>
                        <span className="text-xs text-gray-500 mt-2">{day}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const RecentOrdersTable: React.FC<{ orders: Order[] }> = ({ orders }) => (
    <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Pedidos Recentes</h3>
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-600">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                        <th className="px-4 py-2">Pedido ID</th>
                        <th className="px-4 py-2">Cliente</th>
                        <th className="px-4 py-2">Total</th>
                        <th className="px-4 py-2">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.slice(0, 5).map(order => (
                        <tr key={order.id} className="border-b hover:bg-gray-50">
                            <td className="px-4 py-3 font-medium text-gray-900">{order.id}</td>
                            <td className="px-4 py-3">{order.customerName}</td>
                            <td className="px-4 py-3">R$ {order.total.toFixed(2)}</td>
                            <td className="px-4 py-3">
                                 <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                     {
                                         'Pendente': 'bg-yellow-100 text-yellow-800',
                                         'Pago': 'bg-blue-100 text-blue-800',
                                         'Enviado': 'bg-green-100 text-green-800',
                                         'Entregue': 'bg-gray-100 text-gray-800',
                                         'Cancelado': 'bg-red-100 text-red-800',
                                     }[order.status]
                                 }`}>{order.status}</span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

const LowStockProducts: React.FC<{ products: ProductSectionData[] }> = ({ products }) => {
    const lowStockItems = useMemo(() => {
        return products.flatMap(section => section.products)
                       .filter(product => product.stock <= 10)
                       .sort((a, b) => a.stock - b.stock);
    }, [products]);

    return (
         <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Produtos com Estoque Baixo</h3>
            <ul className="space-y-3 max-h-60 overflow-y-auto">
                {lowStockItems.slice(0, 5).map(product => (
                    <li key={product.id} className="flex justify-between items-center text-sm">
                        <span className="text-gray-700">{product.name}</span>
                        <span className="font-bold text-red-600">{product.stock} unidades</span>
                    </li>
                ))}
                 {lowStockItems.length === 0 && <p className="text-sm text-gray-500">Nenhum produto com estoque baixo.</p>}
            </ul>
        </div>
    )
}

const Dashboard: React.FC<DashboardProps> = ({ users, orders, productSections }) => {
    const dashboardData: DashboardData = useMemo(() => {
        const totalSales = orders.reduce((sum, order) => order.status !== 'Cancelado' ? sum + order.total : sum, 0);
        const orderCount = orders.length;
        const customerCount = users.filter(u => u.role === 'Cliente').length;
        const averageTicket = orderCount > 0 ? totalSales / orderCount : 0;
        
        const salesByDay = Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dayStr = d.toISOString().split('T')[0];
            const dayShort = d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
            const sales = orders
                .filter(o => o.date === dayStr && o.status !== 'Cancelado')
                .reduce((sum, o) => sum + o.total, 0);
            return { day: dayShort, sales };
        }).reverse();

        return {
            totalSales,
            orderCount,
            customerCount,
            averageTicket,
            salesByDay,
            recentOrders: orders,
            lowStockProducts: [], // Placeholder, handled in its own component
        };
    }, [users, orders]);

    return (
        <div className="space-y-8">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Vendas Totais" value={`R$ ${dashboardData.totalSales.toFixed(2)}`} icon={<SalesIcon className="h-6 w-6"/>} />
                <StatCard title="Pedidos" value={dashboardData.orderCount.toString()} icon={<OrdersIcon className="h-6 w-6"/>} />
                <StatCard title="Novos Clientes" value={dashboardData.customerCount.toString()} icon={<NewUsersIcon className="h-6 w-6"/>} />
                <StatCard title="Ticket Médio" value={`R$ ${dashboardData.averageTicket.toFixed(2)}`} icon={<UserIcon className="h-6 w-6"/>} />
            </div>

            {/* Main content grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <SalesChart data={dashboardData.salesByDay} />
                </div>
                <div className="lg:col-span-1">
                    <LowStockProducts products={productSections} />
                </div>
                <div className="lg:col-span-3">
                    <RecentOrdersTable orders={dashboardData.recentOrders} />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
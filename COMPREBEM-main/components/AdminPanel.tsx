import React, { useState, useEffect } from 'react';
import { AppState, PresetTheme } from '../types';
// FIX: Import `FlagIcon` to resolve the 'Cannot find name' error.
import { 
    HomeIcon, CubeIcon, TagIcon, SalesIcon, UsersIcon, UserCircleIcon, 
    MarketingIcon, IdentificationIcon, FinancialIcon, TruckIcon, ArrowPathIcon, 
    CalendarIcon, PresentationChartLineIcon, EyeIcon, KanbanIcon, LifebuoyIcon, 
    LightBulbIcon, ChipIcon, BuildingStorefrontIcon, LeafIcon, 
    FlagIcon,
    ShieldExclamationIcon, ShieldCheckIcon, DocumentTextIcon, GlobeAltIcon, 
    Cog6ToothIcon, KeyIcon, CodeBracketIcon, CircleStackIcon
} from './Icons';

// Import all the components for the admin panel tabs
import Dashboard from './Dashboard';
import ProductManagement from './ProductManagement';
import CategoryManagement from './CategoryManagement';
import SalesManagement from './SalesManagement';
import UserManagement from './UserManagement';
import CRMManagement from './CRMManagement';
import MarketingManagement from './MarketingManagement';
import BannerManagement from './BannerManagement';
import FinancialManagement from './FinancialManagement';
import LogisticsManagement from './LogisticsManagement';
import SupplyChainManagement from './SupplyChainManagement';
import SubscriptionManagement from './SubscriptionManagement';
import AnalyticsBI from './AnalyticsBI';
import CompetitiveIntelligence from './CompetitiveIntelligence';
import CollaborationTools from './CollaborationTools';
import SupportAndTraining from './SupportAndTraining';
import EmployeeExperience from './EmployeeExperience';
import Innovations from './Innovations';
import RDManagement from './RDManagement';
import BusinessDevelopment from './BusinessDevelopment';
import FairsAndEvents from './FairsAndEvents';
import Marketplace from './Marketplace';
import PartnershipsManagement from './PartnershipsManagement';
import SustainabilityESG from './SustainabilityESG';
import RiskManagement from './RiskManagement';
import LegalCompliance from './LegalCompliance';
import FiscalManagement from './FiscalManagement';
import Internationalization from './Internationalization';
import Settings from './Settings';
import AdminProfileComponent from './AdminProfile';
import LoginPageConfigComponent from './LoginPageConfig';
import CodeEditor from './CodeEditor';
import Gamification from './Gamification';
import IntegrationsManager from './IntegrationsManager';
import AIModelHub from './AIModelHub';

// --- Helper Components ---

const Toast: React.FC<{ message: string }> = ({ message }) => (
    <div className="fixed bottom-5 right-5 bg-green-600 text-white py-3 px-5 rounded-lg shadow-lg z-[100] animate-bounce">
        {message}
    </div>
);

const NavItem: React.FC<{ icon: React.FC<any>, label: string, isActive: boolean, onClick: () => void }> = ({ icon: Icon, label, isActive, onClick }) => (
    <button onClick={onClick} className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${isActive ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
        <Icon className="h-5 w-5 mr-3"/>
        <span>{label}</span>
    </button>
);

const NavGroup: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div>
        <h3 className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{title}</h3>
        <div className="space-y-1">{children}</div>
    </div>
);


// --- Props Interface ---

interface AdminPanelProps {
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState | null>>;
  onClose: () => void;
  onApplyPresetTheme: (preset: PresetTheme) => void;
}

// --- Main Component ---

const AdminPanel: React.FC<AdminPanelProps> = ({ appState, setAppState, onClose, onApplyPresetTheme }) => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [toastMessage, setToastMessage] = useState('');
    
    const showToast = (message: string) => {
        setToastMessage(message);
        setTimeout(() => setToastMessage(''), 3000);
    };

    // This is a generic, type-safe function to create setters for slices of the main app state.
    const createSliceSetter = <K extends keyof AppState>(key: K) => {
        return (updater: React.SetStateAction<AppState[K]>) => {
            setAppState(prevState => {
                if (!prevState) {
                    console.error("Attempted to update state slice while full state is null.");
                    return null;
                }
                const prevSlice = prevState[key];
                const newSlice = typeof updater === 'function'
                    ? (updater as (prevState: AppState[K]) => AppState[K])(prevSlice)
                    : updater;

                return { ...prevState, [key]: newSlice };
            });
        };
    };

    const tabs = [
        // Core
        { id: 'dashboard', label: 'Dashboard', icon: HomeIcon, component: Dashboard, group: 'Principal' },
        { id: 'products', label: 'Produtos', icon: CubeIcon, component: ProductManagement, group: 'Principal' },
        { id: 'categories', label: 'Categorias', icon: TagIcon, component: CategoryManagement, group: 'Principal' },
        { id: 'sales', label: 'Vendas', icon: SalesIcon, component: SalesManagement, group: 'Principal' },
        { id: 'users', label: 'Usuários', icon: UsersIcon, component: UserManagement, group: 'Principal' },
        { id: 'crm', label: 'CRM', icon: UserCircleIcon, component: CRMManagement, group: 'Principal' },
        // Business
        { id: 'financial', label: 'Financeiro', icon: FinancialIcon, component: FinancialManagement, group: 'Negócios' },
        { id: 'logistics', label: 'Logística', icon: TruckIcon, component: LogisticsManagement, group: 'Negócios' },
        { id: 'supply_chain', label: 'Supply Chain', icon: ArrowPathIcon, component: SupplyChainManagement, group: 'Negócios' },
        { id: 'subscriptions', label: 'Assinaturas', icon: CalendarIcon, component: SubscriptionManagement, group: 'Negócios' },
        // Growth
        { id: 'marketing', label: 'Marketing', icon: MarketingIcon, component: MarketingManagement, group: 'Crescimento' },
        { id: 'banners', label: 'Banners & Ads', icon: IdentificationIcon, component: BannerManagement, group: 'Crescimento' },
        { id: 'analytics', label: 'Analytics & BI', icon: PresentationChartLineIcon, component: AnalyticsBI, group: 'Crescimento' },
        { id: 'competitive', label: 'Inteligência Comp.', icon: EyeIcon, component: CompetitiveIntelligence, group: 'Crescimento' },
        // Operations
        { id: 'collaboration', label: 'Colaboração', icon: KanbanIcon, component: CollaborationTools, group: 'Operações' },
        { id: 'support', label: 'Suporte', icon: LifebuoyIcon, component: SupportAndTraining, group: 'Operações' },
        { id: 'hr', label: 'RH & Colaborador', icon: UsersIcon, component: EmployeeExperience, group: 'Operações' },
        { id: 'gamification', label: 'Gamificação', icon: FlagIcon, component: Gamification, group: 'Operações' },
        { id: 'innovations', label: 'Inovações', icon: LightBulbIcon, component: Innovations, group: 'Operações' },
        { id: 'rd', label: 'P&D', icon: ChipIcon, component: RDManagement, group: 'Operações' },
        // Expansion
        { id: 'bizdev', label: 'Business Dev.', icon: BuildingStorefrontIcon, component: BusinessDevelopment, group: 'Expansão' },
        { id: 'events', label: 'Feiras e Eventos', icon: CalendarIcon, component: FairsAndEvents, group: 'Expansão' },
        { id: 'marketplace', label: 'Marketplace', icon: BuildingStorefrontIcon, component: Marketplace, group: 'Expansão' },
        { id: 'partnerships', label: 'Parcerias', icon: UsersIcon, component: PartnershipsManagement, group: 'Expansão' },
        // Governance
        { id: 'sustainability', label: 'Sustentabilidade', icon: LeafIcon, component: SustainabilityESG, group: 'Governança' },
        { id: 'risk', label: 'Riscos e Fraudes', icon: ShieldExclamationIcon, component: RiskManagement, group: 'Governança' },
        { id: 'legal', label: 'Jurídico', icon: ShieldCheckIcon, component: LegalCompliance, group: 'Governança' },
        { id: 'fiscal', label: 'Fiscal', icon: DocumentTextIcon, component: FiscalManagement, group: 'Governança' },
        { id: 'i18n', label: 'Internacional', icon: GlobeAltIcon, component: Internationalization, group: 'Governança' },
        // IA & Automação
        { id: 'ai_model_hub', label: 'Hub de Modelos IA', icon: CircleStackIcon, component: AIModelHub, group: 'IA & Automação' },
        // Admin
        { id: 'settings', label: 'Configurações', icon: Cog6ToothIcon, component: Settings, group: 'Administração' },
        { id: 'integrations_manager', label: 'Integrações', icon: ChipIcon, component: IntegrationsManager, group: 'Administração' },
        { id: 'profile', label: 'Meu Perfil', icon: UserCircleIcon, component: AdminProfileComponent, group: 'Administração' },
        { id: 'login_page', label: 'Página de Login', icon: KeyIcon, component: LoginPageConfigComponent, group: 'Administração' },
        { id: 'code_editor', label: 'Editor de Código', icon: CodeBracketIcon, component: CodeEditor, group: 'Administração' },
    ];
    
    const tabGroups = tabs.reduce((acc, tab) => {
        if (!acc[tab.group]) acc[tab.group] = [];
        acc[tab.group].push(tab);
        return acc;
    }, {} as Record<string, typeof tabs>);
    
    const ActiveComponent = tabs.find(t => t.id === activeTab)?.component;

    // This object maps tab IDs to their required props, using the type-safe slice setter.
    const componentProps: { [key: string]: any } = {
        dashboard: { users: appState.users, orders: appState.orders, productSections: appState.productSections },
        products: { productSections: appState.productSections, setProductSections: createSliceSetter('productSections'), showToast },
        users: { users: appState.users, setUsers: createSliceSetter('users'), orders: appState.orders, showToast },
        crm: { users: appState.users, setUsers: createSliceSetter('users'), orders: appState.orders },
        financial: { orders: appState.orders, invoices: appState.invoices, expenses: appState.expenses, setInvoices: createSliceSetter('invoices'), setExpenses: createSliceSetter('expenses') },
        logistics: { vehicles: appState.vehicles, setVehicles: createSliceSetter('vehicles'), deliveryRoutes: appState.deliveryRoutes, warehouses: appState.warehouses, setWarehouses: createSliceSetter('warehouses') },
        subscriptions: { subscriptions: appState.subscriptions, setSubscriptions: createSliceSetter('subscriptions'), users: appState.users, productSections: appState.productSections },
        analytics: { insights: appState.insights, setInsights: createSliceSetter('insights'), orders: appState.orders, users: appState.users, productSections: appState.productSections },
        collaboration: { 
            tasks: appState.tasks, setTasks: createSliceSetter('tasks'), 
            teamMembers: appState.teamMembers, setTeamMembers: createSliceSetter('teamMembers'),
            events: appState.events, setEvents: createSliceSetter('events'),
            articles: appState.articles, setArticles: createSliceSetter('articles')
        },
        marketplace: { 
            sellers: appState.sellers, setSellers: createSliceSetter('sellers'),
            disputes: appState.disputes, setDisputes: createSliceSetter('disputes'),
            sellerPayouts: appState.sellerPayouts, setSellerPayouts: createSliceSetter('sellerPayouts'),
            commissionRules: appState.commissionRules, setCommissionRules: createSliceSetter('commissionRules')
        },
        ai_model_hub: { aiModels: appState.aiModels, setAIModels: createSliceSetter('aiModels'), showToast },
        profile: { profile: appState.adminProfile, setProfile: createSliceSetter('adminProfile') },
        login_page: { config: appState.loginPageConfig, setConfig: createSliceSetter('loginPageConfig') },
        // Components receiving the full appState/setAppState can remain as they are for minimal changes.
        default: { appState, setAppState, showToast, onApplyPresetTheme }
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex">
            {toastMessage && <Toast message={toastMessage} />}
            {/* Sidebar */}
            <div className="w-64 bg-gray-50 flex flex-col border-r h-full">
                <div className="p-4 border-b flex items-center gap-2">
                     <img src={appState.siteIdentity.logoUrl} alt="Logo" className="h-8"/>
                     <h2 className="font-bold text-lg">Admin Panel</h2>
                </div>
                <nav className="flex-grow p-4 space-y-6 overflow-y-auto">
                    {Object.entries(tabGroups).map(([group, tabs]) => (
                        <NavGroup key={group} title={group}>
                            {tabs.map(tab => <NavItem key={tab.id} icon={tab.icon} label={tab.label} isActive={activeTab === tab.id} onClick={() => setActiveTab(tab.id)} />)}
                        </NavGroup>
                    ))}
                </nav>
            </div>
            {/* Main Content */}
            <main className="flex-1 flex flex-col bg-gray-100 h-full">
                <header className="flex items-center justify-between p-4 bg-white border-b flex-shrink-0">
                    <h1 className="text-xl font-bold text-gray-800">{tabs.find(t => t.id === activeTab)?.label}</h1>
                    <button onClick={onClose} className="bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-lg hover:bg-gray-300">Fechar Painel</button>
                </header>
                <div className="flex-grow p-6 overflow-y-auto">
                    {ActiveComponent && React.createElement(ActiveComponent, { ...componentProps.default, ...componentProps[activeTab] })}
                </div>
            </main>
        </div>
    );
};

export default AdminPanel;
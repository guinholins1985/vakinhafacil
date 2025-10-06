import React from 'react';

// --- Typography ---
export interface TypographySettings {
  baseSize: number; // in px
  fontFamily: string;
}

// --- Homepage Content ---
export interface HomePageContent {
  categoryPromoTitle: string;
}

// --- Core App & Data ---

export interface ExternalIntegration {
  id: string;
  name: string;
  category: 'Database' | 'AI' | 'Public APIs' | 'Cloud Storage';
  description: string;
  enabled: boolean;
  credentials: Record<string, string>; // e.g., { apiKey: '', projectUrl: '' }
  requiredFields: { key: string; label: string; type: 'text' | 'password' }[];
}

export interface AIModel {
  id: string;
  fullName: string;
  provider: string;
  type: 'Text' | 'Image' | 'Video';
  status: 'Online' | 'Offline' | 'Untested';
  enabled: boolean;
}

export interface AppState {
  siteIdentity: SiteIdentity;
  theme: ThemeColors;
  typography: TypographySettings;
  categories: Category[];
  banners: Banner[];
  promos: CategoryPromoItem[];
  homePage: HomePageContent;
  productSections: ProductSectionData[];
  brands: Brand[];
  footerSettings: FooterSettings;
  currentUser: { name: string; role: 'Admin' | 'Cliente' } | null;
  cart: CartItem[];
  users: User[];
  orders: Order[];
  customCode: string;
  sellers: Seller[];
  disputes: Dispute[];
  sellerPayouts: SellerPayout[];
  commissionRules: CommissionRule[];
  integrations: Integration[];
  externalIntegrations: ExternalIntegration[];
  aiModels: AIModel[];
  paymentGateways: PaymentGateway[];
  securitySettings: SecuritySettings;
  subscriptions: Subscription[];
  deliveryRoutes: DeliveryRoute[];
  warehouses: Warehouse[];
  vehicles: Vehicle[];
  invoices: Invoice[];
  expenses: Expense[];
  quotes: Quote[];
  abandonedCarts: AbandonedCart[];
  salesReps: SalesRepresentative[];
  missions: Mission[];
  socialPosts: SocialPost[];
  campaigns: MarketingCampaign[];
  affiliates: Affiliate[];
  insights: AnalyticsInsight[];
  tasks: ProjectTask[];
  teamMembers: TeamMember[];
  events: CalendarEvent[];
  articles: WikiArticle[];
  arEnabledProductIds: number[];
  blockchainTraces: BlockchainTrace[];
  voiceCommerceConfig: VoiceCommerceConfig;
  vrShowroomConfig: VRShowroomConfig;
  iotDevices: IotDevice[];
  supportTickets: SupportTicket[];
  faqs: FAQ[];
  trainingModules: TrainingModule[];
  productCarbonFootprints: ProductCarbonFootprint[];
  packagingLogs: PackagingLog[];
  sustainableIncentives: SustainableIncentive[];
  swotItems: SWOTItem[];
  marketAnalyses: MarketAnalysis[];
  expansionScenarios: ExpansionScenario[];
  franchiseUnits: FranchiseUnit[];
  dueDiligenceReports: DueDiligenceReport[];
  abTests: ABTest[];
  employeeIdeas: EmployeeIdea[];
  startupPartnerships: StartupPartnership[];
  trendReports: TrendReport[];
  patents: Patent[];
  employeeSurveys: EmployeeSurvey[];
  onboardingTasks: OnboardingTask[];
  benefits: Benefit[];
  pdIs: PDI[];
  strategicPartners: StrategicPartner[];
  adminProfile: AdminProfile;
  loginPageConfig: LoginPageConfig;
  affiliateLinks: AffiliateLink[];
  adsenseConfig: AdSenseConfig;
  contracts: Contract[];
  licenses: License[];
  complianceAudits: ComplianceAudit[];
  languageSettings: LanguageSetting[];
  currencySettings: CurrencySetting[];
  regionalContents: RegionalContent[];
  internationalShipments: InternationalShipment[];
  nfes: NFe[];
  fiscalConfig: FiscalConfig;
  cyberAttackSimulations: CyberAttackSimulation[];
  fraudAnalysisLogs: FraudAnalysisLog[];
  antiFraudRules: AntiFraudRule[];
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
  demandForecasts: any[];
  stockOptimizations: StockOptimization[];
  supplierIntegrations: SupplierIntegration[];
}

export interface SiteIdentity {
  logoUrl: string;
  logoHeight: number;
  logoCentered: boolean;
  logoEffect: 'none' | 'shadow' | 'grayscale' | 'sepia';
  faviconUrl: string;
}

export interface ThemeColors {
  [key: string]: string;
  primary: string;
  secondary: string;
  'header-bg': string;
  'header-text': string;
  'footer-bg': string;
  'footer-text': string;
}

export interface PresetTheme {
  name: string;
  colors: ThemeColors;
}

export interface Category {
  id: string;
  name: string;
  url: string;
}

export interface Banner {
  id: number;
  imageUrl: string;
  altText?: string;
  link: string;
  isActive: boolean;
  title?: string;
  subtitle?: string;
  textColor?: string;
  buttonText?: string;
  position: 'hero' | 'sidebar' | 'inline' | 'middle' | 'footer';
}

export interface CategoryPromoItem {
  id: number;
  title: string;
  subtitle: string;
  imageUrl: string;
}

export interface Product {
  id: number;
  code: string;
  name: string;
  description: string;
  imageUrls: string[];
  price: number;
  originalPrice?: number;
  stock: number;
  tags: string[];
  videoUrl?: string;
  specifications?: Record<string, string>;
}

export interface ProductSectionData {
  id: string;
  title: string;
  products: Product[];
}

export interface Brand {
  id: number;
  name: string;
  logoUrl: string;
}

export interface FooterSettings {
  sections: { id: string; title: string; links: { id: string; text: string; url: string }[] }[];
  paymentMethods: PaymentMethod[];
  socialLinks: { facebook: string; instagram: string; twitter: string; youtube: string; linkedin: string };
  bottomText: string[];
}

export interface CartItem {
  productId: number;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'Admin' | 'Cliente';
  status: 'Ativo' | 'Inativo';
  lastLogin: string;
  loyaltyTier: 'Bronze' | 'Prata' | 'Ouro' | 'Platina';
  tags: string[];
  notes: string;
  gamification?: { points: number; badges: string[] };
  communicationLog?: { id: string, date: string, type: 'Email' | 'Chamada' | 'Ticket' | 'Nota', summary: string}[];
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  date: string;
  total: number;
  status: 'Pendente' | 'Pago' | 'Enviado' | 'Entregue' | 'Cancelado';
  items: OrderItem[];
}

export interface Integration {
  id: string;
  name: string;
  enabled: boolean;
  apiKey: string;
}

export interface PaymentGateway {
    id: string;
    name: string;
    enabled: boolean;
    publicKey: string;
    secretKey: string;
}

export interface SecuritySettings {
    is2FAEnabled: boolean;
    fraudDetectionLevel: 'baixo' | 'médio' | 'alto';
    dataRetentionDays: number;
}

export interface PaymentMethod {
    id: string;
    name: string;
    enabled: boolean;
    iconUrl: string;
}

export interface DashboardData {
    totalSales: number;
    orderCount: number;
    customerCount: number;
    averageTicket: number;
    salesByDay: { day: string; sales: number }[];
    recentOrders: Order[];
    lowStockProducts: Product[];
}

export interface Subscription {
    id: string;
    userId: number;
    customerName: string;
    products: SubscriptionProduct[];
    frequency: 'Semanal' | 'Quinzenal' | 'Mensal';
    status: 'Ativa' | 'Pausada' | 'Cancelada';
    nextDeliveryDate: string;
    createdAt: string;
}

export interface SubscriptionProduct {
    productId: number;
    quantity: number;
}

export interface DeliveryRoute {
    id: string;
    driverName: string;
    vehicleId: string;
    status: 'Planejada' | 'Em Rota' | 'Concluída';
    progress: number;
    stops: { address: string; status: 'Pendente' | 'Entregue' }[];
}

export interface Warehouse {
    id: string;
    name: string;
    location: string;
    capacity: number;
    currentStock: number;
    temperature: number;
    security: 'Baixa' | 'Média' | 'Alta';
}

export interface Vehicle {
    id: string;
    model: string;
    plate: string;
    type: 'Carro' | 'Moto' | 'Van' | 'Caminhão' | 'Drone' | 'Robô';
    status: 'Disponível' | 'Em Rota' | 'Manutenção';
    lastMaintenance: string;
    nextMaintenance?: string;
    assignedDriver: string;
    fuelConsumption: number; // km/L
}

export interface Invoice {
    id: string;
    orderId: string;
    customerName: string;
    amount: number;
    dueDate: string;
    status: 'Pendente' | 'Paga' | 'Atrasada';
}

export interface Expense {
    id: string;
    date: string;
    category: 'Marketing' | 'Salários' | 'Inventário' | 'Operações' | 'Outros';
    description: string;
    amount: number;
}

export interface Quote {
    id: string;
    customerName: string;
    items: OrderItem[];
    total: number;
    status: 'Rascunho' | 'Enviado' | 'Aceito' | 'Recusado';
    createdAt: string;
}

export interface AbandonedCart {
    id: string;
    customerEmail: string;
    items: OrderItem[];
    total: number;
    lastSeen: string;
}

export interface SalesRepresentative {
    id: string;
    name: string;
    points: number;
    badges: string[];
}

export interface OrderItem {
    productId: number;
    productName: string;
    quantity: number;
    price: number;
}

export interface Mission {
    id: string;
    title: string;
    description: string;
    points: number;
}

export interface Badge {
    id: string;
    name: string;
    description: string;
    icon: React.FC<any>;
}

export interface TeamMission {
    id: string;
    title: string;
    description: string;
    points: number;
}

export interface SocialPost {
    id: string;
    platform: 'Facebook' | 'Instagram' | 'Twitter';
    content: string;
    imageUrl?: string;
    scheduledAt: string;
    status: 'Agendado' | 'Publicado' | 'Falha';
}

export interface MarketingCampaign {
    id: string;
    name: string;
    channel: string;
    status: 'Planejamento' | 'Ativa' | 'Pausada' | 'Concluída';
    startDate: string;
    endDate?: string;
    budget: number;
    roi: number;
    targetAudience: string;
    mediaAssets?: string[];
}

export interface Affiliate {
    id: string;
    name: string;
    commissionRate: number;
    totalSales: number;
    contactEmail: string;
    referralCode: string;
    status: 'Ativo' | 'Inativo' | 'Pendente';
}

export interface AnalyticsInsight {
    id: string;
    title: string;
    description: string;
    generatedAt: string;
}

export interface ProjectTask {
    id: string;
    content: string;
    status: 'To Do' | 'In Progress' | 'Done';
    assignee?: string;
}

export interface TeamMember {
    id: string;
    name: string;
    role: string;
    avatar: string; // Initials or image URL
    points: number;
}

export interface CalendarEvent {
    id: string;
    title: string;
    date: string;
}

export interface WikiArticle {
    id: string;
    title: string;
    content: string;
    lastUpdated: string;
}

export interface BlockchainTrace {
  productId: string;
  productName: string;
  origin: string;
  lastScan: string;
}

export interface VoiceCommerceConfig {
  isEnabled: boolean;
  invocationPhrase: string;
}

export interface VRShowroomConfig {
  isEnabled: boolean;
  theme: 'Moderno' | 'Industrial' | 'Aconchegante';
  featuredProductIds: number[];
}

export interface IotDevice {
    id: string;
    name: string;
    type: 'Geladeira' | 'Estoque' | 'Entrada';
    status: 'Online' | 'Offline' | 'Alerta';
    value: string;
}

export interface SupportTicket {
    id: string;
    subject: string;
    user: string;
    createdAt: string;
    status: 'Aberto' | 'Em Andamento' | 'Fechado';
}

export interface FAQ {
    id: string;
    question: string;
    answer: string;
    category: string;
}

export interface TrainingModule {
    id: string;
    title: string;
    category: string;
    duration: number; // in minutes
}

export interface ProductCarbonFootprint {
    productId: string;
    productName: string;
    footprintKgCO2e: number;
}

export interface PackagingLog {
    id: string;
    type: string;
    recyclablePercentage: number;
    unitsUsedLastMonth: number;
}

export interface SustainableIncentive {
    id: string;
    name: string;
    description: string;
    isActive: boolean;
}

export interface SWOTItem {
  id: string;
  category: 'Strengths' | 'Weaknesses' | 'Opportunities' | 'Threats';
  text: string;
}

export interface FairEvent {
    id: string;
    name: string;
    startDate: string;
    endDate?: string;
    location: string;
    description: string;
    responsible: string;
}

export interface FairMeeting {
    id: string;
    eventId: string;
    subject: string;
    dateTime: string;
    participants: string;
    location: string;
}

export interface Contract {
    id: string;
    name: string;
    vendor: string;
    endDate: string;
    status: 'Ativo' | 'Expirando' | 'Expirado';
}

export interface License {
    id: string;
    name: string;
    expiryDate: string;
    status: 'Válido' | 'Expirando';
}

export interface ComplianceAudit {
    id: string;
    area: string;
    date: string;
    result: 'Conforme' | 'Não Conforme';
    details: string;
}

export interface LanguageSetting {
    id: string;
    name: string;
    code: string;
    isEnabled: boolean;
}

export interface CurrencySetting {
    id: string;
    name: string;
    code: string;
    isEnabled: boolean;
}

export interface RegionalContent {
    id: string;
    region: string;
    promoText: string;
    bannerImageUrl: string;
}

export interface InternationalShipment {
    id: string;
    orderId: string;
    destinationCountry: string;
    carrier: string;
    customsStatus: 'Em Análise' | 'Liberado' | 'Retido';
}

export interface NFe {
    id: string;
    number: string;
    orderId: string;
    issueDate: string;
    amount: number;
    status: 'Pendente' | 'Emitida' | 'Cancelada';
}

export interface FiscalConfig {
    companyName: string;
    cnpj: string;
    ie: string;
    taxRegime: 'Simples Nacional' | 'Lucro Presumido' | 'Lucro Real';
    digitalCertificateExpiry: string;
}

export interface CyberAttackSimulation {
    id: string;
    date: string;
    type: 'Phishing' | 'DDoS' | 'Ransomware';
    result: 'Detectado' | 'Não Detectado';
}

export interface FraudAnalysisLog {
    id: string;
    orderId: string;
    riskScore: number;
    reason: string;
    action: 'Aprovado' | 'Sinalizado' | 'Bloqueado';
}

export interface AntiFraudRule {
    id: string;
    description: string;
    action: 'Sinalizar' | 'Bloquear';
    isActive: boolean;
}

export interface Supplier {
    id: string;
    name: string;
    esgScore: number;
    onTimeDeliveryRate: number;
    qualityScore: number;
    status: 'Ativo' | 'Inativo';
}

export interface PurchaseOrder {
    id: string;
    supplierId: string;
    supplierName: string;
    date: string;
    items: OrderItem[];
    total: number;
    status: 'Rascunho' | 'Enviado' | 'Recebido';
}

export interface StockOptimization {
  productId: string;
  productName: string;
  warehouseId: string;
  currentLevel: number;
  optimalLevel: number;
  actionNeeded: 'Repor' | 'Transferir' | 'OK';
}

export interface SupplierIntegration {
    supplierId: string;
    supplierName: string;
    status: 'Integrado' | 'Pendente';
}

export interface FranchiseUnit {
    id: string;
    name: string;
    location: string;
    manager: string;
    openingDate: string;
    monthlyRevenue: number;
    performance: number; // percentage
}

export interface MarketAnalysis {
    id: string;
    niche: string;
    opportunityScore: number;
    summary: string;
}

export interface ExpansionScenario {
    id: string;
    location: string;
    investment: number;
    predictedROI: number;
    summary: string;
}

export interface DueDiligenceReport {
    id: string;
    companyName: string;
    riskLevel: 'Baixo' | 'Médio' | 'Alto';
    summary: string;
}

export interface ABTest {
    id: string;
    productName: string;
    metric: string;
    variantA_conversion: number;
    variantB_conversion: number;
    winner: 'A' | 'B' | 'Inconclusivo';
    status: 'Em Andamento' | 'Concluído';
}

export interface EmployeeIdea {
    id: string;
    title: string;
    submittedBy: string;
    department: string;
    votes: number;
    status: 'Recebida' | 'Em Análise' | 'Aprovada' | 'Rejeitada';
}

export interface StartupPartnership {
    id: string;
    startupName: string;
    area: string;
    status: 'Contato Inicial' | 'Piloto' | 'Integrado';
}

export interface TrendReport {
    id: string;
    title: string;
    summary: string;
    source: string;
}

export interface Patent {
    id: string;
    name: string;
    registrationNumber: string;
    expiryDate: string;
    status: 'Pendente' | 'Ativa';
}

export interface EmployeeSurvey {
    id: string;
    title: string;
    status: 'Aberto' | 'Fechado';
    participationRate: number;
    satisfactionScore: number;
}

export interface OnboardingTask {
    id: string;
    title: string;
    description: string;
    status: 'Pendente' | 'Concluído';
}

export interface Benefit {
    id: string;
    name: string;
    description: string;
}

export interface PDI {
    id: string;
    employeeId: string;
    employeeName: string;
    goals: PDIGoal[];
    status: 'Ativo' | 'Concluído';
}

export interface PDIGoal {
    id: string;
    description: string;
    targetDate: string;
    status: 'A Fazer' | 'Em Progresso' | 'Concluído';
}

export interface StrategicPartner {
    id: string;
    name: string;
    type: string;
    status: 'Ativo' | 'Inativo';
}

export interface AdminProfile {
    name: string;
    email: string;
    avatarUrl: string;
    enable2FA: boolean;
    notificationSettings: {
        newOrders: boolean;
        supportTickets: boolean;
        weeklyReports: boolean;
    };
}

export interface LoginPageConfig {
    backgroundType: 'color' | 'gradient' | 'image';
    backgroundColor: string;
    backgroundGradient: string;
    backgroundImageUrl: string;
    logoUrl: string;
    welcomeTitle: string;
    welcomeSubtitle: string;
    layout: 'centered' | 'side-image';
    enableGoogleLogin: boolean;
    enableFacebookLogin: boolean;
}

export interface AffiliateLink {
    id: string;
    name: string;
    url: string;
    isActive: boolean;
}

export interface AdSenseConfig {
    isEnabled: boolean;
    publisherId: string;
    slotId: string;
}

export interface Seller {
  id: string;
  name: string;
  contactEmail: string;
  joinDate: string;
  gvm: number; // Gross Merchandise Volume
  rating: number; // 0-5
  status: 'Ativo' | 'Pendente' | 'Rejeitado';
}

export interface Dispute {
  id: string;
  orderId: string;
  reason: string;
  status: 'Aberto' | 'Resolvido';
  resolvedAt?: string;
  resolution?: string;
}

export interface SellerPayout {
  id: string;
  sellerId: string;
  sellerName: string;
  period: string; // e.g., 'Nov/2023'
  amount: number;
  status: 'Pendente' | 'Pago';
}

export interface CommissionRule {
  id: string;
  category: string; // or categoryId
  commissionRate: number; // as percentage
}

import React, { useState, useEffect, useRef } from 'react';
import { AppState, PresetTheme, Product } from './types';

import Header from './components/Header';
import Hero from './components/Hero';
import CategoryPromo from './components/CategoryPromo';
import ProductSection from './components/ProductSection';
import BrandLogos from './components/BrandLogos';
import Newsletter from './components/Newsletter';
import Footer from './components/Footer';
import AdminPanel from './components/AdminPanel';
import LoginModal from './components/LoginModal';
import CartSidebar from './components/CartSidebar';
import ProductPage from './components/ProductPage';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState | null>(null);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [route, setRoute] = useState({ page: 'home', productId: null as number | null });
  const dataLoaded = useRef(false);

  // Load initial state from db.json
  useEffect(() => {
    // NOTA: Esta lógica garante que os dados sejam carregados apenas uma vez.
    // O `useRef` (dataLoaded) previne a execução duplicada do fetch que ocorre
    // no modo de desenvolvimento do React (Strict Mode), garantindo um
    // carregamento estável e sem chamadas de rede desnecessárias.
    if (dataLoaded.current) {
      return;
    }
    dataLoaded.current = true;

    const loadData = async () => {
      try {
        console.log("Loading initial data from db.json.");
        const response = await fetch('/db.json');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setAppState(data);
      } catch (error) {
        console.error("Failed to load initial data:", error);
      }
    };
    loadData();
  }, []);
  
  // Effect to handle routing from URL hash
  useEffect(() => {
    const handleHashChange = () => {
        const hash = window.location.hash.replace(/^#\/?/, ''); // Remove # and optional /
        const parts = hash.split('/');
        
        if (parts[0] === 'produto' && parts[1]) {
            const productId = parseInt(parts[1], 10);
            if (!isNaN(productId)) {
                setRoute({ page: 'product', productId });
                window.scrollTo(0, 0);
            }
        } else {
            setRoute({ page: 'home', productId: null });
        }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Initial load

    return () => {
        window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);
  
  useEffect(() => {
    if (!appState) return;
    const root = document.documentElement;

    // Apply theme colors to CSS variables
    for (const [key, value] of Object.entries(appState.theme)) {
      root.style.setProperty(`--color-${key}`, value as string);
    }
    
    // Apply typography
    if (appState.typography) {
        root.style.setProperty('--font-family-body', appState.typography.fontFamily);
        root.style.fontSize = `${appState.typography.baseSize}px`;
    }

    // Update favicon
    const favicon = document.getElementById('favicon') as HTMLLinkElement;
    if (favicon && appState.siteIdentity.faviconUrl) {
      favicon.href = appState.siteIdentity.faviconUrl;
    }
  }, [appState?.theme, appState?.siteIdentity.faviconUrl, appState?.typography]);

  // Effect to apply custom code (CSS & HTML)
  useEffect(() => {
    if (!appState) return;

    const customCodeInjector = document.getElementById('custom-code-injector');
    if (customCodeInjector) {
      customCodeInjector.innerHTML = appState.customCode || '';
    }
  }, [appState?.customCode]);

  const onApplyPresetTheme = (preset: PresetTheme) => {
    if (!appState) return;
    setAppState(prev => prev ? ({ ...prev, theme: preset.colors }) : null);
  };

  const handleLogin = (user: { name: string; email: string; role: 'Admin' | 'Cliente' }) => {
    if (!appState) return;
    setAppState(prev => prev ? ({ ...prev, currentUser: user }) : null);
    setIsLoginModalOpen(false);
  };

  const handleLogout = () => {
    if (!appState) return;
    setAppState(prev => prev ? ({ ...prev, currentUser: null }) : null);
  };
  
  const handleAddToCart = (product: Product, quantity: number = 1) => {
    if (!appState) return;
    setAppState(prev => {
        if (!prev) return null;
        const existingItem = prev.cart.find(item => item.productId === product.id);
        if (existingItem) {
            return {
                ...prev,
                cart: prev.cart.map(item =>
                    item.productId === product.id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                ),
            };
        } else {
            return {
                ...prev,
                cart: [
                    ...prev.cart,
                    {
                        productId: product.id,
                        name: product.name,
                        price: product.price,
                        imageUrl: product.imageUrls[0],
                        quantity: quantity,
                    },
                ],
            };
        }
    });
    setIsCartOpen(true);
  };

  const handleUpdateCartQuantity = (productId: number, quantity: number) => {
     if (!appState) return;
    setAppState(prev => prev ? ({
        ...prev,
        cart: prev.cart.map(item =>
            item.productId === productId ? { ...item, quantity } : item
        ).filter(item => item.quantity > 0),
    }) : null);
  };

  const handleRemoveFromCart = (productId: number) => {
    if (!appState) return;
    setAppState(prev => prev ? ({
        ...prev,
        cart: prev.cart.filter(item => item.productId !== productId),
    }) : null);
  };

  if (!appState) {
    return <div className="flex justify-center items-center h-screen text-xl font-semibold">Carregando...</div>
  }

  const activeBanners = appState.banners.filter(b => b.isActive);
  const allProducts = appState.productSections.flatMap(s => s.products);
  const productToShow = route.page === 'product' ? allProducts.find(p => p.id === route.productId) : null;

  return (
    <div className="bg-[var(--color-background)] min-h-screen">
      <Header 
        onAdminClick={() => setIsAdminPanelOpen(true)} 
        siteIdentity={appState.siteIdentity} 
        categories={appState.categories}
        currentUser={appState.currentUser}
        cart={appState.cart}
        onLoginClick={() => setIsLoginModalOpen(true)}
        onLogout={handleLogout}
        onCartClick={() => setIsCartOpen(true)}
      />
      
      {route.page === 'home' ? (
        <main className="max-w-[1280px] mx-auto">
            <Hero banners={activeBanners} />
            <CategoryPromo promos={appState.promos} title={appState.homePage.categoryPromoTitle} />
            <div className="px-4 py-8 space-y-12">
            {appState.productSections.map((section) => (
                <ProductSection key={section.id} title={section.title} products={section.products} onAddToCart={handleAddToCart} />
            ))}
            </div>
            <BrandLogos brands={appState.brands} />
        </main>
      ) : productToShow ? (
        <ProductPage 
            product={productToShow} 
            allProducts={allProducts} 
            onAddToCart={handleAddToCart} 
            productSectionTitle={appState.productSections.find(s => s.products.some(p => p.id === productToShow.id))?.title || 'Produtos'}
        />
      ) : (
         <main className="max-w-[1280px] mx-auto px-4 py-20 text-center">
            <h2 className="text-3xl font-bold text-gray-700">Produto Não Encontrado</h2>
            <p className="text-gray-500 mt-2">O produto que você está procurando não existe ou foi removido.</p>
            <a href="/#" className="mt-6 inline-block bg-[var(--color-primary)] text-white font-bold py-3 px-6 rounded-lg hover:opacity-90">
                Voltar para a Página Inicial
            </a>
        </main>
      )}

      <Newsletter />
      <Footer settings={appState.footerSettings} theme={appState.theme} />

      {isAdminPanelOpen && (
        <AdminPanel
          appState={appState}
          setAppState={setAppState}
          onClose={() => setIsAdminPanelOpen(false)}
          onApplyPresetTheme={onApplyPresetTheme}
        />
      )}
      
      {isLoginModalOpen && (
        <LoginModal 
          onClose={() => setIsLoginModalOpen(false)}
          onLogin={handleLogin}
          users={appState.users}
        />
      )}
      
      {isCartOpen && (
        <CartSidebar
          cartItems={appState.cart}
          onClose={() => setIsCartOpen(false)}
          onUpdateQuantity={handleUpdateCartQuantity}
          onRemoveItem={handleRemoveFromCart}
        />
      )}
    </div>
  );
};

export default App;
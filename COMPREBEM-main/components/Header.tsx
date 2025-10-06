
import React, { useState } from 'react';
import { SearchIcon, UserIcon, ShoppingCartIcon, AdminIcon, ChevronDownIcon } from './Icons';
import { SiteIdentity, Category, CartItem } from '../types';

interface HeaderProps {
  onAdminClick: () => void;
  siteIdentity: SiteIdentity;
  categories: Category[];
  currentUser: { name: string; role: 'Admin' | 'Cliente' } | null;
  cart: CartItem[];
  onLoginClick: () => void;
  onLogout: () => void;
  onCartClick: () => void;
}

const UserDropdown: React.FC<{ user: { name: string }, onLogout: () => void }> = ({ user, onLogout }) => (
    <div className="relative group">
        <button className="flex items-center text-sm hover:opacity-80">
            <UserIcon className="h-7 w-7"/>
            <ChevronDownIcon className="h-4 w-4 ml-1"/>
        </button>
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 invisible group-hover:visible">
            <div className="px-4 py-2 text-sm text-gray-700">Olá, {user.name}</div>
            <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Minha Conta</a>
            <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Meus Pedidos</a>
            <button onClick={onLogout} className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Sair</button>
        </div>
    </div>
);


const Header: React.FC<HeaderProps> = ({ onAdminClick, siteIdentity, categories, currentUser, cart, onLoginClick, onLogout, onCartClick }) => {
  const { logoUrl, logoHeight, logoCentered, logoEffect } = siteIdentity;
  
  const logoStyle: React.CSSProperties = {
    height: `${logoHeight}px`,
    filter: 'none',
  };

  if (logoEffect === 'shadow') {
    logoStyle.filter = 'drop-shadow(0 2px 3px rgba(0,0,0,0.4))';
  } else if (logoEffect === 'grayscale') {
    logoStyle.filter = 'grayscale(100%)';
  } else if (logoEffect === 'sepia') {
    logoStyle.filter = 'sepia(100%)';
  }

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);


  return (
    <header className="shadow-md sticky top-0 z-40" style={{ background: 'var(--color-header-bg)', color: 'var(--color-header-text)' }}>
      <div className="max-w-[1280px] mx-auto px-4">
        <div className={`items-center h-20 ${logoCentered ? 'grid grid-cols-3' : 'flex justify-between'}`}>
          {/* Logo */}
          <div className={`${logoCentered ? 'flex justify-center col-start-2' : 'flex-shrink-0'}`}>
            <a href="/#" aria-label="Página inicial">
              <img 
                style={logoStyle}
                className="w-auto transition-all duration-300" 
                src={logoUrl} 
                alt="CompreBem Logo" 
              />
            </a>
          </div>

          {/* Search Bar */}
          <div className={`${logoCentered ? 'col-start-1 row-start-1' : 'flex-1 max-w-2xl mx-4'}`}>
            <div className="relative">
              <input 
                type="search" 
                placeholder="Busque por código, nome ou marca..."
                className="w-full h-12 pl-4 pr-12 text-sm bg-gray-100 text-gray-800 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
              />
              <button className="absolute inset-y-0 right-0 flex items-center justify-center w-12 text-gray-500 hover:text-gray-700">
                <SearchIcon className="h-6 w-6"/>
              </button>
            </div>
          </div>

          {/* Icons */}
          <div className={`${logoCentered ? 'flex justify-end col-start-3 row-start-1' : 'flex items-center space-x-6'}`} style={{ color: 'var(--color-header-text)' }}>
            {currentUser?.role === 'Admin' && (
              <button onClick={onAdminClick} className="flex items-center text-sm hover:opacity-80" aria-label="Abrir painel de administração">
                <AdminIcon className="h-7 w-7"/>
              </button>
            )}
             {currentUser ? (
                 <UserDropdown user={currentUser} onLogout={onLogout} />
             ) : (
                <button onClick={onLoginClick} className="flex items-center text-sm hover:opacity-80" aria-label="Minha conta">
                    <UserIcon className="h-7 w-7"/>
                </button>
             )}

            <button onClick={onCartClick} className="relative flex items-center text-sm hover:opacity-80" aria-label="Carrinho de compras">
              <ShoppingCartIcon className="h-7 w-7"/>
              {cartItemCount > 0 && <span className="absolute -top-2 -right-3 flex items-center justify-center h-5 w-5 bg-red-600 text-white text-xs font-bold rounded-full">{cartItemCount}</span>}
            </button>
          </div>
        </div>
      </div>
      <div className="border-t border-white/20">
        <nav className="h-10">
          <div className="max-w-[1280px] mx-auto px-4 flex justify-center items-center h-full space-x-6">
            {categories.map(category => (
              <a key={category.id} href={category.url} className="text-sm font-semibold hover:opacity-80 transition-opacity">
                {category.name}
              </a>
            ))}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;

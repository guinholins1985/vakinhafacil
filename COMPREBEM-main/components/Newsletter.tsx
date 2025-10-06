
import React from 'react';
import { MailIcon } from './Icons';

const Newsletter: React.FC = () => {
  return (
    <div style={{ backgroundColor: 'var(--color-primary)' }} className="text-white py-12">
      <div className="max-w-[1280px] mx-auto px-4 text-center">
        <div className="flex items-center justify-center space-x-4 mb-4">
          <MailIcon className="h-10 w-10" />
          <div>
            <h3 className="text-2xl font-bold">Receba nossas promoções e novidades exclusivas</h3>
            <p className="text-sm opacity-90">Cadastre-se para ficar por dentro de tudo!</p>
          </div>
        </div>
        <form className="mt-8 max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="text-left">
            <label htmlFor="name" className="text-sm font-medium">Nome</label>
            <input type="text" id="name" placeholder="Seu nome" className="w-full mt-1 p-3 rounded-md text-gray-800 border-2 border-transparent focus:border-white focus:ring-0" />
          </div>
          <div className="text-left md:col-span-2">
            <label htmlFor="email" className="text-sm font-medium">E-mail*</label>
            <input type="email" id="email" placeholder="email@exemplo.com" className="w-full mt-1 p-3 rounded-md text-gray-800 border-2 border-transparent focus:border-white focus:ring-0" required />
          </div>
          <div className="md:col-span-1">
            <button type="submit" style={{ backgroundColor: 'var(--color-secondary)' }} className="w-full font-bold py-3 px-6 rounded-md hover:opacity-90 transition-opacity h-full">
              Enviar
            </button>
          </div>
        </form>
         <p className="text-xs opacity-70 mt-4 max-w-2xl mx-auto">Ao clicar em ENVIAR, confirmo que li e aceito as <a href="#" className="underline">Políticas de Privacidade</a> e os <a href="#" className="underline">Termos de Uso</a>.</p>
      </div>
    </div>
  );
};

export default Newsletter;
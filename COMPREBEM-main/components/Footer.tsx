
import React from 'react';
import { FacebookIcon, InstagramIcon, XIcon, YoutubeIcon, LinkedinIcon, LockIcon } from './Icons';
import { FooterSettings, ThemeColors } from '../types';

interface FooterProps {
    settings: FooterSettings;
    theme: ThemeColors;
}

const isColorDark = (hexColor: string) => {
    if (!hexColor || !hexColor.startsWith('#')) return true; 
    const color = hexColor.substring(1);
    const rgb = parseInt(color, 16);
    if (isNaN(rgb)) return true; // Default to dark for invalid colors
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = (rgb >> 0) & 0xff;
    const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    return luma < 128;
};


const Footer: React.FC<FooterProps> = ({ settings, theme }) => {
  const logosShouldBeInverted = isColorDark(theme['footer-bg']);
  return (
    <footer style={{ background: 'var(--color-footer-bg)', color: 'var(--color-footer-text)' }} className="text-sm">
      <div className="max-w-[1280px] mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b">
          {settings.sections.map(section => (
            <div key={section.id}>
              <h4 className="font-bold text-current mb-4 opacity-90">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map(link => (
                  <li key={link.id}><a href={link.url} className="hover:underline opacity-80 hover:opacity-100">{link.text}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 py-8">
            <div>
                <h4 className="font-bold text-current mb-4 opacity-90">Formas de pagamento</h4>
                <div className="grid grid-cols-4 gap-2">
                    {settings.paymentMethods.filter(p => p.enabled).map((method) => <img key={method.id} src={method.iconUrl} alt={method.name} className={`h-auto w-full ${logosShouldBeInverted ? 'filter brightness-0 invert' : ''}`} />)}
                </div>
            </div>
            <div>
                <h4 className="font-bold text-current mb-4 opacity-90">Baixe o aplicativo CompreBem</h4>
                <div className="flex space-x-2">
                    <a href="#"><img src="https://play.google.com/intl/en_us/badges/static/images/badges/pt-br_badge_web_generic.png" alt="Google Play" className="h-12"/></a>
                    <a href="#"><img src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg" alt="App Store" className="h-12"/></a>
                </div>
            </div>
             <div>
                <h4 className="font-bold text-current mb-4 opacity-90">Acompanhe a gente nas redes sociais</h4>
                <div className="flex space-x-3">
                    <a href={settings.socialLinks.facebook} className="opacity-70 hover:opacity-100 hover:text-blue-600"><FacebookIcon className="h-6 w-6"/></a>
                    <a href={settings.socialLinks.instagram} className="opacity-70 hover:opacity-100 hover:text-pink-500"><InstagramIcon className="h-6 w-6"/></a>
                    <a href={settings.socialLinks.twitter} className="opacity-70 hover:opacity-100 hover:text-gray-800"><XIcon className="h-6 w-6"/></a>
                    <a href={settings.socialLinks.youtube} className="opacity-70 hover:opacity-100 hover:text-red-600"><YoutubeIcon className="h-6 w-6"/></a>
                    <a href={settings.socialLinks.linkedin} className="opacity-70 hover:opacity-100 hover:text-blue-700"><LinkedinIcon className="h-6 w-6"/></a>
                </div>
            </div>
             <div>
                <div className="flex items-center space-x-2">
                    <LockIcon className="h-8 w-8 opacity-50" />
                    <span className="font-bold opacity-70">AMBIENTE SEGURO</span>
                </div>
            </div>
        </div>

        <div className="text-center text-xs opacity-60 pt-8 border-t">
          {settings.bottomText.map((line, i) => (
             <p key={i} className={i === 0 ? 'mb-2' : ''}>
                {i === 0 ? <><strong className="text-red-600">Racismo é crime. Denuncie.</strong> {line.replace('Racismo é crime. Denuncie. ','')}</> : line}
             </p>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
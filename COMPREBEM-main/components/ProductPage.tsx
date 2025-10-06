import React, { useState, useEffect, useRef } from 'react';
import { Product } from '../types.ts';
import { StarIcon, CheckCircleIcon, CubeIcon, TruckIcon, ShieldCheckIcon } from './Icons.tsx';
import ProductSection from './ProductSection.tsx';

interface ProductPageProps {
    product: Product;
    allProducts: Product[];
    onAddToCart: (product: Product, quantity: number) => void;
    productSectionTitle: string;
}

const StockStatus: React.FC<{ stock: number }> = ({ stock }) => {
    if (stock === 0) {
        return <span className="font-semibold text-red-600">Produto indisponível</span>;
    }
    if (stock <= 10) {
        return <span className="font-semibold text-orange-500">Últimas {stock} unidades!</span>;
    }
    return <span className="font-semibold text-green-600">Em estoque</span>;
};


const ProductPage: React.FC<ProductPageProps> = ({ product, allProducts, onAddToCart, productSectionTitle }) => {
    const [selectedImage, setSelectedImage] = useState(product.imageUrls[0]);
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState('description');
    
    const imageContainerRef = useRef<HTMLDivElement>(null);
    const resultRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setSelectedImage(product.imageUrls[0]);
        setQuantity(1);
        setActiveTab('description');
    }, [product]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!imageContainerRef.current || !resultRef.current) return;
        
        const img = imageContainerRef.current.querySelector('img');
        if (!img) return;
        
        const rect = e.currentTarget.getBoundingClientRect();
        let x = e.clientX - rect.left;
        let y = e.clientY - rect.top;

        const result = resultRef.current;
        const imgWidth = img.width;
        const imgHeight = img.height;
        const resultWidth = result.offsetWidth;
        const resultHeight = result.offsetHeight;

        x = Math.max(0, Math.min(x, imgWidth));
        y = Math.max(0, Math.min(y, imgHeight));
        
        const ratioX = resultWidth / imgWidth;
        const ratioY = resultHeight / imgHeight;

        result.style.backgroundImage = `url(${selectedImage})`;
        result.style.backgroundSize = `${imgWidth * ratioX}px ${imgHeight * ratioY}px`;
        
        const bgX = -(x * ratioX - resultWidth / 2);
        const bgY = -(y * ratioY - resultHeight / 2);

        result.style.backgroundPosition = `${bgX}px ${bgY}px`;
    };

    const relatedProducts = allProducts
        .filter(p => p.id !== product.id)
        .sort((a, b) => {
            const aSharedTags = a.tags.filter(tag => product.tags.includes(tag)).length;
            const bSharedTags = b.tags.filter(tag => product.tags.includes(tag)).length;
            return bSharedTags - aSharedTags;
        })
        .slice(0, 10);

    const mockReviews = [
        { id: 1, name: 'João S.', rating: 5, comment: 'Produto excelente, entrega rápida e bem embalado. Qualidade superior, superou minhas expectativas. Recomendo a todos!' },
        { id: 2, name: 'Maria P.', rating: 4, comment: 'Gostei bastante, cumpre o que promete. A cor é um pouco diferente da foto, mas a qualidade é boa.' },
        { id: 3, name: 'Carlos A.', rating: 5, comment: 'Sempre compro e a qualidade é ótima. Virou item essencial aqui em casa.' },
        { id: 4, name: 'Ana L.', rating: 3, comment: 'É um bom produto, mas a embalagem chegou um pouco amassada.' },
    ];
    
    const tabs = [
        { id: 'description', label: 'Descrição' },
        { id: 'specs', label: 'Especificações' },
        { id: 'reviews', label: `Avaliações (${mockReviews.length})` },
    ];

    const avgRating = mockReviews.reduce((sum, r) => sum + r.rating, 0) / mockReviews.length;
    const ratingDistribution = [5, 4, 3, 2, 1].map(stars => {
        const count = mockReviews.filter(r => r.rating === stars).length;
        const percentage = (count / mockReviews.length) * 100;
        return { stars, count, percentage };
    });


    return (
        <main className="max-w-[1280px] mx-auto px-4 py-8">
            <div className="text-sm text-gray-500 mb-4">
                <a href="/#" className="hover:text-gray-800">Início</a> &gt; 
                <a href="/#" className="hover:text-gray-800"> {productSectionTitle}</a> &gt; 
                <span className="text-gray-800 font-semibold"> {product.name}</span>
            </div>

            <div className="bg-[var(--color-card-bg)] p-6 md:p-8 rounded-xl shadow-lg grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Image Gallery */}
                <div>
                    <div className="flex flex-col-reverse md:flex-row gap-4">
                        <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-y-auto pb-2 md:pb-0 md:pr-2 scrollbar-hide">
                            {product.imageUrls.map((url, index) => (
                                <img
                                    key={index}
                                    src={url}
                                    alt={`${product.name} thumbnail ${index + 1}`}
                                    className={`w-20 h-20 flex-shrink-0 object-contain p-1 border-2 rounded-lg cursor-pointer transition-all ${selectedImage === url ? 'border-[var(--color-primary)]' : 'border-transparent hover:border-gray-300'}`}
                                    onClick={() => setSelectedImage(url)}
                                    onMouseEnter={() => setSelectedImage(url)}
                                />
                            ))}
                        </div>
                        <div ref={imageContainerRef} onMouseMove={handleMouseMove} className="relative group flex-grow flex items-center justify-center bg-gray-50 rounded-lg min-h-[300px] md:min-h-[450px] image-zoom-container">
                            <img src={selectedImage} alt={product.name} className="w-full h-auto max-h-96 md:max-h-[450px] object-contain p-4 cursor-crosshair"/>
                            <div ref={resultRef} className="image-zoom-result hidden lg:block"></div>
                        </div>
                    </div>
                    {product.videoUrl && (
                        <div className="mt-4 bg-white p-2 rounded-lg border shadow-sm">
                            <h3 className="font-semibold text-sm mb-2 px-2">Vídeo do Produto</h3>
                            <video key={product.videoUrl} controls src={product.videoUrl} className="w-full rounded-lg"></video>
                        </div>
                    )}
                </div>


                {/* Product Details */}
                <div>
                    <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-800">{product.name}</h1>
                    <div className="flex items-center my-3">
                        <div className="flex items-center">{[...Array(5)].map((_, i) => <StarIcon key={i} className={`h-5 w-5 ${i < Math.round(avgRating) ? 'text-yellow-400' : 'text-gray-300'}`} />)}</div>
                        <span className="text-sm text-gray-500 ml-2">({mockReviews.length} avaliações)</span>
                        <span className="mx-2 text-gray-300">|</span>
                        <span className="text-sm text-gray-500">Código: {product.code}</span>
                    </div>
                    
                    <div className="my-5">
                        {product.originalPrice && <span className="text-lg text-gray-400 line-through">R$ {product.originalPrice.toFixed(2)}</span>}
                        <span className="text-5xl font-extrabold text-gray-900 ml-2">R$ {product.price.toFixed(2)}</span>
                        <span className="text-green-600 font-semibold ml-2">à vista</span>
                    </div>

                    <p className="text-gray-600 leading-relaxed mb-6 line-clamp-3">{product.description || 'Descrição do produto não disponível.'}</p>
                    
                     <div className="flex items-center gap-4 text-sm mb-6">
                        <div className="flex items-center gap-2">
                           <CheckCircleIcon className={`h-5 w-5 ${product.stock > 0 ? (product.stock <= 10 ? 'text-orange-500' : 'text-green-600') : 'text-red-600'}`} />
                           <StockStatus stock={product.stock} />
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                           <ShieldCheckIcon className="h-5 w-5" />
                           <span className="font-semibold">Compra Segura</span>
                        </div>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg mb-6">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center border border-gray-300 rounded-lg">
                                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="px-4 py-3 text-gray-600 hover:bg-gray-200 rounded-l-lg">-</button>
                                <span className="px-5 text-lg font-bold">{quantity}</span>
                                <button onClick={() => setQuantity(q => q + 1)} className="px-4 py-3 text-gray-600 hover:bg-gray-200 rounded-r-lg">+</button>
                            </div>
                            <button 
                                onClick={() => onAddToCart(product, quantity)} 
                                disabled={product.stock === 0}
                                className="w-full bg-[var(--color-secondary)] text-white font-bold text-lg py-4 rounded-lg hover:opacity-90 transition-opacity disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                <CubeIcon className="h-6 w-6"/>
                                Adicionar ao Carrinho
                            </button>
                        </div>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                        <div className="flex items-center gap-2 font-semibold text-gray-700">
                            <TruckIcon className="h-6 w-6 text-gray-500" />
                            <span>Calcular frete e prazo de entrega</span>
                        </div>
                        <div className="flex gap-2 mt-3">
                            <input type="text" placeholder="Digite seu CEP" className="w-full p-2 border rounded-md" />
                            <button className="bg-gray-200 font-semibold px-4 rounded-md hover:bg-gray-300">Calcular</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Description, Specs, Reviews Tabs */}
            <div className="mt-12">
                 <div className="border-b border-gray-200">
                    <nav className="flex space-x-8 -mb-px" aria-label="Tabs">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`pb-4 px-1 border-b-2 font-medium text-lg ${
                                    activeTab === tab.id
                                        ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
                                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>
                <div className="py-8">
                    {activeTab === 'description' && (
                        <div>
                            <h3 className="text-2xl font-bold mb-4">Descrição do Produto</h3>
                            <p className="text-gray-600 whitespace-pre-wrap">{product.description || 'Sem descrição detalhada.'}</p>
                        </div>
                    )}
                    {activeTab === 'specs' && (
                        <div>
                             <h3 className="text-2xl font-bold mb-4">Especificações Técnicas</h3>
                             <div className="max-w-2xl">
                                <ul className="space-y-3">
                                {product.specifications && Object.keys(product.specifications).length > 0 ? (
                                    Object.entries(product.specifications).map(([key, value]) => (
                                        <li key={key} className="flex justify-between p-3 bg-gray-50 rounded-md text-sm">
                                            <span className="font-semibold text-gray-600">{key}</span>
                                            <span className="text-gray-800">{value}</span>
                                        </li>
                                    ))
                                ) : (
                                    <p className="text-gray-500 text-sm">Nenhuma especificação técnica disponível.</p>
                                )}
                                </ul>
                             </div>
                        </div>
                    )}
                     {activeTab === 'reviews' && (
                         <div>
                             <h3 className="text-2xl font-bold mb-6">Avaliações de Clientes</h3>
                             <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                                <div className="flex flex-col items-center justify-center bg-gray-50 p-6 rounded-lg">
                                    <p className="text-5xl font-bold text-gray-800">{avgRating.toFixed(1)}</p>
                                    <div className="flex items-center my-2">
                                        {[...Array(5)].map((_, i) => (
                                            <StarIcon key={i} className={`h-6 w-6 ${i < Math.round(avgRating) ? 'text-yellow-400' : 'text-gray-300'}`} />
                                        ))}
                                    </div>
                                    <p className="text-sm text-gray-500">Baseado em {mockReviews.length} avaliações</p>
                                </div>
                                <div className="md:col-span-2 flex flex-col justify-center space-y-1">
                                    {ratingDistribution.map(item => (
                                        <div key={item.stars} className="flex items-center gap-2 text-sm">
                                            <span className="w-20 text-gray-600">{item.stars} estrelas</span>
                                            <div className="flex-grow bg-gray-200 rounded-full h-2.5">
                                                <div className="bg-yellow-400 h-2.5 rounded-full" style={{ width: `${item.percentage}%` }}></div>
                                            </div>
                                            <span className="w-8 text-right text-gray-500">{item.count}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-6">
                                {mockReviews.map(review => (
                                    <div key={review.id} className="border-t pt-6">
                                        <div className="flex items-center mb-2">
                                            <div className="flex items-center">{[...Array(review.rating)].map((_, i) => <StarIcon key={i} className="h-5 w-5 text-yellow-400" />)}{[...Array(5-review.rating)].map((_, i) => <StarIcon key={i} className="h-5 w-5 text-gray-300" />)}</div>
                                        </div>
                                        <p className="font-bold text-gray-800 mb-1">{review.name}</p>
                                        <p className="text-gray-600 leading-relaxed">{review.comment}</p>
                                    </div>
                                ))}
                             </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Related Products */}
            <div className="mt-8">
                 <ProductSection title="Quem viu, viu também" products={relatedProducts} onAddToCart={onAddToCart} />
            </div>
        </main>
    );
};

export default ProductPage;
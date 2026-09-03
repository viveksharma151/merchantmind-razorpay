import { formatCurrency } from '@/lib/utils';
import { Star, ShoppingCart, Tag } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  image: string;
  tags: string[];
  stock: number;
  rating: number;
}

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  onCreateCampaign?: (product: Product) => void;
  selected?: boolean;
  onSelect?: (product: Product) => void;
}

export default function ProductCard({ product, onAddToCart, onCreateCampaign, selected, onSelect }: ProductCardProps) {
  return (
    <div
      className={`card hover:border-blue-500/50 transition-all duration-200 cursor-pointer group ${
        selected ? 'border-blue-500 ring-1 ring-blue-500/50' : ''
      }`}
      onClick={() => onSelect?.(product)}
    >
      {/* Category badge */}
      <div className="flex items-center justify-between mb-3">
        <span className="badge text-blue-400 bg-blue-400/10 border-blue-400/20">
          <Tag className="w-3 h-3 mr-1" />{product.category}
        </span>
        <div className="flex items-center gap-1 text-yellow-400">
          <Star className="w-3 h-3 fill-current" />
          <span className="text-xs font-medium">{product.rating}</span>
        </div>
      </div>

      {/* Product image */}
      <div className="w-full h-36 rounded-xl overflow-hidden mb-4 bg-[#0A0A0F]">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => { (e.target as HTMLImageElement).src = `https://via.placeholder.com/300x200/111118/6B7280?text=${encodeURIComponent(product.name.split(' ')[0])}`; }}
        />
      </div>

      {/* Info */}
      <h3 className="font-semibold text-white text-sm mb-1 line-clamp-2">{product.name}</h3>
      <p className="text-gray-400 text-xs mb-3 line-clamp-2">{product.description}</p>

      {/* Price + stock */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xl font-bold text-white">{formatCurrency(product.price)}</span>
        <span className="text-xs text-gray-400">{product.stock} in stock</span>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1 mb-4">
        {product.tags.slice(0, 3).map(tag => (
          <span key={tag} className="text-[10px] bg-[#1E1E2E] text-gray-400 px-2 py-0.5 rounded-full">#{tag}</span>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {onAddToCart && (
          <button
            onClick={e => { e.stopPropagation(); onAddToCart(product); }}
            className="btn-primary flex-1 py-2 text-sm flex items-center justify-center gap-2"
          >
            <ShoppingCart className="w-4 h-4" /> Buy Now
          </button>
        )}
        {onCreateCampaign && (
          <button
            onClick={e => { e.stopPropagation(); onCreateCampaign(product); }}
            className="btn-secondary flex-1 py-2 text-sm"
          >
            Campaign
          </button>
        )}
      </div>
    </div>
  );
}

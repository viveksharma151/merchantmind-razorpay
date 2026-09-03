'use client';
import { useEffect, useState } from 'react';
import { getAllProducts, searchCatalog } from '@/lib/api';
import { Product } from '@/lib/types';
import ProductCard from '@/components/ProductCard';
import { Package, Search, Loader2, Sparkles } from 'lucide-react';

export default function CatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState('');
  const [explanation, setExplanation] = useState('');
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [category, setCategory] = useState('All');

  useEffect(() => {
    getAllProducts()
      .then(d => {
        setProducts(d.products || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSearch = async () => {
    if (!query.trim()) {
      getAllProducts().then(d => setProducts(d.products || []));
      setExplanation('');
      return;
    }
    setSearching(true);
    try {
      const result = await searchCatalog(query);
      setProducts(result.products || []);
      setExplanation(result.explanation);
    } finally {
      setSearching(false);
    }
  };

  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];
  const filtered = category === 'All' ? products : products.filter(p => p.category === category);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <Package className="w-6 h-6 text-green-400" />
          <h1 className="text-2xl font-bold text-white">Agent-Readable Product Catalog</h1>
          <span className="badge text-green-400 bg-green-400/10 border-green-400/20">
            Semantic JSON Schema
          </span>
        </div>
        <p className="text-gray-400 text-sm">
          Inventory represented in machine-transactable formats for AI buyers and humans alike.
          Supports semantic reasoning search across {products.length} products.
        </p>
      </div>

      {/* Search Bar */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="Search in natural language: e.g. 'wireless earphones under ₹25,000' or 'fitness gear'..."
            className="input pl-10"
          />
        </div>
        <button
          onClick={handleSearch}
          disabled={searching}
          className="btn-primary flex items-center gap-2"
        >
          {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          AI Search
        </button>
      </div>

      {/* AI Explanation Banner */}
      {explanation && (
        <div className="card border-green-500/20 mb-6 flex items-start gap-3 bg-green-500/5">
          <Sparkles className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-gray-300 leading-relaxed">{explanation}</p>
        </div>
      )}

      {/* Category Pills */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
              category === cat
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'bg-[#1E1E2E] text-gray-400 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map(p => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-16 text-gray-500">
          <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No products found matching that query.</p>
        </div>
      )}
    </div>
  );
}

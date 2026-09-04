import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, SlidersHorizontal, ArrowUpDown, Sparkles, X, ShoppingBag } from 'lucide-react';
import ProductCard from '../../components/products/ProductCard';
import { ProductService, CategoryService } from '../../api/services';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [selectedUnit, setSelectedUnit] = useState('all');
  const [sortBy, setSortBy] = useState('-is_featured');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  // Load Categories
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const data = await CategoryService.getAll();
        setCategories(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCats();
  }, []);

  // Sync URL search params
  useEffect(() => {
    const searchUrl = searchParams.get('search');
    const catUrl = searchParams.get('category');
    if (searchUrl !== null) setSearch(searchUrl);
    if (catUrl !== null) setSelectedCategory(catUrl);
  }, [searchParams]);

  // Fetch Products based on filters
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const params = {};
        if (search.trim()) params.search = search.trim();
        if (selectedCategory && selectedCategory !== 'all') params.category = selectedCategory;
        if (minPrice) params.min_price = minPrice;
        if (maxPrice) params.max_price = maxPrice;
        if (sortBy) params.ordering = sortBy;

        const data = await ProductService.getAll(params);
        
        let filtered = data;
        if (selectedUnit === 'weight') {
          filtered = filtered.filter((p) => p.unit === 'kg' || p.unit === 'g');
        } else if (selectedUnit === 'piece') {
          filtered = filtered.filter((p) => p.unit === 'piece');
        } else if (selectedUnit === 'packet') {
          filtered = filtered.filter((p) => p.unit === 'packet' || p.unit === 'box' || p.unit === 'liter' || p.unit === 'bottle');
        }

        setProducts(filtered);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [search, selectedCategory, selectedUnit, sortBy, minPrice, maxPrice]);

  const handleCategoryClick = (slug) => {
    setSelectedCategory(slug);
    if (slug === 'all') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', slug);
    }
    setSearchParams(searchParams);
  };

  const handleResetFilters = () => {
    setSearch('');
    setSelectedCategory('all');
    setSelectedUnit('all');
    setSortBy('-is_featured');
    setMinPrice('');
    setMaxPrice('');
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* 1. Top Header Banner */}
      <div className="bg-gradient-to-r from-kirana-sand via-white to-kirana-sand p-6 sm:p-8 rounded-3xl border border-kirana-beige flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-black text-kirana-orange uppercase tracking-wider block">
            Fresh Indian Grocery Catalog
          </span>
          <h1 className="font-outfit font-black text-2xl sm:text-4xl text-kirana-brown-dark mt-1">
            Browse Groceries, Spices & Staples
          </h1>
          <p className="text-xs text-kirana-brown-light mt-1">
            Order dals, spices, dry fruits, snacks, and daily essentials in exact grams or packets.
          </p>
        </div>

        {/* Search Bar in Header */}
        <div className="w-full md:w-80 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-kirana-brown-muted" />
          <input
            type="text"
            placeholder="Search groceries..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-kirana-beige rounded-2xl py-2.5 pl-10 pr-9 text-xs text-kirana-brown-dark outline-none focus:border-kirana-orange shadow-inner"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-3 text-kirana-brown-muted hover:text-kirana-brown-dark"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Category Quick Horizontal Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        <button
          onClick={() => handleCategoryClick('all')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex-shrink-0 ${
            selectedCategory === 'all'
              ? 'bg-kirana-orange text-white shadow-md shadow-kirana-orange/20'
              : 'bg-white border border-kirana-beige text-kirana-brown-dark hover:bg-kirana-sand'
          }`}
        >
          All Groceries ({products.length})
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleCategoryClick(cat.slug)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex-shrink-0 ${
              selectedCategory === cat.slug
                ? 'bg-kirana-orange text-white shadow-md shadow-kirana-orange/20'
                : 'bg-white border border-kirana-beige text-kirana-brown-dark hover:bg-kirana-sand'
            }`}
          >
            {cat.name} {cat.hindi_name ? `(${cat.hindi_name})` : ''}
          </button>
        ))}
      </div>

      {/* 3. Secondary Controls: Unit Filter, Sort, Mobile Filter Button */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-kirana-beige shadow-sm text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-kirana-brown-dark hidden sm:inline">Unit Type:</span>
          <div className="flex bg-kirana-sand p-1 rounded-xl border border-kirana-beige flex-wrap gap-1">
            <button
              onClick={() => setSelectedUnit('all')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                selectedUnit === 'all' ? 'bg-white text-kirana-orange shadow-sm' : 'text-kirana-brown-light'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedUnit('weight')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                selectedUnit === 'weight' ? 'bg-white text-kirana-orange shadow-sm' : 'text-kirana-brown-light'
              }`}
            >
              By Weight (kg/g)
            </button>
            <button
              onClick={() => setSelectedUnit('piece')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                selectedUnit === 'piece' ? 'bg-white text-kirana-orange shadow-sm' : 'text-kirana-brown-light'
              }`}
            >
              By Piece
            </button>
            <button
              onClick={() => setSelectedUnit('packet')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                selectedUnit === 'packet' ? 'bg-white text-kirana-orange shadow-sm' : 'text-kirana-brown-light'
              }`}
            >
              By Packet
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <ArrowUpDown className="w-3.5 h-3.5 text-kirana-brown-muted" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-kirana-sand border border-kirana-beige rounded-xl py-1.5 px-3 text-xs font-bold text-kirana-brown-dark outline-none cursor-pointer"
            >
              <option value="-is_featured">Featured & Bestsellers</option>
              <option value="price">Price: Low to High</option>
              <option value="-price">Price: High to Low</option>
              <option value="name">Product Name: A to Z</option>
              <option value="-created_at">Newest Arrivals</option>
            </select>
          </div>

          {(search || selectedCategory !== 'all' || selectedUnit !== 'all' || minPrice || maxPrice) && (
            <button
              onClick={handleResetFilters}
              className="text-xs font-bold text-red-600 hover:underline flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" /> Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* 4. Products Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-3xl p-4 border border-kirana-beige animate-pulse space-y-3">
              <div className="w-full aspect-square bg-kirana-sand rounded-2xl"></div>
              <div className="h-4 bg-kirana-sand rounded w-3/4"></div>
              <div className="h-3 bg-kirana-sand rounded w-1/2"></div>
              <div className="h-8 bg-kirana-sand rounded-2xl w-full"></div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-kirana-beige text-center space-y-4 max-w-lg mx-auto">
          <div className="w-16 h-16 mx-auto rounded-full bg-kirana-sand flex items-center justify-center text-kirana-brown-muted">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h3 className="font-outfit font-bold text-xl text-kirana-brown-dark">
            No products found
          </h3>
          <p className="text-xs text-kirana-brown-light">
            We couldn't find any items matching your selected criteria. Try resetting filters or searching for another grocery keyword.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-6 py-2.5 bg-kirana-orange text-white text-xs font-bold rounded-2xl shadow-md"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

    </div>
  );
};

export default Products;

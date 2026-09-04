import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Grid, Sparkles, ArrowRight } from 'lucide-react';
import { CategoryService } from '../../api/services';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        setLoading(true);
        const data = await CategoryService.getAll();
        setCategories(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchCats();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-extrabold text-kirana-orange uppercase tracking-wider">
          Traditional Indian Grocery Sections
        </span>
        <h1 className="font-outfit font-black text-3xl sm:text-4xl text-kirana-brown-dark">
          All Grocery & Kirana Categories
        </h1>
        <p className="text-xs sm:text-sm text-kirana-brown-light leading-relaxed">
          From unpolished nutritious lentils to handpicked royal spices, explore all authentic sections available at Upendra General Stores.
        </p>
      </div>

      {/* Grid of Categories */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="bg-white rounded-3xl p-4 border border-kirana-beige animate-pulse h-48"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/products?category=${cat.slug}`}
              className="bg-white rounded-3xl border border-kirana-beige p-5 shadow-sm hover:shadow-kirana-lg hover:border-kirana-orange transition-all duration-300 group flex flex-col justify-between"
            >
              <div className="aspect-square rounded-2xl overflow-hidden bg-kirana-sand/40 mb-4 border border-kirana-beige">
                <img
                  src={cat.image || '/assets/images/spices.jpg'}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-outfit font-bold text-sm sm:text-base text-kirana-brown-dark group-hover:text-kirana-orange transition-colors">
                    {cat.name}
                  </h3>
                  <ArrowRight className="w-4 h-4 text-kirana-brown-muted group-hover:text-kirana-orange group-hover:translate-x-1 transition-all" />
                </div>
                {cat.hindi_name && (
                  <p className="text-xs font-hindi text-kirana-brown-light font-medium mt-0.5">
                    {cat.hindi_name}
                  </p>
                )}
                <p className="text-[11px] text-kirana-brown-muted line-clamp-2 mt-1.5 leading-relaxed">
                  {cat.description || 'Pure quality authentic Indian groceries.'}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}

    </div>
  );
};

export default Categories;

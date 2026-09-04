import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShoppingBag, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Truck, 
  HeartHandshake, 
  Star, 
  MapPin, 
  Phone, 
  Clock, 
  CheckCircle2, 
  Scale, 
  Flame, 
  ChevronRight,
  Store
} from 'lucide-react';
import ProductCard from '../../components/products/ProductCard';
import { ProductService, CategoryService } from '../../api/services';

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [catsData, prodsData] = await Promise.all([
          CategoryService.getAll(),
          ProductService.getAll({ featured: 'true' })
        ]);
        setCategories(catsData);
        setFeaturedProducts(prodsData.slice(0, 8));
      } catch (err) {
        console.error('Error loading homepage data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-12 sm:space-y-16 pb-12">
      
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-kirana-sand/90 via-kirana-cream to-white pt-6 pb-12 sm:pb-20 border-b border-kirana-beige/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-kirana-orange-soft to-amber-100/70 border border-kirana-orange-border px-3.5 py-1.5 rounded-full text-xs font-extrabold text-kirana-orange-dark shadow-sm">
                <Sparkles className="w-4 h-4 text-kirana-orange" />
                <span>UPENDRA GENERAL STORES • ESTABLISHED 1998</span>
              </div>

              <h1 className="font-outfit font-black text-3xl sm:text-5xl lg:text-6xl text-kirana-brown-dark tracking-tight leading-[1.1]">
                Your Trusted <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-kirana-orange via-amber-600 to-kirana-green">
                  Local Grocery Store
                </span>
              </h1>

              <p className="text-sm sm:text-base text-kirana-brown-light max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
                Fresh groceries, handpicked pulses, aromatic whole spices, crispy snacks, and daily essentials — all in one place. Choose exact custom quantities (100g, 250g, 1kg) with fast doorstep delivery.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                <Link
                  to="/products"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-kirana-orange to-kirana-orange-dark hover:from-kirana-orange-dark hover:to-kirana-orange text-white text-sm font-black tracking-wide shadow-lg shadow-kirana-orange/30 flex items-center justify-center gap-2 transition-all btn-press"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Shop Now</span>
                </Link>

                <Link
                  to="/categories"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-white hover:bg-kirana-sand text-kirana-brown-dark border-2 border-kirana-beige text-sm font-bold shadow-sm flex items-center justify-center gap-2 transition-all"
                >
                  <span>View Categories</span>
                  <ArrowRight className="w-4 h-4 text-kirana-orange" />
                </Link>
              </div>

              {/* Quick Trust Highlights */}
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-kirana-beige/80 max-w-lg mx-auto lg:mx-0 text-left">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-kirana-green flex-shrink-0" />
                  <span className="text-[11px] font-bold text-kirana-brown-dark leading-tight">100% Pure Dals & Spices</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-kirana-orange flex-shrink-0" />
                  <span className="text-[11px] font-bold text-kirana-brown-dark leading-tight">Custom Grams / Kg</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span className="text-[11px] font-bold text-kirana-brown-dark leading-tight">Cash on Delivery</span>
                </div>
              </div>
            </div>

            {/* Right Hero Image Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Decorative background glow */}
                <div className="absolute -inset-2 bg-gradient-to-r from-kirana-orange/30 to-kirana-green/20 rounded-3xl blur-2xl opacity-60"></div>

                <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white aspect-[3/2] bg-kirana-sand group">
                  <img
                    src="/assets/images/hero.jpg"
                    alt="Upendra General Stores - Real Shop Photo"
                    className="w-full h-full object-cover object-center group-hover:scale-102 transition-transform duration-700"
                    loading="eager"
                  />
                  {/* Subtle bottom badge that preserves full view of the store and owner */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent flex items-end justify-between p-4 sm:p-5 text-white pointer-events-none">
                    <div className="bg-black/40 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-white/20">
                      <span className="text-[11px] sm:text-xs font-bold font-outfit text-white flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span>Shop Counter & Storefront</span>
                      </span>
                    </div>
                    <span className="bg-kirana-orange text-white text-[10px] uppercase font-black px-2.5 py-1 rounded-xl shadow-sm">
                      Verified Store
                    </span>
                  </div>
                </div>


                {/* Floating Quick Feature Badge */}
                <div className="absolute -bottom-4 -left-4 sm:bottom-4 sm:-left-6 bg-white/95 backdrop-blur-md p-3 rounded-2xl shadow-kirana-lg border border-kirana-beige flex items-center gap-3 animate-float">
                  <div className="w-10 h-10 rounded-xl bg-kirana-green text-white flex items-center justify-center font-black">
                    <Scale className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-kirana-brown-dark block">Exact Grams Weighing</span>
                    <span className="text-[10px] text-kirana-brown-light">Order 50g, 100g, 250g or custom</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. Popular Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-3">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-kirana-orange uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" /> Explore Categories
            </div>
            <h2 className="font-outfit font-black text-2xl sm:text-3xl text-kirana-brown-dark">
              Shop by Grocery Category
            </h2>
          </div>
          <Link
            to="/categories"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-kirana-orange hover:text-kirana-orange-dark transition-colors"
          >
            <span>View All 8 Categories</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5 sm:gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/products?category=${cat.slug}`}
              className="bg-white rounded-2xl border border-kirana-beige/90 p-4 text-center shadow-sm hover:shadow-kirana hover:border-kirana-orange transition-all duration-300 group flex flex-col items-center justify-between"
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-kirana-sand/50 mb-3 border border-kirana-beige group-hover:scale-105 transition-transform shadow-inner">
                <img
                  src={cat.image || '/assets/images/spices.jpg'}
                  alt={cat.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="font-outfit font-bold text-xs sm:text-sm text-kirana-brown-dark group-hover:text-kirana-orange transition-colors">
                  {cat.name}
                </h3>
                {cat.hindi_name && (
                  <p className="text-[11px] text-kirana-brown-light font-hindi mt-0.5">
                    {cat.hindi_name}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Best Selling & Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-kirana-orange/10 via-amber-50 to-kirana-green/10 rounded-3xl p-6 sm:p-8 border border-kirana-beige">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-3">
            <div>
              <span className="bg-kirana-orange text-white text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full inline-block mb-1.5">
                Top Bestsellers
              </span>
              <h2 className="font-outfit font-black text-2xl sm:text-3xl text-kirana-brown-dark">
                Fresh & Quality Indian Essentials
              </h2>
              <p className="text-xs text-kirana-brown-light mt-1">
                Hand-cleaned dals, stone-ground masalas, whole spices, and pure desi cow ghee.
              </p>
            </div>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 bg-kirana-brown-dark hover:bg-kirana-orange text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-sm"
            >
              <span>Explore All Groceries</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {featuredProducts.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        </div>
      </section>

      {/* 4. Fresh Indian Spices & Dals Highlight Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-kirana-brown-dark via-kirana-brown to-kirana-green-dark text-white rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-kirana-orange to-transparent pointer-events-none"></div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            <div className="lg:col-span-7 space-y-4 text-center lg:text-left">
              <span className="inline-flex items-center gap-1.5 bg-kirana-orange/30 border border-kirana-orange/50 text-kirana-orange-light text-xs px-3.5 py-1 rounded-full font-bold">
                <Flame className="w-3.5 h-3.5" /> Authentic Taste of Home
              </span>
              <h2 className="font-outfit font-black text-2xl sm:text-4xl leading-tight">
                Pure Dals, Whole Jeera, <br />
                Golden Turmeric & Malabar Pepper
              </h2>
              <p className="text-xs sm:text-sm text-kirana-sand/80 leading-relaxed max-w-xl">
                We believe good food starts with honest ingredients. Our pulses are never chemically polished, and our spices retain their natural essential oils for authentic aroma and rich flavor.
              </p>
              <div className="pt-2 flex flex-wrap gap-4 justify-center lg:justify-start">
                <Link
                  to="/products?category=pulses-dal"
                  className="px-6 py-3 rounded-2xl bg-kirana-orange hover:bg-kirana-orange-dark text-white text-xs font-black tracking-wide shadow-md transition-all"
                >
                  Shop Pure Dals (दाल)
                </Link>
                <Link
                  to="/products?category=spices-masala"
                  className="px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/30 text-white text-xs font-bold transition-all"
                >
                  Shop Whole Spices (खड़े मसाले)
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 grid grid-cols-2 gap-3">
              <div className="rounded-2xl overflow-hidden border border-white/20 shadow-lg aspect-square">
                <img src="/assets/images/spices.jpg" alt="Spices" className="w-full h-full object-cover" />
              </div>
              <div className="rounded-2xl overflow-hidden border border-white/20 shadow-lg aspect-square">
                <img src="/assets/images/turmeric.jpg" alt="Turmeric" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Why Choose Upendra General Stores */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-extrabold text-kirana-orange uppercase tracking-wider">
            Local Kirana Advantage
          </span>
          <h2 className="font-outfit font-black text-2xl sm:text-3xl text-kirana-brown-dark mt-1">
            Why Customers Trust Upendra General Stores
          </h2>
          <p className="text-xs sm:text-sm text-kirana-brown-light mt-2">
            Combining the warmth and reliability of your local neighborhood shopkeeper with modern online ordering convenience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl p-6 border border-kirana-beige shadow-kirana text-center space-y-3 hover:-translate-y-1 transition-transform">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-kirana-orange-soft text-kirana-orange flex items-center justify-center">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h3 className="font-outfit font-bold text-base text-kirana-brown-dark">100% Unadulterated & Clean</h3>
            <p className="text-xs text-kirana-brown-light leading-relaxed">
              Every grain of dal and whole spice is hand-inspected for dirt, stones, and artificial polish. Pure, clean, and nutritious.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-kirana-beige shadow-kirana text-center space-y-3 hover:-translate-y-1 transition-transform">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-kirana-green-soft text-kirana-green flex items-center justify-center">
              <Scale className="w-7 h-7" />
            </div>
            <h3 className="font-outfit font-bold text-base text-kirana-brown-dark">Custom Quantities</h3>
            <p className="text-xs text-kirana-brown-light leading-relaxed">
              Don't buy rigid 1kg packets if you only need 100g or 250g. Order exact weights just like you ask at the kirana counter.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-kirana-beige shadow-kirana text-center space-y-3 hover:-translate-y-1 transition-transform">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <Truck className="w-7 h-7" />
            </div>
            <h3 className="font-outfit font-bold text-base text-kirana-brown-dark">30–45 Min Local Delivery</h3>
            <p className="text-xs text-kirana-brown-light leading-relaxed">
              Fast, friendly delivery straight to your door. Pay conveniently with Cash on Delivery or UPI upon arrival.
            </p>
          </div>
        </div>
      </section>

      {/* 6. How It Works */}
      <section className="bg-kirana-sand/60 py-12 border-y border-kirana-beige">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-10">
            <h2 className="font-outfit font-black text-2xl sm:text-3xl text-kirana-brown-dark">
              How Ordering Works
            </h2>
            <p className="text-xs text-kirana-brown-light mt-1">
              Simple 3-step grocery shopping designed for effortless local ordering.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-kirana-beige shadow-sm relative">
              <span className="w-8 h-8 rounded-full bg-kirana-orange text-white text-xs font-black flex items-center justify-center mb-3">
                1
              </span>
              <h3 className="font-outfit font-bold text-base text-kirana-brown-dark mb-1">
                Browse & Select Weight
              </h3>
              <p className="text-xs text-kirana-brown-light">
                Pick your items, choose pre-set quantities (100g, 250g, 1kg) or type your custom grams.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-kirana-beige shadow-sm relative">
              <span className="w-8 h-8 rounded-full bg-kirana-green text-white text-xs font-black flex items-center justify-center mb-3">
                2
              </span>
              <h3 className="font-outfit font-bold text-base text-kirana-brown-dark mb-1">
                Provide Delivery Address
              </h3>
              <p className="text-xs text-kirana-brown-light">
                Enter your house and street or click "Use Current Location" for instant address detection.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-kirana-beige shadow-sm relative">
              <span className="w-8 h-8 rounded-full bg-amber-600 text-white text-xs font-black flex items-center justify-center mb-3">
                3
              </span>
              <h3 className="font-outfit font-bold text-base text-kirana-brown-dark mb-1">
                Receive at Doorstep & Pay
              </h3>
              <p className="text-xs text-kirana-brown-light">
                We pack freshly and deliver in 30-45 mins. Pay cash or scan UPI at your doorstep.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Real Customer Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-xs font-extrabold text-kirana-orange uppercase tracking-wider">
            Community Love
          </span>
          <h2 className="font-outfit font-black text-2xl sm:text-3xl text-kirana-brown-dark mt-1">
            What Our Neighbors Say
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-kirana-beige shadow-kirana space-y-3">
            <div className="flex text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <p className="text-xs text-kirana-brown-light italic leading-relaxed">
              "Upendra Store is our family's go-to store for 15 years. Now ordering online with custom 250g spice options makes it so convenient. The Arhar Dal and Jeera quality is unmatched!"
            </p>
            <div className="pt-2 border-t border-kirana-sand">
              <h4 className="font-outfit font-bold text-xs text-kirana-brown-dark">Smt. Sunita Devi</h4>
              <span className="text-[10px] text-kirana-brown-muted">Resident, Shanti Nagar</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-kirana-beige shadow-kirana space-y-3">
            <div className="flex text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <p className="text-xs text-kirana-brown-light italic leading-relaxed">
              "Elderly-friendly interface and fast delivery. I can select 50g Kali Mirch and 500g Haldi without getting stuck with bulk sizes. Outstanding service!"
            </p>
            <div className="pt-2 border-t border-kirana-sand">
              <h4 className="font-outfit font-bold text-xs text-kirana-brown-dark">Pandit R. K. Mishra</h4>
              <span className="text-[10px] text-kirana-brown-muted">Resident, Hanuman Chowk</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-kirana-beige shadow-kirana space-y-3">
            <div className="flex text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <p className="text-xs text-kirana-brown-light italic leading-relaxed">
              "The desi ghee aroma and fresh namkeen snacks are so authentic. Delivered within 35 minutes directly to our door. Highly recommended to all local families!"
            </p>
            <div className="pt-2 border-t border-kirana-sand">
              <h4 className="font-outfit font-bold text-xs text-kirana-brown-dark">Anand Verma</h4>
              <span className="text-[10px] text-kirana-brown-muted">Resident, Main Bazaar</span>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Store Location & Timing Callout */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-kirana-sand rounded-3xl p-6 sm:p-8 border border-kirana-beige flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-kirana-orange text-white flex items-center justify-center font-black flex-shrink-0">
              <Store className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-outfit font-bold text-lg text-kirana-brown-dark">
                Visit Upendra General Stores In Person
              </h3>
              <p className="text-xs text-kirana-brown-light">
                Near Mahavir Chowk Ganguli, Benipatti • Open Daily 7 AM - 9:30 PM
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="tel:7295077559"
              className="px-5 py-2.5 rounded-xl bg-white hover:bg-kirana-sand border border-kirana-beige text-xs font-bold text-kirana-brown-dark flex items-center gap-1.5 transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-kirana-green" />
              <span>Call Store (7295077559)</span>
            </a>
            <Link
              to="/contact"
              className="px-5 py-2.5 rounded-xl bg-kirana-orange hover:bg-kirana-orange-dark text-white text-xs font-bold transition-all shadow-sm"
            >
              Get Directions →
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;

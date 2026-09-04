import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Store, 
  MapPin, 
  Phone, 
  Clock, 
  Mail, 
  ShieldCheck, 
  Truck, 
  HeartHandshake, 
  Sparkles,
  Award
} from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-kirana-brown-dark text-kirana-sand pt-12 pb-24 md:pb-12 border-t-4 border-kirana-orange">
      {/* 1. Value Proposition Pillars */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 border-b border-kirana-brown-light/30">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-kirana-orange/20 border border-kirana-orange/40 flex items-center justify-center text-kirana-orange flex-shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-outfit font-bold text-white text-sm">100% Pure Quality</h4>
              <p className="text-xs text-kirana-sand/70">Unpolished dals & genuine spices</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-kirana-green-light/20 border border-kirana-green-light/40 flex items-center justify-center text-emerald-400 flex-shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-outfit font-bold text-white text-sm">Fast Local Delivery</h4>
              <p className="text-xs text-kirana-sand/70">Free home delivery on ₹249+</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-kirana-mustard/20 border border-kirana-mustard/40 flex items-center justify-center text-kirana-mustard flex-shrink-0">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-outfit font-bold text-white text-sm">Custom Quantities</h4>
              <p className="text-xs text-kirana-sand/70">Order 100g, 250g or exact grams</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 flex-shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-outfit font-bold text-white text-sm">25+ Years of Trust</h4>
              <p className="text-xs text-kirana-sand/70">Serving local families with care</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Footer Links & Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          
          {/* Store Bio */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-kirana-orange flex items-center justify-center text-white font-black text-lg">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <span className="font-outfit font-black text-xl text-white tracking-tight">
                  UPENDRA GENERAL STORES
                </span>
                <span className="block text-xs text-kirana-sand/60">
                  Your Neighborhood Indian Kirana & Grocery Store
                </span>
              </div>
            </div>

            <p className="text-xs text-kirana-sand/80 leading-relaxed max-w-sm">
              We bring the authenticity and honesty of your traditional Indian neighborhood Kirana store directly to your fingertips. Handpicked pulses, freshly ground spices, pure desi ghee, and daily household essentials delivered with personal care.
            </p>

            <div className="pt-2">
              <span className="inline-flex items-center gap-2 bg-kirana-green/40 border border-kirana-green/60 text-emerald-300 text-xs px-3 py-1.5 rounded-full font-semibold">
                <Sparkles className="w-3.5 h-3.5" /> Direct Mandi Sourced • No Middlemen
              </span>
            </div>
          </div>

          {/* Quick Categories */}
          <div>
            <h4 className="font-outfit font-bold text-white text-sm uppercase tracking-wider mb-4 border-b border-kirana-orange/40 pb-1 inline-block">
              Popular Groceries
            </h4>
            <ul className="space-y-2 text-xs text-kirana-sand/80 font-medium">
              <li>
                <Link to="/products?category=pulses-dal" className="hover:text-kirana-orange transition-colors">
                  Pulses & Dal (दाल एवं दलहन)
                </Link>
              </li>
              <li>
                <Link to="/products?category=spices-masala" className="hover:text-kirana-orange transition-colors">
                  Spices & Masala (मसाले)
                </Link>
              </li>
              <li>
                <Link to="/products?category=dry-fruits" className="hover:text-kirana-orange transition-colors">
                  Dry Fruits (सूखे मेवे)
                </Link>
              </li>
              <li>
                <Link to="/products?category=namkeen-snacks" className="hover:text-kirana-orange transition-colors">
                  Namkeen & Snacks (नमकीन)
                </Link>
              </li>
              <li>
                <Link to="/products?category=rice-atta" className="hover:text-kirana-orange transition-colors">
                  Rice & Atta (चावल एवं आटा)
                </Link>
              </li>
              <li>
                <Link to="/products?category=oils-ghee" className="hover:text-kirana-orange transition-colors">
                  Oils & Desi Ghee (तेल एवं घी)
                </Link>
              </li>
              <li>
                <Link to="/products?category=daily-essentials" className="hover:text-kirana-orange transition-colors">
                  Daily Essentials (दैनिक उपयोग)
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-outfit font-bold text-white text-sm uppercase tracking-wider mb-4 border-b border-kirana-orange/40 pb-1 inline-block">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs text-kirana-sand/80 font-medium">
              <li>
                <Link to="/" className="hover:text-kirana-orange transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/products" className="hover:text-kirana-orange transition-colors">
                  All Groceries
                </Link>
              </li>
              <li>
                <Link to="/orders" className="hover:text-kirana-orange transition-colors">
                  My Orders & Live Status
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-kirana-orange transition-colors">
                  About Upendra Stores
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-kirana-orange transition-colors">
                  Contact & Store Timings
                </Link>
              </li>
              <li>
                <Link to="/signin" className="hover:text-kirana-orange transition-colors">
                  Customer Sign In
                </Link>
              </li>
              <li>
                <Link to="/admin-login" className="text-kirana-sand/40 hover:text-kirana-orange text-[11px] transition-colors">
                  Store Admin Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Store Location & Timings */}
          <div>
            <h4 className="font-outfit font-bold text-white text-sm uppercase tracking-wider mb-4 border-b border-kirana-orange/40 pb-1 inline-block">
              Store Timings & Address
            </h4>
            <div className="space-y-3 text-xs text-kirana-sand/80">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-kirana-orange flex-shrink-0 mt-0.5" />
                <span>Near Mahavir Chowk Ganguli, Benipatti</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-kirana-mustard flex-shrink-0" />
                <span>Open: <strong>7:00 AM – 9:30 PM</strong> (All 7 Days)</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Helpline: <a href="tel:7295077559" className="text-white hover:underline"><strong>7295077559</strong></a></span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-kirana-orange-light flex-shrink-0" />
                <span>care@upendrastores.com</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 3. Bottom Copyright & Credits */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 border-t border-kirana-brown-light/20 flex flex-col sm:flex-row items-center justify-between text-xs text-kirana-sand/60 gap-3">
        <p>© 2026 Upendra General Stores. All rights reserved. Made with love for Indian Kirana shoppers.</p>
        <div className="flex items-center space-x-4">
          <span>COD & Store Pickup Supported</span>
          <span>•</span>
          <span>Fast Doorstep Delivery</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

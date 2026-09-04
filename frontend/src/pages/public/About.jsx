import React from 'react';
import { Link } from 'react-router-dom';
import { Store, ShieldCheck, HeartHandshake, Scale, Award, Sparkles, MapPin, Clock, Phone } from 'lucide-react';

const About = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      
      {/* 1. Hero Section */}
      <div className="bg-gradient-to-br from-kirana-sand via-white to-kirana-sand p-8 sm:p-14 rounded-3xl border border-kirana-beige text-center space-y-4">
        <span className="inline-flex items-center gap-1.5 bg-kirana-orange/10 text-kirana-orange text-xs font-bold px-3.5 py-1 rounded-full border border-kirana-orange/20">
          <Sparkles className="w-3.5 h-3.5" /> 25+ Years of Neighborhood Trust
        </span>
        <h1 className="font-outfit font-black text-3xl sm:text-5xl text-kirana-brown-dark">
          The Story of Upendra General Stores
        </h1>
        <p className="text-sm sm:text-base text-kirana-brown-light max-w-2xl mx-auto leading-relaxed">
          Founded in 1998 with a simple commitment: providing honest, pure, and unadulterated groceries to our local neighborhood families with genuine care and fair prices.
        </p>
      </div>

      {/* 2. Story Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-6 space-y-5">
          <span className="text-xs font-extrabold text-kirana-orange uppercase tracking-wider">
            From Mandi to Your Kitchen
          </span>
          <h2 className="font-outfit font-black text-2xl sm:text-3xl text-kirana-brown-dark leading-tight">
            Keeping the Soul of the Indian Kirana Alive in the Modern Age
          </h2>
          <p className="text-xs sm:text-sm text-kirana-brown-light leading-relaxed">
            In an era of generic corporate supermarkets and artificial packaging, Upendra General Stores continues to believe that food should be natural and pure. We personally inspect our pulses, source royal whole spices from regional mandis, and grind our masalas with traditional low-heat methods to preserve rich essential aroma.
          </p>
          <p className="text-xs sm:text-sm text-kirana-brown-light leading-relaxed">
            Whether you need 100 grams of Jeera for today's lunch or a 5kg sack of unpolished Arhar Dal for the month, our digital store offers the exact same flexibility and personal touch that customers have enjoyed at our physical counter for over two decades.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="p-4 bg-kirana-sand/60 rounded-2xl border border-kirana-beige">
              <span className="font-outfit font-black text-2xl text-kirana-orange">1998</span>
              <p className="text-xs font-semibold text-kirana-brown-dark">Established in Local Bazaar</p>
            </div>
            <div className="p-4 bg-kirana-sand/60 rounded-2xl border border-kirana-beige">
              <span className="font-outfit font-black text-2xl text-kirana-green">5,000+</span>
              <p className="text-xs font-semibold text-kirana-brown-dark">Happy Local Families</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-6">
          <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white aspect-[3/2] bg-kirana-sand">
            <img
              src="/assets/images/hero.jpg"
              alt="Upendra General Stores counter"
              className="w-full h-full object-cover object-center"
            />
          </div>

        </div>
      </div>

      {/* 3. Core Pillars */}
      <div className="space-y-6">
        <div className="text-center max-w-xl mx-auto">
          <h2 className="font-outfit font-black text-2xl sm:text-3xl text-kirana-brown-dark">
            Our Four Sacred Guarantees
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-kirana-beige shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-kirana-orange-soft text-kirana-orange flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-outfit font-bold text-sm text-kirana-brown-dark">1. Zero Polish</h3>
            <p className="text-xs text-kirana-brown-light leading-relaxed">
              We never use water, oil, or chemical polish on our dals. What you get is 100% natural, protein-rich lentils.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-kirana-beige shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-kirana-green-soft text-kirana-green flex items-center justify-center">
              <Scale className="w-6 h-6" />
            </div>
            <h3 className="font-outfit font-bold text-sm text-kirana-brown-dark">2. Honest Weighing</h3>
            <p className="text-xs text-kirana-brown-light leading-relaxed">
              Certified electronic scales ensure exact gram-for-gram accuracy with every parcel we pack.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-kirana-beige shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="font-outfit font-bold text-sm text-kirana-brown-dark">3. Fair Mandi Prices</h3>
            <p className="text-xs text-kirana-brown-light leading-relaxed">
              No inflated distributor markups. Direct mandi pricing that saves you money on every weekly grocery purchase.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-kirana-beige shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-kirana-sand text-kirana-brown-dark flex items-center justify-center">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <h3 className="font-outfit font-bold text-sm text-kirana-brown-dark">4. Respect for Neighbors</h3>
            <p className="text-xs text-kirana-brown-light leading-relaxed">
              We treat our customers as family with easy replacement, cash on delivery, and helpful customer support.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default About;

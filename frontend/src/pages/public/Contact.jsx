import React, { useState } from 'react';
import { Store, MapPin, Phone, Clock, Mail, MessageSquare, Send, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    message: '',
    queryType: 'Order Inquiry',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      toast.error('Please enter your name and phone number');
      return;
    }
    setSubmitted(true);
    toast.success('Thank you! Upendra General Stores team will call you shortly.');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-extrabold text-kirana-orange uppercase tracking-wider">
          We Are Always Here For You
        </span>
        <h1 className="font-outfit font-black text-3xl sm:text-4xl text-kirana-brown-dark">
          Contact Upendra General Stores
        </h1>
        <p className="text-xs sm:text-sm text-kirana-brown-light">
          Have a question about specific spice origins, custom bulk orders, or your delivery? Reach out to us directly.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Contact Info & Timings */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-kirana-beige shadow-kirana space-y-6">
            
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-kirana-orange-soft text-kirana-orange flex items-center justify-center flex-shrink-0">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-outfit font-bold text-sm text-kirana-brown-dark">Physical Store Address</h3>
                <p className="text-xs text-kirana-brown-light mt-1 leading-relaxed">
                  Near Mahavir Chowk Ganguli, Benipatti
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-kirana-green-soft text-kirana-green flex items-center justify-center flex-shrink-0">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-outfit font-bold text-sm text-kirana-brown-dark">Store Timings</h3>
                <p className="text-xs text-kirana-brown-light mt-1">
                  <strong>Monday - Sunday:</strong> 7:00 AM – 9:30 PM <br />
                  <span className="text-kirana-green font-semibold">Open all 365 days of the year</span>
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center flex-shrink-0">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-outfit font-bold text-sm text-kirana-brown-dark">Phone & WhatsApp Support</h3>
                <p className="text-xs text-kirana-brown-light mt-1">
                  Helpline: <strong className="text-kirana-brown-dark">7295077559</strong><br />
                  WhatsApp: <strong className="text-kirana-brown-dark">7295077559</strong>
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-kirana-sand text-kirana-brown-dark flex items-center justify-center flex-shrink-0">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-outfit font-bold text-sm text-kirana-brown-dark">Email Inquiries</h3>
                <p className="text-xs text-kirana-brown-light mt-1">
                  orders@upendrastores.com
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-kirana-sand">
              <a
                href="https://wa.me/917295077559?text=Namaste%20Upendra%20Store,%20I%20want%20to%20order%20groceries"
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Chat on WhatsApp (7295077559)</span>
              </a>
            </div>

          </div>
        </div>

        {/* Right: Message Form */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-kirana-beige shadow-kirana">
            <h2 className="font-outfit font-black text-xl text-kirana-brown-dark mb-1">
              Send a Message or Request Custom Item
            </h2>
            <p className="text-xs text-kirana-brown-light mb-6">
              If an item you need is not listed, write to us and we'll arrange it for your delivery.
            </p>

            {submitted ? (
              <div className="py-12 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                <h3 className="font-outfit font-bold text-lg text-kirana-brown-dark">Message Sent!</h3>
                <p className="text-xs text-kirana-brown-light max-w-sm mx-auto">
                  Our shopkeeper has received your inquiry and will call you back on your mobile number shortly.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-6 py-2 bg-kirana-sand text-kirana-brown-dark text-xs font-bold rounded-xl"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-kirana-brown-dark uppercase tracking-wider mb-1.5">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Sharma"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-kirana-sand/40 focus:bg-white border border-kirana-beige focus:border-kirana-orange rounded-2xl py-2.5 px-4 text-xs text-kirana-brown-dark outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-kirana-brown-dark uppercase tracking-wider mb-1.5">
                      Mobile Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 9876543210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-kirana-sand/40 focus:bg-white border border-kirana-beige focus:border-kirana-orange rounded-2xl py-2.5 px-4 text-xs text-kirana-brown-dark outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-kirana-brown-dark uppercase tracking-wider mb-1.5">
                      Query Type
                    </label>
                    <select
                      value={formData.queryType}
                      onChange={(e) => setFormData({ ...formData, queryType: e.target.value })}
                      className="w-full bg-kirana-sand/40 focus:bg-white border border-kirana-beige focus:border-kirana-orange rounded-2xl py-2.5 px-4 text-xs text-kirana-brown-dark outline-none transition-all"
                    >
                      <option value="Order Inquiry">Order Inquiry</option>
                      <option value="Custom Item Request">Custom Item Request (Not in catalog)</option>
                      <option value="Bulk Wedding / Festival Order">Bulk Wedding / Festival Order</option>
                      <option value="Delivery Issue">Delivery Issue</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-kirana-brown-dark uppercase tracking-wider mb-1.5">
                    Your Message / Items List
                  </label>
                  <textarea
                    rows="4"
                    placeholder="Tell us what you need..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-kirana-sand/40 focus:bg-white border border-kirana-beige focus:border-kirana-orange rounded-2xl py-2.5 px-4 text-xs text-kirana-brown-dark outline-none transition-all resize-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-kirana-orange to-kirana-orange-dark hover:from-kirana-orange-dark hover:to-kirana-orange text-white text-xs font-black tracking-wide shadow-md shadow-kirana-orange/30 flex items-center justify-center gap-2 transition-all btn-press"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Message to Store</span>
                </button>
              </form>
            )}

          </div>
        </div>

      </div>

    </div>
  );
};

export default Contact;

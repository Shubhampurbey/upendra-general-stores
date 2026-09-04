import React, { useState, useEffect } from 'react';
import { Users, Search, Phone, Mail, MapPin, ShoppingBag } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { AdminService } from '../../api/services';
import toast from 'react-hot-toast';

const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchCusts = async () => {
      try {
        setLoading(true);
        const data = await AdminService.getCustomers();
        setCustomers(data);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load customers');
      } finally {
        setLoading(false);
      }
    };
    fetchCusts();
  }, []);

  const filtered = customers.filter(
    (c) =>
      c.full_name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      (c.mobile && c.mobile.includes(search))
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-outfit font-black text-2xl text-kirana-brown-dark">
              Neighborhood Customer Directory
            </h1>
            <p className="text-xs text-kirana-brown-light">
              View registered local buyers, spending metrics, and contact information
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-3 text-kirana-brown-muted" />
            <input
              type="text"
              placeholder="Search by name, email, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-kirana-beige rounded-2xl py-2 pl-9 pr-4 text-xs outline-none focus:border-kirana-orange shadow-sm"
            />
          </div>
        </div>

        {/* Customers Table */}
        <div className="bg-white rounded-3xl border border-kirana-beige shadow-kirana overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-kirana-sand/60 text-kirana-brown-dark uppercase text-[10px] font-extrabold tracking-wider border-b border-kirana-beige">
                <tr>
                  <th className="py-3.5 px-4">Customer Name</th>
                  <th className="py-3.5 px-4">Contact Info</th>
                  <th className="py-3.5 px-4">Delivery Address</th>
                  <th className="py-3.5 px-4 text-center">Orders Placed</th>
                  <th className="py-3.5 px-4 text-right">Lifetime Spend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-kirana-sand">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="py-12 text-center text-kirana-brown-muted">
                      Loading customer records...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-12 text-center text-kirana-brown-muted">
                      No matching customer accounts found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((cust) => (
                    <tr key={cust.id} className="hover:bg-kirana-sand/30 transition-colors">
                      <td className="py-3 px-4 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-kirana-orange text-white flex items-center justify-center font-bold text-xs">
                          {cust.full_name ? cust.full_name[0].toUpperCase() : 'U'}
                        </div>
                        <div>
                          <h4 className="font-bold text-kirana-brown-dark">{cust.full_name}</h4>
                          <span className="text-[10px] text-kirana-brown-muted block">
                            Joined {new Date(cust.created_at).toLocaleDateString('en-IN')}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4 space-y-0.5">
                        <p className="text-kirana-brown-dark font-medium flex items-center gap-1.5">
                          <Phone className="w-3 h-3 text-kirana-orange" /> {cust.mobile || 'N/A'}
                        </p>
                        <p className="text-[11px] text-kirana-brown-muted flex items-center gap-1.5">
                          <Mail className="w-3 h-3 text-kirana-brown-muted" /> {cust.email}
                        </p>
                      </td>

                      <td className="py-3 px-4 text-kirana-brown-light max-w-xs truncate">
                        {cust.address ? `${cust.address}, ${cust.city || ''}` : 'No address saved'}
                      </td>

                      <td className="py-3 px-4 text-center font-bold text-kirana-brown-dark">
                        <span className="bg-kirana-sand px-2.5 py-1 rounded-full border border-kirana-beige">
                          {cust.order_count} orders
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right font-outfit font-black text-sm text-kirana-green">
                        ₹{cust.total_spent || '0.00'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
};

export default AdminCustomers;

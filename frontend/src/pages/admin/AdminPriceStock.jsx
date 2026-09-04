import React, { useState, useEffect } from 'react';
import { DollarSign, Save, Search, Check, AlertTriangle, Sparkles } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { ProductService, AdminService } from '../../api/services';
import { getProductImageUrl } from '../../utils/imageUrl';
import toast from 'react-hot-toast';

const AdminPriceStock = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [savingId, setSavingId] = useState(null);

  // Local modified values map: { [prodId]: { price, stock_quantity, is_available } }
  const [edits, setEdits] = useState({});

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await ProductService.getAll();
      setProducts(data);
      const initialEdits = {};
      data.forEach((p) => {
        initialEdits[p.id] = {
          price: p.price,
          stock_quantity: p.stock_quantity,
          is_available: p.is_available,
        };
      });
      setEdits(initialEdits);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleFieldChange = (prodId, field, value) => {
    setEdits((prev) => ({
      ...prev,
      [prodId]: {
        ...prev[prodId],
        [field]: value,
      },
    }));
  };

  const handleSaveRow = async (prodId, prodName) => {
    const editData = edits[prodId];
    if (!editData) return;

    try {
      setSavingId(prodId);
      await AdminService.quickUpdateProduct(prodId, editData);
      toast.success(`Updated ${prodName} price/stock!`);
      fetchProducts();
    } catch (err) {
      toast.error('Failed to update price');
    } finally {
      setSavingId(null);
    }
  };

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) || (p.hindi_name && p.hindi_name.includes(search))
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-outfit font-black text-2xl text-kirana-brown-dark">
              Quick Price & Inventory Editor
            </h1>
            <p className="text-xs text-kirana-brown-light">
              Rapidly update daily mandi selling prices and available stock in real-time. Changes appear on customer site immediately.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-3 text-kirana-brown-muted" />
            <input
              type="text"
              placeholder="Filter by product name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-kirana-beige rounded-2xl py-2 pl-9 pr-4 text-xs outline-none focus:border-kirana-orange shadow-sm"
            />
          </div>
        </div>

        {/* Quick Edit Table */}
        <div className="bg-white rounded-3xl border border-kirana-beige shadow-kirana overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-kirana-sand/60 text-kirana-brown-dark uppercase text-[10px] font-extrabold tracking-wider border-b border-kirana-beige">
                <tr>
                  <th className="py-3.5 px-4">Grocery Item</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4 w-44">Price (₹ per unit)</th>
                  <th className="py-3.5 px-4 w-44">Available Stock</th>
                  <th className="py-3.5 px-4">Ordering Status</th>
                  <th className="py-3.5 px-4 text-right">Quick Save</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-kirana-sand">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-kirana-brown-muted">
                      Loading inventory items...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-kirana-brown-muted">
                      No matching products found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((prod) => {
                    const rowEdit = edits[prod.id] || {};
                    const isModified =
                      rowEdit.price !== prod.price ||
                      rowEdit.stock_quantity !== prod.stock_quantity ||
                      rowEdit.is_available !== prod.is_available;
                    const isSaving = savingId === prod.id;

                    return (
                      <tr key={prod.id} className={`hover:bg-kirana-sand/30 transition-colors ${isModified ? 'bg-amber-50/40' : ''}`}>
                        <td className="py-3 px-4 flex items-center gap-3">
                          <img
                            src={getProductImageUrl(prod.image)}
                            alt={prod.name}
                            className="w-10 h-10 object-cover rounded-xl border border-kirana-beige flex-shrink-0"
                            onError={(e) => {
                              e.target.src = '/assets/images/spices.jpg';
                            }}
                          />
                          <div>
                            <h4 className="font-bold text-kirana-brown-dark">{prod.name}</h4>
                            {prod.hindi_name && (
                              <span className="text-[11px] font-hindi text-kirana-brown-light font-medium block">
                                {prod.hindi_name}
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-3 px-4 text-kirana-brown-light font-semibold">
                          {prod.category_name}
                        </td>

                        {/* Price In-place input */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5 bg-kirana-sand/60 border border-kirana-beige rounded-xl p-1 w-36">
                            <span className="text-xs font-bold text-kirana-green pl-2">₹</span>
                            <input
                              type="number"
                              step="0.01"
                              value={rowEdit.price !== undefined ? rowEdit.price : prod.price}
                              onChange={(e) => handleFieldChange(prod.id, 'price', e.target.value)}
                              className="w-full bg-transparent font-outfit font-black text-xs text-kirana-brown-dark outline-none"
                            />
                            <span className="text-[10px] text-kirana-brown-muted pr-2 font-bold whitespace-nowrap">
                              /{prod.unit}
                            </span>
                          </div>
                        </td>

                        {/* Stock In-place input */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5 bg-kirana-sand/60 border border-kirana-beige rounded-xl p-1 w-36">
                            <input
                              type="number"
                              step="0.1"
                              value={rowEdit.stock_quantity !== undefined ? rowEdit.stock_quantity : prod.stock_quantity}
                              onChange={(e) => handleFieldChange(prod.id, 'stock_quantity', e.target.value)}
                              className="w-full bg-transparent font-bold text-xs text-kirana-brown-dark outline-none pl-2"
                            />
                            <span className="text-[10px] text-kirana-brown-muted pr-2 font-bold whitespace-nowrap">
                              {prod.unit}
                            </span>
                          </div>
                        </td>

                        {/* Status Toggle */}
                        <td className="py-3 px-4">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={rowEdit.is_available !== undefined ? rowEdit.is_available : prod.is_available}
                              onChange={(e) => handleFieldChange(prod.id, 'is_available', e.target.checked)}
                              className="rounded text-kirana-orange"
                            />
                            <span className="text-[11px] font-bold text-kirana-brown-dark">
                              {(rowEdit.is_available !== undefined ? rowEdit.is_available : prod.is_available) ? 'Active' : 'Hidden'}
                            </span>
                          </label>
                        </td>

                        {/* Save Button */}
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleSaveRow(prod.id, prod.name)}
                            disabled={!isModified || isSaving}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ml-auto ${
                              isModified
                                ? 'bg-kirana-orange hover:bg-kirana-orange-dark text-white shadow-sm'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            }`}
                          >
                            <Save className="w-3.5 h-3.5" />
                            <span>{isSaving ? 'Saving...' : 'Save'}</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
};

export default AdminPriceStock;

import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  X, 
  Check, 
  Upload, 
  Sparkles, 
  Image as ImageIcon,
  RotateCcw,
  AlertCircle
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { ProductService, CategoryService } from '../../api/services';
import { getProductImageUrl } from '../../utils/imageUrl';
import toast from 'react-hot-toast';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    hindi_name: '',
    category: '',
    description: '',
    price: '',
    unit: 'kg',
    min_weight_grams: 100,
    stock_quantity: 50,
    is_available: true,
    is_featured: false,
    badge: '',
  });

  // Image upload state
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('/assets/images/spices.jpg');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const [prodsData, catsData] = await Promise.all([
        ProductService.getAll(),
        CategoryService.getAll(),
      ]);
      setProducts(prodsData);
      setCategories(catsData);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setSelectedImageFile(null);
    setImagePreview('/assets/images/spices.jpg');
    setFormData({
      name: '',
      hindi_name: '',
      category: categories[0]?.id || '',
      description: '',
      price: '',
      unit: 'kg',
      min_weight_grams: 100,
      stock_quantity: 50,
      is_available: true,
      is_featured: false,
      badge: '',
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (prod) => {
    setEditingProduct(prod);
    setSelectedImageFile(null);
    setImagePreview(prod.image || '/assets/images/spices.jpg');
    setFormData({
      name: prod.name,
      hindi_name: prod.hindi_name || '',
      category: prod.category,
      description: prod.description || '',
      price: prod.price,
      unit: prod.unit,
      min_weight_grams: prod.min_weight_grams || 100,
      stock_quantity: prod.stock_quantity,
      is_available: prod.is_available,
      is_featured: prod.is_featured,
      badge: prod.badge || '',
    });
    setModalOpen(true);
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 1. Validate file format (JPG, JPEG, PNG, WEBP)
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    const validExtensions = /\.(jpg|jpeg|png|webp)$/i;
    if (!validTypes.includes(file.type) && !validExtensions.test(file.name)) {
      toast.error('Please select a valid image file (JPG, JPEG, PNG, or WEBP).');
      return;
    }

    // 2. Validate file size (Max 5MB)
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_SIZE) {
      toast.error('Image size must be less than 5MB.');
      return;
    }

    setSelectedImageFile(file);
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
    toast.success(`Image selected: ${file.name}`);
  };

  const handleResetImage = () => {
    setSelectedImageFile(null);
    setImagePreview(editingProduct?.image || '/assets/images/spices.jpg');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.category) {
      toast.error('Please enter product name, price, and category');
      return;
    }

    // Build standard FormData for multipart submission
    const productFormData = new FormData();
    productFormData.append('name', formData.name.trim());
    if (formData.hindi_name) {
      productFormData.append('hindi_name', formData.hindi_name.trim());
    }
    productFormData.append('category', formData.category);
    if (formData.description) {
      productFormData.append('description', formData.description.trim());
    }
    productFormData.append('price', formData.price);
    productFormData.append('unit', formData.unit);
    productFormData.append('min_weight_grams', formData.min_weight_grams || 100);
    productFormData.append('stock_quantity', formData.stock_quantity || 0);
    productFormData.append('is_available', formData.is_available);
    productFormData.append('is_featured', formData.is_featured);
    if (formData.badge) {
      productFormData.append('badge', formData.badge.trim());
    }

    // Attach image file only if a new file was selected
    if (selectedImageFile) {
      productFormData.append('image', selectedImageFile);
    }

    try {
      setIsSubmitting(true);
      if (editingProduct) {
        await ProductService.update(editingProduct.id, productFormData);
        toast.success(`Updated ${formData.name} successfully!`);
      } else {
        await ProductService.create(productFormData);
        toast.success(`Added new product: ${formData.name} successfully!`);
      }
      setModalOpen(false);
      fetchProducts();
    } catch (err) {
      console.error('Save product error:', err);
      const errMsg = err.response?.data?.detail || 
                     (Array.isArray(err.response?.data?.image) ? err.response?.data?.image[0] : null) || 
                     'Error saving product. Please check form fields.';
      toast.error(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}" from store catalog?`)) {
      try {
        await ProductService.delete(id);
        toast.success(`Deleted ${name}`);
        fetchProducts();
      } catch (err) {
        toast.error('Failed to delete product');
      }
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                        (p.hindi_name && p.hindi_name.includes(search));
    const matchCat = selectedCat === 'all' || 
                     p.category?.toString() === selectedCat || 
                     p.category_name === selectedCat;
    return matchSearch && matchCat;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-outfit font-black text-2xl text-kirana-brown-dark">
              Store Product Management
            </h1>
            <p className="text-xs text-kirana-brown-light">
              Add, edit prices, stock quantities and manage grocery catalog with high-resolution images
            </p>
          </div>

          <button
            onClick={handleOpenAddModal}
            className="px-5 py-2.5 rounded-2xl bg-kirana-orange hover:bg-kirana-orange-dark text-white text-xs font-bold shadow-md shadow-kirana-orange/20 flex items-center gap-2 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-kirana-beige shadow-sm">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-3 text-kirana-brown-muted" />
            <input
              type="text"
              placeholder="Search products by name or Hindi name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-kirana-sand/40 border border-kirana-beige rounded-xl py-2 pl-9 pr-4 text-xs text-kirana-brown-dark outline-none focus:border-kirana-orange"
            />
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="font-bold text-kirana-brown-muted">Category:</span>
            <select
              value={selectedCat}
              onChange={(e) => setSelectedCat(e.target.value)}
              className="bg-kirana-sand border border-kirana-beige rounded-xl py-1.5 px-3 font-bold text-kirana-brown-dark outline-none cursor-pointer"
            >
              <option value="all">All Categories ({products.length})</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-3xl border border-kirana-beige shadow-kirana overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-kirana-sand/60 text-kirana-brown-dark uppercase text-[10px] font-extrabold tracking-wider border-b border-kirana-beige">
                <tr>
                  <th className="py-3.5 px-4">Item</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Selling Price</th>
                  <th className="py-3.5 px-4">Stock Level</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-kirana-sand">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-kirana-brown-muted">
                      Loading products...
                    </td>
                  </tr>
                ) : filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-kirana-brown-muted">
                      No products found. Click "Add New Product" above to create one.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((prod) => (
                    <tr key={prod.id} className="hover:bg-kirana-sand/30 transition-colors">
                      <td className="py-3 px-4 flex items-center gap-3">
                        <img
                          src={getProductImageUrl(prod.image)}
                          alt={prod.name}
                          className="w-12 h-12 object-cover rounded-xl border border-kirana-beige flex-shrink-0 shadow-sm"
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

                      <td className="py-3 px-4 font-semibold text-kirana-brown-light">
                        {prod.category_name}
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-outfit font-bold text-sm text-kirana-green">
                          ₹{prod.price}
                        </span>
                        <span className="text-[10px] text-kirana-brown-muted block">
                          /{prod.unit}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-bold text-kirana-brown-dark">
                        {prod.stock_quantity} {prod.unit}
                      </td>

                      <td className="py-3 px-4">
                        <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                          prod.is_available ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {prod.is_available ? 'Available' : 'Out of Stock'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEditModal(prod)}
                          className="p-1.5 rounded-lg bg-kirana-sand hover:bg-kirana-beige text-kirana-brown-dark transition-colors"
                          title="Edit Product"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(prod.id, prod.name)}
                          className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add / Edit Product Modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-kirana-brown-dark/70 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-kirana-beige overflow-hidden max-h-[90vh] flex flex-col">
              
              <div className="p-5 bg-gradient-to-r from-kirana-sand to-white border-b border-kirana-beige flex items-center justify-between">
                <h3 className="font-outfit font-black text-lg text-kirana-brown-dark">
                  {editingProduct ? `Edit Product: ${editingProduct.name}` : 'Add New Grocery Item'}
                </h3>
                <button 
                  onClick={() => setModalOpen(false)} 
                  className="p-1.5 rounded-full hover:bg-kirana-sand text-kirana-brown-muted transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-kirana-brown-dark uppercase tracking-wider mb-1">
                      Product Name (English) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Royal Jeera Seeds"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-kirana-sand/40 focus:bg-white border border-kirana-beige rounded-xl py-2 px-3 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-kirana-brown-dark uppercase tracking-wider mb-1">
                      Hindi Name (हिंदी नाम)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. शाही साबुत जीरा"
                      value={formData.hindi_name}
                      onChange={(e) => setFormData({ ...formData, hindi_name: e.target.value })}
                      className="w-full bg-kirana-sand/40 focus:bg-white border border-kirana-beige rounded-xl py-2 px-3 outline-none font-hindi"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-kirana-brown-dark uppercase tracking-wider mb-1">
                      Category *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full bg-kirana-sand/40 border border-kirana-beige rounded-xl py-2 px-3 outline-none font-bold"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-kirana-brown-dark uppercase tracking-wider mb-1">
                      Selling Price (₹) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="e.g. 400"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full bg-kirana-sand/40 focus:bg-white border border-kirana-beige rounded-xl py-2 px-3 outline-none font-bold text-kirana-green"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-bold text-kirana-brown-dark uppercase tracking-wider mb-1">
                      Base Unit *
                    </label>
                    <select
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      className="w-full bg-kirana-sand/40 border border-kirana-beige rounded-xl py-2 px-3 outline-none font-bold"
                    >
                      <option value="kg">kg (Kilogram)</option>
                      <option value="g">g (Gram)</option>
                      <option value="packet">packet (Packet)</option>
                      <option value="piece">piece (Piece)</option>
                      <option value="box">box (Box)</option>
                      <option value="liter">liter (Liter)</option>
                      <option value="bottle">bottle (Bottle)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-kirana-brown-dark uppercase tracking-wider mb-1">
                      Stock Level *
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      placeholder="e.g. 50"
                      value={formData.stock_quantity}
                      onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                      className="w-full bg-kirana-sand/40 border border-kirana-beige rounded-xl py-2 px-3 outline-none font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-kirana-brown-dark uppercase tracking-wider mb-1">
                      Product Badge
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Bestseller, Fresh"
                      value={formData.badge}
                      onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                      className="w-full bg-kirana-sand/40 border border-kirana-beige rounded-xl py-2 px-3 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-kirana-brown-dark uppercase tracking-wider mb-1">
                    Description
                  </label>
                  <textarea
                    rows="3"
                    placeholder="Product details, origins, freshness notes..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-kirana-sand/40 border border-kirana-beige rounded-xl py-2 px-3 outline-none"
                  ></textarea>
                </div>

                {/* Product Image Upload Section */}
                <div className="space-y-3 pt-2 border-t border-kirana-sand">
                  <div className="flex items-center justify-between">
                    <label className="block font-bold text-kirana-brown-dark uppercase tracking-wider">
                      Product Image (JPG, PNG, WEBP • Max 5MB)
                    </label>
                    {selectedImageFile && (
                      <span className="text-[10px] text-kirana-green font-bold bg-kirana-green-soft px-2.5 py-0.5 rounded-full">
                        Selected: {selectedImageFile.name} ({(selectedImageFile.size / 1024).toFixed(0)} KB)
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-4 bg-kirana-sand/40 p-4 rounded-2xl border border-kirana-beige">
                    {/* Live Preview Thumbnail */}
                    <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-white border-2 border-kirana-beige flex-shrink-0 shadow-inner">
                      <img
                        src={getProductImageUrl(imagePreview)}
                        alt="Product Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = '/assets/images/spices.jpg';
                        }}
                      />
                    </div>

                    {/* Image Action Buttons */}
                    <div className="flex-1 space-y-2 text-center sm:text-left">
                      <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                        <label className="px-4 py-2 bg-kirana-orange hover:bg-kirana-orange-dark text-white rounded-xl cursor-pointer font-bold flex items-center gap-1.5 text-xs shadow-sm transition-all">
                          <Upload className="w-3.5 h-3.5" />
                          <span>{selectedImageFile ? 'Choose Different Image' : 'Upload Product Image'}</span>
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={handleImageFileChange}
                            className="hidden"
                          />
                        </label>

                        {selectedImageFile && (
                          <button
                            type="button"
                            onClick={handleResetImage}
                            className="px-3 py-2 bg-white hover:bg-red-50 text-red-600 border border-red-200 rounded-xl font-bold text-xs flex items-center gap-1 transition-colors"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Reset</span>
                          </button>
                        )}
                      </div>

                      <p className="text-[11px] text-kirana-brown-muted">
                        Select an image file from your computer (e.g. <code>arhar dal.jpg</code>, <code>moong dal.png</code>, <code>black pepper.webp</code>).
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6 pt-3 border-t border-kirana-sand">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-kirana-brown-dark">
                    <input
                      type="checkbox"
                      checked={formData.is_available}
                      onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                      className="rounded text-kirana-orange"
                    />
                    <span>Available for Ordering</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer font-bold text-kirana-brown-dark">
                    <input
                      type="checkbox"
                      checked={formData.is_featured}
                      onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                      className="rounded text-kirana-orange"
                    />
                    <span>Show in Featured Section</span>
                  </label>
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl border border-kirana-beige hover:bg-kirana-sand font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 rounded-xl bg-kirana-orange hover:bg-kirana-orange-dark text-white font-bold shadow-md disabled:opacity-50 flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <span>Saving Product...</span>
                    ) : (
                      <span>{editingProduct ? 'Save Product Changes' : 'Create Product'}</span>
                    )}
                  </button>
                </div>
              </form>

            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
};

export default AdminProducts;

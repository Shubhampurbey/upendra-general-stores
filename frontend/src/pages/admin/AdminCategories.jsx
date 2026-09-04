import React, { useState, useEffect } from 'react';
import { Grid, Plus, Edit3, Trash2, X, Check, ArrowRight } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { CategoryService } from '../../api/services';
import toast from 'react-hot-toast';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    hindi_name: '',
    slug: '',
    description: '',
    image: '/assets/images/spices.jpg',
    display_order: 0,
    is_active: true,
  });

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await CategoryService.getAll();
      setCategories(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenAdd = () => {
    setEditingCat(null);
    setFormData({
      name: '',
      hindi_name: '',
      slug: '',
      description: '',
      image: '/assets/images/spices.jpg',
      display_order: categories.length + 1,
      is_active: true,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (cat) => {
    setEditingCat(cat);
    setFormData({
      name: cat.name,
      hindi_name: cat.hindi_name || '',
      slug: cat.slug,
      description: cat.description || '',
      image: cat.image || '/assets/images/spices.jpg',
      display_order: cat.display_order || 0,
      is_active: cat.is_active,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error('Please enter category name');
      return;
    }

    try {
      if (editingCat) {
        await CategoryService.update(editingCat.id, formData);
        toast.success(`Updated ${formData.name}`);
      } else {
        await CategoryService.create(formData);
        toast.success(`Created category: ${formData.name}`);
      }
      setModalOpen(false);
      fetchCategories();
    } catch (err) {
      toast.error('Failed to save category');
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Delete category "${name}"? Products inside may be affected.`)) {
      try {
        await CategoryService.delete(id);
        toast.success(`Deleted category ${name}`);
        fetchCategories();
      } catch (err) {
        toast.error('Failed to delete category');
      }
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-outfit font-black text-2xl text-kirana-brown-dark">
              Category Management
            </h1>
            <p className="text-xs text-kirana-brown-light">
              Add and manage Indian grocery & kirana department categories
            </p>
          </div>

          <button
            onClick={handleOpenAdd}
            className="px-5 py-2.5 rounded-2xl bg-kirana-orange hover:bg-kirana-orange-dark text-white text-xs font-bold shadow-md flex items-center gap-2 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Category</span>
          </button>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {loading ? (
            <p className="text-xs text-kirana-brown-muted col-span-4 text-center py-12">Loading categories...</p>
          ) : (
            categories.map((cat) => (
              <div
                key={cat.id}
                className="bg-white rounded-3xl p-5 border border-kirana-beige shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="aspect-video rounded-2xl overflow-hidden bg-kirana-sand/40 border border-kirana-beige">
                    <img
                      src={cat.image || '/assets/images/spices.jpg'}
                      alt={cat.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-outfit font-bold text-base text-kirana-brown-dark">{cat.name}</h3>
                    {cat.hindi_name && (
                      <p className="text-xs font-hindi text-kirana-brown-light font-medium">{cat.hindi_name}</p>
                    )}
                    <span className="inline-block text-[10px] font-bold text-kirana-orange bg-kirana-orange/10 px-2 py-0.5 rounded mt-1">
                      Slug: {cat.slug}
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-kirana-sand flex items-center justify-between mt-3">
                  <span className="text-xs font-bold text-kirana-green">
                    Order: {cat.display_order}
                  </span>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => handleOpenEdit(cat)}
                      className="p-1.5 rounded-lg bg-kirana-sand hover:bg-kirana-beige text-kirana-brown-dark"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id, cat.name)}
                      className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add/Edit Modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-kirana-brown-dark/70 backdrop-blur-sm">
            <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-kirana-beige overflow-hidden">
              <div className="p-5 bg-gradient-to-r from-kirana-sand to-white border-b border-kirana-beige flex items-center justify-between">
                <h3 className="font-outfit font-black text-lg text-kirana-brown-dark">
                  {editingCat ? `Edit Category: ${editingCat.name}` : 'Add New Category'}
                </h3>
                <button onClick={() => setModalOpen(false)} className="p-1.5 rounded-full hover:bg-kirana-sand">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-kirana-brown-dark uppercase mb-1">
                    Category Name (English) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dry Fruits"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-kirana-sand/40 border border-kirana-beige rounded-xl py-2 px-3 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-kirana-brown-dark uppercase mb-1">
                    Hindi Name (हिंदी नाम)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. सूखे मेवे"
                    value={formData.hindi_name}
                    onChange={(e) => setFormData({ ...formData, hindi_name: e.target.value })}
                    className="w-full bg-kirana-sand/40 border border-kirana-beige rounded-xl py-2 px-3 outline-none font-hindi"
                  />
                </div>

                <div>
                  <label className="block font-bold text-kirana-brown-dark uppercase mb-1">
                    Image URL or Path
                  </label>
                  <input
                    type="text"
                    placeholder="/assets/images/dry_fruits.jpg"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="w-full bg-kirana-sand/40 border border-kirana-beige rounded-xl py-2 px-3 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-kirana-brown-dark uppercase mb-1">
                    Description
                  </label>
                  <textarea
                    rows="2"
                    placeholder="Category details..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-kirana-sand/40 border border-kirana-beige rounded-xl py-2 px-3 outline-none"
                  ></textarea>
                </div>

                <div className="flex justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-5 py-2 rounded-xl border border-kirana-beige"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-xl bg-kirana-orange text-white font-bold"
                  >
                    Save Category
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

export default AdminCategories;

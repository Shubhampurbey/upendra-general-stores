import React, { useState, useRef, useEffect } from 'react';
import { 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  ShieldCheck, 
  PackageCheck, 
  Save, 
  Camera, 
  Trash2, 
  Upload, 
  X, 
  Check, 
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getUserAvatarUrl } from '../../utils/imageUrl';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateUserProfile } = useAuth();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    mobile: user?.mobile || '',
    address: user?.address || '',
    village_area: user?.village_area || '',
    city: user?.city || '',
    pincode: user?.pincode || '',
  });

  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [removingPhoto, setRemovingPhoto] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        mobile: user.mobile || '',
        address: user.address || '',
        village_area: user.village_area || '',
        city: user.city || '',
        pincode: user.pincode || '',
      });
    }
  }, [user]);

  // Clean up object URL when component unmounts or preview changes
  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleImageFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 1. Format validation (JPG, JPEG, PNG, WEBP)
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    const validExtensions = /\.(jpg|jpeg|png|webp)$/i;
    if (!validTypes.includes(file.type) && !validExtensions.test(file.name)) {
      toast.error('Please select a valid image file (JPG, JPEG, PNG, or WEBP).');
      return;
    }

    // 2. Size validation (Max 5MB)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      toast.error('Profile image size must be less than 5MB.');
      return;
    }

    setSelectedImageFile(file);
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
    toast.success('Photo preview ready. Click "Save Photo" to apply.');
  };

  const handleCancelPreview = () => {
    if (imagePreview && imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }
    setSelectedImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSavePhotoOnly = async () => {
    if (!selectedImageFile) return;

    const data = new FormData();
    data.append('profile_image', selectedImageFile);

    try {
      setUploadingPhoto(true);
      await updateUserProfile(data);
      setSelectedImageFile(null);
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      toast.success('Profile photo updated successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to upload profile photo. Please try again.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleRemovePhoto = async () => {
    if (!window.confirm('Are you sure you want to remove your profile photo?')) {
      return;
    }

    const data = new FormData();
    data.append('remove_profile_image', 'true');

    try {
      setRemovingPhoto(true);
      await updateUserProfile(data);
      setSelectedImageFile(null);
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      toast.success('Profile photo removed.');
    } catch (err) {
      console.error(err);
      toast.error('Failed to remove profile photo.');
    } finally {
      setRemovingPhoto(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // If an image was selected, send as multipart FormData
    if (selectedImageFile) {
      const data = new FormData();
      data.append('full_name', formData.full_name);
      data.append('mobile', formData.mobile);
      data.append('address', formData.address);
      data.append('village_area', formData.village_area);
      data.append('city', formData.city);
      data.append('pincode', formData.pincode);
      data.append('profile_image', selectedImageFile);

      try {
        setSaving(true);
        await updateUserProfile(data);
        setSelectedImageFile(null);
        setImagePreview(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } catch (err) {
        console.error(err);
      } finally {
        setSaving(false);
      }
    } else {
      // Standard JSON update
      try {
        setSaving(true);
        await updateUserProfile(formData);
      } catch (err) {
        console.error(err);
      } finally {
        setSaving(false);
      }
    }
  };

  const currentAvatarUrl = imagePreview || getUserAvatarUrl(user?.profile_image);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div>
        <span className="text-xs font-black text-kirana-orange uppercase tracking-wider">
          Account Settings
        </span>
        <h1 className="font-outfit font-black text-2xl sm:text-3xl text-kirana-brown-dark mt-1">
          My Customer Profile
        </h1>
        <p className="text-xs text-kirana-brown-light mt-1">
          Manage your personal details, delivery addresses, and profile photo.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Left: Avatar & Badges */}
        <div className="md:col-span-4 bg-white p-6 rounded-3xl border border-kirana-beige shadow-kirana text-center space-y-5">
          
          {/* Circular Interactive Avatar */}
          <div className="relative inline-block mx-auto group">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="w-28 h-28 rounded-full overflow-hidden bg-gradient-to-tr from-kirana-orange via-amber-500 to-kirana-green text-white flex items-center justify-center font-black text-3xl shadow-lg border-4 border-white cursor-pointer relative transition-transform duration-300 group-hover:scale-105"
              title="Click to change profile photo"
            >
              {currentAvatarUrl ? (
                <img 
                  src={currentAvatarUrl} 
                  alt={user?.full_name || 'Profile Avatar'} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback to initial if image fails to load
                    e.target.style.display = 'none';
                  }}
                />
              ) : (
                <span className="select-none">{user?.full_name ? user.full_name[0].toUpperCase() : 'U'}</span>
              )}

              {/* Hover overlay with Camera icon */}
              <div className="absolute inset-0 bg-black/45 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[11px] font-bold p-1">
                <Camera className="w-6 h-6 mb-1 text-kirana-sand" />
                <span>Change Photo</span>
              </div>
            </div>

            {/* Quick Upload Floating Camera Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-1 right-1 bg-kirana-orange hover:bg-kirana-orange-dark text-white p-2 rounded-full shadow-md border-2 border-white transition-all transform hover:scale-110"
              title="Upload New Photo"
              aria-label="Upload New Photo"
            >
              <Camera className="w-4 h-4" />
            </button>

            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/jpeg,image/png,image/webp,image/jpg"
              onChange={handleImageFileSelect}
              className="hidden"
            />
          </div>

          {/* Pending Photo Preview Actions */}
          {selectedImageFile && (
            <div className="bg-kirana-sand/60 p-3 rounded-2xl border border-kirana-beige space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between text-[11px] font-bold text-kirana-brown-dark">
                <span className="truncate max-w-[140px]">{selectedImageFile.name}</span>
                <span className="text-kirana-green font-semibold">New Preview</span>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSavePhotoOnly}
                  disabled={uploadingPhoto}
                  className="flex-1 py-1.5 px-3 bg-kirana-orange hover:bg-kirana-orange-dark text-white text-xs font-bold rounded-xl shadow-sm transition-colors flex items-center justify-center gap-1.5"
                >
                  {uploadingPhoto ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                  <span>{uploadingPhoto ? 'Saving...' : 'Save Photo'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleCancelPreview}
                  className="py-1.5 px-2.5 bg-white hover:bg-gray-100 text-kirana-brown-muted hover:text-kirana-brown-dark text-xs font-bold rounded-xl border border-kirana-beige transition-colors"
                  title="Cancel preview"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Photo Management Actions (Upload / Remove) */}
          <div className="flex items-center justify-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs font-bold text-kirana-orange hover:text-kirana-orange-dark flex items-center gap-1.5 py-1 px-3 rounded-xl hover:bg-kirana-orange/10 transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{user?.profile_image ? 'Replace Photo' : 'Upload Photo'}</span>
            </button>

            {user?.profile_image && !selectedImageFile && (
              <button
                type="button"
                onClick={handleRemovePhoto}
                disabled={removingPhoto}
                className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1 py-1 px-3 rounded-xl hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{removingPhoto ? 'Removing...' : 'Remove'}</span>
              </button>
            )}
          </div>

          <div>
            <h3 className="font-outfit font-bold text-lg text-kirana-brown-dark">
              {user?.full_name}
            </h3>
            <p className="text-xs text-kirana-brown-muted">{user?.email}</p>
            <span className="inline-block mt-2 text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full">
              {user?.role === 'admin' ? '★ Store Admin' : 'Verified Customer'}
            </span>
          </div>

          <div className="pt-4 border-t border-kirana-sand text-left space-y-2 text-xs text-kirana-brown-light">
            <p className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-kirana-orange" />
              <span>{user?.mobile || 'No phone added'}</span>
            </p>
            <p className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-kirana-green" />
              <span>{user?.city || 'Local Area'}</span>
            </p>
          </div>
        </div>

        {/* Right: Update Info Form */}
        <div className="md:col-span-8 bg-white p-6 sm:p-8 rounded-3xl border border-kirana-beige shadow-kirana space-y-6">
          <h3 className="font-outfit font-bold text-lg text-kirana-brown-dark border-b border-kirana-sand pb-3">
            Edit Personal & Delivery Details
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-kirana-brown-dark uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full bg-kirana-sand/40 focus:bg-white border border-kirana-beige focus:border-kirana-orange rounded-2xl py-2.5 px-4 text-xs text-kirana-brown-dark outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-kirana-brown-dark uppercase tracking-wider mb-1.5">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  className="w-full bg-kirana-sand/40 focus:bg-white border border-kirana-beige focus:border-kirana-orange rounded-2xl py-2.5 px-4 text-xs text-kirana-brown-dark outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-kirana-brown-dark uppercase tracking-wider mb-1.5">
                Default House / Street Address
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full bg-kirana-sand/40 focus:bg-white border border-kirana-beige focus:border-kirana-orange rounded-2xl py-2.5 px-4 text-xs text-kirana-brown-dark outline-none"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-kirana-brown-dark uppercase tracking-wider mb-1.5">
                  Village / Area
                </label>
                <input
                  type="text"
                  value={formData.village_area}
                  onChange={(e) => setFormData({ ...formData, village_area: e.target.value })}
                  className="w-full bg-kirana-sand/40 focus:bg-white border border-kirana-beige rounded-2xl py-2.5 px-3 text-xs text-kirana-brown-dark outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-kirana-brown-dark uppercase tracking-wider mb-1.5">
                  City
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full bg-kirana-sand/40 focus:bg-white border border-kirana-beige rounded-2xl py-2.5 px-3 text-xs text-kirana-brown-dark outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-kirana-brown-dark uppercase tracking-wider mb-1.5">
                  PIN Code
                </label>
                <input
                  type="text"
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  className="w-full bg-kirana-sand/40 focus:bg-white border border-kirana-beige rounded-2xl py-2.5 px-3 text-xs text-kirana-brown-dark outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="py-3 px-6 rounded-2xl bg-kirana-green hover:bg-kirana-green-dark text-white text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{saving ? 'Saving Changes...' : 'Save Profile Changes'}</span>
            </button>
          </form>
        </div>

      </div>

    </div>
  );
};

export default Profile;

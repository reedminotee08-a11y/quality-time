import React, { useState, useRef, useCallback } from 'react';
import { 
  Upload, 
  X, 
  Plus, 
  Trash2, 
  ImageIcon, 
  AlertCircle, 
  CheckCircle2,
  Sparkles,
  Package,
  Tag,
  DollarSign,
  FileText,
  Box
} from 'lucide-react';
import Button from './Button';
import ProductService from '../services/ProductService';
import { Product } from '../types';

interface ModernProductFormProps {
  onClose: () => void;
  onSuccess: () => void;
  editingProduct?: Product | null;
}

interface FormData {
  name: string;
  brand: string;
  price: string;
  old_price: string;
  description: string;
  stock_quantity: string;
  category: string;
  images: string[];
  specs: Record<string, string>;
}

const ModernProductForm: React.FC<ModernProductFormProps> = ({ 
  onClose, 
  onSuccess, 
  editingProduct 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState(1);
  const [dragActive, setDragActive] = useState(false);
  
  const [formData, setFormData] = useState<FormData>({
    name: editingProduct?.name || '',
    brand: editingProduct?.brand || '',
    price: editingProduct?.price?.toString() || '',
    old_price: editingProduct?.old_price?.toString() || '',
    description: editingProduct?.description || '',
    stock_quantity: editingProduct?.stock_quantity?.toString() || '10',
    category: editingProduct?.category || '',
    images: editingProduct?.images ? [...editingProduct.images] : [],
    specs: editingProduct?.specs ? { ...editingProduct.specs } : {}
  });

  const [newSpecKey, setNewSpecKey] = useState('');
  const [newSpecValue, setNewSpecValue] = useState('');

  const categories = [
    'ساعات رجالية',
    'ساعات نسائية',
    'ساعات ذكية',
    'ساعات كلاسيكية',
    'ساعات رياضية'
  ];

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!formData.name.trim()) newErrors.name = 'اسم المنتج مطلوب';
        if (!formData.brand.trim()) newErrors.brand = 'الماركة مطلوبة';
        if (!formData.category.trim()) newErrors.category = 'الفئة مطلوبة';
        break;
      case 2:
        if (!formData.price || parseFloat(formData.price) <= 0) newErrors.price = 'السعر يجب أن يكون أكبر من صفر';
        if (formData.old_price && parseFloat(formData.old_price) <= 0) newErrors.old_price = 'السعر القديم يجب أن يكون أكبر من صفر';
        if (!formData.stock_quantity || parseInt(formData.stock_quantity) < 0) newErrors.stock_quantity = 'المخزون لا يمكن أن يكون سالباً';
        break;
      case 3:
        if (formData.images.length === 0) newErrors.images = 'يجب رفع صورة واحدة على الأقل';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleDrag = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFilesUpload(files);
    }
  }, []);

  const handleFilesUpload = async (files: FileList | File[]) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    setUploading(true);

    for (const file of Array.from(files)) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, images: 'حجم الصورة يجب أن يكون أقل من 5MB' }));
        continue;
      }
      if (!validTypes.includes(file.type)) {
        setErrors(prev => ({ ...prev, images: 'يرجى رفع صورة بصيغة JPEG, PNG أو WebP' }));
        continue;
      }

      try {
        const imageUrl = await ProductService.uploadProductImage(file);
        setFormData(prev => ({ ...prev, images: [...prev.images, imageUrl] }));
        setErrors(prev => ({ ...prev, images: '' }));
      } catch (error: any) {
        setErrors(prev => ({ ...prev, images: error.message || 'فشل في رفع الصورة' }));
      }
    }

    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleImageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) handleFilesUpload(e.target.files);
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const addSpec = () => {
    if (newSpecKey.trim() && newSpecValue.trim()) {
      setFormData(prev => ({
        ...prev,
        specs: { ...prev.specs, [newSpecKey.trim()]: newSpecValue.trim() }
      }));
      setNewSpecKey('');
      setNewSpecValue('');
    }
  };

  const removeSpec = (key: string) => {
    setFormData(prev => {
      const newSpecs = { ...prev.specs };
      delete newSpecs[key];
      return { ...prev, specs: newSpecs };
    });
  };

  const nextStep = () => {
    if (validateStep(currentStep)) setCurrentStep(prev => Math.min(prev + 1, 4));
  };

  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(currentStep)) return;

    setSaving(true);
    try {
      const productData = {
        name: formData.name.trim(),
        brand: formData.brand.trim(),
        price: parseFloat(formData.price),
        old_price: formData.old_price ? parseFloat(formData.old_price) : null,
        description: formData.description.trim(),
        stock_quantity: parseInt(formData.stock_quantity),
        category: formData.category.trim(),
        images: formData.images,
        specs: formData.specs,
        is_active: true
      };

      if (editingProduct) await ProductService.updateProduct(editingProduct.id, productData);
      else await ProductService.createProduct(productData);

      onSuccess();
      onClose();
    } catch (error: any) {
      setErrors(prev => ({ ...prev, submit: error.message || 'فشل في حفظ المنتج' }));
    } finally {
      setSaving(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">اسم المنتج *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="أدخل اسم المنتج"
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">الماركة *</label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="أدخل اسم الماركة"
              />
              {errors.brand && <p className="text-red-500 text-sm mt-1">{errors.brand}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">الفئة *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">اختر الفئة</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">السعر *</label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="أدخل السعر"
              />
              {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">السعر القديم</label>
              <input
                type="number"
                step="0.01"
                value={formData.old_price}
                onChange={(e) => setFormData(prev => ({ ...prev, old_price: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="أدخل السعر القديم (اختياري)"
              />
              {errors.old_price && <p className="text-red-500 text-sm mt-1">{errors.old_price}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">الكمية في المخزون *</label>
              <input
                type="number"
                value={formData.stock_quantity}
                onChange={(e) => setFormData(prev => ({ ...prev, stock_quantity: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="أدخل الكمية"
              />
              {errors.stock_quantity && <p className="text-red-500 text-sm mt-1">{errors.stock_quantity}</p>}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">صور المنتج *</label>
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageInputChange}
                  className="hidden"
                />
                
                <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-600 mb-2">اسحب الصور هنا أو</p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? 'جاري الرفع...' : 'اختر الصور'}
                </Button>
              </div>
              
              {errors.images && <p className="text-red-500 text-sm mt-1">{errors.images}</p>}
              
              {formData.images.length > 0 && (
                <div className="grid grid-cols-4 gap-4 mt-4">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image}
                        alt={`Product image ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">وصف المنتج</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={4}
                placeholder="أدخل وصف المنتج"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">المواصفات</label>
              <div className="space-y-2">
                {Object.entries(formData.specs).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2">
                    <span className="font-medium">{key}:</span>
                    <span>{value}</span>
                    <button
                      type="button"
                      onClick={() => removeSpec(key)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSpecKey}
                    onChange={(e) => setNewSpecKey(e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="المواصفة"
                  />
                  <input
                    type="text"
                    value={newSpecValue}
                    onChange={(e) => setNewSpecValue(e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="القيمة"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addSpec}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">
          {editingProduct ? 'تعديل المنتج' : 'إضافة منتج جديد'}
        </h2>
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center justify-center mb-8">
        {[1, 2, 3, 4].map((step) => (
          <div key={step} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= step
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {step}
            </div>
            {step < 4 && (
              <div
                className={`w-16 h-1 mx-2 ${
                  currentStep > step ? 'bg-blue-500' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {renderStepContent()}

      {errors.submit && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-red-600">{errors.submit}</p>
        </div>
      )}

      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 1}
        >
          السابق
        </Button>
        
        {currentStep === 4 ? (
          <Button
            type="submit"
            disabled={saving}
          >
            {saving ? 'جاري الحفظ...' : (editingProduct ? 'تحديث المنتج' : 'إضافة المنتج')}
          </Button>
        ) : (
          <Button
            type="button"
            onClick={nextStep}
          >
            التالي
          </Button>
        )}
      </div>
    </form>
  );
};

export default ModernProductForm;

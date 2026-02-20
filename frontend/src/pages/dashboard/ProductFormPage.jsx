import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMerchantProduct, useCreateProduct, useUpdateProduct, useBulkUpdateVariants } from '../../hooks/useMerchantProducts.js';
import { useMerchantCategories } from '../../hooks/useMerchantCategories.js';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import { PageLoading } from '../../components/ui/Loading.jsx';
import { uploadImage, deleteImage, createVariantsForProduct } from '../../services/merchantProductService.js';

/**
 * Product form page for creating and editing products
 */
export default function ProductFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const { data: product, isLoading: productLoading } = useMerchantProduct(id);
  const { data: categoriesData } = useMerchantCategories({ includeInactive: true });
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const bulkUpdateVariants = useBulkUpdateVariants();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    basePrice: '',
    categoryId: '',
    lowStockThreshold: '5',
    tags: '',
    seoTitle: '',
    seoDescription: '',
  });
  const [images, setImages] = useState([]);
  const [optionTypes, setOptionTypes] = useState([]);
  const [variants, setVariants] = useState([{ sku: '', price: '', inventory: '0', optionValues: {} }]);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);

  // Load product data in edit mode
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        basePrice: product.basePrice ? (product.basePrice / 100).toString() : '',
        categoryId: product.category?.id || '',
        lowStockThreshold: product.lowStockThreshold?.toString() || '5',
        tags: product.tags?.join(', ') || '',
        seoTitle: product.seoTitle || '',
        seoDescription: product.seoDescription || '',
      });
      setImages(product.images || []);
      if (product.optionTypes?.length > 0) {
        setOptionTypes(
          product.optionTypes.map((ot) => ({
            name: ot.name,
            values: ot.values.join(', '),
          }))
        );
      }
      if (product.variants?.length > 0) {
        setVariants(
          product.variants.map((v) => {
            const ov = {};
            (v.optionValues || []).forEach((o) => { ov[o.name] = o.value; });
            return {
              id: v.id,
              sku: v.sku || '',
              price: v.price ? (v.price / 100).toString() : '',
              inventory: v.inventory?.toString() || '0',
              optionValues: ov,
            };
          })
        );
      }
    }
  }, [product]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // --- Option Types handlers ---
  const addOptionType = () => {
    setOptionTypes((prev) => [...prev, { name: '', values: '' }]);
  };

  const removeOptionType = (index) => {
    const removed = optionTypes[index];
    setOptionTypes((prev) => prev.filter((_, i) => i !== index));
    // Clean removed option from variant optionValues
    if (removed.name) {
      setVariants((prev) =>
        prev.map((v) => {
          const ov = { ...v.optionValues };
          delete ov[removed.name];
          return { ...v, optionValues: ov };
        })
      );
    }
  };

  const handleOptionTypeChange = (index, field, value) => {
    setOptionTypes((prev) => {
      const updated = [...prev];
      const old = updated[index];
      updated[index] = { ...old, [field]: value };

      // If renaming, update variant optionValues keys
      if (field === 'name' && old.name && old.name !== value) {
        setVariants((prevV) =>
          prevV.map((v) => {
            const ov = { ...v.optionValues };
            if (old.name in ov) {
              ov[value] = ov[old.name];
              delete ov[old.name];
            }
            return { ...v, optionValues: ov };
          })
        );
      }
      return updated;
    });
  };

  // --- Variant handlers ---
  const handleVariantChange = (index, field, value) => {
    setVariants((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleVariantOptionValue = (variantIndex, optionName, value) => {
    setVariants((prev) => {
      const updated = [...prev];
      updated[variantIndex] = {
        ...updated[variantIndex],
        optionValues: { ...updated[variantIndex].optionValues, [optionName]: value },
      };
      return updated;
    });
  };

  const addVariant = () => {
    setVariants((prev) => [...prev, { sku: '', price: '', inventory: '0', optionValues: {} }]);
  };

  /**
   * Generate all variant combinations from current option types.
   * For example, Size (S, M) + Color (Red, Blue) -> 4 variants.
   */
  const generateVariantCombinations = () => {
    if (parsedOptionTypes.length === 0) return;

    // Build cartesian product of all option values
    const combinations = parsedOptionTypes.reduce((acc, optionType) => {
      if (acc.length === 0) {
        return optionType.values.map((val) => [{ name: optionType.name, value: val }]);
      }
      const result = [];
      acc.forEach((combo) => {
        optionType.values.forEach((val) => {
          result.push([...combo, { name: optionType.name, value: val }]);
        });
      });
      return result;
    }, []);

    // Convert to variant objects, preserving any existing variants that match
    const newVariants = combinations.map((combo) => {
      const optionValues = {};
      combo.forEach(({ name, value }) => { optionValues[name] = value; });

      // Check if an existing variant already matches this combination
      const existing = variants.find((v) =>
        combo.every(({ name, value }) => v.optionValues?.[name] === value)
      );

      if (existing) return existing;

      // Auto-generate SKU from option values (e.g., "S-RED")
      const skuParts = combo.map(({ value }) =>
        value.toUpperCase().replace(/\s+/g, '-').slice(0, 10)
      );
      const autoSku = skuParts.join('-');

      return { sku: autoSku, price: '', inventory: '0', optionValues };
    });

    setVariants(newVariants);
  };

  const removeVariant = (index) => {
    if (variants.length > 1) {
      setVariants((prev) => prev.filter((_, i) => i !== index));
    }
  };

  // --- Image handlers ---
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    try {
      for (const file of files) {
        const result = await uploadImage(file);
        setImages((prev) => [...prev, { url: result.url, publicId: result.publicId }]);
      }
    } catch (error) {
      console.error('Failed to upload image:', error);
      setSubmitError('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleImageRemove = async (index) => {
    const image = images[index];
    try {
      if (image.publicId) {
        await deleteImage(image.publicId);
      }
      setImages((prev) => prev.filter((_, i) => i !== index));
    } catch (error) {
      console.error('Failed to delete image:', error);
      setImages((prev) => prev.filter((_, i) => i !== index));
    }
  };

  // --- Parse option types from form state ---
  const parsedOptionTypes = optionTypes
    .filter((ot) => ot.name.trim())
    .map((ot) => ({
      name: ot.name.trim(),
      values: ot.values.split(',').map((v) => v.trim()).filter(Boolean),
    }))
    .filter((ot) => ot.values.length > 0);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!formData.basePrice || parseFloat(formData.basePrice) <= 0) {
      newErrors.basePrice = 'Valid price is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const productData = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      basePrice: Math.round(parseFloat(formData.basePrice) * 100),
      categoryId: formData.categoryId || null,
      lowStockThreshold: parseInt(formData.lowStockThreshold, 10) || 5,
      tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
      seoTitle: formData.seoTitle.trim() || undefined,
      seoDescription: formData.seoDescription.trim() || undefined,
      images: images.map((img, index) => ({
        url: img.url,
        publicId: img.publicId,
        sortOrder: index,
      })),
      optionTypes: parsedOptionTypes,
    };

    // Build variant option values array from the form's { name: value } map
    const buildOptionValues = (ov) =>
      Object.entries(ov || {})
        .filter(([, val]) => val)
        .map(([name, value]) => ({ name, value }));

    // Include variants for new products
    if (!isEditMode) {
      productData.variants = variants
        .filter((v) => v.sku.trim())
        .map((v) => ({
          sku: v.sku.trim().toUpperCase(),
          price: v.price ? Math.round(parseFloat(v.price) * 100) : undefined,
          inventory: parseInt(v.inventory, 10) || 0,
          optionValues: buildOptionValues(v.optionValues),
        }));
    }

    setSubmitError(null);

    try {
      if (isEditMode) {
        await updateProduct.mutateAsync({ productId: id, data: productData });

        // Also update variants via bulk update
        const existingVariants = variants.filter((v) => v.id);
        if (existingVariants.length > 0) {
          await bulkUpdateVariants.mutateAsync({
            productId: id,
            variants: existingVariants.map((v) => ({
              id: v.id,
              sku: v.sku.trim().toUpperCase(),
              price: v.price ? Math.round(parseFloat(v.price) * 100) : null,
              inventory: parseInt(v.inventory, 10) || 0,
              optionValues: buildOptionValues(v.optionValues),
            })),
          });
        }

        // Create new variants (ones without an id)
        const newVariants = variants.filter((v) => !v.id && v.sku.trim());
        if (newVariants.length > 0) {
          await createVariantsForProduct(id, newVariants.map((v) => ({
            sku: v.sku.trim().toUpperCase(),
            price: v.price ? Math.round(parseFloat(v.price) * 100) : undefined,
            inventory: parseInt(v.inventory, 10) || 0,
            optionValues: buildOptionValues(v.optionValues),
          })));
        }
      } else {
        await createProduct.mutateAsync(productData);
      }
      navigate('/dashboard/products');
    } catch (error) {
      console.error('Failed to save product:', error);
      setSubmitError(error.response?.data?.message || 'Failed to save product. Please try again.');
    }
  };

  if (productLoading) {
    return <PageLoading />;
  }

  const categories = categoriesData?.categories || [];
  const isSaving = createProduct.isPending || updateProduct.isPending || bulkUpdateVariants.isPending;

  return (
    <div className="max-w-4xl">
      <h1 className="font-display text-2xl font-bold text-surface-900 mb-6">
        {isEditMode ? 'Edit Product' : 'Add Product'}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white rounded-xl shadow-soft p-6">
          <h2 className="font-display text-lg font-semibold text-surface-900 mb-4">Basic Information</h2>
          <div className="space-y-4">
            <Input
              label="Product Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              error={errors.name}
              required
            />
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className={`w-full px-3 py-2 border-2 rounded-xl focus:ring-2 focus:ring-surface-900 focus:border-transparent ${
                  errors.description ? 'border-red-500' : 'border-surface-200'
                }`}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-500">{errors.description}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Base Price ($)"
                name="basePrice"
                type="number"
                step="0.01"
                min="0"
                value={formData.basePrice}
                onChange={handleInputChange}
                error={errors.basePrice}
                required
              />
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">Category</label>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-surface-200 rounded-xl text-surface-900 focus:border-surface-900 focus:outline-none transition-colors"
                >
                  <option value="">No Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <Input
              label="Low Stock Threshold"
              name="lowStockThreshold"
              type="number"
              min="0"
              value={formData.lowStockThreshold}
              onChange={handleInputChange}
            />
            <Input
              label="Tags (comma-separated)"
              name="tags"
              value={formData.tags}
              onChange={handleInputChange}
              placeholder="tag1, tag2, tag3"
            />
          </div>
        </div>

        {/* Images */}
        <div className="bg-white rounded-xl shadow-soft p-6">
          <h2 className="font-display text-lg font-semibold text-surface-900 mb-4">Images</h2>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-4">
              {images.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={image.url}
                    alt={`Product ${index + 1}`}
                    className="w-24 h-24 object-cover rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={() => handleImageRemove(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
              <label className="w-24 h-24 border-2 border-dashed border-surface-200 rounded-xl flex items-center justify-center cursor-pointer hover:border-surface-900 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploading}
                />
                {uploading ? (
                  <div className="animate-spin w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full" />
                ) : (
                  <svg className="w-8 h-8 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                )}
              </label>
            </div>
          </div>
        </div>

        {/* Product Options (e.g., Size, Color) */}
        <div className="bg-white rounded-xl shadow-soft p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display text-lg font-semibold text-surface-900">Product Options</h2>
              <p className="text-sm text-surface-500 mt-1">
                Define options like Size, Color, etc. Customers will select these on the storefront.
              </p>
            </div>
            <Button type="button" variant="secondary" onClick={addOptionType}>
              Add Option
            </Button>
          </div>
          {optionTypes.length === 0 ? (
            <p className="text-sm text-surface-400">No options defined. Products with a single variant do not need options.</p>
          ) : (
            <div className="space-y-3">
              {optionTypes.map((ot, index) => (
                <div key={index} className="flex items-end gap-4 p-4 bg-surface-50 rounded-xl">
                  <div className="w-40">
                    <Input
                      label="Option Name"
                      value={ot.name}
                      onChange={(e) => handleOptionTypeChange(index, 'name', e.target.value)}
                      placeholder="e.g. Size"
                    />
                  </div>
                  <div className="flex-1">
                    <Input
                      label="Values (comma-separated)"
                      value={ot.values}
                      onChange={(e) => handleOptionTypeChange(index, 'values', e.target.value)}
                      placeholder="e.g. S, M, L, XL"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeOptionType(index)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-xl"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Variants */}
        <div className="bg-white rounded-xl shadow-soft p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-semibold text-surface-900">Variants</h2>
            <div className="flex gap-2">
              {parsedOptionTypes.length > 0 && (
                <Button type="button" variant="secondary" onClick={generateVariantCombinations}>
                  Generate Combinations
                </Button>
              )}
              <Button type="button" variant="secondary" onClick={addVariant}>
                Add Variant
              </Button>
            </div>
          </div>
          <div className="space-y-4">
            {variants.map((variant, index) => (
              <div key={variant.id || index} className="p-4 bg-surface-50 rounded-xl space-y-3">
                <div className="flex items-end gap-4">
                  <div className="flex-1">
                    <Input
                      label="SKU"
                      value={variant.sku}
                      onChange={(e) => handleVariantChange(index, 'sku', e.target.value)}
                      placeholder="PROD-001"
                    />
                  </div>
                  <div className="w-32">
                    <Input
                      label="Price ($)"
                      type="number"
                      step="0.01"
                      min="0"
                      value={variant.price}
                      onChange={(e) => handleVariantChange(index, 'price', e.target.value)}
                      placeholder="Override"
                    />
                  </div>
                  <div className="w-24">
                    <Input
                      label="Stock"
                      type="number"
                      min="0"
                      value={variant.inventory}
                      onChange={(e) => handleVariantChange(index, 'inventory', e.target.value)}
                    />
                  </div>
                  {variants.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeVariant(index)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-xl"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
                {/* Option value selectors for this variant */}
                {parsedOptionTypes.length > 0 && (
                  <div className="flex flex-wrap gap-4 pt-2 border-t border-surface-200">
                    {parsedOptionTypes.map((ot) => (
                      <div key={ot.name} className="w-36">
                        <label className="block text-xs font-medium text-surface-500 mb-1">{ot.name}</label>
                        <select
                          value={variant.optionValues?.[ot.name] || ''}
                          onChange={(e) => handleVariantOptionValue(index, ot.name, e.target.value)}
                          className="w-full px-3 py-2 border-2 border-surface-200 rounded-xl text-sm text-surface-900 focus:border-surface-900 focus:outline-none transition-colors"
                        >
                          <option value="">Select {ot.name}</option>
                          {ot.values.map((val) => (
                            <option key={val} value={val}>{val}</option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* SEO */}
        <div className="bg-white rounded-xl shadow-soft p-6">
          <h2 className="font-display text-lg font-semibold text-surface-900 mb-4">SEO (Optional)</h2>
          <div className="space-y-4">
            <Input
              label="SEO Title"
              name="seoTitle"
              value={formData.seoTitle}
              onChange={handleInputChange}
              maxLength={70}
            />
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">
                SEO Description
              </label>
              <textarea
                name="seoDescription"
                value={formData.seoDescription}
                onChange={handleInputChange}
                rows={2}
                maxLength={160}
                className="w-full px-3 py-2 border-2 border-surface-200 rounded-xl focus:ring-2 focus:ring-surface-900 focus:border-transparent"
              />
              <p className="mt-1 text-sm text-surface-500">{formData.seoDescription.length}/160 characters</p>
            </div>
          </div>
        </div>

        {/* Error Banner */}
        {submitError && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-sm text-red-700">{submitError}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/dashboard/products')}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving || uploading}>
            {isSaving ? 'Saving...' : isEditMode ? 'Update Product' : 'Create Product'}
          </Button>
        </div>
      </form>
    </div>
  );
}

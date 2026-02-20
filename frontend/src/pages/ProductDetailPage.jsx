import { useState, useMemo, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProduct } from '../hooks/useProducts';
import { formatPrice } from '../utils/format';
import VariantSelector from '../components/product/VariantSelector';
import AddToCartButton from '../components/product/AddToCartButton';

/**
 * Product detail page
 */
export default function ProductDetailPage() {
  const { slug } = useParams();
  const { data: product, isLoading, error } = useProduct(slug);

  const [selectedOptions, setSelectedOptions] = useState({});
  const [selectedImage, setSelectedImage] = useState(0);

  // Initialize selected options when product loads
  useEffect(() => {
    if (product?.optionTypes) {
      const initialOptions = {};
      product.optionTypes.forEach((option) => {
        if (option.values.length > 0) {
          initialOptions[option.name] = option.values[0];
        }
      });
      setSelectedOptions(initialOptions);
    }
  }, [product]);

  // Find matching variant based on selected options
  const selectedVariant = useMemo(() => {
    if (!product?.variants || product.variants.length === 0) {
      return null;
    }

    // For products without option types, auto-select the first in-stock variant
    const hasOptions = product.optionTypes && product.optionTypes.length > 0;
    if (!hasOptions) {
      return product.variants.find((v) => v.inStock !== false) || product.variants[0];
    }

    if (Object.keys(selectedOptions).length === 0) {
      return null;
    }

    return product.variants.find((variant) => {
      if (variant.inStock === false) return false;

      return variant.optionValues.every(
        (ov) => selectedOptions[ov.name] === ov.value
      );
    });
  }, [product, selectedOptions]);

  const handleOptionChange = (optionName, value) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [optionName]: value,
    }));
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
          <div className="aspect-square bg-surface-100 rounded-2xl animate-pulse shadow-soft" />
          <div className="space-y-5">
            <div className="h-8 bg-surface-100 rounded-xl w-3/4 animate-pulse" />
            <div className="h-6 bg-surface-100 rounded-xl w-1/4 animate-pulse" />
            <div className="h-24 bg-surface-100 rounded-xl animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
        <div className="text-center py-16">
          <h1 className="font-display text-3xl text-surface-900 mb-4">
            Product Not Found
          </h1>
          <p className="text-surface-500 font-sans mb-8 max-w-md mx-auto leading-relaxed">
            The product you're looking for doesn't exist or has been removed.
          </p>
          <Link
            to="/products"
            className="btn btn-primary inline-block"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  // Images are objects with url property
  const imageUrls = product.images?.length > 0
    ? product.images.map(img => typeof img === 'string' ? img : img.url)
    : ['/placeholder-product.png'];
  const currentPrice = selectedVariant?.price || product.basePrice;
  const inStock = selectedVariant ? selectedVariant.inventory > 0 : true;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm font-sans text-surface-400 mb-8">
        <Link to="/" className="hover:text-surface-700 transition-colors">Home</Link>
        <span className="text-surface-300">/</span>
        <Link to="/products" className="hover:text-surface-700 transition-colors">Products</Link>
        {product.category && (
          <>
            <span className="text-surface-300">/</span>
            <Link
              to={`/category/${product.category.slug}`}
              className="hover:text-surface-700 transition-colors"
            >
              {product.category.name}
            </Link>
          </>
        )}
        <span className="text-surface-300">/</span>
        <span className="text-surface-900 font-medium">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
        {/* Image gallery */}
        <div className="space-y-4 animate-fade-in-up">
          <div className="aspect-square bg-surface-50 rounded-2xl overflow-hidden shadow-soft-lg border border-surface-100">
            <img
              src={imageUrls[selectedImage]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          {imageUrls.length > 1 && (
            <div className="flex gap-3 overflow-x-auto py-1">
              {imageUrls.map((imageUrl, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all duration-200 shadow-soft hover:shadow-soft-lg ${
                    selectedImage === index
                      ? 'border-primary-600 ring-2 ring-primary-200'
                      : 'border-surface-200 hover:border-surface-300'
                  }`}
                >
                  <img
                    src={imageUrl}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product info */}
        <div className="animate-fade-in-up">
          <h1 className="font-display text-3xl md:text-4xl text-surface-900 mb-3 tracking-tight">
            {product.name}
          </h1>

          <p className="text-2xl font-semibold font-sans text-primary-700 mb-5">
            {formatPrice(currentPrice)}
          </p>

          {selectedVariant && !inStock && (
            <p className="text-red-600 font-medium mb-4 font-sans">Out of stock</p>
          )}

          {selectedVariant && inStock && selectedVariant.inventory <= 5 && (
            <p className="text-primary-700 font-medium mb-4 font-sans">
              Only {selectedVariant.inventory} left in stock
            </p>
          )}

          {product.description && (
            <div className="prose prose-sm text-surface-600 font-sans mb-8 leading-relaxed">
              <p>{product.description}</p>
            </div>
          )}

          {/* Variant selector */}
          {product.optionTypes && product.optionTypes.length > 0 && (
            <div className="mb-8">
              <VariantSelector
                variants={product.variants}
                options={product.optionTypes}
                selectedOptions={selectedOptions}
                onOptionChange={handleOptionChange}
              />
            </div>
          )}

          {/* SKU */}
          {selectedVariant?.sku && (
            <p className="text-sm text-surface-400 font-sans mb-5 tracking-wide uppercase">
              SKU: {selectedVariant.sku}
            </p>
          )}

          {/* Add to cart */}
          <div className="bg-surface-50 rounded-2xl p-6 border border-surface-100 shadow-soft">
            <AddToCartButton
              variant={selectedVariant}
              disabled={!selectedVariant}
            />
          </div>

          {/* Additional info */}
          <div className="mt-10 border-t border-surface-200 pt-8 space-y-5">
            <div className="flex items-center gap-3 text-sm font-sans text-surface-500">
              <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
              <span>Free shipping on orders over $100</span>
            </div>
            <div className="flex items-center gap-3 text-sm font-sans text-surface-500">
              <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>30-day return policy</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

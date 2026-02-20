import { useMemo } from 'react';

/**
 * Variant selector component for product options
 * @param {Object} props
 * @param {Object[]} props.variants - Available variants
 * @param {Object[]} props.options - Product options (e.g., Size, Color)
 * @param {Object} props.selectedOptions - Currently selected option values
 * @param {Function} props.onOptionChange - Callback when option changes
 */
export default function VariantSelector({
  variants,
  options,
  selectedOptions,
  onOptionChange,
}) {
  // Group variants by option values for availability checking
  const availabilityMap = useMemo(() => {
    const map = {};
    variants.forEach((variant) => {
      // Use inStock boolean from API (fallback to inventory check)
      const isInStock = variant.inStock ?? (variant.inventory > 0);
      if (isInStock) {
        variant.optionValues.forEach(({ name, value }) => {
          if (!map[name]) map[name] = new Set();
          map[name].add(value);
        });
      }
    });
    return map;
  }, [variants]);

  // Check if a specific option value is available given current selections
  const isOptionAvailable = (optionName, optionValue) => {
    // Find variants that match this option value and all other selected options
    return variants.some((variant) => {
      const isInStock = variant.inStock ?? (variant.inventory > 0);
      if (!isInStock) return false;

      const matchesOption = variant.optionValues.some(
        (ov) => ov.name === optionName && ov.value === optionValue
      );

      if (!matchesOption) return false;

      // Check if it matches other selected options
      for (const [name, value] of Object.entries(selectedOptions)) {
        if (name === optionName) continue;
        const matchesOther = variant.optionValues.some(
          (ov) => ov.name === name && ov.value === value
        );
        if (!matchesOther) return false;
      }

      return true;
    });
  };

  if (!options || options.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {options.map((option) => (
        <div key={option.name}>
          <label className="block text-sm font-semibold text-surface-600 mb-2">
            {option.name}
          </label>

          <div className="flex flex-wrap gap-2">
            {option.values.map((value) => {
              const isSelected = selectedOptions[option.name] === value;
              const isAvailable = isOptionAvailable(option.name, value);

              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => onOptionChange(option.name, value)}
                  disabled={!isAvailable}
                  className={`
                    px-4 py-2 text-sm font-medium rounded-xl border-2 transition-colors
                    ${
                      isSelected
                        ? 'bg-surface-900 text-white border-surface-900'
                        : isAvailable
                        ? 'bg-white text-surface-900 border-surface-200 hover:border-surface-400'
                        : 'bg-surface-100 text-surface-400 border-surface-200 cursor-not-allowed line-through'
                    }
                  `}
                >
                  {value}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

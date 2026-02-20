import { useState } from 'react';

/**
 * Shipping address form component
 * @param {Object} props
 * @param {Object} [props.initialValues]
 * @param {Function} props.onSubmit
 * @param {boolean} [props.isSubmitting]
 */
export default function ShippingAddressForm({
  initialValues = {},
  onSubmit,
  isSubmitting = false,
}) {
  const [formData, setFormData] = useState({
    customerName: initialValues.customerName || '',
    customerEmail: initialValues.customerEmail || '',
    fullName: initialValues.fullName || '',
    addressLine1: initialValues.addressLine1 || '',
    addressLine2: initialValues.addressLine2 || '',
    city: initialValues.city || '',
    state: initialValues.state || '',
    postalCode: initialValues.postalCode || '',
    country: initialValues.country || 'US',
    phone: initialValues.phone || '',
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.customerName.trim()) {
      newErrors.customerName = 'Name is required';
    }

    if (!formData.customerEmail.trim()) {
      newErrors.customerEmail = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customerEmail)) {
      newErrors.customerEmail = 'Invalid email address';
    }

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Recipient name is required';
    }

    if (!formData.addressLine1.trim()) {
      newErrors.addressLine1 = 'Address is required';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
    }

    if (!formData.postalCode.trim()) {
      newErrors.postalCode = 'Postal code is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        shippingAddress: {
          fullName: formData.fullName,
          addressLine1: formData.addressLine1,
          addressLine2: formData.addressLine2,
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
          country: formData.country,
          phone: formData.phone,
        },
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Contact information */}
      <div>
        <h3 className="font-display text-xl text-surface-900 mb-4">
          Contact Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="customerName" className="block text-sm font-semibold text-surface-600 mb-1">
              Your Name *
            </label>
            <input
              type="text"
              id="customerName"
              name="customerName"
              value={formData.customerName}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 border-2 rounded-xl focus:border-surface-900 focus:outline-none transition-colors ${
                errors.customerName ? 'border-red-400' : 'border-surface-200'
              }`}
            />
            {errors.customerName && (
              <p className="mt-1 text-sm text-red-500">{errors.customerName}</p>
            )}
          </div>

          <div>
            <label htmlFor="customerEmail" className="block text-sm font-semibold text-surface-600 mb-1">
              Email *
            </label>
            <input
              type="email"
              id="customerEmail"
              name="customerEmail"
              value={formData.customerEmail}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 border-2 rounded-xl focus:border-surface-900 focus:outline-none transition-colors ${
                errors.customerEmail ? 'border-red-400' : 'border-surface-200'
              }`}
            />
            {errors.customerEmail && (
              <p className="mt-1 text-sm text-red-500">{errors.customerEmail}</p>
            )}
          </div>
        </div>
      </div>

      {/* Shipping address */}
      <div>
        <h3 className="font-display text-xl text-surface-900 mb-4">
          Shipping Address
        </h3>
        <div className="space-y-4">
          <div>
            <label htmlFor="fullName" className="block text-sm font-semibold text-surface-600 mb-1">
              Recipient Name *
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 border-2 rounded-xl focus:border-surface-900 focus:outline-none transition-colors ${
                errors.fullName ? 'border-red-400' : 'border-surface-200'
              }`}
            />
            {errors.fullName && (
              <p className="mt-1 text-sm text-red-500">{errors.fullName}</p>
            )}
          </div>

          <div>
            <label htmlFor="addressLine1" className="block text-sm font-semibold text-surface-600 mb-1">
              Address Line 1 *
            </label>
            <input
              type="text"
              id="addressLine1"
              name="addressLine1"
              value={formData.addressLine1}
              onChange={handleChange}
              placeholder="Street address"
              className={`w-full px-4 py-2.5 border-2 rounded-xl focus:border-surface-900 focus:outline-none transition-colors ${
                errors.addressLine1 ? 'border-red-400' : 'border-surface-200'
              }`}
            />
            {errors.addressLine1 && (
              <p className="mt-1 text-sm text-red-500">{errors.addressLine1}</p>
            )}
          </div>

          <div>
            <label htmlFor="addressLine2" className="block text-sm font-semibold text-surface-600 mb-1">
              Address Line 2
            </label>
            <input
              type="text"
              id="addressLine2"
              name="addressLine2"
              value={formData.addressLine2}
              onChange={handleChange}
              placeholder="Apartment, suite, etc. (optional)"
              className="w-full px-4 py-2.5 border-2 border-surface-200 rounded-xl focus:border-surface-900 focus:outline-none transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="city" className="block text-sm font-semibold text-surface-600 mb-1">
                City *
              </label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 border-2 rounded-xl focus:border-surface-900 focus:outline-none transition-colors ${
                  errors.city ? 'border-red-400' : 'border-surface-200'
                }`}
              />
              {errors.city && (
                <p className="mt-1 text-sm text-red-500">{errors.city}</p>
              )}
            </div>

            <div>
              <label htmlFor="state" className="block text-sm font-semibold text-surface-600 mb-1">
                State *
              </label>
              <input
                type="text"
                id="state"
                name="state"
                value={formData.state}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 border-2 rounded-xl focus:border-surface-900 focus:outline-none transition-colors ${
                  errors.state ? 'border-red-400' : 'border-surface-200'
                }`}
              />
              {errors.state && (
                <p className="mt-1 text-sm text-red-500">{errors.state}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="postalCode" className="block text-sm font-semibold text-surface-600 mb-1">
                Postal Code *
              </label>
              <input
                type="text"
                id="postalCode"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 border-2 rounded-xl focus:border-surface-900 focus:outline-none transition-colors ${
                  errors.postalCode ? 'border-red-400' : 'border-surface-200'
                }`}
              />
              {errors.postalCode && (
                <p className="mt-1 text-sm text-red-500">{errors.postalCode}</p>
              )}
            </div>

            <div>
              <label htmlFor="country" className="block text-sm font-semibold text-surface-600 mb-1">
                Country
              </label>
              <select
                id="country"
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border-2 border-surface-200 rounded-xl focus:border-surface-900 focus:outline-none transition-colors"
              >
                <option value="US">United States</option>
                <option value="CA">Canada</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-semibold text-surface-600 mb-1">
              Phone (optional)
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="For delivery updates"
              className="w-full px-4 py-2.5 border-2 border-surface-200 rounded-xl focus:border-surface-900 focus:outline-none transition-colors"
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3 px-4 bg-surface-900 hover:bg-surface-800 text-white font-semibold rounded-xl transition-colors disabled:bg-surface-400 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Processing...' : 'Continue to Payment'}
      </button>
    </form>
  );
}

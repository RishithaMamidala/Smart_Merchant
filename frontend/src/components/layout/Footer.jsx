import { Link } from 'react-router-dom';

/**
 * Main footer component
 */
export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-surface-900 text-surface-300">
      {/* Newsletter strip */}
      <div className="border-b border-surface-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="font-display text-2xl text-white">Stay in the loop</h3>
              <p className="text-sm text-surface-400 mt-1">Get updates on new arrivals and exclusive offers.</p>
            </div>
            <div className="flex w-full md:w-auto gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 md:w-72 px-4 py-2.5 bg-surface-800 border border-surface-700 rounded-xl text-white text-sm placeholder-surface-500 focus:outline-none focus:border-primary-500 transition-colors"
              />
              <button className="px-6 py-2.5 bg-primary-600 hover:bg-primary-500 text-white text-sm font-semibold rounded-xl transition-colors whitespace-nowrap">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-display text-sm">S</span>
              </div>
              <span className="font-display text-xl text-white">Smart Merchant</span>
            </Link>
            <p className="mt-4 text-sm text-surface-400 max-w-sm leading-relaxed">
              Curated products, exceptional quality. Discover the best in modern commerce with a seamless shopping experience.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xs font-semibold text-surface-400 uppercase tracking-widest mb-4">
              Quick Links
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-sm text-surface-300 hover:text-white transition-colors">
                  Shop
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-sm text-surface-300 hover:text-white transition-colors">
                  Products
                </Link>
              </li>
              <li>
                <Link to="/account/orders" className="text-sm text-surface-300 hover:text-white transition-colors">
                  Order History
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-xs font-semibold text-surface-400 uppercase tracking-widest mb-4">
              Support
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/contact" className="text-sm text-surface-300 hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/shipping" className="text-sm text-surface-300 hover:text-white transition-colors">
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link to="/returns" className="text-sm text-surface-300 hover:text-white transition-colors">
                  Returns & Refunds
                </Link>
              </li>
              <li>
                <Link to="/merchant/login" className="text-sm text-surface-300 hover:text-white transition-colors">
                  Merchant Login
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-surface-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-surface-500">
            &copy; {currentYear} Smart Merchant. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link to="/privacy" className="text-xs text-surface-500 hover:text-surface-300 transition-colors">Privacy</Link>
            <Link to="/terms" className="text-xs text-surface-500 hover:text-surface-300 transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

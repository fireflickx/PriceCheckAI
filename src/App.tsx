/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, ChangeEvent, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Tag, 
  Package, 
  CreditCard, 
  ChevronRight, 
  AlertCircle, 
  CheckCircle2, 
  TrendingUp, 
  TrendingDown,
  Info,
  Loader2
} from 'lucide-react';
import { estimatePrice, PriceEstimationRequest, PriceEstimationResult } from './services/geminiService';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'BRL'];
const UNITS = ['piece', 'kg', 'g', 'l', 'ml', 'pack', 'box', 'meter', 'sqm'];

export default function App() {
  const [formData, setFormData] = useState<PriceEstimationRequest>({
    productName: '',
    price: 0,
    currency: 'USD',
    quantity: 1,
    unit: 'piece'
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PriceEstimationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'quantity' ? parseFloat(value) || 0 : value
    }));
  };

  const handleEstimate = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.productName || formData.price <= 0) {
      setError('Please provide a valid product name and price.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await estimatePrice(formData);
      setResult(data);
    } catch (err) {
      setError('Failed to estimate price. Please check your connection and try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getVerdictStyles = (verdict: string) => {
    switch (verdict) {
      case 'GREAT_DEAL':
        return {
          bg: 'bg-green-50 text-green-700 border-green-200',
          icon: <CheckCircle2 className="w-6 h-6 text-green-600" />,
          label: 'Great Deal',
          trend: <TrendingDown className="w-4 h-4" />
        };
      case 'FAIR':
        return {
          bg: 'bg-blue-50 text-blue-700 border-blue-200',
          icon: <Info className="w-6 h-6 text-blue-600" />,
          label: 'Fair Price',
          trend: <div className="w-4 h-4 bg-blue-400 rounded-full" />
        };
      case 'OVERPRICED':
        return {
          bg: 'bg-red-50 text-red-700 border-red-200',
          icon: <AlertCircle className="w-6 h-6 text-red-600" />,
          label: 'Overpriced',
          trend: <TrendingUp className="w-4 h-4" />
        };
      default:
        return {
          bg: 'bg-gray-50 text-gray-700 border-gray-200',
          icon: <Search className="w-6 h-6 text-gray-600" />,
          label: 'Unknown',
          trend: null
        };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <header className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-600 rounded-xl mb-4 shadow-lg shadow-indigo-200">
            <Tag className="text-white w-6 h-6" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">PriceCheck AI</h1>
          <p className="text-gray-500 mt-2">Instantly estimate if you're getting a fair market deal.</p>
        </header>

        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <form onSubmit={handleEstimate} className="space-y-6">
            <div>
              <label htmlFor="productName" className="block text-sm font-medium text-gray-700 mb-1">
                Product Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="productName"
                  name="productName"
                  value={formData.productName}
                  onChange={handleInputChange}
                  placeholder="e.g. Sony WH-1000XM5 Headphones"
                  className="block w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                  Price
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <CreditCard className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      id="price"
                      name="price"
                      step="0.01"
                      value={formData.price || ''}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      className="block w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm"
                    />
                  </div>
                  <select
                    name="currency"
                    value={formData.currency}
                    onChange={handleInputChange}
                    className="w-24 bg-gray-50 border border-gray-200 rounded-lg px-2 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"
                  >
                    {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity & Unit
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Package className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      id="quantity"
                      name="quantity"
                      step="0.01"
                      value={formData.quantity || ''}
                      onChange={handleInputChange}
                      placeholder="1"
                      className="block w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm"
                    />
                  </div>
                  <select
                    name="unit"
                    value={formData.unit}
                    onChange={handleInputChange}
                    className="w-24 bg-gray-50 border border-gray-200 rounded-lg px-2 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"
                  >
                    {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-md active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Estimating...
                </>
              ) : (
                <>
                  Analyze Price
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </motion.div>
          )}

          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="mt-10 pt-8 border-t border-gray-100"
              >
                <div className={`p-6 rounded-2xl border ${getVerdictStyles(result.verdict).bg} mb-6`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      {getVerdictStyles(result.verdict).icon}
                      <span className="text-xl font-bold">{getVerdictStyles(result.verdict).label}</span>
                    </div>
                    <div className="flex items-center gap-1.5 opacity-60">
                      <span className="text-xs font-medium uppercase tracking-wider">Confidence</span>
                      <span className="text-sm font-mono">{Math.round(result.confidence * 100)}%</span>
                    </div>
                  </div>
                  <div className="text-sm opacity-90 leading-relaxed font-medium">
                    {result.reasoning}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Ref. Market Price</h3>
                    <div className="text-2xl font-mono font-bold text-gray-900 tracking-tight">
                      {result.estimatedReferencePrice}
                    </div>
                    <p className="text-xs text-gray-400 mt-2">Based on current online availability</p>
                  </div>
                  <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Market Context</h3>
                    <p className="text-sm text-gray-600 leading-relaxed italic">
                      "{result.marketContext}"
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        <footer className="mt-12 text-center text-gray-400 text-sm">
          <p>© 2026 PriceCheck AI • Powered by Gemini Flash</p>
          <p className="mt-1">Analyze any product instantly.</p>
        </footer>
      </motion.div>
    </div>
  );
}


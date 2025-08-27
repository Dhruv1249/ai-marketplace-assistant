'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui';
import { DollarSign, Percent, Calculator } from 'lucide-react';
import Checkbox from '@/components/animated icon/CheckBox';

const PricingStep = ({ 
  pricing, 
  setPricing, 
  onBack, 
  onContinue 
}) => {
  const [basePrice, setBasePrice] = useState(pricing?.basePrice || '');
  const [discountEnabled, setDiscountEnabled] = useState(pricing?.discount?.enabled || false);
  const [discountType, setDiscountType] = useState(pricing?.discount?.type || 'percentage');
  const [discountValue, setDiscountValue] = useState(pricing?.discount?.value || '');
  const [finalPrice, setFinalPrice] = useState(0);
  const [errors, setErrors] = useState({});

  // Calculate final price whenever values change
  useEffect(() => {
    const base = parseFloat(basePrice) || 0;
    let final = base;

    if (discountEnabled && discountValue) {
      const discount = parseFloat(discountValue) || 0;
      if (discountType === 'percentage') {
        final = base - (base * discount / 100);
      } else {
        final = base - discount;
      }
    }

    // Ensure final price is not negative
    final = Math.max(0, final);
    setFinalPrice(final);

    // Update pricing state
    setPricing({
      basePrice: base,
      discount: {
        enabled: discountEnabled,
        type: discountType,
        value: parseFloat(discountValue) || 0,
        finalPrice: final
      }
    });
  }, [basePrice, discountEnabled, discountType, discountValue, setPricing]);

  const validateForm = () => {
    const newErrors = {};

    if (!basePrice || parseFloat(basePrice) <= 0) {
      newErrors.basePrice = 'Base price is required and must be greater than 0';
    }

    if (discountEnabled && discountValue) {
      const discount = parseFloat(discountValue);
      if (discountType === 'percentage' && (discount < 0 || discount > 100)) {
        newErrors.discountValue = 'Percentage discount must be between 0 and 100';
      } else if (discountType === 'fixed' && discount >= parseFloat(basePrice)) {
        newErrors.discountValue = 'Fixed discount cannot be greater than or equal to base price';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (validateForm()) {
      onContinue();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center mb-6">
        <DollarSign className="mr-3 text-green-600" size={24} />
        <h2 className="text-xl font-semibold text-gray-900">Set Pricing</h2>
      </div>

      <div className="space-y-6">
        {/* Base Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Base Price <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">$</span>
            </div>
            <input
              type="number"
              step="0.01"
              min="0"
              value={basePrice}
              onChange={(e) => setBasePrice(e.target.value)}
              className={`w-full pl-8 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white ${
                errors.basePrice ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="0.00"
            />
          </div>
          {errors.basePrice && (
            <p className="mt-1 text-sm text-red-600">{errors.basePrice}</p>
          )}
        </div>

        {/* Discount Toggle */}
        <Checkbox 
          checked={discountEnabled} 
          onChange={(e) => setDiscountEnabled(e.target.checked)} 
          label="Apply discount (optional)" 
        />


        {/* Discount Configuration */}
        {discountEnabled && (
          <div className="bg-gray-50 rounded-lg p-4 space-y-4">
            <h3 className="text-sm font-medium text-gray-700">Discount Configuration</h3>
            
            {/* Discount Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Discount Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDiscountType('percentage')}
                  className={`flex items-center justify-center px-4 py-2 border rounded-lg text-sm font-medium ${
                    discountType === 'percentage'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Percent className="mr-2" size={16} />
                  Percentage
                </button>
                <button
                  type="button"
                  onClick={() => setDiscountType('fixed')}
                  className={`flex items-center justify-center px-4 py-2 border rounded-lg text-sm font-medium ${
                    discountType === 'fixed'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <DollarSign className="mr-2" size={16} />
                  Fixed Amount
                </button>
              </div>
            </div>

            {/* Discount Value */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Discount {discountType === 'percentage' ? 'Percentage' : 'Amount'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">
                    {discountType === 'percentage' ? '%' : '$'}
                  </span>
                </div>
                <input
                  type="number"
                  step={discountType === 'percentage' ? '1' : '0.01'}
                  min="0"
                  max={discountType === 'percentage' ? '100' : undefined}
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  className={`w-full pl-8 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white ${
                    errors.discountValue ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder={discountType === 'percentage' ? '0' : '0.00'}
                />
              </div>
              {errors.discountValue && (
                <p className="mt-1 text-sm text-red-600">{errors.discountValue}</p>
              )}
            </div>
          </div>
        )}

        {/* Price Summary */}
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center mb-3">
            <Calculator className="mr-2 text-blue-600" size={20} />
            <h3 className="text-sm font-medium text-blue-900">Price Summary</h3>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Base Price:</span>
              <span className="font-medium text-gray-900">
                ${parseFloat(basePrice || 0).toFixed(2)}
              </span>
            </div>
            
            {discountEnabled && discountValue && (
              <div className="flex justify-between">
                <span className="text-gray-600">
                  Discount ({discountType === 'percentage' ? `${discountValue}%` : `$${discountValue}`}):
                </span>
                <span className="font-medium text-red-600">
                  -${(parseFloat(basePrice || 0) - finalPrice).toFixed(2)}
                </span>
              </div>
            )}
            
            <div className="border-t border-blue-200 pt-2 flex justify-between">
              <span className="font-medium text-blue-900">Final Price:</span>
              <span className="font-bold text-blue-900 text-lg">
                ${finalPrice.toFixed(2)}
              </span>
            </div>
            
            {discountEnabled && discountValue && (
              <div className="text-xs text-green-600">
                You save: ${(parseFloat(basePrice || 0) - finalPrice).toFixed(2)} 
                ({discountType === 'percentage' ? `${discountValue}%` : 'fixed amount'})
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex gap-4 pt-4">
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button onClick={handleContinue}>
            Continue to Images & Layout
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PricingStep;
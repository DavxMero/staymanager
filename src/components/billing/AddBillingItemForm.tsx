import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { BillingItem } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface BillingItemForm {
  id: number;
  category: 'food' | 'beverage' | 'service' | 'misc';
  description: string;
  quantity: number;
  unitPrice: number;
  customDescription: boolean;
}

const defaultItems = {
  food: [
    { name: 'Room Service Breakfast', price: 75000 },
    { name: 'Continental Breakfast', price: 50000 },
    { name: 'Buffet Breakfast', price: 125000 },
    { name: 'Lunch Platter', price: 150000 },
    { name: 'Dinner Set', price: 200000 },
  ],
  beverage: [
    { name: 'Mineral Water', price: 15000 },
    { name: 'Soft Drink', price: 25000 },
    { name: 'Coffee', price: 30000 },
    { name: 'Tea', price: 25000 },
    { name: 'Juice', price: 35000 },
  ],
  service: [
    { name: 'Extra Bed', price: 100000 },
    { name: 'Late Check-out (per hour)', price: 50000 },
    { name: 'Early Check-in', price: 50000 },
    { name: 'Laundry Service', price: 75000 },
    { name: 'Spa Treatment', price: 250000 },
  ],
  misc: [
    { name: 'Damage Fee', price: 0 },
    { name: 'Lost Key', price: 250000 },
    { name: 'Other', price: 0 },
  ]
};

interface AddBillingItemFormProps {
  reservationId: number;
  onAddItem: (items: Omit<BillingItem, 'id' | 'created_at'>[]) => void;
  onCancel: () => void;
}

export function AddBillingItemForm({ reservationId, onAddItem, onCancel }: AddBillingItemFormProps) {
  const [billingItems, setBillingItems] = useState<BillingItemForm[]>([
    {
      id: Date.now(),
      category: 'food',
      description: '',
      quantity: 1,
      unitPrice: 75000,
      customDescription: false
    }
  ]);

  const handleCategoryChange = (id: number, value: 'food' | 'beverage' | 'service' | 'misc') => {
    setBillingItems(prev => prev.map(item => {
      if (item.id === id) {
        // Set default price based on selected category
        let defaultPrice = 0;
        if (value === 'food') defaultPrice = 75000;
        else if (value === 'beverage') defaultPrice = 25000;
        else if (value === 'service') defaultPrice = 100000;
        
        return {
          ...item,
          category: value,
          description: '',
          unitPrice: defaultPrice,
          customDescription: false
        };
      }
      return item;
    }));
  };

  const handleDescriptionChange = (id: number, value: string) => {
    setBillingItems(prev => prev.map(item => {
      if (item.id === id) {
        // Find the item in defaultItems and set the price
        const defaultItem = defaultItems[item.category].find(i => i.name === value);
        return {
          ...item,
          description: value,
          unitPrice: defaultItem ? defaultItem.price : item.unitPrice,
          customDescription: !defaultItem
        };
      }
      return item;
    }));
  };

  const handleQuantityChange = (id: number, value: number) => {
    setBillingItems(prev => prev.map(item => 
      item.id === id ? { ...item, quantity: Math.max(1, value) } : item
    ));
  };

  const handleUnitPriceChange = (id: number, value: number) => {
    setBillingItems(prev => prev.map(item => 
      item.id === id ? { ...item, unitPrice: Math.max(0, value) } : item
    ));
  };

  const handleDescriptionTextChange = (id: number, value: string) => {
    setBillingItems(prev => prev.map(item => 
      item.id === id ? { ...item, description: value } : item
    ));
  };

  const addNewItem = () => {
    setBillingItems(prev => [
      ...prev,
      {
        id: Date.now(),
        category: 'food',
        description: '',
        quantity: 1,
        unitPrice: 75000,
        customDescription: false
      }
    ]);
  };

  const removeItem = (id: number) => {
    if (billingItems.length > 1) {
      setBillingItems(prev => prev.filter(item => item.id !== id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const itemsToAdd = billingItems.map(item => ({
      reservation_id: reservationId,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      total_price: item.quantity * item.unitPrice,
      status: 'pending' as const,
      category: item.category
    }));
    
    onAddItem(itemsToAdd);
  };

  const total = billingItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        {billingItems.map((item, index) => (
          <div key={item.id} className="border rounded-lg p-4 space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">Item {index + 1}</h4>
              {billingItems.length > 1 && (
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={() => removeItem(item.id)}
                >
                  Remove
                </Button>
              )}
            </div>
            
            <div className="space-y-2">
              <Label>Category</Label>
              <Select 
                value={item.category} 
                onValueChange={(value) => handleCategoryChange(item.id, value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="food">Food</SelectItem>
                  <SelectItem value="beverage">Beverage</SelectItem>
                  <SelectItem value="service">Service</SelectItem>
                  <SelectItem value="misc">Miscellaneous</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Select 
                value={item.description} 
                onValueChange={(value) => handleDescriptionChange(item.id, value)}
                disabled={item.customDescription}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select item or type custom" />
                </SelectTrigger>
                <SelectContent>
                  {defaultItems[item.category].map((defaultItem, idx) => (
                    <SelectItem key={idx} value={defaultItem.name}>
                      {defaultItem.name} - {formatCurrency(defaultItem.price)}
                    </SelectItem>
                  ))}
                  <SelectItem value="custom">Custom Item</SelectItem>
                </SelectContent>
              </Select>
              
              {item.customDescription && (
                <Textarea
                  placeholder="Enter custom description"
                  value={item.description}
                  onChange={(e) => handleDescriptionTextChange(item.id, e.target.value)}
                  required
                />
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Quantity</Label>
                <Input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 1)}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Unit Price (Rp)</Label>
                <Input
                  type="number"
                  min="0"
                  value={item.unitPrice}
                  onChange={(e) => handleUnitPriceChange(item.id, parseInt(e.target.value) || 0)}
                  required
                />
                {item.unitPrice > 0 && (
                  <div className="text-sm text-muted-foreground">
                    {formatCurrency(item.unitPrice)}
                  </div>
                )}
              </div>
            </div>
            
            <div className="border-t pt-2">
              <div className="flex justify-between font-medium">
                <span>Item Total:</span>
                <span>{formatCurrency(item.quantity * item.unitPrice)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Button 
        type="button" 
        variant="outline" 
        onClick={addNewItem}
        className="w-full"
      >
        Add Another Item
      </Button>

      <div className="border-t pt-3">
        <div className="flex justify-between font-bold text-lg">
          <span>Total:</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={billingItems.some(item => !item.description || (item.quantity * item.unitPrice) <= 0)}>
          Set
        </Button>
      </div>
    </form>
  );
}
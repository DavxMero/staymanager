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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { BillingItem } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface AddBillingItemDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  reservationId: number;
  onAddItem: (item: Omit<BillingItem, 'id' | 'created_at'>) => void;
  onCancel: () => void;
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

export function AddBillingItemDialog({ isOpen, onOpenChange, reservationId, onAddItem, onCancel }: AddBillingItemDialogProps) {
  const [category, setCategory] = useState<'food' | 'beverage' | 'service' | 'misc'>('food');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState(0);
  const [customDescription, setCustomDescription] = useState(false);

  const handleCategoryChange = (value: 'food' | 'beverage' | 'service' | 'misc') => {
    setCategory(value);
    setDescription('');
    setCustomDescription(false);
    // Set default price based on selected category
    if (value === 'food') setUnitPrice(75000);
    else if (value === 'beverage') setUnitPrice(25000);
    else if (value === 'service') setUnitPrice(100000);
    else setUnitPrice(0);
  };

  const handleDescriptionChange = (value: string) => {
    setDescription(value);
    // Find the item in defaultItems and set the price
    const item = defaultItems[category].find(item => item.name === value);
    if (item) {
      setUnitPrice(item.price);
    } else {
      setCustomDescription(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const total = quantity * unitPrice;
    
    onAddItem({
      reservation_id: reservationId,
      description,
      quantity,
      unit_price: unitPrice,
      total_price: total,
      status: 'pending',
      category
    });
    
    // Reset form
    setCategory('food');
    setDescription('');
    setQuantity(1);
    setUnitPrice(0);
    setCustomDescription(false);
    onOpenChange(false);
  };

  const total = quantity * unitPrice;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Billing Item</DialogTitle>
          <DialogDescription>
            Add a new billing item to this reservation
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={category} onValueChange={handleCategoryChange}>
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
              value={description} 
              onValueChange={handleDescriptionChange}
              disabled={customDescription}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select item or type custom" />
              </SelectTrigger>
              <SelectContent>
                {defaultItems[category].map((item, index) => (
                  <SelectItem key={index} value={item.name}>
                    {item.name} - {formatCurrency(item.price)}
                  </SelectItem>
                ))}
                <SelectItem value="custom">Custom Item</SelectItem>
              </SelectContent>
            </Select>
            
            {customDescription && (
              <Textarea
                placeholder="Enter custom description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
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
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Unit Price (Rp)</Label>
              <Input
                type="number"
                min="0"
                value={unitPrice}
                onChange={(e) => setUnitPrice(Math.max(0, parseInt(e.target.value) || 0))}
                required
              />
              {unitPrice > 0 && (
                <div className="text-sm text-muted-foreground">
                  {formatCurrency(unitPrice)}
                </div>
              )}
            </div>
          </div>

          <div className="border-t pt-3">
            <div className="flex justify-between font-bold">
              <span>Total:</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!description || total <= 0}
            >
              Add Item
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
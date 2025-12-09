'use client'

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  ConciergeBell,
  Search,
  Plus,
  ShoppingCart,
  User,
  CheckCircle2,
  Car,
  Shirt,
  Sparkles,
  Coffee,
  MoreHorizontal,
  BedDouble,
  Utensils,
  Pencil,
  Trash2,
  Settings,
  Save,
  X
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { supabase } from "@/lib/supabaseClient"
import { formatCurrency } from "@/lib/utils"
import { usePermissions } from "@/lib/hooks/usePermissions"

// Types based on DB Schema
interface ServiceItem {
  id: number
  name: string
  description: string
  price: number
  category: string
  is_available: boolean
  service_code?: string
}

interface ActiveGuest {
  reservation_id: string
  guest_name: string
  room_number: string
  guest_id: number
  room_id: string
}

const CATEGORIES = [
  { value: 'laundry', label: 'Laundry' },
  { value: 'food', label: 'Food' },
  { value: 'beverage', label: 'Beverage' },
  { value: 'amenities', label: 'Amenities' },
  { value: 'transport', label: 'Transport' },
  { value: 'wellness', label: 'Wellness & Spa' },
  { value: 'housekeeping', label: 'Housekeeping' },
  { value: 'other', label: 'Other' }
]

export default function GuestFacilitiesPage() {
  const [services, setServices] = useState<ServiceItem[]>([])
  const [activeGuests, setActiveGuests] = useState<ActiveGuest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  // Permissions
  const { permissions } = usePermissions()
  const canManageServices = permissions.includes('*') ||
    permissions.includes('operations') ||
    permissions.includes('staff')

  // Order Dialog State
  const [isOrderOpen, setIsOrderOpen] = useState(false)
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null)
  const [selectedGuestId, setSelectedGuestId] = useState<string>("")
  const [quantity, setQuantity] = useState(1)
  const [notes, setNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // CRUD Management State
  const [isManageOpen, setIsManageOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<Partial<ServiceItem>>({
    name: '',
    description: '',
    price: 0,
    category: 'other',
    is_available: true,
    service_code: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      // 1. Fetch Services (Show all, even unavailable ones for admin management purposes, or filter in UI)
      const { data: servicesData, error: servicesError } = await supabase
        .from('service_items')
        .select('*')
        .order('category')

      if (servicesError) throw servicesError
      setServices(servicesData || [])

      // 2. Fetch Active Guests
      const { data: guestsData, error: guestsError } = await supabase
        .from('reservations')
        .select(`
          id,
          guest_name,
          guest_id,
          room_id,
          rooms (number)
        `)
        .eq('status', 'checked-in')

      if (guestsError) throw guestsError

      const formattedGuests = guestsData?.map((g: any) => ({
        reservation_id: g.id,
        guest_name: g.guest_name,
        room_number: g.rooms?.number || '?',
        guest_id: g.guest_id,
        room_id: g.room_id
      })) || []

      setActiveGuests(formattedGuests)

    } catch (error: any) {
      console.error('Error fetching data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // --- ORDERING LOGIC ---

  const handleOrderClick = (service: ServiceItem) => {
    setSelectedService(service)
    setQuantity(1)
    setNotes("")
    setSelectedGuestId("")
    setIsOrderOpen(true)
  }

  const handleSubmitOrder = async () => {
    if (!selectedService || !selectedGuestId) return

    setIsSubmitting(true)
    try {
      const guest = activeGuests.find(g => g.reservation_id === selectedGuestId)
      if (!guest) throw new Error("Guest not found")

      const totalPrice = selectedService.price * quantity

      let serviceType = 'other'
      const cat = selectedService.category.toLowerCase()
      if (cat.includes('food') || cat.includes('beverage')) serviceType = 'food-order'
      else if (cat.includes('clean') || cat.includes('laundry')) serviceType = 'housekeeping'
      else if (cat.includes('amenit') || cat.includes('bed')) serviceType = 'amenities'
      else if (cat.includes('room')) serviceType = 'room-service'
      else if (cat.includes('repair')) serviceType = 'maintenance'

      // 1. Create Service Request
      const { data: requestData, error: requestError } = await supabase
        .from('guest_facility_requests')
        .insert({
          guest_id: guest.guest_id,
          reservation_id: guest.reservation_id,
          room_id: guest.room_id,
          service_type: serviceType,
          description: `${selectedService.name} (Qty: ${quantity})`,
          priority: 'medium',
          status: 'pending',
          total_cost: totalPrice,
          notes: notes
        })
        .select()
        .single()

      if (requestError) throw new Error('Failed to create service request: ' + requestError.message)

      // 2. Add to Billing
      const { error: billingError } = await supabase
        .from('billing_items')
        .insert({
          reservation_id: guest.reservation_id,
          guest_id: guest.guest_id,
          item_name: selectedService.name,
          category: selectedService.category,
          quantity: quantity,
          unit_price: selectedService.price,
          total_price: totalPrice,
          status: 'pending',
          notes: `Ref Request #${requestData.id}`,
          service_date: new Date().toISOString()
        })

      if (billingError) {
        console.error('Billing Error:', billingError)
        alert('Service requested but failed to add to billing automatically.')
      }

      alert(`Successfully ordered ${selectedService.name}.`)
      setIsOrderOpen(false)

    } catch (error: any) {
      console.error('Order failed:', error)
      alert('Failed to place order: ' + error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  // --- CRUD LOGIC ---

  const handleAddService = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      category: 'other',
      is_available: true,
      service_code: ''
    })
    setIsEditing(false)
    setIsManageOpen(true)
  }

  const handleEditService = (e: React.MouseEvent, service: ServiceItem) => {
    e.stopPropagation() // Prevent card click (order)
    setFormData({ ...service })
    setIsEditing(true)
    setIsManageOpen(true)
  }

  const handleDeleteService = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation()
    if (!confirm('Are you sure you want to delete this service? This action cannot be undone.')) return

    try {
      const { error } = await supabase
        .from('service_items')
        .delete()
        .eq('id', id)

      if (error) throw error

      setServices(services.filter(s => s.id !== id))
    } catch (error: any) {
      alert('Failed to delete service: ' + error.message)
    }
  }

  const handleSaveService = async () => {
    if (!formData.name || !formData.price) {
      alert('Please fill in Name and Price')
      return
    }

    setIsSubmitting(true)
    try {
      // Auto-generate code if empty
      const code = formData.service_code || formData.name?.toUpperCase().substring(0, 3) + '-' + Math.floor(Math.random() * 1000)

      const payload = {
        name: formData.name,
        description: formData.description,
        price: formData.price,
        category: formData.category,
        is_available: formData.is_available,
        service_code: code
      }

      if (isEditing && formData.id) {
        // UPDATE
        const { data, error } = await supabase
          .from('service_items')
          .update(payload)
          .eq('id', formData.id)
          .select()
          .single()

        if (error) throw error
        setServices(services.map(s => s.id === formData.id ? data : s))
      } else {
        // INSERT
        const { data, error } = await supabase
          .from('service_items')
          .insert(payload)
          .select()
          .single()

        if (error) throw error
        setServices([...services, data])
      }

      setIsManageOpen(false)
    } catch (error: any) {
      console.error('Save failed:', error)
      alert('Failed to save service: ' + error.message)
    } finally {
      setIsSubmitting(false)
    }
  }


  // --- FILTERING ---

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || service.category.toLowerCase() === selectedCategory.toLowerCase()
    return matchesSearch && matchesCategory
  })

  const categories = ['all', ...Array.from(new Set(services.map(s => s.category.toLowerCase())))]

  const getCategoryIcon = (cat: string) => {
    const c = cat.toLowerCase()
    if (c.includes('laundry')) return <Shirt className="h-5 w-5" />
    if (c.includes('transport')) return <Car className="h-5 w-5" />
    if (c.includes('wellness') || c.includes('spa')) return <Sparkles className="h-5 w-5" />
    if (c.includes('food') || c.includes('drink') || c.includes('beverage')) return <Utensils className="h-5 w-5" />
    if (c.includes('bed')) return <BedDouble className="h-5 w-5" />
    return <ConciergeBell className="h-5 w-5" />
  }

  return (
    <div className="space-y-6 p-6 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Guest Facilities</h1>
          <p className="text-muted-foreground">Order services and amenities for active guests.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto items-center">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search services..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {canManageServices && (
            <Button onClick={handleAddService} className="shrink-0">
              <Plus className="h-4 w-4 mr-2" />
              Add Service
            </Button>
          )}
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <Button
            key={cat}
            variant={selectedCategory === cat ? "default" : "outline"}
            onClick={() => setSelectedCategory(cat)}
            className="capitalize whitespace-nowrap"
          >
            {cat}
          </Button>
        ))}
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredServices.map((service) => (
          <Card key={service.id} className="flex flex-col hover:shadow-lg transition-shadow cursor-pointer group relative overflow-hidden">
            {/* Admin Controls Overlay - MOVED TO AVOID OVERLAP */}
            {canManageServices && (
              <div className="absolute top-12 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-8 w-8 bg-white/90 hover:bg-white shadow-sm border"
                  onClick={(e) => handleEditService(e, service)}
                >
                  <Pencil className="h-4 w-4 text-blue-600" />
                </Button>
                <Button
                  variant="destructive"
                  size="icon"
                  className="h-8 w-8 shadow-sm border"
                  onClick={(e) => handleDeleteService(e, service.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}

            <div onClick={() => handleOrderClick(service)} className="flex-1 flex flex-col">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                    {getCategoryIcon(service.category)}
                  </div>
                  <Badge variant={service.is_available ? "secondary" : "destructive"} className="font-mono">
                    {service.is_available ? formatCurrency(service.price) : 'Unavailable'}
                  </Badge>
                </div>
                <CardTitle className="mt-4 text-lg">{service.name}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {service.description}
                </CardDescription>
              </CardHeader>
              <CardFooter className="mt-auto pt-0">
                <Button
                  className="w-full bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40 border-0"
                  disabled={!service.is_available}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Order Service
                </Button>
              </CardFooter>
            </div>
          </Card>
        ))}
      </div>

      {filteredServices.length === 0 && !isLoading && (
        <div className="text-center py-12 text-muted-foreground">
          <ConciergeBell className="h-12 w-12 mx-auto mb-4 opacity-20" />
          <p>No services found matching your criteria.</p>
        </div>
      )}

      {/* Order Dialog */}
      <Dialog open={isOrderOpen} onOpenChange={setIsOrderOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Order Service</DialogTitle>
            <DialogDescription>
              Charge {selectedService?.name} to guest room.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg flex justify-between items-center border">
              <div>
                <h4 className="font-semibold">{selectedService?.name}</h4>
                <p className="text-sm text-muted-foreground capitalize">{selectedService?.category}</p>
              </div>
              <div className="text-right">
                <div className="font-bold text-lg">{selectedService && formatCurrency(selectedService.price)}</div>
                <div className="text-xs text-muted-foreground">per unit</div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Select Guest / Room *</Label>
              <Select value={selectedGuestId} onValueChange={setSelectedGuestId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a room..." />
                </SelectTrigger>
                <SelectContent>
                  {activeGuests.length === 0 ? (
                    <SelectItem value="none" disabled>No active guests found</SelectItem>
                  ) : (
                    activeGuests.map((guest) => (
                      <SelectItem key={guest.reservation_id} value={guest.reservation_id}>
                        Room {guest.room_number} - {guest.guest_name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Quantity</Label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    -
                  </Button>
                  <Input
                    type="number"
                    className="text-center"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    +
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Total Price</Label>
                <div className="h-10 px-3 py-2 bg-muted rounded-md font-bold flex items-center justify-end text-primary">
                  {selectedService && formatCurrency(selectedService.price * quantity)}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Notes (Optional)</Label>
              <Textarea
                placeholder="Special requests, time preference, etc."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOrderOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmitOrder} disabled={!selectedGuestId || isSubmitting}>
              {isSubmitting ? "Processing..." : "Confirm Order"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manage Service Dialog (Add/Edit) */}
      <Dialog open={isManageOpen} onOpenChange={setIsManageOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Service' : 'Add New Service'}</DialogTitle>
            <DialogDescription>
              {isEditing ? 'Update service details.' : 'Create a new service offering.'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Service Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Nasi Goreng"
                />
              </div>
              <div className="space-y-2">
                <Label>Price (IDR) *</Label>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={formData.category}
                onValueChange={(val) => setFormData({ ...formData, category: val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the service..."
              />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg bg-slate-50 dark:bg-slate-900">
              <div className="space-y-0.5">
                <Label className="text-base">Available</Label>
                <p className="text-xs text-muted-foreground">Can guests order this?</p>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant={formData.is_available ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFormData({ ...formData, is_available: !formData.is_available })}
                >
                  {formData.is_available ? "Yes" : "No"}
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsManageOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveService} disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Service"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
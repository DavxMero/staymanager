'use client'

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { createClient } from "@supabase/supabase-js"
import {
  Package,
  Search,
  Filter,
  Plus,
  MoreVertical,
  AlertTriangle,
  Download,
  RefreshCw,
  Truck,
  DollarSign,
  TrendingUp,
  TrendingDown,
  PackageX,
  PackageCheck,
  BarChart3,
  MapPin,
  Edit,
  Trash2,
  Minus,
  FileText,
  Users,
  Calendar,
  CheckCircle2,
  XCircle
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { InventoryItem, InventorySupplier, PurchaseOrder } from "@/types"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const INVENTORY_CATEGORIES = [
  { value: 'housekeeping', label: 'Housekeeping', color: 'bg-blue-100 text-blue-800' },
  { value: 'maintenance', label: 'Maintenance', color: 'bg-gray-100 text-gray-800' },
  { value: 'food', label: 'Food', color: 'bg-green-100 text-green-800' },
  { value: 'beverage', label: 'Beverage', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'amenities', label: 'Amenities', color: 'bg-purple-100 text-purple-800' },
  { value: 'office', label: 'Office Supplies', color: 'bg-indigo-100 text-indigo-800' },
  { value: 'other', label: 'Other', color: 'bg-slate-100 text-slate-800' },
]

const STATUS_OPTIONS = [
  { value: 'in-stock', label: 'In Stock', color: 'bg-green-100 text-green-800' },
  { value: 'low-stock', label: 'Low Stock', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'out-of-stock', label: 'Out of Stock', color: 'bg-red-100 text-red-800' },
  { value: 'discontinued', label: 'Discontinued', color: 'bg-gray-100 text-gray-800' },
]

const UNITS = ['pcs', 'kg', 'liter', 'box', 'pack', 'bottle', 'can', 'set', 'meter', 'roll']

export default function LogisticsPage() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("inventory")
  const [loading, setLoading] = useState(true)

  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [suppliers, setSuppliers] = useState<InventorySupplier[]>([])
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([])

  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState({
    category: 'all',
    status: 'all',
    lowStock: false
  })

  const [isAddItemOpen, setIsAddItemOpen] = useState(false)
  const [isAddSupplierOpen, setIsAddSupplierOpen] = useState(false)
  const [isCreatePOOpen, setIsCreatePOOpen] = useState(false)

  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)

  const [poItems, setPoItems] = useState<{ item_id: string, quantity_ordered: number, unit_cost: number }[]>([])
  const [newPoItem, setNewPoItem] = useState({ item_id: '', quantity_ordered: 1, unit_cost: 0 })

  const [itemFormData, setItemFormData] = useState({
    name: '',
    description: '',
    category: '',
    current_stock: '',
    min_stock: '',
    max_stock: '',
    unit: '',
    unit_cost: '',
    supplier: '',
    location: '',
  })

  const [supplierFormData, setSupplierFormData] = useState({
    name: '',
    contact_person: '',
    email: '',
    phone: '',
    address: ''
  })

  const [poFormData, setPoFormData] = useState({
    po_number: '',
    supplier_id: '',
    expected_delivery_date: '',
    notes: ''
  })

  const stats = {
    totalItems: inventory.length,
    totalValue: inventory.reduce((acc, item) => acc + (item.current_stock * item.unit_cost), 0),
    lowStockItems: inventory.filter(item => item.current_stock <= item.min_stock && item.current_stock > 0).length,
    outOfStockItems: inventory.filter(item => item.current_stock === 0).length,
    categoriesCount: new Set(inventory.map(i => i.category)).size
  }

  const fetchInventory = async () => {
    try {
      const response = await fetch('/api/inventory')
      const result = await response.json()
      if (result.success) {
        setInventory(result.data)
      }
    } catch (error) {
      console.error('Failed to fetch inventory:', error)
    }
  }

  const fetchSuppliers = async () => {
    try {
      const response = await fetch('/api/suppliers')
      const result = await response.json()
      if (result.success) {
        setSuppliers(result.data)
      }
    } catch (error) {
      console.error('Failed to fetch suppliers:', error)
    }
  }

  const fetchPurchaseOrders = async () => {
    try {
      const response = await fetch('/api/purchase-orders')
      const result = await response.json()
      if (result.success) {
        setPurchaseOrders(result.data)
      }
    } catch (error) {
      console.error('Failed to fetch POs:', error)
    }
  }

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([fetchInventory(), fetchSuppliers(), fetchPurchaseOrders()])
      setLoading(false)
    }
    loadData()
  }, [])

  const handleSaveItem = async () => {
    try {
      const url = '/api/inventory'
      const method = editingItem ? 'PUT' : 'POST'
      const body = editingItem ? { ...itemFormData, id: editingItem.id } : itemFormData

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      const result = await response.json()
      if (result.success) {
        toast({ title: "Success", description: result.message })
        setIsAddItemOpen(false)
        setEditingItem(null)
        resetItemForm()
        fetchInventory()
      } else {
        throw new Error(result.error)
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message })
    }
  }

  const handleSaveSupplier = async () => {
    try {
      const response = await fetch('/api/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(supplierFormData)
      })
      const result = await response.json()
      if (result.success) {
        toast({ title: "Success", description: "Supplier added successfully" })
        setIsAddSupplierOpen(false)
        setSupplierFormData({ name: '', contact_person: '', email: '', phone: '', address: '' })
        fetchSuppliers()
      } else {
        throw new Error(result.error)
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message })
    }
  }

  const handleAddPOItem = () => {
    if (!newPoItem.item_id || newPoItem.quantity_ordered <= 0) return

    const item = inventory.find(i => i.id.toString() === newPoItem.item_id)
    const cost = newPoItem.unit_cost || item?.unit_cost || 0

    setPoItems([...poItems, { ...newPoItem, unit_cost: cost }])
    setNewPoItem({ item_id: '', quantity_ordered: 1, unit_cost: 0 })
  }

  const handleRemovePOItem = (index: number) => {
    const newItems = [...poItems]
    newItems.splice(index, 1)
    setPoItems(newItems)
  }

  const handleCreatePO = async () => {
    try {
      const response = await fetch('/api/purchase-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...poFormData,
          status: 'draft',
          items: poItems
        })
      })
      const result = await response.json()
      if (result.success) {
        toast({ title: "Success", description: "Purchase Order created successfully" })
        setIsCreatePOOpen(false)
        setPoFormData({ po_number: '', supplier_id: '', expected_delivery_date: '', notes: '' })
        setPoItems([])
        fetchPurchaseOrders()
      } else {
        throw new Error(result.error)
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message })
    }
  }

  const handleReceivePO = async (poId: number) => {
    if (!confirm("Are you sure you want to receive this PO? This will update inventory stock.")) return

    try {
      const response = await fetch(`/api/purchase-orders/${poId}/receive`, {
        method: 'POST'
      })
      const result = await response.json()
      if (result.success) {
        toast({ title: "Success", description: "Goods received successfully" })
        fetchPurchaseOrders()
        fetchInventory()
      } else {
        throw new Error(result.error)
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message })
    }
  }

  const resetItemForm = () => {
    setItemFormData({
      name: '', description: '', category: '', current_stock: '', min_stock: '',
      max_stock: '', unit: '', unit_cost: '', supplier: '', location: ''
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0
    }).format(amount)
  }

  const getCategoryInfo = (category: string) =>
    INVENTORY_CATEGORIES.find(cat => cat.value === category) || INVENTORY_CATEGORIES[INVENTORY_CATEGORIES.length - 1]

  const getStatusInfo = (status: string) =>
    STATUS_OPTIONS.find(s => s.value === status) || STATUS_OPTIONS[0]

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filters.category === 'all' || item.category === filters.category
    const matchesStatus = filters.status === 'all' || item.status === filters.status
    const matchesLowStock = !filters.lowStock || item.current_stock <= item.min_stock

    return matchesSearch && matchesCategory && matchesStatus && matchesLowStock
  })

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg">
              <Package className="h-8 w-8 text-white" />
            </div>
            Logistics & Procurement
          </h1>
          <p className="text-muted-foreground text-lg mt-2">
            Manage inventory, suppliers, and purchase orders
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => fetchInventory()}>
            <RefreshCw className="h-4 w-4 mr-2" /> Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Inventory Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalValue)}</div>
            <p className="text-xs text-muted-foreground">Across {stats.totalItems} items</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.lowStockItems}</div>
            <p className="text-xs text-muted-foreground">Items below minimum stock</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active POs</CardTitle>
            <Truck className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {purchaseOrders.filter(po => po.status !== 'received' && po.status !== 'cancelled').length}
            </div>
            <p className="text-xs text-muted-foreground">Pending delivery</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suppliers</CardTitle>
            <Users className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{suppliers.length}</div>
            <p className="text-xs text-muted-foreground">Active suppliers</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="inventory" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
          <TabsTrigger value="procurement">Procurement (PO)</TabsTrigger>
        </TabsList>

        {/* Inventory Tab */}
        <TabsContent value="inventory" className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex gap-2 items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search items..."
                  className="pl-10 w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={filters.category} onValueChange={(v) => setFilters(prev => ({ ...prev, category: v }))}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {INVENTORY_CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Dialog open={isAddItemOpen} onOpenChange={setIsAddItemOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => { setEditingItem(null); resetItemForm(); }}>
                  <Plus className="h-4 w-4 mr-2" /> Add Item
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{editingItem ? 'Edit Item' : 'Add New Item'}</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4 py-4">
                  <div className="col-span-2">
                    <Label>Name</Label>
                    <Input value={itemFormData.name} onChange={e => setItemFormData({ ...itemFormData, name: e.target.value })} />
                  </div>
                  <div className="col-span-2">
                    <Label>Description</Label>
                    <Textarea value={itemFormData.description} onChange={e => setItemFormData({ ...itemFormData, description: e.target.value })} />
                  </div>
                  <div>
                    <Label>Category</Label>
                    <Select value={itemFormData.category} onValueChange={v => setItemFormData({ ...itemFormData, category: v })}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        {INVENTORY_CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Unit</Label>
                    <Select value={itemFormData.unit} onValueChange={v => setItemFormData({ ...itemFormData, unit: v })}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        {UNITS.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Current Stock</Label>
                    <Input type="number" value={itemFormData.current_stock} onChange={e => setItemFormData({ ...itemFormData, current_stock: e.target.value })} />
                  </div>
                  <div>
                    <Label>Min Stock</Label>
                    <Input type="number" value={itemFormData.min_stock} onChange={e => setItemFormData({ ...itemFormData, min_stock: e.target.value })} />
                  </div>
                  <div>
                    <Label>Max Stock</Label>
                    <Input type="number" value={itemFormData.max_stock} onChange={e => setItemFormData({ ...itemFormData, max_stock: e.target.value })} />
                  </div>
                  <div>
                    <Label>Unit Cost</Label>
                    <Input type="number" value={itemFormData.unit_cost} onChange={e => setItemFormData({ ...itemFormData, unit_cost: e.target.value })} />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddItemOpen(false)}>Cancel</Button>
                  <Button onClick={handleSaveItem}>Save</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInventory.map(item => {
                    const categoryInfo = getCategoryInfo(item.category)
                    const statusInfo = getStatusInfo(item.status)
                    return (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="font-medium">{item.name}</div>
                          <div className="text-xs text-muted-foreground">{item.description}</div>
                        </TableCell>
                        <TableCell><Badge className={categoryInfo.color}>{categoryInfo.label}</Badge></TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <span className="text-sm font-medium">{item.current_stock} {item.unit}</span>
                            <Progress value={(item.current_stock / item.max_stock) * 100} className="h-1.5 w-24" />
                          </div>
                        </TableCell>
                        <TableCell>{formatCurrency(item.unit_cost * item.current_stock)}</TableCell>
                        <TableCell><Badge variant="outline" className={statusInfo.color}>{statusInfo.label}</Badge></TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => {
                            setEditingItem(item)
                            setItemFormData({
                              name: item.name,
                              description: item.description || '',
                              category: item.category,
                              current_stock: item.current_stock.toString(),
                              min_stock: item.min_stock.toString(),
                              max_stock: item.max_stock.toString(),
                              unit: item.unit,
                              unit_cost: item.unit_cost.toString(),
                              supplier: item.supplier || '',
                              location: item.location || ''
                            })
                            setIsAddItemOpen(true)
                          }}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Suppliers Tab */}
        <TabsContent value="suppliers" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={isAddSupplierOpen} onOpenChange={setIsAddSupplierOpen}>
              <DialogTrigger asChild>
                <Button><Plus className="h-4 w-4 mr-2" /> Add Supplier</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Supplier</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label>Company Name</Label>
                    <Input value={supplierFormData.name} onChange={e => setSupplierFormData({ ...supplierFormData, name: e.target.value })} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Contact Person</Label>
                    <Input value={supplierFormData.contact_person} onChange={e => setSupplierFormData({ ...supplierFormData, contact_person: e.target.value })} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Email</Label>
                    <Input value={supplierFormData.email} onChange={e => setSupplierFormData({ ...supplierFormData, email: e.target.value })} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Phone</Label>
                    <Input value={supplierFormData.phone} onChange={e => setSupplierFormData({ ...supplierFormData, phone: e.target.value })} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Address</Label>
                    <Textarea value={supplierFormData.address} onChange={e => setSupplierFormData({ ...supplierFormData, address: e.target.value })} />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddSupplierOpen(false)}>Cancel</Button>
                  <Button onClick={handleSaveSupplier}>Save Supplier</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Address</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {suppliers.map(supplier => (
                    <TableRow key={supplier.id}>
                      <TableCell className="font-medium">{supplier.name}</TableCell>
                      <TableCell>{supplier.contact_person}</TableCell>
                      <TableCell>{supplier.email}</TableCell>
                      <TableCell>{supplier.phone}</TableCell>
                      <TableCell>{supplier.address}</TableCell>
                    </TableRow>
                  ))}
                  {suppliers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No suppliers found</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Procurement Tab */}
        <TabsContent value="procurement" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={isCreatePOOpen} onOpenChange={setIsCreatePOOpen}>
              <DialogTrigger asChild>
                <Button><FileText className="h-4 w-4 mr-2" /> Create Purchase Order</Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Create Purchase Order</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>PO Number</Label>
                      <Input
                        placeholder="PO-YYYYMM-XXXX"
                        value={poFormData.po_number}
                        onChange={e => setPoFormData({ ...poFormData, po_number: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Supplier</Label>
                      <Select value={poFormData.supplier_id} onValueChange={v => setPoFormData({ ...poFormData, supplier_id: v })}>
                        <SelectTrigger><SelectValue placeholder="Select Supplier" /></SelectTrigger>
                        <SelectContent>
                          {suppliers.map(s => <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label>Expected Delivery</Label>
                      <Input type="date" value={poFormData.expected_delivery_date} onChange={e => setPoFormData({ ...poFormData, expected_delivery_date: e.target.value })} />
                    </div>
                    <div className="grid gap-2">
                      <Label>Notes</Label>
                      <Input value={poFormData.notes} onChange={e => setPoFormData({ ...poFormData, notes: e.target.value })} />
                    </div>
                  </div>

                  {/* Order Items Section */}
                  <div className="border rounded-lg p-4 space-y-4">
                    <h4 className="font-medium text-sm">Order Items</h4>
                    <div className="flex gap-2 items-end">
                      <div className="flex-1">
                        <Label className="text-xs">Item</Label>
                        <Select value={newPoItem.item_id} onValueChange={v => setNewPoItem({ ...newPoItem, item_id: v })}>
                          <SelectTrigger><SelectValue placeholder="Select Item" /></SelectTrigger>
                          <SelectContent>
                            {inventory.map(i => <SelectItem key={i.id} value={i.id.toString()}>{i.name} ({i.current_stock} {i.unit})</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="w-24">
                        <Label className="text-xs">Qty</Label>
                        <Input type="number" value={newPoItem.quantity_ordered} onChange={e => setNewPoItem({ ...newPoItem, quantity_ordered: parseInt(e.target.value) || 0 })} />
                      </div>
                      <div className="w-32">
                        <Label className="text-xs">Cost/Unit</Label>
                        <Input type="number" value={newPoItem.unit_cost} onChange={e => setNewPoItem({ ...newPoItem, unit_cost: parseFloat(e.target.value) || 0 })} />
                      </div>
                      <Button onClick={handleAddPOItem} size="icon"><Plus className="h-4 w-4" /></Button>
                    </div>

                    <div className="max-h-40 overflow-y-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="py-2">Item</TableHead>
                            <TableHead className="py-2">Qty</TableHead>
                            <TableHead className="py-2">Cost</TableHead>
                            <TableHead className="py-2 w-10"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {poItems.map((item, idx) => {
                            const invItem = inventory.find(i => i.id.toString() === item.item_id)
                            return (
                              <TableRow key={idx}>
                                <TableCell className="py-2">{invItem?.name || 'Unknown'}</TableCell>
                                <TableCell className="py-2">{item.quantity_ordered}</TableCell>
                                <TableCell className="py-2">{formatCurrency(item.unit_cost)}</TableCell>
                                <TableCell className="py-2">
                                  <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500" onClick={() => handleRemovePOItem(idx)}>
                                    <Minus className="h-3 w-3" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            )
                          })}
                          {poItems.length === 0 && (
                            <TableRow>
                              <TableCell colSpan={4} className="text-center text-xs text-muted-foreground py-4">No items added</TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreatePOOpen(false)}>Cancel</Button>
                  <Button onClick={handleCreatePO}>Create PO</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>PO Number</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Expected Delivery</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchaseOrders.map(po => (
                    <TableRow key={po.id}>
                      <TableCell className="font-medium">{po.po_number}</TableCell>
                      <TableCell>{po.supplier?.name || 'Unknown'}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={
                          po.status === 'received' ? 'bg-green-100 text-green-800' :
                            po.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                              'bg-blue-100 text-blue-800'
                        }>
                          {po.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>{po.expected_delivery_date ? new Date(po.expected_delivery_date).toLocaleDateString() : '-'}</TableCell>
                      <TableCell>{formatCurrency(po.total_amount)}</TableCell>
                      <TableCell className="text-right">
                        {po.status !== 'received' && po.status !== 'cancelled' && (
                          <Button
                            size="sm"
                            variant="default"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleReceivePO(po.id)}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-1" /> Receive
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {purchaseOrders.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No purchase orders found</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
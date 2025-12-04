'use client'

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Textarea } from "@/components/ui/textarea"
import {
  UserCog,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Clock,
  Phone,
  Mail,
  Calendar,
  Shield,
  CheckCircle,
  AlertCircle,
  Coffee,
  UserX,
  Heart,
} from "lucide-react"
import { supabase } from "@/lib/supabaseClient"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"

interface StaffMember {
  id: number
  created_at: string
  employee_id: string
  full_name: string
  email?: string
  phone?: string
  role: string
  department?: string
  shift_start: string
  shift_end: string
  status: string
  is_active: boolean
  hire_date: string
  hourly_rate?: number
  skills?: string[]
  languages?: string[]
  address?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
}

const STATUS_CONFIG = {
  available: { label: 'Available', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  busy: { label: 'Busy', color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle },
  'on-break': { label: 'On Break', color: 'bg-blue-100 text-blue-800', icon: Coffee },
  'on-leave': { label: 'On Leave', color: 'bg-purple-100 text-purple-800', icon: Calendar },
  'off-duty': { label: 'Off Duty', color: 'bg-gray-100 text-gray-800', icon: UserX },
  sick: { label: 'Sick', color: 'bg-red-100 text-red-800', icon: Heart },
}

const ROLE_OPTIONS = [
  'front-desk',
  'housekeeper',
  'senior-housekeeper',
  'housekeeping-supervisor',
  'maintenance',
  'security',
  'kitchen',
  'restaurant',
  'manager',
  'admin'
]

const DEPARTMENT_OPTIONS = [
  'front-office',
  'housekeeping',
  'maintenance',
  'security',
  'food-beverage',
  'management',
  'administration'
]

export default function StaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [filteredStaff, setFilteredStaff] = useState<StaffMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  // Dialog states
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null)

  // Filter states
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [departmentFilter, setDepartmentFilter] = useState("all")

  // Form states
  const [formData, setFormData] = useState({
    employee_id: '',
    full_name: '',
    email: '',
    phone: '',
    role: '',
    department: '',
    shift_start: '08:00:00',
    shift_end: '16:00:00',
    status: 'available',
    hire_date: '',
    hourly_rate: '',
    address: '',
    emergency_contact_name: '',
    emergency_contact_phone: ''
  })

  const applyFilters = useCallback(() => {
    let result = [...staff]

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(member =>
        member.full_name.toLowerCase().includes(term) ||
        member.employee_id.toLowerCase().includes(term) ||
        (member.role?.toLowerCase() || '').includes(term) ||
        (member.department?.toLowerCase() || '').includes(term) ||
        (member.email?.toLowerCase() || '').includes(term)
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter(member => member.status === statusFilter)
    }

    // Department filter
    if (departmentFilter !== 'all') {
      result = result.filter(member => member.department === departmentFilter)
    }

    setFilteredStaff(result)
  }, [staff, searchTerm, statusFilter, departmentFilter])

  useEffect(() => {
    fetchStaff()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [applyFilters])

  const fetchStaff = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('staff_members')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        if (error.message?.includes('relation "staff_members" does not exist')) {
          setError('Staff table not found. Please set up the staff database first.')
          setStaff([])
          return
        }
        throw error
      }

      setStaff(data || [])
      console.log(`Loaded ${(data || []).length} staff members`)
    } catch (err) {
      console.error('Error fetching staff:', err)
      setError('Failed to load staff: ' + (err as Error).message)
    } finally {
      setLoading(false)
    }
  }


  const resetForm = () => {
    setFormData({
      employee_id: '',
      full_name: '',
      email: '',
      phone: '',
      role: '',
      department: '',
      shift_start: '08:00:00',
      shift_end: '16:00:00',
      status: 'available',
      hire_date: '',
      hourly_rate: '',
      address: '',
      emergency_contact_name: '',
      emergency_contact_phone: ''
    })
    setEditingStaff(null)
  }

  const handleAdd = () => {
    resetForm()
    setIsDialogOpen(true)
  }

  const handleEdit = (member: StaffMember) => {
    setEditingStaff(member)
    setFormData({
      employee_id: member.employee_id,
      full_name: member.full_name,
      email: member.email || '',
      phone: member.phone || '',
      role: member.role,
      department: member.department || '',
      shift_start: member.shift_start,
      shift_end: member.shift_end,
      status: member.status,
      hire_date: member.hire_date,
      hourly_rate: member.hourly_rate?.toString() || '',
      address: member.address || '',
      emergency_contact_name: member.emergency_contact_name || '',
      emergency_contact_phone: member.emergency_contact_phone || ''
    })
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    try {
      if (!formData.full_name || !formData.employee_id || !formData.role || !formData.department) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please fill in all required fields",
        })
        return
      }

      const staffData = {
        employee_id: formData.employee_id,
        full_name: formData.full_name,
        email: formData.email || null,
        phone: formData.phone || null,
        role: formData.role,
        department: formData.department,
        shift_start: formData.shift_start,
        shift_end: formData.shift_end,
        status: formData.status,
        hire_date: formData.hire_date,
        hourly_rate: formData.hourly_rate ? parseFloat(formData.hourly_rate) : null,
        address: formData.address || null,
        emergency_contact_name: formData.emergency_contact_name || null,
        emergency_contact_phone: formData.emergency_contact_phone || null,
      }

      if (editingStaff) {
        // Update existing staff
        const { error } = await supabase
          .from('staff_members')
          .update(staffData)
          .eq('id', editingStaff.id)

        if (error) throw error

        toast({
          title: "Success",
          description: "Staff member updated successfully",
        })
      } else {
        // Create new staff
        const { error } = await supabase
          .from('staff_members')
          .insert(staffData)

        if (error) throw error

        toast({
          title: "Success",
          description: "Staff member added successfully",
        })
      }

      setIsDialogOpen(false)
      resetForm()
      fetchStaff()
    } catch (err) {
      console.error('Error saving staff:', err)
      toast({
        variant: "destructive",
        title: "Error",
        description: 'Failed to save staff member: ' + (err as Error).message,
      })
    }
  }

  const handleDelete = async (member: StaffMember) => {
    if (!confirm(`Are you sure you want to delete ${member.full_name}?`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('staff_members')
        .delete()
        .eq('id', member.id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Staff member deleted successfully",
      })

      fetchStaff()
    } catch (err) {
      console.error('Error deleting staff:', err)
      toast({
        variant: "destructive",
        title: "Error",
        description: 'Failed to delete staff member: ' + (err as Error).message,
      })
    }
  }

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container mx-auto py-8"
      >
        <Card>
          <CardContent className="text-center py-16">
            <AlertCircle className="mx-auto h-16 w-16 text-muted-foreground mb-6" />
            <h3 className="text-xl font-semibold text-foreground mb-3">Database Setup Required</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {error}
            </p>
            <p className="text-sm text-muted-foreground">
              Please run the staff setup SQL script in your Supabase database to get started.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="container mx-auto py-8 space-y-8"
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <UserCog className="h-8 w-8 text-primary" />
            Staff Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your hotel staff members, schedules, and assignments
          </p>
        </div>
        <Button onClick={handleAdd} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Staff Member
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Staff</p>
              <p className="text-2xl font-bold">{staff.length}</p>
            </div>
            <UserCog className="h-8 w-8 text-muted-foreground" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Available</p>
              <p className="text-2xl font-bold text-green-600">
                {staff.filter(s => s.status === 'available').length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground">On Duty</p>
              <p className="text-2xl font-bold text-blue-600">
                {staff.filter(s => s.status === 'busy' || s.status === 'available').length}
              </p>
            </div>
            <Clock className="h-8 w-8 text-blue-600" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Departments</p>
              <p className="text-2xl font-bold">
                {new Set(staff.map(s => s.department)).size}
              </p>
            </div>
            <Shield className="h-8 w-8 text-muted-foreground" />
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, ID, role, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {Object.entries(STATUS_CONFIG).map(([status, config]) => (
                  <SelectItem key={status} value={status}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {DEPARTMENT_OPTIONS.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept.split('-').map(word =>
                      word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Staff Table */}
      <Card>
        <CardHeader>
          <CardTitle>Staff Members ({filteredStaff.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredStaff.length === 0 ? (
            <div className="text-center py-16">
              <UserCog className="mx-auto h-16 w-16 text-muted-foreground mb-6" />
              <h3 className="text-xl font-semibold text-foreground mb-3">No Staff Found</h3>
              <p className="text-muted-foreground mb-6">
                {staff.length === 0
                  ? "No staff members have been added yet."
                  : "No staff members match your current filters."
                }
              </p>
              {staff.length === 0 && (
                <Button onClick={handleAdd} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add First Staff Member
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Role & Department</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Shift</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStaff.map((member) => {
                    const statusConfig = STATUS_CONFIG[member.status as keyof typeof STATUS_CONFIG]
                    const StatusIcon = statusConfig?.icon || AlertCircle

                    return (
                      <TableRow key={member.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{member.full_name}</div>
                            <div className="text-sm text-muted-foreground">{member.employee_id}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium capitalize">{member.role?.replace('-', ' ') || 'No Role'}</div>
                            <div className="text-sm text-muted-foreground capitalize">
                              {member.department?.replace('-', ' ') || 'No Department'}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={statusConfig?.color}>
                            <StatusIcon className="mr-1 h-3 w-3" />
                            {statusConfig?.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{formatTime(member.shift_start)}</div>
                            <div className="text-muted-foreground">
                              to {formatTime(member.shift_end)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {member.phone && (
                              <div className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {member.phone}
                              </div>
                            )}
                            {member.email && (
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Mail className="h-3 w-3" />
                                {member.email}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEdit(member)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDelete(member)}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto invisible-scrollbar">
          <DialogHeader>
            <DialogTitle>
              {editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}
            </DialogTitle>
            <DialogDescription>
              {editingStaff
                ? 'Update the staff member information below.'
                : 'Fill in the details to add a new staff member.'
              }
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            {/* Basic Information */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                Basic Information
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="employee_id">Employee ID *</Label>
                  <Input
                    id="employee_id"
                    value={formData.employee_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, employee_id: e.target.value }))}
                    placeholder="FO001, HK001, etc."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name *</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                    placeholder="Enter full name"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="email@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+62 812-3456-7890"
                  />
                </div>
              </div>
            </div>

            {/* Job Information */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                Job Information
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="role">Role *</Label>
                  <Select value={formData.role} onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLE_OPTIONS.map((role) => (
                        <SelectItem key={role} value={role}>
                          {role.split('-').map(word =>
                            word.charAt(0).toUpperCase() + word.slice(1)
                          ).join(' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department *</Label>
                  <Select value={formData.department} onValueChange={(value) => setFormData(prev => ({ ...prev, department: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {DEPARTMENT_OPTIONS.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept.split('-').map(word =>
                            word.charAt(0).toUpperCase() + word.slice(1)
                          ).join(' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(STATUS_CONFIG).map(([status, config]) => (
                        <SelectItem key={status} value={status}>
                          {config.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hire_date">Hire Date</Label>
                  <Input
                    id="hire_date"
                    type="date"
                    value={formData.hire_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, hire_date: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hourly_rate">Hourly Rate (Rp)</Label>
                  <Input
                    id="hourly_rate"
                    type="number"
                    value={formData.hourly_rate}
                    onChange={(e) => setFormData(prev => ({ ...prev, hourly_rate: e.target.value }))}
                    placeholder="50000"
                  />
                </div>
              </div>
            </div>

            {/* Schedule */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                Work Schedule
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="shift_start">Shift Start</Label>
                  <Input
                    id="shift_start"
                    type="time"
                    value={formData.shift_start}
                    onChange={(e) => setFormData(prev => ({ ...prev, shift_start: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shift_end">Shift End</Label>
                  <Input
                    id="shift_end"
                    type="time"
                    value={formData.shift_end}
                    onChange={(e) => setFormData(prev => ({ ...prev, shift_end: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                Additional Information
              </h4>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Enter home address"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emergency_contact_name">Emergency Contact Name</Label>
                  <Input
                    id="emergency_contact_name"
                    value={formData.emergency_contact_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, emergency_contact_name: e.target.value }))}
                    placeholder="Enter name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergency_contact_phone">Emergency Contact Phone</Label>
                  <Input
                    id="emergency_contact_phone"
                    value={formData.emergency_contact_phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, emergency_contact_phone: e.target.value }))}
                    placeholder="+62 812-xxxx-xxxx"
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editingStaff ? 'Update Staff' : 'Add Staff'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Toaster />
    </motion.div>
  )
}
'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Building, Clock, MapPin, Save, Loader2, Globe } from 'lucide-react'

export function HotelSettings() {
    const [loading, setLoading] = useState(false)

    const [formData, setFormData] = useState({
        name: 'StayManager Hotel',
        address: '123 Hospitality Lane, Resort City',
        checkIn: '14:00',
        checkOut: '11:00',
        currency: 'IDR',
        description: 'A luxury stay experience.',
        cancellationPolicy: 'Free cancellation up to 24 hours before check-in.'
    })

    const handleSave = async () => {
        setLoading(true)
        await new Promise(resolve => setTimeout(resolve, 1500))
        setLoading(false)
        toast.success('Hotel configuration saved')
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Building className="h-5 w-5" />
                        Property Information
                    </CardTitle>
                    <CardDescription>
                        General details about your hotel property
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="hotelName">Hotel Name</Label>
                        <Input
                            id="hotelName"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="address">Address</Label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="address"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                className="pl-9"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={3}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Policies & Localization
                    </CardTitle>
                    <CardDescription>
                        Set check-in/out times and currency
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="checkIn">Check-in Time</Label>
                            <Input
                                id="checkIn"
                                type="time"
                                value={formData.checkIn}
                                onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="checkOut">Check-out Time</Label>
                            <Input
                                id="checkOut"
                                type="time"
                                value={formData.checkOut}
                                onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="currency">Currency</Label>
                        <Select
                            value={formData.currency}
                            onValueChange={(val) => setFormData({ ...formData, currency: val })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select currency" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="IDR">IDR (Indonesian Rupiah)</SelectItem>
                                <SelectItem value="USD">USD (US Dollar)</SelectItem>
                                <SelectItem value="EUR">EUR (Euro)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="cancellation">Cancellation Policy</Label>
                        <Textarea
                            id="cancellation"
                            value={formData.cancellationPolicy}
                            onChange={(e) => setFormData({ ...formData, cancellationPolicy: e.target.value })}
                            rows={2}
                            placeholder="Enter cancellation policy text..."
                        />
                        <p className="text-xs text-muted-foreground">This text will be used by the AI chatbot to answer guest queries.</p>
                    </div>

                    <div className="pt-4 flex justify-end">
                        <Button onClick={handleSave} disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Save Configuration
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

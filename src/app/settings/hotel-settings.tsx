'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Building, Clock, MapPin, Save, Loader2, ImageIcon, Upload, X, Palette, Trash2 } from 'lucide-react'
import { useBranding } from '@/lib/hooks/useBranding'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'

export function HotelSettings() {
    const [loading, setLoading] = useState(false)
    const [brandingLoading, setBrandingLoading] = useState(false)
    const [logoFile, setLogoFile] = useState<File | null>(null)
    const [logoPreview, setLogoPreview] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const { branding, updateBranding, refreshBranding } = useBranding()
    const supabase = createClient()

    const [formData, setFormData] = useState({
        name: 'StayManager Hotel',
        address: '123 Hospitality Lane, Resort City',
        checkIn: '14:00',
        checkOut: '11:00',
        currency: 'IDR',
        description: 'A luxury stay experience.',
        cancellationPolicy: 'Free cancellation up to 24 hours before check-in.'
    })

    const [brandingData, setBrandingData] = useState({
        brandName: branding.brandName,
    })

    useEffect(() => {
        setBrandingData({ brandName: branding.brandName })
        if (branding.brandLogoUrl) {
            setLogoPreview(branding.brandLogoUrl)
        }
    }, [branding])

    const handleSave = async () => {
        setLoading(true)
        await new Promise(resolve => setTimeout(resolve, 1500))
        setLoading(false)
        toast.success('Hotel configuration saved')
    }

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                toast.error('Logo file must be less than 2MB')
                return
            }
            if (!['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp'].includes(file.type)) {
                toast.error('Please upload PNG, JPG, SVG, or WebP file')
                return
            }
            setLogoFile(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setLogoPreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleRemoveLogo = () => {
        setLogoFile(null)
        setLogoPreview(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const handleDeleteLogo = async () => {
        setBrandingLoading(true)
        try {
            if (branding.brandLogoUrl) {
                const oldFileName = branding.brandLogoUrl.split('/').pop()
                if (oldFileName) {
                    await supabase.storage.from('branding').remove([oldFileName])
                }
            }

            await updateBranding({ brandLogoUrl: null })
            await refreshBranding()

            setLogoFile(null)
            setLogoPreview(null)
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }

            toast.success('Logo deleted. Default icon will be used.')
        } catch (error) {
            console.error('Error deleting logo:', error)
            toast.error('Failed to delete logo')
        } finally {
            setBrandingLoading(false)
        }
    }

    const handleSaveBranding = async () => {
        setBrandingLoading(true)
        try {
            let logoUrl = branding.brandLogoUrl

            if (logoFile) {
                const fileExt = logoFile.name.split('.').pop()
                const fileName = `logo-${Date.now()}.${fileExt}`

                const { data: buckets } = await supabase.storage.listBuckets()
                const brandingBucketExists = buckets?.some(b => b.name === 'branding')

                if (!brandingBucketExists) {
                    await supabase.storage.createBucket('branding', {
                        public: true,
                        fileSizeLimit: 2 * 1024 * 1024,
                    })
                }

                if (branding.brandLogoUrl) {
                    const oldFileName = branding.brandLogoUrl.split('/').pop()
                    if (oldFileName) {
                        await supabase.storage.from('branding').remove([oldFileName])
                    }
                }

                const { error: uploadError } = await supabase.storage
                    .from('branding')
                    .upload(fileName, logoFile, {
                        cacheControl: '3600',
                        upsert: true,
                    })

                if (uploadError) {
                    throw uploadError
                }

                const { data: { publicUrl } } = supabase.storage
                    .from('branding')
                    .getPublicUrl(fileName)

                logoUrl = publicUrl
            } else if (!logoPreview && branding.brandLogoUrl) {
                const oldFileName = branding.brandLogoUrl.split('/').pop()
                if (oldFileName) {
                    await supabase.storage.from('branding').remove([oldFileName])
                }
                logoUrl = null
            }

            await updateBranding({
                brandName: brandingData.brandName || 'StayManager',
                brandLogoUrl: logoUrl,
            })

            await refreshBranding()
            setLogoFile(null)
            toast.success('Branding settings saved successfully!')
        } catch (error) {
            console.error('Error saving branding:', error)
            toast.error('Failed to save branding settings')
        } finally {
            setBrandingLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Palette className="h-5 w-5" />
                        Branding
                    </CardTitle>
                    <CardDescription>
                        Customize your hotel&apos;s logo and brand name displayed in the sidebar and landing page
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="brandName">Brand Name</Label>
                        <Input
                            id="brandName"
                            value={brandingData.brandName}
                            onChange={(e) => setBrandingData({ ...brandingData, brandName: e.target.value })}
                            placeholder="StayManager"
                        />
                        <p className="text-xs text-muted-foreground">
                            This name will appear in the sidebar header and landing page
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label>Logo</Label>
                        <div className="flex items-start gap-4">
                            <div className="relative w-20 h-20 border rounded-lg flex items-center justify-center bg-muted/50 overflow-hidden">
                                {logoPreview ? (
                                    <>
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={logoPreview}
                                            alt="Logo preview"
                                            className="w-full h-full object-contain p-2"
                                        />
                                        <button
                                            onClick={handleRemoveLogo}
                                            className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 hover:bg-destructive/90"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </>
                                ) : (
                                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                                )}
                            </div>
                            <div className="flex-1 space-y-2">
                                <Input
                                    ref={fileInputRef}
                                    id="logo"
                                    type="file"
                                    accept="image/png,image/jpeg,image/svg+xml,image/webp"
                                    onChange={handleLogoChange}
                                    className="hidden"
                                />
                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="flex-1"
                                    >
                                        <Upload className="mr-2 h-4 w-4" />
                                        Upload Logo
                                    </Button>
                                    {(logoPreview || branding.brandLogoUrl) && (
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            onClick={handleDeleteLogo}
                                            disabled={brandingLoading}
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Delete
                                        </Button>
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    PNG, JPG, SVG or WebP. Max 2MB. Recommended: 200x200px
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                        <Button onClick={handleSaveBranding} disabled={brandingLoading}>
                            {brandingLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Save Branding
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>

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


import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { toast } from 'sonner'
import { User as UserIcon, Mail, Phone, Save, Loader2 } from 'lucide-react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

const COUNTRY_CODES = [
    { code: '+62', country: 'ID', label: 'Indonesia (+62)' },
    { code: '+1', country: 'US', label: 'United States (+1)' },
    { code: '+65', country: 'SG', label: 'Singapore (+65)' },
    { code: '+60', country: 'MY', label: 'Malaysia (+60)' },
    { code: '+61', country: 'AU', label: 'Australia (+61)' },
    { code: '+81', country: 'JP', label: 'Japan (+81)' },
    { code: '+44', country: 'UK', label: 'United Kingdom (+44)' },
    { code: '+86', country: 'CN', label: 'China (+86)' },
]

export function ProfileSettings() {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(false)
    const [fullName, setFullName] = useState('')
    const [phone, setPhone] = useState('')
    const [countryCode, setCountryCode] = useState('+62')
    const supabase = createClient()

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                setUser(user)
                setFullName(user.user_metadata?.full_name || '')
                // Try to parse phone number if it exists
                const savedPhone = user.user_metadata?.phone || ''
                if (savedPhone) {
                    // Simple logic to split code and number if possible, 
                    // otherwise just set number and default code
                    // For now, we assume saved phone might not have the format we want perfectly
                    // so we just set the number part if it matches our current code, or just raw
                    setPhone(savedPhone)
                }
            }
        }
        fetchUser()
    }, [supabase])

    const handleSave = async () => {
        if (!user) return
        setLoading(true)
        try {
            // Combine code and phone for saving, or save separately if schema allows.
            // Standard practice: save E.164 format or just the full string
            const fullPhoneNumber = `${countryCode} ${phone}`

            const { error } = await supabase.auth.updateUser({
                data: {
                    full_name: fullName,
                    phone: phone, // Saving just the number part for display simplicity in this demo
                    phone_full: fullPhoneNumber // Optional: save full format
                }
            })

            if (error) throw error
            toast.success('Profile updated successfully')
        } catch (error: any) {
            toast.error(error.message || 'Failed to update profile')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <UserIcon className="h-5 w-5" />
                    Personal Information
                </CardTitle>
                <CardDescription>
                    Update your personal details and contact information
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            id="email"
                            value={user?.email || ''}
                            disabled
                            className="pl-9 bg-muted"
                        />
                    </div>
                    <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <div className="relative">
                        <UserIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            id="fullName"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="pl-9"
                            placeholder="John Doe"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="flex gap-2">
                        <Select value={countryCode} onValueChange={setCountryCode}>
                            <SelectTrigger className="w-[140px]">
                                <SelectValue placeholder="Code" />
                            </SelectTrigger>
                            <SelectContent>
                                {COUNTRY_CODES.map((c) => (
                                    <SelectItem key={c.country} value={c.code}>
                                        <span className="flex items-center gap-2">
                                            <span className="text-xs text-muted-foreground">{c.country}</span>
                                            <span>{c.code}</span>
                                        </span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Input
                            id="phone"
                            value={phone}
                            onChange={(e) => {
                                // Remove non-digits
                                let value = e.target.value.replace(/\D/g, '')

                                // Handle paste with 62 or 0 prefix
                                if (value.startsWith('62')) value = value.slice(2)
                                if (value.startsWith('0')) value = value.slice(1)

                                // Limit length
                                if (value.length > 13) value = value.slice(0, 13)

                                // Add dashes
                                let formatted = value
                                if (value.length > 3) {
                                    formatted = `${value.slice(0, 3)}-${value.slice(3)}`
                                }
                                if (value.length > 7) {
                                    formatted = `${value.slice(0, 3)}-${value.slice(3, 7)}-${value.slice(7)}`
                                }

                                setPhone(formatted)
                            }}
                            placeholder="812-3456-7890"
                        />
                    </div>
                    <p className="text-xs text-muted-foreground">Select country code and enter number</p>
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
                                Save Changes
                            </>
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}

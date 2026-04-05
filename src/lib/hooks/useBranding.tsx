'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'

interface BrandingSettings {
    brandName: string
    brandLogoUrl: string | null
}

interface BrandingContextType {
    branding: BrandingSettings
    loading: boolean
    refreshBranding: () => Promise<void>
    updateBranding: (settings: Partial<BrandingSettings>) => Promise<void>
}

const defaultBranding: BrandingSettings = {
    brandName: 'StayManager',
    brandLogoUrl: null,
}

const BrandingContext = createContext<BrandingContextType | null>(null)

export function BrandingProvider({ children }: { children: ReactNode }) {
    const [branding, setBranding] = useState<BrandingSettings>(defaultBranding)
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    const fetchBranding = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('hotel_settings')
                .select('brand_name, brand_logo_url')
                .single()

            if (error) {
                if (error.code === 'PGRST116') {
                    const { data: newData, error: insertError } = await supabase
                        .from('hotel_settings')
                        .insert({ brand_name: 'StayManager' })
                        .select('brand_name, brand_logo_url')
                        .single()

                    if (!insertError && newData) {
                        setBranding({
                            brandName: newData.brand_name || 'StayManager',
                            brandLogoUrl: newData.brand_logo_url || null,
                        })
                    }
                }
                return
            }

            if (data) {
                setBranding({
                    brandName: data.brand_name || 'StayManager',
                    brandLogoUrl: data.brand_logo_url || null,
                })
            }
        } catch (err) {
            console.error('Error fetching branding:', err)
        } finally {
            setLoading(false)
        }
    }, [supabase])

    const refreshBranding = useCallback(async () => {
        setLoading(true)
        await fetchBranding()
    }, [fetchBranding])

    const updateBranding = useCallback(async (settings: Partial<BrandingSettings>) => {
        try {
            const updateData: Record<string, string | null> = {}
            if (settings.brandName !== undefined) {
                updateData.brand_name = settings.brandName
            }
            if (settings.brandLogoUrl !== undefined) {
                updateData.brand_logo_url = settings.brandLogoUrl
            }

            const { error } = await supabase
                .from('hotel_settings')
                .update(updateData)
                .not('id', 'is', null)

            if (error) throw error

            setBranding(prev => ({ ...prev, ...settings }))
        } catch (err) {
            console.error('Error updating branding:', err)
            throw err
        }
    }, [supabase])

    useEffect(() => {
        fetchBranding()
    }, [fetchBranding])

    const contextValue = { branding, loading, refreshBranding, updateBranding }

    return (
        <BrandingContext.Provider value={contextValue}>
            {children}
        </BrandingContext.Provider>
    )
}

export function useBranding() {
    const context = useContext(BrandingContext)
    if (!context) {
        return {
            branding: defaultBranding,
            loading: false,
            refreshBranding: async () => { },
            updateBranding: async () => { },
        }
    }
    return context
}

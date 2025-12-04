import React from 'react'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { cn } from '@/lib/utils'

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

interface PhoneInputProps {
    value: string
    onChange: (value: string) => void
    className?: string
    placeholder?: string
    id?: string
}

export function PhoneInput({ value, onChange, className, placeholder = "812-3456-7890", id }: PhoneInputProps) {
    // Helper to parse value into code and number
    const getInitialParts = (val: string) => {
        if (!val) return { code: '+62', number: '' }

        // Check for country codes
        // Sort by length desc to match longer codes first (though ours are mostly 3 chars)
        const sortedCodes = [...COUNTRY_CODES].sort((a, b) => b.code.length - a.code.length)

        for (const country of sortedCodes) {
            if (val.startsWith(country.code)) {
                // Remove code and whitespace
                const numberPart = val.slice(country.code.length).trim()
                return { code: country.code, number: numberPart }
            }
        }

        // Default fallback if no code found (e.g. local number 0812...)
        return { code: '+62', number: val }
    }

    // We derive state from props to ensure single source of truth
    const { code: currentCode, number: currentNumber } = getInitialParts(value)

    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value.replace(/\D/g, '')

        // Handle paste with 62 or 0 prefix
        if (val.startsWith('62')) val = val.slice(2)
        if (val.startsWith('0')) val = val.slice(1)

        // Limit length
        if (val.length > 13) val = val.slice(0, 13)

        // Add dashes
        let formatted = val
        if (val.length > 3) {
            formatted = `${val.slice(0, 3)}-${val.slice(3)}`
        }
        if (val.length > 7) {
            formatted = `${val.slice(0, 3)}-${val.slice(3, 7)}-${val.slice(7)}`
        }

        // Call parent with full formatted string
        onChange(`${currentCode} ${formatted}`)
    }

    const handleCodeChange = (newCode: string) => {
        onChange(`${newCode} ${currentNumber}`)
    }

    return (
        <div className={cn("flex gap-2", className)}>
            <Select value={currentCode} onValueChange={handleCodeChange}>
                <SelectTrigger className="w-[80px] shrink-0">
                    <span className="truncate">{currentCode}</span>
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
                id={id}
                value={currentNumber}
                onChange={handleNumberChange}
                placeholder={placeholder}
                className="flex-1"
            />
        </div>
    )
}

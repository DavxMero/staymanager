'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { Bot, Sparkles, FileText, Upload, Save, Loader2 } from 'lucide-react'

export function AISettings() {
    const [loading, setLoading] = useState(false)

    const [config, setConfig] = useState({
        model: 'gemini-2.5-flash',
        personality: 'professional',
        temperature: 0.7,
        enableBooking: true,
        systemPrompt: 'You are a helpful hotel concierge for StayManager Hotel. Be polite, professional, and concise.'
    })

    const handleSave = async () => {
        setLoading(true)
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500))
        setLoading(false)
        toast.success('AI configuration updated')
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Bot className="h-5 w-5" />
                        Model Configuration
                    </CardTitle>
                    <CardDescription>
                        Configure the AI model behavior and capabilities
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="model">AI Model</Label>
                            <Select
                                value={config.model}
                                onValueChange={(val) => setConfig({ ...config, model: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select model" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="gemini-2.5-flash">Gemini 2.5 Flash (Fastest)</SelectItem>
                                    <SelectItem value="gemini-2.5-pro">Gemini 2.5 Pro (Most Capable)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="personality">Personality Tone</Label>
                            <Select
                                value={config.personality}
                                onValueChange={(val) => setConfig({ ...config, personality: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select tone" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="professional">Professional & Formal</SelectItem>
                                    <SelectItem value="friendly">Friendly & Casual</SelectItem>
                                    <SelectItem value="enthusiastic">Enthusiastic & Warm</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="flex items-center justify-between border p-4 rounded-lg">
                        <div className="space-y-0.5">
                            <Label className="text-base">Enable Booking Capability</Label>
                            <p className="text-sm text-muted-foreground">
                                Allow the AI to check availability and create reservations
                            </p>
                        </div>
                        <Switch
                            checked={config.enableBooking}
                            onCheckedChange={(checked) => setConfig({ ...config, enableBooking: checked })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="systemPrompt">System Prompt Override</Label>
                        <Textarea
                            id="systemPrompt"
                            value={config.systemPrompt}
                            onChange={(e) => setConfig({ ...config, systemPrompt: e.target.value })}
                            rows={4}
                            className="font-mono text-sm"
                        />
                        <p className="text-xs text-muted-foreground">
                            Core instructions for the AI. Be careful when editing this.
                        </p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Knowledge Base
                    </CardTitle>
                    <CardDescription>
                        Upload documents to train the AI about your specific hotel details
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="border-2 border-dashed rounded-lg p-8 text-center hover:bg-muted/50 transition-colors cursor-pointer">
                        <div className="flex flex-col items-center gap-2">
                            <Upload className="h-8 w-8 text-muted-foreground" />
                            <h3 className="font-semibold">Upload Documents</h3>
                            <p className="text-sm text-muted-foreground">
                                Drag & drop PDF or TXT files here, or click to browse
                            </p>
                            <Button variant="secondary" size="sm" className="mt-2">
                                Select Files
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h4 className="text-sm font-medium">Active Documents</h4>
                        <div className="bg-muted/50 rounded-md p-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-blue-500" />
                                <span className="text-sm">Hotel_SOP_v2.pdf</span>
                            </div>
                            <Button variant="ghost" size="sm" className="h-8 text-red-500 hover:text-red-600">
                                Remove
                            </Button>
                        </div>
                        <div className="bg-muted/50 rounded-md p-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-blue-500" />
                                <span className="text-sm">Restaurant_Menu_2024.pdf</span>
                            </div>
                            <Button variant="ghost" size="sm" className="h-8 text-red-500 hover:text-red-600">
                                Remove
                            </Button>
                        </div>
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
                                    Save AI Settings
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

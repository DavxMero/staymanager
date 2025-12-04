'use client'

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  MessageCircle,
  Send,
  Minimize2,
  X,
  Bot,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  Bed,
  ConciergeBell,
  Star
} from "lucide-react"

interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  type?: 'text' | 'quick-reply' | 'card' | 'booking' | 'room-status'
  data?: unknown
  options?: QuickReply[]
}

interface QuickReply {
  label: string
  action: string
  value?: string
  icon?: React.ReactNode
}

interface UserContext {
  type: 'guest' | 'staff' | 'visitor'
  userId?: string
  guestId?: string
  roomNumber?: string
  bookingId?: string
  staffRole?: string
}

interface HotelChatbotProps {
  userContext?: UserContext
  position?: 'bottom-right' | 'bottom-left' | 'center'
  apiEndpoint?: string
}

export default function HotelChatbot({
  userContext = { type: 'visitor' },
  position = 'bottom-right',
  apiEndpoint = '/api/chatbot'
}: HotelChatbotProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Welcome message based on user type
  const getWelcomeMessage = (): string => {
    switch (userContext.type) {
      case 'guest':
        return `Hello! Welcome to StayManager Assistant. I'm here to help with your stay${userContext.roomNumber ? ` in Room ${userContext.roomNumber}` : ''}. How can I assist you today?`
      case 'staff':
        return `Hello! StayManager Staff Assistant here. I can help you with guest management, room status, reports, and operational tasks. What do you need help with?`
      default:
        return "Welcome to our hotel! I'm your virtual concierge. I can help you check room availability, learn about our facilities, make reservations, and answer any questions about your stay."
    }
  }

  // Quick reply options based on user type
  const getQuickReplies = (): QuickReply[] => {
    switch (userContext.type) {
      case 'guest':
        return [
          { label: "Room Service", action: "room-service", icon: <ConciergeBell className="h-4 w-4" /> },
          { label: "Check Out", action: "checkout", icon: <Calendar className="h-4 w-4" /> },
          { label: "Extend Stay", action: "extend-stay", icon: <Bed className="h-4 w-4" /> },
          { label: "Facilities", action: "facilities", icon: <Star className="h-4 w-4" /> },
          { label: "Complaint", action: "complaint", icon: <AlertCircle className="h-4 w-4" /> }
        ]
      case 'staff':
        return [
          { label: "Room Status", action: "room-status", icon: <Bed className="h-4 w-4" /> },
          { label: "Guest Info", action: "guest-info", icon: <User className="h-4 w-4" /> },
          { label: "Pending Tasks", action: "pending-tasks", icon: <Clock className="h-4 w-4" /> },
          { label: "Revenue Report", action: "revenue", icon: <CreditCard className="h-4 w-4" /> },
          { label: "Occupancy", action: "occupancy", icon: <CheckCircle className="h-4 w-4" /> }
        ]
      default:
        return [
          { label: "Check Availability", action: "availability", icon: <Calendar className="h-4 w-4" /> },
          { label: "Room Types", action: "room-types", icon: <Bed className="h-4 w-4" /> },
          { label: "Facilities", action: "facilities", icon: <Star className="h-4 w-4" /> },
          { label: "Contact", action: "contact", icon: <Phone className="h-4 w-4" /> },
          { label: "Location", action: "location", icon: <MapPin className="h-4 w-4" /> }
        ]
    }
  }

  // Initialize chat with welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: getWelcomeMessage(),
        timestamp: new Date(),
        type: 'quick-reply',
        options: getQuickReplies()
      }
      setMessages([welcomeMessage])
    }
  }, [isOpen, messages.length, getWelcomeMessage, getQuickReplies])

  // Auto scroll to bottom
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)
    setIsTyping(true)

    try {
      // Send to n8n webhook
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputValue,
          userContext,
          conversationHistory: messages.slice(-5), // Send last 5 messages for context
          timestamp: new Date().toISOString()
        })
      })

      if (!response.ok) {
        throw new Error('Failed to get response from chatbot service')
      }

      const data = await response.json()

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || 'I apologize, but I encountered an issue. Please try again.',
        timestamp: new Date(),
        type: data.type || 'text',
        data: data.data,
        options: data.quickReplies
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Chatbot error:', error)
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'system',
        content: 'Sorry, I\'m having trouble connecting right now. Please try again or contact our front desk.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
      setIsTyping(false)
    }
  }

  const handleQuickReply = (action: string, value?: string) => {
    const quickReplyText = value || action.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())
    setInputValue(quickReplyText)
    setTimeout(() => sendMessage(), 100)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'center': 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'
  }

  const renderMessage = (message: ChatMessage) => {
    const isUser = message.role === 'user'
    const isSystem = message.role === 'system'

    return (
      <motion.div
        key={message.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
      >
        <div className={`flex max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'} gap-2`}>
          <Avatar className="h-8 w-8 mt-1">
            {isUser ? (
              <>
                <AvatarFallback className="bg-blue-100">
                  <User className="h-4 w-4 text-blue-600" />
                </AvatarFallback>
              </>
            ) : (
              <>
                <AvatarFallback className="bg-gradient-to-br from-purple-400 to-blue-600">
                  <Bot className="h-4 w-4 text-white" />
                </AvatarFallback>
              </>
            )}
          </Avatar>

          <div className={`${isUser ? 'mr-2' : 'ml-2'}`}>
            <div
              className={`px-4 py-2 rounded-lg ${isUser
                  ? 'bg-blue-600 text-white'
                  : isSystem
                    ? 'bg-yellow-50 text-yellow-800 border border-yellow-200'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                }`}
            >
              <p className="text-sm">{message.content}</p>
            </div>

            {/* Quick Reply Options */}
            {message.options && (
              <div className="flex flex-wrap gap-2 mt-2">
                {message.options.map((option, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => handleQuickReply(option.action, option.label)}
                  >
                    {option.icon && <span className="mr-1">{option.icon}</span>}
                    {option.label}
                  </Button>
                ))}
              </div>
            )}

            <p className={`text-xs text-muted-foreground mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
              {formatTime(message.timestamp)}
            </p>
          </div>
        </div>
      </motion.div>
    )
  }

  if (!isOpen) {
    return (
      <div className={`fixed ${positionClasses[position]} z-50`}>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            onClick={() => setIsOpen(true)}
            size="lg"
            className="rounded-full h-14 w-14 bg-gradient-to-br from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 shadow-lg"
          >
            <MessageCircle className="h-6 w-6" />
          </Button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className={`fixed ${positionClasses[position]} z-50`}>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{
            opacity: 1,
            scale: 1,
            y: 0,
            height: isMinimized ? 'auto' : '500px'
          }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          className="w-80"
        >
          <Card className="shadow-xl">
            <CardHeader className="bg-gradient-to-r from-purple-500 to-blue-600 text-white p-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Bot className="h-4 w-4" />
                  StayManager Assistant
                </CardTitle>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-white hover:bg-white/20"
                    onClick={() => setIsMinimized(!isMinimized)}
                  >
                    <Minimize2 className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-white hover:bg-white/20"
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-xs opacity-90">
                  {userContext.type === 'guest' && userContext.roomNumber && `Room ${userContext.roomNumber} • `}
                  Online
                </span>
              </div>
            </CardHeader>

            {!isMinimized && (
              <CardContent className="p-0">
                <ScrollArea className="h-80 p-4">
                  {messages.map(renderMessage)}

                  {isTyping && (
                    <div className="flex justify-start mb-4">
                      <div className="flex gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-gradient-to-br from-purple-400 to-blue-600">
                            <Bot className="h-4 w-4 text-white" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-lg">
                          <div className="flex gap-1">
                            <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" />
                            <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                            <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </ScrollArea>

                <div className="border-t p-4">
                  <div className="flex gap-2">
                    <Input
                      ref={inputRef}
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your message..."
                      className="flex-1"
                      disabled={isLoading}
                    />
                    <Button
                      onClick={sendMessage}
                      disabled={isLoading || !inputValue.trim()}
                      size="sm"
                      className="px-3"
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
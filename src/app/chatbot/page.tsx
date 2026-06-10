'use client';

import { useChat } from 'ai/react';
import { useRef, useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RoomCard } from '@/components/chatbot/RoomCard';
import { BookingConfirmation } from '@/components/chatbot/BookingConfirmation';
import { ChatHistorySidebar } from '@/components/chatbot/ChatHistorySidebar';
import { MarkdownMessage } from '@/components/chatbot/MarkdownMessage';
import { InteractiveBookingCard } from '@/components/chatbot/InteractiveBookingCard';
import { DateSelectionCard } from '@/components/chatbot/DateSelectionCard';
import { PaymentOptionsCard } from '@/components/chatbot/PaymentOptionsCard';
import { LoginPromptCard } from '@/components/chatbot/LoginPromptCard';

import { useTheme } from 'next-themes';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LogIn, UserPlus, LayoutDashboard, History, PanelLeft, Sparkles } from 'lucide-react';
import { useSidebar } from '@/components/ui/sidebar';
import { toLocalDateString } from '@/lib/utils';
import { toast } from 'sonner';

interface Room {
  id: string;
  number: string;
  type: string;
  base_price: number;
}

type ParsedChatbotError = {
  title: string;
  description: string;
  isKnown: boolean;
};

function parseChatbotError(raw: string): ParsedChatbotError {
  const msg = raw.toLowerCase();

  // High demand di sisi Google Gemini (model-side overload). Bukan quota lokal —
  // multi-key tidak membantu. Solusi: retry beberapa detik kemudian, atau ganti
  // model di dropdown atas (Pro biasanya kapasitas terpisah).
  if (
    msg.includes('high demand') ||
    msg.includes('experiencing high demand') ||
    msg.includes('spikes in demand') ||
    msg.includes('model is currently') ||
    msg.includes('503') ||
    msg.includes('unavailable')
  ) {
    return {
      title: 'AI is busy (high demand)',
      description: 'Gemini server is under heavy load. Wait 10–30 seconds and try sending again. If it persists, switch to Gemini 2.5 Pro in the model selector above.',
      isKnown: true,
    };
  }

  if (msg.includes('quota') || msg.includes('rate limit') || msg.includes('rate-limit') || msg.includes('rate_limit') || msg.includes('resource_exhausted') || msg.includes('429')) {
    return {
      title: 'AI usage limit reached',
      description: 'The AI server is busy or the quota is exhausted. Try sending again in a few seconds.',
      isKnown: true,
    };
  }

  if (msg.includes('api key') || msg.includes('llm api key missing') || msg.includes('konfigurasi server')) {
    return {
      title: 'Gemini API key not configured',
      description: 'The server is not configured. Add the GOOGLE_GENERATIVE_AI_API_KEY env var in .env.local or Vercel Settings.',
      isKnown: true,
    };
  }

  if (msg.includes('failed to fetch') || msg.includes('network')) {
    return {
      title: 'Connection lost',
      description: 'Check your internet connection and try sending again.',
      isKnown: true,
    };
  }

  if (msg.includes('timeout') || msg.includes('timed out')) {
    return {
      title: 'Request timed out',
      description: 'The AI is taking longer than usual. Try sending a shorter message.',
      isKnown: true,
    };
  }

  return {
    title: 'Chatbot error',
    description: raw.length > 140 ? raw.slice(0, 140) + '…' : raw || 'Could not receive a reply from the server.',
    isKnown: false,
  };
}

interface BookingData {
  room: Room;
  checkIn: string;
  checkOut: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
}

const MODEL_OPTIONS = [
  { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash', hint: 'Default · fast & economical · $0.30/$2.50 per 1M tokens', accent: 'text-blue-600 dark:text-blue-400' },
  { id: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro', hint: 'Smarter for complex reasoning · $1.25/$10 per 1M tokens', accent: 'text-indigo-600 dark:text-indigo-400' },
] as const;

type ModelId = typeof MODEL_OPTIONS[number]['id'];

export default function ChatbotPage() {
  const [mounted, setMounted] = useState(false);
  const [showBooking, setShowBooking] = useState<BookingData | null>(null);
  const [selectedDates, setSelectedDates] = useState({ checkIn: '', checkOut: '' });
  const [sessionId] = useState(() => `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [selectedModel, setSelectedModel] = useState<ModelId>('gemini-2.5-flash');
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = window.localStorage.getItem('staymanager:chatbot:model') as ModelId | null;
    if (saved && MODEL_OPTIONS.some((m) => m.id === saved)) {
      setSelectedModel(saved);
    } else if (saved) {
      window.localStorage.removeItem('staymanager:chatbot:model');
    }
  }, []);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [initialMessages, setInitialMessages] = useState<any[]>([]);
  const { theme, setTheme } = useTheme();
  const supabase = useMemo(() => createClient(), []);
  const { toggleSidebar } = useSidebar();

  const messagesRef = useRef<any[]>([]);
  const currentChatIdRef = useRef<string | null>(null);
  const userRef = useRef<any>(null);

  const chatBody = useMemo(
    () => ({
      model: selectedModel,
      userContext: user
        ? {
            isLoggedIn: true,
            fullName: (user.user_metadata?.full_name as string | undefined) || '',
            email: user.email || '',
            phone: (user.user_metadata?.phone as string | undefined) || '',
          }
        : { isLoggedIn: false },
    }),
    [selectedModel, user],
  );

  const { messages, input, handleInputChange, handleSubmit: rawHandleSubmit, isLoading, append: rawAppend, stop, reload } = useChat({
    api: '/api/chat',
    maxSteps: 1,
    initialMessages: initialMessages.length > 0 ? initialMessages : undefined,
    body: chatBody,
    experimental_throttle: 50,
    onError: (error) => {
      const raw = error?.message || '';
      const parsed = parseChatbotError(raw);
      if (parsed.isKnown) {
        console.warn('[useChat onError]', parsed.title, '—', raw);
      } else {
        console.error('[useChat onError]', error);
      }
      const toastId = `chatbot-error-${parsed.title}`; // pakai ID stable supaya error berulang merge ke toast yang sama
      toast.error(parsed.title, {
        id: toastId,
        description: parsed.description,
        duration: parsed.isKnown ? 8000 : 6000,
      });
    },
    onResponse: (response) => {
      if (!response.ok) {
        console.warn('[useChat onResponse] non-OK response:', response.status, response.statusText);
      }
    },
    onFinish: (message) => {
      const text = (message?.content || '').trim();
      const hasTools = !!(message?.toolInvocations && message.toolInvocations.length > 0);
      if (!text && !hasTools) {
        console.warn('[useChat onFinish] empty assistant reply', message);
        toast.warning('Empty reply', {
          description: 'The AI did not send a response. Try resending the message or check your connection.',
          duration: 6000,
        });
      }
      const u = userRef.current;
      if (!u) return;
      const msgs = messagesRef.current;
      if (!msgs || msgs.length === 0) return;
      (async () => {
        try {
          const chatId =
            currentChatIdRef.current ||
            (crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`);
          await supabase.from('Chat').upsert({ id: chatId, user_id: u.id, messages: msgs });
          if (!currentChatIdRef.current) {
            currentChatIdRef.current = chatId;
            setCurrentChatId(chatId);
          }
        } catch (error) {
          console.error('Error saving chat:', error);
        }
      })();
    },
  });

  const handleSubmit = (e?: any) => {
    requestAnimationFrame(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }));
    return rawHandleSubmit(e);
  };
  const append: typeof rawAppend = (...args: Parameters<typeof rawAppend>) => {
    requestAnimationFrame(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }));
    return rawAppend(...args);
  };

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);
  useEffect(() => {
    currentChatIdRef.current = currentChatId;
  }, [currentChatId]);
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const loadChatFromUrl = async () => {
      const params = new URLSearchParams(window.location.search);
      const chatId = params.get('chat');

      if (chatId && initialMessages.length === 0) {
        try {
          const { data, error } = await supabase
            .from('Chat')
            .select('*')
            .eq('id', chatId)
            .single();

          if (error) throw error;

          if (data && data.messages) {
            setCurrentChatId(chatId);
            setInitialMessages(data.messages);
          }
        } catch (error) {
          console.error('Error loading chat from URL:', error);
        }
      }
    };

    loadChatFromUrl();
  }, []);

  useEffect(() => {
    setMounted(true);

    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
        }

        const { data: { user: verifiedUser } } = await supabase.auth.getUser();
        setUser(verifiedUser);

        if (verifiedUser) {
          loadChatHistory(verifiedUser.id);

          const { data: userRoles } = await supabase
            .from('user_roles')
            .select(`
              role:roles(name)
            `)
            .eq('user_id', verifiedUser.id);

          const hasGuestRole = userRoles?.some((ur: any) => ur.role.name === 'guest');
          const isGuestOnly = hasGuestRole && userRoles?.length === 1;

          setUserRole(isGuestOnly ? 'guest' : 'staff');
        }
      } catch (err) {
        console.warn('[chatbot checkUser] auth fetch failed:', err);
      } finally {
        setAuthChecked(true);
      }
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setChatHistory([]);
        setUserRole(null);
        return;
      }

      if (session?.user) {
        setUser(session.user);
        loadChatHistory(session.user.id);

        const { data: userRoles } = await supabase
          .from('user_roles')
          .select(`
            role:roles(name)
          `)
          .eq('user_id', session.user.id);

        const hasGuestRole = userRoles?.some((ur: any) => ur.role.name === 'guest');
        const isGuestOnly = hasGuestRole && userRoles?.length === 1;

        setUserRole(isGuestOnly ? 'guest' : 'staff');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages.length, isLoading]);

  useEffect(() => {
    const target = messagesEndRef.current?.parentElement;
    if (!target) return;
    const scroll = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    const observer = new ResizeObserver(scroll);
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';

      if (!input || input.trim() === '') {
        textareaRef.current.style.height = '56px';
        textareaRef.current.style.overflowY = 'hidden';
      } else {
        const scrollHeight = textareaRef.current.scrollHeight;
        const newHeight = Math.min(Math.max(scrollHeight, 56), 200);
        textareaRef.current.style.height = `${newHeight}px`;

        textareaRef.current.style.overflowY = scrollHeight > 200 ? 'auto' : 'hidden';
      }
    }
  }, [input]);

  const handleBookRoom = (room: Room) => {
    if (!user) {
      if (confirm('You need to be logged in to make a reservation. Log in now?')) {
        window.location.href = `/login?returnUrl=${encodeURIComponent('/chatbot')}`;
      }
      return;
    }

    // Data akun login — dipakai sebagai prefill nama/email dan
    // sumber tombol "Samakan dengan data diri akun ini" di modal
    setShowBooking({
      room,
      checkIn: selectedDates.checkIn || toLocalDateString(new Date()),
      checkOut: selectedDates.checkOut || toLocalDateString(new Date(Date.now() + 86400000)),
      guestName: (user.user_metadata?.full_name as string) || '',
      guestEmail: user.email || '',
      guestPhone: (user.user_metadata?.phone as string) || '',
    });

    (async () => {
      try {
        const { data: guestData } = await supabase
          .from('guests')
          .select('full_name, email, phone')
          .eq('email', user.email!)
          .maybeSingle();
        if (guestData) {
          setShowBooking((prev) => prev && {
            ...prev,
            guestName: guestData.full_name || prev.guestName,
            guestEmail: guestData.email || prev.guestEmail,
            guestPhone: guestData.phone || prev.guestPhone,
          });
        }
      } catch {
      }
    })();
  };

  const handleConfirmBooking = async (guest: { guestName: string; guestEmail: string; guestPhone: string }) => {
    if (!showBooking) return;

    // Total = tarif per malam x jumlah malam (bukan tarif 1 malam saja)
    const nights = Math.max(
      1,
      Math.round(
        (new Date(showBooking.checkOut).getTime() - new Date(showBooking.checkIn).getTime()) / 86400000
      )
    );
    const totalAmount = showBooking.room.base_price * nights;

    const bookingDetails = `I would like to confirm my booking:
Room: ${showBooking.room.type} (${showBooking.room.number})
Check-in: ${showBooking.checkIn}
Check-out: ${showBooking.checkOut}
Guest: ${guest.guestName}
Email: ${guest.guestEmail}
Phone: ${guest.guestPhone}
Total: ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(totalAmount)} (${nights} night${nights > 1 ? 's' : ''})`;

    setShowBooking(null);

    await append({
      role: 'user',
      content: bookingDetails
    });
  };

  const parseRoomsFromMessage = (content: string): Room[] | null => {
    try {
      const jsonMatch = content.match(/\{[\s\S]*"rooms"[\s\S]*\}/);
      if (jsonMatch) {
        const data = JSON.parse(jsonMatch[0]);
        return data.rooms;
      }
    } catch (e) {
      return null;
    }
    return null;
  };

  const extractRoomsFromToolInvocations = (msg: any): Room[] | null => {
    if (!msg?.toolInvocations || !Array.isArray(msg.toolInvocations)) return null;
    for (const inv of msg.toolInvocations) {
      if (inv?.toolName !== 'cekKetersediaan') continue;
      if (!('result' in inv) || !inv.result) continue;
      const result = inv.result as Record<string, unknown>;
      if (result.status === 'available' && Array.isArray(result.rooms) && result.rooms.length > 0) {
        return result.rooms as Room[];
      }
    }
    return null;
  };

  const parseJSONFromMessage = (content: string, marker: string): any | null => {
    try {
      const regex = new RegExp(`${marker}:\\s*(\\{[\\s\\S]*?\\})(?=\\n|$)`);
      const match = content.match(regex);
      if (match && match[1]) {
        return JSON.parse(match[1]);
      }
    } catch (e) {
      return null;
    }
    return null;
  };

  useEffect(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      const m = messages[i];
      if (m.toolInvocations) {
        const toolCall = m.toolInvocations.find(t => t.toolName === 'cekKetersediaan');
        if (toolCall && 'args' in toolCall) {
          const args = toolCall.args as any;
          if (args.checkIn && args.checkOut) {
            setSelectedDates({
              checkIn: args.checkIn,
              checkOut: args.checkOut
            });
            break;
          }
        }
      }
    }
  }, [messages]);

  const handleGuestInfoUpdate = async (info: any) => {
    await append({
      role: 'user',
      content: `Here are my details:
Name: ${info.guestName}
Email: ${info.guestEmail}
Phone: ${info.guestPhone}`
    });
  };

  const handleDateUpdate = async (data: any) => {
    if (data.checkIn && data.checkOut) {
      await append({
        role: 'user',
        content: `I want to book from ${data.checkIn} to ${data.checkOut} for ${data.adults} adults and ${data.children} children.`
      });
    }
  };

  const handlePaymentSelect = async (method: 'now' | 'later', type?: string) => {
    await append({
      role: 'user',
      content: `I choose to pay ${method}${type ? ` via ${type}` : ''}.`
    });
  };

  const cleanMessageContent = (content: string): string => {
    let cleanContent = content;
    cleanContent = cleanContent.replace(/ROOM_CARDS_JSON:\s*\{[\s\S]*?\}/g, '');
    cleanContent = cleanContent.replace(/\{\s*"(id|rooms)"[\s\S]*?\}\s*(?=\n|$)/g, '');
    cleanContent = cleanContent.replace(/\[\s*\{[\s\S]*?\}\s*\]/g, '');
    cleanContent = cleanContent.replace(/\{\s*"id":\s*"[^}]*$/g, ''); // Partial JSON at end
    cleanContent = cleanContent.replace(/,\s*\{[\s\S]*$/g, '');

    cleanContent = cleanContent.replace(/\]\}/g, '');
    cleanContent = cleanContent.replace(/^\s*\}\s*$/gm, '');

    cleanContent = cleanContent.replace(/UPDATE_TRACKER_JSON:\s*\{[\s\S]*?\}/g, '');
    cleanContent = cleanContent.replace(/SHOW_GUEST_FORM_JSON:\s*\{[\s\S]*?\}/g, '');
    cleanContent = cleanContent.replace(/SHOW_LOGIN_PROMPT_JSON:\s*\{[\s\S]*?\}/g, '');
    cleanContent = cleanContent.replace(/SHOW_DATE_SELECTOR_JSON:\s*\{[\s\S]*?\}/g, '');
    cleanContent = cleanContent.replace(/SHOW_PAYMENT_OPTIONS_JSON:\s*\{[\s\S]*?\}/g, '');

    cleanContent = cleanContent.replace(/\n{3,}/g, '\n\n').trim();
    return cleanContent;
  };

  // Cache hasil parsing per konten pesan. Konten pesan lama tidak berubah,
  // jadi saat streaming hanya pesan terakhir yang di-parse ulang —
  // bukan seluruh riwayat pada setiap render.
  const messageParseCacheRef = useRef(new Map<string, {
    cleaned: string;
    roomsFromContent: Room[] | null;
    guestForm: any;
    dateSelector: any;
    paymentOptions: any;
    loginPrompt: any;
  }>());

  const getParsedMessage = (content: string) => {
    const cache = messageParseCacheRef.current;
    const hit = cache.get(content);
    if (hit) return hit;
    const parsed = {
      cleaned: cleanMessageContent(content),
      roomsFromContent: parseRoomsFromMessage(content),
      guestForm: parseJSONFromMessage(content, 'SHOW_GUEST_FORM_JSON'),
      dateSelector: parseJSONFromMessage(content, 'SHOW_DATE_SELECTOR_JSON'),
      paymentOptions: parseJSONFromMessage(content, 'SHOW_PAYMENT_OPTIONS_JSON'),
      loginPrompt: parseJSONFromMessage(content, 'SHOW_LOGIN_PROMPT_JSON'),
    };
    if (cache.size > 300) cache.clear();
    cache.set(content, parsed);
    return parsed;
  };

  const loadChatHistory = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('Chat')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error details:', error);
        throw error;
      }

      setChatHistory(data || []);
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  const handleSelectChat = async (chatId: string) => {
    try {
      const { data, error } = await supabase
        .from('Chat')
        .select('*')
        .eq('id', chatId)
        .single();

      if (error) throw error;

      setCurrentChatId(chatId);
      window.location.href = `/chatbot?chat=${chatId}`;
    } catch (error) {
      console.error('Error loading chat:', error);
    }
  };

  const handleNewChat = () => {
    setCurrentChatId(null);
    window.location.href = '/chatbot';
  };

  const handleDeleteChat = async (chatId: string) => {
    if (!confirm('Delete this conversation?')) return;

    try {
      const { error } = await supabase
        .from('Chat')
        .delete()
        .eq('id', chatId);

      if (error) throw error;

      if (user) {
        loadChatHistory(user.id);
      }

      if (chatId === currentChatId) {
        handleNewChat();
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
    }
  };

  if (!mounted) return null;

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-[#0a0a0a] text-gray-800 dark:text-gray-100">

      {/* Header */}
      <header className="bg-white/80 dark:bg-[#111111]/95 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800 px-6 py-4 shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={toggleSidebar}
              className="bg-blue-600 p-2.5 rounded-xl shadow-sm hover:bg-blue-700 transition-colors cursor-pointer group"
              title="Toggle Sidebar"
            >
              <PanelLeft className="w-6 h-6 text-white group-hover:opacity-90" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                StayManager AI Concierge
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-300">
                Professional Hotel Assistant • Available 24/7
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* History Button - Only for logged in users */}
            {user && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowHistory(!showHistory)}
                className="gap-2 border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950"
              >
                <History className="h-4 w-4" />
                <span className="hidden sm:inline">History</span>
              </Button>
            )}

            {/* Powered-by label (replaces model selector — default Gemini 2.5 Flash) */}
            <div
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground select-none"
              title="AI model in use"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span className="hidden md:inline">
                Powered by{' '}
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {MODEL_OPTIONS.find((m) => m.id === selectedModel)?.label ?? 'Gemini'}
                </span>
              </span>
              <span className="md:hidden font-medium text-gray-700 dark:text-gray-300">
                {MODEL_OPTIONS.find((m) => m.id === selectedModel)?.label ?? 'Gemini'}
              </span>
            </div>

            {/* Auth Buttons — render hanya setelah auth resolved untuk hindari flash Login/Sign Up saat sudah login.
                Saat masih loading: render nothing (bukan skeleton) supaya tidak ada kotak kosong yang mengganggu. */}
            {!authChecked ? null : user ? (
              userRole === 'staff' ? (
                <Link href="/dashboard">
                  <Button
                    variant="default"
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Button>
                </Link>
              ) : null
            ) : (
              <>
                <Link href="/login">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950"
                  >
                    <LogIn className="h-4 w-4" />
                    Login
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button
                    variant="default"
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
                  >
                    <UserPlus className="h-4 w-4" />
                    Sign Up
                  </Button>
                </Link>
              </>
            )}

            {/* Status Badge */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${isLoading
              ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
              : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
              }`}>
              <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`} />
              {isLoading ? 'Typing...' : 'Online'}
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )
              }
            </button>
          </div>
        </div>
      </header>

      {/* Guest Mode Banner — hanya tampil setelah auth resolved supaya tidak flash saat user sudah login */}
      {authChecked && !user && (
        <div className="bg-blue-600 dark:bg-blue-700 text-white px-6 py-3 shadow-sm">
          <div className="max-w-6xl mx-auto flex items-center justify-center gap-3">
            <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <p className="text-sm font-medium">
              <strong>Browsing as Guest</strong> — Log in to make reservations and save your conversation history
            </p>
          </div>
        </div>
      )}

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="max-w-4xl mx-auto space-y-6">


          {/* Welcome Message */}
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <div className="bg-blue-600 dark:bg-blue-500 w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-sm">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Welcome to StayManager
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
                Your professional hotel concierge is here to assist you. I can help you check room availability, make reservations, and answer any questions about our hotel.
              </p>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-2xl mx-auto">
                {[
                  { icon: '🏨', text: 'Check Room Availability', prompt: 'Show me available rooms for tomorrow' },
                  { icon: '💰', text: 'View Room Rates', prompt: 'What are your room rates?' },
                  { icon: '📅', text: 'Make a Reservation', prompt: 'I want to book a room for next weekend' },
                ].map((action, idx) => (
                  <motion.button
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={async () => {
                      await append({
                        role: 'user',
                        content: action.prompt
                      });
                    }}
                    className="bg-white dark:bg-[#1a1a1a] border-2 border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:border-blue-500 dark:hover:border-blue-400 transition-all group"
                  >
                    <div className="text-3xl mb-2">{action.icon}</div>
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-300">
                      {action.text}
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Thesis Survey CTA — REMOVE AFTER DATA COLLECTION COMPLETE */}
              <motion.a
                href="https://docs.google.com/forms/d/e/1FAIpQLSezJ-8p5Xux47lfWOiifdcQTzIIuk6rs0-ZJVfpx7FLPnl54A/viewform"
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="mt-4 inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#d8e2ff] dark:bg-[#1A468F]/30 border-2 border-[#1A468F]/20 dark:border-[#afc6ff]/20 rounded-xl text-sm font-medium text-[#002f6f] dark:text-[#afc6ff] hover:bg-[#c2d2ff] dark:hover:bg-[#1A468F]/40 hover:border-[#1A468F]/40 dark:hover:border-[#afc6ff]/40 transition-all max-w-md mx-auto"
              >
                <span className="text-lg">📋</span>
                <span>Help with our thesis — fill out a 5-minute questionnaire</span>
                <svg className="w-4 h-4 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </motion.a>
            </motion.div>
          )}

          <AnimatePresence>
            {messages.map((m, index) => {
              if (isLoading && m.role === 'assistant') {
                let lastUserIdx = -1;
                for (let i = messages.length - 1; i >= 0; i--) if (messages[i].role === 'user') { lastUserIdx = i; break; }
                if (index > lastUserIdx) return null;
              }
              const prev = index > 0 ? messages[index - 1] : null;
              const parsed = getParsedMessage(m.content);
              const rooms = m.role === 'assistant'
                ? (
                    parsed.roomsFromContent ||
                    extractRoomsFromToolInvocations(m) ||
                    (prev?.role === 'assistant' ? extractRoomsFromToolInvocations(prev) : null)
                  )
                : null;
              const rawGuestForm = m.role === 'assistant' ? parsed.guestForm : null;
              const dateSelector = m.role === 'assistant' ? parsed.dateSelector : null;
              const paymentOptions = m.role === 'assistant' ? parsed.paymentOptions : null;
              const loginPrompt = m.role === 'assistant' ? parsed.loginPrompt : null;

              const guestForm = rawGuestForm
                ? {
                    ...rawGuestForm,
                    guestName: rawGuestForm.guestName || (user?.user_metadata?.full_name as string | undefined) || '',
                    guestEmail: rawGuestForm.guestEmail || user?.email || '',
                    guestPhone: rawGuestForm.guestPhone || (user?.user_metadata?.phone as string | undefined) || '',
                  }
                : null;
              const effectiveDateSelector = dateSelector;

              const hasActiveToolInvocations = m.toolInvocations?.some(tool => !('result' in tool));
              const hasCompletedToolInvocations = m.toolInvocations && m.toolInvocations.length > 0;
              const hasInteractiveComponent = !!(rooms || guestForm || effectiveDateSelector || paymentOptions || loginPrompt);
              const cleanedContent = parsed.cleaned;

              const isTrulyEmpty =
                m.role === 'assistant' &&
                !cleanedContent &&
                !hasActiveToolInvocations &&
                !hasCompletedToolInvocations &&
                !hasInteractiveComponent;

              if (isTrulyEmpty) {
                return null;
              }

              const next = messages[index + 1];
              const isIntermediateToolOnly =
                m.role === 'assistant' &&
                !cleanedContent &&
                hasCompletedToolInvocations &&
                !!next &&
                next.role === 'assistant';
              if (isIntermediateToolOnly) {
                return null;
              }

              let fallbackContent = cleanedContent;
              if (m.role === 'assistant' && !cleanedContent) {
                if (rooms && rooms.length > 0) {
                  fallbackContent = 'Here are the available rooms:';
                } else if (guestForm) {
                  fallbackContent = 'Please fill in the following details:';
                } else if (effectiveDateSelector) {
                  fallbackContent = 'Please select dates on the calendar below:';
                } else if (paymentOptions) {
                  fallbackContent = 'Choose a payment method:';
                } else if (loginPrompt) {
                  fallbackContent = 'Please log in to continue:';
                }
              }

              return (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className={`flex w-full ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] md:max-w-[70%] ${m.role === 'assistant' ? 'w-full' : ''}`}>
                    {/* Message Bubble */}
                    <div
                      className={`p-4 rounded-2xl shadow-sm ${m.role === 'user'
                        ? 'bg-blue-600 text-white rounded-tr-none'
                        : 'bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-tl-none'
                        }`}
                    >
                      {/* Avatar & Role */}
                      {m.role === 'assistant' && (
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <span className="text-xs font-semibold text-blue-600 dark:text-blue-300">AI Concierge</span>
                        </div>
                      )}

                      {/* Message Content with Markdown Support */}
                      <div className="font-inter">
                        {m.role === 'user' ? (
                          <div className="text-sm leading-relaxed font-medium">{m.content}</div>
                        ) : fallbackContent ? (
                          <MarkdownMessage
                            content={fallbackContent}
                            isStreaming={isLoading && index === messages.length - 1}
                          />
                        ) : hasInteractiveComponent ? (
                          <div className="text-sm text-gray-500 dark:text-gray-400 italic">
                            Please complete the form below.
                          </div>
                        ) : null}
                      </div>

                      {/* Tool Invocations */}
                      {m.toolInvocations?.map((tool) => {
                        if (!('result' in tool)) {
                          return (
                            <motion.div
                              key={tool.toolCallId}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="mt-3 flex items-center gap-2 text-xs bg-blue-50 dark:bg-[#1a1a1a] text-blue-600 dark:text-gray-300 p-3 rounded-lg border border-blue-200 dark:border-gray-700"
                            >
                              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                              Checking our database...
                            </motion.div>
                          );
                        }
                        return null;
                      })}
                    </div>

                    {/* Room Cards — aggregated by type (1 card per type) */}
                    {rooms && rooms.length > 0 && (() => {
                      const groups = new Map<string, { rep: typeof rooms[number]; count: number }>();
                      for (const r of rooms) {
                        const existing = groups.get(r.type);
                        if (!existing) {
                          groups.set(r.type, { rep: r, count: 1 });
                        } else {
                          existing.count += 1;
                          if (r.base_price < existing.rep.base_price) existing.rep = r;
                        }
                      }
                      const groupList = Array.from(groups.values()).sort((a, b) => a.rep.base_price - b.rep.base_price);
                      return (
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                          {groupList.map(({ rep, count }) => (
                            <RoomCard
                              key={rep.type}
                              room={rep}
                              count={count}
                              checkIn={selectedDates.checkIn || 'TBD'}
                              checkOut={selectedDates.checkOut || 'TBD'}
                              onBook={handleBookRoom}
                            />
                          ))}
                        </div>
                      );
                    })()}

                    {/* Interactive Components */}
                    {guestForm && (
                      <div className="mt-4 max-w-md">
                        <InteractiveBookingCard
                          bookingInfo={guestForm}
                          stage="info"
                          onUpdate={(info) => {
                            handleGuestInfoUpdate(info);
                          }}
                        />
                      </div>
                    )}

                    {effectiveDateSelector && (
                      <div className="mt-4 max-w-md">
                        <DateSelectorWrapper
                          initialData={effectiveDateSelector}
                          onConfirm={handleDateUpdate}
                        />
                      </div>
                    )}

                    {paymentOptions && (
                      <div className="mt-4 max-w-lg">
                        <PaymentOptionsCard
                          totalAmount={paymentOptions.totalAmount}
                          onPaymentSelect={handlePaymentSelect}
                        />
                      </div>
                    )}

                    {loginPrompt && !user && (
                      <div className="mt-4 max-w-md">
                        <LoginPromptCard reason={loginPrompt.reason || 'make a reservation'} />
                      </div>
                    )}

                    {/* Regenerate button — hanya di assistant message terakhir, setelah streaming selesai */}
                    {m.role === 'assistant' && index === messages.length - 1 && !isLoading && (
                      <button
                        type="button"
                        onClick={() => reload()}
                        className="mt-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground border border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500 rounded-md px-2.5 py-1 transition-colors"
                        title="Regenerate response"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Regenerate
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Typing indicator — muncul hanya saat last message dari USER (assistant belum start stream).
              Setelah assistant bubble muncul, indicator hilang dan content streaming tampil langsung di bubble. */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex w-full justify-start mt-2"
            >
              <div className="max-w-[85%] md:max-w-[70%]">
                <div className="p-4 rounded-2xl bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-700 rounded-tl-none inline-block">
                  <div className="flex items-center gap-1.5" aria-label="AI is typing">
                    <motion.span className="w-2 h-2 rounded-full bg-blue-500 dark:bg-blue-400" animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0 }} />
                    <motion.span className="w-2 h-2 rounded-full bg-blue-500 dark:bg-blue-400" animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }} />
                    <motion.span className="w-2 h-2 rounded-full bg-blue-500 dark:bg-blue-400" animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }} />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <footer className="bg-white/80 dark:bg-[#111111]/95 backdrop-blur-lg border-t border-gray-200 dark:border-gray-800 p-4 md:p-6 sticky bottom-0 z-10">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="flex gap-3 items-end">
            <textarea
              ref={textareaRef}
              className="flex-1 px-5 py-4 bg-gray-50 dark:bg-[#1a1a1a] border-2 border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-gray-500 focus:border-transparent transition-all text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-400 resize-none custom-scrollbar disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ minHeight: '56px', maxHeight: '200px', overflowY: 'hidden' }}
              value={input}
              onChange={handleInputChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e as any);
                }
              }}
              placeholder="Type your message... (Shift+Enter for new line)"
              disabled={isLoading}
              rows={1}
            />
            {isLoading ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => stop()}
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-2xl font-semibold transition-colors shadow-sm flex items-center justify-center gap-2 h-14 shrink-0"
                title="Stop AI response"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="6" y="6" width="12" height="12" rx="2" />
                </svg>
                <span className="hidden sm:inline">Stop</span>
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={!input.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-[#2a2a2a] disabled:cursor-not-allowed text-white px-8 py-4 rounded-2xl font-semibold transition-colors shadow-sm disabled:shadow-none flex items-center justify-center gap-2 h-14 shrink-0"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                <span className="hidden sm:inline">Send</span>
              </motion.button>
            )}
          </div>
        </form>
      </footer>

      {/* Booking Confirmation Modal */}
      {showBooking && (
        <BookingConfirmation
          booking={showBooking}
          onConfirm={handleConfirmBooking}
          onCancel={() => setShowBooking(null)}
        />
      )}

      {/* Chat History Sidebar */}
      <ChatHistorySidebar
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        chatHistory={chatHistory}
        currentChatId={currentChatId}
        onSelectChat={handleSelectChat}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
      />
    </div>
  );
}

function DateSelectorWrapper({ initialData, onConfirm }: { initialData: any, onConfirm: (data: any) => void }) {
  const [data, setData] = useState(initialData);

  return (
    <div className="flex flex-col gap-2">
      <DateSelectionCard
        checkIn={data.checkIn}
        checkOut={data.checkOut}
        adults={data.adults}
        children={data.children}
        onUpdate={(newData) => setData({ ...data, ...newData })}
      />
      <Button
        onClick={() => onConfirm(data)}
        className="self-end bg-blue-600 text-white"
      >
        Confirm Dates
      </Button>
    </div>
  );
}

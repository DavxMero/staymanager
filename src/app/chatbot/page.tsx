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
import { LogIn, UserPlus, LayoutDashboard, History, PanelLeft, Sparkles, Check, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
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
  retrySec?: number; // hanya untuk error quota/rate-limit
};

// Map error message dari useChat → toast title + description ramah-pengguna
function parseChatbotError(raw: string): ParsedChatbotError {
  const msg = raw.toLowerCase();

  if (msg.includes('quota') || msg.includes('rate limit') || msg.includes('rate-limit') || msg.includes('rate_limit') || msg.includes('limit: 20') || msg.includes('tokens per minute') || msg.includes('tpm')) {
    // Coba ekstrak "Please retry in X.Xs" atau "try again in X.Xs"
    const retryMatch = raw.match(/(?:retry|try again) in ([\d.]+)s/i);
    const retrySec = retryMatch ? Math.ceil(parseFloat(retryMatch[1])) : 30;

    // Detect provider dari error message untuk pesan yang akurat
    let providerHint = 'layanan AI';
    let limitHint = '';
    if (msg.includes('groq') || msg.includes('llama') || msg.includes('tokens per minute') || msg.includes('tpm')) {
      providerHint = 'Groq (Llama)';
      // 8B Instant TPM = 6000, 70B = 12000 — keduanya rentan kalau system prompt panjang
      limitHint = msg.includes('8b') || msg.includes('instant')
        ? ' Llama 8B Instant punya TPM ketat (6K token/menit) — pertimbangkan switch ke Llama 70B untuk headroom 2x lebih besar.'
        : '';
    } else if (msg.includes('google') || msg.includes('gemini') || msg.includes('generativelanguage') || msg.includes('limit: 20')) {
      providerHint = 'Gemini (Google)';
      limitHint = ' Free tier 20 request/menit.';
    }

    return {
      title: 'Batas penggunaan AI tercapai',
      description: `Batas request ${providerHint} tercapai.${limitHint} Mohon tunggu sekitar ${retrySec} detik lalu kirim ulang, atau ganti model dari dropdown.`,
      isKnown: true,
      retrySec,
    };
  }

  if (msg.includes('api key') || msg.includes('llm api key missing') || msg.includes('konfigurasi server')) {
    // Coba deteksi provider mana yang missing key
    let provider = 'AI';
    let envVar = 'GOOGLE_GENERATIVE_AI_API_KEY';
    if (msg.includes('groq')) {
      provider = 'Groq (Llama)';
      envVar = 'GROQ_API_KEY';
    } else if (msg.includes('google') || msg.includes('gemini')) {
      provider = 'Gemini (Google)';
      envVar = 'GOOGLE_GENERATIVE_AI_API_KEY';
    }
    return {
      title: `API key ${provider} belum diset`,
      description: `Model yang dipilih butuh API key. Tambahkan env var ${envVar} di .env.local, atau pilih model lain dari dropdown.`,
      isKnown: true,
    };
  }

  if (msg.includes('failed to fetch') || msg.includes('network')) {
    return {
      title: 'Koneksi terputus',
      description: 'Periksa koneksi internet Anda lalu coba kirim ulang.',
      isKnown: true,
    };
  }

  if (msg.includes('timeout') || msg.includes('timed out')) {
    return {
      title: 'Permintaan timeout',
      description: 'AI butuh waktu lebih lama dari biasanya. Coba kirim pesan yang lebih singkat.',
      isKnown: true,
    };
  }

  return {
    title: 'Chatbot bermasalah',
    description: raw.length > 140 ? raw.slice(0, 140) + '…' : raw || 'Tidak dapat menerima balasan dari server.',
    isKnown: false,
  };
}

// Live countdown buat toast quota error
function QuotaCountdown({ initialSec }: { initialSec: number }) {
  const [secLeft, setSecLeft] = useState(initialSec);

  useEffect(() => {
    if (secLeft <= 0) return;
    const id = setInterval(() => {
      setSecLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, [secLeft]);

  if (secLeft <= 0) {
    return (
      <span>
        <span className="font-semibold text-green-600 dark:text-green-400">Bisa coba lagi sekarang.</span>{' '}
        Atau pilih model lain di dropdown.
      </span>
    );
  }

  return (
    <span>
      Coba lagi dalam{' '}
      <span className="font-bold tabular-nums text-amber-600 dark:text-amber-400">{secLeft}</span> detik,
      atau ganti model di dropdown untuk lanjut sekarang.
    </span>
  );
}

interface BookingData {
  room: Room;
  checkIn: string;
  checkOut: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
}

// Pilihan model yang ditampilkan di selector — semua gratis. Groq diprioritaskan (default).
const MODEL_OPTIONS = [
  { id: 'llama-3.3-70b-versatile', label: 'Llama 3.3 70B (Groq)', hint: 'Gratis · 12K token/menit · default & direkomendasikan', accent: 'text-emerald-600 dark:text-emerald-400' },
  { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash', hint: 'Gratis · 20 req/menit · 1M token/menit · backup terbaik', accent: 'text-blue-600 dark:text-blue-400' },
  { id: 'llama-3.1-8b-instant', label: 'Llama 3.1 8B Instant (Groq)', hint: 'Gratis · paling cepat · TPM 6K ketat, rentan limit', accent: 'text-teal-600 dark:text-teal-400' },
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
  // Model selector — persist ke localStorage supaya pilihan user bertahan antar session.
  // Default: Llama 3.3 70B via Groq (gratis, lebih cepat dari Gemini, rate-limit lebih tinggi)
  const [selectedModel, setSelectedModel] = useState<ModelId>('llama-3.3-70b-versatile');
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = window.localStorage.getItem('staymanager:chatbot:model') as ModelId | null;
    if (saved && MODEL_OPTIONS.some((m) => m.id === saved)) {
      setSelectedModel(saved);
    }
  }, []);
  const updateModel = (id: ModelId) => {
    setSelectedModel(id);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('staymanager:chatbot:model', id);
    }
  };
  // Rate limit hold: disable Send selama countdown supaya user tidak nge-spam dan habisin quota
  const [rateLimitedUntil, setRateLimitedUntil] = useState<number | null>(null);
  const [nowTick, setNowTick] = useState(Date.now());
  const isRateLimited = rateLimitedUntil !== null && nowTick < rateLimitedUntil;
  const secUntilUnlock = rateLimitedUntil ? Math.max(0, Math.ceil((rateLimitedUntil - nowTick) / 1000)) : 0;

  useEffect(() => {
    if (!rateLimitedUntil) return;
    const id = setInterval(() => {
      const now = Date.now();
      setNowTick(now);
      if (now >= rateLimitedUntil) {
        setRateLimitedUntil(null);
        clearInterval(id);
      }
    }, 1000);
    return () => clearInterval(id);
  }, [rateLimitedUntil]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [initialMessages, setInitialMessages] = useState<any[]>([]);
  const { theme, setTheme } = useTheme();
  const supabase = useMemo(() => createClient(), []);
  const { toggleSidebar } = useSidebar();

  const { messages, input, handleInputChange, handleSubmit, isLoading, append } = useChat({
    api: '/api/chat',
    maxSteps: 5,
    initialMessages: initialMessages.length > 0 ? initialMessages : undefined,
    body: {
      model: selectedModel,
      userContext: user
        ? {
            isLoggedIn: true,
            fullName: (user.user_metadata?.full_name as string | undefined) || '',
            email: user.email || '',
            phone: (user.user_metadata?.phone as string | undefined) || '',
          }
        : { isLoggedIn: false },
    },
    onError: (error) => {
      const raw = error?.message || '';
      const parsed = parseChatbotError(raw);
      // Pakai console.warn untuk known/handled errors → tidak trigger Next.js dev error overlay
      if (parsed.isKnown) {
        console.warn('[useChat onError]', parsed.title, '—', raw);
      } else {
        console.error('[useChat onError]', error);
      }
      // Quota error → tampilkan live countdown sebagai description, dan biarkan toast
      // bertahan sampai countdown selesai + 2 detik buffer biar user lihat "bisa coba lagi"
      const isQuota = typeof parsed.retrySec === 'number';
      if (isQuota) {
        // Set rate-limit hold supaya Send button auto-disabled selama countdown
        setRateLimitedUntil(Date.now() + parsed.retrySec! * 1000);
      }
      const toastId = `chatbot-error-${parsed.title}`; // pakai ID stable supaya error berulang merge ke toast yang sama
      toast.error(parsed.title, {
        id: toastId,
        description: isQuota
          ? <QuotaCountdown initialSec={parsed.retrySec!} />
          : parsed.description,
        duration: isQuota
          ? Math.max(8000, (parsed.retrySec! + 3) * 1000)
          : parsed.isKnown ? 8000 : 6000,
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
        toast.warning('Balasan kosong', {
          description: 'AI tidak mengirim balasan. Coba kirim ulang pesan atau periksa koneksi.',
          duration: 6000,
        });
      }
    },
  });

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setMounted(true);

    const checkUser = async () => {
      try {
        // Coba dapat session dulu (sync-ish dari cookie/storage, lebih cepat dari getUser yang verify ke server)
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
        }

        // Verifikasi via getUser untuk konsistensi dengan komponen lain (sidebar dll)
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
      // Hanya null-kan user pada SIGNED_OUT eksplisit. Event lain
      // (INITIAL_SESSION, TOKEN_REFRESHED, USER_UPDATED) bisa fire dengan
      // session=null sementara cache belum sync — jangan clobber state
      // yang sudah diisi oleh checkUser()→getUser().
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
      // else: ignore — biarkan state existing dari getUser() bertahan
    });

    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (messages.length > 0 && user) {
      const saveChat = async () => {
        try {
          const chatId = currentChatId || (crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`);

          await supabase
            .from('Chat')
            .upsert({
              id: chatId,
              user_id: user.id,
              messages: messages,
            });

          if (!currentChatId) {
            setCurrentChatId(chatId);
          }
        } catch (error) {
          console.error('Error saving chat:', error);
        }
      };
      saveChat();
    }
  }, [messages, user, currentChatId, supabase]);

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

  const extractGuestInfo = () => {
    let name = '';
    let email = '';
    let phone = '';

    const userMessages = messages.filter(m => m.role === 'user').map(m => m.content);
    const conversationText = userMessages.join(' ');

    const emailMatch = conversationText.match(/[\w\.-]+@[\w\.-]+\.\w+/);
    if (emailMatch) email = emailMatch[0];

    const phoneMatch = conversationText.match(/[\+]?[\d\s\-\(\)]{10,}/);
    if (phoneMatch) phone = phoneMatch[0].trim();


    const reversedMessages = [...userMessages].reverse();
    for (const msg of reversedMessages) {
      const explicitNameMatch = msg.match(/Name:\s*([^\n]+)/i);
      if (explicitNameMatch && explicitNameMatch[1]) {
        name = explicitNameMatch[1].trim();
        break;
      }
    }

    if (!name) {
      const nameKeywordPatterns = [
        /(?:nama\s+(?:saya\s+)?(?:adalah\s+)?)([a-z]+(?:\s+[a-z]+)*)/i,
        /(?:name\s+(?:is\s+)?(?:i'?m\s+)?)([a-z]+(?:\s+[a-z]+)*)/i,
        /(?:saya\s+)([a-z]+(?:\s+[a-z]+)+)/i,
        /(?:i'?m\s+)([a-z]+(?:\s+[a-z]+)+)/i,
      ];

      for (const pattern of nameKeywordPatterns) {
        const match = conversationText.match(pattern);
        if (match && match[1] && match[1].trim().length > 1) {
          name = match[1]
            .trim()
            .split(/\s+/)
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
          break;
        }
      }
    }

    if (!name) {
      const nameOnlyMessages = userMessages.filter(msg =>
        !msg.match(/[\w\.-]+@[\w\.-]+\.\w+/) &&
        !msg.match(/[\+]?[\d\s\-\(\)]{10,}/)
      );

      for (const msg of nameOnlyMessages) {
        const words = msg.trim().split(/\s+/);
        if (words.length >= 2 && words.length <= 4) {
          const allWordsValid = words.every(w => w.length >= 2 && w.length <= 15 && /^[a-zA-Z]+$/.test(w));
          if (allWordsValid) {
            name = words
              .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
              .join(' ');
            break;
          }
        }
      }
    }

    return { name, email, phone };
  };

  const handleBookRoom = async (room: Room) => {
    if (!user) {
      if (confirm('Anda perlu login untuk membuat reservasi. Login sekarang?')) {
        window.location.href = `/login?returnUrl=${encodeURIComponent('/chatbot')}`;
      }
      return;
    }

    let guestInfo = { name: '', email: '', phone: '' };

    try {
      const { data: guestData, error } = await supabase
        .from('guests')
        .select('full_name, email, phone')
        .eq('email', user.email)
        .single();

      if (guestData && !error) {
        guestInfo = {
          name: guestData.full_name || '',
          email: guestData.email || '',
          phone: guestData.phone || ''
        };
      } else {
        const extracted = extractGuestInfo();
        guestInfo = {
          name: extracted.name || user.user_metadata?.full_name || '',
          email: user.email || extracted.email,
          phone: extracted.phone || user.user_metadata?.phone || ''
        };
      }
    } catch (err) {
      console.error('Error fetching guest data:', err);
      const extracted = extractGuestInfo();
      guestInfo = {
        name: extracted.name || user.user_metadata?.full_name || '',
        email: user.email || extracted.email,
        phone: extracted.phone || user.user_metadata?.phone || ''
      };
    }

    setShowBooking({
      room,
      checkIn: selectedDates.checkIn || toLocalDateString(new Date()),
      checkOut: selectedDates.checkOut || toLocalDateString(new Date(Date.now() + 86400000)),
      guestName: guestInfo.name,
      guestEmail: guestInfo.email,
      guestPhone: guestInfo.phone,
    });
  };

  const handleConfirmBooking = async () => {
    if (!showBooking) return;

    const bookingDetails = `I would like to confirm my booking:
Room: ${showBooking.room.type} (${showBooking.room.number})
Check-in: ${showBooking.checkIn}
Check-out: ${showBooking.checkOut}
Guest: ${showBooking.guestName}
Email: ${showBooking.guestEmail}
Phone: ${showBooking.guestPhone}
Total: ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(showBooking.room.base_price)}`;

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

  const loadChatHistory = async (userId: string) => {
    try {
      console.log('Loading chat history for user:', userId);

      const { data, error } = await supabase
        .from('Chat')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error details:', error);
        throw error;
      }

      console.log('Chat history loaded:', data);
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
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30 dark:from-[#0a0a0a] dark:via-[#0a0a0a] dark:to-[#0a0a0a] text-gray-800 dark:text-gray-100">

      {/* Header */}
      <header className="bg-white/80 dark:bg-[#111111]/95 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800 px-6 py-4 shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={toggleSidebar}
              className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2.5 rounded-xl shadow-lg hover:scale-105 transition-transform cursor-pointer group"
              title="Toggle Sidebar"
            >
              <PanelLeft className="w-6 h-6 text-white group-hover:opacity-90" />
            </button>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
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

            {/* Model Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950"
                  title="Pilih model AI"
                >
                  <Sparkles className="h-4 w-4" />
                  <span className="hidden md:inline">
                    {MODEL_OPTIONS.find((m) => m.id === selectedModel)?.label ?? 'Model'}
                  </span>
                  <ChevronDown className="h-3 w-3 opacity-60" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72">
                <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
                  Pilih model AI untuk percakapan
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup
                  value={selectedModel}
                  onValueChange={(v) => updateModel(v as ModelId)}
                >
                  {MODEL_OPTIONS.map((m) => (
                    <DropdownMenuRadioItem key={m.id} value={m.id} className="cursor-pointer py-2">
                      <div className="flex-1 ml-2">
                        <div className={`text-sm font-medium ${m.accent}`}>{m.label}</div>
                        <div className="text-xs text-muted-foreground">{m.hint}</div>
                      </div>
                      {selectedModel === m.id && <Check className="h-4 w-4 opacity-80" />}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Auth Buttons — render hanya setelah auth resolved untuk hindari flash Login/Sign Up saat sudah login.
                Saat masih loading: render nothing (bukan skeleton) supaya tidak ada kotak kosong yang mengganggu. */}
            {!authChecked ? null : user ? (
              /* Dashboard Button — hanya tampil saat role sudah dikonfirmasi 'staff'.
                 Pakai kondisi positif (=== 'staff') supaya state loading (null) tidak menampilkan tombol kosong. */
              userRole === 'staff' ? (
                <Link href="/dashboard">
                  <Button
                    variant="default"
                    size="sm"
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white gap-2"
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
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white gap-2"
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
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 text-white px-6 py-3 shadow-md">
          <div className="max-w-6xl mx-auto flex items-center justify-center gap-3">
            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <p className="text-sm font-medium">
              <strong>Browsing sebagai Guest</strong> — Login untuk membuat reservasi dan menyimpan riwayat percakapan
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
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-xl">
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
            </motion.div>
          )}

          {/* Messages */}
          <AnimatePresence>
            {messages.map((m, index) => {
              const rooms = m.role === 'assistant' ? parseRoomsFromMessage(m.content) : null;
              const rawGuestForm = m.role === 'assistant' ? parseJSONFromMessage(m.content, 'SHOW_GUEST_FORM_JSON') : null;
              const dateSelector = m.role === 'assistant' ? parseJSONFromMessage(m.content, 'SHOW_DATE_SELECTOR_JSON') : null;
              const paymentOptions = m.role === 'assistant' ? parseJSONFromMessage(m.content, 'SHOW_PAYMENT_OPTIONS_JSON') : null;
              const loginPrompt = m.role === 'assistant' ? parseJSONFromMessage(m.content, 'SHOW_LOGIN_PROMPT_JSON') : null;

              // Auto-fill guest form dari user profile kalau sudah login
              const guestForm = rawGuestForm
                ? {
                    ...rawGuestForm,
                    guestName: rawGuestForm.guestName || (user?.user_metadata?.full_name as string | undefined) || '',
                    guestEmail: rawGuestForm.guestEmail || user?.email || '',
                    guestPhone: rawGuestForm.guestPhone || (user?.user_metadata?.phone as string | undefined) || '',
                  }
                : null;

              const hasActiveToolInvocations = m.toolInvocations?.some(tool => !('result' in tool));
              const hasCompletedToolInvocations = m.toolInvocations && m.toolInvocations.length > 0;
              const hasInteractiveComponent = !!(rooms || guestForm || dateSelector || paymentOptions || loginPrompt);
              const cleanedContent = cleanMessageContent(m.content);

              // Only skip a truly empty assistant message — keep it if there are any markers/tools/components to render
              const isTrulyEmpty =
                m.role === 'assistant' &&
                !cleanedContent &&
                !hasActiveToolInvocations &&
                !hasCompletedToolInvocations &&
                !hasInteractiveComponent;

              if (isTrulyEmpty) {
                return null;
              }

              // Fallback text when LLM produced no readable content but did stream a tool result / marker
              const fallbackContent =
                m.role === 'assistant' && !cleanedContent && !hasInteractiveComponent && hasCompletedToolInvocations
                  ? '_Lihat hasil di bawah._'
                  : cleanedContent;

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
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-none'
                        : 'bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-tl-none'
                        }`}
                    >
                      {/* Avatar & Role */}
                      {m.role === 'assistant' && (
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-6 h-6 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
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
                            isStreaming={isLoading}
                            isLatestMessage={index === messages.length - 1}
                          />
                        ) : hasInteractiveComponent ? (
                          <div className="text-sm text-gray-500 dark:text-gray-400 italic">
                            Silakan lengkapi form di bawah ini.
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

                    {/* Room Cards */}
                    {rooms && rooms.length > 0 && (
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {rooms.map((room) => (
                          <RoomCard
                            key={room.id}
                            room={room}
                            checkIn={selectedDates.checkIn || 'TBD'}
                            checkOut={selectedDates.checkOut || 'TBD'}
                            onBook={handleBookRoom}
                          />
                        ))}
                      </div>
                    )}

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

                    {dateSelector && (
                      <div className="mt-4 max-w-md">
                        <DateSelectorWrapper
                          initialData={dateSelector}
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
                        <LoginPromptCard reason={loginPrompt.reason || 'membuat reservasi'} />
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <footer className="bg-white/80 dark:bg-[#111111]/95 backdrop-blur-lg border-t border-gray-200 dark:border-gray-800 p-4 md:p-6 sticky bottom-0 z-10">
        {/* Rate-limit cooldown banner */}
        {isRateLimited && (
          <div className="max-w-4xl mx-auto mb-3 flex items-center justify-center gap-2 text-xs text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg px-3 py-2">
            <svg className="w-4 h-4 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>
              Cooldown <span className="font-bold tabular-nums">{secUntilUnlock}s</span> — batas request AI free tier tercapai.
              Tunggu, atau ganti model di dropdown untuk lanjut sekarang.
            </span>
          </div>
        )}
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
                  if (!isRateLimited) handleSubmit(e as any);
                }
              }}
              placeholder={isRateLimited ? `Tunggu ${secUntilUnlock}s sebelum mengirim lagi...` : "Type your message... (Shift+Enter for new line)"}
              disabled={isLoading || isRateLimited}
              rows={1}
            />
            <motion.button
              whileHover={{ scale: isRateLimited ? 1 : 1.02 }}
              whileTap={{ scale: isRateLimited ? 1 : 0.98 }}
              type="submit"
              disabled={isLoading || !input.trim() || isRateLimited}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-300 disabled:to-gray-400 dark:disabled:from-[#2a2a2a] dark:disabled:to-[#222222] disabled:cursor-not-allowed text-white px-8 py-4 rounded-2xl font-semibold transition-all shadow-lg disabled:shadow-none flex items-center justify-center gap-2 h-[56px] flex-shrink-0"
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
              <span className="hidden sm:inline">Send</span>
            </motion.button>
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
        className="self-end bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
      >
        Confirm Dates
      </Button>
    </div>
  );
}
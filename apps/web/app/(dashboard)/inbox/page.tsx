'use client'

import { useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useInboxStore } from '@/store/inbox'
import { formatDistanceToNow } from 'date-fns'
import { th } from 'date-fns/locale'
import { Search, Send, Lock, Unlock, MoreHorizontal, Phone, Mail, ShoppingBag, MessageSquare, RefreshCw } from 'lucide-react'
import type { Message } from '@centrix/types'

// ─── Channel config ────────────────────────────────────────────────────────────
const CHANNEL_CONFIG: Record<string, { label: string; bg: string; icon: string }> = {
  FACEBOOK:  { label: 'Facebook',  bg: 'bg-[#1877F2]', icon: 'f' },
  INSTAGRAM: { label: 'Instagram', bg: 'bg-[#E1306C]', icon: '✦' },
  LINE:      { label: 'LINE',      bg: 'bg-[#06C755]', icon: 'L' },
  WECHAT:    { label: 'WeChat',    bg: 'bg-[#07C160]', icon: 'W' },
  SHOPEE:    { label: 'Shopee',    bg: 'bg-[#EE4D2D]', icon: 'S' },
  LAZADA:    { label: 'Lazada',    bg: 'bg-[#0F146D]', icon: 'L' },
  TIKTOK:    { label: 'TikTok',    bg: 'bg-[#010101]', icon: '♪' },
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  OPEN:     { label: 'Open',    color: 'text-emerald-400 bg-emerald-400/10' },
  PENDING:  { label: 'Pending', color: 'text-amber-400 bg-amber-400/10' },
  RESOLVED: { label: 'Closed',  color: 'text-gray-400 bg-gray-400/10' },
}

function ChannelBadge({ type }: { type: string }) {
  const cfg = CHANNEL_CONFIG[type] ?? { label: type, bg: 'bg-indigo-600', icon: '?' }
  return (
    <span className={`inline-flex items-center justify-center w-4 h-4 rounded-sm text-white font-bold text-[9px] ${cfg.bg} shrink-0`}>
      {cfg.icon}
    </span>
  )
}

function ConversationCard({ conv, active, onClick }: { conv: any; active: boolean; onClick: () => void }) {
  const status = STATUS_CONFIG[conv.status] ?? STATUS_CONFIG.OPEN
  const lastMsg = conv.messages?.[0]
  const channelType = conv.channelType ?? conv.channel?.type

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left px-3 py-3 border-b border-white/5 hover:bg-white/5 transition-colors ${
        active ? 'bg-indigo-600/10 border-l-2 border-l-indigo-500' : 'border-l-2 border-l-transparent'
      }`}
    >
      <div className="flex items-start gap-2.5">
        <div className="relative shrink-0">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
            {(conv.customer?.name ?? conv.customerId)?.charAt(0)?.toUpperCase() ?? '?'}
          </div>
          <span className="absolute -bottom-0.5 -right-0.5"><ChannelBadge type={channelType} /></span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1 mb-0.5">
            <span className="text-sm font-medium text-gray-200 truncate">
              {conv.customer?.name ?? `User ···${conv.customerId?.slice(-4)}`}
            </span>
            <span className="text-[10px] text-gray-600 shrink-0">
              {conv.lastMessageAt ? formatDistanceToNow(new Date(conv.lastMessageAt), { addSuffix: false, locale: th }) : ''}
            </span>
          </div>
          <p className="text-xs text-gray-500 truncate">{lastMsg?.content ?? 'ยังไม่มีข้อความ'}</p>
          <div className="flex items-center gap-1.5 mt-1.5">
            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${status.color}`}>{status.label}</span>
          </div>
        </div>
      </div>
    </button>
  )
}

function MessageMedia({ msg }: { msg: Message }) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000'
  const [token, setToken] = useState<string | null>(null)
  useEffect(() => { setToken(localStorage.getItem('token')) }, [])
  const type = msg.messageType ?? 'text'
  const mediaId = msg.mediaUrl

  if (!token || !mediaId) return null
  const src = `${apiUrl}/api/media/line/${mediaId}?token=${token}`

  if (type === 'image') {
    return (
      <a href={src} target="_blank" rel="noopener noreferrer">
        <img
          src={src}
          alt="image"
          className="max-w-[240px] rounded-xl border border-white/10 cursor-pointer hover:opacity-90 transition"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
        />
      </a>
    )
  }
  if (type === 'video') {
    return (
      <video src={src} controls className="max-w-[240px] rounded-xl border border-white/10" />
    )
  }
  if (type === 'audio') {
    return <audio src={src} controls className="w-[200px]" />
  }
  if (type === 'file') {
    return (
      <a href={src} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-indigo-400 underline text-sm">
        📎 ดาวน์โหลดไฟล์
      </a>
    )
  }
  if (type === 'sticker') {
    return <p className="text-2xl">🖼️ <span className="text-xs text-gray-500">Sticker</span></p>
  }
  return null
}

function MessageBubble({ msg }: { msg: Message }) {
  const isCustomer = msg.role === 'CUSTOMER'
  const isNote = msg.role === 'AI'
  const type = msg.messageType ?? 'text'
  const isMedia = type !== 'text'

  return (
    <div className={`flex gap-2 ${isCustomer ? 'justify-start' : 'justify-end'}`}>
      {isCustomer && (
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-[10px] font-bold shrink-0 mt-1">C</div>
      )}
      <div className={`max-w-[70%] ${isCustomer ? '' : 'items-end flex flex-col'}`}>
        {isMedia ? (
          <MessageMedia msg={msg} />
        ) : (
          <div className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
            isCustomer ? 'bg-white/8 border border-white/10 text-gray-200 rounded-tl-sm'
            : isNote ? 'bg-amber-500/10 border border-amber-500/20 text-amber-200 rounded-tr-sm'
            : 'bg-indigo-600 text-white rounded-tr-sm shadow-lg shadow-indigo-600/20'
          }`}>
            {isNote && (
              <span className="flex items-center gap-1 text-[10px] font-semibold text-amber-400 mb-1 uppercase tracking-wide">
                <Lock size={10} /> Private Note
              </span>
            )}
            <p>{msg.content}</p>
            {msg.translatedContent && msg.translatedContent !== msg.content && isCustomer && (
              <p className="text-[11px] text-gray-500 mt-1.5 pt-1.5 border-t border-white/5 italic">{msg.translatedContent}</p>
            )}
          </div>
        )}
        <span className="text-[10px] text-gray-600 mt-1 px-1">
          {new Date(msg.createdAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  )
}

function CustomerPanel({ conv }: { conv: any }) {
  const [tab, setTab] = useState<'info' | 'orders' | 'history'>('info')
  const customer = conv?.customer
  const channelType = conv?.channelType ?? conv?.channel?.type
  return (
    <div className="w-64 border-l border-white/5 flex flex-col bg-[#0d0d1a] shrink-0">
      <div className="p-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
            {(customer?.name ?? conv?.customerId)?.charAt(0)?.toUpperCase() ?? '?'}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate">
              {customer?.name ?? `User ···${conv?.customerId?.slice(-4)}`}
            </p>
            <div className="flex items-center gap-1 mt-0.5">
              <ChannelBadge type={channelType} />
              <span className="text-[11px] text-gray-500">{CHANNEL_CONFIG[channelType]?.label}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex border-b border-white/5">
        {(['info', 'orders', 'history'] as const).map((k) => (
          <button type="button" key={k} onClick={() => setTab(k)}
            className={`flex-1 py-2.5 text-xs font-medium transition-colors capitalize ${
              tab === k ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-gray-500 hover:text-gray-400'
            }`}>
            {k === 'info' ? 'Contact' : k === 'orders' ? 'Orders' : 'History'}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {tab === 'info' && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-400"><Phone size={13} className="text-gray-600 shrink-0" /><span>{customer?.phone ?? '—'}</span></div>
            <div className="flex items-center gap-2 text-sm text-gray-400"><Mail size={13} className="text-gray-600 shrink-0" /><span className="truncate">{customer?.email ?? '—'}</span></div>
            <div className="mt-1">
              <p className="text-[11px] text-gray-600 uppercase tracking-wide font-medium mb-2">Channels</p>
              {customer?.channelProfiles?.length ? customer.channelProfiles.map((cp: any) => (
                <div key={cp.externalId} className="flex items-center gap-2 mb-1.5">
                  <ChannelBadge type={cp.type} />
                  <span className="text-xs text-gray-400 truncate">{cp.externalId}</span>
                </div>
              )) : <p className="text-xs text-gray-600">ไม่มีข้อมูล</p>}
            </div>
          </div>
        )}
        {tab === 'orders' && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-xs text-gray-600"><ShoppingBag size={13} /><span>ยังไม่มี order integration</span></div>
            <p className="text-[11px] text-gray-600 leading-relaxed">เชื่อมต่อ Shopee / Lazada / TikTok Shop เพื่อดู order ที่นี่</p>
          </div>
        )}
        {tab === 'history' && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-xs text-gray-600"><MessageSquare size={13} /><span>Previous conversations</span></div>
            <p className="text-[11px] text-gray-600">ประวัติการสนทนาจะแสดงที่นี่</p>
          </div>
        )}
      </div>

      <div className="p-3 border-t border-white/5 flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500">Status</span>
          <span className={`px-2 py-0.5 rounded-full font-medium text-[10px] ${STATUS_CONFIG[conv?.status]?.color}`}>
            {STATUS_CONFIG[conv?.status]?.label}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500">Assigned to</span>
          <span className="text-gray-400">{conv?.assignedTo ?? 'Unassigned'}</span>
        </div>
      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function InboxPage() {
  const { conversations, activeId, setConversations, setActiveId } = useInboxStore()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [isNote, setIsNote] = useState(false)
  const [filter, setFilter] = useState<'all' | 'mine' | 'unassigned'>('all')
  const [search, setSearch] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const activeIdRef = useRef(activeId)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { activeIdRef.current = activeId }, [activeId])

  const { data, refetch: refetchConversations } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => api.get('/api/conversations').then((r) => r.data.conversations),
  })
  useEffect(() => { if (data) setConversations(data) }, [data, setConversations])

  const { data: messagesData, refetch: refetchMessages } = useQuery({
    queryKey: ['messages', activeId],
    queryFn: () => api.get(`/api/conversations/${activeId}/messages`).then((r) => r.data.messages),
    enabled: !!activeId,
  })
  useEffect(() => { if (messagesData) setMessages(messagesData) }, [messagesData])

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return
    const ws = new WebSocket((process.env.NEXT_PUBLIC_WS_URL ?? 'ws://localhost:5000') + '/ws')
    ws.onopen = () => ws.send(JSON.stringify({ type: 'auth', token }))
    ws.onmessage = (e) => {
      try {
        const event = JSON.parse(e.data)
        if (event.type === 'NEW_MESSAGE') {
          if (event.conversationId === activeIdRef.current) refetchMessages()
          refetchConversations()
        }
        if (event.type === 'CONVERSATION_UPDATED') refetchConversations()
      } catch {}
    }
    ws.onerror = () => ws.close()
    return () => ws.close()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function sendMessage() {
    if (!input.trim() || !activeId) return
    setSending(true)
    try {
      const { data } = await api.post(`/api/conversations/${activeId}/messages`, { content: input })
      setMessages((prev) => [...prev, data.message])
      setInput('')
    } finally {
      setSending(false)
      inputRef.current?.focus()
    }
  }

  const active = conversations.find((c) => c.id === activeId)
  const filtered = conversations.filter((c) => {
    if (!search) return true
    const name = c.customer?.name ?? c.customerId ?? ''
    return name.toLowerCase().includes(search.toLowerCase())
  })

  return (
    <div className="flex h-full">
      {/* Conversation list */}
      <div className="w-72 border-r border-white/5 flex flex-col shrink-0 bg-[#0d0d1a]">
        <div className="px-3 py-3 border-b border-white/5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-white">Inbox</h2>
            <button type="button" onClick={() => refetchConversations()} className="p-1.5 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-white/5 transition">
              <RefreshCw size={13} />
            </button>
          </div>
          <div className="relative mb-2">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-600" />
            <input type="text" placeholder="ค้นหา..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/8 rounded-xl pl-8 pr-3 py-1.5 text-xs text-gray-300 placeholder:text-gray-600 focus:outline-none focus:border-indigo-500/50 transition" />
          </div>
          <div className="flex gap-1">
            {(['all', 'mine', 'unassigned'] as const).map((f) => (
              <button type="button" key={f} onClick={() => setFilter(f)}
                className={`flex-1 py-1 text-[11px] font-medium rounded-lg transition-colors ${
                  filter === f ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:bg-white/5 hover:text-gray-400'
                }`}>
                {f === 'all' ? 'All' : f === 'mine' ? 'Mine' : 'Unassigned'}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-gray-600 text-sm gap-2">
              <MessageSquare size={22} className="opacity-20" />
              <p className="text-xs">ไม่มี conversation</p>
            </div>
          ) : (
            filtered.map((conv) => (
              <ConversationCard key={conv.id} conv={conv} active={conv.id === activeId} onClick={() => setActiveId(conv.id)} />
            ))
          )}
        </div>
      </div>

      {/* Chat window */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#0f0f1a]">
        {active ? (
          <>
            {/* Header */}
            <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between bg-[#0d0d1a]">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                    {(active.customer?.name ?? active.customerId)?.charAt(0)?.toUpperCase() ?? '?'}
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5"><ChannelBadge type={active.channelType ?? active.channel?.type} /></span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">
                    {active.customer?.name ?? `User ···${active.customerId?.slice(-4)}`}
                  </p>
                  <p className="text-[11px] text-gray-500">
                    {CHANNEL_CONFIG[active.channelType ?? active.channel?.type]?.label} · {STATUS_CONFIG[active.status]?.label}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button type="button"
                  onClick={async () => {
                    await api.patch(`/api/conversations/${active.id}`, { status: active.status === 'RESOLVED' ? 'OPEN' : 'RESOLVED' })
                    refetchConversations()
                  }}
                  className={`text-xs px-3 py-1.5 rounded-xl font-medium transition-colors ${
                    active.status === 'RESOLVED' ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20' : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}>
                  {active.status === 'RESOLVED' ? 'Reopen' : 'Resolve'}
                </button>
                <button type="button" className="p-1.5 rounded-lg text-gray-500 hover:bg-white/5 hover:text-gray-300 transition">
                  <MoreHorizontal size={16} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-600 gap-3">
                  <MessageSquare size={32} className="opacity-20" />
                  <p className="text-sm">ยังไม่มีข้อความ</p>
                </div>
              ) : messages.map((msg) => <MessageBubble key={msg.id} msg={msg} />)}
              <div ref={messagesEndRef} />
            </div>

            {/* Composer */}
            <div className="border-t border-white/5 bg-[#0d0d1a]">
              <div className="flex items-center gap-2 px-4 pt-2.5">
                <button type="button" onClick={() => setIsNote(false)}
                  className={`flex items-center gap-1.5 text-xs px-3 py-1 rounded-full transition-colors ${!isNote ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:bg-white/5'}`}>
                  <Unlock size={11} /> Reply
                </button>
                <button type="button" onClick={() => setIsNote(true)}
                  className={`flex items-center gap-1.5 text-xs px-3 py-1 rounded-full transition-colors ${isNote ? 'bg-amber-500/20 text-amber-400' : 'text-gray-500 hover:bg-white/5'}`}>
                  <Lock size={11} /> Note
                </button>
              </div>
              <div className="flex items-end gap-2 px-3 pb-3 pt-2">
                <div className={`flex-1 rounded-2xl border transition-colors ${isNote ? 'bg-amber-500/5 border-amber-500/20' : 'bg-white/5 border-white/10 focus-within:border-indigo-500/50'}`}>
                  <input ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
                    placeholder={isNote ? 'เขียน internal note... (ลูกค้าไม่เห็น)' : 'พิมพ์ข้อความ... (Enter เพื่อส่ง)'}
                    className="w-full bg-transparent px-4 py-2.5 text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none" />
                </div>
                <button type="button" onClick={sendMessage} disabled={sending || !input.trim()}
                  className={`p-2.5 rounded-xl transition-all disabled:opacity-40 shrink-0 ${isNote ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30' : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-600/20'}`}>
                  <Send size={15} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-600 gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center">
              <MessageSquare size={28} className="opacity-30" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-500">เลือก conversation เพื่อเริ่มต้น</p>
              <p className="text-xs text-gray-700 mt-1">The center of every conversation</p>
            </div>
          </div>
        )}
      </div>

      {/* Customer panel */}
      {active && <CustomerPanel conv={active} />}
    </div>
  )
}

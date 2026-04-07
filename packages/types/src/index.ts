export type ChannelType =
  | 'FACEBOOK'
  | 'INSTAGRAM'
  | 'LINE'
  | 'WECHAT'
  | 'LAZADA'
  | 'TIKTOK'
  | 'SHOPEE'

export type ConversationStatus = 'OPEN' | 'PENDING' | 'RESOLVED'

export type MessageRole = 'CUSTOMER' | 'AGENT' | 'AI'

export type AgentMode = 'MANUAL' | 'AI'

export type UserRole = 'SUPER_ADMIN' | 'SUPERVISOR' | 'AGENT'

export interface Organization {
  id: string
  name: string
  slug: string
  createdAt: Date
}

export interface User {
  id: string
  orgId: string
  email: string
  name: string
  role: UserRole
  language: 'th' | 'en'
  mode: AgentMode
}

export interface Channel {
  id: string
  orgId: string
  type: ChannelType
  name: string
  isActive: boolean
}

export interface Conversation {
  id: string
  orgId: string
  channelId: string
  channelType: ChannelType
  customerId: string
  status: ConversationStatus
  assignedTo?: string
  lastMessageAt: Date
  createdAt: Date
  tags?: string[]
  customer?: {
    id: string
    name?: string
    email?: string
    phone?: string
    avatarUrl?: string
    channelProfiles?: { type: ChannelType; externalId: string }[]
  }
  channel?: { type: ChannelType; name: string }
  messages?: Message[]
}

export interface Message {
  id: string
  conversationId: string
  role: MessageRole
  content: string
  originalContent?: string
  originalLanguage?: string
  translatedContent?: string
  createdAt: Date
}

export interface Customer {
  id: string
  orgId: string
  name?: string
  avatarUrl?: string
  channels: {
    type: ChannelType
    externalId: string
  }[]
}

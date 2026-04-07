import { create } from 'zustand'
import type { Conversation, AgentMode } from '@centrix/types'

interface InboxState {
  conversations: Conversation[]
  activeId: string | null
  mode: AgentMode
  setConversations: (conversations: Conversation[]) => void
  setActiveId: (id: string) => void
  setMode: (mode: AgentMode) => void
  upsertConversation: (conversation: Conversation) => void
}

export const useInboxStore = create<InboxState>((set) => ({
  conversations: [],
  activeId: null,
  mode: 'MANUAL',
  setConversations: (conversations) => set({ conversations }),
  setActiveId: (id) => set({ activeId: id }),
  setMode: (mode) => set({ mode }),
  upsertConversation: (conversation) =>
    set((state) => {
      const exists = state.conversations.find((c) => c.id === conversation.id)
      if (exists) {
        return { conversations: state.conversations.map((c) => (c.id === conversation.id ? conversation : c)) }
      }
      return { conversations: [conversation, ...state.conversations] }
    }),
}))

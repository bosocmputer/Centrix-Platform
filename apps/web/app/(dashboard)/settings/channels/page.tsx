'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Plus, Trash2, Edit2, CheckCircle2, XCircle, ToggleLeft, ToggleRight } from 'lucide-react'

const CHANNEL_META: Record<string, { label: string; bg: string; icon: string; fields: { key: string; label: string; placeholder: string }[] }> = {
  FACEBOOK:  { label: 'Facebook Messenger', bg: 'bg-[#1877F2]', icon: 'f', fields: [{ key: 'accessToken', label: 'Page Access Token', placeholder: 'EAAxxxxxxx...' }, { key: 'secret', label: 'App Secret', placeholder: 'App Secret จาก Meta Developer' }] },
  INSTAGRAM: { label: 'Instagram DM', bg: 'bg-[#E1306C]', icon: '✦', fields: [{ key: 'accessToken', label: 'Access Token', placeholder: 'Instagram Access Token' }, { key: 'secret', label: 'App Secret', placeholder: 'App Secret' }] },
  LINE:      { label: 'LINE OA', bg: 'bg-[#06C755]', icon: 'L', fields: [{ key: 'accessToken', label: 'Channel Access Token', placeholder: 'Channel Access Token จาก LINE Developers' }, { key: 'secret', label: 'Channel Secret', placeholder: 'Channel Secret' }] },
  WECHAT:    { label: 'WeChat', bg: 'bg-[#07C160]', icon: 'W', fields: [{ key: 'accessToken', label: 'Access Token', placeholder: 'WeChat Access Token' }, { key: 'secret', label: 'App Secret', placeholder: 'App Secret' }] },
  SHOPEE:    { label: 'Shopee Chat', bg: 'bg-[#EE4D2D]', icon: 'S', fields: [{ key: 'accessToken', label: 'Access Token', placeholder: 'Shopee Open Platform Token' }, { key: 'secret', label: 'App Secret', placeholder: 'App Secret' }] },
  LAZADA:    { label: 'Lazada Chat', bg: 'bg-[#0F146D]', icon: 'L', fields: [{ key: 'accessToken', label: 'Access Token', placeholder: 'Lazada Open Platform Token' }, { key: 'secret', label: 'App Secret', placeholder: 'App Secret' }] },
  TIKTOK:    { label: 'TikTok Shop', bg: 'bg-[#010101]', icon: '♪', fields: [{ key: 'accessToken', label: 'Access Token', placeholder: 'TikTok Shop Access Token' }, { key: 'secret', label: 'App Secret', placeholder: 'App Secret' }] },
}

export default function ChannelsPage() {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editChannel, setEditChannel] = useState<any>(null)
  const [form, setForm] = useState({ type: 'FACEBOOK', name: '', accessToken: '', secret: '' })

  const { data } = useQuery({
    queryKey: ['channels'],
    queryFn: () => api.get('/api/channels').then((r) => r.data.channels),
  })

  const createMutation = useMutation({
    mutationFn: (d: any) => api.post('/api/channels', d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['channels'] }); setShowForm(false); resetForm() },
  })
  const updateMutation = useMutation({
    mutationFn: ({ id, ...d }: any) => api.put(`/api/channels/${id}`, d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['channels'] }); setEditChannel(null); setShowForm(false); resetForm() },
  })
  const toggleMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/api/channels/${id}/toggle`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['channels'] }),
  })
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api/channels/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['channels'] }),
  })

  function resetForm() { setForm({ type: 'FACEBOOK', name: '', accessToken: '', secret: '' }) }
  function handleEdit(ch: any) { setEditChannel(ch); setForm({ type: ch.type, name: ch.name, accessToken: '', secret: '' }); setShowForm(true) }
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const payload = { ...form, name: form.name || CHANNEL_META[form.type].label }
    editChannel ? updateMutation.mutate({ id: editChannel.id, ...payload }) : createMutation.mutate(payload)
  }

  const meta = CHANNEL_META[form.type]

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-3xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-white">Channels</h2>
            <p className="text-sm text-gray-500 mt-0.5">เชื่อมต่อช่องทาง Messaging ของคุณ</p>
          </div>
          <button
            type="button"
            onClick={() => { setShowForm(true); setEditChannel(null); resetForm() }}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-lg shadow-indigo-600/20"
          >
            <Plus size={15} /> เพิ่ม Channel
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-6">
            <h3 className="font-semibold text-white mb-4">
              {editChannel ? `แก้ไข ${editChannel.name}` : 'เพิ่ม Channel ใหม่'}
            </h3>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {!editChannel && (
                <div>
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1.5 block">ประเภท Channel</label>
                  <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-indigo-500/50 transition">
                    {Object.entries(CHANNEL_META).map(([key, val]) => (
                      <option key={key} value={key} className="bg-gray-900">{val.label}</option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1.5 block">ชื่อ Channel</label>
                <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder={meta.label}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-indigo-500/50 transition" />
              </div>
              {meta.fields.map((field) => (
                <div key={field.key}>
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1.5 block">{field.label}</label>
                  <input type="password" value={(form as any)[field.key]} onChange={(e) => setForm((f) => ({ ...f, [field.key]: e.target.value }))}
                    placeholder={editChannel ? '•••••••• (เว้นว่างถ้าไม่ต้องการเปลี่ยน)' : field.placeholder}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-indigo-500/50 transition" />
                </div>
              ))}
              <div className="flex gap-2 justify-end mt-1">
                <button type="button" onClick={() => { setShowForm(false); setEditChannel(null); resetForm() }}
                  className="px-4 py-2 text-sm text-gray-400 border border-white/10 rounded-xl hover:bg-white/5 transition">
                  ยกเลิก
                </button>
                <button type="submit" disabled={createMutation.isPending || updateMutation.isPending}
                  className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl disabled:opacity-50 transition">
                  {editChannel ? 'บันทึก' : 'เพิ่ม'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Channel list */}
        <div className="flex flex-col gap-3">
          {(data ?? []).length === 0 && !showForm && (
            <div className="bg-white/3 border border-white/8 rounded-2xl p-10 text-center">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-3">
                <Plus size={20} className="text-gray-600" />
              </div>
              <p className="text-sm text-gray-500">ยังไม่มี Channel</p>
              <p className="text-xs text-gray-600 mt-1">กด "เพิ่ม Channel" เพื่อเชื่อมต่อ Messaging ของคุณ</p>
            </div>
          )}
          {(data ?? []).map((ch: any) => {
            const m = CHANNEL_META[ch.type]
            return (
              <div key={ch.id} className="bg-white/5 border border-white/8 rounded-2xl p-4 flex items-center justify-between hover:border-white/15 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${m?.bg ?? 'bg-indigo-600'} flex items-center justify-center text-white font-bold text-sm shadow-lg`}>
                    {m?.icon ?? '?'}
                  </div>
                  <div>
                    <p className="font-medium text-sm text-white">{ch.name}</p>
                    <p className="text-xs text-gray-500">{m?.label}</p>
                    <div className="flex gap-2 mt-1.5">
                      <span className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium ${ch.hasAccessToken ? 'text-emerald-400 bg-emerald-400/10' : 'text-red-400 bg-red-400/10'}`}>
                        {ch.hasAccessToken ? <CheckCircle2 size={10} /> : <XCircle size={10} />} Token
                      </span>
                      <span className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium ${ch.hasSecret ? 'text-emerald-400 bg-emerald-400/10' : 'text-red-400 bg-red-400/10'}`}>
                        {ch.hasSecret ? <CheckCircle2 size={10} /> : <XCircle size={10} />} Secret
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button type="button" onClick={() => handleEdit(ch)} className="p-2 text-gray-500 hover:text-indigo-400 rounded-xl hover:bg-white/5 transition">
                    <Edit2 size={15} />
                  </button>
                  <button type="button" onClick={() => toggleMutation.mutate(ch.id)} className="p-2 text-gray-500 hover:text-indigo-400 rounded-xl hover:bg-white/5 transition">
                    {ch.isActive ? <ToggleRight size={20} className="text-emerald-400" /> : <ToggleLeft size={20} />}
                  </button>
                  <button type="button" onClick={() => { if (confirm('ลบ channel นี้?')) deleteMutation.mutate(ch.id) }}
                    className="p-2 text-gray-500 hover:text-red-400 rounded-xl hover:bg-white/5 transition">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

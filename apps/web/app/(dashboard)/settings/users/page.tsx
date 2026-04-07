'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Plus, Trash2, Edit2 } from 'lucide-react'
import { useAuthStore } from '@/store/auth'

const ROLE_CONFIG: Record<string, { label: string; color: string }> = {
  SUPER_ADMIN: { label: 'Super Admin', color: 'text-purple-400 bg-purple-400/10' },
  SUPERVISOR:  { label: 'Supervisor',  color: 'text-indigo-400 bg-indigo-400/10' },
  AGENT:       { label: 'Agent',       color: 'text-gray-400 bg-gray-400/10' },
}

export default function UsersPage() {
  const qc = useQueryClient()
  const currentUser = useAuthStore((s) => s.user)
  const [showForm, setShowForm] = useState(false)
  const [editUser, setEditUser] = useState<any>(null)
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'AGENT', language: 'th' })
  const [error, setError] = useState('')

  const { data } = useQuery({
    queryKey: ['users'],
    queryFn: () => api.get('/api/users').then((r) => r.data.users),
  })

  const createMutation = useMutation({
    mutationFn: (d: any) => api.post('/api/users', d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); setShowForm(false); resetForm() },
    onError: () => setError('เกิดข้อผิดพลาด'),
  })
  const updateMutation = useMutation({
    mutationFn: ({ id, ...d }: any) => api.put(`/api/users/${id}`, d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); setEditUser(null); setShowForm(false); resetForm() },
  })
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api/users/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  })

  function resetForm() { setForm({ name: '', email: '', password: '', role: 'AGENT', language: 'th' }); setError('') }
  function handleEdit(u: any) { setEditUser(u); setForm({ name: u.name, email: u.email, password: '', role: u.role, language: u.language }); setShowForm(true) }
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setError('')
    if (editUser) { const { password, ...rest } = form; updateMutation.mutate({ id: editUser.id, ...rest }) }
    else { createMutation.mutate(form) }
  }

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-3xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-white">Users</h2>
            <p className="text-sm text-gray-500 mt-0.5">จัดการ Agent และสิทธิ์การใช้งาน</p>
          </div>
          <button
            type="button"
            onClick={() => { setShowForm(true); setEditUser(null); resetForm() }}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-lg shadow-indigo-600/20"
          >
            <Plus size={15} /> เพิ่ม User
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-6">
            <h3 className="font-semibold text-white mb-4">{editUser ? `แก้ไข ${editUser.name}` : 'เพิ่ม User ใหม่'}</h3>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1.5 block">ชื่อ</label>
                  <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="ชื่อ Agent" required
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-indigo-500/50 transition" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1.5 block">Email</label>
                  <input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="agent@shop.com" required disabled={!!editUser}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-indigo-500/50 disabled:opacity-40 transition" />
                </div>
              </div>
              {!editUser && (
                <div>
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1.5 block">Password</label>
                  <input type="password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} placeholder="อย่างน้อย 6 ตัวอักษร" required
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-indigo-500/50 transition" />
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1.5 block">Role</label>
                  <select value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-indigo-500/50 transition">
                    <option value="AGENT" className="bg-gray-900">Agent</option>
                    <option value="SUPERVISOR" className="bg-gray-900">Supervisor</option>
                    <option value="SUPER_ADMIN" className="bg-gray-900">Super Admin</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1.5 block">ภาษา Monitor</label>
                  <select value={form.language} onChange={(e) => setForm((f) => ({ ...f, language: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-indigo-500/50 transition">
                    <option value="th" className="bg-gray-900">🇹🇭 ไทย</option>
                    <option value="en" className="bg-gray-900">🇬🇧 English</option>
                  </select>
                </div>
              </div>
              {error && <p className="text-red-400 text-sm">{error}</p>}
              <div className="flex gap-2 justify-end mt-1">
                <button type="button" onClick={() => { setShowForm(false); setEditUser(null); resetForm() }}
                  className="px-4 py-2 text-sm text-gray-400 border border-white/10 rounded-xl hover:bg-white/5 transition">ยกเลิก</button>
                <button type="submit" disabled={createMutation.isPending || updateMutation.isPending}
                  className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl disabled:opacity-50 transition">
                  {editUser ? 'บันทึก' : 'เพิ่ม'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* User list */}
        <div className="flex flex-col gap-3">
          {(data ?? []).map((u: any) => {
            const role = ROLE_CONFIG[u.role] ?? ROLE_CONFIG.AGENT
            return (
              <div key={u.id} className="bg-white/5 border border-white/8 rounded-2xl p-4 flex items-center justify-between hover:border-white/15 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                    {u.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-sm text-white flex items-center gap-2">
                      {u.name}
                      {u.id === currentUser?.id && (
                        <span className="text-[10px] text-indigo-400 bg-indigo-400/10 px-1.5 py-0.5 rounded-full">You</span>
                      )}
                    </p>
                    <p className="text-xs text-gray-500">{u.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${role.color}`}>{role.label}</span>
                  <span className="text-xs text-gray-500">{u.language === 'th' ? '🇹🇭' : '🇬🇧'}</span>
                  <button type="button" onClick={() => handleEdit(u)} className="p-2 text-gray-500 hover:text-indigo-400 rounded-xl hover:bg-white/5 transition">
                    <Edit2 size={14} />
                  </button>
                  {u.id !== currentUser?.id && (
                    <button type="button" onClick={() => { if (confirm(`ลบ ${u.name}?`)) deleteMutation.mutate(u.id) }}
                      className="p-2 text-gray-500 hover:text-red-400 rounded-xl hover:bg-white/5 transition">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

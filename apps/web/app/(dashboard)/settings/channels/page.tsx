'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Plus, Trash2, Edit2, CheckCircle2, XCircle, ToggleLeft, ToggleRight, AlertTriangle, ExternalLink, Info } from 'lucide-react'

const CHANNEL_META: Record<string, { label: string; bg: string; icon: string; fields: { key: string; label: string; placeholder: string }[] }> = {
  FACEBOOK:  { label: 'Facebook Messenger', bg: 'bg-[#1877F2]', icon: 'f', fields: [{ key: 'accessToken', label: 'Page Access Token', placeholder: 'EAAxxxxxxx...' }, { key: 'secret', label: 'Webhook Verify Token', placeholder: 'ค่าที่ใส่ใน Meta → Verify Token (ตั้งเองได้)' }] },
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
              {/* Setup Guide */}
              {form.type === 'LINE' && (
                <div className="flex flex-col gap-2">
                  {/* How to get credentials */}
                  <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-3.5 text-xs text-indigo-300">
                    <div className="flex items-center gap-1.5 font-semibold mb-2"><Info size={13} /> วิธีเอาค่าจาก LINE Developers</div>
                    <ol className="flex flex-col gap-1.5 text-indigo-300/80 leading-relaxed list-none">
                      <li>1. ไปที่ <a href="https://developers.line.biz/console/" target="_blank" rel="noopener noreferrer" className="text-indigo-400 underline inline-flex items-center gap-0.5">developers.line.biz/console <ExternalLink size={10}/></a></li>
                      <li>2. เลือก Provider → เลือก Channel (Messaging API)</li>
                      <li>3. แท็บ <span className="text-white font-medium">Basic settings</span> → copy <span className="text-white font-medium">Channel secret</span></li>
                      <li>4. แท็บ <span className="text-white font-medium">Messaging API</span> → กด Issue → copy <span className="text-white font-medium">Channel access token</span></li>
                      <li>5. ในแท็บเดียวกัน → Webhook URL ใส่: <span className="text-white font-mono bg-white/10 px-1 rounded">https://[tunnel]/api/webhooks/line</span></li>
                      <li>6. เปิด <span className="text-white font-medium">Use webhook</span> → Enabled</li>
                    </ol>
                  </div>
                  {/* Pricing */}
                  <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 text-xs text-gray-300">
                    <div className="flex items-center gap-1.5 font-semibold mb-2 text-white"><Info size={13} /> ค่าใช้จ่าย LINE OA (อัปเดต ส.ค. 2567)</div>
                    <table className="w-full text-[11px] mb-2">
                      <thead><tr className="text-gray-500 border-b border-white/10"><th className="text-left pb-1">แพ็กเกจ</th><th className="text-right pb-1">ราคา/เดือน</th><th className="text-right pb-1">ข้อความฟรี</th><th className="text-right pb-1">ส่วนเกิน/ข้อความ</th></tr></thead>
                      <tbody className="text-gray-400">
                        <tr><td className="py-0.5">Free</td><td className="text-right">ฟรี</td><td className="text-right">300</td><td className="text-right text-red-400">ส่งเพิ่มไม่ได้</td></tr>
                        <tr><td className="py-0.5">Basic</td><td className="text-right">1,280 ฿</td><td className="text-right">15,000</td><td className="text-right">0.10 ฿</td></tr>
                        <tr><td className="py-0.5">Pro</td><td className="text-right">1,780 ฿</td><td className="text-right">35,000</td><td className="text-right">0.06 ฿</td></tr>
                      </tbody>
                    </table>
                    <div className="flex flex-col gap-1 text-gray-400 leading-relaxed">
                      <p>• <span className="text-emerald-400 font-medium">Reply API (ฟรี 100%)</span> — ตอบกลับภายใน 19 นาทีหลังลูกค้าส่งมา ไม่หักโควต้า Centrix จะใช้วิธีนี้อัตโนมัติ</p>
                      <p>• <span className="text-amber-400 font-medium">Push API (หักโควต้า)</span> — ใช้เมื่อเกิน 19 นาที หรือส่ง proactive message</p>
                      <p>• นับตามจำนวนผู้รับ เช่น broadcast 100 คน = 100 ข้อความ</p>
                      <p>• Reply ครั้งเดียวใส่ได้สูงสุด <span className="text-white font-medium">5 balloon</span> — Centrix รวม message ในช่วง 2 วินาทีอัตโนมัติ</p>
                    </div>
                  </div>
                  {/* Warning */}
                  <div className="flex gap-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl p-3.5 text-xs text-amber-300">
                    <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold mb-1">Free Plan ส่งข้อความกลับได้แค่ 300 ข้อความ/เดือน</p>
                      <p className="text-amber-400/80 leading-relaxed">ถ้าใช้ครบแล้วจะส่งไม่ได้จนถึงเดือนหน้า — แนะนำอัปเกรดเป็น Basic (1,280 ฿) หากมีลูกค้าประจำ</p>
                    </div>
                  </div>
                </div>
              )}
              {form.type === 'FACEBOOK' && (
                <div className="flex flex-col gap-2">
                  {/* How to get credentials */}
                  <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-3.5 text-xs text-indigo-300">
                    <div className="flex items-center gap-1.5 font-semibold mb-2"><Info size={13} /> วิธีเอาค่าจาก Meta Developer</div>
                    <ol className="flex flex-col gap-1.5 text-indigo-300/80 leading-relaxed list-none">
                      <li>1. ไปที่ <a href="https://developers.facebook.com/apps/" target="_blank" rel="noopener noreferrer" className="text-indigo-400 underline inline-flex items-center gap-0.5">developers.facebook.com/apps <ExternalLink size={10}/></a> → เลือก App</li>
                      <li>2. เมนูซ้าย → <span className="text-white font-medium">กรณีการใช้งาน</span> → Messenger → กำหนดค่า</li>
                      <li>3. <span className="text-white font-medium">Webhook Verify Token</span>: ตั้งค่าเองได้ เช่น <span className="font-mono bg-white/10 px-1 rounded text-white">centrix-verify-2026</span> → ใส่ค่าเดียวกันในช่องด้านบน</li>
                      <li>4. Webhook URL ใส่: <span className="text-white font-mono bg-white/10 px-1 rounded">https://[tunnel]/api/webhooks/facebook</span></li>
                      <li>5. <span className="text-white font-medium">Page Access Token</span>: ขั้นตอน 2 → สร้างโทเค็นการเข้าถึง → กด "สร้าง" ข้างชื่อ Page</li>
                      <li>6. Subscribe Webhook ให้กับ Page → เลือก <span className="text-white font-medium">messages</span></li>
                    </ol>
                  </div>
                  {/* Rate Limits */}
                  <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 text-xs text-gray-300">
                    <div className="flex items-center gap-1.5 font-semibold mb-2 text-white"><Info size={13} /> Rate Limits ของ Messenger API</div>
                    <div className="flex flex-col gap-1.5 text-gray-400 leading-relaxed">
                      <p>• <span className="text-white font-medium">Send API (ข้อความ/ลิงก์/สติกเกอร์)</span> — สูงสุด 300 ครั้ง/วินาที ต่อ Page</p>
                      <p>• <span className="text-white font-medium">Send API (audio/video)</span> — สูงสุด 10 ครั้ง/วินาที ต่อ Page</p>
                      <p>• <span className="text-white font-medium">Daily quota</span> — 200 × จำนวน Engaged Users ต่อ 24 ชั่วโมง</p>
                      <p>• ส่งข้อความเดิมซ้ำๆ หา 1 thread มากเกินไปอาจถูก throttle</p>
                    </div>
                    <div className="mt-2 pt-2 border-t border-white/10 flex flex-col gap-1 text-gray-400">
                      <p className="font-medium text-amber-300">⚠ Development Mode</p>
                      <p>Webhook จะส่งข้อความเฉพาะ <span className="text-white font-medium">Admin/Tester ของ App</span> เท่านั้น ลูกค้าทั่วไปจะไม่ได้รับ</p>
                      <p>→ ต้อง <a href="https://developers.facebook.com/apps/" target="_blank" rel="noopener noreferrer" className="text-indigo-400 underline">เปิด Live Mode</a> + ใส่ Privacy Policy URL ก่อนใช้งานจริง</p>
                    </div>
                  </div>
                </div>
              )}
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
                        {ch.hasSecret ? <CheckCircle2 size={10} /> : <XCircle size={10} />} {ch.type === 'FACEBOOK' ? 'Verify Token' : 'Secret'}
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

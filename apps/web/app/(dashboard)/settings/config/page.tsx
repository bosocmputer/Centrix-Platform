'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Save, AlertTriangle, ExternalLink, Globe, Key, Facebook } from 'lucide-react'

const CONFIG_SECTIONS = [
  {
    title: 'General',
    icon: Globe,
    fields: [
      {
        key: 'external_url',
        label: 'External URL',
        placeholder: 'https://your-tunnel.trycloudflare.com',
        description: 'Public URL ของ API server — ใช้สำหรับส่งไฟล์/รูปกลับไปยัง LINE. ถ้าใช้ Cloudflare Tunnel ให้ใส่ URL ของ tunnel ที่นี่',
        type: 'url',
      },
    ],
  },
  {
    title: 'Google Translate',
    icon: Key,
    fields: [
      {
        key: 'google_translate_api_key',
        label: 'Google Translate API Key',
        placeholder: 'AIzaSy...',
        description: 'API Key จาก Google Cloud Console — ใช้สำหรับแปลภาษาลูกค้าอัตโนมัติ',
        type: 'password',
      },
    ],
  },
  {
    title: 'Facebook / Meta',
    icon: Facebook,
    fields: [
      {
        key: 'facebook_app_id',
        label: 'App ID',
        placeholder: '123456789012345',
        description: 'App ID จาก Meta Developer Console',
        type: 'text',
      },
      {
        key: 'facebook_app_secret',
        label: 'App Secret',
        placeholder: 'abc123...',
        description: 'App Secret จาก Meta Developer Console',
        type: 'password',
      },
      {
        key: 'facebook_verify_token',
        label: 'Webhook Verify Token',
        placeholder: 'my-verify-token',
        description: 'Token ที่ใช้ verify webhook URL ใน Meta Developer Console',
        type: 'text',
      },
    ],
  },
]

export default function ConfigPage() {
  const [form, setForm] = useState<Record<string, string>>({})
  const [saved, setSaved] = useState(false)

  const { data, isLoading } = useQuery<Record<string, string>>({
    queryKey: ['config'],
    queryFn: () => api.get('/api/config').then((r) => r.data.config as Record<string, string>),
  })

  useEffect(() => {
    if (data) setForm(data)
  }, [data])

  const saveMutation = useMutation({
    mutationFn: (d: Record<string, string>) => api.put('/api/config', d),
    onSuccess: () => {
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    },
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    saveMutation.mutate(form)
  }

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-2xl">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-white">System Configuration</h2>
          <p className="text-sm text-gray-500 mt-0.5">ตั้งค่า API Keys และ Integration ต่าง ๆ</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {CONFIG_SECTIONS.map((section) => {
            const Icon = section.icon
            return (
              <div key={section.title} className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 rounded-lg bg-indigo-600/20 flex items-center justify-center">
                    <Icon size={14} className="text-indigo-400" />
                  </div>
                  <h3 className="font-semibold text-sm text-white">{section.title}</h3>
                </div>
                <div className="flex flex-col gap-4">
                  {section.fields.map((field) => (
                    <div key={field.key}>
                      <label className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1.5 block">
                        {field.label}
                      </label>
                      <input
                        type={field.type === 'password' ? 'password' : 'text'}
                        value={form[field.key] ?? ''}
                        onChange={(e) => setForm((f) => ({ ...f, [field.key]: e.target.value }))}
                        placeholder={field.placeholder}
                        autoComplete="off"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-indigo-500/50 transition"
                      />
                      <p className="text-[11px] text-gray-600 mt-1.5 leading-relaxed">{field.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}

          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3.5 flex gap-2.5 text-xs text-amber-300">
            <AlertTriangle size={14} className="shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold mb-0.5">API Keys ถูกเก็บใน database</p>
              <p className="text-amber-400/80">ค่าที่บันทึกจะมีผลทันที ไม่ต้อง restart server</p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <a
              href="https://developers.cloudflare.com/cloudflare-one/connections/connect-apps"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition"
            >
              <ExternalLink size={12} /> Cloudflare Named Tunnel docs
            </a>
            <button
              type="submit"
              disabled={saveMutation.isPending}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-xl text-sm font-medium transition-colors shadow-lg shadow-indigo-600/20 disabled:opacity-50"
            >
              <Save size={14} />
              {saved ? 'บันทึกแล้ว ✓' : saveMutation.isPending ? 'กำลังบันทึก...' : 'บันทึก'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

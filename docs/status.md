# Centrix — Development Status

> อัปเดตทุกครั้งที่มีการเพิ่ม/แก้ไข feature

---

## Infrastructure

| ส่วน | สถานะ | หมายเหตุ |
|------|--------|----------|
| Docker Compose (API + Web + Postgres + Redis) | ✅ Done | Server: 192.168.2.109 |
| Cloudflare Tunnel (API) | ✅ Done | Quick tunnel — URL เปลี่ยนเมื่อ restart |
| Monorepo (pnpm workspaces) | ✅ Done | apps/api, apps/web, packages/database, packages/types |

**Ports บน server:**
- Web: `:3002`
- API: `:5001`
- Postgres: `:5434`
- Redis: `:6380`

---

## Auth

| Feature | สถานะ | หมายเหตุ |
|---------|--------|----------|
| Login (email/password + JWT) | ✅ Done | POST /api/auth/login |
| Cookie-based session | ✅ Done | httpOnly: false, maxAge 7 วัน |
| Protected routes (middleware) | ✅ Done | Next.js middleware + JWT verify |

---

## Channels

| Channel | Webhook รับข้อความ | ส่งตอบกลับ | สถานะ |
|---------|-------------------|-----------|-------|
| LINE OA | ✅ Done | ✅ Done | Active |
| Facebook Messenger | ✅ Done (code) | ✅ Done (code) | รอทดสอบ |
| Instagram DM | ❌ | ❌ | Planned |

---

## Inbox / Conversations

| Feature | สถานะ | หมายเหตุ |
|---------|--------|----------|
| List conversations | ✅ Done | GET /api/conversations |
| Open conversation + messages | ✅ Done | GET /api/conversations/:id/messages |
| Realtime new message (WebSocket + Redis) | ✅ Done | ws://api/ws |
| Reply ส่งกลับ LINE | ✅ Done | Push Message API |
| Reply ส่งกลับ Facebook | ✅ Done (code) | รอทดสอบ |
| รับข้อความ text | ✅ Done | |
| รับรูปภาพ / ไฟล์ / วิดีโอ / audio / sticker | ✅ Done | เก็บ LINE messageId ใน mediaUrl |
| Media proxy (ดูรูปจาก LINE ใน browser) | ✅ Done | GET /api/media/line/:messageId?token= |
| แสดงรูป/วิดีโอ/audio/ไฟล์ใน inbox UI | ✅ Done | MessageMedia component |
| Translation (ข้อความขาเข้า) | ✅ Done | Google Translate |
| Translation (ข้อความส่งออก) | ✅ Done | แปลเป็นภาษาลูกค้าก่อนส่ง |
| Assign conversation ให้ Agent | ✅ Done | PATCH /api/conversations/:id |
| เปลี่ยน status (OPEN/PENDING/RESOLVED) | ✅ Done | |
| Tags | ✅ Done | |

---

## Settings

| Feature | สถานะ | หมายเหตุ |
|---------|--------|----------|
| จัดการ Channels (เพิ่ม/แก้ไข) | ✅ Done | /settings/channels |
| จัดการ Users | ✅ Done | /settings/users |

---

## Planned (ยังไม่ได้ทำ)

- [ ] Named Cloudflare Tunnel (URL ถาวร)
- [ ] Canned Replies
- [ ] AI Mode (auto-reply)
- [ ] Mobile App (iOS/Android)
- [ ] Facebook / Instagram webhook ทดสอบจริง
- [ ] Shopee / Lazada / TikTok Chat (Phase 2)

---

## Database Schema Version

| Model | เวอร์ชันล่าสุด | การเปลี่ยนแปลง |
|-------|--------------|--------------|
| Message | v2 | เพิ่ม `messageType` (default: "text"), `mediaUrl` |
| Organization / User / Channel / Customer / Conversation | v1 | — |

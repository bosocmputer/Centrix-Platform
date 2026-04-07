# Centrix — Platform Plan

## Brand Identity

| | |
|---|---|
| **Full name** | Centrix |
| **อ่านว่า** | "เซน-ตริกซ์" |
| **ความหมาย** | Center + ix (matrix) — ศูนย์กลางทุก channel |
| **Tagline** | *The center of every conversation* |
| **Tagline (ไทย)** | *ศูนย์กลางทุกบทสนทนา* |
| **Domain** | centrix.io / centrix.app / centrix.chat |

### Logo Concept
- ตัว **C** ที่มี channel icons วนรอบ (เหมือน orbit)
- หรือ grid/matrix pattern สื่อ "ix"
- สี: Deep Indigo `#4F46E5` หรือ Electric Cyan `#06B6D4`

---

> **Strategic goal:** เอาชนะ Zaapi ($59–$279/month) ด้วย pricing ที่เข้าถึงได้กว่า, feature ที่ลึกกว่า, และ developer ecosystem ที่ Zaapi ไม่มี

---

## Competitive Landscape

### Zaapi (คู่แข่งหลัก)
- ราคาปัจจุบัน: $59–$279/month (ขึ้นราคาจาก $13 — ทิ้งลูกค้า SME รายเล็ก)
- จุดแข็ง: Shopee + Lazada + TikTok Shop order data in chat, marketplace review management
- จุดอ่อน: ไม่มี Zapier/n8n, Webhook ล็อก Advanced plan เท่านั้น, AI metered add-on, ไม่มี public API, UI ภาษาอังกฤษ/ไทยเท่านั้น, ไม่มี WooCommerce, ไม่มี voice/video

### โอกาสที่เราจะชนะ
1. **ราคาถูกกว่า** — เปิดให้ SME ราคาย่อมเยา
2. **Webhook/API ทุก plan** — ไม่ล็อก advanced tier
3. **AI ไม่คิดตาม message** — flat rate
4. **Flow Builder ทรงพลังกว่า** — มี n8n/Zapier native
5. **Multi-language UI** — ไทย, อังกฤษ, และอื่นๆ
6. **Order context + marketplace** — match Zaapi แล้วเพิ่มเติม
7. **Public API** — ให้ developer ต่อได้เต็มที่

---

## Channels ที่รองรับ

| Channel | Type | Priority |
|---------|------|----------|
| Facebook Messenger | Social | Phase 1 |
| Instagram DM | Social | Phase 1 |
| LINE OA | Messaging | Phase 1 |
| Website Live Chat Widget | Web | Phase 1 |
| Shopee Chat | E-commerce | Phase 2 |
| Lazada Chat | E-commerce | Phase 2 |
| TikTok Shop Chat | E-commerce | Phase 2 |
| WhatsApp Business | Messaging | Phase 2 |
| WeChat | Messaging | Phase 3 |
| Gmail / Outlook (Email) | Email | Phase 3 |

---

## Core Features

### 1. Unified Inbox
- ข้อความจากทุกช่องทางมารวมที่เดียว
- Status: Open / Follow Up / Closed (เหมือน Zaapi)
- Internal Notes — ทีมคุยกันใน thread โดยลูกค้าไม่เห็น
- Tags/Label เช่น "สอบถามสินค้า", "แจ้งปัญหา", "คืนสินค้า", "VIP"
- Assign conversation ให้ Agent คนใดคนหนึ่ง
- Smart routing: ป้องกัน double-reply จากหลาย agent
- Mobile App (iOS + Android) — agent ตอบนอกออฟฟิศได้
- **เหนือกว่า Zaapi:** แสดง order context จาก marketplace ทุก plan (Zaapi ล็อกบาง feature)

### 2. Order Context in Chat (ต้องมี — คือ moat ของ Zaapi)
- ดึงข้อมูล order จาก Shopee / Lazada / TikTok Shop แสดงใน chat panel
- Agent เห็น: รายการสั่งซื้อ, สถานะจัดส่ง, ประวัติซื้อ ทั้งหมดโดยไม่ต้องเปิด tab อื่น
- **เหนือกว่า Zaapi:** รองรับ WooCommerce และ Shopify ตั้งแต่ plan ต่ำกว่า

### 3. Marketplace Response Rate Dashboard
- แสดง response rate ของ Shopee / Lazada แบบ real-time
- เตือนเมื่อ rate ใกล้ขีดจำกัดที่ marketplace กำหนด (กระทบ ranking)
- **เหนือกว่า Zaapi:** รองรับ marketplace ไทยเพิ่มเติม เช่น JD Central

### 4. Review Management
- ดูและตอบ review จาก Shopee, Lazada, TikTok Shop
- AI-assisted review response templates
- Sentiment analysis — แยก positive/negative/neutral อัตโนมัติ
- **เหนือกว่า Zaapi:** รองรับ Google Reviews และ review platform อื่นๆ

### 5. Translation System
- Admin เลือกภาษา monitor: ไทย หรือ อังกฤษ (หรือภาษาอื่น)
- ข้อความเข้า → แสดงต้นฉบับ + คำแปล
- Admin ตอบภาษาตัวเอง → ระบบแปลกลับภาษาต้นทางก่อนส่ง
- รองรับ 130+ ภาษา (Google Translate + DeepL fallback)
- **เหนือกว่า Zaapi:** Auto-translate ทุก plan (Zaapi ล็อก Advanced เท่านั้น)

**ตัวอย่าง:**
> ลูกค้าส่ง English มาทาง Facebook → Admin เลือก Thai → เห็นข้อความ English + คำแปลไทย → Admin ตอบไทย → ระบบแปลเป็น English แล้วส่งกลับ Facebook

### 6. Two Modes

| Mode | คำอธิบาย |
|------|----------|
| **Manual Mode** | Admin พิมพ์ตอบเอง (default) |
| **AI Mode** | AI ตอบอัตโนมัติ เมื่อ Agent offline หรือนอกเวลาทำงาน |

### 7. AI Agent
- Train บน FAQ, ข้อมูลสินค้า, และ chat history ของร้าน
- จัดการ: คำถามทั่วไป, เช็คสถานะออเดอร์, นัดหมาย
- Escalate ให้ Agent มนุษย์เมื่อ AI ไม่มั่นใจ
- Business Hours: AI ตอบอัตโนมัตินอกเวลาทำงาน
- Knowledge Base แยกต่อร้าน
- **เหนือกว่า Zaapi:** AI ไม่คิดตาม message (flat rate ใน plan) — Zaapi คิด add-on $40/1,000 messages

### 8. Flow Builder / Automation
- No-code drag-and-drop visual flow builder
- Trigger: ข้อความใหม่, keyword match, order event, schedule, out-of-hours
- Action: auto-reply, assign, tag, webhook, HTTP call, notify Supervisor
- Pre-built templates ตามประเภทธุรกิจ
- Facebook/Instagram comment auto-reply + DM follow-up
- **เหนือกว่า Zaapi:** Webhook + HTTP actions ทุก plan (Zaapi ล็อก Advanced เท่านั้น)

### 9. Customer Profile (Unified Identity)
- รวม profile ลูกค้าที่ติดต่อมาหลายช่องทาง
- ประวัติการสนทนาย้อนหลังทุก channel
- Purchase history จาก marketplace + e-commerce
- Customer labeling และ segmentation
- **เหนือกว่า Zaapi:** Detect ว่าเป็นลูกค้าคนเดียวกันข้าม channel ด้วย phone/email matching

### 10. Quick Reply / Canned Response
- บันทึกข้อความที่ตอบบ่อยๆ
- Agent เรียกใช้ด้วย shortcut `/`
- แยก template ตาม channel และ ภาษา

### 11. Broadcast / Campaigns
- ส่งข้อความหาลูกค้าหลายคนพร้อมกัน
- Filter ตาม tag, channel, วันที่คุยล่าสุด, purchase history
- AI-personalized broadcast (ข้อความไม่เหมือนกันทุกคน)
- รองรับ LINE OA Broadcast, WhatsApp Broadcast
- Campaign analytics: ส่ง/อ่าน/ตอบกลับ
- **เหนือกว่า Zaapi:** WhatsApp broadcast ทุก plan (Zaapi ล็อก Pro+)

### 12. SLA / Auto-assign Rules
- ตั้งกฎ เช่น "VIP ต้องตอบใน 2 นาที"
- ถ้าไม่มี Agent ตอบใน X นาที → assign อัตโนมัติ / notify Supervisor
- Round-robin assignment สำหรับทีมใหญ่
- Marketplace response rate compliance auto-alert

### 13. Analytics & Reports
- Real-time dashboard: volume, response time, missed chats
- Agent performance: จำนวน conversation, average handle time, CSAT
- Channel analytics: แยกตาม platform
- Label/tag analytics: เทรนด์ปัญหาที่ลูกค้าถามบ่อย
- Custom reports (Enterprise)
- **เหนือกว่า Zaapi:** Full analytics ทุก plan (Zaapi ล็อก Pro+)

### 14. Webhook / Integration Hub
- Webhook + HTTP actions ทุก plan
- Native connectors: HubSpot, Salesforce, Pipedrive, Zoho CRM
- **n8n / Zapier / Make native integration** (Zaapi ไม่มีเลย)
- Google Sheets, Notion, Slack notifications
- Public REST API + API Key management
- **เหนือกว่า Zaapi:** มี Zapier/n8n ซึ่ง Zaapi ไม่มีจนถึงปัจจุบัน

### 15. Notification
- แจ้งเตือน Agent เมื่อมีข้อความใหม่
- Web push / Mobile push / Email / LINE notify
- Supervisor alert เมื่อ SLA breach

---

## Multi-Tenant Architecture

### Hierarchy

```
Platform (Owner)
└── Organization / Shop
    ├── Channels (connect ของร้านนั้น)
    ├── Users / Agents
    ├── Knowledge Base
    ├── Canned Responses
    ├── Flow / Automation Rules
    ├── Broadcast Campaigns
    └── Conversations / Inbox
```

### Roles & Permissions

| Role | สิทธิ์ |
|------|--------|
| **Super Admin** | จัดการทุกอย่าง, billing, channel, user |
| **Supervisor** | ดู report, monitor agent, assign, SLA, broadcast |
| **Agent** | ตอบ chat, ดู inbox ที่ assign ให้ตัวเอง |

---

## Billing Model

> **กลยุทธ์:** ถูกกว่า Zaapi ในทุก tier, ไม่มี per-message AI fee, Webhook ทุก plan

| Plan | ราคา/เดือน | Agent | Channels | Features |
|------|-----------|-------|----------|----------|
| **Free** | ฟรี | 1 | 2 | Basic inbox, Manual mode, 500 msg/month |
| **Starter** | ฿990 (~$27) | 3 | 5 | + Translation, AI mode (500 AI msg), Analytics, Webhook |
| **Growth** | ฿2,490 (~$68) | 10 | All | + Broadcast, SLA, Order context, Review management, n8n/Zapier, Unlimited AI |
| **Enterprise** | Custom | Unlimited | All | + Custom AI API, Custom reports, Dedicated support, Self-hosted option |

**หมายเหตุ:**
- ไม่มี per-message AI fee ใน Growth+ (flat rate)
- Webhook + HTTP ทุก plan ตั้งแต่ Starter ขึ้นไป
- Translation ทุก plan (ไม่ล็อก Advanced เหมือน Zaapi)
- 7-day free trial ทุก plan

---

## Tech Stack

> Project ใหม่ แยกออกจาก openclaw-api และ openclaw-admin โดยสมบูรณ์

### Project Structure (Monorepo)

```
unified-messaging/
├── apps/
│   ├── api/          ← Fastify + Prisma + TypeScript
│   └── web/          ← Next.js 16 (Admin Panel)
├── packages/
│   ├── database/     ← Prisma schema + migrations (shared)
│   ├── types/        ← Shared TypeScript types
│   └── ui/           ← Shared UI components (optional)
├── docker-compose.yml
└── package.json      ← pnpm workspaces
```

### Backend (apps/api)

| Tool | เหตุผล |
| --- | --- |
| **Fastify** | เร็วกว่า Express 2-3x, built-in validation, เหมาะรับ webhook volume สูง |
| **Prisma** | ORM + migration + type-safe, จัดการ multi-tenant schema ได้ดี |
| **PostgreSQL** | หลัก — conversations, users, orgs, billing |
| **Redis (ioredis)** | Cache + Pub/Sub realtime |
| **BullMQ** | Queue รับ message จากทุก channel ก่อน process |
| **WebSocket (@fastify/websocket)** | Realtime inbox |
| **Zod** | Validate webhook payload จาก Facebook, LINE ฯลฯ ที่ boundary |
| **TypeScript** | Type-safe ทั้ง project |

### Frontend (apps/web)

| Tool | เหตุผล |
| --- | --- |
| **Next.js 16** (App Router) | Admin Panel — SSR + realtime |
| **shadcn/ui + Tailwind v4** | UI component ครบ |
| **TanStack Query v5** | API state management |
| **Zustand** | Global state (mode, language preference) |
| **react-hook-form + zod** | Form validation |
| **date-fns** | Timestamp formatting |
| **Expo / React Native** | Mobile App (Phase 3) |

### AI & Translation

| Tool | เหตุผล |
| --- | --- |
| **@google-cloud/translate** | Primary — 130+ ภาษาทั่วโลก |
| **deepl-node** | Fallback — แม่นกว่าสำหรับภาษายุโรป/ญี่ปุ่น/จีน |
| **OpenClaw SDK** | AI Mode (default) |
| **Custom AI API** | Enterprise option |

### Integration

| Tool | เหตุผล |
| --- | --- |
| **n8n (self-hosted)** | Automation bridge — ต่อ Zapier/Make/Sheets ได้ทันที |
| **Webhooks** | ทุก plan — ไม่ล็อก |
| **REST API + API Keys** | Public API สำหรับ developer |

### Infrastructure

| Tool | เหตุผล |
| --- | --- |
| **Docker Compose** | Local dev + production |
| **Railway / Render** | Deploy เริ่มต้น ไม่ต้องจัดการ infra |
| **Cloudflare Tunnel** | Expose webhook endpoint ระหว่าง dev |
| **Cloudflare** | CDN + DDoS protection (production) |
| **S3 / Object Storage** | เก็บ media files |

---

## Development Phases

### Phase 1 — MVP (ปัจจุบัน ✅ บางส่วน)
- [x] Multi-tenant (Organization + User + Roles)
- [x] LINE OA Webhook + Unified Inbox
- [x] Translation System (Google Translate)
- [x] WebSocket Realtime
- [x] Settings UI (connect channel จาก web)
- [ ] Facebook Messenger
- [ ] Instagram DM
- [ ] Website Live Chat Widget
- [ ] Internal Notes
- [ ] Mobile push notification

### Phase 2 — Core Features
- [ ] Shopee Chat + Order Context
- [ ] Lazada Chat + Order Context
- [ ] TikTok Shop Chat + Order Context
- [ ] Marketplace Response Rate Dashboard
- [ ] Review Management (Shopee + Lazada)
- [ ] AI Mode (OpenClaw + Business Hours)
- [ ] Knowledge Base per shop
- [ ] Quick Reply / Canned Response
- [ ] Flow Builder (visual, no-code)
- [ ] SLA + Auto-assign Rules
- [ ] Full Analytics Dashboard
- [ ] Webhook + HTTP actions (ทุก plan)

### Phase 3 — Scale & Commerce
- [ ] WhatsApp Business
- [ ] Customer Profile (Unified Identity cross-channel)
- [ ] Broadcast / Campaign (LINE + WhatsApp)
- [ ] AI Broadcast (personalized)
- [ ] n8n / Zapier native integration
- [ ] HubSpot / Salesforce CRM connector
- [ ] Mobile App (Expo/React Native)
- [ ] WooCommerce + Shopify order integration

### Phase 4 — Enterprise
- [ ] Custom AI API
- [ ] Public REST API + API Key management
- [ ] Billing System (Stripe หรือ Omise)
- [ ] Self-hosted deployment option
- [ ] Custom reports + data export
- [ ] Multi-language UI (ไทย, อังกฤษ, มาเลย์, เวียดนาม, อินโดนีเซีย)
- [ ] Gmail / Outlook email channel
- [ ] Google Reviews management

---

## Use Cases

### Use Case 1: ร้านเสื้อผ้าออนไลน์ (SME)

**สถานการณ์:** ร้าน "MODA" มี Agent 3 คน ขายผ่าน Facebook + Shopee + LINE OA

```
ลูกค้า A: ส่ง DM Facebook ว่า "มีไซส์ XL ไหมคะ?"
ลูกค้า B: ส่ง Shopee Chat ว่า "สั่งไปแล้ว 3 วัน ยังไม่ส่งเลย"
ลูกค้า C: ส่ง LINE OA ว่า "ขอเปลี่ยนสีได้ไหม"

→ ทั้ง 3 ข้อความมาปรากฏใน Unified Inbox พร้อมกัน
→ Agent B เห็น order ของลูกค้า B ในหน้าจอเดียวกับ chat
→ ระบบ Auto-assign ให้ Agent ที่ว่างอยู่คนละคน
→ Agent ตอบจากหน้าจอเดียว ไม่ต้องสลับ app
```

### Use Case 2: ร้าน Cross-border (Translation)

**สถานการณ์:** ร้าน "Thai Herb" ขายสมุนไพรไทยให้ต่างชาติ ผ่าน Facebook + Instagram

```
ลูกค้าญี่ปุ่น: ส่งมาเป็นภาษาญี่ปุ่น "この製品は本物ですか？"
                                          (สินค้านี้ของแท้ไหม?)

Agent เห็น:
┌─────────────────────────────────────┐
│ [ญี่ปุ่น] この製品は本物ですか？      │
│ [แปล]   สินค้านี้ของแท้ไหม?         │
└─────────────────────────────────────┘

→ Agent พิมพ์ตอบเป็นไทย: "ของแท้ 100% ครับ มี อย."
→ ระบบแปลเป็นญี่ปุ่นอัตโนมัติก่อนส่ง
→ ลูกค้าได้รับ: "100%本物です。食品医薬品局認定済みです。"
```

### Use Case 3: นอกเวลาทำงาน (AI Mode)

**สถานการณ์:** ร้านอาหาร "Siam Kitchen" ปิด 22:00 น.

```
22:30 น. — Agent กด [เปิด AI Mode] แล้วออกจากระบบ

ลูกค้า: "เปิดกี่โมงครับ พรุ่งนี้"

AI ตอบอัตโนมัติ:
"สวัสดีครับ ร้าน Siam Kitchen เปิดทุกวัน 10:00-22:00 น.
 พรุ่งนี้เปิดตามเวลาปกติครับ มีอะไรให้ช่วยเพิ่มเติมไหมครับ?"

08:00 น. — Agent เปิด Manual Mode
→ เห็น conversation ที่ AI ตอบไปทั้งหมด พร้อม history
```

### Use Case 4: Marketplace Seller (Order Context)

**สถานการณ์:** ร้าน "BeautyX" ขายเครื่องสำอางบน Shopee + Lazada

```
ลูกค้า Shopee: "ของยังไม่มาเลยครับ สั่ง 3 วันแล้ว"

Agent เห็นใน chat panel ด้านขวา:
┌─────────────────────────────────────┐
│ Order #SHP-2204789                   │
│ สินค้า: CC Cream SPF50 x2            │
│ สถานะ: จัดส่งแล้ว                    │
│ เลขพัสดุ: TH-123456789               │
│ คาดถึง: พรุ่งนี้                      │
└─────────────────────────────────────┘

→ Agent ตอบได้ทันที โดยไม่ต้องเปิด Shopee Seller Center
```

### Use Case 5: ทีมใหญ่ + SLA (Supervisor)

**สถานการณ์:** บริษัท "TechGadget" มี Agent 8 คน Supervisor 1 คน

```
ลูกค้า VIP ส่งข้อความมา → ติด Tag "VIP" อัตโนมัติ
→ SLA Rule: VIP ต้องตอบใน 2 นาที
→ ผ่าน 2 นาที ยังไม่มี Agent ตอบ
→ ระบบแจ้งเตือน Supervisor ทันที
→ Supervisor assign ให้ Agent ที่ว่าง

Supervisor dashboard เห็น:
- Agent A: 5 conversations (overloaded)
- Agent B: 1 conversation (ว่าง)
- Agent C: offline
→ กด reassign จาก A ไป B ได้ทันที
```

### Use Case 6: Broadcast โปรโมชั่น

**สถานการณ์:** ร้าน "Beauty Plus" ต้องการส่งโปรโมชั่น 11.11

```
Super Admin สร้าง Broadcast:
- ข้อความ: "Flash Sale 11.11 ลด 50% ทุกรายการ!"
- Filter: ลูกค้าที่คุยใน 30 วันที่ผ่านมา + Tag "ลูกค้าประจำ"
- ช่องทาง: LINE OA + WhatsApp
- เวลาส่ง: 11/11 00:00 น.
- AI Personalize: ใส่ชื่อลูกค้าและสินค้าที่เคยซื้อ

→ ระบบส่งอัตโนมัติตามเวลาที่กำหนด
→ Report: ส่งสำเร็จ 1,240 คน, อ่านแล้ว 892 คน, ตอบกลับ 234 คน
```

### Use Case 7: n8n Automation (เหนือกว่า Zaapi)

**สถานการณ์:** ร้าน "LogisticsPro" ต้องการ sync ข้อมูลกับระบบ ERP

```
เมื่อมี conversation ใหม่จาก Lazada:
→ Webhook trigger → n8n flow
→ n8n ดึงข้อมูล order จาก ERP
→ ส่งข้อมูลกลับมา tag ใน conversation
→ Auto-assign ให้ agent ที่ดูแลออเดอร์ Lazada โดยเฉพาะ
→ แจ้งเตือนใน Slack ของทีม logistics

(Zaapi ทำไม่ได้ — ไม่มี Zapier/n8n integration)
```

---

## UX/UI Design

### Layout: 4-Column Shell (เหมือน Intercom)

```
┌──────┬─────────────────┬──────────────────────────┬──────────────────┐
│ Nav  │ Conversation    │ Chat Window              │ Customer Panel   │
│ Icons│ List            │                          │                  │
│      │ ─────────────── │ ── Header ─────────────  │ ─ Contact Info ─ │
│ 📥   │ [🟢 LINE] สมชาย │                          │ ชื่อ / ช่องทาง   │
│ 📊   │ สวัสดี ครับ...  │  💬 ข้อความลูกค้า        │ ─ Order History ─│
│ 📢   │ 2m ago   🔴3   │                          │ #SHP-2204789    │
│ ⚙️   │ ─────────────── │     ข้อความ Agent ▶     │ Status: จัดส่ง   │
│      │ [📘 FB] มานี    │                          │ ─ Prev Chats ──  │
│      │ มีของไหม...     │ ─ Composer ───────────── │ 3 conversations  │
│      │ 5m ago          │ [พิมพ์ข้อความ...]  [ส่ง] │                  │
└──────┴─────────────────┴──────────────────────────┴──────────────────┘
```

### Free Templates & Resources ที่จะใช้

| Resource | URL | ใช้ทำอะไร |
|---|---|---|
| **shadcn/ui Mail example** | https://ui.shadcn.com/examples/mail | Layout skeleton — `ResizablePanelGroup` 3 panel |
| **shadcn-chat components** | https://github.com/jakobhoeg/shadcn-chat | Chat bubble, toolbar, message list |
| **next-shadcn-dashboard-starter** | https://github.com/Kiranism/next-shadcn-dashboard-starter | Full dashboard shell + chat page |
| **Chatwoot (open source)** | https://github.com/chatwoot/chatwoot | UI patterns และ ConversationCard design |
| **Untitled UI Figma** | https://www.untitledui.com/components/messaging | Design reference คุณภาพสูง ฟรี |

### Conversation List Card Pattern (จาก Chatwoot)

```
┌─────────────────────────────────────────────────────┐
│ 🟢  [Avatar]  สมชาย ใจดี              2m ago  🔴 3 │
│              สวัสดีครับ มีไซส์ XL ไหมคะ...         │
│              [OPEN] [VIP] [LINE]                    │
└─────────────────────────────────────────────────────┘
```

- **ซ้าย:** channel icon (สี) + customer avatar
- **กลาง:** ชื่อลูกค้า (bold ถ้ายังไม่อ่าน) + last message snippet + status/tag pills
- **ขวา:** timestamp + unread count badge

### Channel Color Coding

| Channel | สี | Icon |
|---|---|---|
| LINE | #06C755 (เขียว) | 💚 |
| Facebook | #1877F2 (น้ำเงิน) | 📘 |
| Instagram | #E1306C (ชมพู-แดง) | 📸 |
| Shopee | #FF5722 (ส้ม) | 🛒 |
| Lazada | #0F146D (น้ำเงินเข้ม) | 🛍️ |
| TikTok Shop | #000000 (ดำ) | 🎵 |
| WhatsApp | #25D366 (เขียวอ่อน) | 💬 |
| Live Chat | #6366F1 (ม่วง) | 🌐 |

### Key UX Patterns

1. **Assignee tabs** ที่ด้านบน conversation list: "Mine / Unassigned / All" — ลด noise สำหรับ agent
2. **`/` shortcut** ใน composer เรียก canned responses ทันที
3. **Snooze conversations** — ตั้งเวลา follow up ได้ (เช่น พรุ่งนี้ 9.00 น.)
4. **"Customer is typing"** — แสดงใน conversation list ด้วย ไม่ใช่แค่ใน chat window
5. **Right-click context menu** บน conversation: mark read, assign, snooze, close
6. **Private notes** toggle ใน composer (agent คุยกันเองโดยลูกค้าไม่เห็น)
7. **Language indicator pill** บน conversation card — แสดงภาษาที่ detect ได้
8. **Virtual scrolling** สำหรับ conversation list เมื่อมีข้อความเยอะ

### Color Palette (Dark Sidebar + Light Content)

```
Background:     #0F0F0F (nav icon bar) / #1A1A2E (sidebar) / #FFFFFF (chat)
Primary:        #6366F1 (Indigo)
Success:        #10B981 (Green — OPEN status)
Warning:        #F59E0B (Yellow — PENDING)
Muted:          #6B7280 (Gray — RESOLVED)
Danger:         #EF4444 (Red — urgent/unread)
```

### Component Build Order

1. **Layout shell** — 4-column `ResizablePanelGroup` (shadcn Mail เป็น base)
2. **ConversationCard** — channel icon + name + last msg + status pill
3. **ConversationList** — virtual scroll + filter tabs (Mine/Unassigned/All)
4. **ChatWindow** — message bubbles (customer left, agent right) + translation sub-text
5. **ChatComposer** — text input + `/` canned reply + send + private note toggle
6. **CustomerPanel** — tabs: Contact Info / Order History / Previous Chats
7. **ChannelIcon** component — color-coded ต่อ channel type

---

## Open Questions (ต้องตัดสินใจ)

- [ ] Payment Gateway: Stripe หรือ Omise?
- [ ] Self-hosted pricing model สำหรับ Enterprise?
- [ ] รองรับ marketplace ไทยเพิ่ม: JD Central, Wemall?
- [x] รองรับทุกภาษาในโลก (Google Translate 130+ ภาษา + DeepL fallback)
- [x] Webhook ทุก plan (ไม่ล็อก Advanced)
- [x] AI flat rate ใน plan (ไม่คิดต่อ message)

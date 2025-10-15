# 🤖 น้องบอท - Line Chatbot with OpenAI

น้องบอทเป็น Chatbot ที่น่ารักน่าเอ็นดูสำหรับช่วยพนักงานใน office ค้นหาข้อมูลสินค้าและหนังสือของบริษัท โดยใช้ Line OA เชื่อมต่อกับ OpenAI และข้อมูลจากไฟล์ Excel

## ✨ คุณสมบัติ

- 🔍 ค้นหาข้อมูลสินค้า/หนังสือจากไฟล์ Excel
- 🤖 ใช้ OpenAI GPT-4 ในการตอบคำถาม
- 💬 บุคลิกภาพน่ารักน่าเอ็นดู
- 📱 รองรับ Line Official Account
- 🛡️ ตอบเฉพาะข้อมูลในระบบเท่านั้น
- 🔒 ไม่เปิดเผยรหัสภายในของสินค้า

## 📊 ข้อมูลที่รองรับ

ระบบสามารถค้นหาข้อมูลจากไฟล์ Excel ตามคอลัมน์ต่อไปนี้:

- **รหัสสินค้า** (Column B)
- **ชื่อสินค้า/หนังสือ** (ภาษาไทย/อังกฤษ, แบบยาว/สั้น)
- **กลุ่มสาระการเรียนรู้** (ภาษาไทย/อังกฤษ)
- **คำนำหน้าชื่อสินค้า/หนังสือ**
- **ประเภทหนังสือ**
- **ชั้นปี**
- **สถานะสินค้าใหม่**
- **มี E-book หรือไม่**
- **URL รูปภาพ**

## 🚀 การติดตั้งและใช้งาน

### Local Development

#### 1. ติดตั้ง Dependencies

```bash
npm install
```

#### 2. ตั้งค่า Environment Variables

สร้างไฟล์ `.env` จาก `.env.example`:

```bash
copy .env.example .env   # Windows
# หรือ
cp .env.example .env     # Mac/Linux
```

แก้ไขไฟล์ `.env`:

```env
# Line Bot Configuration
LINE_CHANNEL_ACCESS_TOKEN=your_line_channel_access_token_here
LINE_CHANNEL_SECRET=your_line_channel_secret_here

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Server Configuration
PORT=3000
```

### 3. เตรียมไฟล์ข้อมูล

วางไฟล์ `item-asset.xlsx` ในโฟลเดอร์หลักของโปรเจค

#### 4. เริ่มต้นใช้งาน (Local)

```bash
# สำหรับ Development
npm run dev

# หรือสำหรับ Production testing
npm start
```

### Production Deployment

สำหรับ Deploy บน Render, ดูคำแนะนำใน [DEPLOYMENT.md](DEPLOYMENT.md)

#### Quick Deploy Steps:
1. Push code ไป GitHub
2. Connect กับ Render
3. ตั้งค่า Environment Variables
4. Deploy!

```bash
# Deploy script (สำหรับ Linux/Mac)
chmod +x deploy.sh
./deploy.sh
```

## 🔧 API Endpoints

### Webhook สำหรับ Line
```
POST /webhook
```

### Health Check
```
GET /health
```

### ทดสอบการค้นหา
```
GET /search/:query
```

### ทดสอบ OpenAI Response
```
POST /test-ai
Content-Type: application/json
{
  "message": "คำถามที่ต้องการทดสอบ"
}
```

## 📱 การตั้งค่า Line Official Account

### 1. สร้าง Line Official Account
1. ไปที่ [Line Developers Console](https://developers.line.biz/)
2. สร้าง Provider และ Channel ใหม่
3. เลือก "Messaging API"

### 2. ตั้งค่า Webhook
1. ในหน้า Channel settings
2. เปิดใช้งาน "Use webhook"
3. ใส่ URL: `https://your-domain.com/webhook`
4. เปิดใช้งาน "Allow bot to join group chats" (ถ้าต้องการ)

### 3. รับ Access Token และ Channel Secret
1. Channel Access Token: ใน "Messaging API" tab
2. Channel Secret: ใน "Basic settings" tab

## 🤖 วิธีใช้งาน Chatbot

### คำสั่งพื้นฐาน
- **ทักทาย**: "สวัสดี", "hello", "hi"
- **ค้นหาสินค้า**: "มีหนังสือคณิตศาสตร์ไหม"
- **ค้นหาตามชั้นปี**: "หนังสือชั้น ป.1"
- **ค้นหาสินค้าใหม่**: "สินค้าใหม่มีอะไรบ้าง"

### ตัวอย่างการใช้งาน

**ผู้ใช้**: "มีหนังสือภาษาอังกฤษชั้น ม.1 ไหม"

**น้องบอท**: "มีค่ะพี่! น้องเจอหนังสือภาษาอังกฤษชั้น ม.1 ให้พี่เลยค่ะ 📚

รหัสสินค้า: EN101
ชื่อหนังสือ: English for Communication ม.1
กลุ่มสาระ: ภาษาต่างประเทศ
ประเภท: หนังสือเรียน
มี E-book: ใช่

มีอะไรอื่นให้น้องช่วยไหมคะ? 😊"

## 🛠️ โครงสร้างโปรเจค

```
chatbot-with-openai/
├── server.js              # Express server และ Line webhook
├── excelReader.js         # อ่านและค้นหาข้อมูล Excel
├── openaiClient.js        # OpenAI integration
├── item-asset.xlsx        # ไฟล์ข้อมูลสินค้า
├── package.json
├── .env                   # Environment variables (ไม่อัปโหลดใน Git)
├── .env.example          # Template สำหรับ .env
└── README.md
```

## 🔐 ความปลอดภัย

- ไม่เปิดเผย **รหัสภายใน** (internal codes) ของสินค้า
- ตรวจสอบคำถามและตอบเฉพาะข้อมูลในระบบ
- ใช้ environment variables สำหรับ sensitive data
- การตอบเฉพาะเรื่องที่เกี่ยวข้องกับสินค้า

## 🚨 การแก้ไขปัญหา

### ปัญหาที่พบบ่อย

1. **Webhook ไม่ทำงาน**
   - ตรวจสอบ URL และ SSL certificate
   - ดู logs ในคอนโซล

2. **OpenAI ไม่ตอบ**
   - ตรวจสอบ API Key
   - ดู usage limits ใน OpenAI Dashboard

3. **ข้อมูล Excel ไม่โหลด**
   - ตรวจสอบว่าไฟล์อยู่ในตำแหน่งที่ถูกต้อง
   - ตรวจสอบรูปแบบข้อมูลใน Excel

### Logs และ Debugging

```bash
# ดู logs real-time
npm run dev

# ตรวจสอบ health
curl http://localhost:3000/health

# ทดสอบการค้นหา
curl http://localhost:3000/search/คณิตศาสตร์
```

## 📞 การติดต่อและสนับสนุน

หากมีปัญหาหรือข้อสงสัย กรุณาติดต่อทีมพัฒนาระบบ

---

**สร้างด้วย ❤️ สำหรับพนักงาน Office ที่น่ารัก**
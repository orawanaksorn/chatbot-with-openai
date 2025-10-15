# 📋 Pre-Deployment Checklist

## ก่อน Deploy บน Render

### ✅ เตรียม Code
- [ ] ทดสอบ `npm start` ใน local แล้ว
- [ ] ไฟล์ `item-asset.xlsx` อยู่ในโปรเจค
- [ ] ไม่มีไฟล์ `.env` ใน Git (มีแค่ `.env.example`)
- [ ] อัปเดต `package.json` engines
- [ ] ทดสอบ health endpoint: `http://localhost:3000/health`

### ✅ Environment Variables ที่ต้องมี
- [ ] `OPENAI_API_KEY` - จาก OpenAI Platform
- [ ] `LINE_CHANNEL_ACCESS_TOKEN` - จาก Line Developers
- [ ] `LINE_CHANNEL_SECRET` - จาก Line Developers  
- [ ] `NODE_ENV=production`
- [ ] `PORT=10000` (สำหรับ Render)

### ✅ Line OA Setup
- [ ] สร้าง Line Official Account แล้ว
- [ ] สร้าง Messaging API Channel แล้ว
- [ ] ได้ Access Token และ Channel Secret แล้ว
- [ ] ปิดการตอบข้อความอัตโนมัติของ Line

### ✅ OpenAI Setup  
- [ ] สร้างบัญชี OpenAI แล้ว
- [ ] สร้าง API Key แล้ว
- [ ] มี Credits เพียงพอใน account
- [ ] ทดสอบ API Key ใช้งานได้

### ✅ GitHub Repository
- [ ] สร้าง GitHub repository แล้ว
- [ ] Push code ขึ้น main branch แล้ว
- [ ] ไม่มีไฟล์ sensitive ใน repo

## หลัง Deploy

### ✅ ทดสอบ Render
- [ ] Deploy สำเร็จ (ไม่มี error)
- [ ] Health check ผ่าน: `https://your-app.onrender.com/health`
- [ ] Log ไม่มี error ใน Dashboard

### ✅ ตั้งค่า Line Webhook
- [ ] ใส่ URL: `https://your-app.onrender.com/webhook`
- [ ] Verify webhook สำเร็จ (200 OK)
- [ ] เปิดใช้งาน "Use webhook"

### ✅ ทดสอบ Bot
- [ ] เพิ่มเพื่อน Line OA
- [ ] ส่ง "สวัสดี" - ได้รับการต้อนรับ
- [ ] ทดสอบคำถามสินค้า - ตอบได้ถูกต้อง
- [ ] ทดสอบคำถามนอกเรื่อง - ปฏิเสธสุภาพ

## 🚨 สิ่งที่ต้องระวัง

### ❌ ห้ามทำ
- อัปโหลด `.env` ไป Git
- ใช้ API Key ที่หมดอายุ
- ลืมปิด auto-reply ของ Line
- ใส่ webhook URL ผิด

### ⚠️ ข้อควรระวัง
- Render Free Plan มีข้อจำกัดเวลา
- OpenAI API มีค่าใช้จ่าย
- Line Webhook ต้องใช้ HTTPS
- Excel file ต้องอยู่ใน repository

## 📞 หากมีปัญหา

1. **ตรวจสอบ Logs ใน Render Dashboard**
2. **ทดสอบ Health Endpoint**
3. **เช็ค Environment Variables**
4. **ดู Line Developer Console**
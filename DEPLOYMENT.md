# 🚀 Render Deployment Guide

## ขั้นตอนการ Deploy น้องบอท บน Render

### 1. เตรียม GitHub Repository

```bash
# เริ่มต้น Git repository
git init
git add .
git commit -m "Initial commit: Line chatbot with OpenAI"

# Push ไป GitHub (สร้าง repository ใหม่ก่อน)
git remote add origin https://github.com/yourusername/chatbot-with-openai.git
git branch -M main
git push -u origin main
```

### 2. สร้างบัญชี Render

1. ไปที่ https://render.com
2. Sign up ด้วย GitHub account
3. Connect GitHub repository ของคุณ

### 3. Deploy Web Service

1. คลิก **"New +"** → **"Web Service"**
2. เลือก GitHub repository ของคุณ
3. ตั้งค่าดังนี้:

**Basic Settings:**
- **Name**: `line-chatbot-openai`
- **Environment**: `Node`
- **Region**: `Singapore` (ใกล้ไทยที่สุด)
- **Branch**: `main`

**Build & Deploy:**
- **Build Command**: `npm install`
- **Start Command**: `npm start`

**Plan:**
- เลือก **"Free"**

### 4. ตั้งค่า Environment Variables

ใน Render Dashboard → Environment tab เพิ่ม:

```
NODE_ENV=production
OPENAI_API_KEY=sk-your-openai-api-key-here
LINE_CHANNEL_ACCESS_TOKEN=your-line-channel-access-token
LINE_CHANNEL_SECRET=your-line-channel-secret
PORT=10000
```

### 5. Deploy!

1. คลิก **"Create Web Service"**
2. รอการ Deploy (ประมาณ 2-5 นาที)
3. จะได้ URL เช่น: `https://line-chatbot-openai-xyz.onrender.com`

### 6. ตั้งค่า Line Webhook

1. ไปที่ [Line Developers Console](https://developers.line.biz/)
2. เลือก Channel ของคุณ
3. ไปที่ "Messaging API" tab
4. ใส่ Webhook URL: 
   ```
   https://your-app-name.onrender.com/webhook
   ```
5. เปิดใช้งาน "Use webhook"
6. Verify webhook (ควรได้ 200 OK)

### 7. ทดสอบ

**Test Health Check:**
```
GET https://your-app-name.onrender.com/health
```

**Test Line Bot:**
- เพิ่มเพื่อน Line OA ของคุณ
- ส่งข้อความ "สวัสดี"
- น้องบอทควรตอบกลับ

### 8. Monitor & Debug

**ดู Logs:**
- ใน Render Dashboard → Logs tab
- แสดง real-time logs

**เช็ค Metrics:**
- ดู CPU/Memory usage ใน Dashboard
- ติดตาม uptime

## 🔧 Troubleshooting

### ปัญหาที่พบบ่อย:

**1. Build Failed**
```bash
# ตรวจสอบ package.json
npm install  # ทดสอบใน local ก่อน
```

**2. Webhook ไม่ทำงาน**
- ตรวจสอบ URL ถูกต้อง
- เช็ค Environment Variables
- ดู Logs มี error อะไร

**3. OpenAI ไม่ตอบ**
- ตรวจสอบ API Key
- เช็ค usage limits

**4. Excel File ไม่โหลด**
- ตรวจสอบไฟล์อยู่ใน repository
- เช็ค path ถูกต้อง

### Commands สำหรับ Debug:

```bash
# ทดสอบใน local
npm start

# ตรวจสอบ health
curl https://your-app.onrender.com/health

# ทดสอบการค้นหา
curl https://your-app.onrender.com/search/คณิตศาสตร์
```

## 💡 Tips สำหรับ Production

1. **Monitor Logs**: ดู logs เป็นประจำ
2. **Set up Alerts**: ใช้ Render monitoring
3. **Backup Data**: สำรอง Excel file
4. **Update Dependencies**: อัพเดต packages เป็นระยะ
5. **Test Regularly**: ทดสอบ bot เป็นประจำ

## 📞 Support

หากมีปัญหา:
1. เช็ค logs ใน Render Dashboard
2. ทดสอบ health endpoint
3. ตรวจสอบ Environment Variables
4. อ่าน Render documentation
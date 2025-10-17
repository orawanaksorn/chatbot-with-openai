# Copilot Coding Agent Instructions for chatbot-with-openai

## Project Overview
This is a Node.js chatbot for Line OA, integrating OpenAI for natural language responses and using an Excel file (`item-asset.xlsx`) as the authoritative product/book data source. The bot only answers questions about products/books in the Excel file; all other queries are politely declined.

## Architecture & Key Files
- `server.js`: Express server, Line webhook, API endpoints, error handling, rate limiting, CORS, security headers.
- `excelReader.js`: Loads and queries product/book data from Excel. All search logic is here.
- `openaiClient.js`: Handles OpenAI API calls, prompt engineering, and error handling. Only answers using Excel data.
- `.env.example`: Template for required environment variables.
- `render.yaml`: Render.com deployment configuration.
- `DEPLOYMENT.md`, `CHECKLIST.md`: Deployment and pre-launch checklists.
- `README.md`: User and developer documentation.

## Data Flow
- Incoming Line messages are received at `/webhook`.
- Text messages are checked for greetings, then searched in Excel data.
- Results are formatted and sent to OpenAI with a strict system prompt.
- OpenAI's response is sent back to the user via Line.
- All non-product queries are answered with a polite refusal.

## Developer Workflows
- **Local development:**
  - Install dependencies: `npm install`
  - Start server: `npm run dev` (nodemon) or `npm start`
  - Test endpoints: `/health`, `/search/:query`, `/test-ai`
- **Deployment:**
  - Push to GitHub, connect to Render, set env vars, deploy.
  - See `DEPLOYMENT.md` and `CHECKLIST.md` for step-by-step instructions.
- **Environment variables:**
  - Required: `OPENAI_API_KEY`, `LINE_CHANNEL_ACCESS_TOKEN`, `LINE_CHANNEL_SECRET`, `PORT`
  - Never commit `.env` to git; use `.env.example` for reference.

## Conventions & Patterns
- All product/book data must come from the Excel file; never invent or hallucinate data.
- System prompt in `openaiClient.js` enforces bot persona and answer boundaries.
- Error handling is strict: missing env vars, OpenAI errors, Excel load failures all log and fail gracefully.
- Rate limiting is applied to `/webhook` for production safety.
- Security headers and CORS are set for all requests.
- All code and responses must be polite, friendly, and in Thai language.
- Internal codes (e.g., product internal code) must never be exposed in responses.

## Integration Points
- **Line OA:** via `@line/bot-sdk`, webhook at `/webhook`.
- **OpenAI:** via `openai` npm package, model is configurable (default: `gpt-4`).
- **Excel:** via `xlsx` npm package, file must be present in project root.
- **Render.com:** deployment via `render.yaml` and environment variables.

## Example Patterns
- Searching for products: `excelReader.searchProducts(query)`
- Generating OpenAI response: `openaiClient.searchAndRespond(userMessage, excelReader)`
- Health check: `GET /health` returns service status and data summary.
- Refusing non-product queries: "กรุณาติดต่อเจ้าหน้าที่ค่ะ น้องบอทช่วยเรื่องข้อมูลสินค้าได้เท่านั้นนะคะ 😊"

## Special Notes
- All user-facing responses must be in Thai and match the bot's friendly persona.
- If Excel data is missing or corrupted, respond with a polite error and log the issue.
- For deployment, always verify health and webhook endpoints post-launch.

---

_If any section is unclear or missing, please request feedback to iterate and improve these instructions._

# AI Chatbot Starter

A modern AI chatbot template built on Tencent Cloud EdgeOne, supporting multiple AI models with real-time streaming responses. No traditional backend required.

## ✨ Features

### Core Chat Functionality
- 🤖 Multi-model support (DeepSeek, OpenAI, Gemini, Claude, Nebius)
- 💬 Real-time streaming responses
- 📝 Multi-turn conversation support
- 🔄 Context retention within conversations
- 📱 Responsive and mobile-friendly interface
- 🎨 Dark/light mode support

### 📎 File & Media Handling (New!)
- **PDF Upload & Reading**: Upload and extract text from PDF documents for analysis
- **Image Understanding (Vision)**: Upload images (JPG, PNG, GIF, WebP, BMP) for AI vision analysis, OCR, object detection, and image description
- **Spreadsheet Analysis**: Upload and analyze CSV, XLSX, XLS, and ODS files for data insights and pattern detection
- **Document Summarization**: Upload TXT, Markdown, DOCX, and DOC files for AI-powered summarization and key point extraction

## Deploy

[![Deploy to EdgeOne](https://cdnstatic.tencentcs.com/edgeone/pages/deploy.svg)](https://edgeone.ai/pages/new?template=https://github.com/tomcomtang/ai-chatbot-starter&output-directory=./public&build-command=npm%20run%20build&install-command=npm%20install)

Click the button above to deploy directly to Tencent Cloud EdgeOne Pages.

## 🌐 Live Demo

[https://ai-chatbot-starter.edgeone.app/](https://ai-chatbot-starter.edgeone.app/)

## ⚙️ Required Environment Variables

Set the following environment variables (API keys) in EdgeOne Pages or your local `.env` file:

```
DEEPSEEK_API_KEY=your_deepseek_api_key
OPENAI_API_KEY=your_openai_api_key
GEMINI_API_KEY=your_gemini_api_key
NEBIUS_API_KEY=your_nebius_api_key
CLAUDE_API_KEY=your_claude_api_key
```

## 🛠️ Local Development

### 1. Frontend (Next.js)

Start the frontend locally:

```bash
npm install
npm run dev
```

### 2. Edge Functions (API)

You need to install EdgeOne CLI globally and follow the official steps to run local edge functions:

#### Quick Start Guide

1. **Install EdgeOne CLI globally:**

   ```bash
   npm install -g edgeone
   ```

   For more commands, see the [scaffolding document](https://pages.edgeone.ai/document/edgeone-cli).

2. **Function Initialization:**

   ```bash
   edgeone pages init
   ```

   This will automatically initialize the functions directory and host the functions code.

3. **Associate Project:**

   ```bash
   edgeone pages link
   ```

   Enter your current project name to automatically associate project KV configuration, environment variables, etc.

4. **Local Development:**

   ```bash
   edgeone pages dev
   ```

   This will start the local proxy service and enable function debugging (usually at http://localhost:8088).

5. **Function Release:**
   Push code to the remote repository to automatically build and release the function.

---

### Dev workflow (quick start)

Use these commands to run the frontend and the EdgeOne functions together locally. Open two terminals.

1) Install dependencies and start the Next.js frontend (Terminal A):

```powershell
npm.cmd install
npm.cmd run dev
# Frontend: http://localhost:3000
```

2) Install and start EdgeOne functions (Terminal B). If you don't have the EdgeOne CLI yet:

```powershell
npm i -g edgeone
# Then in the project root:
npm run dev:functions
# This runs `edgeone pages dev` and commonly serves functions at http://localhost:8088
```

3) Quick function health check (Terminal C or A/B):

```powershell
npm run exercise:functions
# Posts to http://localhost:8088/api/models and prints the JSON response
```

## 📂 File & Media Handling Setup

### Optional: Enhanced Library Support

For full support of all file formats, install these optional libraries:

```bash
# For PDF text extraction (better than basic parsing)
npm install pdfjs-dist

# For Excel file parsing (.xlsx, .xls)
npm install xlsx

# For DOCX file parsing
npm install mammoth
```

### Supported File Formats

| Feature | Formats | Status |
|---------|---------|--------|
| **PDF Upload & Reading** | `.pdf` | ✅ Basic support (install pdfjs-dist for full extraction) |
| **Image Understanding** | `.jpg, .jpeg, .png, .gif, .webp, .bmp` | ✅ Full support |
| **Spreadsheet Analysis** | `.csv, .xlsx, .xls, .ods` | ✅ CSV fully supported (install xlsx for Excel) |
| **Document Summarization** | `.txt, .md, .docx, .doc` | ✅ TXT & MD fully supported (install mammoth for DOCX) |

### Usage Example

1. Click the file upload button (📎 PDF, 🖼️ Image, 📊 Sheet, or 📄 Doc)
2. Select a file from your computer
3. The chatbot will automatically extract content and display a preview
4. Ask the AI to analyze, summarize, or answer questions about your file

## 🚀 Advanced Features

### Vision Analysis with Images
- Describe image content
- Extract text from images (OCR)
- Identify objects and entities
- Answer questions about image content
- Analyze charts and diagrams

### Spreadsheet Intelligence
- Analyze data patterns
- Generate insights from datasets
- Perform calculations
- Identify trends and correlations
- Create data summaries

### Document Processing
- Extract key points and summaries
- Identify main topics
- Generate executive summaries
- Analyze document structure
- Compare multiple documents

## 📝 Project Structure

```
ai-chatbot-starter/
├── app/                    # Next.js app directory
│   ├── page.jsx           # Main chat page
│   ├── globals.css        # Global styles
│   └── aiApi.js           # AI API integration
├── components/            # React components
│   ├── ChatHistory.jsx    # Chat message history
│   ├── ChatInputBar.jsx   # Input bar with send button
│   ├── MessageItem.jsx    # Individual message display
│   ├── ModelSelector.jsx  # AI model selector
│   ├── PDFUploader.jsx    # PDF upload handler
│   ├── ImageUploader.jsx  # Image upload handler
│   ├── SpreadsheetUploader.jsx  # Spreadsheet upload handler
│   └── DocumentUploader.jsx     # Document upload handler
├── functions/             # EdgeOne functions
│   └── api/
│       └── ai/           # AI API proxy functions
├── lib/                   # Utility functions
│   └── fileProcessor.js  # File processing utilities
├── scripts/              # Build/dev scripts
└── package.json         # Dependencies
```

## 🔧 Configuration

### Notes
- `next.config.js` contains a development rewrite: `/api/*` is proxied to `http://localhost:8088/api/*` so the frontend can call `/api/ai` without code changes.
- Set provider API keys in EdgeOne environment to call real providers: `DEEPSEEK_API_KEY`, `OPENAI_API_KEY`, `GEMINI_API_KEY`, `CLAUDE_API_KEY`, `NEBIUS_API_KEY`.
- Maximum file sizes: PDF (50MB), Image (20MB), Spreadsheet (50MB), Document (50MB)

## 🤝 Contributing

Feel free to open an issue or PR if you have questions, suggestions, or improvements!

## 📄 License

This project is licensed under the MIT License.

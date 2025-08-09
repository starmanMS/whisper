# Whisper 客服 Widget

基于 React + Next.js 开发的现代化客服聊天组件，专为若依框架的 whisper-customer 模块设计。

## ✨ 特性

- 🚀 **现代化技术栈**: React 18 + Next.js 15 + TypeScript
- 🎨 **精美UI设计**: Tailwind CSS + shadcn/ui + Framer Motion
- 📱 **响应式设计**: 完美适配桌面端、平板和手机
- ⚡ **实时通信**: WebSocket + HTTP API 双重保障
- 🎭 **流畅动画**: Framer Motion 驱动的丝滑动画效果
- 🎯 **专业主题**: 符合商务需求的 Whisper 主题设计
- 🔧 **高度可配置**: 支持主题、API、功能等全方位自定义

## 🛠️ 技术栈

- **前端框架**: React 18 + Next.js 15
- **类型系统**: TypeScript
- **样式方案**: Tailwind CSS + shadcn/ui
- **动画库**: Framer Motion
- **图标库**: Lucide React
- **状态管理**: React Hooks
- **通信协议**: WebSocket + RESTful API

## 📦 安装依赖

```bash
npm install
# 或
yarn install
# 或
pnpm install
```

## 🚀 快速开始

### 1. 启动开发服务器

```bash
npm run dev
# 或
yarn dev
# 或
pnpm dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看演示页面。

### 2. 基础使用

```tsx
import { ChatWidget } from '@/components/chat/ChatWidget'

export default function App() {
  return (
    <div>
      {/* 你的页面内容 */}

      {/* 客服Widget */}
      <ChatWidget
        apiBaseUrl="http://localhost:8080/api/chat"
        websocketUrl="ws://localhost:8080/ws/chat"
      />
    </div>
  )
}
```

### 3. 自定义配置

```tsx
<ChatWidget
  // API配置
  apiBaseUrl="http://localhost:8080/api/chat"
  websocketUrl="ws://localhost:8080/ws/chat"

  // 主题配置
  theme={{
    primary: '#4f46e5',
    secondary: '#f8fafc',
    background: '#ffffff'
  }}

  // 功能配置
  config={{
    welcomeMessage: '您好！有什么可以帮助您的吗？',
    placeholder: '请输入您的问题...',
    maxMessages: 100
  }}

  // 默认状态
  defaultOpen={false}

  // 自定义样式
  className="custom-widget"
/>
```

## 🎨 主题配置

Widget 支持完全自定义的主题配置：

```tsx
const customTheme = {
  primary: '#4f46e5',      // 主色调
  secondary: '#f8fafc',    // 次要背景色
  background: '#ffffff',   // 主背景色
  text: '#0f172a',        // 主文本色
  textSecondary: '#64748b', // 次要文本色
  border: '#e2e8f0',      // 边框色
  success: '#059669',     // 成功色
  warning: '#d97706',     // 警告色
  error: '#dc2626'        // 错误色
}
```

## 📱 响应式设计

Widget 自动适配不同设备：

- **桌面端**: 固定尺寸浮动窗口 (384x512px)
- **平板**: 适中尺寸窗口 (400x500px)
- **手机**: 全屏模式，优化触摸体验

## 🔌 API 接口

### WebSocket 消息格式

```typescript
interface WebSocketMessage {
  type: 'message' | 'typing' | 'status' | 'error' | 'system'
  content: string
  messageId?: string
  timestamp: string
  sender?: 'user' | 'agent' | 'system'
  sessionId?: string
}
```

### HTTP API 接口

- `POST /api/chat/init` - 初始化会话
- `POST /api/chat/message` - 发送消息
- `GET /api/chat/history` - 获取历史记录
- `POST /api/chat/end` - 结束会话
- `POST /api/chat/upload` - 文件上传

## 🎭 动画效果

使用 Framer Motion 实现的动画效果：

- 聊天窗口弹出/收起动画
- 消息滑入动画
- 打字指示器动画
- 浮动按钮交互动画
- 连接状态指示动画

## 📁 项目结构

```
whisper-widget/
├── src/
│   ├── components/
│   │   └── chat/
│   │       ├── ChatWidget.tsx      # 主组件
│   │       ├── ChatMessage.tsx     # 消息组件
│   │       ├── ChatInput.tsx       # 输入框组件
│   │       └── ChatHeader.tsx      # 头部组件
│   ├── hooks/
│   │   ├── useChatApi.ts          # API Hook
│   │   ├── useChatWebSocket.ts    # WebSocket Hook
│   │   └── useResponsive.ts       # 响应式 Hook
│   ├── config/
│   │   ├── widget.config.ts       # Widget配置
│   │   └── animations.ts          # 动画配置
│   ├── utils/
│   │   └── chat.utils.ts          # 工具函数
│   └── app/
│       └── page.tsx               # 演示页面
├── public/
├── package.json
└── README.md
```

## 🤝 与后端集成

确保后端 whisper-customer 模块提供以下接口：

1. **WebSocket 端点**: `/ws/chat`
2. **HTTP API 端点**: `/api/chat/*`
3. **CORS 配置**: 允许前端域名访问

## 📝 开发说明

### 添加新功能

1. 在 `src/components/chat/` 下创建新组件
2. 在 `src/hooks/` 下添加相关 Hook
3. 更新 `src/config/` 中的配置文件
4. 在主组件中集成新功能

### 自定义主题

1. 修改 `src/config/widget.config.ts` 中的主题配置
2. 更新组件中的样式引用
3. 测试不同主题下的显示效果

---

**Whisper 客服 Widget** - 为现代化客服系统而生 🚀

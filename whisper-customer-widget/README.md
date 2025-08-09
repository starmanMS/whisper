# Whisper Chat Widget

智能客服聊天组件，基于 Vue 3 + Vite + Tailwind CSS 构建，支持实时消息、文件上传、表情符号等功能。

## ✨ 特性

- 🚀 **Vue 3 + Composition API** - 现代化的前端框架
- ⚡ **Vite 构建** - 快速的开发和构建体验
- 🎨 **Tailwind CSS** - 实用优先的 CSS 框架
- 🔌 **WebSocket 实时通信** - 支持实时消息推送
- 📱 **响应式设计** - 完美适配桌面端和移动端
- 🌙 **主题切换** - 支持浅色/深色主题
- 📎 **文件上传** - 支持图片和文件上传
- 😊 **表情符号** - 内置表情选择器
- 🔄 **自动重连** - 网络断开自动重连
- 🎯 **零依赖** - 打包后无外部依赖

## 📦 安装

### 方式一：直接引入（推荐）

```html
<!-- 引入 CSS -->
<link rel="stylesheet" href="./dist/style.css">

<!-- 引入 JS -->
<script src="./dist/whisper-chat-widget.umd.cjs"></script>

<!-- 初始化 -->
<script>
  WhisperChat.init({
    apiUrl: 'http://localhost:8080/api',
    websocketUrl: 'ws://localhost:8080/websocket',
    customerId: 'your_customer_id',
    customerName: '客户姓名'
  });
</script>
```

### 方式二：CDN 引入

```html
<!-- 从 CDN 引入（需要部署到 CDN） -->
<link rel="stylesheet" href="https://cdn.example.com/whisper-chat-widget/style.css">
<script src="https://cdn.example.com/whisper-chat-widget/whisper-chat-widget.umd.cjs"></script>
```

### 方式三：NPM 安装

```bash
npm install whisper-chat-widget
```

```javascript
import WhisperChat from 'whisper-chat-widget'
import 'whisper-chat-widget/dist/style.css'

WhisperChat.init({
  // 配置选项
})
```

## 🚀 快速开始

### 基本使用

```javascript
// 初始化 Widget
WhisperChat.init({
  apiUrl: 'http://localhost:8080/api',
  websocketUrl: 'ws://localhost:8080/websocket',
  customerId: 'customer_123',
  customerName: '张三',
  theme: 'light',
  position: 'bottom-right'
});

// 打开聊天对话框
WhisperChat.open();

// 关闭聊天对话框
WhisperChat.close();
```

### 配置选项

| 参数 | 类型 | 必需 | 默认值 | 说明 |
|------|------|------|--------|------|
| `apiUrl` | string | ✅ | - | API 服务器地址 |
| `websocketUrl` | string | ✅ | - | WebSocket 服务器地址 |
| `customerId` | string | ✅ | - | 客户唯一标识 |
| `customerName` | string | ❌ | - | 客户姓名 |
| `theme` | string | ❌ | 'light' | 主题：'light' \| 'dark' |
| `position` | string | ❌ | 'bottom-right' | 位置：'bottom-right' \| 'bottom-left' |

## 📖 API 文档

### 初始化方法

#### `WhisperChat.init(options)`

初始化聊天 Widget。

```javascript
WhisperChat.init({
  apiUrl: 'http://localhost:8080/api',
  websocketUrl: 'ws://localhost:8080/websocket',
  customerId: 'customer_123',
  customerName: '张三'
});
```

### 控制方法

#### `WhisperChat.open()`

打开聊天对话框。

#### `WhisperChat.close()`

关闭聊天对话框。

#### `WhisperChat.destroy()`

销毁 Widget，清理所有资源。

### 配置方法

#### `WhisperChat.setTheme(theme)`

设置主题。

```javascript
WhisperChat.setTheme('dark'); // 'light' | 'dark'
```

#### `WhisperChat.setPosition(position)`

设置位置。

```javascript
WhisperChat.setPosition('bottom-left'); // 'bottom-right' | 'bottom-left'
```

### 状态方法

#### `WhisperChat.getState()`

获取当前状态。

```javascript
const state = WhisperChat.getState();
console.log(state);
// {
//   isInitialized: true,
//   isDialogOpen: false,
//   isConnected: true,
//   unreadCount: 0,
//   chatState: { ... }
// }
```

## 🔧 开发

### 环境要求

- Node.js >= 16
- npm >= 7

### 开发命令

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

### 项目结构

```
whisper-customer-widget/
├── src/
│   ├── components/          # Vue 组件
│   │   ├── ChatWidget.vue   # 主组件
│   │   ├── ChatButton.vue   # 聊天按钮
│   │   ├── ChatDialog.vue   # 聊天对话框
│   │   ├── MessageList.vue  # 消息列表
│   │   └── MessageInput.vue # 消息输入框
│   ├── composables/         # 组合式函数
│   │   ├── useWebSocket.js  # WebSocket 管理
│   │   └── useChat.js       # 聊天功能
│   ├── utils/               # 工具函数
│   │   └── api.js           # API 客户端
│   ├── style.css            # 全局样式
│   └── main.js              # 入口文件
├── dist/                    # 构建输出
├── public/                  # 静态资源
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

## 🎨 自定义样式

Widget 使用 Tailwind CSS 构建，支持主题定制：

```css
/* 自定义主色调 */
:root {
  --whisper-primary-500: #3b82f6;
  --whisper-primary-600: #2563eb;
}

/* 自定义聊天按钮样式 */
.whisper-chat-button {
  background: var(--whisper-primary-500) !important;
}
```

## 🔌 后端集成

Widget 需要配合后端 API 使用，支持以下接口：

### HTTP API

- `POST /api/chat/init` - 初始化聊天会话
- `POST /api/chat/sendMessage` - 发送消息
- `GET /api/chat/messages/{conversationId}` - 获取历史消息
- `POST /api/chat/markRead` - 标记消息已读
- `POST /api/chat/endConversation/{conversationId}` - 结束会话

### WebSocket

- 连接地址：`/websocket/chat/customer/{customerId}`
- 支持实时消息推送和接收

## 📱 移动端适配

Widget 完全支持移动端：

- 小于 768px 屏幕自动切换为全屏模式
- 支持触摸操作
- 优化的移动端交互体验

## 🌐 浏览器兼容性

- Chrome >= 88
- Firefox >= 85
- Safari >= 14
- Edge >= 88

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📞 支持

如有问题，请联系：

- 邮箱：support@whisper.com
- 文档：https://docs.whisper.com
- GitHub：https://github.com/whisper/chat-widget

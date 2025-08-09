# ChatWidget 配置指南

## 基础配置

### 简化配置方式（推荐）

```tsx
<ChatWidget
  apiBaseUrl="http://localhost:8080/api/chat"
  websocketUrl="ws://localhost:8080"
  config={{
    welcomeMessage: '您好！有什么可以帮助您的吗？',
    placeholder: '请输入您的问题...',
    maxMessages: 100
  }}
/>
```

### 完整配置方式

```tsx
<ChatWidget
  apiBaseUrl="http://localhost:8080/api/chat"
  websocketUrl="ws://localhost:8080"
  theme={{
    primary: '#4f46e5',
    secondary: '#f8fafc',
    background: '#ffffff'
  }}
  config={{
    // 基础设置
    defaultOpen: false,
    maxMessages: 100,
    
    // 消息配置
    messages: {
      welcome: '您好！欢迎使用智能客服系统',
      placeholder: '请输入您的问题...',
      connecting: '正在连接客服...',
      reconnecting: '连接断开，正在重新连接...',
      offline: '客服暂时离线，请稍后再试',
      error: '发送失败，请重试'
    },
    
    // 连接设置
    reconnectAttempts: 5,
    reconnectInterval: 3000,
    heartbeatInterval: 30000,
    
    // 快捷回复
    quickReplies: [
      '我想了解产品信息',
      '我遇到了技术问题',
      '我想咨询价格'
    ]
  }}
/>
```

## 配置选项详解

### 主题配置 (theme)

```tsx
theme: {
  primary: '#4f46e5',        // 主色调
  secondary: '#f8fafc',      // 次要背景色
  background: '#ffffff',     // 主背景色
  text: '#0f172a',          // 主文本色
  textSecondary: '#64748b',  // 次要文本色
  border: '#e2e8f0',        // 边框色
  success: '#059669',       // 成功色
  warning: '#d97706',       // 警告色
  error: '#dc2626'          // 错误色
}
```

### 消息配置 (messages)

```tsx
messages: {
  welcome: '欢迎消息',
  placeholder: '输入框占位符',
  connecting: '连接中提示',
  reconnecting: '重连提示',
  offline: '离线提示',
  error: '错误提示',
  fileUploadError: '文件上传失败',
  fileSizeError: '文件大小超出限制',
  fileTypeError: '不支持的文件类型'
}
```

### 连接设置

```tsx
config: {
  reconnectAttempts: 5,      // 重连次数
  reconnectInterval: 3000,   // 重连间隔(ms)
  heartbeatInterval: 30000,  // 心跳间隔(ms)
  messageTimeout: 30000,     // 消息超时(ms)
  typingTimeout: 3000        // 打字超时(ms)
}
```

### 文件上传设置

```tsx
config: {
  maxFileSize: 10 * 1024 * 1024,  // 最大文件大小(10MB)
  allowedFileTypes: [              // 允许的文件类型
    'image/jpeg',
    'image/png',
    'application/pdf'
  ]
}
```

### 快捷回复

```tsx
config: {
  quickReplies: [
    '我想了解产品信息',
    '我遇到了技术问题',
    '我想咨询价格',
    '我需要售后服务'
  ]
}
```

## 向后兼容性

为了保持向后兼容，Widget支持两种配置方式：

### 方式1：简化配置（推荐新用户）
```tsx
config={{
  welcomeMessage: '欢迎消息',
  placeholder: '占位符',
  maxMessages: 100
}}
```

### 方式2：完整配置（高级用户）
```tsx
config={{
  messages: {
    welcome: '欢迎消息',
    placeholder: '占位符'
  },
  maxMessages: 100
}}
```

## 类型定义

```typescript
interface ChatWidgetProps {
  apiBaseUrl?: string
  websocketUrl?: string
  theme?: Partial<ThemeConfig>
  config?: Partial<WidgetConfig> & {
    welcomeMessage?: string  // 简化配置
    placeholder?: string     // 简化配置
  }
  className?: string
  defaultOpen?: boolean
}
```

## 最佳实践

1. **使用简化配置**：对于基本需求，使用 `welcomeMessage` 和 `placeholder` 即可
2. **主题一致性**：确保主题色彩与您的品牌保持一致
3. **合理的重连设置**：根据网络环境调整重连次数和间隔
4. **文件上传限制**：根据服务器能力设置合理的文件大小限制
5. **快捷回复**：提供常见问题的快捷回复选项

## 示例场景

### 电商客服
```tsx
<ChatWidget
  config={{
    welcomeMessage: '欢迎来到我们的商城！有什么可以帮助您的吗？',
    quickReplies: [
      '查询订单状态',
      '退换货政策',
      '产品咨询',
      '支付问题'
    ]
  }}
/>
```

### 技术支持
```tsx
<ChatWidget
  config={{
    welcomeMessage: '技术支持为您服务，请描述您遇到的问题',
    quickReplies: [
      '登录问题',
      '功能使用',
      '系统故障',
      '账户设置'
    ]
  }}
/>
```

# Whisper Chat Widget 问题排查指南

## 🔍 常见问题及解决方案

### **问题1: 消息发送失败**

#### **症状**
- 用户点击发送按钮后消息无法提交
- 控制台显示API请求错误
- 消息显示"发送失败"状态

#### **可能原因及解决方案**

**1. API路径不匹配**
```javascript
// 检查前端API调用路径
// 正确的路径应该是: /api/chat/sendMessage
// 错误示例: /chat/sendMessage (缺少/api前缀)

// 解决方案: 确保API路径正确
const response = await this.client.post('/api/chat/sendMessage', params);
```

**2. 参数类型不匹配**
```javascript
// 后端期望的参数类型
{
  "conversationId": 1,        // Long类型
  "customerId": 1,           // Long类型  
  "customerName": "用户名",   // String类型
  "messageType": "text",     // String类型
  "content": "消息内容"      // String类型
}

// 确保customerId是数字类型，不是字符串
customerId: parseInt(chatState.customerId) || null
```

**3. 会话未正确初始化**
```javascript
// 检查聊天状态
console.log('Chat State:', {
  conversationId: chatState.conversationId,
  customerId: chatState.customerId,
  isInitialized: chatState.isInitialized
});

// 如果为null，需要重新初始化
if (!chatState.conversationId) {
  await initialize(config);
}
```

### **问题2: 用户信息获取失败**

#### **症状**
- Widget无法显示用户信息
- 初始化接口返回错误
- IP地址获取失败

#### **可能原因及解决方案**

**1. 后端Service注入失败**
```bash
# 检查应用启动日志
grep -i "CustomerService\|ConversationService\|MessageService" application.log

# 应该看到类似输出:
# Services: CustomerService-OK ConversationService-OK MessageService-OK
```

**2. 数据库连接问题**
```sql
-- 检查数据库表是否存在
SHOW TABLES LIKE 'cs_%';

-- 检查客户表结构
DESC cs_customer;

-- 验证字段映射
SELECT reserved1 as ip_address, reserved2 as ip_location FROM cs_customer LIMIT 1;
```

**3. IP地址API调用失败**
```javascript
// 检查网络连接
fetch('http://ip-api.com/json/8.8.8.8?lang=zh-CN')
  .then(response => response.json())
  .then(data => console.log('IP API测试:', data))
  .catch(error => console.error('IP API失败:', error));
```

### **问题3: Widget无法加载**

#### **症状**
- 页面上看不到聊天按钮
- 控制台显示"WhisperChat is not defined"
- Widget初始化失败

#### **可能原因及解决方案**

**1. 脚本文件未正确加载**
```html
<!-- 检查脚本路径 -->
<script src="./dist/whisper-chat-widget.js"></script>

<!-- 确保文件存在 -->
<!-- 检查网络请求是否成功 -->
```

**2. 构建文件问题**
```bash
# 重新构建Widget
cd whisper-customer-widget
npm run build

# 检查构建输出
ls -la dist/
```

**3. 配置错误**
```javascript
// 检查配置参数
const config = {
  apiUrl: 'http://localhost:8080',     // 不要包含/api
  websocketUrl: 'ws://localhost:8080/websocket',
  customerId: 'unique_customer_id',
  customerName: '用户名'
};

// 验证配置
console.log('Widget Config:', config);
```

### **问题4: 权限认证问题**

#### **症状**
- 接口返回401认证失败
- 无法访问聊天API

#### **解决方案**

**1. 检查Security配置**
```java
// 确保聊天接口在白名单中
.antMatchers("/api/chat/**").permitAll()
```

**2. 验证@Anonymous注解**
```java
@Anonymous
@RestController
@RequestMapping("/api/chat")
public class ChatApiController {
    // ...
}
```

**3. 测试接口权限**
```bash
# 测试接口是否可以匿名访问
curl -X GET http://localhost:8080/api/chat/test
```

## 🛠️ 调试工具使用

### **1. 使用调试页面**
```html
<!-- 打开调试页面 -->
open whisper-customer-widget/debug.html
```

### **2. 使用集成测试**
```javascript
// 在浏览器控制台运行
const test = new WidgetIntegrationTest();
test.runAllTests().then(result => {
  console.log('测试结果:', result);
});
```

### **3. 启用详细日志**
```javascript
// 在Widget配置中启用调试模式
WhisperChat.init({
  // ... 其他配置
  debug: true,
  logLevel: 'debug'
});
```

## 📋 检查清单

### **后端检查**
- [ ] 应用正常启动，无错误日志
- [ ] 数据库连接正常
- [ ] 相关表结构正确
- [ ] Service层方法正常注入
- [ ] 权限配置正确

### **前端检查**
- [ ] Widget脚本文件正确加载
- [ ] API路径配置正确
- [ ] 参数类型匹配
- [ ] 网络请求正常
- [ ] 控制台无JavaScript错误

### **网络检查**
- [ ] 后端服务可访问
- [ ] CORS配置正确
- [ ] 防火墙设置正确
- [ ] IP地址API可访问

## 🚨 紧急修复步骤

如果Widget完全无法工作，按以下步骤快速修复：

### **步骤1: 验证后端**
```bash
# 测试后端基本功能
curl http://localhost:8080/api/chat/test
```

### **步骤2: 检查前端构建**
```bash
cd whisper-customer-widget
npm run build
```

### **步骤3: 使用最小配置测试**
```html
<!DOCTYPE html>
<html>
<head>
    <title>最小测试</title>
</head>
<body>
    <script src="./dist/whisper-chat-widget.js"></script>
    <script>
        WhisperChat.init({
            apiUrl: 'http://localhost:8080',
            websocketUrl: 'ws://localhost:8080/websocket',
            customerId: 'test_' + Date.now(),
            customerName: '测试用户'
        });
    </script>
</body>
</html>
```

### **步骤4: 查看详细错误**
```javascript
// 在浏览器控制台查看详细错误
window.addEventListener('error', function(e) {
    console.error('全局错误:', e.error);
});

window.addEventListener('unhandledrejection', function(e) {
    console.error('未处理的Promise错误:', e.reason);
});
```

## 📞 获取帮助

如果以上方法都无法解决问题，请：

1. **收集错误信息**：
   - 浏览器控制台错误
   - 网络请求详情
   - 后端应用日志

2. **提供环境信息**：
   - 浏览器版本
   - 操作系统
   - 网络环境

3. **使用调试工具**：
   - 运行集成测试
   - 生成测试报告
   - 提供详细日志

记住：大多数问题都是配置或路径问题，仔细检查API路径、参数类型和网络连接通常能解决90%的问题。

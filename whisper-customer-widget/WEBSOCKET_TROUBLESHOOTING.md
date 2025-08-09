# WebSocket连接问题排查指南

## 🔍 问题分析

根据错误日志分析，WebSocket连接失败的主要原因是：

```
WebSocket connection to 'ws://localhost:8080/websocket/chat/customer/demo_customer_1754707556882' failed
```

## 🛠️ 已修复的问题

### **1. URL路径匹配问题** ✅
- **问题**：前端连接路径与后端端点不匹配
- **后端端点**：`/websocket/chat/{userType}/{userId}`
- **前端原路径**：`/chat/customer/{customerId}` (缺少 `/websocket` 前缀)
- **修复后路径**：`/websocket/chat/customer/{customerId}`

### **2. 错误处理增强** ✅
- **新增**：详细的连接状态日志
- **新增**：服务器可用性检查
- **新增**：连接测试功能
- **新增**：更好的错误信息提示

### **3. 调试工具完善** ✅
- **新增**：WebSocket连接测试页面
- **新增**：实时连接状态监控
- **新增**：消息发送测试功能

## 📋 排查步骤

### **第一步：检查后端服务**

#### **1.1 确认应用正常启动**
```bash
# 检查应用是否启动
curl http://localhost:8080/api/chat/test

# 应该返回：
# {"msg":"操作成功","code":200,"data":"Chat API is working!"}
```

#### **1.2 检查WebSocket配置**
确认以下文件存在且配置正确：
- `whisper-customer/src/main/java/com/whisper/customer/websocket/WebSocketConfig.java`
- `whisper-customer/src/main/java/com/whisper/customer/websocket/ChatWebSocketHandler.java`

#### **1.3 检查应用日志**
```bash
# 查看应用启动日志，确认WebSocket配置加载
grep -i "websocket\|endpoint" application.log
```

### **第二步：使用测试工具验证**

#### **2.1 打开WebSocket测试页面**
```bash
open whisper-customer-widget/test-websocket-connection.html
```

#### **2.2 按顺序测试**
1. **测试HTTP服务** - 确认后端API可访问
2. **测试WebSocket连接** - 验证WebSocket端点可用
3. **建立WebSocket连接** - 建立持久连接
4. **发送测试消息** - 验证消息收发功能

### **第三步：检查网络和防火墙**

#### **3.1 端口检查**
```bash
# 检查8080端口是否被占用
netstat -an | grep 8080

# 或使用telnet测试
telnet localhost 8080
```

#### **3.2 防火墙检查**
```bash
# Windows防火墙检查
netsh advfirewall firewall show rule name="Java"

# 如果需要，添加防火墙规则
netsh advfirewall firewall add rule name="Java WebSocket" dir=in action=allow protocol=TCP localport=8080
```

### **第四步：前端配置检查**

#### **4.1 检查Widget配置**
```javascript
// 确认WebSocket URL配置正确
const config = {
    websocketUrl: 'ws://localhost:8080',  // 不要包含路径
    customerId: 'unique_customer_id'
};
```

#### **4.2 检查浏览器支持**
```javascript
// 检查浏览器WebSocket支持
if (typeof WebSocket === 'undefined') {
    console.error('浏览器不支持WebSocket');
} else {
    console.log('浏览器支持WebSocket');
}
```

## 🚨 常见问题和解决方案

### **问题1：连接被拒绝 (Connection Refused)**
**症状**：`WebSocket connection failed: Connection refused`

**可能原因**：
- 后端服务未启动
- 端口被占用或防火墙阻止

**解决方案**：
```bash
# 1. 确认服务启动
mvn spring-boot:run -pl whisper-admin

# 2. 检查端口
netstat -an | grep 8080

# 3. 测试HTTP连接
curl http://localhost:8080/api/chat/test
```

### **问题2：404 Not Found**
**症状**：`WebSocket connection failed: 404 Not Found`

**可能原因**：
- WebSocket端点路径错误
- WebSocket配置未正确加载

**解决方案**：
```java
// 确认端点路径正确
@ServerEndpoint("/websocket/chat/{userType}/{userId}")

// 确认配置类存在
@Configuration
public class WebSocketConfig {
    @Bean
    public ServerEndpointExporter serverEndpointExporter() {
        return new ServerEndpointExporter();
    }
}
```

### **问题3：握手失败 (Handshake Failed)**
**症状**：`WebSocket connection failed: Handshake failed`

**可能原因**：
- CORS配置问题
- 协议不匹配 (ws vs wss)

**解决方案**：
```java
// 添加CORS配置
@CrossOrigin(origins = "*")
@ServerEndpoint("/websocket/chat/{userType}/{userId}")
```

### **问题4：连接超时**
**症状**：连接建立缓慢或超时

**可能原因**：
- 网络延迟
- 服务器负载过高

**解决方案**：
```javascript
// 增加连接超时时间
const timeout = setTimeout(() => {
    ws.close();
    reject(new Error('连接超时'));
}, 10000); // 10秒超时
```

## 🧪 测试验证

### **完整测试流程**

#### **1. 后端测试**
```bash
# 启动应用
mvn spring-boot:run -pl whisper-admin

# 测试HTTP API
curl http://localhost:8080/api/chat/test

# 检查WebSocket端点（使用测试工具）
```

#### **2. 前端测试**
```bash
# 重新构建Widget
cd whisper-customer-widget
npm run build

# 打开测试页面
open test-websocket-connection.html
```

#### **3. 集成测试**
```javascript
// 在浏览器控制台运行
const testWs = new WebSocket('ws://localhost:8080/websocket/chat/customer/test_123');
testWs.onopen = () => console.log('连接成功');
testWs.onerror = (e) => console.error('连接失败', e);
```

## 📊 成功标准

连接成功后，您应该看到：

### **后端日志**
```
用户customer_demo_customer_123连接WebSocket成功，当前在线人数为：1
```

### **前端日志**
```
WebSocket connected successfully
WebSocket readyState: 1
WebSocket URL: ws://localhost:8080/websocket/chat/customer/demo_customer_123
```

### **测试页面显示**
- ✅ HTTP服务正常
- ✅ WebSocket连接测试成功
- ✅ WebSocket连接已建立
- ✅ 消息发送成功

## 🔧 高级调试

### **启用详细日志**
```properties
# application.yml
logging:
  level:
    com.whisper.customer.websocket: DEBUG
    org.springframework.web.socket: DEBUG
```

### **网络抓包分析**
```bash
# 使用Wireshark或tcpdump分析网络包
tcpdump -i lo -A -s 0 port 8080
```

### **浏览器开发者工具**
1. 打开开发者工具 (F12)
2. 切换到 Network 标签
3. 过滤 WS (WebSocket)
4. 查看连接状态和消息

## 📞 获取帮助

如果问题仍然存在，请：

1. **收集信息**：
   - 完整的错误日志
   - 浏览器和操作系统版本
   - 网络环境信息

2. **使用测试工具**：
   - 运行WebSocket测试页面
   - 导出详细日志

3. **提供配置**：
   - Widget初始化配置
   - 后端应用配置

记住：大多数WebSocket连接问题都是配置或网络问题，仔细检查URL路径、端口和防火墙设置通常能解决90%的问题。

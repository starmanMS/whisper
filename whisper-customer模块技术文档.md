# Whisper Customer 客服系统模块技术文档

## 1. 模块概述

### 1.1 基本信息
- **模块名称**: whisper-customer
- **模块版本**: 3.9.0
- **功能定位**: 客服系统核心业务模块
- **技术架构**: 基于Spring Boot的微服务模块
- **开发语言**: Java 17
- **构建工具**: Maven

### 1.2 模块职责
whisper-customer模块是Whisper客服系统的核心业务模块，主要负责：
- 客户信息管理和维护
- 客服会话管理和控制
- 实时消息处理和存储
- WebSocket实时通信支持
- 客户端Widget API接口提供
- IP地址获取和地理位置识别

## 2. 技术架构

### 2.1 技术栈
- **核心框架**: Spring Boot 2.5.15
- **Web框架**: Spring MVC
- **安全框架**: Spring Security
- **持久层**: MyBatis + MyBatis-Plus
- **实时通信**: WebSocket (JSR-356)
- **数据验证**: Hibernate Validator
- **JSON处理**: FastJSON2
- **工具库**: Apache Commons Lang3

### 2.2 模块依赖
```xml
<!-- 核心依赖 -->
<dependency>
    <groupId>com.whisper</groupId>
    <artifactId>whisper-common</artifactId>
</dependency>
<dependency>
    <groupId>com.whisper</groupId>
    <artifactId>whisper-framework</artifactId>
</dependency>

<!-- Web和WebSocket -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework</groupId>
    <artifactId>spring-websocket</artifactId>
</dependency>
```

### 2.3 模块结构
```
whisper-customer/
├── src/main/java/com/whisper/customer/
│   ├── controller/          # 控制器层
│   │   ├── ChatApiController.java      # 聊天API控制器
│   │   ├── CsCustomerController.java   # 客户管理控制器
│   │   ├── CsConversationController.java # 会话管理控制器
│   │   └── CsMessageController.java    # 消息管理控制器
│   ├── domain/              # 实体类
│   │   ├── CsCustomer.java            # 客户实体
│   │   ├── CsConversation.java        # 会话实体
│   │   └── CsMessage.java             # 消息实体
│   ├── mapper/              # 数据访问层
│   │   ├── CsCustomerMapper.java      # 客户数据访问
│   │   ├── CsConversationMapper.java  # 会话数据访问
│   │   └── CsMessageMapper.java       # 消息数据访问
│   ├── service/             # 服务层
│   │   ├── ICsCustomerService.java    # 客户服务接口
│   │   ├── ICsConversationService.java # 会话服务接口
│   │   ├── ICsMessageService.java     # 消息服务接口
│   │   └── impl/                      # 服务实现
│   ├── utils/               # 工具类
│   │   └── IpLocationUtils.java       # IP地址工具类
│   └── websocket/           # WebSocket配置
│       ├── ChatWebSocketHandler.java  # WebSocket处理器
│       └── WebSocketConfig.java       # WebSocket配置
└── src/main/resources/
    └── mapper/              # MyBatis映射文件
        ├── CsCustomerMapper.xml
        ├── CsConversationMapper.xml
        └── CsMessageMapper.xml
```

## 3. 核心功能特性

### 3.1 客户信息管理
- **自动客户识别**: 基于IP地址和用户信息自动创建客户档案
- **客户编号生成**: 自动生成唯一客户编号（格式：CUS+日期+序号）
- **IP地理位置**: 自动获取客户IP地址并解析地理位置信息
- **客户分类管理**: 支持个人客户和企业客户分类
- **客户等级管理**: 普通、VIP、SVIP等级管理
- **多渠道来源**: 支持多种客户来源渠道记录

### 3.2 实时会话管理
- **会话生命周期**: 完整的会话创建、进行、结束流程管理
- **会话状态控制**: 待分配、进行中、已结束、已转接等状态管理
- **会话统计**: 会话时长、消息数量、响应时间等统计
- **会话优先级**: 支持低、中、高、紧急四级优先级
- **会话转接**: 支持客服间会话转接功能

### 3.3 消息处理系统
- **多媒体消息**: 支持文本、图片、文件、语音、视频消息
- **消息状态管理**: 已读/未读状态跟踪
- **消息撤回**: 支持消息撤回功能
- **消息回复**: 支持消息引用回复
- **消息存储**: 完整的消息历史记录和检索

### 3.4 WebSocket实时通信
- **双向通信**: 客户端和服务端双向实时消息推送
- **连接管理**: 自动连接、断线重连、心跳检测
- **消息路由**: 智能消息路由和转发机制
- **并发支持**: 支持大量并发WebSocket连接

## 4. 数据模型设计

### 4.1 客户信息表 (cs_customer)
```sql
CREATE TABLE cs_customer (
  customer_id       BIGINT(20)      NOT NULL AUTO_INCREMENT    COMMENT '客户ID',
  customer_no       VARCHAR(32)     NOT NULL                   COMMENT '客户编号',
  customer_name     VARCHAR(100)    NOT NULL                   COMMENT '客户姓名',
  customer_type     CHAR(1)         DEFAULT '1'                COMMENT '客户类型（1个人 2企业）',
  phone             VARCHAR(20)     DEFAULT ''                 COMMENT '手机号码',
  email             VARCHAR(100)    DEFAULT ''                 COMMENT '邮箱地址',
  company           VARCHAR(200)    DEFAULT ''                 COMMENT '公司名称',
  level             CHAR(1)         DEFAULT '1'                COMMENT '客户等级（1普通 2VIP 3SVIP）',
  source            VARCHAR(50)     DEFAULT ''                 COMMENT '客户来源',
  ip_address        VARCHAR(100)    DEFAULT ''                 COMMENT 'IP地址',
  ip_location       VARCHAR(200)    DEFAULT ''                 COMMENT 'IP地理位置',
  status            CHAR(1)         DEFAULT '0'                COMMENT '状态（0正常 1黑名单 2潜在客户）',
  create_time       DATETIME        DEFAULT CURRENT_TIMESTAMP  COMMENT '创建时间',
  update_time       DATETIME        DEFAULT CURRENT_TIMESTAMP  COMMENT '更新时间',
  PRIMARY KEY (customer_id),
  UNIQUE KEY uk_customer_no (customer_no),
  KEY idx_phone (phone),
  KEY idx_email (email)
);
```

### 4.2 会话管理表 (cs_conversation)
```sql
CREATE TABLE cs_conversation (
  conversation_id   BIGINT(20)      NOT NULL AUTO_INCREMENT    COMMENT '会话ID',
  session_id        VARCHAR(64)     NOT NULL                   COMMENT '会话标识',
  customer_id       BIGINT(20)      NOT NULL                   COMMENT '客户ID',
  agent_id          BIGINT(20)      DEFAULT NULL               COMMENT '客服ID',
  channel           VARCHAR(20)     DEFAULT 'web'              COMMENT '渠道（web,mobile,wechat等）',
  conversation_type VARCHAR(20)     DEFAULT 'manual'           COMMENT '会话类型（manual手动,auto自动）',
  title             VARCHAR(200)    DEFAULT ''                 COMMENT '会话标题',
  status            CHAR(1)         DEFAULT '0'                COMMENT '会话状态（0待分配 1进行中 2已结束 3已转接）',
  priority          CHAR(1)         DEFAULT '2'                COMMENT '优先级（1低 2中 3高 4紧急）',
  start_time        DATETIME        NOT NULL                   COMMENT '开始时间',
  end_time          DATETIME        DEFAULT NULL               COMMENT '结束时间',
  duration          INT             DEFAULT 0                  COMMENT '持续时长（秒）',
  message_count     INT             DEFAULT 0                  COMMENT '消息总数',
  PRIMARY KEY (conversation_id),
  KEY idx_customer_id (customer_id),
  KEY idx_agent_id (agent_id),
  KEY idx_status (status)
);
```

### 4.3 消息记录表 (cs_message)
```sql
CREATE TABLE cs_message (
  message_id        BIGINT(20)      NOT NULL AUTO_INCREMENT    COMMENT '消息ID',
  conversation_id   BIGINT(20)      NOT NULL                   COMMENT '会话ID',
  sender_type       CHAR(1)         NOT NULL                   COMMENT '发送者类型（1客户 2客服 3机器人 4系统）',
  sender_id         BIGINT(20)      NOT NULL                   COMMENT '发送者ID',
  sender_name       VARCHAR(100)    DEFAULT ''                 COMMENT '发送者姓名',
  message_type      VARCHAR(20)     DEFAULT 'text'             COMMENT '消息类型（text,image,file,voice,video）',
  content           TEXT                                       COMMENT '消息内容',
  file_url          VARCHAR(500)    DEFAULT ''                 COMMENT '文件地址',
  file_name         VARCHAR(200)    DEFAULT ''                 COMMENT '文件名称',
  file_size         BIGINT(20)      DEFAULT 0                  COMMENT '文件大小（字节）',
  is_read           CHAR(1)         DEFAULT '0'                COMMENT '是否已读（0未读 1已读）',
  read_time         DATETIME        DEFAULT NULL               COMMENT '阅读时间',
  send_time         DATETIME        DEFAULT CURRENT_TIMESTAMP  COMMENT '发送时间',
  PRIMARY KEY (message_id),
  KEY idx_conversation_id (conversation_id),
  KEY idx_sender (sender_type, sender_id),
  KEY idx_send_time (send_time)
);
```

## 5. API接口设计

### 5.1 聊天Widget API
```java
@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ChatApiController {
    
    /**
     * 初始化聊天会话
     * POST /api/chat/init
     */
    @PostMapping("/init")
    public AjaxResult initChat(@RequestBody ChatInitRequest request, HttpServletRequest httpRequest);
    
    /**
     * 发送消息
     * POST /api/chat/sendMessage
     */
    @PostMapping("/sendMessage")
    public AjaxResult sendMessage(@RequestBody SendMessageRequest request);
    
    /**
     * 获取消息历史
     * GET /api/chat/messages/{conversationId}
     */
    @GetMapping("/messages/{conversationId}")
    public AjaxResult getMessages(@PathVariable Long conversationId,
                                 @RequestParam(defaultValue = "1") Integer pageNum,
                                 @RequestParam(defaultValue = "20") Integer pageSize);
    
    /**
     * 标记消息已读
     * POST /api/chat/markRead
     */
    @PostMapping("/markRead")
    public AjaxResult markRead(@RequestBody MarkReadRequest request);
    
    /**
     * 结束会话
     * POST /api/chat/endConversation/{conversationId}
     */
    @PostMapping("/endConversation/{conversationId}")
    public AjaxResult endConversation(@PathVariable Long conversationId);
}
```

### 5.2 WebSocket接口
```java
@ServerEndpoint("/websocket/chat/{userType}/{userId}")
@Component
public class ChatWebSocketHandler {
    
    /**
     * 连接建立成功调用的方法
     */
    @OnOpen
    public void onOpen(Session session, @PathParam("userType") String userType, 
                      @PathParam("userId") String userId);
    
    /**
     * 连接关闭调用的方法
     */
    @OnClose
    public void onClose();
    
    /**
     * 收到客户端消息后调用的方法
     */
    @OnMessage
    public void onMessage(String message, Session session);
    
    /**
     * 发生错误时调用
     */
    @OnError
    public void onError(Session session, Throwable error);
}
```

## 6. 核心技术实现

### 6.1 IP地址获取和地理位置解析
```java
public class IpLocationUtils {
    
    /**
     * 获取客户端真实IP地址
     */
    public static String getClientIpAddress(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("WL-Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("HTTP_CLIENT_IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("HTTP_X_FORWARDED_FOR");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        return ip;
    }
    
    /**
     * 获取IP地址的地理位置信息
     */
    public static IpLocationInfo getIpLocationInfo(String ip) {
        // 调用免费的IP地理位置API
        // 支持多个API备用方案（ip-api.com, ipapi.co）
        // 处理内网IP和异常情况
    }
}
```

### 6.2 客户信息自动生成
```java
@Service
public class CsCustomerServiceImpl implements ICsCustomerService {
    
    /**
     * 生成客户编号
     */
    public String generateCustomerNo() {
        String dateStr = DateUtils.dateTimeNow("yyyyMMdd");
        Long count = countCustomers() + 1;
        return "CUS" + dateStr + String.format("%04d", count);
    }
    
    /**
     * 自动创建客户信息
     */
    public CsCustomer createCustomerFromRequest(ChatInitRequest request, HttpServletRequest httpRequest) {
        CsCustomer customer = new CsCustomer();
        
        // 生成客户编号
        customer.setCustomerNo(generateCustomerNo());
        
        // 设置客户姓名（如果未提供则自动生成）
        String customerName = StringUtils.isNotEmpty(request.getCustomerName()) ? 
            request.getCustomerName() : "访客" + (System.currentTimeMillis() % 10000);
        customer.setCustomerName(customerName);
        
        // 获取IP地址和地理位置
        String ip = IpLocationUtils.getClientIpAddress(httpRequest);
        IpLocationUtils.IpLocationInfo locationInfo = IpLocationUtils.getIpLocationInfo(ip);
        customer.setIpAddress(ip);
        customer.setIpLocation(locationInfo.getAddress());
        
        // 设置默认值
        customer.setCustomerType("1"); // 个人客户
        customer.setLevel("1");        // 普通客户
        customer.setStatus("0");       // 正常状态
        customer.setSource("web");     // 来源渠道
        
        return customer;
    }
}
```

### 6.3 WebSocket消息处理
```java
@Component
public class ChatWebSocketHandler {

    /**
     * 处理聊天消息
     */
    private void handleChatMessage(JSONObject messageObj) {
        try {
            Long conversationId = messageObj.getLong("conversationId");
            String content = messageObj.getString("content");
            String messageType = messageObj.getString("messageType");
            String senderName = messageObj.getString("senderName");

            // 保存消息到数据库
            ICsMessageService messageService = SpringUtils.getBean(ICsMessageService.class);
            CsMessage message = messageService.sendMessage(
                conversationId,
                userType.equals("customer") ? "1" : "2",
                Long.valueOf(userId),
                senderName,
                messageType,
                content
            );

            if (message != null) {
                // 构造WebSocket消息
                WebSocketMessage wsMessage = new WebSocketMessage("message", "消息发送成功", message);

                // 发送给发送者确认
                sendMessage(JSON.toJSONString(wsMessage));

                // 转发给对方
                forwardMessageToTarget(conversationId, message);
            }
        } catch (Exception e) {
            log.error("处理聊天消息异常", e);
        }
    }

    /**
     * 处理心跳消息
     */
    private void handleHeartbeat() {
        try {
            sendMessage(JSON.toJSONString(new WebSocketMessage("heartbeat", "pong", null)));
        } catch (IOException e) {
            log.error("发送心跳响应异常", e);
        }
    }
}
```

## 7. 配置管理

### 7.1 WebSocket配置
```java
@Configuration
public class WebSocketConfig {

    /**
     * 注入ServerEndpointExporter，
     * 这个bean会自动注册使用了@ServerEndpoint注解声明的Websocket endpoint
     */
    @Bean
    public ServerEndpointExporter serverEndpointExporter() {
        return new ServerEndpointExporter();
    }
}
```

### 7.2 数据库配置
```xml
<!-- MyBatis配置 -->
<configuration>
    <settings>
        <setting name="cacheEnabled" value="true"/>
        <setting name="lazyLoadingEnabled" value="true"/>
        <setting name="multipleResultSetsEnabled" value="true"/>
        <setting name="useColumnLabel" value="true"/>
        <setting name="useGeneratedKeys" value="false"/>
        <setting name="autoMappingBehavior" value="PARTIAL"/>
        <setting name="defaultExecutorType" value="SIMPLE"/>
        <setting name="mapUnderscoreToCamelCase" value="true"/>
        <setting name="localCacheScope" value="SESSION"/>
        <setting name="jdbcTypeForNull" value="NULL"/>
    </settings>
</configuration>
```

### 7.3 跨域配置
```java
@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ChatApiController {
    // 支持跨域访问，允许前端Widget调用
}
```

## 8. 安全机制

### 8.1 API安全
- **匿名访问**: 聊天API支持匿名访问，无需登录认证
- **跨域支持**: 配置CORS支持跨域访问
- **参数验证**: 严格的输入参数验证和过滤
- **SQL注入防护**: 使用MyBatis参数化查询防止SQL注入

### 8.2 数据安全
- **敏感信息加密**: 客户敏感信息加密存储
- **数据脱敏**: 日志中敏感数据脱敏处理
- **访问控制**: 基于角色的数据访问控制
- **审计日志**: 完整的操作审计日志记录

### 8.3 通信安全
- **WebSocket安全**: WebSocket连接安全验证
- **消息加密**: 敏感消息内容加密传输
- **连接限制**: 防止恶意连接和DDoS攻击
- **心跳检测**: 定期心跳检测确保连接有效性

## 9. 性能优化

### 9.1 数据库优化
- **索引优化**: 关键字段建立合适索引
- **分页查询**: 大数据量分页查询优化
- **连接池**: 数据库连接池配置优化
- **查询缓存**: 热点数据查询缓存

### 9.2 WebSocket优化
- **连接管理**: 高效的WebSocket连接管理
- **消息队列**: 异步消息处理队列
- **负载均衡**: WebSocket连接负载均衡
- **资源回收**: 及时释放无效连接资源

### 9.3 缓存策略
- **Redis缓存**: 热点数据Redis缓存
- **本地缓存**: 配置数据本地缓存
- **缓存更新**: 智能缓存更新策略
- **缓存穿透**: 防止缓存穿透和雪崩

## 10. 监控和日志

### 10.1 系统监控
- **性能监控**: 接口响应时间和吞吐量监控
- **错误监控**: 系统异常和错误率监控
- **资源监控**: CPU、内存、网络资源监控
- **业务监控**: 会话数量、消息量等业务指标监控

### 10.2 日志管理
- **分级日志**: DEBUG、INFO、WARN、ERROR分级日志
- **结构化日志**: JSON格式结构化日志输出
- **日志轮转**: 按时间和大小自动日志轮转
- **日志分析**: ELK日志分析和检索

### 10.3 关键指标
- **会话成功率**: 会话创建成功率统计
- **消息送达率**: 消息发送成功率统计
- **WebSocket连接率**: WebSocket连接成功率统计
- **API响应时间**: 各API接口平均响应时间

## 11. 部署说明

### 11.1 环境要求
- **JDK**: 17+
- **MySQL**: 8.0+
- **Redis**: 6.0+
- **Maven**: 3.6+
- **操作系统**: Linux/Windows/MacOS

### 11.2 构建部署
```bash
# 1. 编译打包
mvn clean package -Dmaven.test.skip=true

# 2. 数据库初始化
mysql -u root -p < whisper.sql
mysql -u root -p < update-database-schema.sql

# 3. 启动应用
java -jar whisper-admin.jar

# 4. 验证部署
curl http://localhost:8080/api/chat/test
```

### 11.3 配置文件
```yaml
# application.yml
server:
  port: 8080

spring:
  datasource:
    url: jdbc:mysql://localhost:3306/whisper?useUnicode=true&characterEncoding=utf8
    username: root
    password: password

  redis:
    host: localhost
    port: 6379

# WebSocket配置
websocket:
  path: /websocket/chat
  allowed-origins: "*"

# 客服系统配置
customer:
  auto-assign: true
  max-concurrent: 10
  session-timeout: 1800
```

## 12. 测试指南

### 12.1 单元测试
```java
@SpringBootTest
@Transactional
public class CsCustomerServiceTest {

    @Autowired
    private ICsCustomerService csCustomerService;

    @Test
    public void testGenerateCustomerNo() {
        String customerNo = csCustomerService.generateCustomerNo();
        assertThat(customerNo).startsWith("CUS");
        assertThat(customerNo).hasSize(15);
    }

    @Test
    public void testCreateCustomer() {
        CsCustomer customer = new CsCustomer();
        customer.setCustomerName("测试客户");
        customer.setPhone("13800138000");

        int result = csCustomerService.insertCsCustomer(customer);
        assertThat(result).isEqualTo(1);
        assertThat(customer.getCustomerId()).isNotNull();
    }
}
```

### 12.2 集成测试
```bash
#!/bin/bash
# test-chat-api.sh - API功能测试脚本

BASE_URL="http://localhost:8080/api/chat"

echo "=== 测试聊天API功能 ==="

# 1. 测试API连通性
echo "1. 测试API连通性..."
curl -X GET "$BASE_URL/test"

# 2. 测试初始化聊天
echo "2. 测试初始化聊天..."
INIT_RESPONSE=$(curl -s -X POST "$BASE_URL/init" \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "test_customer_001",
    "customerName": "测试客户",
    "channel": "web"
  }')

echo "初始化响应: $INIT_RESPONSE"

# 3. 提取会话ID
CONVERSATION_ID=$(echo $INIT_RESPONSE | jq -r '.data.conversationId')
echo "会话ID: $CONVERSATION_ID"

# 4. 测试发送消息
echo "3. 测试发送消息..."
curl -s -X POST "$BASE_URL/sendMessage" \
  -H "Content-Type: application/json" \
  -d "{
    \"conversationId\": $CONVERSATION_ID,
    \"content\": \"你好，我需要帮助\",
    \"messageType\": \"text\",
    \"senderName\": \"测试客户\"
  }"

# 5. 测试获取消息历史
echo "4. 测试获取消息历史..."
curl -s -X GET "$BASE_URL/messages/$CONVERSATION_ID?pageNum=1&pageSize=10"

echo "=== 测试完成 ==="
```

### 12.3 WebSocket测试
```javascript
// WebSocket连接测试
const ws = new WebSocket('ws://localhost:8080/websocket/chat/customer/test001');

ws.onopen = function(event) {
    console.log('WebSocket连接已建立');

    // 发送心跳
    ws.send(JSON.stringify({
        type: 'heartbeat',
        data: 'ping'
    }));
};

ws.onmessage = function(event) {
    const message = JSON.parse(event.data);
    console.log('收到消息:', message);
};

ws.onerror = function(error) {
    console.error('WebSocket错误:', error);
};

ws.onclose = function(event) {
    console.log('WebSocket连接已关闭');
};
```

## 13. 故障排除

### 13.1 常见问题

#### 问题1：WebSocket连接失败
**症状**: `WebSocket connection failed: Connection refused`

**解决方案**:
```bash
# 1. 检查服务是否启动
ps aux | grep whisper

# 2. 检查端口是否监听
netstat -an | grep 8080

# 3. 检查防火墙设置
sudo ufw status

# 4. 查看应用日志
tail -f logs/whisper.log
```

#### 问题2：数据库连接异常
**症状**: `Could not create connection to database server`

**解决方案**:
```bash
# 1. 检查MySQL服务状态
systemctl status mysql

# 2. 验证数据库连接
mysql -h localhost -u root -p

# 3. 检查数据库配置
cat application.yml | grep datasource

# 4. 验证数据库权限
SHOW GRANTS FOR 'root'@'localhost';
```

#### 问题3：IP地理位置获取失败
**症状**: IP地理位置显示为"未知地区"

**解决方案**:
```java
// 1. 检查网络连接
curl -I http://ip-api.com/json/8.8.8.8

// 2. 使用备用API
curl -I https://ipapi.co/8.8.8.8/json/

// 3. 检查代理设置
System.setProperty("http.proxyHost", "proxy.company.com");
System.setProperty("http.proxyPort", "8080");
```

### 13.2 性能调优

#### 数据库优化
```sql
-- 1. 添加必要索引
CREATE INDEX idx_cs_customer_create_time ON cs_customer(create_time);
CREATE INDEX idx_cs_message_conversation_send_time ON cs_message(conversation_id, send_time);

-- 2. 分析慢查询
SHOW VARIABLES LIKE 'slow_query_log';
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 2;

-- 3. 优化表结构
ANALYZE TABLE cs_customer;
OPTIMIZE TABLE cs_message;
```

#### JVM调优
```bash
# JVM参数优化
java -Xms2g -Xmx4g \
     -XX:+UseG1GC \
     -XX:MaxGCPauseMillis=200 \
     -XX:+HeapDumpOnOutOfMemoryError \
     -XX:HeapDumpPath=/var/log/whisper/ \
     -jar whisper-admin.jar
```

## 14. 扩展开发

### 14.1 自定义消息类型
```java
// 1. 扩展消息类型枚举
public enum MessageType {
    TEXT("text", "文本消息"),
    IMAGE("image", "图片消息"),
    FILE("file", "文件消息"),
    VOICE("voice", "语音消息"),
    VIDEO("video", "视频消息"),
    LOCATION("location", "位置消息"),  // 新增
    CARD("card", "卡片消息");         // 新增
}

// 2. 扩展消息处理器
@Component
public class LocationMessageHandler implements MessageHandler {

    @Override
    public boolean support(String messageType) {
        return "location".equals(messageType);
    }

    @Override
    public void handle(CsMessage message) {
        // 处理位置消息逻辑
        JSONObject location = JSON.parseObject(message.getContent());
        double latitude = location.getDouble("latitude");
        double longitude = location.getDouble("longitude");

        // 保存位置信息或进行地理围栏判断
        processLocationMessage(message, latitude, longitude);
    }
}
```

### 14.2 自定义客户属性
```java
// 1. 扩展客户实体
public class CsCustomer extends BaseEntity {

    // 原有字段...

    /** 自定义属性JSON */
    private String customAttributes;

    /** VIP等级详细信息 */
    private String vipLevel;

    /** 客户偏好设置 */
    private String preferences;

    // getter/setter方法...
}

// 2. 扩展客户服务
@Service
public class ExtendedCustomerService extends CsCustomerServiceImpl {

    /**
     * 设置客户自定义属性
     */
    public void setCustomAttribute(Long customerId, String key, Object value) {
        CsCustomer customer = selectCsCustomerByCustomerId(customerId);
        if (customer != null) {
            JSONObject attributes = JSON.parseObject(customer.getCustomAttributes());
            if (attributes == null) {
                attributes = new JSONObject();
            }
            attributes.put(key, value);
            customer.setCustomAttributes(attributes.toJSONString());
            updateCsCustomer(customer);
        }
    }

    /**
     * 获取客户自定义属性
     */
    public Object getCustomAttribute(Long customerId, String key) {
        CsCustomer customer = selectCsCustomerByCustomerId(customerId);
        if (customer != null && StringUtils.isNotEmpty(customer.getCustomAttributes())) {
            JSONObject attributes = JSON.parseObject(customer.getCustomAttributes());
            return attributes.get(key);
        }
        return null;
    }
}
```

### 14.3 消息插件机制
```java
// 1. 消息插件接口
public interface MessagePlugin {

    /**
     * 插件名称
     */
    String getName();

    /**
     * 是否支持该消息类型
     */
    boolean support(CsMessage message);

    /**
     * 消息发送前处理
     */
    void beforeSend(CsMessage message);

    /**
     * 消息发送后处理
     */
    void afterSend(CsMessage message);
}

// 2. 敏感词过滤插件
@Component
public class SensitiveWordFilterPlugin implements MessagePlugin {

    @Override
    public String getName() {
        return "敏感词过滤插件";
    }

    @Override
    public boolean support(CsMessage message) {
        return "text".equals(message.getMessageType());
    }

    @Override
    public void beforeSend(CsMessage message) {
        String content = message.getContent();
        String filteredContent = filterSensitiveWords(content);
        message.setContent(filteredContent);
    }

    @Override
    public void afterSend(CsMessage message) {
        // 记录敏感词过滤日志
        logSensitiveWordFilter(message);
    }

    private String filterSensitiveWords(String content) {
        // 敏感词过滤逻辑
        return content.replaceAll("敏感词", "***");
    }
}
```

## 15. 最佳实践

### 15.1 代码规范
- **命名规范**: 遵循Java命名约定，类名使用PascalCase，方法名使用camelCase
- **注释规范**: 重要方法和类添加完整的JavaDoc注释
- **异常处理**: 统一的异常处理机制，避免空指针异常
- **日志规范**: 使用SLF4J日志框架，合理设置日志级别

### 15.2 安全建议
- **输入验证**: 严格验证所有用户输入，防止XSS和SQL注入
- **权限控制**: 实施最小权限原则，定期审查权限设置
- **数据加密**: 敏感数据加密存储和传输
- **安全更新**: 定期更新依赖库版本，修复安全漏洞

### 15.3 性能建议
- **数据库优化**: 合理使用索引，避免N+1查询问题
- **缓存策略**: 热点数据使用缓存，减少数据库压力
- **异步处理**: 耗时操作使用异步处理，提高响应速度
- **资源管理**: 及时释放资源，避免内存泄漏

---

## 附录

### A. 数据字典

#### A.1 客户类型 (customer_type)
- `1`: 个人客户
- `2`: 企业客户

#### A.2 客户等级 (level)
- `1`: 普通客户
- `2`: VIP客户
- `3`: SVIP客户

#### A.3 会话状态 (status)
- `0`: 待分配
- `1`: 进行中
- `2`: 已结束
- `3`: 已转接

#### A.4 消息类型 (message_type)
- `text`: 文本消息
- `image`: 图片消息
- `file`: 文件消息
- `voice`: 语音消息
- `video`: 视频消息

### B. API错误码

| 错误码 | 错误信息 | 说明 |
|--------|----------|------|
| 200 | 操作成功 | 请求处理成功 |
| 400 | 参数错误 | 请求参数不正确 |
| 401 | 未授权 | 需要身份验证 |
| 403 | 禁止访问 | 权限不足 |
| 404 | 资源不存在 | 请求的资源不存在 |
| 500 | 系统异常 | 服务器内部错误 |
| 1001 | 客户不存在 | 指定的客户ID不存在 |
| 1002 | 会话不存在 | 指定的会话ID不存在 |
| 1003 | 消息发送失败 | 消息发送过程中出现错误 |

### C. 版本历史

| 版本 | 日期 | 更新内容 |
|------|------|----------|
| 3.9.0 | 2025-01-08 | 初始版本，包含基础客服功能 |
| 3.9.1 | 2025-01-15 | 新增IP地理位置功能 |
| 3.9.2 | 2025-01-22 | 优化WebSocket性能 |

---

*本文档详细介绍了Whisper Customer模块的技术架构、功能特性、API设计和部署指南，为开发和维护提供了全面的技术参考。如有疑问，请联系技术团队。*
```
```

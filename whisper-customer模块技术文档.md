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

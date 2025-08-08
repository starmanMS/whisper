# Whisper智能客服系统数据库设计说明

## 概述

本文档描述了Whisper智能客服系统的完整数据库设计，基于现有的用户权限体系进行扩展，支持智能客服的核心功能。

## 设计原则

1. **兼容性**: 与现有Whisper系统的用户权限体系完全兼容
2. **扩展性**: 预留充足的扩展字段，支持未来功能扩展
3. **性能**: 合理设计索引，优化查询性能
4. **规范性**: 遵循统一的命名规范和字段约定

## 核心功能模块

### 1. 客户信息管理
- **cs_customer**: 客户基础信息表
- **cs_customer_tag**: 客户标签表
- **cs_customer_tag_relation**: 客户标签关联表

### 2. 会话管理
- **cs_conversation**: 会话管理表
- **cs_message**: 消息记录表

### 3. 工单系统
- **cs_ticket**: 工单系统表
- **cs_ticket_log**: 工单处理记录表

### 4. 知识库管理
- **cs_knowledge_category**: 知识库分类表
- **cs_knowledge**: 知识库文档表

### 5. 客服人员管理
- **cs_agent**: 客服人员扩展信息表

### 6. 智能机器人
- **cs_robot_config**: 智能机器人配置表
- **cs_auto_reply**: 自动回复规则表
- **cs_intent**: 意图识别表

### 7. 统计分析
- **cs_statistics_daily**: 客服统计表（按日统计）

### 8. 系统配置
- **cs_system_config**: 系统配置扩展表

## 表结构详细说明

### 客户信息表 (cs_customer)

| 字段名 | 类型 | 说明 | 索引 |
|--------|------|------|------|
| customer_id | BIGINT(20) | 客户ID，主键 | PRIMARY |
| customer_no | VARCHAR(32) | 客户编号，唯一 | UNIQUE |
| customer_name | VARCHAR(100) | 客户姓名 | - |
| customer_type | CHAR(1) | 客户类型（1个人 2企业） | - |
| phone | VARCHAR(20) | 手机号码 | INDEX |
| email | VARCHAR(100) | 邮箱地址 | INDEX |
| level | CHAR(1) | 客户等级（1普通 2VIP 3SVIP） | - |
| status | CHAR(1) | 状态（0正常 1黑名单 2潜在客户） | INDEX |

**特点**:
- 支持个人和企业客户
- 包含多种联系方式
- 客户等级和标签管理
- 完整的审计字段

### 会话管理表 (cs_conversation)

| 字段名 | 类型 | 说明 | 索引 |
|--------|------|------|------|
| conversation_id | BIGINT(20) | 会话ID，主键 | PRIMARY |
| session_id | VARCHAR(64) | 会话标识，唯一 | UNIQUE |
| customer_id | BIGINT(20) | 客户ID | INDEX |
| agent_id | BIGINT(20) | 客服人员ID | INDEX |
| channel | VARCHAR(20) | 渠道 | INDEX |
| status | CHAR(1) | 会话状态 | INDEX |
| satisfaction | CHAR(1) | 满意度评分 | - |

**特点**:
- 支持多渠道接入
- 完整的会话生命周期管理
- 性能指标统计
- 满意度评价

### 消息记录表 (cs_message)

| 字段名 | 类型 | 说明 | 索引 |
|--------|------|------|------|
| message_id | BIGINT(20) | 消息ID，主键 | PRIMARY |
| conversation_id | BIGINT(20) | 会话ID | INDEX |
| sender_type | CHAR(1) | 发送者类型 | INDEX |
| message_type | VARCHAR(20) | 消息类型 | INDEX |
| content | TEXT | 消息内容 | - |
| send_time | DATETIME | 发送时间 | INDEX |

**特点**:
- 支持多种消息类型
- 消息状态管理
- 文件附件支持
- 消息撤回功能

### 工单系统表 (cs_ticket)

| 字段名 | 类型 | 说明 | 索引 |
|--------|------|------|------|
| ticket_id | BIGINT(20) | 工单ID，主键 | PRIMARY |
| ticket_no | VARCHAR(32) | 工单编号，唯一 | UNIQUE |
| customer_id | BIGINT(20) | 客户ID | INDEX |
| status | CHAR(1) | 工单状态 | INDEX |
| priority | CHAR(1) | 优先级 | INDEX |
| assigned_to | BIGINT(20) | 分配给 | INDEX |

**特点**:
- 完整的工单流转流程
- 优先级管理
- 分配和转派功能
- SLA时间管理

### 知识库文档表 (cs_knowledge)

| 字段名 | 类型 | 说明 | 索引 |
|--------|------|------|------|
| knowledge_id | BIGINT(20) | 知识ID，主键 | PRIMARY |
| category_id | BIGINT(20) | 分类ID | INDEX |
| title | VARCHAR(200) | 标题 | FULLTEXT |
| content | LONGTEXT | 内容 | FULLTEXT |
| view_count | INT(11) | 浏览次数 | - |
| is_public | CHAR(1) | 是否公开 | INDEX |

**特点**:
- 分层分类管理
- 全文搜索支持
- 使用统计
- 权限控制

### 客服人员扩展信息表 (cs_agent)

| 字段名 | 类型 | 说明 | 索引 |
|--------|------|------|------|
| agent_id | BIGINT(20) | 客服ID，主键 | PRIMARY |
| agent_no | VARCHAR(32) | 客服工号，唯一 | UNIQUE |
| skill_tags | VARCHAR(500) | 技能标签 | - |
| work_status | CHAR(1) | 工作状态 | INDEX |
| max_concurrent | INT(3) | 最大并发会话数 | - |
| avg_rating | DECIMAL(3,2) | 平均评分 | - |

**特点**:
- 技能标签管理
- 工作状态实时更新
- 负载均衡支持
- 绩效统计

## 索引设计说明

### 主要索引策略

1. **主键索引**: 所有表都有自增主键
2. **唯一索引**: 业务编号字段（如customer_no, ticket_no）
3. **查询索引**: 高频查询字段（如status, create_time）
4. **外键索引**: 关联查询字段（如customer_id, agent_id）
5. **复合索引**: 多字段组合查询（如日期+用户ID）

### 全文搜索

- 知识库内容使用MySQL FULLTEXT索引
- 建议生产环境使用Elasticsearch提升搜索性能

## 扩展字段说明

每个核心表都包含以下扩展字段：

- **reserved1-3**: 预留字段，用于快速扩展
- **ext_field1-2**: 扩展字段，存储JSON或大文本
- **remark**: 备注字段

## 性能优化建议

### 1. 分区策略
- 消息表按月分区
- 统计表按年分区

### 2. 缓存策略
- 客服状态使用Redis缓存
- 知识库内容缓存
- 自动回复规则缓存

### 3. 读写分离
- 统计查询使用从库
- 实时会话使用主库

### 4. 数据清理
- 定期清理历史消息
- 归档过期工单

## 初始化数据

数据库包含以下初始化数据：

1. **客户标签**: VIP客户、新客户、老客户等
2. **知识库分类**: 常见问题、产品介绍、技术支持等
3. **意图识别**: 问候、咨询、投诉、转人工等
4. **机器人配置**: 默认智能助手配置
5. **系统配置**: 会话超时、并发数等参数

## 与现有系统集成

### 用户权限集成
- cs_agent表通过agent_id关联sys_user表
- 继承现有的角色权限体系
- 支持部门级别的数据权限

### 菜单权限扩展
建议在sys_menu表中添加以下菜单：

```sql
-- 客服管理主菜单
INSERT INTO sys_menu VALUES('2000', '客服管理', '0', '4', 'customer-service', NULL, '', '1', '0', 'M', '0', '0', '', 'customer-service', 'admin', sysdate(), '', null, '客服系统管理');

-- 客户管理
INSERT INTO sys_menu VALUES('2001', '客户管理', '2000', '1', 'customer', 'customer/index', '', '1', '0', 'C', '0', '0', 'customer:list', 'peoples', 'admin', sysdate(), '', null, '客户信息管理');

-- 会话管理
INSERT INTO sys_menu VALUES('2002', '会话管理', '2000', '2', 'conversation', 'conversation/index', '', '1', '0', 'C', '0', '0', 'conversation:list', 'message', 'admin', sysdate(), '', null, '客服会话管理');

-- 工单管理
INSERT INTO sys_menu VALUES('2003', '工单管理', '2000', '3', 'ticket', 'ticket/index', '', '1', '0', 'C', '0', '0', 'ticket:list', 'form', 'admin', sysdate(), '', null, '工单系统管理');

-- 知识库管理
INSERT INTO sys_menu VALUES('2004', '知识库', '2000', '4', 'knowledge', 'knowledge/index', '', '1', '0', 'C', '0', '0', 'knowledge:list', 'documentation', 'admin', sysdate(), '', null, '知识库管理');
```

## 部署说明

1. **执行顺序**: 先执行whisper_customer_service.sql
2. **权限配置**: 为客服角色分配相应的菜单权限
3. **初始化**: 配置默认的机器人和自动回复规则
4. **测试**: 验证各功能模块的数据流转

## 版本信息

- **版本**: v1.0
- **创建日期**: 2024-12-19
- **兼容性**: 基于Whisper v3.9.0
- **数据库**: MySQL 5.7+

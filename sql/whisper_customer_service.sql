-- ========================================
-- Whisper智能客服系统数据库设计
-- 基于现有Whisper系统扩展的客服功能模块
-- 创建时间: 2024-12-19
-- 版本: v1.0
-- ========================================

-- ----------------------------
-- 1、客户信息表
-- ----------------------------
DROP TABLE IF EXISTS cs_customer;
CREATE TABLE cs_customer (
  customer_id       BIGINT(20)      NOT NULL AUTO_INCREMENT    COMMENT '客户ID',
  customer_no       VARCHAR(32)     NOT NULL                   COMMENT '客户编号',
  customer_name     VARCHAR(100)    NOT NULL                   COMMENT '客户姓名',
  customer_type     CHAR(1)         DEFAULT '1'                COMMENT '客户类型（1个人 2企业）',
  phone             VARCHAR(20)     DEFAULT ''                 COMMENT '手机号码',
  email             VARCHAR(100)    DEFAULT ''                 COMMENT '邮箱地址',
  wechat            VARCHAR(50)     DEFAULT ''                 COMMENT '微信号',
  qq                VARCHAR(20)     DEFAULT ''                 COMMENT 'QQ号',
  company           VARCHAR(200)    DEFAULT ''                 COMMENT '公司名称',
  industry          VARCHAR(50)     DEFAULT ''                 COMMENT '所属行业',
  region            VARCHAR(100)    DEFAULT ''                 COMMENT '所在地区',
  address           VARCHAR(500)    DEFAULT ''                 COMMENT '详细地址',
  birthday          DATE            DEFAULT NULL               COMMENT '生日',
  gender            CHAR(1)         DEFAULT '0'                COMMENT '性别（0未知 1男 2女）',
  avatar            VARCHAR(200)    DEFAULT ''                 COMMENT '头像地址',
  level             CHAR(1)         DEFAULT '1'                COMMENT '客户等级（1普通 2VIP 3SVIP）',
  source            VARCHAR(50)     DEFAULT ''                 COMMENT '客户来源',
  tags              VARCHAR(500)    DEFAULT ''                 COMMENT '客户标签（JSON格式）',
  last_contact_time DATETIME        DEFAULT NULL               COMMENT '最后联系时间',
  status            CHAR(1)         DEFAULT '0'                COMMENT '状态（0正常 1黑名单 2潜在客户）',
  del_flag          CHAR(1)         DEFAULT '0'                COMMENT '删除标志（0存在 2删除）',
  create_by         VARCHAR(64)     DEFAULT ''                 COMMENT '创建者',
  create_time       DATETIME        DEFAULT NULL               COMMENT '创建时间',
  update_by         VARCHAR(64)     DEFAULT ''                 COMMENT '更新者',
  update_time       DATETIME        DEFAULT NULL               COMMENT '更新时间',
  remark            VARCHAR(500)    DEFAULT ''                 COMMENT '备注',
  reserved1         VARCHAR(100)    DEFAULT ''                 COMMENT '预留字段1',
  reserved2         VARCHAR(100)    DEFAULT ''                 COMMENT '预留字段2',
  reserved3         VARCHAR(100)    DEFAULT ''                 COMMENT '预留字段3',
  ext_field1        TEXT            DEFAULT NULL               COMMENT '扩展字段1',
  ext_field2        TEXT            DEFAULT NULL               COMMENT '扩展字段2',
  PRIMARY KEY (customer_id),
  UNIQUE KEY uk_customer_no (customer_no),
  KEY idx_phone (phone),
  KEY idx_email (email),
  KEY idx_create_time (create_time),
  KEY idx_status (status)
) ENGINE=InnoDB AUTO_INCREMENT=10000 COMMENT = '客户信息表';

-- ----------------------------
-- 2、会话管理表
-- ----------------------------
DROP TABLE IF EXISTS cs_conversation;
CREATE TABLE cs_conversation (
  conversation_id   BIGINT(20)      NOT NULL AUTO_INCREMENT    COMMENT '会话ID',
  session_id        VARCHAR(64)     NOT NULL                   COMMENT '会话标识',
  customer_id       BIGINT(20)      NOT NULL                   COMMENT '客户ID',
  agent_id          BIGINT(20)      DEFAULT NULL               COMMENT '客服人员ID',
  channel           VARCHAR(20)     NOT NULL                   COMMENT '渠道（web网页 wechat微信 app应用 phone电话）',
  conversation_type CHAR(1)         DEFAULT '1'                COMMENT '会话类型（1咨询 2投诉 3建议 4售后）',
  title             VARCHAR(200)    DEFAULT ''                 COMMENT '会话标题',
  status            CHAR(1)         DEFAULT '0'                COMMENT '会话状态（0待分配 1进行中 2已结束 3已转接）',
  priority          CHAR(1)         DEFAULT '2'                COMMENT '优先级（1低 2中 3高 4紧急）',
  start_time        DATETIME        NOT NULL                   COMMENT '开始时间',
  end_time          DATETIME        DEFAULT NULL               COMMENT '结束时间',
  duration          INT(11)         DEFAULT 0                  COMMENT '持续时长（秒）',
  satisfaction      CHAR(1)         DEFAULT NULL               COMMENT '满意度（1很不满意 2不满意 3一般 4满意 5很满意）',
  is_robot          CHAR(1)         DEFAULT '0'                COMMENT '是否机器人服务（0否 1是）',
  transfer_count    INT(3)          DEFAULT 0                  COMMENT '转接次数',
  queue_time        INT(11)         DEFAULT 0                  COMMENT '排队时长（秒）',
  first_response_time INT(11)       DEFAULT 0                  COMMENT '首次响应时长（秒）',
  avg_response_time INT(11)         DEFAULT 0                  COMMENT '平均响应时长（秒）',
  message_count     INT(11)         DEFAULT 0                  COMMENT '消息总数',
  del_flag          CHAR(1)         DEFAULT '0'                COMMENT '删除标志（0存在 2删除）',
  create_by         VARCHAR(64)     DEFAULT ''                 COMMENT '创建者',
  create_time       DATETIME        DEFAULT NULL               COMMENT '创建时间',
  update_by         VARCHAR(64)     DEFAULT ''                 COMMENT '更新者',
  update_time       DATETIME        DEFAULT NULL               COMMENT '更新时间',
  remark            VARCHAR(500)    DEFAULT ''                 COMMENT '备注',
  reserved1         VARCHAR(100)    DEFAULT ''                 COMMENT '预留字段1',
  reserved2         VARCHAR(100)    DEFAULT ''                 COMMENT '预留字段2',
  reserved3         VARCHAR(100)    DEFAULT ''                 COMMENT '预留字段3',
  ext_field1        TEXT            DEFAULT NULL               COMMENT '扩展字段1',
  PRIMARY KEY (conversation_id),
  UNIQUE KEY uk_session_id (session_id),
  KEY idx_customer_id (customer_id),
  KEY idx_agent_id (agent_id),
  KEY idx_status (status),
  KEY idx_start_time (start_time),
  KEY idx_channel (channel)
) ENGINE=InnoDB AUTO_INCREMENT=100000 COMMENT = '会话管理表';

-- ----------------------------
-- 3、消息记录表
-- ----------------------------
DROP TABLE IF EXISTS cs_message;
CREATE TABLE cs_message (
  message_id        BIGINT(20)      NOT NULL AUTO_INCREMENT    COMMENT '消息ID',
  conversation_id   BIGINT(20)      NOT NULL                   COMMENT '会话ID',
  sender_type       CHAR(1)         NOT NULL                   COMMENT '发送者类型（1客户 2客服 3机器人 4系统）',
  sender_id         BIGINT(20)      DEFAULT NULL               COMMENT '发送者ID',
  sender_name       VARCHAR(100)    DEFAULT ''                 COMMENT '发送者姓名',
  message_type      VARCHAR(20)     DEFAULT 'text'             COMMENT '消息类型（text文本 image图片 file文件 voice语音 video视频）',
  content           TEXT            NOT NULL                   COMMENT '消息内容',
  file_url          VARCHAR(500)    DEFAULT ''                 COMMENT '文件地址',
  file_name         VARCHAR(200)    DEFAULT ''                 COMMENT '文件名称',
  file_size         BIGINT(20)      DEFAULT 0                  COMMENT '文件大小（字节）',
  is_read           CHAR(1)         DEFAULT '0'                COMMENT '是否已读（0未读 1已读）',
  read_time         DATETIME        DEFAULT NULL               COMMENT '阅读时间',
  is_recall         CHAR(1)         DEFAULT '0'                COMMENT '是否撤回（0否 1是）',
  recall_time       DATETIME        DEFAULT NULL               COMMENT '撤回时间',
  reply_to_id       BIGINT(20)      DEFAULT NULL               COMMENT '回复消息ID',
  send_time         DATETIME        NOT NULL                   COMMENT '发送时间',
  del_flag          CHAR(1)         DEFAULT '0'                COMMENT '删除标志（0存在 2删除）',
  create_by         VARCHAR(64)     DEFAULT ''                 COMMENT '创建者',
  create_time       DATETIME        DEFAULT NULL               COMMENT '创建时间',
  update_by         VARCHAR(64)     DEFAULT ''                 COMMENT '更新者',
  update_time       DATETIME        DEFAULT NULL               COMMENT '更新时间',
  reserved1         VARCHAR(100)    DEFAULT ''                 COMMENT '预留字段1',
  reserved2         VARCHAR(100)    DEFAULT ''                 COMMENT '预留字段2',
  ext_field1        TEXT            DEFAULT NULL               COMMENT '扩展字段1',
  PRIMARY KEY (message_id),
  KEY idx_conversation_id (conversation_id),
  KEY idx_sender_type_id (sender_type, sender_id),
  KEY idx_send_time (send_time),
  KEY idx_message_type (message_type)
) ENGINE=InnoDB AUTO_INCREMENT=1000000 COMMENT = '消息记录表';

-- ----------------------------
-- 4、工单系统表
-- ----------------------------
DROP TABLE IF EXISTS cs_ticket;
CREATE TABLE cs_ticket (
  ticket_id         BIGINT(20)      NOT NULL AUTO_INCREMENT    COMMENT '工单ID',
  ticket_no         VARCHAR(32)     NOT NULL                   COMMENT '工单编号',
  customer_id       BIGINT(20)      NOT NULL                   COMMENT '客户ID',
  conversation_id   BIGINT(20)      DEFAULT NULL               COMMENT '关联会话ID',
  title             VARCHAR(200)    NOT NULL                   COMMENT '工单标题',
  content           TEXT            NOT NULL                   COMMENT '工单内容',
  category          VARCHAR(50)     DEFAULT ''                 COMMENT '工单分类',
  priority          CHAR(1)         DEFAULT '2'                COMMENT '优先级（1低 2中 3高 4紧急）',
  status            CHAR(1)         DEFAULT '0'                COMMENT '状态（0待处理 1处理中 2待回复 3已解决 4已关闭）',
  assigned_to       BIGINT(20)      DEFAULT NULL               COMMENT '分配给（用户ID）',
  assigned_dept     BIGINT(20)      DEFAULT NULL               COMMENT '分配部门',
  source            VARCHAR(20)     DEFAULT ''                 COMMENT '来源渠道',
  tags              VARCHAR(500)    DEFAULT ''                 COMMENT '标签（JSON格式）',
  due_time          DATETIME        DEFAULT NULL               COMMENT '截止时间',
  resolve_time      DATETIME        DEFAULT NULL               COMMENT '解决时间',
  close_time        DATETIME        DEFAULT NULL               COMMENT '关闭时间',
  satisfaction      CHAR(1)         DEFAULT NULL               COMMENT '满意度（1-5分）',
  feedback          TEXT            DEFAULT NULL               COMMENT '客户反馈',
  del_flag          CHAR(1)         DEFAULT '0'                COMMENT '删除标志（0存在 2删除）',
  create_by         VARCHAR(64)     DEFAULT ''                 COMMENT '创建者',
  create_time       DATETIME        DEFAULT NULL               COMMENT '创建时间',
  update_by         VARCHAR(64)     DEFAULT ''                 COMMENT '更新者',
  update_time       DATETIME        DEFAULT NULL               COMMENT '更新时间',
  remark            VARCHAR(500)    DEFAULT ''                 COMMENT '备注',
  reserved1         VARCHAR(100)    DEFAULT ''                 COMMENT '预留字段1',
  reserved2         VARCHAR(100)    DEFAULT ''                 COMMENT '预留字段2',
  reserved3         VARCHAR(100)    DEFAULT ''                 COMMENT '预留字段3',
  ext_field1        TEXT            DEFAULT NULL               COMMENT '扩展字段1',
  ext_field2        TEXT            DEFAULT NULL               COMMENT '扩展字段2',
  PRIMARY KEY (ticket_id),
  UNIQUE KEY uk_ticket_no (ticket_no),
  KEY idx_customer_id (customer_id),
  KEY idx_assigned_to (assigned_to),
  KEY idx_status (status),
  KEY idx_priority (priority),
  KEY idx_create_time (create_time)
) ENGINE=InnoDB AUTO_INCREMENT=100000 COMMENT = '工单系统表';

-- ----------------------------
-- 5、工单处理记录表
-- ----------------------------
DROP TABLE IF EXISTS cs_ticket_log;
CREATE TABLE cs_ticket_log (
  log_id            BIGINT(20)      NOT NULL AUTO_INCREMENT    COMMENT '记录ID',
  ticket_id         BIGINT(20)      NOT NULL                   COMMENT '工单ID',
  action_type       VARCHAR(20)     NOT NULL                   COMMENT '操作类型（create创建 assign分配 reply回复 resolve解决 close关闭）',
  action_user       BIGINT(20)      NOT NULL                   COMMENT '操作人员ID',
  action_user_name  VARCHAR(100)    DEFAULT ''                 COMMENT '操作人员姓名',
  old_value         TEXT            DEFAULT NULL               COMMENT '原值',
  new_value         TEXT            DEFAULT NULL               COMMENT '新值',
  content           TEXT            DEFAULT NULL               COMMENT '处理内容',
  attachments       VARCHAR(1000)   DEFAULT ''                 COMMENT '附件列表（JSON格式）',
  action_time       DATETIME        NOT NULL                   COMMENT '操作时间',
  time_spent        INT(11)         DEFAULT 0                  COMMENT '耗时（分钟）',
  del_flag          CHAR(1)         DEFAULT '0'                COMMENT '删除标志（0存在 2删除）',
  create_by         VARCHAR(64)     DEFAULT ''                 COMMENT '创建者',
  create_time       DATETIME        DEFAULT NULL               COMMENT '创建时间',
  reserved1         VARCHAR(100)    DEFAULT ''                 COMMENT '预留字段1',
  reserved2         VARCHAR(100)    DEFAULT ''                 COMMENT '预留字段2',
  ext_field1        TEXT            DEFAULT NULL               COMMENT '扩展字段1',
  PRIMARY KEY (log_id),
  KEY idx_ticket_id (ticket_id),
  KEY idx_action_user (action_user),
  KEY idx_action_time (action_time),
  KEY idx_action_type (action_type)
) ENGINE=InnoDB AUTO_INCREMENT=1000000 COMMENT = '工单处理记录表';

-- ----------------------------
-- 6、知识库分类表
-- ----------------------------
DROP TABLE IF EXISTS cs_knowledge_category;
CREATE TABLE cs_knowledge_category (
  category_id       BIGINT(20)      NOT NULL AUTO_INCREMENT    COMMENT '分类ID',
  parent_id         BIGINT(20)      DEFAULT 0                  COMMENT '父分类ID',
  ancestors         VARCHAR(50)     DEFAULT ''                 COMMENT '祖级列表',
  category_name     VARCHAR(100)    NOT NULL                   COMMENT '分类名称',
  category_code     VARCHAR(50)     DEFAULT ''                 COMMENT '分类编码',
  order_num         INT(4)          DEFAULT 0                  COMMENT '显示顺序',
  icon              VARCHAR(100)    DEFAULT ''                 COMMENT '分类图标',
  description       VARCHAR(500)    DEFAULT ''                 COMMENT '分类描述',
  status            CHAR(1)         DEFAULT '0'                COMMENT '状态（0正常 1停用）',
  del_flag          CHAR(1)         DEFAULT '0'                COMMENT '删除标志（0存在 2删除）',
  create_by         VARCHAR(64)     DEFAULT ''                 COMMENT '创建者',
  create_time       DATETIME        DEFAULT NULL               COMMENT '创建时间',
  update_by         VARCHAR(64)     DEFAULT ''                 COMMENT '更新者',
  update_time       DATETIME        DEFAULT NULL               COMMENT '更新时间',
  remark            VARCHAR(500)    DEFAULT ''                 COMMENT '备注',
  reserved1         VARCHAR(100)    DEFAULT ''                 COMMENT '预留字段1',
  reserved2         VARCHAR(100)    DEFAULT ''                 COMMENT '预留字段2',
  PRIMARY KEY (category_id),
  KEY idx_parent_id (parent_id),
  KEY idx_status (status)
) ENGINE=InnoDB AUTO_INCREMENT=1000 COMMENT = '知识库分类表';

-- ----------------------------
-- 7、知识库文档表
-- ----------------------------
DROP TABLE IF EXISTS cs_knowledge;
CREATE TABLE cs_knowledge (
  knowledge_id      BIGINT(20)      NOT NULL AUTO_INCREMENT    COMMENT '知识ID',
  category_id       BIGINT(20)      NOT NULL                   COMMENT '分类ID',
  title             VARCHAR(200)    NOT NULL                   COMMENT '标题',
  keywords          VARCHAR(500)    DEFAULT ''                 COMMENT '关键词',
  summary           VARCHAR(1000)   DEFAULT ''                 COMMENT '摘要',
  content           LONGTEXT        NOT NULL                   COMMENT '内容',
  content_type      VARCHAR(20)     DEFAULT 'text'             COMMENT '内容类型（text文本 html富文本 markdown）',
  attachments       VARCHAR(1000)   DEFAULT ''                 COMMENT '附件列表（JSON格式）',
  tags              VARCHAR(500)    DEFAULT ''                 COMMENT '标签（JSON格式）',
  view_count        INT(11)         DEFAULT 0                  COMMENT '浏览次数',
  like_count        INT(11)         DEFAULT 0                  COMMENT '点赞次数',
  use_count         INT(11)         DEFAULT 0                  COMMENT '使用次数',
  is_public         CHAR(1)         DEFAULT '1'                COMMENT '是否公开（0否 1是）',
  is_recommend      CHAR(1)         DEFAULT '0'                COMMENT '是否推荐（0否 1是）',
  sort_order        INT(4)          DEFAULT 0                  COMMENT '排序',
  status            CHAR(1)         DEFAULT '0'                COMMENT '状态（0正常 1停用）',
  publish_time      DATETIME        DEFAULT NULL               COMMENT '发布时间',
  expire_time       DATETIME        DEFAULT NULL               COMMENT '过期时间',
  del_flag          CHAR(1)         DEFAULT '0'                COMMENT '删除标志（0存在 2删除）',
  create_by         VARCHAR(64)     DEFAULT ''                 COMMENT '创建者',
  create_time       DATETIME        DEFAULT NULL               COMMENT '创建时间',
  update_by         VARCHAR(64)     DEFAULT ''                 COMMENT '更新者',
  update_time       DATETIME        DEFAULT NULL               COMMENT '更新时间',
  remark            VARCHAR(500)    DEFAULT ''                 COMMENT '备注',
  reserved1         VARCHAR(100)    DEFAULT ''                 COMMENT '预留字段1',
  reserved2         VARCHAR(100)    DEFAULT ''                 COMMENT '预留字段2',
  reserved3         VARCHAR(100)    DEFAULT ''                 COMMENT '预留字段3',
  ext_field1        TEXT            DEFAULT NULL               COMMENT '扩展字段1',
  ext_field2        TEXT            DEFAULT NULL               COMMENT '扩展字段2',
  PRIMARY KEY (knowledge_id),
  KEY idx_category_id (category_id),
  KEY idx_status (status),
  KEY idx_is_public (is_public),
  KEY idx_create_time (create_time),
  FULLTEXT KEY ft_title_content (title, content)
) ENGINE=InnoDB AUTO_INCREMENT=10000 COMMENT = '知识库文档表';

-- ----------------------------
-- 8、客服人员扩展信息表
-- ----------------------------
DROP TABLE IF EXISTS cs_agent;
CREATE TABLE cs_agent (
  agent_id          BIGINT(20)      NOT NULL                   COMMENT '客服ID（关联sys_user.user_id）',
  agent_no          VARCHAR(32)     NOT NULL                   COMMENT '客服工号',
  skill_tags        VARCHAR(500)    DEFAULT ''                 COMMENT '技能标签（JSON格式）',
  service_type      VARCHAR(100)    DEFAULT ''                 COMMENT '服务类型（售前,售后,技术支持等）',
  max_concurrent    INT(3)          DEFAULT 5                  COMMENT '最大并发会话数',
  current_load      INT(3)          DEFAULT 0                  COMMENT '当前负载',
  work_status       CHAR(1)         DEFAULT '0'                COMMENT '工作状态（0离线 1在线 2忙碌 3离开）',
  auto_accept       CHAR(1)         DEFAULT '1'                COMMENT '自动接受会话（0否 1是）',
  work_start_time   TIME            DEFAULT '09:00:00'         COMMENT '工作开始时间',
  work_end_time     TIME            DEFAULT '18:00:00'         COMMENT '工作结束时间',
  work_days         VARCHAR(20)     DEFAULT '1,2,3,4,5'        COMMENT '工作日（1-7代表周一到周日）',
  total_sessions    INT(11)         DEFAULT 0                  COMMENT '总会话数',
  avg_rating        DECIMAL(3,2)    DEFAULT 0.00               COMMENT '平均评分',
  response_rate     DECIMAL(5,2)    DEFAULT 0.00               COMMENT '响应率（%）',
  resolution_rate   DECIMAL(5,2)    DEFAULT 0.00               COMMENT '解决率（%）',
  avg_response_time INT(11)         DEFAULT 0                  COMMENT '平均响应时间（秒）',
  last_online_time  DATETIME        DEFAULT NULL               COMMENT '最后在线时间',
  status            CHAR(1)         DEFAULT '0'                COMMENT '状态（0正常 1停用）',
  del_flag          CHAR(1)         DEFAULT '0'                COMMENT '删除标志（0存在 2删除）',
  create_by         VARCHAR(64)     DEFAULT ''                 COMMENT '创建者',
  create_time       DATETIME        DEFAULT NULL               COMMENT '创建时间',
  update_by         VARCHAR(64)     DEFAULT ''                 COMMENT '更新者',
  update_time       DATETIME        DEFAULT NULL               COMMENT '更新时间',
  remark            VARCHAR(500)    DEFAULT ''                 COMMENT '备注',
  reserved1         VARCHAR(100)    DEFAULT ''                 COMMENT '预留字段1',
  reserved2         VARCHAR(100)    DEFAULT ''                 COMMENT '预留字段2',
  reserved3         VARCHAR(100)    DEFAULT ''                 COMMENT '预留字段3',
  ext_field1        TEXT            DEFAULT NULL               COMMENT '扩展字段1',
  ext_field2        TEXT            DEFAULT NULL               COMMENT '扩展字段2',
  PRIMARY KEY (agent_id),
  UNIQUE KEY uk_agent_no (agent_no),
  KEY idx_work_status (work_status),
  KEY idx_status (status)
) ENGINE=InnoDB COMMENT = '客服人员扩展信息表';

-- ----------------------------
-- 9、智能机器人配置表
-- ----------------------------
DROP TABLE IF EXISTS cs_robot_config;
CREATE TABLE cs_robot_config (
  config_id         BIGINT(20)      NOT NULL AUTO_INCREMENT    COMMENT '配置ID',
  robot_name        VARCHAR(100)    NOT NULL                   COMMENT '机器人名称',
  robot_avatar      VARCHAR(200)    DEFAULT ''                 COMMENT '机器人头像',
  welcome_message   TEXT            DEFAULT NULL               COMMENT '欢迎语',
  default_reply     TEXT            DEFAULT NULL               COMMENT '默认回复',
  no_match_reply    TEXT            DEFAULT NULL               COMMENT '无匹配回复',
  transfer_keywords VARCHAR(500)    DEFAULT ''                 COMMENT '转人工关键词（JSON格式）',
  is_enabled        CHAR(1)         DEFAULT '1'                COMMENT '是否启用（0否 1是）',
  work_time_start   TIME            DEFAULT '00:00:00'         COMMENT '工作开始时间',
  work_time_end     TIME            DEFAULT '23:59:59'         COMMENT '工作结束时间',
  work_days         VARCHAR(20)     DEFAULT '1,2,3,4,5,6,7'    COMMENT '工作日',
  confidence_threshold DECIMAL(3,2) DEFAULT 0.80               COMMENT '置信度阈值',
  max_no_match      INT(3)          DEFAULT 3                  COMMENT '最大无匹配次数',
  auto_transfer     CHAR(1)         DEFAULT '1'                COMMENT '自动转人工（0否 1是）',
  channels          VARCHAR(100)    DEFAULT ''                 COMMENT '适用渠道（JSON格式）',
  priority          INT(3)          DEFAULT 1                  COMMENT '优先级',
  status            CHAR(1)         DEFAULT '0'                COMMENT '状态（0正常 1停用）',
  del_flag          CHAR(1)         DEFAULT '0'                COMMENT '删除标志（0存在 2删除）',
  create_by         VARCHAR(64)     DEFAULT ''                 COMMENT '创建者',
  create_time       DATETIME        DEFAULT NULL               COMMENT '创建时间',
  update_by         VARCHAR(64)     DEFAULT ''                 COMMENT '更新者',
  update_time       DATETIME        DEFAULT NULL               COMMENT '更新时间',
  remark            VARCHAR(500)    DEFAULT ''                 COMMENT '备注',
  reserved1         VARCHAR(100)    DEFAULT ''                 COMMENT '预留字段1',
  reserved2         VARCHAR(100)    DEFAULT ''                 COMMENT '预留字段2',
  reserved3         VARCHAR(100)    DEFAULT ''                 COMMENT '预留字段3',
  ext_field1        TEXT            DEFAULT NULL               COMMENT '扩展字段1',
  ext_field2        TEXT            DEFAULT NULL               COMMENT '扩展字段2',
  PRIMARY KEY (config_id),
  KEY idx_is_enabled (is_enabled),
  KEY idx_status (status)
) ENGINE=InnoDB AUTO_INCREMENT=100 COMMENT = '智能机器人配置表';

-- ----------------------------
-- 10、自动回复规则表
-- ----------------------------
DROP TABLE IF EXISTS cs_auto_reply;
CREATE TABLE cs_auto_reply (
  reply_id          BIGINT(20)      NOT NULL AUTO_INCREMENT    COMMENT '回复ID',
  rule_name         VARCHAR(100)    NOT NULL                   COMMENT '规则名称',
  keywords          TEXT            NOT NULL                   COMMENT '关键词（JSON格式）',
  match_type        CHAR(1)         DEFAULT '1'                COMMENT '匹配类型（1精确 2模糊 3正则）',
  reply_type        VARCHAR(20)     DEFAULT 'text'             COMMENT '回复类型（text文本 image图片 file文件）',
  reply_content     TEXT            NOT NULL                   COMMENT '回复内容',
  reply_media       VARCHAR(500)    DEFAULT ''                 COMMENT '回复媒体文件',
  intent_id         BIGINT(20)      DEFAULT NULL               COMMENT '关联意图ID',
  priority          INT(3)          DEFAULT 1                  COMMENT '优先级（数字越大优先级越高）',
  hit_count         INT(11)         DEFAULT 0                  COMMENT '命中次数',
  success_count     INT(11)         DEFAULT 0                  COMMENT '成功次数',
  channels          VARCHAR(100)    DEFAULT ''                 COMMENT '适用渠道（JSON格式）',
  is_enabled        CHAR(1)         DEFAULT '1'                COMMENT '是否启用（0否 1是）',
  valid_start_time  DATETIME        DEFAULT NULL               COMMENT '生效开始时间',
  valid_end_time    DATETIME        DEFAULT NULL               COMMENT '生效结束时间',
  status            CHAR(1)         DEFAULT '0'                COMMENT '状态（0正常 1停用）',
  del_flag          CHAR(1)         DEFAULT '0'                COMMENT '删除标志（0存在 2删除）',
  create_by         VARCHAR(64)     DEFAULT ''                 COMMENT '创建者',
  create_time       DATETIME        DEFAULT NULL               COMMENT '创建时间',
  update_by         VARCHAR(64)     DEFAULT ''                 COMMENT '更新者',
  update_time       DATETIME        DEFAULT NULL               COMMENT '更新时间',
  remark            VARCHAR(500)    DEFAULT ''                 COMMENT '备注',
  reserved1         VARCHAR(100)    DEFAULT ''                 COMMENT '预留字段1',
  reserved2         VARCHAR(100)    DEFAULT ''                 COMMENT '预留字段2',
  ext_field1        TEXT            DEFAULT NULL               COMMENT '扩展字段1',
  PRIMARY KEY (reply_id),
  KEY idx_intent_id (intent_id),
  KEY idx_is_enabled (is_enabled),
  KEY idx_priority (priority),
  KEY idx_status (status)
) ENGINE=InnoDB AUTO_INCREMENT=10000 COMMENT = '自动回复规则表';

-- ----------------------------
-- 11、意图识别表
-- ----------------------------
DROP TABLE IF EXISTS cs_intent;
CREATE TABLE cs_intent (
  intent_id         BIGINT(20)      NOT NULL AUTO_INCREMENT    COMMENT '意图ID',
  intent_name       VARCHAR(100)    NOT NULL                   COMMENT '意图名称',
  intent_code       VARCHAR(50)     NOT NULL                   COMMENT '意图编码',
  description       VARCHAR(500)    DEFAULT ''                 COMMENT '意图描述',
  training_data     TEXT            DEFAULT NULL               COMMENT '训练数据（JSON格式）',
  confidence_threshold DECIMAL(3,2) DEFAULT 0.80               COMMENT '置信度阈值',
  parent_id         BIGINT(20)      DEFAULT 0                  COMMENT '父意图ID',
  level             INT(2)          DEFAULT 1                  COMMENT '意图层级',
  sort_order        INT(4)          DEFAULT 0                  COMMENT '排序',
  hit_count         INT(11)         DEFAULT 0                  COMMENT '命中次数',
  success_rate      DECIMAL(5,2)    DEFAULT 0.00               COMMENT '成功率（%）',
  is_enabled        CHAR(1)         DEFAULT '1'                COMMENT '是否启用（0否 1是）',
  status            CHAR(1)         DEFAULT '0'                COMMENT '状态（0正常 1停用）',
  del_flag          CHAR(1)         DEFAULT '0'                COMMENT '删除标志（0存在 2删除）',
  create_by         VARCHAR(64)     DEFAULT ''                 COMMENT '创建者',
  create_time       DATETIME        DEFAULT NULL               COMMENT '创建时间',
  update_by         VARCHAR(64)     DEFAULT ''                 COMMENT '更新者',
  update_time       DATETIME        DEFAULT NULL               COMMENT '更新时间',
  remark            VARCHAR(500)    DEFAULT ''                 COMMENT '备注',
  reserved1         VARCHAR(100)    DEFAULT ''                 COMMENT '预留字段1',
  reserved2         VARCHAR(100)    DEFAULT ''                 COMMENT '预留字段2',
  ext_field1        TEXT            DEFAULT NULL               COMMENT '扩展字段1',
  PRIMARY KEY (intent_id),
  UNIQUE KEY uk_intent_code (intent_code),
  KEY idx_parent_id (parent_id),
  KEY idx_is_enabled (is_enabled),
  KEY idx_status (status)
) ENGINE=InnoDB AUTO_INCREMENT=1000 COMMENT = '意图识别表';

-- ----------------------------
-- 12、客服统计表（按日统计）
-- ----------------------------
DROP TABLE IF EXISTS cs_statistics_daily;
CREATE TABLE cs_statistics_daily (
  stat_id           BIGINT(20)      NOT NULL AUTO_INCREMENT    COMMENT '统计ID',
  stat_date         DATE            NOT NULL                   COMMENT '统计日期',
  agent_id          BIGINT(20)      DEFAULT NULL               COMMENT '客服ID（NULL表示全部）',
  dept_id           BIGINT(20)      DEFAULT NULL               COMMENT '部门ID',
  channel           VARCHAR(20)     DEFAULT ''                 COMMENT '渠道',
  total_conversations INT(11)       DEFAULT 0                  COMMENT '总会话数',
  completed_conversations INT(11)   DEFAULT 0                  COMMENT '完成会话数',
  avg_wait_time     INT(11)         DEFAULT 0                  COMMENT '平均等待时间（秒）',
  avg_response_time INT(11)         DEFAULT 0                  COMMENT '平均响应时间（秒）',
  avg_session_duration INT(11)      DEFAULT 0                  COMMENT '平均会话时长（秒）',
  total_messages    INT(11)         DEFAULT 0                  COMMENT '总消息数',
  customer_satisfaction DECIMAL(3,2) DEFAULT 0.00             COMMENT '客户满意度',
  resolution_rate   DECIMAL(5,2)    DEFAULT 0.00               COMMENT '解决率（%）',
  transfer_rate     DECIMAL(5,2)    DEFAULT 0.00               COMMENT '转接率（%）',
  robot_sessions    INT(11)         DEFAULT 0                  COMMENT '机器人会话数',
  robot_success_rate DECIMAL(5,2)   DEFAULT 0.00               COMMENT '机器人成功率（%）',
  online_time       INT(11)         DEFAULT 0                  COMMENT '在线时长（分钟）',
  create_time       DATETIME        DEFAULT NULL               COMMENT '创建时间',
  update_time       DATETIME        DEFAULT NULL               COMMENT '更新时间',
  reserved1         VARCHAR(100)    DEFAULT ''                 COMMENT '预留字段1',
  reserved2         VARCHAR(100)    DEFAULT ''                 COMMENT '预留字段2',
  ext_field1        TEXT            DEFAULT NULL               COMMENT '扩展字段1',
  PRIMARY KEY (stat_id),
  UNIQUE KEY uk_date_agent_channel (stat_date, agent_id, channel),
  KEY idx_stat_date (stat_date),
  KEY idx_agent_id (agent_id),
  KEY idx_dept_id (dept_id)
) ENGINE=InnoDB AUTO_INCREMENT=100000 COMMENT = '客服统计表（按日统计）';

-- ----------------------------
-- 13、客户标签表
-- ----------------------------
DROP TABLE IF EXISTS cs_customer_tag;
CREATE TABLE cs_customer_tag (
  tag_id            BIGINT(20)      NOT NULL AUTO_INCREMENT    COMMENT '标签ID',
  tag_name          VARCHAR(50)     NOT NULL                   COMMENT '标签名称',
  tag_color         VARCHAR(20)     DEFAULT '#409EFF'          COMMENT '标签颜色',
  tag_type          VARCHAR(20)     DEFAULT 'custom'           COMMENT '标签类型（system系统 custom自定义）',
  description       VARCHAR(200)    DEFAULT ''                 COMMENT '标签描述',
  use_count         INT(11)         DEFAULT 0                  COMMENT '使用次数',
  sort_order        INT(4)          DEFAULT 0                  COMMENT '排序',
  status            CHAR(1)         DEFAULT '0'                COMMENT '状态（0正常 1停用）',
  del_flag          CHAR(1)         DEFAULT '0'                COMMENT '删除标志（0存在 2删除）',
  create_by         VARCHAR(64)     DEFAULT ''                 COMMENT '创建者',
  create_time       DATETIME        DEFAULT NULL               COMMENT '创建时间',
  update_by         VARCHAR(64)     DEFAULT ''                 COMMENT '更新者',
  update_time       DATETIME        DEFAULT NULL               COMMENT '更新时间',
  remark            VARCHAR(500)    DEFAULT ''                 COMMENT '备注',
  reserved1         VARCHAR(100)    DEFAULT ''                 COMMENT '预留字段1',
  reserved2         VARCHAR(100)    DEFAULT ''                 COMMENT '预留字段2',
  PRIMARY KEY (tag_id),
  UNIQUE KEY uk_tag_name (tag_name),
  KEY idx_tag_type (tag_type),
  KEY idx_status (status)
) ENGINE=InnoDB AUTO_INCREMENT=1000 COMMENT = '客户标签表';

-- ----------------------------
-- 14、客户标签关联表
-- ----------------------------
DROP TABLE IF EXISTS cs_customer_tag_relation;
CREATE TABLE cs_customer_tag_relation (
  relation_id       BIGINT(20)      NOT NULL AUTO_INCREMENT    COMMENT '关联ID',
  customer_id       BIGINT(20)      NOT NULL                   COMMENT '客户ID',
  tag_id            BIGINT(20)      NOT NULL                   COMMENT '标签ID',
  create_by         VARCHAR(64)     DEFAULT ''                 COMMENT '创建者',
  create_time       DATETIME        DEFAULT NULL               COMMENT '创建时间',
  PRIMARY KEY (relation_id),
  UNIQUE KEY uk_customer_tag (customer_id, tag_id),
  KEY idx_customer_id (customer_id),
  KEY idx_tag_id (tag_id)
) ENGINE=InnoDB AUTO_INCREMENT=100000 COMMENT = '客户标签关联表';

-- ----------------------------
-- 15、系统配置扩展表
-- ----------------------------
DROP TABLE IF EXISTS cs_system_config;
CREATE TABLE cs_system_config (
  config_id         BIGINT(20)      NOT NULL AUTO_INCREMENT    COMMENT '配置ID',
  config_key        VARCHAR(100)    NOT NULL                   COMMENT '配置键',
  config_value      TEXT            DEFAULT NULL               COMMENT '配置值',
  config_type       VARCHAR(20)     DEFAULT 'string'           COMMENT '配置类型（string字符串 number数字 boolean布尔 json对象）',
  config_group      VARCHAR(50)     DEFAULT 'default'          COMMENT '配置分组',
  description       VARCHAR(500)    DEFAULT ''                 COMMENT '配置描述',
  is_system         CHAR(1)         DEFAULT '0'                COMMENT '是否系统配置（0否 1是）',
  status            CHAR(1)         DEFAULT '0'                COMMENT '状态（0正常 1停用）',
  del_flag          CHAR(1)         DEFAULT '0'                COMMENT '删除标志（0存在 2删除）',
  create_by         VARCHAR(64)     DEFAULT ''                 COMMENT '创建者',
  create_time       DATETIME        DEFAULT NULL               COMMENT '创建时间',
  update_by         VARCHAR(64)     DEFAULT ''                 COMMENT '更新者',
  update_time       DATETIME        DEFAULT NULL               COMMENT '更新时间',
  remark            VARCHAR(500)    DEFAULT ''                 COMMENT '备注',
  PRIMARY KEY (config_id),
  UNIQUE KEY uk_config_key (config_key),
  KEY idx_config_group (config_group),
  KEY idx_status (status)
) ENGINE=InnoDB AUTO_INCREMENT=1000 COMMENT = '系统配置扩展表';

-- ----------------------------
-- 初始化数据
-- ----------------------------

-- 插入默认客户标签
INSERT INTO cs_customer_tag (tag_name, tag_color, tag_type, description, sort_order, create_by, create_time) VALUES
('VIP客户', '#E6A23C', 'system', '重要客户标签', 1, 'admin', NOW()),
('新客户', '#67C23A', 'system', '新注册客户', 2, 'admin', NOW()),
('老客户', '#909399', 'system', '长期合作客户', 3, 'admin', NOW()),
('投诉客户', '#F56C6C', 'system', '有投诉记录的客户', 4, 'admin', NOW()),
('潜在客户', '#409EFF', 'system', '有购买意向的客户', 5, 'admin', NOW());

-- 插入知识库分类
INSERT INTO cs_knowledge_category (category_name, category_code, parent_id, ancestors, order_num, description, create_by, create_time) VALUES
('常见问题', 'FAQ', 0, '0', 1, '客户常见问题解答', 'admin', NOW()),
('产品介绍', 'PRODUCT', 0, '0', 2, '产品功能和特性介绍', 'admin', NOW()),
('技术支持', 'TECH', 0, '0', 3, '技术问题解决方案', 'admin', NOW()),
('售后服务', 'SERVICE', 0, '0', 4, '售后服务相关信息', 'admin', NOW()),
('操作指南', 'GUIDE', 0, '0', 5, '系统操作指导文档', 'admin', NOW());

-- 插入意图识别数据
INSERT INTO cs_intent (intent_name, intent_code, description, confidence_threshold, level, sort_order, create_by, create_time) VALUES
('问候', 'GREETING', '客户问候意图', 0.80, 1, 1, 'admin', NOW()),
('咨询产品', 'PRODUCT_INQUIRY', '产品咨询意图', 0.80, 1, 2, 'admin', NOW()),
('技术支持', 'TECH_SUPPORT', '技术支持意图', 0.80, 1, 3, 'admin', NOW()),
('投诉建议', 'COMPLAINT', '投诉建议意图', 0.80, 1, 4, 'admin', NOW()),
('转人工', 'TRANSFER_HUMAN', '转人工服务意图', 0.80, 1, 5, 'admin', NOW()),
('结束对话', 'END_CONVERSATION', '结束对话意图', 0.80, 1, 6, 'admin', NOW());

-- 插入机器人配置
INSERT INTO cs_robot_config (robot_name, robot_avatar, welcome_message, default_reply, no_match_reply, transfer_keywords, create_by, create_time) VALUES
('Whisper智能助手', '/avatar/robot.png',
'您好！我是Whisper智能客服助手，很高兴为您服务！请问有什么可以帮助您的吗？',
'感谢您的咨询，我会尽力为您解答。',
'抱歉，我没有理解您的问题。您可以换个方式描述，或者输入"转人工"获得人工客服帮助。',
'["转人工","人工客服","客服","联系客服","人工服务"]',
'admin', NOW());

-- 插入系统配置
INSERT INTO cs_system_config (config_key, config_value, config_type, config_group, description, is_system, create_by, create_time) VALUES
('cs.session.timeout', '1800', 'number', 'session', '会话超时时间（秒）', '1', 'admin', NOW()),
('cs.queue.max_wait_time', '300', 'number', 'queue', '最大排队等待时间（秒）', '1', 'admin', NOW()),
('cs.agent.max_concurrent', '10', 'number', 'agent', '客服最大并发会话数', '1', 'admin', NOW()),
('cs.robot.enabled', 'true', 'boolean', 'robot', '是否启用机器人服务', '1', 'admin', NOW()),
('cs.auto_assign.enabled', 'true', 'boolean', 'assign', '是否启用自动分配', '1', 'admin', NOW()),
('cs.satisfaction.required', 'false', 'boolean', 'satisfaction', '是否强制满意度评价', '1', 'admin', NOW());

-- ----------------------------
-- 索引优化建议
-- ----------------------------
/*
性能优化建议：

1. 对于大数据量表，建议按时间分区：
   - cs_message: 按月分区
   - cs_conversation: 按月分区
   - cs_statistics_daily: 按年分区

2. 定期清理历史数据：
   - 消息记录保留1年
   - 会话记录保留2年
   - 统计数据保留3年

3. 读写分离：
   - 统计查询使用只读从库
   - 实时会话使用主库

4. 缓存策略：
   - 客服在线状态使用Redis缓存
   - 知识库内容使用缓存
   - 自动回复规则使用缓存

5. 全文搜索：
   - 知识库内容建议使用Elasticsearch
   - 消息内容搜索使用全文索引
*/

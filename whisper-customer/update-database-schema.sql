-- Whisper Chat System 数据库表结构更新脚本
-- 将 cs_customer 表的 reserved1 和 reserved2 字段重新定义为IP相关字段

-- 更新 cs_customer 表字段注释
ALTER TABLE cs_customer MODIFY COLUMN reserved1 VARCHAR(100) COMMENT 'IP地址';
ALTER TABLE cs_customer MODIFY COLUMN reserved2 VARCHAR(200) COMMENT 'IP地理位置';

-- 为了更好的可读性，也可以考虑重命名字段（可选，需要同时更新代码）
-- ALTER TABLE cs_customer CHANGE COLUMN reserved1 ip_address VARCHAR(100) COMMENT 'IP地址';
-- ALTER TABLE cs_customer CHANGE COLUMN reserved2 ip_location VARCHAR(200) COMMENT 'IP地理位置';

-- 添加索引以提高查询性能
CREATE INDEX idx_cs_customer_ip_address ON cs_customer(reserved1);
CREATE INDEX idx_cs_customer_create_time ON cs_customer(create_time);

-- 更新表注释
ALTER TABLE cs_customer COMMENT = '客户信息表（包含IP地址和地理位置信息）';

-- 验证更新结果
SELECT 
    COLUMN_NAME as '字段名',
    COLUMN_TYPE as '字段类型',
    IS_NULLABLE as '是否可空',
    COLUMN_DEFAULT as '默认值',
    COLUMN_COMMENT as '字段注释'
FROM 
    INFORMATION_SCHEMA.COLUMNS 
WHERE 
    TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'cs_customer' 
    AND COLUMN_NAME IN ('reserved1', 'reserved2')
ORDER BY 
    ORDINAL_POSITION;

-- 显示表结构
SHOW CREATE TABLE cs_customer;

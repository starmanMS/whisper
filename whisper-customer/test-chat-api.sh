#!/bin/bash

# Whisper Chat API 测试脚本
# 用于测试聊天接口的完整功能

BASE_URL="http://localhost:8080"
API_BASE="$BASE_URL/api/chat"

echo "=== Whisper Chat API 功能测试 ==="
echo "基础URL: $BASE_URL"
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 测试函数
test_api() {
    local name="$1"
    local method="$2"
    local url="$3"
    local data="$4"
    
    echo -e "${BLUE}测试: $name${NC}"
    echo "请求: $method $url"
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" "$url")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" -H "Content-Type: application/json" -d "$data" "$url")
    fi
    
    # 分离响应体和状态码
    http_code=$(echo "$response" | tail -n1)
    response_body=$(echo "$response" | head -n -1)
    
    if [ "$http_code" = "200" ]; then
        echo -e "${GREEN}✅ 成功 (HTTP $http_code)${NC}"
        echo "响应: $response_body"
    else
        echo -e "${RED}❌ 失败 (HTTP $http_code)${NC}"
        echo "响应: $response_body"
    fi
    echo ""
}

# 1. 测试简单接口
echo "=== 1. 基础连通性测试 ==="
test_api "简单测试接口" "GET" "$API_BASE/test"
test_api "健康检查接口" "GET" "$API_BASE/health"

# 2. 测试初始化接口
echo "=== 2. 聊天初始化测试 ==="
init_data='{
    "customerId": "",
    "customerName": "测试用户",
    "phone": "13800138000",
    "email": "test@example.com"
}'

echo "发送初始化请求..."
init_response=$(curl -s -X POST -H "Content-Type: application/json" -d "$init_data" "$API_BASE/init")
echo "初始化响应: $init_response"

# 从响应中提取会话信息
conversation_id=$(echo "$init_response" | grep -o '"conversationId":[0-9]*' | cut -d':' -f2)
customer_id=$(echo "$init_response" | grep -o '"customerId":[0-9]*' | cut -d':' -f2)
customer_name=$(echo "$init_response" | grep -o '"customerName":"[^"]*"' | cut -d'"' -f4)

echo "提取的信息:"
echo "  会话ID: $conversation_id"
echo "  客户ID: $customer_id"
echo "  客户名称: $customer_name"
echo ""

# 3. 测试消息发送
if [ -n "$conversation_id" ] && [ -n "$customer_id" ]; then
    echo "=== 3. 消息发送测试 ==="
    
    # 发送文本消息
    message_data="{
        \"conversationId\": $conversation_id,
        \"customerId\": $customer_id,
        \"customerName\": \"$customer_name\",
        \"messageType\": \"text\",
        \"content\": \"这是一条测试消息，时间：$(date)\"
    }"
    
    test_api "发送文本消息" "POST" "$API_BASE/sendMessage" "$message_data"
    
    # 发送另一条消息
    message_data2="{
        \"conversationId\": $conversation_id,
        \"customerId\": $customer_id,
        \"customerName\": \"$customer_name\",
        \"messageType\": \"text\",
        \"content\": \"这是第二条测试消息，用于验证消息历史功能\"
    }"
    
    test_api "发送第二条消息" "POST" "$API_BASE/sendMessage" "$message_data2"
    
    # 4. 测试消息历史
    echo "=== 4. 消息历史测试 ==="
    test_api "获取消息历史" "GET" "$API_BASE/messages/$conversation_id?pageNum=1&pageSize=10"
    
else
    echo -e "${RED}❌ 跳过消息测试，因为初始化失败${NC}"
fi

# 5. 测试错误处理
echo "=== 5. 错误处理测试 ==="

# 测试无效的会话ID
invalid_message_data='{
    "conversationId": 99999,
    "customerId": 1,
    "customerName": "测试用户",
    "messageType": "text",
    "content": "测试无效会话ID"
}'
test_api "无效会话ID测试" "POST" "$API_BASE/sendMessage" "$invalid_message_data"

# 测试空消息内容
empty_message_data="{
    \"conversationId\": ${conversation_id:-1},
    \"customerId\": ${customer_id:-1},
    \"customerName\": \"测试用户\",
    \"messageType\": \"text\",
    \"content\": \"\"
}"
test_api "空消息内容测试" "POST" "$API_BASE/sendMessage" "$empty_message_data"

# 6. 测试IP地址获取
echo "=== 6. IP地址获取测试 ==="
echo "检查初始化响应中的IP信息..."
ip_address=$(echo "$init_response" | grep -o '"ipAddress":"[^"]*"' | cut -d'"' -f4)
ip_location=$(echo "$init_response" | grep -o '"ipLocation":"[^"]*"' | cut -d'"' -f4)

if [ -n "$ip_address" ]; then
    echo -e "${GREEN}✅ IP地址获取成功: $ip_address${NC}"
else
    echo -e "${RED}❌ IP地址获取失败${NC}"
fi

if [ -n "$ip_location" ]; then
    echo -e "${GREEN}✅ IP地理位置获取成功: $ip_location${NC}"
else
    echo -e "${RED}❌ IP地理位置获取失败${NC}"
fi

echo ""
echo "=== 测试完成 ==="
echo "如果所有测试都通过，说明聊天API功能正常"
echo "如果有测试失败，请检查："
echo "1. 应用是否正常启动"
echo "2. 数据库连接是否正常"
echo "3. 相关表是否存在"
echo "4. 网络连接是否正常（IP地址获取功能）"

#!/bin/bash

# Whisper Chat 权限配置测试脚本
# 用于测试各种API端点的权限配置是否正确

BASE_URL="http://localhost:8080"

echo "=== Whisper Chat 权限配置测试 ==="
echo "基础URL: $BASE_URL"
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 测试函数
test_endpoint() {
    local name="$1"
    local url="$2"
    local expected_code="$3"
    
    echo -e "${BLUE}测试: $name${NC}"
    echo "URL: $url"
    
    response=$(curl -s -w "\n%{http_code}" "$url")
    http_code=$(echo "$response" | tail -n1)
    response_body=$(echo "$response" | head -n -1)
    
    if [ "$http_code" = "$expected_code" ]; then
        echo -e "${GREEN}✅ 成功 (HTTP $http_code)${NC}"
        if [ "$http_code" = "200" ]; then
            echo "响应: $response_body"
        fi
    else
        echo -e "${RED}❌ 失败 (HTTP $http_code, 期望 $expected_code)${NC}"
        echo "响应: $response_body"
    fi
    echo ""
}

# 1. 测试正确的API路径
echo "=== 1. 测试正确的API路径 ==="
test_endpoint "聊天API测试" "$BASE_URL/api/chat/test" "200"
test_endpoint "通用API测试" "$BASE_URL/api/test/hello" "200"
test_endpoint "权限状态检查" "$BASE_URL/api/chat/security-status" "200"

# 2. 测试错误的路径（应该也能工作，因为我们添加了兼容性配置）
echo "=== 2. 测试错误路径的兼容性 ==="
test_endpoint "WebSocket聊天API测试" "$BASE_URL/websocket/api/chat/test" "200"
test_endpoint "WebSocket通用API测试" "$BASE_URL/websocket/api/test/hello" "200"

# 3. 测试原有的聊天接口
echo "=== 3. 测试原有的聊天接口 ==="
test_endpoint "聊天健康检查" "$BASE_URL/api/chat/health" "200"

# 4. 测试需要认证的接口（应该返回401）
echo "=== 4. 测试需要认证的接口 ==="
test_endpoint "用户管理接口（需要认证）" "$BASE_URL/system/user/list" "401"

# 5. 测试WebSocket端点（应该返回404，因为这不是HTTP端点）
echo "=== 5. 测试WebSocket端点 ==="
test_endpoint "WebSocket端点" "$BASE_URL/websocket/chat/customer/test123" "404"

echo "=== 测试完成 ==="
echo ""
echo "说明："
echo "- ✅ 表示测试通过"
echo "- ❌ 表示测试失败"
echo "- HTTP 200: 接口正常工作且允许匿名访问"
echo "- HTTP 401: 接口需要认证（符合预期）"
echo "- HTTP 404: 接口不存在"
echo ""
echo "如果聊天相关的接口返回401，说明权限配置有问题"
echo "如果返回200，说明权限配置正确"

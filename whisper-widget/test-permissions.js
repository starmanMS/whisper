#!/usr/bin/env node

const http = require('http');

console.log('🔍 开始测试Whisper后端权限配置...\n');

const BASE_URL = 'http://localhost:8080';

// 测试端点列表
const testEndpoints = [
  // 正确的API路径
  { name: '聊天API健康检查', url: '/api/chat/health', expectedStatus: 200 },
  { name: 'WebSocket健康检查', url: '/api/websocket/health', expectedStatus: 200 },
  { name: 'WebSocket配置信息', url: '/api/websocket/info', expectedStatus: 200 },
  { name: '聊天API测试', url: '/api/chat/test', expectedStatus: [200, 404] }, // 404也可以接受，说明权限通过了
  
  // WebSocket相关路径
  { name: 'WebSocket根路径', url: '/websocket', expectedStatus: [200, 404] },
  
  // 需要认证的路径（应该返回401）
  { name: '用户管理（需要认证）', url: '/system/user/list', expectedStatus: 401 },
  { name: '系统配置（需要认证）', url: '/system/config/list', expectedStatus: 401 }
];

// 测试单个端点
function testEndpoint(endpoint) {
  return new Promise((resolve) => {
    const url = `${BASE_URL}${endpoint.url}`;
    console.log(`📡 测试: ${endpoint.name}`);
    console.log(`   URL: ${url}`);
    
    const req = http.request(url, { timeout: 5000 }, (res) => {
      const expectedStatuses = Array.isArray(endpoint.expectedStatus) 
        ? endpoint.expectedStatus 
        : [endpoint.expectedStatus];
      
      const isExpected = expectedStatuses.includes(res.statusCode);
      const status = isExpected ? '✅' : '❌';
      
      console.log(`   ${status} 状态码: ${res.statusCode} (期望: ${expectedStatuses.join(' 或 ')})`);
      
      // 读取响应数据
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (data && res.statusCode === 200) {
          try {
            const jsonData = JSON.parse(data);
            if (jsonData.msg) {
              console.log(`   📝 响应: ${jsonData.msg}`);
            }
          } catch (e) {
            // 不是JSON响应，忽略
          }
        }
        console.log('');
        resolve({ 
          endpoint: endpoint.name, 
          url: endpoint.url,
          status: res.statusCode, 
          expected: expectedStatuses,
          success: isExpected 
        });
      });
    });

    req.on('error', (err) => {
      console.log(`   ❌ 请求失败: ${err.message}`);
      console.log('');
      resolve({ 
        endpoint: endpoint.name, 
        url: endpoint.url,
        status: 'ERROR', 
        expected: endpoint.expectedStatus,
        success: false,
        error: err.message
      });
    });

    req.on('timeout', () => {
      console.log(`   ⏰ 请求超时`);
      console.log('');
      req.destroy();
      resolve({ 
        endpoint: endpoint.name, 
        url: endpoint.url,
        status: 'TIMEOUT', 
        expected: endpoint.expectedStatus,
        success: false,
        error: 'Request timeout'
      });
    });

    req.end();
  });
}

// 运行所有测试
async function runAllTests() {
  console.log('Whisper 后端权限配置测试');
  console.log('================================\n');

  const results = [];
  
  for (const endpoint of testEndpoints) {
    const result = await testEndpoint(endpoint);
    results.push(result);
    
    // 添加延迟避免请求过快
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // 输出测试总结
  console.log('================================');
  console.log('测试结果汇总:');
  console.log('================================');
  
  let successCount = 0;
  let failureCount = 0;
  
  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${result.endpoint}`);
    console.log(`   URL: ${result.url}`);
    console.log(`   状态: ${result.status} (期望: ${result.expected})`);
    if (result.error) {
      console.log(`   错误: ${result.error}`);
    }
    console.log('');
    
    if (result.success) {
      successCount++;
    } else {
      failureCount++;
    }
  });

  console.log('================================');
  console.log(`总计: ${results.length} 个测试`);
  console.log(`✅ 成功: ${successCount}`);
  console.log(`❌ 失败: ${failureCount}`);
  
  if (failureCount === 0) {
    console.log('\n🎉 所有测试通过！权限配置正确。');
  } else {
    console.log('\n⚠️  有测试失败，请检查:');
    console.log('1. 后端服务是否正在运行');
    console.log('2. 安全配置是否已更新');
    console.log('3. 应用是否已重启');
  }

  // 特别检查WebSocket健康检查
  const websocketHealthResult = results.find(r => r.url === '/api/websocket/health');
  if (websocketHealthResult) {
    console.log('\n🔍 WebSocket健康检查详情:');
    if (websocketHealthResult.success) {
      console.log('✅ WebSocket健康检查通过，权限配置正确');
    } else {
      console.log('❌ WebSocket健康检查失败');
      if (websocketHealthResult.status === 401) {
        console.log('   原因: 认证失败，需要在SecurityConfig中添加 /api/websocket/** 到匿名访问列表');
      } else if (websocketHealthResult.status === 404) {
        console.log('   原因: 端点不存在，检查WebSocketTestController是否正确注册');
      } else {
        console.log(`   原因: 未知错误 (状态码: ${websocketHealthResult.status})`);
      }
    }
  }
}

// 运行测试
runAllTests().catch(console.error);

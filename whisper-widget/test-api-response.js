#!/usr/bin/env node

const http = require('http');

console.log('🔍 测试API响应格式...\n');

// 测试会话初始化API响应格式
function testInitResponse() {
  return new Promise((resolve) => {
    console.log('📡 测试会话初始化API响应格式...');
    
    const postData = JSON.stringify({
      customerName: '测试用户',
      email: 'test@example.com'
    });

    const options = {
      hostname: 'localhost',
      port: 8080,
      path: '/api/chat/init',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      },
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          console.log('✅ 会话初始化响应:');
          console.log('   状态码:', res.statusCode);
          console.log('   响应体:', JSON.stringify(jsonData, null, 2));
          console.log('   包含code字段:', 'code' in jsonData);
          console.log('   包含msg字段:', 'msg' in jsonData);
          console.log('   包含data字段:', 'data' in jsonData);
          console.log('   包含success字段:', 'success' in jsonData);
          console.log('');
          resolve(jsonData);
        } catch (e) {
          console.log('❌ 响应不是有效的JSON:', data);
          resolve(null);
        }
      });
    });

    req.on('error', (err) => {
      console.log('❌ 请求失败:', err.message);
      resolve(null);
    });

    req.on('timeout', () => {
      console.log('❌ 请求超时');
      req.destroy();
      resolve(null);
    });

    req.write(postData);
    req.end();
  });
}

// 测试发送消息API响应格式
function testSendMessageResponse(sessionData) {
  return new Promise((resolve) => {
    if (!sessionData || !sessionData.conversationId) {
      console.log('❌ 没有会话数据，跳过消息发送测试');
      resolve(null);
      return;
    }

    console.log('📡 测试发送消息API响应格式...');
    
    const postData = JSON.stringify({
      conversationId: sessionData.conversationId,
      customerId: sessionData.customerId,
      customerName: sessionData.customerName,
      messageType: 'text',
      content: '测试消息 - API响应格式验证'
    });

    const options = {
      hostname: 'localhost',
      port: 8080,
      path: '/api/chat/sendMessage',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      },
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          console.log('✅ 发送消息响应:');
          console.log('   状态码:', res.statusCode);
          console.log('   响应体:', JSON.stringify(jsonData, null, 2));
          console.log('   包含code字段:', 'code' in jsonData);
          console.log('   包含msg字段:', 'msg' in jsonData);
          console.log('   包含data字段:', 'data' in jsonData);
          console.log('   包含success字段:', 'success' in jsonData);
          
          // 检查成功条件
          const isSuccess = jsonData.code === 200;
          console.log('   成功判断 (code === 200):', isSuccess);
          console.log('');
          resolve(jsonData);
        } catch (e) {
          console.log('❌ 响应不是有效的JSON:', data);
          resolve(null);
        }
      });
    });

    req.on('error', (err) => {
      console.log('❌ 请求失败:', err.message);
      resolve(null);
    });

    req.on('timeout', () => {
      console.log('❌ 请求超时');
      req.destroy();
      resolve(null);
    });

    req.write(postData);
    req.end();
  });
}

// 主测试函数
async function runTests() {
  console.log('API响应格式验证测试');
  console.log('================================\n');

  // 1. 测试会话初始化
  const sessionData = await testInitResponse();
  await new Promise(resolve => setTimeout(resolve, 1000));

  // 2. 测试发送消息
  if (sessionData && sessionData.data) {
    await testSendMessageResponse(sessionData.data);
  }

  console.log('================================');
  console.log('测试完成！');
  console.log('');
  console.log('🔍 关键发现:');
  console.log('1. 后端使用AjaxResult格式，包含code、msg、data字段');
  console.log('2. 成功判断应该使用 response.code === 200');
  console.log('3. 前端之前错误地检查 response.success 字段');
  console.log('4. 修复后应该正确识别成功响应');
}

runTests().catch(console.error);

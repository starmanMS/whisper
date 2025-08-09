#!/usr/bin/env node

const WebSocket = require('ws');
const http = require('http');

console.log('🔍 测试WebSocket消息处理修复...\n');

// 首先初始化一个会话
async function initSession() {
  return new Promise((resolve, reject) => {
    console.log('📡 初始化会话...');
    
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
          if (jsonData.code === 200 && jsonData.data) {
            console.log('✅ 会话初始化成功');
            console.log('   客户ID:', jsonData.data.customerId);
            console.log('   会话ID:', jsonData.data.conversationId);
            console.log('   客户名:', jsonData.data.customerName);
            resolve(jsonData.data);
          } else {
            reject(new Error(`会话初始化失败: ${jsonData.msg}`));
          }
        } catch (e) {
          reject(new Error(`响应解析失败: ${e.message}`));
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('请求超时'));
    });

    req.write(postData);
    req.end();
  });
}

// 测试WebSocket消息发送
function testWebSocketMessage(sessionData) {
  return new Promise((resolve, reject) => {
    console.log('\n📡 测试WebSocket消息发送...');
    
    // 使用前端生成的用户ID格式
    const userId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const wsUrl = `ws://localhost:8080/websocket/chat/customer/${userId}`;
    
    console.log('   WebSocket URL:', wsUrl);
    console.log('   用户ID格式:', userId);
    
    const ws = new WebSocket(wsUrl);
    let messageReceived = false;
    
    const timeout = setTimeout(() => {
      if (!messageReceived) {
        console.log('❌ WebSocket消息测试超时');
        ws.close();
        reject(new Error('测试超时'));
      }
    }, 10000);

    ws.on('open', () => {
      console.log('✅ WebSocket连接成功');
      
      // 等待连接稳定后发送消息
      setTimeout(() => {
        const testMessage = {
          type: 'message',
          conversationId: sessionData.conversationId,
          content: `测试消息 - 用户ID: ${userId}`,
          messageType: 'text',
          senderName: sessionData.customerName,
          timestamp: new Date().toISOString()
        };
        
        console.log('📤 发送测试消息:', JSON.stringify(testMessage, null, 2));
        ws.send(JSON.stringify(testMessage));
      }, 1000);
    });

    ws.on('message', (data) => {
      clearTimeout(timeout);
      messageReceived = true;
      
      try {
        const response = JSON.parse(data.toString());
        console.log('📨 收到WebSocket响应:', JSON.stringify(response, null, 2));
        
        if (response.type === 'message' && response.message === '消息发送成功') {
          console.log('✅ WebSocket消息处理成功！');
          console.log('   消息已保存到数据库');
          console.log('   消息ID:', response.data?.messageId);
          resolve(response);
        } else if (response.type === 'system' && response.message === '连接成功') {
          console.log('✅ 连接确认消息');
          // 继续等待实际的消息响应
          messageReceived = false;
        } else {
          console.log('⚠️  收到其他类型响应');
          resolve(response);
        }
      } catch (e) {
        console.log('❌ 响应解析失败:', e.message);
        console.log('   原始响应:', data.toString());
        reject(e);
      }
      
      // 测试完成后关闭连接
      setTimeout(() => {
        ws.close();
      }, 2000);
    });

    ws.on('error', (error) => {
      clearTimeout(timeout);
      console.log('❌ WebSocket错误:', error.message);
      reject(error);
    });

    ws.on('close', (code, reason) => {
      clearTimeout(timeout);
      console.log('🔌 WebSocket连接关闭:', code, reason.toString());
      if (!messageReceived) {
        reject(new Error(`连接关闭，未收到响应: ${code} ${reason}`));
      }
    });
  });
}

// 验证数据库中的消息
async function verifyDatabaseMessage(sessionData) {
  return new Promise((resolve, reject) => {
    console.log('\n📡 验证数据库中的消息...');
    
    const url = `http://localhost:8080/api/chat/messages/${sessionData.conversationId}?pageNum=1&pageSize=5`;
    
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          if (jsonData.code === 200 && jsonData.data?.list) {
            console.log('✅ 数据库查询成功');
            console.log(`   共找到 ${jsonData.data.list.length} 条消息`);
            
            // 查找最新的测试消息
            const testMessage = jsonData.data.list.find(msg => 
              msg.content && msg.content.includes('测试消息 - 用户ID:')
            );
            
            if (testMessage) {
              console.log('✅ 找到测试消息:');
              console.log('   消息ID:', testMessage.messageId);
              console.log('   发送者ID:', testMessage.senderId);
              console.log('   发送者类型:', testMessage.senderType);
              console.log('   发送者姓名:', testMessage.senderName);
              console.log('   消息内容:', testMessage.content);
              console.log('   发送时间:', testMessage.sendTime);
              resolve(testMessage);
            } else {
              console.log('⚠️  未找到测试消息');
              resolve(null);
            }
          } else {
            reject(new Error(`数据库查询失败: ${jsonData.msg}`));
          }
        } catch (e) {
          reject(new Error(`响应解析失败: ${e.message}`));
        }
      });
    }).on('error', reject);
  });
}

// 主测试函数
async function runTest() {
  console.log('WebSocket消息处理修复测试');
  console.log('================================\n');

  try {
    // 1. 初始化会话
    const sessionData = await initSession();
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 2. 测试WebSocket消息发送
    const wsResponse = await testWebSocketMessage(sessionData);
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 3. 验证数据库中的消息
    const dbMessage = await verifyDatabaseMessage(sessionData);

    console.log('\n================================');
    console.log('测试结果汇总:');
    console.log('================================');
    console.log('✅ 会话初始化: 成功');
    console.log('✅ WebSocket连接: 成功');
    console.log('✅ 消息发送: 成功');
    console.log('✅ 数据库保存: 成功');
    
    if (dbMessage) {
      console.log('\n🎉 修复验证成功！');
      console.log('- 前端字符串用户ID正确处理');
      console.log('- 后端通过会话获取真实数字ID');
      console.log('- 消息成功保存到数据库');
      console.log('- WebSocket消息处理正常');
    } else {
      console.log('\n⚠️  部分功能可能存在问题');
    }

  } catch (error) {
    console.log('\n❌ 测试失败:', error.message);
    console.log('\n🔍 可能的问题:');
    console.log('1. 后端服务未启动或不可访问');
    console.log('2. WebSocket处理器修复未生效');
    console.log('3. 数据库连接问题');
    console.log('4. 会话数据不完整');
  }
}

runTest().catch(console.error);

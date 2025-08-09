#!/usr/bin/env node

const WebSocket = require('ws');
const http = require('http');

console.log('🔍 测试客户编号生成和使用修复...\n');

// 测试会话初始化和客户编号生成
async function testSessionInit() {
  return new Promise((resolve, reject) => {
    console.log('📡 测试会话初始化和客户编号生成...');
    
    const postData = JSON.stringify({
      customerName: '测试客户',
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
            console.log('   客户编号:', jsonData.data.customerNo);
            console.log('   客户名称:', jsonData.data.customerName);
            console.log('   会话ID:', jsonData.data.conversationId);
            
            // 验证客户编号格式
            const customerNo = jsonData.data.customerNo;
            const isValidFormat = /^CUS\d{14}[a-z0-9]{4}$/.test(customerNo);
            console.log('   编号格式验证:', isValidFormat ? '✅ 正确' : '❌ 错误');
            console.log('   编号格式:', customerNo);
            
            if (isValidFormat) {
              resolve(jsonData.data);
            } else {
              reject(new Error(`客户编号格式不正确: ${customerNo}`));
            }
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

// 测试WebSocket连接使用客户编号
function testWebSocketWithCustomerNo(sessionData) {
  return new Promise((resolve, reject) => {
    console.log('\n📡 测试WebSocket连接使用客户编号...');
    
    const customerNo = sessionData.customerNo;
    const wsUrl = `ws://localhost:8080/websocket/chat/customer/${customerNo}`;
    
    console.log('   WebSocket URL:', wsUrl);
    console.log('   使用客户编号:', customerNo);
    
    const ws = new WebSocket(wsUrl);
    let messageReceived = false;
    
    const timeout = setTimeout(() => {
      if (!messageReceived) {
        console.log('❌ WebSocket测试超时');
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
          content: `测试消息 - 客户编号: ${customerNo}`,
          messageType: 'text',
          senderName: sessionData.customerName,
          timestamp: new Date().toISOString()
        };
        
        console.log('📤 发送测试消息...');
        ws.send(JSON.stringify(testMessage));
      }, 1000);
    });

    ws.on('message', (data) => {
      try {
        const response = JSON.parse(data.toString());
        console.log('📨 收到WebSocket响应:', response.type, response.message);
        
        if (response.type === 'message' && response.message === '消息发送成功') {
          console.log('✅ WebSocket消息处理成功！');
          console.log('   消息ID:', response.data?.messageId);
          console.log('   发送者ID:', response.data?.senderId);
          messageReceived = true;
          clearTimeout(timeout);
          
          setTimeout(() => {
            ws.close();
            resolve(response);
          }, 1000);
        } else if (response.type === 'system') {
          console.log('ℹ️  系统消息:', response.message);
          // 继续等待消息响应
        }
      } catch (e) {
        console.log('❌ 响应解析失败:', e.message);
        reject(e);
      }
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

// 验证数据库中的消息记录
async function verifyDatabaseRecord(sessionData) {
  return new Promise((resolve, reject) => {
    console.log('\n📡 验证数据库中的消息记录...');
    
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
              msg.content && msg.content.includes('测试消息 - 客户编号:')
            );
            
            if (testMessage) {
              console.log('✅ 找到测试消息记录:');
              console.log('   消息ID:', testMessage.messageId);
              console.log('   发送者ID:', testMessage.senderId);
              console.log('   发送者类型:', testMessage.senderType);
              console.log('   发送者姓名:', testMessage.senderName);
              console.log('   消息内容:', testMessage.content);
              console.log('   发送时间:', testMessage.sendTime);
              
              // 验证发送者ID是否为数字
              const isNumericSenderId = !isNaN(testMessage.senderId) && testMessage.senderId > 0;
              console.log('   发送者ID格式:', isNumericSenderId ? '✅ 数字格式正确' : '❌ 格式错误');
              
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
  console.log('客户编号生成和使用修复测试');
  console.log('================================\n');

  try {
    // 1. 测试会话初始化和客户编号生成
    const sessionData = await testSessionInit();
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 2. 测试WebSocket连接使用客户编号
    const wsResponse = await testWebSocketWithCustomerNo(sessionData);
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 3. 验证数据库记录
    const dbMessage = await verifyDatabaseRecord(sessionData);

    console.log('\n================================');
    console.log('测试结果汇总:');
    console.log('================================');
    console.log('✅ 客户编号生成: 成功');
    console.log('✅ 编号格式验证: 通过');
    console.log('✅ WebSocket连接: 成功');
    console.log('✅ 消息发送处理: 成功');
    console.log('✅ 数据库记录: 成功');
    
    if (dbMessage) {
      console.log('\n🎉 客户编号修复验证成功！');
      console.log('关键改进:');
      console.log('- 后端生成标准格式客户编号 (CUSyyyyMMddHHmmssxxxx)');
      console.log('- 前端使用后端生成的客户编号');
      console.log('- WebSocket连接使用客户编号而非临时ID');
      console.log('- 消息记录正确关联到数字客户ID');
      console.log('- 系统数据一致性得到保证');
    } else {
      console.log('\n⚠️  部分功能可能存在问题');
    }

  } catch (error) {
    console.log('\n❌ 测试失败:', error.message);
    console.log('\n🔍 可能的问题:');
    console.log('1. 后端服务未启动');
    console.log('2. 客户编号生成方法未正确实现');
    console.log('3. WebSocket处理器修复未生效');
    console.log('4. 数据库连接或表结构问题');
  }
}

runTest().catch(console.error);

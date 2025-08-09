#!/usr/bin/env node

const http = require('http');
const WebSocket = require('ws');

console.log('🔍 开始检查后端服务状态...\n');

// 检查HTTP API
function checkHttpApi() {
  return new Promise((resolve) => {
    console.log('📡 检查HTTP API...');
    
    const req = http.request({
      hostname: 'localhost',
      port: 8080,
      path: '/api/chat/health',
      method: 'GET',
      timeout: 5000
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('✅ HTTP API正常:', data);
          resolve(true);
        } else {
          console.log('❌ HTTP API异常:', res.statusCode, data);
          resolve(false);
        }
      });
    });

    req.on('error', (err) => {
      console.log('❌ HTTP API连接失败:', err.message);
      resolve(false);
    });

    req.on('timeout', () => {
      console.log('❌ HTTP API请求超时');
      req.destroy();
      resolve(false);
    });

    req.end();
  });
}

// 检查WebSocket端点
function checkWebSocket() {
  return new Promise((resolve) => {
    console.log('\n🔌 检查WebSocket连接...');
    
    const wsUrl = 'ws://localhost:8080/websocket/chat/customer/test';
    console.log('连接URL:', wsUrl);
    
    try {
      const ws = new WebSocket(wsUrl);
      
      const timeout = setTimeout(() => {
        console.log('❌ WebSocket连接超时');
        ws.close();
        resolve(false);
      }, 10000);

      ws.on('open', () => {
        clearTimeout(timeout);
        console.log('✅ WebSocket连接成功');
        
        // 发送测试消息
        const testMessage = {
          type: 'system',
          content: 'test',
          timestamp: new Date().toISOString()
        };
        
        ws.send(JSON.stringify(testMessage));
        console.log('📤 发送测试消息:', JSON.stringify(testMessage));
        
        setTimeout(() => {
          ws.close();
          resolve(true);
        }, 2000);
      });

      ws.on('message', (data) => {
        console.log('📨 收到消息:', data.toString());
      });

      ws.on('error', (error) => {
        clearTimeout(timeout);
        console.log('❌ WebSocket错误:', error.message);
        resolve(false);
      });

      ws.on('close', (code, reason) => {
        clearTimeout(timeout);
        console.log('🔌 WebSocket连接关闭:', code, reason.toString());
      });

    } catch (error) {
      console.log('❌ WebSocket创建失败:', error.message);
      resolve(false);
    }
  });
}

// 检查端口占用
function checkPort() {
  return new Promise((resolve) => {
    console.log('\n🔍 检查端口8080占用情况...');
    
    const req = http.request({
      hostname: 'localhost',
      port: 8080,
      path: '/',
      method: 'GET',
      timeout: 3000
    }, (res) => {
      console.log('✅ 端口8080有服务响应，状态码:', res.statusCode);
      resolve(true);
    });

    req.on('error', (err) => {
      if (err.code === 'ECONNREFUSED') {
        console.log('❌ 端口8080无服务响应，请检查后端是否启动');
      } else {
        console.log('❌ 端口检查失败:', err.message);
      }
      resolve(false);
    });

    req.on('timeout', () => {
      console.log('❌ 端口检查超时');
      req.destroy();
      resolve(false);
    });

    req.end();
  });
}

// 主检查函数
async function main() {
  console.log('Whisper 后端服务检查工具');
  console.log('================================\n');

  const portOk = await checkPort();
  if (!portOk) {
    console.log('\n❌ 后端服务未启动，请先启动whisper-customer模块');
    console.log('启动命令: mvn spring-boot:run 或 java -jar whisper-customer.jar');
    process.exit(1);
  }

  const httpOk = await checkHttpApi();
  const wsOk = await checkWebSocket();

  console.log('\n================================');
  console.log('检查结果汇总:');
  console.log('端口8080:', portOk ? '✅ 正常' : '❌ 异常');
  console.log('HTTP API:', httpOk ? '✅ 正常' : '❌ 异常');
  console.log('WebSocket:', wsOk ? '✅ 正常' : '❌ 异常');

  if (httpOk && wsOk) {
    console.log('\n🎉 后端服务完全正常，可以使用前端Widget');
  } else {
    console.log('\n⚠️  后端服务存在问题，请检查:');
    console.log('1. whisper-customer模块是否正确启动');
    console.log('2. WebSocket配置是否正确');
    console.log('3. 防火墙是否阻止连接');
    console.log('4. 查看后端日志获取详细错误信息');
  }
}

main().catch(console.error);

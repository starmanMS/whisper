#!/usr/bin/env node

const http = require('http');

console.log('🚀 快速验证访客名称生成修复...\n');

// 测试修复后的API响应格式
function testFixedAPI() {
  return new Promise((resolve, reject) => {
    console.log('📡 测试修复后的API响应格式...');
    
    http.get('http://localhost:8080/api/chat/generateGuestName?type=smart', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          console.log('原始响应:', JSON.stringify(jsonData, null, 2));
          
          if (jsonData.code === 200) {
            if (jsonData.data && jsonData.data.guestName) {
              console.log('✅ 新格式正确 - data.guestName存在');
              console.log(`   生成的名称: ${jsonData.data.guestName}`);
              console.log(`   类型: ${jsonData.data.type}`);
              resolve(true);
            } else if (jsonData.guestName) {
              console.log('⚠️ 旧格式 - 直接在根级别');
              console.log(`   生成的名称: ${jsonData.guestName}`);
              console.log(`   类型: ${jsonData.type}`);
              resolve(false);
            } else {
              console.log('❌ 响应格式异常 - 找不到guestName');
              resolve(false);
            }
          } else {
            console.log(`❌ API返回错误: ${jsonData.msg}`);
            resolve(false);
          }
        } catch (e) {
          console.log(`❌ 响应解析失败: ${e.message}`);
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

// 测试会话初始化
function testSessionInit() {
  return new Promise((resolve, reject) => {
    console.log('\n📡 测试会话初始化...');
    
    const postData = JSON.stringify({
      customerName: '',
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
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          if (jsonData.code === 200 && jsonData.data) {
            console.log('✅ 会话初始化成功');
            console.log(`   客户名称: ${jsonData.data.customerName}`);
            
            // 验证名称格式
            const namePattern = /^访客\d{4}[A-Z]\d$/;
            if (namePattern.test(jsonData.data.customerName)) {
              console.log('✅ 访客名称格式正确');
              resolve(true);
            } else {
              console.log('❌ 访客名称格式不正确');
              resolve(false);
            }
          } else {
            console.log(`❌ 会话初始化失败: ${jsonData.msg}`);
            resolve(false);
          }
        } catch (e) {
          console.log(`❌ 响应解析失败: ${e.message}`);
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

// 主测试函数
async function runQuickTest() {
  console.log('访客名称生成修复验证');
  console.log('================================\n');

  try {
    const apiFixed = await testFixedAPI();
    const sessionWorking = await testSessionInit();

    console.log('\n================================');
    console.log('验证结果:');
    console.log('================================');
    console.log(`${apiFixed ? '✅' : '❌'} API响应格式: ${apiFixed ? '已修复' : '需要修复'}`);
    console.log(`${sessionWorking ? '✅' : '❌'} 会话集成: ${sessionWorking ? '正常' : '异常'}`);
    
    if (apiFixed && sessionWorking) {
      console.log('\n🎉 访客名称生成功能完全正常！');
      console.log('现在可以在前端正常使用智能访客名称了。');
    } else {
      console.log('\n🔧 还需要进一步修复...');
    }

  } catch (error) {
    console.log('\n❌ 测试过程中发生错误:', error.message);
  }
}

runQuickTest().catch(console.error);

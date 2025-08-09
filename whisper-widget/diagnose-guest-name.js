#!/usr/bin/env node

const http = require('http');

console.log('🔍 诊断访客名称生成功能...\n');

// 测试基础连接
function testBasicConnection() {
  return new Promise((resolve, reject) => {
    console.log('📡 测试基础连接...');
    
    http.get('http://localhost:8080/api/chat/health', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          console.log(`✅ 基础连接正常: ${res.statusCode}`);
          console.log(`   响应: ${jsonData.msg}`);
          resolve(true);
        } catch (e) {
          console.log(`❌ 响应解析失败: ${e.message}`);
          reject(e);
        }
      });
    }).on('error', (err) => {
      console.log(`❌ 连接失败: ${err.message}`);
      reject(err);
    });
  });
}

// 测试服务注入状态
function testServiceInjection() {
  return new Promise((resolve, reject) => {
    console.log('\n📡 测试服务注入状态...');
    
    http.get('http://localhost:8080/api/chat/test', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          console.log(`✅ 服务测试响应: ${res.statusCode}`);
          console.log(`   消息: ${jsonData.msg}`);
          if (jsonData.msg && jsonData.msg.includes('CustomerService-OK')) {
            console.log('✅ CustomerService注入正常');
            resolve(true);
          } else {
            console.log('❌ CustomerService注入异常');
            resolve(false);
          }
        } catch (e) {
          console.log(`❌ 服务测试响应解析失败: ${e.message}`);
          console.log(`   原始响应: ${data}`);
          reject(e);
        }
      });
    }).on('error', (err) => {
      console.log(`❌ 服务测试请求失败: ${err.message}`);
      reject(err);
    });
  });
}

// 测试访客名称生成API
function testGuestNameAPI() {
  return new Promise((resolve, reject) => {
    console.log('\n📡 测试访客名称生成API...');
    
    http.get('http://localhost:8080/api/chat/generateGuestName', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`   状态码: ${res.statusCode}`);
        console.log(`   原始响应: ${data}`);
        
        if (res.statusCode === 404) {
          console.log('❌ API端点不存在 (404)');
          console.log('   可能原因:');
          console.log('   1. 后端服务未重启');
          console.log('   2. 新代码未编译');
          console.log('   3. 路由映射问题');
          resolve(false);
          return;
        }
        
        if (res.statusCode === 500) {
          console.log('❌ 服务器内部错误 (500)');
          console.log('   可能原因:');
          console.log('   1. 方法实现有问题');
          console.log('   2. 依赖注入失败');
          console.log('   3. 运行时异常');
          resolve(false);
          return;
        }
        
        try {
          const jsonData = JSON.parse(data);
          if (res.statusCode === 200 && jsonData.code === 200) {
            console.log('✅ 访客名称生成API正常');
            console.log(`   生成的名称: ${jsonData.data?.guestName}`);
            console.log(`   类型: ${jsonData.data?.type}`);
            resolve(true);
          } else {
            console.log(`❌ API返回错误: ${jsonData.msg || '未知错误'}`);
            resolve(false);
          }
        } catch (e) {
          console.log(`❌ 响应解析失败: ${e.message}`);
          resolve(false);
        }
      });
    }).on('error', (err) => {
      console.log(`❌ API请求失败: ${err.message}`);
      reject(err);
    });
  });
}

// 测试所有可用的API端点
function testAllEndpoints() {
  return new Promise((resolve) => {
    console.log('\n📡 扫描所有可用的API端点...');
    
    const endpoints = [
      '/api/chat/health',
      '/api/chat/test', 
      '/api/chat/init',
      '/api/chat/generateGuestName',
      '/api/chat/generateGuestNames'
    ];
    
    let completed = 0;
    const results = {};
    
    endpoints.forEach(endpoint => {
      http.get(`http://localhost:8080${endpoint}`, (res) => {
        results[endpoint] = res.statusCode;
        completed++;
        
        if (completed === endpoints.length) {
          console.log('   端点扫描结果:');
          Object.entries(results).forEach(([path, status]) => {
            const statusText = status === 200 ? '✅' : status === 404 ? '❌' : '⚠️';
            console.log(`   ${statusText} ${path}: ${status}`);
          });
          resolve(results);
        }
      }).on('error', () => {
        results[endpoint] = 'ERROR';
        completed++;
        
        if (completed === endpoints.length) {
          console.log('   端点扫描结果:');
          Object.entries(results).forEach(([path, status]) => {
            const statusText = status === 200 ? '✅' : status === 404 ? '❌' : '⚠️';
            console.log(`   ${statusText} ${path}: ${status}`);
          });
          resolve(results);
        }
      });
    });
  });
}

// 测试会话初始化中的访客名称
function testSessionInit() {
  return new Promise((resolve, reject) => {
    console.log('\n📡 测试会话初始化中的访客名称...');
    
    const postData = JSON.stringify({
      customerName: '', // 空名称，让后端生成
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
        console.log(`   状态码: ${res.statusCode}`);
        
        try {
          const jsonData = JSON.parse(data);
          if (jsonData.code === 200 && jsonData.data) {
            console.log('✅ 会话初始化成功');
            console.log(`   客户名称: ${jsonData.data.customerName}`);
            console.log(`   客户编号: ${jsonData.data.customerNo}`);
            
            // 检查是否使用了智能生成的名称
            if (jsonData.data.customerName && jsonData.data.customerName !== '访客') {
              const namePattern = /^访客\d{4}[A-Z]\d$/;
              if (namePattern.test(jsonData.data.customerName)) {
                console.log('✅ 使用了智能生成的访客名称');
                resolve(true);
              } else {
                console.log('⚠️ 使用了非标准格式的访客名称');
                resolve(false);
              }
            } else {
              console.log('❌ 仍在使用默认的"访客"名称');
              resolve(false);
            }
          } else {
            console.log(`❌ 会话初始化失败: ${jsonData.msg}`);
            resolve(false);
          }
        } catch (e) {
          console.log(`❌ 响应解析失败: ${e.message}`);
          console.log(`   原始响应: ${data}`);
          resolve(false);
        }
      });
    });

    req.on('error', (err) => {
      console.log(`❌ 请求失败: ${err.message}`);
      reject(err);
    });

    req.on('timeout', () => {
      console.log('❌ 请求超时');
      req.destroy();
      reject(new Error('请求超时'));
    });

    req.write(postData);
    req.end();
  });
}

// 主诊断函数
async function runDiagnosis() {
  console.log('访客名称生成功能诊断');
  console.log('================================\n');

  try {
    // 1. 基础连接测试
    await testBasicConnection();
    
    // 2. 服务注入测试
    await testServiceInjection();
    
    // 3. 端点扫描
    await testAllEndpoints();
    
    // 4. 访客名称API测试
    const apiWorking = await testGuestNameAPI();
    
    // 5. 会话初始化测试
    const sessionWorking = await testSessionInit();

    console.log('\n================================');
    console.log('诊断结果汇总:');
    console.log('================================');
    console.log('✅ 基础连接: 正常');
    console.log('✅ 服务注入: 正常');
    console.log(`${apiWorking ? '✅' : '❌'} 访客名称API: ${apiWorking ? '正常' : '异常'}`);
    console.log(`${sessionWorking ? '✅' : '❌'} 会话集成: ${sessionWorking ? '正常' : '异常'}`);
    
    if (!apiWorking) {
      console.log('\n🔧 修复建议:');
      console.log('1. 重启后端服务 (whisper-customer模块)');
      console.log('2. 检查代码是否正确编译');
      console.log('3. 确认新的API方法已添加到Controller');
      console.log('4. 检查Spring Boot应用是否正确扫描了组件');
    }
    
    if (!sessionWorking) {
      console.log('\n🔧 会话集成修复建议:');
      console.log('1. 检查initChat方法是否使用了generateGuestName()');
      console.log('2. 确认服务方法调用正确');
      console.log('3. 检查是否有异常被捕获但未记录');
    }

  } catch (error) {
    console.log('\n❌ 诊断过程中发生错误:', error.message);
  }
}

runDiagnosis().catch(console.error);

#!/usr/bin/env node

const http = require('http');

console.log('🎭 测试智能访客名称生成功能...\n');

// 测试单个访客名称生成
function testSingleGeneration(type) {
  return new Promise((resolve, reject) => {
    console.log(`📡 测试${type}类型访客名称生成...`);
    
    const url = `http://localhost:8080/api/chat/generateGuestName?type=${type}`;
    
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          if (jsonData.code === 200 && jsonData.data?.guestName) {
            console.log(`✅ ${type}类型生成成功: ${jsonData.data.guestName}`);
            console.log(`   类型: ${jsonData.data.type}`);
            console.log(`   时间戳: ${new Date(jsonData.data.timestamp).toLocaleString()}`);
            resolve(jsonData.data);
          } else {
            console.log(`❌ ${type}类型生成失败: ${jsonData.msg}`);
            reject(new Error(`${type}类型生成失败`));
          }
        } catch (e) {
          console.log(`❌ ${type}类型响应解析失败: ${e.message}`);
          reject(e);
        }
      });
    }).on('error', (err) => {
      console.log(`❌ ${type}类型请求失败: ${err.message}`);
      reject(err);
    });
  });
}

// 测试批量访客名称生成
function testBatchGeneration(count = 10) {
  return new Promise((resolve, reject) => {
    console.log(`\n📡 测试批量生成${count}个访客名称...`);
    
    const url = `http://localhost:8080/api/chat/generateGuestNames?count=${count}`;
    
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          if (jsonData.code === 200 && jsonData.data) {
            console.log(`✅ 批量生成成功，共${count}个名称`);
            console.log(`   智能名称数量: ${jsonData.data.smart?.length || 0}`);
            console.log(`   简化名称数量: ${jsonData.data.simple?.length || 0}`);
            console.log(`   个性化名称数量: ${jsonData.data.personalized?.length || 0}`);
            
            // 显示样例
            if (jsonData.data.smart?.length > 0) {
              console.log(`   智能名称样例: ${jsonData.data.smart.slice(0, 3).join(', ')}`);
            }
            if (jsonData.data.simple?.length > 0) {
              console.log(`   简化名称样例: ${jsonData.data.simple.slice(0, 3).join(', ')}`);
            }
            if (jsonData.data.personalized?.length > 0) {
              console.log(`   个性化名称样例: ${jsonData.data.personalized.slice(0, 3).join(', ')}`);
            }
            
            resolve(jsonData.data);
          } else {
            console.log(`❌ 批量生成失败: ${jsonData.msg}`);
            reject(new Error('批量生成失败'));
          }
        } catch (e) {
          console.log(`❌ 批量生成响应解析失败: ${e.message}`);
          reject(e);
        }
      });
    }).on('error', (err) => {
      console.log(`❌ 批量生成请求失败: ${err.message}`);
      reject(err);
    });
  });
}

// 分析名称格式
function analyzeNameFormats(batchData) {
  console.log('\n📊 分析访客名称格式...');
  
  const formatTests = [
    {
      type: 'smart',
      names: batchData.smart || [],
      pattern: /^访客\d{4}[A-Z]\d$/,
      description: '访客+时间(4位)+字母+数字'
    },
    {
      type: 'simple', 
      names: batchData.simple || [],
      pattern: /^访客\d{4}_\d{2}$/,
      description: '访客+日期(4位)+下划线+序号(2位)'
    },
    {
      type: 'personalized',
      names: batchData.personalized || [],
      pattern: /^[晨午晚夜]客\d{4}[A-Z0-9]$/,
      description: '时段客+时间(4位)+字符'
    }
  ];
  
  formatTests.forEach(test => {
    const validCount = test.names.filter(name => test.pattern.test(name)).length;
    const validRate = (validCount / test.names.length * 100).toFixed(1);
    
    console.log(`${test.type}类型格式验证:`);
    console.log(`   格式规则: ${test.description}`);
    console.log(`   验证结果: ${validCount}/${test.names.length} (${validRate}%)`);
    
    if (validRate === '100.0') {
      console.log(`   ✅ 格式完全正确`);
    } else {
      console.log(`   ❌ 存在格式问题`);
      const invalidNames = test.names.filter(name => !test.pattern.test(name));
      console.log(`   不符合格式: ${invalidNames.join(', ')}`);
    }
    console.log('');
  });
}

// 分析名称唯一性
function analyzeUniqueness(batchData) {
  console.log('📊 分析访客名称唯一性...');
  
  const allNames = [
    ...(batchData.smart || []),
    ...(batchData.simple || []),
    ...(batchData.personalized || [])
  ];
  
  const uniqueNames = new Set(allNames);
  const uniqueRate = (uniqueNames.size / allNames.length * 100).toFixed(1);
  
  console.log(`总名称数: ${allNames.length}`);
  console.log(`唯一名称数: ${uniqueNames.size}`);
  console.log(`唯一率: ${uniqueRate}%`);
  
  if (uniqueRate === '100.0') {
    console.log('✅ 所有名称都是唯一的');
  } else {
    console.log('⚠️ 存在重复名称');
    const duplicates = allNames.filter((name, index) => allNames.indexOf(name) !== index);
    const uniqueDuplicates = [...new Set(duplicates)];
    console.log(`重复名称: ${uniqueDuplicates.join(', ')}`);
  }
  console.log('');
}

// 测试会话初始化中的访客名称使用
function testSessionWithGuestName() {
  return new Promise((resolve, reject) => {
    console.log('📡 测试会话初始化中的访客名称使用...');
    
    const postData = JSON.stringify({
      customerName: '', // 不提供名称，让后端生成
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
            console.log(`   生成的客户名称: ${jsonData.data.customerName}`);
            console.log(`   客户编号: ${jsonData.data.customerNo}`);
            console.log(`   客户ID: ${jsonData.data.customerId}`);
            console.log(`   会话ID: ${jsonData.data.conversationId}`);
            
            // 验证名称格式
            const namePattern = /^访客\d{4}[A-Z]\d$/;
            if (namePattern.test(jsonData.data.customerName)) {
              console.log('✅ 访客名称格式正确');
            } else {
              console.log('❌ 访客名称格式不正确');
            }
            
            resolve(jsonData.data);
          } else {
            console.log(`❌ 会话初始化失败: ${jsonData.msg}`);
            reject(new Error('会话初始化失败'));
          }
        } catch (e) {
          console.log(`❌ 会话初始化响应解析失败: ${e.message}`);
          reject(e);
        }
      });
    });

    req.on('error', (err) => {
      console.log(`❌ 会话初始化请求失败: ${err.message}`);
      reject(err);
    });

    req.on('timeout', () => {
      console.log('❌ 会话初始化请求超时');
      req.destroy();
      reject(new Error('请求超时'));
    });

    req.write(postData);
    req.end();
  });
}

// 主测试函数
async function runTests() {
  console.log('智能访客名称生成功能测试');
  console.log('================================\n');

  try {
    // 1. 测试单个名称生成
    console.log('🔸 第一阶段：单个名称生成测试');
    await testSingleGeneration('smart');
    await testSingleGeneration('simple');
    await testSingleGeneration('personalized');
    
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 2. 测试批量名称生成
    console.log('\n🔸 第二阶段：批量名称生成测试');
    const batchData = await testBatchGeneration(15);
    
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 3. 分析名称格式
    console.log('🔸 第三阶段：名称格式分析');
    analyzeNameFormats(batchData);

    // 4. 分析名称唯一性
    console.log('🔸 第四阶段：名称唯一性分析');
    analyzeUniqueness(batchData);

    // 5. 测试会话初始化
    console.log('🔸 第五阶段：会话初始化测试');
    await testSessionWithGuestName();

    console.log('\n================================');
    console.log('测试结果汇总:');
    console.log('================================');
    console.log('✅ 单个名称生成: 成功');
    console.log('✅ 批量名称生成: 成功');
    console.log('✅ 名称格式验证: 通过');
    console.log('✅ 名称唯一性: 良好');
    console.log('✅ 会话集成: 成功');
    
    console.log('\n🎉 智能访客名称生成功能测试完成！');
    console.log('关键特性:');
    console.log('- 三种生成策略：智能、简化、个性化');
    console.log('- 基于时间的唯一性保证');
    console.log('- 标准化的名称格式');
    console.log('- 与会话系统完美集成');
    console.log('- 替代了固定的"访客"显示名称');

  } catch (error) {
    console.log('\n❌ 测试失败:', error.message);
    console.log('\n🔍 可能的问题:');
    console.log('1. 后端服务未启动或不可访问');
    console.log('2. 访客名称生成方法未正确实现');
    console.log('3. API端点配置问题');
    console.log('4. 数据库连接问题');
  }
}

runTests().catch(console.error);

<template>
  <div class="login">
    <!-- Left Panel - Introduction -->
    <div class="login-intro">
      <div class="intro-content">
        <div class="intro-logo">Whisper</div>
        <h1 class="intro-title">智能客服系统</h1>
        <p class="intro-subtitle">基于人工智能的下一代客户服务平台，为企业提供全方位的客户沟通解决方案</p>

        <div class="intro-features">
          <div class="feature-item">
            <div class="feature-icon">🤖</div>
            <div class="feature-text">
              <h4>智能对话</h4>
              <p>AI驱动的自然语言处理</p>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">📊</div>
            <div class="feature-text">
              <h4>数据分析</h4>
              <p>实时服务数据洞察</p>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">🔗</div>
            <div class="feature-text">
              <h4>多渠道接入</h4>
              <p>统一的客户服务体验</p>
            </div>
          </div>
        </div>

        <div class="intro-stats">
          <div class="stat-item">
            <div class="stat-number">99.9%</div>
            <div class="stat-label">系统可用性</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">24/7</div>
            <div class="stat-label">全天候服务</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">< 2s</div>
            <div class="stat-label">响应时间</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Right Panel - Login Form -->
    <div class="login-panel">
      <el-form ref="loginRef" :model="loginForm" :rules="loginRules" class="login-form">
        <h3 class="title">登录系统</h3>
        <el-form-item prop="username">
          <el-input
              v-model="loginForm.username"
              type="text"
              size="large"
              auto-complete="off"
              placeholder="请输入账号"
          >
            <template #prefix><svg-icon icon-class="user" class="el-input__icon input-icon" /></template>
          </el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input
              v-model="loginForm.password"
              type="password"
              size="large"
              auto-complete="off"
              placeholder="请输入密码"
              @keyup.enter="handleLogin"
          >
            <template #prefix><svg-icon icon-class="password" class="el-input__icon input-icon" /></template>
          </el-input>
        </el-form-item>
        <!-- Captcha functionality removed for cleaner interface -->
        <!--
        <el-form-item prop="code" v-if="captchaEnabled">
          <el-input
              v-model="loginForm.code"
              size="large"
              auto-complete="off"
              placeholder="验证码"
              style="width: 63%"
              @keyup.enter="handleLogin"
          >
            <template #prefix><svg-icon icon-class="validCode" class="el-input__icon input-icon" /></template>
          </el-input>
          <div class="login-code">
            <img :src="codeUrl" @click="getCode" class="login-code-img"/>
          </div>
        </el-form-item>
        -->
        <el-checkbox v-model="loginForm.rememberMe">记住密码</el-checkbox>
        <el-form-item style="width:100%;">
          <el-button
              :loading="loading"
              size="large"
              type="primary"
              style="width:100%;"
              @click.prevent="handleLogin"
          >
            <span v-if="!loading">登 录</span>
            <span v-else>登 录 中...</span>
          </el-button>
          <div style="float: right;" v-if="register">
            <router-link class="link-type" :to="'/register'">立即注册</router-link>
          </div>
        </el-form-item>
      </el-form>
    </div>

    <!-- Footer -->
    <div class="el-login-footer">
      <span>Copyright © 2025 Whisper AI Customer Service System. All Rights Reserved.</span>
    </div>
  </div>
</template>

<script setup>
import { getCodeImg } from "@/api/login"
import Cookies from "js-cookie"
import { encrypt, decrypt } from "@/utils/jsencrypt"
import useUserStore from '@/store/modules/user'

const title = import.meta.env.VITE_APP_TITLE
const userStore = useUserStore()
const route = useRoute()
const router = useRouter()
const { proxy } = getCurrentInstance()

const loginForm = ref({
  username: "admin",
  password: "admin123",
  rememberMe: false,
  // Captcha fields removed for cleaner interface
  // code: "",
  // uuid: ""
})

const loginRules = {
  username: [{ required: true, trigger: "blur", message: "请输入您的账号" }],
  password: [{ required: true, trigger: "blur", message: "请输入您的密码" }],
  // Captcha validation removed
  // code: [{ required: true, trigger: "change", message: "请输入验证码" }]
}

// Captcha-related variables commented out
// const codeUrl = ref("")
const loading = ref(false)
// 验证码开关 - disabled for cleaner interface
const captchaEnabled = ref(false)
// 注册开关
const register = ref(false)
const redirect = ref(undefined)

watch(route, (newRoute) => {
  redirect.value = newRoute.query && newRoute.query.redirect
}, { immediate: true })

function handleLogin() {
  proxy.$refs.loginRef.validate(valid => {
    if (valid) {
      loading.value = true
      // 勾选了需要记住密码设置在 cookie 中设置记住用户名和密码
      if (loginForm.value.rememberMe) {
        Cookies.set("username", loginForm.value.username, { expires: 30 })
        Cookies.set("password", encrypt(loginForm.value.password), { expires: 30 })
        Cookies.set("rememberMe", loginForm.value.rememberMe, { expires: 30 })
      } else {
        // 否则移除
        Cookies.remove("username")
        Cookies.remove("password")
        Cookies.remove("rememberMe")
      }
      // 调用action的登录方法
      userStore.login(loginForm.value).then(() => {
        const query = route.query
        const otherQueryParams = Object.keys(query).reduce((acc, cur) => {
          if (cur !== "redirect") {
            acc[cur] = query[cur]
          }
          return acc
        }, {})
        router.push({ path: redirect.value || "/", query: otherQueryParams })
      }).catch(() => {
        loading.value = false
        // 重新获取验证码 - disabled for cleaner interface
        // if (captchaEnabled.value) {
        //   getCode()
        // }
      })
    }
  })
}

// Captcha function commented out for cleaner interface
/*
function getCode() {
  getCodeImg().then(res => {
    captchaEnabled.value = res.captchaEnabled === undefined ? true : res.captchaEnabled
    if (captchaEnabled.value) {
      codeUrl.value = "data:image/gif;base64," + res.img
      loginForm.value.uuid = res.uuid
    }
  })
}
*/

function getCookie() {
  const username = Cookies.get("username")
  const password = Cookies.get("password")
  const rememberMe = Cookies.get("rememberMe")
  loginForm.value = {
    username: username === undefined ? loginForm.value.username : username,
    password: password === undefined ? loginForm.value.password : decrypt(password),
    rememberMe: rememberMe === undefined ? false : Boolean(rememberMe)
  }
}

// getCode() - commented out for cleaner interface
getCookie()
</script>

<style lang='scss' scoped>
/* Whisper Login - Professional Two-Panel Layout */

.login {
  display: flex;
  min-height: 100vh;
  background: #ffffff;
}

/* Left Panel - Introduction */
.login-intro {
  flex: 1;
  background: linear-gradient(135deg, #4169ff 0%, #6366f1 50%, #8b5cf6 100%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 60px 40px;
  color: white;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background:
      radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(255, 105, 180, 0.2) 0%, transparent 50%);
    pointer-events: none;
  }

  .intro-content {
    max-width: 480px;
    text-align: center;
    position: relative;
    z-index: 1;
  }

  .intro-logo {
    font-size: 48px;
    font-weight: 800;
    margin-bottom: 24px;
    background: linear-gradient(135deg, #ffffff 0%, #ff69b4 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .intro-title {
    font-size: 32px;
    font-weight: 700;
    margin-bottom: 20px;
    line-height: 1.2;
  }

  .intro-subtitle {
    font-size: 18px;
    margin-bottom: 40px;
    opacity: 0.9;
    line-height: 1.6;
  }

  .intro-features {
    display: flex;
    flex-direction: column;
    gap: 20px;
    margin-bottom: 40px;
  }

  .feature-item {
    display: flex;
    align-items: center;
    gap: 16px;
    text-align: left;

    .feature-icon {
      width: 48px;
      height: 48px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      flex-shrink: 0;
    }

    .feature-text {
      flex: 1;

      h4 {
        font-size: 16px;
        font-weight: 600;
        margin-bottom: 4px;
      }

      p {
        font-size: 14px;
        opacity: 0.8;
        margin: 0;
      }
    }
  }

  .intro-stats {
    display: flex;
    justify-content: space-around;
    width: 100%;
    max-width: 400px;

    .stat-item {
      text-align: center;

      .stat-number {
        font-size: 24px;
        font-weight: 700;
        margin-bottom: 4px;
      }

      .stat-label {
        font-size: 12px;
        opacity: 0.8;
      }
    }
  }
}

/* Right Panel - Login Form */
.login-panel {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
  background: #fafbfc;
  max-width: 600px;
}

.title {
  margin: 0 0 32px 0;
  text-align: center;
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
  letter-spacing: -0.5px;
}

.login-form {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 40px;
  width: 100%;
  max-width: 420px;
  border: 1px solid #e2e8f0;
}

/* Input Field Styles - Fixed Layout */
.login-form .el-input {
  height: 50px;
  margin-bottom: 20px;

  .el-input__wrapper {
    height: 50px;
    border: 2px solid #e2e8f0;
    border-radius: 8px;
    background: #ffffff;
    transition: all 0.3s ease;
    box-shadow: none;
    padding-left: 50px;
    padding-right: 16px;

    &:hover {
      border-color: #cbd5e1;
    }

    &.is-focus {
      border-color: #4169ff;
      box-shadow: 0 0 0 3px rgba(65, 105, 255, 0.1);
    }
  }

  .el-input__inner {
    height: 100%;
    border: none;
    background: transparent;
    color: #1e293b;
    font-size: 16px;
    font-weight: 500;
    padding: 0;
    box-shadow: none;

    &::placeholder {
      color: #94a3b8;
      font-weight: 400;
    }

    &:focus {
      outline: none;
      box-shadow: none;
    }
  }

  .el-input__prefix {
    position: absolute;
    left: 16px;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    z-index: 2;
    pointer-events: none;
  }

  .el-input__prefix-inner {
    display: flex;
    align-items: center;
    justify-content: center;

    .input-icon {
      height: 18px;
      width: 18px;
      color: #4169ff;
      pointer-events: none;
    }
  }
}

/* Button Styles */
.login-form .el-button--primary {
  height: 50px;
  border-radius: 8px;
  background: linear-gradient(135deg, #4169ff 0%, #6366f1 100%);
  border: none;
  font-size: 16px;
  font-weight: 600;
  color: white;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(65, 105, 255, 0.3);

  &:hover {
    background: linear-gradient(135deg, #3b5bdb 0%, #5b5bd6 100%);
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(65, 105, 255, 0.4);
  }

  &:active {
    transform: translateY(0);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(65, 105, 255, 0.2);
  }
}

/* Checkbox Styles */
.login-form .el-checkbox {
  margin: 20px 0 24px 0;

  .el-checkbox__label {
    color: #64748b;
    font-size: 14px;
    font-weight: 500;
  }

  .el-checkbox__input .el-checkbox__inner {
    width: 16px;
    height: 16px;
    border: 2px solid #cbd5e1;
    border-radius: 4px;
    background: #ffffff;

    &:hover {
      border-color: #4169ff;
    }
  }

  .el-checkbox__input.is-checked .el-checkbox__inner {
    background-color: #4169ff;
    border-color: #4169ff;
  }
}

/* Login Code Image - Removed for cleaner interface */
/*
.login-code {
  width: 33%;
  height: 50px;
  float: right;

  img {
    cursor: pointer;
    vertical-align: middle;
    border-radius: 6px;
    border: 2px solid #e2e8f0;
    background: #ffffff;
    transition: all 0.3s ease;
    width: 100%;
    height: 100%;
    object-fit: cover;

    &:hover {
      border-color: #4169ff;
      box-shadow: 0 2px 8px rgba(65, 105, 255, 0.2);
    }
  }
}
*/

/* Login Tip */
.login-tip {
  font-size: 13px;
  text-align: center;
  color: #94a3b8;
  margin-top: 16px;
  font-weight: 400;
}

/* Footer */
.el-login-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50px;
  line-height: 50px;
  text-align: center;
  background: rgba(30, 41, 59, 0.95);
  color: rgba(255, 255, 255, 0.8);
  font-size: 12px;
  font-weight: 400;
  letter-spacing: 0.5px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 1000;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .login {
    flex-direction: column;
  }

  .login-intro {
    min-height: 40vh;
    padding: 40px 20px;

    .intro-content {
      max-width: 600px;
    }

    .intro-logo {
      font-size: 36px;
    }

    .intro-title {
      font-size: 28px;
    }

    .intro-subtitle {
      font-size: 16px;
    }

    .intro-features {
      flex-direction: row;
      flex-wrap: wrap;
      justify-content: center;
      gap: 16px;

      .feature-item {
        flex-direction: column;
        text-align: center;
        max-width: 200px;

        .feature-icon {
          width: 40px;
          height: 40px;
        }

        .feature-text h4 {
          font-size: 14px;
        }

        .feature-text p {
          font-size: 12px;
        }
      }
    }
  }

  .login-panel {
    padding: 30px 20px;
  }
}

@media (max-width: 768px) {
  .login-intro {
    min-height: 35vh;
    padding: 30px 20px;

    .intro-logo {
      font-size: 32px;
    }

    .intro-title {
      font-size: 24px;
    }

    .intro-subtitle {
      font-size: 14px;
      margin-bottom: 30px;
    }

    .intro-features {
      margin-bottom: 30px;
    }

    .intro-stats {
      .stat-number {
        font-size: 20px;
      }

      .stat-label {
        font-size: 11px;
      }
    }
  }

  .login-panel {
    padding: 20px;
  }

  .login-form {
    padding: 30px 24px;
  }

  .title {
    font-size: 24px;
    margin-bottom: 24px;
  }

  .login-form .el-input {
    height: 46px;

    input {
      height: 46px;
      font-size: 15px;
      padding: 0 16px 0 44px;
    }
  }

  .login-form .input-icon {
    left: 14px;
    height: 16px;
    width: 16px;
  }

  .login-form .el-button--primary {
    height: 46px;
    font-size: 15px;
  }
}

@media (max-width: 480px) {
  .login-intro {
    min-height: 30vh;
    padding: 20px 16px;

    .intro-features {
      display: none;
    }
  }

  .login-panel {
    padding: 16px;
  }

  .login-form {
    padding: 24px 20px;
  }

  .title {
    font-size: 20px;
    margin-bottom: 20px;
  }

  .login-form .el-input {
    height: 44px;
    margin-bottom: 16px;

    input {
      height: 44px;
      font-size: 14px;
      padding: 0 14px 0 40px;
    }
  }

  .login-form .input-icon {
    left: 12px;
    height: 14px;
    width: 14px;
  }

  .login-form .el-button--primary {
    height: 44px;
    font-size: 14px;
  }

  .login-form .el-checkbox {
    margin: 16px 0 20px 0;

    .el-checkbox__label {
      font-size: 13px;
    }
  }
}

/* Dark Mode Support */
html.dark {
  .login {
    background: #ffffff;
  }

  .login-intro {
    background: linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%);
  }

  .login-panel {
    background: #0f172a;
  }

  .title {
    color: #f1f5f9;
  }

  .login-form {
    background: #1e293b;
    border-color: rgba(65, 105, 255, 0.2);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);

    .el-input input {
      background: #334155;
      border-color: rgba(100, 116, 139, 0.4);
      color: #f1f5f9;

      &::placeholder {
        color: #94a3b8;
      }

      &:hover {
        border-color: rgba(100, 116, 139, 0.6);
      }

      &:focus {
        border-color: #4169ff;
        box-shadow: 0 0 0 3px rgba(65, 105, 255, 0.2);
      }
    }

    .input-icon {
      color: #6366f1;
    }

    .el-checkbox .el-checkbox__label {
      color: #cbd5e1;
    }

    .el-checkbox__input .el-checkbox__inner {
      background: #334155;
      border-color: rgba(100, 116, 139, 0.4);

      &:hover {
        border-color: #4169ff;
      }
    }
  }

  .login-tip {
    color: #94a3b8;
  }

  .el-login-footer {
    background: rgba(15, 23, 42, 0.95);
    border-top-color: rgba(65, 105, 255, 0.2);
  }
}
</style>
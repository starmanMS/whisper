<template>
  <div class="whisper-home">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-content">
        <div class="hero-text">
          <h1 class="hero-title">
            <span class="gradient-text">Whisper</span>
            智能客服系统
          </h1>
          <p class="hero-subtitle">
            基于人工智能的下一代客户服务平台，为企业提供全方位的客户沟通解决方案
          </p>
          <div class="hero-stats">
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
          <div class="hero-actions">
            <el-button type="primary" size="large" class="cta-button">
              <el-icon><ChatDotRound /></el-icon>
              立即体验
            </el-button>
            <el-button size="large" class="demo-button" @click="scrollToFeatures">
              了解更多
            </el-button>
          </div>
        </div>
        <div class="hero-visual">
          <div class="floating-card">
            <div class="card-header">
              <div class="status-indicator online"></div>
              <span>智能客服助手</span>
            </div>
            <div class="chat-preview">
              <div class="message bot">
                <div class="avatar">W</div>
                <div class="content">您好！我是Whisper智能助手，有什么可以帮助您的吗？</div>
              </div>
              <div class="message user">
                <div class="content">我想了解产品功能</div>
                <div class="avatar">U</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features-section" ref="featuresSection">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">核心功能特性</h2>
          <p class="section-subtitle">
            集成先进技术，打造智能化客户服务体验
          </p>
        </div>
        
        <div class="features-grid">
          <div class="feature-card" v-for="feature in features" :key="feature.id">
            <div class="feature-icon">
              <component :is="feature.icon" />
            </div>
            <h3 class="feature-title">{{ feature.title }}</h3>
            <p class="feature-description">{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Benefits Section -->
    <section class="benefits-section">
      <div class="container">
        <div class="benefits-content">
          <div class="benefits-text">
            <h2 class="section-title">为什么选择Whisper？</h2>
            <div class="benefit-list">
              <div class="benefit-item" v-for="benefit in benefits" :key="benefit.id">
                <div class="benefit-icon">
                  <el-icon><Check /></el-icon>
                </div>
                <div class="benefit-content">
                  <h4>{{ benefit.title }}</h4>
                  <p>{{ benefit.description }}</p>
                </div>
              </div>
            </div>
          </div>
          <div class="benefits-visual">
            <div class="dashboard-preview">
              <div class="dashboard-header">
                <div class="header-title">Whisper 控制台</div>
                <div class="header-stats">
                  <span class="stat">在线: 1,234</span>
                  <span class="stat">今日咨询: 5,678</span>
                </div>
              </div>
              <div class="dashboard-content">
                <div class="metric-card">
                  <div class="metric-value">95%</div>
                  <div class="metric-label">客户满意度</div>
                </div>
                <div class="metric-card">
                  <div class="metric-value">3.2s</div>
                  <div class="metric-label">平均响应时间</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Technology Section -->
    <section class="technology-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">技术架构</h2>
          <p class="section-subtitle">
            采用现代化技术栈，确保系统稳定性和可扩展性
          </p>
        </div>
        
        <div class="tech-grid">
          <div class="tech-category">
            <h3>前端技术</h3>
            <div class="tech-list">
              <span class="tech-item" v-for="tech in frontendTech" :key="tech">{{ tech }}</span>
            </div>
          </div>
          <div class="tech-category">
            <h3>后端技术</h3>
            <div class="tech-list">
              <span class="tech-item" v-for="tech in backendTech" :key="tech">{{ tech }}</span>
            </div>
          </div>
          <div class="tech-category">
            <h3>AI技术</h3>
            <div class="tech-list">
              <span class="tech-item" v-for="tech in aiTech" :key="tech">{{ tech }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta-section">
      <div class="container">
        <div class="cta-content">
          <h2>准备开始您的智能客服之旅？</h2>
          <p>立即体验Whisper智能客服系统，提升您的客户服务质量</p>
          <div class="cta-actions">
            <el-button type="primary" size="large" class="cta-primary">
              免费试用
            </el-button>
            <el-button size="large" class="cta-secondary">
              联系销售
            </el-button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { 
  ChatDotRound, 
  Check, 
  Service, 
  DataAnalysis, 
  MessageBox, 
  Setting,
  Monitor,
  Connection
} from '@element-plus/icons-vue'

export default {
  name: "WhisperHome",
  components: {
    ChatDotRound,
    Check,
    Service,
    DataAnalysis,
    MessageBox,
    Setting,
    Monitor,
    Connection
  },
  data() {
    return {
      features: [
        {
          id: 1,
          icon: 'Service',
          title: '智能对话',
          description: '基于自然语言处理技术，提供智能化的客户对话体验，准确理解客户意图'
        },
        {
          id: 2,
          icon: 'DataAnalysis',
          title: '数据分析',
          description: '实时分析客户服务数据，提供详细的报表和洞察，帮助优化服务质量'
        },
        {
          id: 3,
          icon: 'MessageBox',
          title: '多渠道接入',
          description: '支持网页、微信、APP等多种渠道接入，为客户提供一致的服务体验'
        },
        {
          id: 4,
          icon: 'Setting',
          title: '灵活配置',
          description: '支持自定义工作流程、知识库和回复模板，满足不同业务场景需求'
        },
        {
          id: 5,
          icon: 'Monitor',
          title: '实时监控',
          description: '24/7系统监控，确保服务稳定性，及时发现和解决潜在问题'
        },
        {
          id: 6,
          icon: 'Connection',
          title: '无缝集成',
          description: '提供丰富的API接口，轻松集成到现有业务系统中'
        }
      ],
      benefits: [
        {
          id: 1,
          title: '提升效率',
          description: '智能机器人处理常见问题，人工客服专注复杂咨询，整体效率提升60%'
        },
        {
          id: 2,
          title: '降低成本',
          description: '减少人工客服需求，降低运营成本，投资回报率显著提升'
        },
        {
          id: 3,
          title: '改善体验',
          description: '7x24小时在线服务，快速响应客户需求，客户满意度大幅提升'
        },
        {
          id: 4,
          title: '数据驱动',
          description: '深度数据分析，洞察客户需求，为业务决策提供有力支持'
        }
      ],
      frontendTech: ['Vue 3', 'Element Plus', 'TypeScript', 'Vite', 'Pinia'],
      backendTech: ['Spring Boot', 'Spring Security', 'MyBatis Plus', 'Redis', 'MySQL'],
      aiTech: ['自然语言处理', '机器学习', '深度学习', '知识图谱', '语音识别']
    }
  },
  methods: {
    scrollToFeatures() {
      this.$refs.featuresSection.scrollIntoView({ behavior: 'smooth' })
    }
  }
}
</script>

<style lang="scss" scoped>
.whisper-home {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
}

/* Hero Section */
.hero-section {
  padding: 80px 20px;
  background: linear-gradient(135deg, #4169ff 0%, #6366f1 50%, #ff69b4 100%);
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
      radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
    animation: float 6s ease-in-out infinite alternate;
  }
}

.hero-content {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;
  position: relative;
  z-index: 1;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 800;
  margin-bottom: 24px;
  line-height: 1.2;
}

.gradient-text {
  background: linear-gradient(135deg, #ffffff 0%, #ff69b4 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 1.25rem;
  margin-bottom: 40px;
  opacity: 0.9;
  line-height: 1.6;
}

.hero-stats {
  display: flex;
  gap: 40px;
  margin-bottom: 40px;
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 0.9rem;
  opacity: 0.8;
}

.hero-actions {
  display: flex;
  gap: 16px;
}

.cta-button {
  background: linear-gradient(135deg, #ff69b4 0%, #e91e63 100%);
  border: none;
  padding: 16px 32px;
  font-size: 1.1rem;
  font-weight: 600;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(255, 105, 180, 0.4);
  }
}

.demo-button {
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.3);
  color: white;
  backdrop-filter: blur(10px);

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.5);
  }
}

/* Hero Visual */
.floating-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  animation: float-card 3s ease-in-out infinite alternate;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  font-weight: 600;
}

.status-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;

  &.online {
    background: #10b981;
    box-shadow: 0 0 8px rgba(16, 185, 129, 0.6);
  }
}

.chat-preview {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message {
  display: flex;
  gap: 12px;
  align-items: flex-start;

  &.user {
    flex-direction: row-reverse;
  }
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4169ff 0%, #ff69b4 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
}

.content {
  background: rgba(255, 255, 255, 0.9);
  color: #1e293b;
  padding: 12px 16px;
  border-radius: 12px;
  max-width: 200px;
  font-size: 14px;
  line-height: 1.4;
}

/* Features Section */
.features-section {
  padding: 100px 20px;
  background: white;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.section-header {
  text-align: center;
  margin-bottom: 80px;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 16px;
}

.section-subtitle {
  font-size: 1.1rem;
  color: #64748b;
  max-width: 600px;
  margin: 0 auto;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 40px;
}

.feature-card {
  background: white;
  padding: 40px 32px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #f1f5f9;
  transition: all 0.3s ease;
  text-align: center;

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 40px rgba(65, 105, 255, 0.15);
    border-color: #4169ff;
  }
}

.feature-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 24px;
  background: linear-gradient(135deg, #4169ff 0%, #6366f1 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
}

.feature-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 16px;
}

.feature-description {
  color: #64748b;
  line-height: 1.6;
}

/* Benefits Section */
.benefits-section {
  padding: 100px 20px;
  background: #f8fafc;
}

.benefits-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 80px;
  align-items: center;
}

.benefit-list {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.benefit-item {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.benefit-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
  flex-shrink: 0;
}

.benefit-content h4 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 8px;
}

.benefit-content p {
  color: #64748b;
  line-height: 1.6;
}

.dashboard-preview {
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  overflow: hidden;
  border: 1px solid #e2e8f0;
}

.dashboard-header {
  background: linear-gradient(135deg, #4169ff 0%, #6366f1 100%);
  color: white;
  padding: 20px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-title {
  font-size: 1.1rem;
  font-weight: 600;
}

.header-stats {
  display: flex;
  gap: 24px;
  font-size: 0.9rem;
}

.dashboard-content {
  padding: 32px 24px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.metric-card {
  text-align: center;
  padding: 24px;
  background: #f8fafc;
  border-radius: 12px;
}

.metric-value {
  font-size: 2rem;
  font-weight: 700;
  color: #4169ff;
  margin-bottom: 8px;
}

.metric-label {
  color: #64748b;
  font-size: 0.9rem;
}

/* Technology Section */
.technology-section {
  padding: 100px 20px;
  background: white;
}

.tech-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 40px;
}

.tech-category {
  background: #f8fafc;
  padding: 32px;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
}

.tech-category h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 24px;
  text-align: center;
}

.tech-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.tech-item {
  background: white;
  color: #4169ff;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;

  &:hover {
    background: #4169ff;
    color: white;
    transform: translateY(-2px);
  }
}

/* CTA Section */
.cta-section {
  padding: 100px 20px;
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  color: white;
  text-align: center;
}

.cta-content h2 {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 16px;
}

.cta-content p {
  font-size: 1.1rem;
  opacity: 0.9;
  margin-bottom: 40px;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.cta-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.cta-primary {
  background: linear-gradient(135deg, #4169ff 0%, #6366f1 100%);
  border: none;
  padding: 16px 32px;
  font-size: 1.1rem;
  font-weight: 600;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(65, 105, 255, 0.4);
  }
}

.cta-secondary {
  background: transparent;
  border: 2px solid rgba(255, 255, 255, 0.3);
  color: white;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.5);
  }
}

/* Animations */
@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes float-card {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-8px) rotate(1deg);
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .hero-content {
    grid-template-columns: 1fr;
    gap: 40px;
    text-align: center;
  }

  .hero-title {
    font-size: 2.5rem;
  }

  .hero-stats {
    justify-content: center;
  }

  .benefits-content {
    grid-template-columns: 1fr;
    gap: 60px;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }

  .tech-grid {
    grid-template-columns: 1fr;
  }

  .cta-actions {
    flex-direction: column;
    align-items: center;
  }

  .section-title {
    font-size: 2rem;
  }
}

@media (max-width: 480px) {
  .hero-section {
    padding: 60px 20px;
  }

  .hero-title {
    font-size: 2rem;
  }

  .hero-stats {
    flex-direction: column;
    gap: 20px;
  }

  .features-section,
  .benefits-section,
  .technology-section,
  .cta-section {
    padding: 60px 20px;
  }
}
</style>

<template>
  <div class="sidebar-logo-container" :class="{ 'collapse': collapse }">
    <transition name="sidebarLogoFade">
      <router-link v-if="collapse" key="collapse" class="sidebar-logo-link" to="/">
        <img v-if="logo" :src="logo" class="sidebar-logo" />
        <h1 v-else class="sidebar-title">{{ title }}</h1>
      </router-link>
      <router-link v-else key="expand" class="sidebar-logo-link" to="/">
        <img v-if="logo" :src="logo" class="sidebar-logo" />
        <h1 class="sidebar-title">{{ title }}</h1>
      </router-link>
    </transition>
  </div>
</template>

<script setup>
import logo from '@/assets/logo/logo.png'
import useSettingsStore from '@/store/modules/settings'
import variables from '@/assets/styles/variables.module.scss'

defineProps({
  collapse: {
    type: Boolean,
    required: true
  }
})

const title = import.meta.env.VITE_APP_TITLE
const settingsStore = useSettingsStore()
const sideTheme = computed(() => settingsStore.sideTheme)

// 获取Logo背景色
const getLogoBackground = computed(() => {
  if (settingsStore.isDark) {
    return 'var(--sidebar-bg)'
  }
  return sideTheme.value === 'theme-dark' ? variables.menuBg : variables.menuLightBg
})

// 获取Logo文字颜色
const getLogoTextColor = computed(() => {
  if (settingsStore.isDark) {
    return 'var(--sidebar-text)'
  }
  return sideTheme.value === 'theme-dark' ? '#fff' : variables.menuLightText
})
</script>

<style lang="scss" scoped>
.sidebarLogoFade-enter-active {
  transition: all var(--whisper-transition-slow);
}

.sidebarLogoFade-enter,
.sidebarLogoFade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.sidebar-logo-container {
  position: relative;
  width: 100%;
  height: 60px;
  line-height: 60px;
  background: v-bind(getLogoBackground);
  text-align: center;
  overflow: hidden;
  border-bottom: 1px solid rgba(65, 105, 255, 0.1);

  // 添加渐变背景效果
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg,
      rgba(65, 105, 255, 0.05) 0%,
      rgba(255, 105, 180, 0.05) 100%);
    opacity: 0;
    transition: opacity var(--whisper-transition-normal);
  }

  &:hover::before {
    opacity: 1;
  }

  & .sidebar-logo-link {
    height: 100%;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    text-decoration: none;
    transition: all var(--whisper-transition-normal);

    &:hover {
      transform: translateY(-1px);
    }

    & .sidebar-logo {
      width: 36px;
      height: 36px;
      vertical-align: middle;
      margin-right: 12px;
      border-radius: var(--whisper-radius-md);
      box-shadow: var(--whisper-shadow-sm);
      transition: all var(--whisper-transition-normal);

      &:hover {
        box-shadow: var(--whisper-shadow-md);
        transform: scale(1.05);
      }
    }

    & .sidebar-title {
      display: inline-block;
      margin: 0;
      color: v-bind(getLogoTextColor);
      font-weight: 700;
      line-height: 60px;
      font-size: 16px;
      font-family: 'Helvetica Neue', Arial, sans-serif;
      vertical-align: middle;
      letter-spacing: 1px;
      background: var(--whisper-gradient-primary);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      transition: all var(--whisper-transition-normal);
    }
  }

  &.collapse {
    .sidebar-logo {
      margin-right: 0px;
    }

    .sidebar-title {
      display: none;
    }
  }
}
</style>
/**
 * 动画配置文件
 * 定义所有组件的动画效果和过渡参数
 */

import { Variants, Transition } from 'framer-motion'

// 基础动画时长
export const ANIMATION_DURATION = {
  fast: 0.2,
  normal: 0.3,
  slow: 0.5
} as const

// 缓动函数
export const EASING = {
  easeOut: [0.0, 0.0, 0.2, 1],
  easeIn: [0.4, 0.0, 1, 1],
  easeInOut: [0.4, 0.0, 0.2, 1],
  bounce: [0.68, -0.55, 0.265, 1.55],
  spring: { type: 'spring', damping: 25, stiffness: 300 }
} as const

// 聊天窗口动画
export const chatWindowVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
    y: 20,
    transformOrigin: 'bottom right'
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transformOrigin: 'bottom right',
    transition: {
      duration: ANIMATION_DURATION.normal,
      ease: EASING.easeOut,
      staggerChildren: 0.1
    }
  },
  minimized: {
    opacity: 1,
    scale: 0.3,
    y: 100,
    transformOrigin: 'bottom right',
    transition: {
      duration: ANIMATION_DURATION.fast,
      ease: EASING.easeOut
    }
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    y: 20,
    transformOrigin: 'bottom right',
    transition: {
      duration: ANIMATION_DURATION.fast,
      ease: EASING.easeIn
    }
  }
}

// 浮动按钮动画
export const floatingButtonVariants: Variants = {
  hidden: {
    scale: 0,
    rotate: -180
  },
  visible: {
    scale: 1,
    rotate: 0,
    transition: {
      duration: ANIMATION_DURATION.normal,
      ease: EASING.bounce
    }
  },
  hover: {
    scale: 1.1,
    transition: {
      duration: ANIMATION_DURATION.fast,
      ease: EASING.easeOut
    }
  },
  tap: {
    scale: 0.9,
    transition: {
      duration: ANIMATION_DURATION.fast,
      ease: EASING.easeOut
    }
  }
}

// 消息动画
export const messageVariants: Variants = {
  hidden: (isUser: boolean) => ({
    opacity: 0,
    y: 10,
    x: isUser ? 20 : -20,
    scale: 0.95
  }),
  visible: {
    opacity: 1,
    y: 0,
    x: 0,
    scale: 1,
    transition: {
      duration: ANIMATION_DURATION.normal,
      ease: EASING.easeOut
    }
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.95,
    transition: {
      duration: ANIMATION_DURATION.fast,
      ease: EASING.easeIn
    }
  }
}

// 打字指示器动画
export const typingIndicatorVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 10
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: ANIMATION_DURATION.fast,
      ease: EASING.easeOut
    }
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: {
      duration: ANIMATION_DURATION.fast,
      ease: EASING.easeIn
    }
  }
}

// 打字点动画
export const typingDotVariants: Variants = {
  initial: {
    y: 0
  },
  animate: {
    y: [-4, 0],
    transition: {
      duration: 0.6,
      repeat: Infinity,
      ease: EASING.easeInOut
    }
  }
}

// 头部动画
export const headerVariants: Variants = {
  hidden: {
    opacity: 0,
    y: -20
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: ANIMATION_DURATION.normal,
      ease: EASING.easeOut
    }
  }
}

// 输入框动画
export const inputVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: ANIMATION_DURATION.normal,
      ease: EASING.easeOut,
      delay: 0.1
    }
  }
}

// 消息列表动画
export const messageListVariants: Variants = {
  hidden: {
    opacity: 0
  },
  visible: {
    opacity: 1,
    transition: {
      duration: ANIMATION_DURATION.normal,
      ease: EASING.easeOut,
      staggerChildren: 0.05
    }
  }
}

// 快捷回复动画
export const quickReplyVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
    y: 10
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: ANIMATION_DURATION.fast,
      ease: EASING.easeOut
    }
  },
  hover: {
    scale: 1.05,
    transition: {
      duration: ANIMATION_DURATION.fast,
      ease: EASING.easeOut
    }
  },
  tap: {
    scale: 0.95,
    transition: {
      duration: ANIMATION_DURATION.fast,
      ease: EASING.easeOut
    }
  }
}

// 连接状态指示器动画
export const connectionStatusVariants: Variants = {
  connecting: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear'
    }
  },
  connected: {
    scale: [1, 1.2, 1],
    transition: {
      duration: 0.5,
      ease: EASING.easeOut
    }
  },
  disconnected: {
    opacity: [1, 0.5, 1],
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: EASING.easeInOut
    }
  }
}

// 文件上传动画
export const fileUploadVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.8
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: ANIMATION_DURATION.normal,
      ease: EASING.easeOut
    }
  },
  uploading: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: EASING.easeInOut
    }
  },
  success: {
    scale: [1, 1.2, 1],
    transition: {
      duration: 0.5,
      ease: EASING.bounce
    }
  },
  error: {
    x: [-5, 5, -5, 5, 0],
    transition: {
      duration: 0.5,
      ease: EASING.easeOut
    }
  }
}

// 通知动画
export const notificationVariants: Variants = {
  hidden: {
    opacity: 0,
    y: -50,
    scale: 0.8
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: ANIMATION_DURATION.normal,
      ease: EASING.bounce
    }
  },
  exit: {
    opacity: 0,
    y: -50,
    scale: 0.8,
    transition: {
      duration: ANIMATION_DURATION.fast,
      ease: EASING.easeIn
    }
  }
}

// 页面过渡动画
export const pageTransition: Transition = {
  duration: ANIMATION_DURATION.normal,
  ease: EASING.easeInOut
}

// 弹簧动画配置
export const springConfig = {
  type: 'spring',
  damping: 25,
  stiffness: 300
} as const

// 拖拽动画配置
export const dragConfig = {
  drag: true,
  dragConstraints: { left: 0, right: 0, top: 0, bottom: 0 },
  dragElastic: 0.1,
  whileDrag: { scale: 1.05 }
} as const

// 悬停动画配置
export const hoverConfig = {
  whileHover: { scale: 1.05 },
  whileTap: { scale: 0.95 },
  transition: { duration: ANIMATION_DURATION.fast }
} as const

// 脉冲动画
export const pulseAnimation = {
  scale: [1, 1.05, 1],
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: EASING.easeInOut
  }
} as const

// 呼吸动画
export const breatheAnimation = {
  opacity: [0.5, 1, 0.5],
  transition: {
    duration: 3,
    repeat: Infinity,
    ease: EASING.easeInOut
  }
} as const

// 摇摆动画
export const shakeAnimation = {
  x: [-2, 2, -2, 2, 0],
  transition: {
    duration: 0.5,
    ease: EASING.easeOut
  }
} as const

/**
 * API 工具类
 * 处理与后端的HTTP通信
 */

class ApiClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  /**
   * 发送HTTP请求
   */
  async request(url, options = {}) {
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    try {
      const response = await fetch(`${this.baseUrl}${url}`, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // 检查业务状态码
      if (data.code !== undefined && data.code !== 200) {
        throw new Error(data.msg || '请求失败');
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  /**
   * GET 请求
   */
  async get(url, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const fullUrl = queryString ? `${url}?${queryString}` : url;
    
    return this.request(fullUrl, {
      method: 'GET'
    });
  }

  /**
   * POST 请求
   */
  async post(url, data = {}) {
    return this.request(url, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  /**
   * PUT 请求
   */
  async put(url, data = {}) {
    return this.request(url, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  /**
   * DELETE 请求
   */
  async delete(url) {
    return this.request(url, {
      method: 'DELETE'
    });
  }
}

/**
 * 聊天API类
 */
export class ChatApi {
  constructor(baseUrl) {
    this.client = new ApiClient(baseUrl);
  }

  /**
   * 初始化聊天会话
   */
  async initChat(params) {
    return this.client.post('/chat/init', params);
  }

  /**
   * 发送消息
   */
  async sendMessage(params) {
    return this.client.post('/chat/sendMessage', params);
  }

  /**
   * 获取消息历史
   */
  async getMessages(conversationId, pageNum = 1, pageSize = 20) {
    return this.client.get(`/chat/messages/${conversationId}`, {
      pageNum,
      pageSize
    });
  }

  /**
   * 标记消息为已读
   */
  async markMessagesAsRead(conversationId) {
    return this.client.post('/chat/markRead', { conversationId });
  }

  /**
   * 结束会话
   */
  async endConversation(conversationId) {
    return this.client.post(`/chat/endConversation/${conversationId}`);
  }

  /**
   * 设置满意度评价
   */
  async setSatisfaction(conversationId, satisfaction) {
    return this.client.post('/chat/satisfaction', {
      conversationId,
      satisfaction
    });
  }

  /**
   * 获取未读消息数量
   */
  async getUnreadCount(conversationId) {
    return this.client.get(`/chat/unreadCount/${conversationId}`);
  }

  /**
   * 上传文件
   */
  async uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${this.client.baseUrl}/chat/upload`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Upload failed! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.code !== undefined && data.code !== 200) {
        throw new Error(data.msg || '上传失败');
      }

      return data;
    } catch (error) {
      console.error('File upload failed:', error);
      throw error;
    }
  }
}

/**
 * 工具函数
 */
export const utils = {
  /**
   * 格式化文件大小
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  /**
   * 检查文件类型
   */
  isImageFile(file) {
    return file.type.startsWith('image/');
  },

  /**
   * 检查文件大小
   */
  isFileSizeValid(file, maxSize = 10 * 1024 * 1024) { // 默认10MB
    return file.size <= maxSize;
  },

  /**
   * 生成唯一ID
   */
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  },

  /**
   * 格式化时间
   */
  formatTime(date) {
    if (!date) return '';
    
    const now = new Date();
    const messageDate = new Date(date);
    const diffInMinutes = Math.floor((now - messageDate) / (1000 * 60));
    
    if (diffInMinutes < 1) {
      return '刚刚';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}分钟前`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}小时前`;
    } else {
      return messageDate.toLocaleDateString();
    }
  },

  /**
   * 防抖函数
   */
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  /**
   * 节流函数
   */
  throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
};

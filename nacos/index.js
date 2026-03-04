/**
 * Nacos 配置中心 API Client
 * 
 * 基于 Nacos OpenAPI 规范实现
 * 文档：https://nacos.io/zh-cn/docs/open-api.html
 * 
 * @requires NACOS_URL - Nacos 服务器地址 (e.g., http://nacos.8slan.com)
 * @requires NACOS_USERNAME - Nacos 用户名
 * @requires NACOS_PASSWORD - Nacos 密码
 * 
 */

const http = require('http');
const { URL } = require('url');

// Environment configuration
const NACOS_URL = process.env.NACOS_URL || '';
const NACOS_USERNAME = process.env.NACOS_USERNAME || '';
const NACOS_PASSWORD = process.env.NACOS_PASSWORD || '';

// Cached access token
let cachedToken = null;
let tokenExpireTime = 0;

/**
 * Make HTTP request to Nacos API
 * @private
 */
function request(method, path, data = null, queryParams = {}) {
  return new Promise((resolve, reject) => {
    if (!NACOS_URL) {
      reject(new Error('NACOS_URL environment variable is not set'));
      return;
    }

    // Build query string
    const queryParts = [];
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined && value !== null) {
        queryParts.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
      }
    }
    // Add accessToken if available
    if (cachedToken && Date.now() < tokenExpireTime) {
      queryParts.push(`accessToken=${cachedToken}`);
    }
    const queryString = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';

    const url = new URL(path + queryString, NACOS_URL);
    const isHttps = url.protocol === 'https:';
    const lib = isHttps ? https : http;

    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    };

    const req = lib.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          // Try to parse as JSON
          const response = JSON.parse(responseData);
          
          if (res.statusCode >= 400) {
            const error = new Error(response.message || response.errorMsg || `HTTP ${res.statusCode}`);
            error.statusCode = res.statusCode;
            error.response = response;
            reject(error);
          } else {
            resolve(response);
          }
        } catch (e) {
          // Return raw text if not JSON
          resolve(responseData);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(data);
    }

    req.end();
  });
}

// For HTTPS support
let https;
try {
  https = require('https');
} catch (e) {
  https = http;
}

/**
 * 登录获取 accessToken
 * @returns {Promise<{accessToken: string, tokenExpireTime: number}>}
 */
async function login() {
  if (!NACOS_USERNAME || !NACOS_PASSWORD) {
    throw new Error('NACOS_USERNAME and NACOS_PASSWORD must be set');
  }

  const data = `username=${encodeURIComponent(NACOS_USERNAME)}&password=${encodeURIComponent(NACOS_PASSWORD)}`;
  
  const response = await request('POST', '/nacos/v1/auth/login', data);
  
  if (response.accessToken) {
    cachedToken = response.accessToken;
    // Default token expires in 1 hour (adjust based on server config)
    tokenExpireTime = Date.now() + (response.tokenExpireTime || 18000) * 1000;
    return {
      accessToken: response.accessToken,
      tokenExpireTime: response.tokenExpireTime
    };
  }
  
  throw new Error('Login failed: ' + JSON.stringify(response));
}

/**
 * 获取 accessToken（自动登录或使用缓存）
 * @private
 */
async function getToken() {
  if (cachedToken && Date.now() < tokenExpireTime) {
    return cachedToken;
  }
  const result = await login();
  return result.accessToken;
}

/**
 * 查询配置列表
 * @param {Object} options
 * @param {string} options.search - 搜索模式: accurate(精确) 或 regex(正则)
 * @param {string} options.dataId - dataId
 * @param {string} options.group - 分组
 * @param {number} options.pageNo - 页码
 * @param {number} options.pageSize - 每页数量
 * @returns {Promise<Object>}
 */
async function getConfigs(options = {}) {
  const token = await getToken();
  
  const queryParams = {
    pageNo: options.pageNo || 1,
    pageSize: options.pageSize || 100,
    accessToken: token
  };
  
  if (options.search) {
    queryParams.search = options.search;
  }
  if (options.dataId) {
    queryParams.dataId = options.dataId;
  }
  if (options.group) {
    queryParams.group = options.group;
  }
  
  return request('GET', '/nacos/v1/cs/configs', null, queryParams);
}

/**
 * 获取单个配置详情
 * @param {Object} options
 * @param {string} options.dataId - dataId
 * @param {string} options.group - 分组
 * @returns {Promise<string>} 配置内容
 */
async function getConfigDetail(options = {}) {
  const token = await getToken();
  
  const queryParams = {
    dataId: options.dataId,
    group: options.group || 'DEFAULT_GROUP',
    accessToken: token
  };
  
  return request('GET', '/nacos/v1/cs/configs', null, queryParams);
}

/**
 * 发布配置
 * @param {Object} options
 * @param {string} options.dataId - dataId
 * @param {string} options.group - 分组
 * @param {string} options.content - 配置内容
 * @param {string} options.type - 配置类型 (yaml, json, xml, etc.)
 * @returns {Promise<Object>}
 */
async function publishConfig(options = {}) {
  const token = await getToken();
  
  const data = new URLSearchParams({
    dataId: options.dataId,
    group: options.group || 'DEFAULT_GROUP',
    content: options.content,
    accessToken: token
  });
  
  if (options.type) {
    data.append('type', options.type);
  }
  
  return request('POST', '/nacos/v1/cs/configs', data.toString());
}

/**
 * 删除配置
 * @param {Object} options
 * @param {string} options.dataId - dataId
 * @param {string} options.group - 分组
 * @returns {Promise<Object>}
 */
async function deleteConfig(options = {}) {
  const token = await getToken();
  
  const queryParams = {
    dataId: options.dataId,
    group: options.group || 'DEFAULT_GROUP',
    accessToken: token
  };
  
  return request('DELETE', '/nacos/v1/cs/configs', null, queryParams);
}

/**
 * 便捷方法: 发布配置（简洁写法）
 * @param {string} dataId - dataId
 * @param {string} content - 配置内容
 * @param {string} group - 分组（可选）
 */
async function publish(dataId, content, group = 'DEFAULT_GROUP') {
  return publishConfig({ dataId, group, content });
}

/**
 * 获取服务列表
 * @param {Object} options
 * @param {number} options.pageNo - 页码
 * @param {number} options.pageSize - 每页数量
 * @returns {Promise<Object>}
 */
async function getServices(options = {}) {
  const token = await getToken();
  
  const queryParams = {
    pageNo: options.pageNo || 1,
    pageSize: options.pageSize || 100,
    accessToken: token
  };
  
  return request('GET', '/nacos/v1/ns/instance/list', null, queryParams);
}

/**
 * 注册服务实例
 * @param {Object} options
 * @param {string} options.serviceName - 服务名
 * @param {string} options.ip - IP 地址
 * @param {number} options.port - 端口
 * @param {string} options.healthy - 健康状态
 * @param {Object} options.metadata - 元数据
 */
async function registerInstance(options = {}) {
  const token = await getToken();
  
  const data = new URLSearchParams({
    serviceName: options.serviceName,
    ip: options.ip,
    port: options.port,
    healthy: options.healthy !== false,
    accessToken: token
  });
  
  if (options.metadata) {
    data.append('metadata', JSON.stringify(options.metadata));
  }
  
  return request('POST', '/nacos/v1/ns/instance', data.toString());
}

/**
 * 注销服务实例
 * @param {Object} options
 * @param {string} options.serviceName - 服务名
 * @param {string} options.ip - IP 地址
 * @param {number} options.port - 端口
 */
async function deregisterInstance(options = {}) {
  const token = await getToken();
  
  const queryParams = {
    serviceName: options.serviceName,
    ip: options.ip,
    port: options.port,
    accessToken: token
  };
  
  return request('DELETE', '/nacos/v1/ns/instance', null, queryParams);
}

module.exports = {
  login,
  getConfigs,
  getConfigDetail,
  publishConfig,
  deleteConfig,
  publish,
  getServices,
  registerInstance,
  deregisterInstance
};

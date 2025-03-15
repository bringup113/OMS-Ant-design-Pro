/**
 * @name 代理的配置
 * @description 可以让你的本地服务器代理到你的服务器上，这样你就可以访问服务器的数据了
 * @see 要注意以下 代理只能在本地开发时使用，build 之后就无法使用了。
 * @doc 代理介绍 https://umijs.org/docs/guides/proxy
 */
export default {
  dev: {
    // localhost:8000/api/** -> https://preview.pro.ant.design/api/**
    '/api/': {
      // 要代理的地址
      target: 'http://localhost:3000',
      // 配置了这个可以从 http 代理到 https
      // 依赖 origin 的功能可能需要这个，比如 cookie
      changeOrigin: true,
    },
  },
  /**
   * @name 详细的代理配置
   * @doc https://github.com/chimurai/http-proxy-middleware
   */
  test: {
    // localhost:8000/api/** -> https://preview.pro.ant.design/api/**
    '/api/': {
      target: 'http://localhost:3000',
      changeOrigin: true,
      pathRewrite: { '^': '' },
    },
  },
  pre: {
    '/api/': {
      target: 'http://localhost:3000',
      changeOrigin: true,
      pathRewrite: { '^': '' },
    },
  },
};

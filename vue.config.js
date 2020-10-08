// CommonJS语法
module.exports = {
        devServer: {
                open: true,  // 让webpack-dev-server 自动打开浏览器
                proxy: {
                        '/': { target: 'http://localhost:3001' }
                }
        },
};
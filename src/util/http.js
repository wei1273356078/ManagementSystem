import { MessageBox, Message, Loading } from 'element-ui'
import router from '../router';
import axios from 'axios';

// 创建一个公用的永远是pending的Promise来应对ajax中所有的错误情况，这样可以让组件代码更加优雅
const alwaysPendingPromise = new Promise(() => {});
// 创建实例axios
const instance = axios.create();
// 创建一个Loading实例变量
let loadingInstance = null;
let loadingAjaxCount = 0;  // 记录当下处于loading状态的ajax的个数，主要解决同时发起多个ajax、loading打开关闭混乱的问题
function beginAjax(){
        if(loadingAjaxCount === 0) {
                loadingInstance = Loading.service({
                        lock: true,
                        text: 'Loading',
                        spinner: 'el-icon-loading',
                        background: 'rgba(0, 0, 0, 0.7)'
                })     // 开启Loading效果
        }
        loadingAjaxCount++;
}
function endAJax(){
        // 关闭loading效果
        if(loadingAjaxCount === 1) {
                loadingInstance.close();
                loadingInstance = null;
        }
        loadingAjaxCount--;
}


// 设置请求拦截器
instance.interceptors.request.use(
        config => {
                config.headers = {
                        'Authorization': sessionStorage.getItem('token')
                };
                beginAjax();
                return config;
        },
        error => {
                // 关闭loading效果
                endAJax()
                MessageBox.alert(error.message, '提示', { type: 'error' });
                return alwaysPendingPromise;
        }
);

// 设置响应拦截器
instance.interceptors.response.use(
        async response => {
                // 设置0.5
                await new Promise(resolve => {
                        setTimeout(() => {resolve()}, 500);
                })
                // 关闭loading效果
                endAJax()
                if(response.status === 200) {
                        let {status, data, message} = response.data;
                        switch (status) {
                                case 200:
                                        // 如果响应头的authorization中包含最新的token，更新到Cookies的token键中
                                        // if(response.headers.authorization) sessionStorage.setItem('token', response.headers.authorization);
                                        if(message) Message({ type: 'success', message });
                                        return data;
                                case 401:
                                        sessionStorage.removeItem('token');
                                        router.replace('/login');
                                        // router.replace({
                                        //         path: '/login',
                                        //         query: {
                                        //                 back: router.currentRoute.fullPath
                                        //         }
                                        // });
                                case 199:
                                case 404:
                                case 500:
                                        if(message) MessageBox.alert(message, '提示', { type: 'error' });
                                        return alwaysPendingPromise;
                        }
                }else {
                        MessageBox.alert(response.status, '提示', { type: 'error' })
                }
        },
        error => {
                // 关闭loading效果
                endAJax()
                MessageBox.alert(error, '提示', {type: 'error'} );
                // 出错，一直让promise保持挂起状态（为了不写catch）
                return alwaysPendingPromise;
        }
);

// 导出实例axios
export default instance;
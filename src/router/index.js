import Vue from 'vue';
import VueRouter from 'vue-router';
import Home from '../pages/home';
import Login from '../pages/login';

// 让所有组件可以无条件的使用router-view和router-link组件
// 让所有组件可以无条件的使用$router和$route访问路由
Vue.use(VueRouter);

const router = new VueRouter({
        routes: [
                {
                        path: '/',
                        redirect: '/login'
                },
                {
                        path: '/login',
                        component: Login
                },
                {
                        path: '/home',
                        component: Home
                }
        ],
})

router.beforeEach((to, from, next) => {
        if(to.path === '/home' && !sessionStorage.getItem('token')) {
                next({ path: '/login', replace: true });
        }else next();
})

export default router;
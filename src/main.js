import Vue from 'vue';
import App from './App.vue';
import router from './router';
import axios from './util/http';
import store from './store'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import './assets/reset.css';
import './assets/public.css';

Vue.use(ElementUI);
Vue.prototype.$axios = axios;


new Vue({
        components: {
                App
        },
        // render: function(createElement){
        //      return createElement(App);
        // },
        render: h => h(App),
        router,
        store
}).$mount('#app');
import Vue from 'vue';
// 导入仓库
import Vuex from 'vuex';
import http from '../util/http.js';
// 导入子仓库
import role from './role.js';
import func from './func.js';

// 在Vue中使用Vuex
// 让所有组件可以无条件的使用$store来访问仓库对象
Vue.use(Vuex);
// 创建仓库对象
const store = new Vuex.Store({
        // 总仓库一般用来存放子仓库中公用的东西
        state: {
                // name: 'Vuex'
                http
        },
        // 只有mutations节点中的方法才可以修改state中的数据
        // mutations中的方法不能包含异步耗时的代码，只能包含同步代码
        // mutations中的方法在调用时，第一个参数总是state节点本身，第二个参数才是调用实际传递的参数
        // state形参总是访问是自身层级仓库的state节点中的数据
        // 想要访问mutations节点中的方法，必须使用commit提交的方式访问
        mutations: {
                // changeName(state, { payload }) {
                //         state.name = payload;
                // },
        },
        getters: {},
        actions: {},
        modules: {
                role,
                func
        }
});



// 导出仓库对象
export default store;
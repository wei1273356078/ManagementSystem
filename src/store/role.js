import { RoleApi } from '@/util/api.js';
export default {
        namespaced: true,
        state: {
                list: [],
                isInit: false,  // 标识角色数据list是否已经初始化
        },
        mutations: {
                _init(state, {payload}){
                        state.list = payload;
                        state.isInit = true;
                },
                _beginAdd(state, role) {
                        state.list.push(role);
                },
                _beginUpdate(state, role) {
                        let i = state.list.findIndex(item => item.role_id === role.role_id);
                        state.list.splice(i, 1, role);
                },
                _remove(state, role_id) {
                        let i = state.list.findIndex(item => item.role_id === role_id);
                        state.list.splice(i, 1);
                }
        },
        getters: {},
        actions: {
                // 深层解构
                async init({rootState: { http }, commit, state}){
                        if(state.isInit) return;
                        const data = await RoleApi.all();
                        commit('_init', {payload: data});
                },
                // 默认总是返回一个成功的promise对象
                async remove({ commit }, role_id) {
                        await RoleApi.remove(role_id);
                        commit('_remove', role_id);
                },
                async add({ commit }, role) {
                        role.role_id = await RoleApi.add(role);
                        commit('_beginAdd', role);
                },
                async update({ commit }, role) {
                        await RoleApi.update(role);
                        commit('_beginUpdate', role);
                },
        },
        modules: {}
}
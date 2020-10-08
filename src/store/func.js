import { FuncApi } from '@/util/api.js';
export default {
        namespaced: true,
        state: {
                list: [],
                isInit: false
        },
        mutations: {
                _init(state, { payload }) {
                        state.list = payload;
                        state.isInit = true;
                },
                _add(state, { payload }) {
                        state.list.push(payload);
                },
                _update(state, { payload }) {
                        let i = state.list.findIndex(item => item.func_id === payload.func_id);
                        state.list.splice(i, 1, payload);
                },
                _remove(state, { payload }) {
                        let i = state.list.findIndex(item => item.func_id === payload.func_id);
                        state.list.splice(i, 1);
                }
        },
        getters: {},
        actions: {
                async init({ commit, state }) {
                        if(state.isInit) return;
                        const data = await FuncApi.all();
                        commit('_init', { payload: data });
                },
                async add({ commit }, { payload }) {
                        payload.func_id = await FuncApi.add(payload)
                        commit('_add', { payload });
                },
                async update({ commit }, { payload }) {
                        await FuncApi.update(payload);
                        commit('_update', { payload });
                },
                async remove({ commit }, { payload }) {
                        await FuncApi.remove(payload.func_id);
                        commit('_remove', { payload });
                }
        }
};
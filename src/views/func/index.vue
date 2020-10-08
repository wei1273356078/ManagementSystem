<template>
	<div>
		<el-tree :data="treeData" class="custom-tree"
		         :default-expand-all="true"
		         :expand-on-click-node="false"
		>
			<span slot-scope="{ node, data }" class="content">
				<span>
					<i v-if="data.func_key" class="el-icon-menu" style="margin-right: 10px; color: rgb(64,158,255);"></i>
					<span>{{ data.func_name }}</span>
				</span>
				<span class="icon-right">
					<el-button type="text" class="el-icon-plus" v-if="data.func_key === ''" @click="beginAdd(data)"></el-button>
					<el-button type="text" class="el-icon-edit-outline" v-if="data.func_id !== 0" @click="beginUpdate(data)"></el-button>
					<el-button type="text" class="el-icon-delete" v-if="[0,75,76].indexOf(data.func_id) === -1" @click="remove(data)" :disabled="!!data.children"></el-button>
				</span>
			</span>
		</el-tree>
		<el-dialog :modal="false" title="功能管理" :visible="edit.isEdit" :show-close="false">
			<el-form label-width="100px" status-icon :model="edit.model" :rules="edit.validRules" ref="form">
				<el-form-item label="功能类型">
					<el-radio-group v-model="edit.isLeaf"
						:disabled="!(edit.mode && edit.model.func_fid === 0)"
					>
						<el-radio :label="false">非叶子组件</el-radio>
						<el-radio :label="true">叶子组件</el-radio>
					</el-radio-group>
				</el-form-item>
				<el-form-item label="父级功能">
					<el-select v-model="edit.model.func_fid" :disabled="!(edit.isLeaf && !edit.mode)">
						<el-option :value="0" label="Root"></el-option>
						<el-option
							v-for="item in $store.state.func.list.filter(item => item.func_key === '')"
							:key="item.func_id"
							:value="item.func_id"
							:label="item.func_name"
						></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="功能名称" prop="func_name">
					<el-input v-model.trim="edit.model.func_name"></el-input>
				</el-form-item>
				<el-form-item label="功能对应组件" v-show="edit.isLeaf" prop="func_key">
					<el-select v-model="edit.model.func_key">
						<el-option
							v-for="(value, key) in Views"
							:key="key"
							:value="key"
							:label="value.name"
							:disabled="$store.state.func.list.some(item => item.func_key === key)"
						></el-option>
					</el-select>
				</el-form-item>
			</el-form>
			<template slot="footer">
				<el-button type="primary" @click="save">确认</el-button>
				<el-button @click="edit.isEdit = false">取消</el-button>
			</template>
		</el-dialog>
	</div>
</template>

<script type="text/ecmascript-6">
	import Views from '../index.js';

        export default {
                name: 'Func',
	        data() {
                        return {
                                Views,
                                edit: {
                                        isEdit: false,
	                                mode: true, // 新增true   编辑 false
	                                isLeaf: true,
	                                model: {
                                                func_id: 0,
		                                func_name: '',
		                                func_key: '',
		                                func_fid: -1
	                                },
	                                validRules: {
                                                func_name: [
	                                                {
	                                                        validator: (rule, value, next) => {
									let { func_id, func_fid } = this.edit.model;
									if(value === '') next(new Error('功能名称不能为空'));
									else if(value.length < 2 || value.length > 15) next(new Error('功能名称长度2-15'))
	                                                                else if(this.$store.state.func.list.some(item => item.func_id !== func_id && item.func_fid === func_fid && item.func_name === value))
	                                                                        next(new Error('功能名称在当前父节点中已存在'));
									else next();
	                                                        },
		                                                trigger: 'blur'
	                                                }
                                                ],
		                                func_key: [
			                                {
			                                        validator: (rule, value, next) => {
			                                                if(this.edit.isLeaf && !value) next(new Error('叶子节点必须绑定对应的组件'));
			                                                else next();
			                                        },
				                                trigger: 'change'
			                                }
		                                ],
	                                },
                                },
                        }
	        },
	        computed: {
                        treeData() {
                                let res = [ { func_id: 0, func_name: 'Root', func_key: '', func_fid: -1, children: [] } ];
	                        this.$store.state.func.list.filter(func => 0 === func.func_fid).forEach(item => {
	                                let node = JSON.parse(JSON.stringify(item));
	                                if(!node.func_key) {
	                                        let children = this.$store.state.func.list.filter(func => node.func_id === func.func_fid);
	                                        if(children.length) {
	                                                node.children = [];
	                                                children.forEach(item1 => {
                                                                node.children.push(JSON.parse(JSON.stringify(item1)))
	                                                })
	                                        }
	                                }
	                                res[0].children.push(node);
	                        })
                                return res;
                        },
	        },
	        methods: {
                        remove(data) {
                                this.$confirm(`确认删除："${data.func_name}" ?`, '提示', { type: 'warning' })
	                                .then(async () => {
	                                        await this.$store.dispatch('func/remove', { payload: JSON.parse(JSON.stringify(data)) });
                                                this.$message({
	                                                type: 'success',
	                                                message: `删除功能："${data.func_name}" 成功，请刷新页面，新配置成功`
                                                });
	                                })
	                                .catch(() => {});
                        },
		        beginAdd(func) {
                                if(this.$refs.form) this.$refs.form.resetFields();  // 重置上一次表单操作的残留效果
				this.edit.model.func_id = 0;
				this.edit.model.func_name = '';
				this.edit.model.func_key = '';
				this.edit.model.func_fid = func.func_id;

			        this.edit.isLeaf = func.func_fid === 0;
			        this.edit.mode = true;
                                this.edit.isEdit = true;
		        },
		        beginUpdate(func) {
                                if(this.$refs.form) this.$refs.form.resetFields();  // 重置上一次表单操作的残留效果
                                this.edit.model.func_id = func.func_id;
                                this.edit.model.func_name = func.func_name;
                                this.edit.model.func_key = func.func_key;
                                this.edit.model.func_fid = func.func_fid;

                                this.edit.isLeaf = func.func_key !== '';
                                this.edit.mode = false;
                                this.edit.isEdit = true;
		        },
		        save() {
                                this.$refs.form.validate()
	                                .then(async () => {
                                                if(this.edit.mode) {  // 新增
//                                                        if(this.edit.isLeaf) this.edit.model.func_key = id.toString();
//                                                        this.edit.model.func_id = await this.$axios({
//                                                                method: 'post',
//                                                                url: '/function/add',
//                                                                data: this.edit.model
//                                                        });
//                                                        this.userFuncList.push(JSON.parse(JSON.stringify(this.edit.model)));
	                                                await this.$store.dispatch('func/add', { payload: JSON.parse(JSON.stringify(this.edit.model)) });
                                                        this.$message({ type: 'success', message: '新增成功，刷新页面新配置生效' })
                                                }else {  // 修改
	                                                await this.$store.dispatch('func/update', { payload: JSON.parse(JSON.stringify(this.edit.model)) });
                                                        this.$message({ type: 'success', message: '修改成功，刷新页面新配置生效' });
                                                }
                                                this.edit.isEdit = false;
	                                })
	                                .catch(() => {});
		        }
	        },
	        created() {
                        this.$store.dispatch('func/init');
	        },
        };
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>
	.custom-tree
		width 500px
		.content
			width 100%
			display flex
			justify-content space-between
			align-items center
			font-size 16px
</style>
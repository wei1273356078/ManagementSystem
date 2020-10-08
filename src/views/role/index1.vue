<template>
	<div>
		<el-row :gutter="20">
			<transition-group name="edit">
				<!-- 因为list是从仓库中映射过来的，所以直接使用 -->
				<el-col :span="6" v-for="name in roleList" :key="name.role_id">
					<el-card :body-style="cardBodyStyle"
					         style="background-color: #E6A23C"
					         @mouseover.native="hoverId = name.role_id"
					         @mouseout.native="hoverId = 0"
					>
						<h5 v-text="name.role_name"></h5>
						<div class="mask" v-show="name.role_id === hoverId">
							<el-button type="text" icon="el-icon-edit-outline" @click="beginUpdate(name)">编辑</el-button>
							<el-button type="text" icon="el-icon-setting" @click="beginRoleFuncConfig(name.role_id)">功能分配</el-button>
							<el-button type="text" icon="el-icon-delete" @click="remove(name.role_id)">删除</el-button>
						</div>
					</el-card>
				</el-col>
			</transition-group>
			<el-col :span="6">
				<el-card :body-style="cardBodyStyle"
				         @click.native="beginAdd"
				         style="border: 2px solid #E6A23C"
				>
					<i class="el-icon-plus"></i>
				</el-card>
			</el-col>
		</el-row>
		<el-dialog :title="`角色编辑 - ${edit.mode ? '新增' : '修改'}`"
		           :modal="false"
		           :visible="edit.isEdit"
		           :show-close="false"
		           width="400px"
		>
			<el-form ref="form"
				 label-width="80px"
			         :model="edit.model"
			         :rules="edit.validRules"
			         status-icon>
				<el-form-item label="角色名称" prop="role_name">
					<el-input v-model.trim="edit.model.role_name"></el-input>
				</el-form-item>
			</el-form>
			<template slot="footer">
				<el-button type="primary" @click="save">保存</el-button>
				<el-button @click="edit.isEdit = false">取消</el-button>
			</template>
		</el-dialog>
		<el-drawer :visible="edit2.isEdit" :show-close="false" title="功能分配">
			<el-tree :data="treeData"
			         class="custom-tree"
			         :default-expand-all="true"
			         :expand-on-click-node="false"
			>
				<span slot-scope="{ node, data }" class="content">
					<span>
						<i v-if="data.func_key" class="el-icon-menu" style="margin-right: 10px; color: rgb(64,158,255);"></i>
						<span v-text="data.func_name"></span>
					</span>
					<span style="margin-right: 10px;">
						<el-switch></el-switch>
					</span>
				</span>
			</el-tree>
			<el-button>确认</el-button>
			<el-button @click="edit2.isEdit = false">取消</el-button>
		</el-drawer>
	</div>

</template>

<script type="text/ecmascript-6">
	// 导入从仓库中映射出的对象
//	import { createNamespacedHelpers } from 'vuex';
	// mapState必须放在计算属性中，mapActions必须放在methods节点中
//	const { mapState, mapActions } = createNamespacedHelpers('role');
        import { RoleFuncApi } from '@/util/api.js';
	import { mapState, mapActions } from 'vuex';

        export default {
                name: 'Role',
                data() {
                        return {
                                cardBodyStyle: {
                                        display: 'flex',
	                                justifyContent: 'center',
	                                alignItems: 'center',
	                                height: '80px',
                                },
                                hoverId: 0,
	                        edit: {
                                        isEdit: false,
		                        mode: true,
		                        model: {
			                                role_id: 0,
				                        role_name: ''
		                        },
                                        validRules: {
                                                role_name: [
                                                        // 自定义验证
                                                        {
                                                                validator: (role, value, next) =>{
                                                                        if(value === '')
                                                                                next(new Error('角色名称不能为空'));
                                                                        else if(value.length<2 || value.length > 15)
                                                                                next(new Error('角色名称长度2-15字符'));
                                                                        else if(this.roleList.some(item => item.role_id !== this.edit.model.role_id && item.role_name === value))
                                                                                next(new Error('角色已存在'));
                                                                        else
                                                                                next();
                                                                },
	                                                        trigger: 'blur'
                                                        }
	                                                // 普通验证
//                                                        { required: true, message: '角色名称不能为空', trigger: 'blur' },
//                                                        { min: 2, max: 10, message: '角色名称长度2-10字符',trigger: 'blur' }
                                                ],
                                        },

	                        },
                                edit2: {
                                        isEdit: false,
		                        model: { role_id: 0, role_func_ids: '' },
                                        roleFuncIds: []
	                        },
                        }
	        },
	        // 导入仓库中映射出来的list
	        computed: {
		        ...mapState('role', { roleList: 'list' }),
		        ...mapState('Func', { funcList: 'list' }),
		        treeData() {
                                let result = [];
                                this.funcList.filter(func => func.func_fid === 0).forEach((item) => {
                                        let node = JSON.parse(JSON.stringify(item));
                                        node.selected = this.edit2.roleFuncIds.indexOf(item.func_id) !== -1;
                                        if(!node.func_key) {
                                                let children = this.funcList.filter(func => func.func_fid === node.func_id);
                                                if(children.length) {
                                                        node.children = [];
                                                        children.forEach(item2 => {
                                                                let child = JSON.parse(JSON.stringify(item2));
                                                                child.selected = this.edit2.roleFuncIds.indexOf(item2.func_id) !== -1;
                                                                node.children.push(child);
                                                        });
                                                }
                                        }
                                        result.push(node);
                                });
                                return result;
		        },
	        },
                methods: {
                        // 映射仓库中的init方法，data，props，computed中的属性不可以有init
//	                ...mapActions(['init', 'add', 'update']),
//	                ...mapActions({ remove1: 'remove' }),
	                ...mapActions('role', { roleInit: 'init', roleAdd: 'add', roleUpdate: 'update', roleRemove: 'remove' }),
			// 角色管理
	                ...mapActions('func', { funcInit: 'init' }),
                        remove(id) {
                                this.$confirm('确认删除？', '提示', { type: 'warning' })
	                                .then(async () => {
	                                        // 调用仓库中的actions中的节点
//	                                        await this.$store.dispatch('role/remove', id);
		                                // 因为有仓库映射出来的方法，所以可以优化上面的代码
		                                await this.roleRemove(id);
                                                this.$message({
	                                                type: 'success',
	                                                message: '删除成功！'
                                                })
	                                })
	                                .catch(() => {});
                        },
		        beginUpdate(role) {
                                if(this.$refs.form) this.$refs.form.resetFields();  // 重置上一次表单操作的残留效果
                                this.edit.model.role_id = role.role_id;
                                this.edit.model.role_name = role.role_name;
                                this.edit.mode = false;
                                this.edit.isEdit = true;
		        },
		        beginAdd() {
                                if(this.$refs.form) this.$refs.form.resetFields();  // 重置上一次表单操作的残留效果
				this.edit.model.role_id = 0;
				this.edit.model.role_name = '';

                                this.edit.mode = true;
                                this.edit.isEdit = true;
		        },
		        save() {
                                this.$refs.form.validate()
	                                .then(async () => {
                                                if(this.edit.mode) {
                                                        // await this.$store.dispatch('role/add', JSON.parse(JSON.stringify(this.edit.model)));
                                                        await this.roleAdd(JSON.parse(JSON.stringify(this.edit.model)));
                                                        this.$message({ type: 'success', message: '新增成功' });
                                                }else {
							// await this.$store.dispatch('role/update', JSON.parse(JSON.stringify(this.edit.model)));
                                                        // 优化上面的代码
	                                                await this.roleUpdate(JSON.parse(JSON.stringify(this.edit.model)));
							this.$message({ type: 'success', message: '修改成功' });
                                                }
                                                this.edit.isEdit = false;
	                                })
	                                .catch(() => {});
		        },
	                // 角色分配
                        async beginRoleFuncConfig(role_id) {
	                        this.edit2.model.role_id = role_id;
	                        const list = await RoleFuncApi.getRoleFuncs(role_id);
                                list.forEach(func => this.edit2.roleFuncIds.push(func.func_id));
                                this.edit2.isEdit = true;
	                },
	                switchChangeHandler(func) {
	                        let i = this.edit2.roleFuncIds.indexOf(func.func_id);
	                        if(i === -1) {   // switch状态：关 -> 开
	                                this.edit2.roleFuncIds.push(func.func_id);
	                        }else {    // switch状态：开 -> 关
	                                this.edit2.roleFuncIds.splice(i, 1);
	                        }
	                }
	        },
                created() {
                        // this.$store.dispatch('role/init');
	                this.roleInit();    // 通知func仓库初始化所有功能数据
	                this.funcInit();   // 通知role仓库初始化所有角色数据

                },
        };
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>
	.edit-enter,.edit-leave-to
		opacity 0
	.edit-enter-active,.edit-leave-active
		transition: opacity .5s ease;
	.el-card
		margin-top 20px
		position relative
		h5
			font-weight 400
			font-size 20px
			color #fff
		.el-icon-plus
			color #E6A23C
			font-size 20px
		.mask
			position absolute
			left 0
			top 0
			width 100%
			height 100%
			display flex
			justify-content center
			align-items center
			background-color rgba(0, 0, 0, 0.6)
			.el-button
				color #fff
				&:hover
					text-decoration underline
					color #409EFF
</style>
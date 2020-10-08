<template>
	<div>
		<el-row :gutter="20">
			<transition-group name="edit">
				<el-col v-for="item in roleList"
				        :key="item.role_id"
				        :span="6"
				        @mouseout.native="overId = 0" @mouseover.native="overId = item.role_id">
					<el-card :body-style="cardBodyStyle" style="background-color: #E6A23C">
						<h5 v-text="item.role_name"></h5>
						<div class="mask" v-show="overId === item.role_id">
							<el-button  type="text" icon="el-icon-edit-outline"  @click="beginUpdate(item)">编辑</el-button>
							<el-button  type="text" icon="el-icon-setting" @click="beginRoleFuncConfig(item.role_id)">功能分配</el-button>
							<el-button type="text"  icon="el-icon-delete" @click="remove(item.role_id)" >删除</el-button>
							<!--<i class="el-icon-delete" @click="remove(item.role_id)">删除</i>-->
							<!--<i class="el-icon-edit-outline" @click="beginUpdate(item)"></i>-->
						</div>
					</el-card>
				</el-col>
			</transition-group>

			<el-col :span="6">
				<el-card :body-style="cardBodyStyle" style="border: 2px solid #E6A23C" @click.native="beginAdd">
					<i class="el-icon-plus"></i>
				</el-card>
			</el-col>
		</el-row>
		<el-dialog :title="`角色编辑-${edit.mode ? '新增': '修改'}`"  :visible.sync="edit.isEdit" width="500px" :show-close="false" :modal="false">
			<el-form ref="form" label-width="100px" :model="edit.model" :rules="edit.validRules" status-icon>
				<el-form-item label="角色名称" prop="role_name">
					<el-input v-model.trim="edit.model.role_name"></el-input>
				</el-form-item>
			</el-form>
			<template slot="footer">
				<el-button type="primary" @click="save">确定</el-button>
				<el-button @click="edit.isEdit = false">取消</el-button>
			</template>
		</el-dialog>
		<el-drawer :visible="edit2.isEdit" :show-close="false" :modal="false" class="custom-drawer" size="500px">
			<h3 slot="title">功能分配</h3>
			<el-tree  :data="edit2.treeData"
			          class="custom-tree"
			          :default-expand-all="true"
			          :expand-on-click-node="false">
			<span class="costom-tree-node" :class="{ active: data.selected }" slot-scope="{node, data}" >
				<span>
					<i class="el-icon-menu"  v-if= "data.func_key" style="margin-right: 10px; color: rgb(64,158,255);"></i>
					<span v-text="data.func_name"></span>
				</span>

				<span class="switch-wrapper" :class="{ parent: data.func_fid === 0 }">
					<el-switch v-model="data.selected" @change="switchChangeHandler(data)"></el-switch>
				</span>
			</span>
			</el-tree>
			<div class="button-wrap">
				<el-button type="primary" @click="configRoleFunc">确定</el-button>
				<el-button @click="edit2.isEdit = false">取消</el-button>
			</div>
		</el-drawer>
	</div>

</template>

<script type="text/ecmascript-6">
//	import { UserApi } from "@/util/api.js";
	import { RoleFuncApi} from "@/util/api.js";
	// 引入单个映射
	// 	import { createNamespacedHelpers} from 'vuex';
	// 	const {mapState, mapActions} = createNamespacedHelpers('role');

	// 引入多个映射，不定项
	import { mapState, mapActions } from 'vuex';
        export default {
                name:'Role',
	        data() {
                        return {
                                overId: 0,
                                cardBodyStyle: {
                                        color: "#f54",
                                        display: "flex",
	                                justifyContent: "center",
	                                alignItems: "center",
	                                height: "80px",
					position: "relative"
                                },
	                        edit: {
                                        isEdit: false,
		                        mode: true,
		                        model: {role_id : 0, role_name: ''},
		                        //自定义验证和普通验证不能并存，注意键名
		                        validRules: {
                                                role_name: [
	                                                {
	                                                        validator: (rule, value,next) => {
	                                                                if(value === '') next(new Error('角色不能为空'));
	                                                                if(value.length <  2  ||  value.length > 10 ) next( new Error('长度2-10'));
	                                                                if(this.roleList.some(item => item.role_id !== this.edit.model.role_id && item.role_name === value)) next(new Error('该角色已经存在'));
	                                                                else next();
	                                                          }, trigger:'blur'},
//	                                                {required: true, message:'角色不能为空', trigger: 'blur'},
//	                                                {min: 2, max:10, message:'长度 2-10', trigger:'blur'},

                                                ]
		                        },

	                        },
                                // 分配功能所需要的数据
	                        edit2: {
                                        isEdit: false,
		                        roleFuncList: [],
		                        treeData: [],
		                        model: {role_id: 0, role_func_ids: ''},

                                }
                        }
	        },
	        computed: {
//		        ...mapState(['list']) ,

		        //映射多个的时候做名字上的区分
		        ...mapState('role', { roleList: 'list'}),
		        ...mapState('func', { funcList: 'list'}),
	        },
	        methods: {
//                        ...mapActions( ['init','add','update']),
//		        ...mapActions({remove2: 'remove'}),
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

		        _updateTreeData() {
                                let result = [];
                                this.funcList.filter(func => func.func_fid === 0).forEach((item) => {
                                        let node = JSON.parse(JSON.stringify(item));
                                        node.selected = this.edit2.roleFuncList.some(item1 => item1.func_id === item.func_id);
                                        if(!node.func_key) {
                                                let children = this.funcList.filter(func => func.func_fid === node.func_id);
                                                if(children.length) {
                                                        node.children = [];
                                                        children.forEach(item2 => {
                                                                let child = JSON.parse(JSON.stringify(item2));
                                                                child.selected = this.edit2.roleFuncList.some(func => item2.func_id === func.func_id);
                                                                node.children.push(child);
                                                        });
                                                }
                                        }
                                        result.push(node);
                                });
                                this.edit2.treeData = result;
		        },
	                 // 角色功能分配
		        async beginRoleFuncConfig(role_id){
		                this.edit2.model.role_id = role_id;
			        this.edit2.roleFuncList = await RoleFuncApi.getRoleFuncs(role_id);

                                this._updateTreeData();
                                this.edit2.isEdit = true;
		        },
		        switchChangeHandler(func){
			        if(func.children) {
			                func.children.forEach(item => item.selected = func.selected);
			        }else {
			                if(func.func_fid !== 0) {
                                                let father = this.edit2.treeData.find(item => item.func_id === func.func_fid);
                                                father.selected = father.children.some(item => item.selected);
			                }
			        }
		        },
		        async configRoleFunc() {
				let ids = [];
				this.edit2.treeData.forEach(item => {
				        if(item.selected) {
				                ids.push(item.func_id);
				                if(item.children) {
				                        item.children.forEach(item2 => {
				                                if(item2.selected) ids.push(item2.func_id)
				                        });
				                }
				        }
				})
				this.edit2.model.role_func_ids = ids.join(',');
			        await RoleFuncApi.configRoleFunc(this.edit2.model);
		                this.edit2.isEdit = false;
		                this.$message({ type: 'success', message: '角色功能配置成功' });
		        }
	          },
	        created() {
                        this.funcInit();   //通知func功能初始化所有 数据
                        this.roleInit();    //通知role功能初始化所有数据
//                        this.$store.dispatch('role/init')
	        },
	        watch: {
                        funcList: function(newValue, oldValue) {
                                this._updateTreeData();
                        }
	        }
        };
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>
	.custom-drawer >>> .el-drawer
		padding 20px !important
		height 100%
		box-sizing border-box
		overflow auto
		.button-wrap
			text-align center
			.el-button
				margin 0 20px
		.el-tree
			width 450px
			margin-bottom 20px
			.costom-tree-node
				width 100%
				display flex
				justify-content space-between
				align-items center
				font-size 16px
				color #bbb
				&.active
					color #000
				span.switch-wrapper
					margin-right 10px
					&.parent
						transform translateX(-100%)
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
<template>
	<el-container>
		<el-header height="40px" style="overflow: hidden">
			<el-form :inline="true">
				<el-form-item label="用户名字">
					<el-input
						v-model="search.user_name"
						suffix-icon="el-icon-search"
						placeholder="请输入搜索的用户名"
						@blur="getUsers"
					></el-input>
				</el-form-item>
				<el-form-item label="用户角色">
					<el-select v-model="search.role_id" @change="getUsers">
						<el-option label="- 请选择 -" :value="-1"></el-option>
						<el-option label="- 无角色 -" :value="0"></el-option>
						<el-option v-for="role in roleList" :key="role.role_id" :label="role.role_name" :value="role.role_id"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item style="float: right;">
					<el-button type="success" icon="el-icon-plus" @click="beginAdd">新增</el-button>
				</el-form-item>
			</el-form>
		</el-header>
		<el-main>
			<el-table :data="list" border stripe>
				<el-table-column label="#" type="index" width="50" align="center"></el-table-column>
				<el-table-column label="用户名" prop="user_name" width="150"></el-table-column>
				<el-table-column label="密码" width="120" align="center">
					<template slot-scope="{ row }">
						<el-popover title="密码：" :content="row.user_pwd" trigger="click" placement="right">
							<el-button icon="el-icon-view" type="text" slot="reference">查看</el-button>
						</el-popover>
					</template>
				</el-table-column>
				<el-table-column label="角色名" width="150" align="center">
					<template slot-scope="{ row }">
						<span v-if="row.role_id" v-text="roleList.find(item => item.role_id === row.role_id).role_name"></span>
						<span v-else style="color: #aaa;">无角色</span>
					</template>
				</el-table-column>
				<el-table-column label="角色分配" width="150" align="center">
					<template slot-scope="{ row }">
						<el-popover :title="`${row.user_name} - 角色分配：`" placement="right" trigger="click">
							<el-form :inline="true">
								<el-form-item label="角色：">
									<el-select v-model="role_id">
										<el-option label="- 无角色 -" :value="0"></el-option>
										<el-option v-for="item in roleList" :key="item.role_id" :value="item.role_id" :label="item.role_name"></el-option>
									</el-select>
								</el-form-item>
								<el-form-item>
									<el-button type="primary" @click="configUserRole(row.user_name)">分配</el-button>
								</el-form-item>
							</el-form>
							<el-button type="primary" icon="el-icon-setting" size="mini" slot="reference" @click="role_id = row.role_id || 0">分配角色</el-button>
						</el-popover>
					</template>
				</el-table-column>
				<el-table-column label="操作">
					<template slot-scope="{ row }">
						<el-button type="warning" icon="el-icon-edit" size="mini" @click="beginUpdate(row)">编辑</el-button>
						<el-button type="danger" icon="el-icon-delete" size="mini" @click="remove(row.user_name)">删除</el-button>
					</template>
				</el-table-column>
			</el-table>
		</el-main>
		<el-footer height="32px">
			<el-pagination
				:total="pagination.total"
				background
				layout="prev,pager,next,jumper,->,sizes,total"
				:page-sizes="[5, 8, 10, 12, 15]"
				:page-size.sync="pagination.pageSize"
				:current-page.sync="pagination.currentPage"
				@current-change="getUsers(false)"
				@size-change="getUsers"
			></el-pagination>
		</el-footer>
		<el-dialog :modal="false" :visible="edit.isEdit" width="500px" :show-close="false" title="用户编辑">
			<el-form ref="form" label-width="80px" :model="edit.model" :rules="edit.validRules" status-icon>
				<el-form-item label="用户名：" prop="user_name">
					<el-input v-model="edit.model.user_name" :disabled="!edit.mode"></el-input>
				</el-form-item>
				<el-form-item label="密码：" prop="user_pwd">
					<el-input v-model="edit.model.user_pwd"></el-input>
				</el-form-item>
			</el-form>
			<template slot="footer">
				<el-button type="primary" @click="save">保存</el-button>
				<el-button @click="edit.isEdit = false">取消</el-button>
			</template>
		</el-dialog>
	</el-container>
</template>

<script type="text/ecmascript-6">
        import { UserApi } from '@/util/api.js';
	import { createNamespacedHelpers } from 'vuex';
	const { mapState, mapActions } = createNamespacedHelpers('role');

        export default {
                name: 'User',
	        data() {
                        return {
                                search: { user_name: '', role_id: -1 },
	                        pagination: { total: 0, pageSize: 5, currentPage: 1 },
	                        list: [],   // 当前显示的用户
	                        role_id: 0,   // 用来作角色分配 0表示无角色
	                        edit: {
                                        isEdit: false,
		                        mode: true,
		                        model: { user_name: '', user_pwd: '' },
                                        validRules: {
                                                user_name: [
	                                                { required: true, message: '用户名不能为空！', trigger: 'blur' },
	                                                { min: 2, max: 20, message: '用户名长度2-10', trigger: 'blur' }
                                                ],
			                        user_pwd: [
                                                        { required: true, message: '密码不能为空！', trigger: 'blur' },
                                                        { min: 2, max: 20, message: '密码长度2-10', trigger: 'blur' }
			                        ]
		                        }
	                        },
                        }
	        },
	        computed: { ...mapState({ roleList: 'list' }) },
	        methods: {
		        ...mapActions({ roleInit: 'init' }),
		        // isStartOverAgain表示是否重头开始
		        async getUsers(isStartOverAgain = true) {
		                if(isStartOverAgain) this.pagination.currentPage = 1;
                                const { total, list } = await UserApi.list({
                                        ...this.search,
                                        begin: (this.pagination.currentPage - 1) * this.pagination.pageSize,
                                        pageSize: this.pagination.pageSize
                                })
                                this.list = list;
                                this.pagination.total = total;
		        },
		        async configUserRole(user_name) {
		                await UserApi.configUserRole({ user_name, role_id: this.role_id })
		                let target = this.list.find(item => item.user_name === user_name);
		                target.role_id = this.role_id || null;
		                this.$message({ type: 'success', message: `用户：${user_name}，角色设置成功！` });
		        },
		        remove(user_name) {
		                this.$confirm('确认删除？', '提示', { type: 'warning' })
			                .then(async () => {
			                        await UserApi.remove(user_name);
			                        let i = this.list.findIndex(item => item.user_name === user_name);
			                        this.list.splice(i, 1);
			                        this.$message({ type: 'success', message: '系统用户: 删除成功！' })
				                // 删除用户要更新total来更新el-pagination控件
				                this.pagination.total = this.pagination.total - 1;
			                        // 如果当前页的用户全删除完了，就请求前面一页的内容
			                        this.$nextTick(() => {
			                                if(this.list.length === 0) this.getUsers(false);
			                        })
			                })
			                .catch(() => {});
		        },
                        beginUpdate(user) {
		                if(this.$refs.form) this.$refs.form.resetFields(); // 重置上一次表单操作的残留效果
				this.edit.model.user_name = user.user_name;
				this.edit.model.user_pwd = user.user_pwd;

				this.edit.isEdit = true;
				this.edit.mode = false;
                        },
		        beginAdd() {
                                if(this.$refs.form) this.$refs.form.resetFields(); // 重置上一次表单操作的残留效果
		                this.edit.model.user_name = '';
		                this.edit.model.user_pwd = '';

		                this.edit.isEdit = true;
		                this.edit.mode = true;
		        },
		        save() {
                                this.$refs.form.validate()
                                        .then(async () => {
                                                if(this.edit.mode) { // 新增
                                                        const count = await UserApi.validName({ user_name: this.edit.model.user_name })
                                                        if(count > 0) {
                                                                this.$message({ type: 'error', message: `用户名：*${this.edit.model.user_name}*，在系统中已存在！` })
                                                                return;
                                                        }
                                                        await UserApi.add(this.edit.model);
                                                        this.list.push({ ...this.edit.model, role_id: null });
                                                        this.$message({ type: 'success', message: '新增成功！' });
                                                }else {  // 修改
                                                        await UserApi.update(this.edit.model);
                                                        let user = this.list.find(item => item.user_name === this.edit.model.user_name);
                                                        user.user_pwd = this.edit.model.user_pwd;
                                                        this.$message({ type: 'success', message: '修改成功！' });
                                                }
                                                this.edit.isEdit = false;
                                        })
                                        .catch(() => {});
		        }
	        },
	        async created() {
                        await this.roleInit();
                        this.getUsers();
	        }
        };
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>
	.el-container
		position absolute
		left 0
		top 0
		width 100%
		height 100%
</style>
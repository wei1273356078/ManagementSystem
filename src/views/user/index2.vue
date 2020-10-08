<template>
	<div>
		<el-table :data="userList" :border="true">
			<el-table-column :resizable="true" label="用户名" width="500" align="center" prop="user_name">
			</el-table-column>
			<el-table-column label="密码" width="500" prop="user_pwd" align="center">

			</el-table-column>
			<el-table-column label="操作" width="500" align="center" type="index">
				<template slot-scope="scope">
					<el-button type="primary" round @click="beginUpdate(scope.$index)">修改</el-button>
					<el-button type="danger" round @click="remove(scope.$index)">删除</el-button>
				</template>
			</el-table-column>
		</el-table>
		<el-table :data="addList">
			<el-table-column align="center">
				<el-button type="primary" round v-text="addList[0]" @click="beginAdd"></el-button>
			</el-table-column>
		</el-table>
		<el-dialog :title="`用户编辑 - ${edit.mode ? '新增' : '修改'}`"
		           :modal="false"
		           :visible="edit.isEdit"
		           :show-close="false"
		           width="400px"
		>
			<el-form ref="form"
			         labelWidth="80px"
			         :model="edit.model"
			         :rules="edit.validRules"
			         status-icon>
				<el-form-item label="用户名" prop="user_name">
					<el-input ref="name" v-model="edit.model.user_name" :disabled="true"></el-input>
				</el-form-item>
				<el-form-item label="用户密码" prop="user_pwd">
					<el-input v-model="edit.model.user_pwd"></el-input>
				</el-form-item>
			</el-form>
			<template slot="footer">
				<el-button type="primary" @click="save">保存</el-button>
				<el-button @click="edit.isEdit = false">取消</el-button>
			</template>
		</el-dialog>
	</div>
</template>

<script type="text/ecmascript-6">
        export default {
                name: 'User',
	        data() {
                        return {
                                userList: [
	                                {
	                                        user_name: 'user1',
		                                user_pwd: '123'
	                                },
	                                {
	                                        user_name: 'user2',
		                                user_pwd: '123'
	                                },
                                ],
	                        addList: ['添加'],
	                        edit: {
                                        mode: true,
		                        isEdit: false,
		                        model: {
                                                user_name: '',
			                        user_pwd: ''
		                        },
                                        validRules: {
                                                user_name: [
                                                        { required: true, message: '用户名不能为空', trigger: 'blur' },
                                                        { min: 2, max: 10, message: '用户名长度2-10字符',trigger: 'blur' }
                                                ],
                                                user_pwd: [
                                                        { required: true, message: '用户密码不能为空', trigger: 'blur' },
                                                        { min: 2, max: 10, message: '用户密码长度2-10字符',trigger: 'blur' }
                                                ],
                                        },
	                        },
                        }
	        },
	        methods: {
                        save() {
                                this.$refs.form.validate()
                                        .then(() => {
		                                if(this.edit.mode) {
		                                        let a = this.userList.some(item => item.user_name === this.edit.model.user_name)
		                                        if(a) return this.$message({type: 'warning', message: '用户名重复'});
							this.userList.push(JSON.parse(JSON.stringify(this.edit.model)));
							this.$message({type: 'success', message: '添加成功'})
		                                }else {
		                                        let i = this.userList.findIndex(item => item.user_name === this.edit.model.user_name);
		                                        this.userList.splice(i, 1, JSON.parse(JSON.stringify(this.edit.model)));
							console.log(i)
		                                }
		                                this.edit.isEdit = false;
                                        })
                                        .catch(() => {});
                        },
                        beginUpdate(index) {
                                this.edit.model = JSON.parse(JSON.stringify(this.userList[index]));
	                        this.edit.mode = false;
                                this.edit.isEdit = true;
                        },
		        beginAdd() {
//                                this.$refs.inputName.disabled = false;

                                this.edit.model.user_name = '';
                                this.edit.model.user_pwd = '';
                                this.edit.mode = true;
                                this.edit.isEdit = true;
                                console.log(this.$refs.name);
                        },
		        remove(index) {
                                this.$confirm('确认删除？', '提示', { type: 'warning' })
	                                .then(() => {
                                                this.userList.splice(index, 1);
                                                this.$message({type: 'success', message: '删除成功'})
	                                })
	                                .catch(() => {});
		        }
	        },
        };
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>

</style>
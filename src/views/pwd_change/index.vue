<template>
	<el-card shadow="hover">
		<el-form label-width="100px" ref="form" :disabled="isDisabled" :model="model" :rules="validForm" status-icon>
			<el-form-item label="原始密码：" prop="oldPwd">
				<el-input type="password" v-model="model.oldPwd"></el-input>
			</el-form-item>
			<el-form-item label="新密码：" prop="newPwd">
				<el-input type="password" v-model="model.newPwd"></el-input>
			</el-form-item>
			<el-form-item label="密码确认：" prop="againPwd">
				<el-input type="password" v-model="model.againPwd"></el-input>
			</el-form-item>
			<el-form-item>
				<el-button type="primary" plain @click="btnConfirm">确认</el-button>
				<el-button type="warning" plain @click="resetForm('form')">重置</el-button>
			</el-form-item>
		</el-form>
	</el-card>
</template>

<script type="text/ecmascript-6">
	import { UserApi } from '@/util/api.js';

        export default {
                name: 'Pwd',
		data() {
                        return {
                                validForm: {
                                        oldPwd: [
                                                {
                                                        validator: (rule, value, next) => {
                                                                if(value === '') next(new Error('旧密码不能为空！'))
                                                                else if(value !== this.currentPwd) next(new Error('密码不一致！'))
                                                                else next();
                                                        },
                                                        trigger: 'blur'
                                                }
                                        ],
                                        newPwd: [
                                                {
                                                        validator: (rule, value, next) => {
                                                                if(value === '') next(new Error('新密码不能为空！'))
                                                                else if(value.length < 2 || value.length > 15) next(new Error('密码长度2-15！'))
                                                                else next();
                                                        },
                                                        trigger: 'blur'
                                                }
                                        ],
                                        againPwd: [
	                                        {
                                                        validator: (rule, value, next) => {
                                                                console.log(this.againPwd)
                                                                if(value === '') next(new Error('新密码不能为空！'))
                                                                else if(value !== this.model.newPwd) next(new Error('两次密码不一致！'))
                                                                else if(value.length < 2 || value.length > 15) next(new Error('密码长度2-15！'))
                                                                else next();
                                                        },
                                                        trigger: 'blur'
	                                        }
                                        ]
                                },
                                isDisabled: false,
                                currentPwd: '',  // 标识当前用户的密码
	                        model: {
                                        oldPwd: '',
                                        newPwd: '',
		                        againPwd: ''
	                        },
                        }
		},
	        methods: {
                        async btnConfirm() {
                                await this.$axios({
	                                method: 'post',
	                                url: '/user/pwdchange',
	                                data: {
	                                        oldPwd: this.model.oldPwd,
		                                newPwd: this.model.newPwd
	                                }
                                });
                                this.$message({ type: 'success', message: '密码修改成功！请重新登录' });
                        },
                        resetForm(form) {
                                this.$refs[form].resetFields();
                        }
	        },
	        async created() {
                        if(sessionStorage.getItem('user') === 'admin') {
                                this.isDisabled = true;
                        };
                        // 应该在点击确认时才验证原密码，为了实现鼠标失去焦点也能验证，只能这样写
                        const { list } = await UserApi.list({
                                user_name: '',
                                user_pwd: '',
                                begin: 0,
                                pageSize: 5000,
                                role_id: -1
                        });
                        this.currentPwd = list.find(pwd => pwd.user_name === sessionStorage.getItem('user')).user_pwd;
	        },
        };
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>
	.el-card
		width: 500px
		margin auto
</style>
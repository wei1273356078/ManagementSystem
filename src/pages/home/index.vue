<template>
	<el-container class="page-container">
		<el-header height="100px">
			<h1>家里蹲教学系统 - V 2.0</h1>
			<span @click="btnClose">退出</span>
		</el-header>
		<el-container>
			<el-aside height="40px">
				<el-menu
					:default-active="activeName"
					background-color="#606266"
					text-color="#fff"
					active-text-color="#ffd04b"
					@select="selectItemHandle"
				>
					<template v-for="item in userFuncList.filter(func => func.func_fid === 0)">
						<el-menu-item v-if="item.func_key" :index="item.func_key">
							<i class="el-icon-setting"></i>
							<span slot="title" v-text="item.func_name"></span>
						</el-menu-item>
						<el-submenu v-else :index="item.func_name">
							<template slot="title">
								<i class="el-icon-location"></i>
								<span v-text="item.func_name"></span>
							</template>
							<el-menu-item v-for="item2 in userFuncList.filter(func => func.func_fid === item.func_id)" :index="item2.func_key">
								<i class="el-icon-setting"></i>
								<span v-text="item2.func_name"></span>
							</el-menu-item>
						</el-submenu>
					</template>
				</el-menu>
			</el-aside>
			<el-container class="aaa">
				<el-main>
					<el-tabs closable
					         v-model="activeName"
					         type="card"
					         @tab-remove="removeTabHandle"
					>
						<el-tab-pane
							v-for="item in listInfo"
							:key="item"
							:name="item"
							:label="userFuncList.find(func => func.func_key === item).func_name"
						>
							<component :is="Views[item].component"></component>
						</el-tab-pane>
					</el-tabs>
				</el-main>
				<el-footer height="40px">
					&copy;2020 家里蹲 版权所有：计算机学院所有学生
				</el-footer>
			</el-container>
		</el-container>
	</el-container>
</template>

<script type="text/ecmascript-6">
	import Views from '@/views';

        export default {
                name: 'Home',
	        data() {
                        return {
                                Views,
                                userFuncList: [],
                                listInfo: [],
	                        activeName: ''
                        }
	        },
	        methods: {
                        selectItemHandle(index) {
                                if(this.listInfo.indexOf(index) === -1) this.listInfo.push(index);
                                this.activeName = index;
                        },
                        removeTabHandle(name) {
                                let i = this.listInfo.findIndex(item => item === name);
	                        this.listInfo.splice(this.listInfo.indexOf(name), 1);
                                if(name === this.activeName) this.activeName = this.listInfo[i] || this.listInfo[i - 1] || '';
                        },
		        btnClose() {
                                sessionStorage.removeItem('token');
                                sessionStorage.removeItem('user');
                                this.$router.replace('/login');
		        },
	        },
	        async created() {
                        this.userFuncList = await this.$axios({
	                        method: 'post',
	                        url: '/user/getmenu'
                        });
	        },
        };
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>
	.el-container
		height 100%
		overflow hidden
		.el-header
			display: flex
			justify-content space-between
			align-items: center
			background-color: #303133
			background-image url("../../assets/img/bg.jpg")
			h1
				color: #409eff
				font-size: 40px
			span
				font-size 16px
				color #409eff
				cursor pointer
		.el-aside
			background-color: #606266
			.el-menu
				border-right: none
		.el-footer
			background-color: #909399
			display: flex
			align-items: center
			color: #eee

</style>
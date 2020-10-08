<template>
	<el-container>
		<el-header>
			<el-form :inline="true">
				<el-form-item label="员工名字：">
					<el-input
						v-model="model.stf_name"
						placeholder="请输入员工名字进行搜索···"
						prefix-icon="el-icon-search"
						@blur="getStaff"
					></el-input>
				</el-form-item>
				<el-form-item label="员工类型：">
					<el-select v-model="model.stf_category" prefix-icon="el-icon-search" @change="getStaff">
						<el-option label="- 所有类型 -" :value="0"></el-option>
						<el-option
							v-for="item in category"
							:key="item.dic_id"
							:label="item.dic_name"
							:value="item.dic_id"
						></el-option>
					</el-select>
				</el-form-item>
				<el-form-item style="float: right;">
					<el-button icon="el-icon-plus" type="success" @click="add_staff">新增</el-button>
				</el-form-item>
			</el-form>
		</el-header>
		<el-main>
			<el-table :data="list" border stripe>
				<el-table-column type="index" label="#" width="40" align="center"></el-table-column>
				<el-table-column label="姓名" prop="stf_name" width="120" align="center"></el-table-column>
				<el-table-column label="职务类型" width="120" align="center">
					<template slot-scope="{ row }">
						<span v-text="category.find(item => item.dic_id === row.stf_category) ? category.find(item => item.dic_id === row.stf_category).dic_name : ''"></span>
					</template>
				</el-table-column>
				<el-table-column label="备注" prop="stf_remark">
					<template slot-scope="{ row }">
						<p v-text="`${ row.stf_remark ? row.stf_remark : '暂无相关备注...' }`"></p>
					</template>
				</el-table-column>
				<el-table-column label="员工状态" width="120" align="center">
					<template slot-scope="{ row }">
						<span v-text='`${row.stf_invalid === 1 ? "在职" : "离职"}`' :style="`${row.stf_invalid === 0 ? 'color: red;' : ''}`"></span>
					</template>
				</el-table-column>
				<el-table-column label="操作" width="150" align="center">
					<template slot-scope="{ row }">
						<el-button type="primary" size="small" @click="update(row)">编辑</el-button>
						<el-button size="small" :type="`${row.stf_invalid === 1 ? 'danger' : 'warning'}`" v-text="`${row.stf_invalid === 1 ? '离职' : '入职'}`" @click="toggle_invalid(row)"></el-button>
					</template>
				</el-table-column>
			</el-table>
		</el-main>
		<el-footer>
			<el-pagination
				:total="pagination.total"
				background
				layout="prev,pager,next,jumper,->,sizes,total"
				:page-sizes="[5, 8, 10, 12, 15]"
				:page-size.sync="pagination.pageSize"
				:current-page.sync="pagination.currentPage"
				@current-change="getStaff(false)"
				@size-change="getStaff"
			></el-pagination>
		</el-footer>
		<el-dialog :modal="false" :visible="edit.isEdit" width="500px" :show-close="false" title="员工编辑">
			<el-form label-width="90px">
				<el-form-item label="员工名字：">
					<el-input v-model="edit.model.stf_name"></el-input>
				</el-form-item>
				<el-form-item label="员工类型：">
					<el-select v-model="edit.model.stf_category">
						<el-option
							v-for="item in category"
							:key="item.dic_id"
							:label="item.dic_name"
							:value="item.dic_id"
						></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="员工备注：">
					<el-input type="textarea" v-model="edit.model.stf_remark"></el-input>
				</el-form-item>
			</el-form>
			<div style="text-align: right;">
				<el-button type="primary" @click="save">保存</el-button>
				<el-button @click="edit.isEdit = false">取消</el-button>
			</div>
		</el-dialog>
	</el-container>
</template>

<script type="text/ecmascript-6">
        import { StaffApi } from '@/util/api.js';
        import { DictionaryApi } from '@/util/api.js';

        export default {
                name: 'Staff',
	        data() {
                        return {
                                list: [],  // 所有的员工
	                        category: [],
                                pagination: { total: 0, pageSize: 5, currentPage: 1 },
                                model: {
                                        stf_category: 0,
                                        stf_name: '',
                                        begin: '',
                                        pageSize: ''
                                },
	                        edit: {
                                        isEdit: false,
		                        mode: true,  // true  表示新增， false 表示编辑
		                        stf_id: 0,
		                        model: {
                                                stf_name: '',
			                        stf_category: 4,
			                        stf_remark: ''
		                        }
	                        }
                        }
	        },
	        methods: {
                        async getStaff(isStartOverAgain = true) {
                                if(isStartOverAgain) this.pagination.currentPage = 1;
                                const { list, total } = await StaffApi.list({
                                        stf_category: this.model.stf_category,
                                        stf_name: this.model.stf_name,
                                        begin: (this.pagination.currentPage - 1) * this.pagination.pageSize,
                                        pageSize: this.pagination.pageSize
                                });
                                this.list = list;
                                this.pagination.total = total;
                        },
		        add_staff() {
                                this.edit.model.stf_remark = '';
                                this.edit.model.stf_category = 4;
                                this.edit.model.stf_name = '';
                                this.edit.mode = true;
                                this.edit.isEdit = true;
		        },
                        update(data) {
                                this.edit.model.stf_remark = data.stf_remark;
                                this.edit.model.stf_category = data.stf_category;
                                this.edit.model.stf_name = data.stf_name;
                                this.edit.stf_id = data.stf_id;
                                this.edit.mode = false;
                                this.edit.isEdit = true;
                        },
		        async save() {
                                if(this.edit.mode) {
                                        const id = await StaffApi.add(this.edit.model);
					this.edit.model.stf_invalid = 1;
                                        this.edit.model.stf_id = id;
                                        this.list.push(JSON.parse(JSON.stringify(this.edit.model)));
                                        this.$message({type: 'success', message: `新增员工" ${this.edit.model.stf_name} "成功`});
                                }else {
					await StaffApi.update({
                                                stf_id: this.edit.stf_id,
                                                ...this.edit.model
					});
					let i = this.list.findIndex(item => item.stf_id === this.edit.stf_id);
					this.list.splice(i, 1, JSON.parse(JSON.stringify(this.edit.model)));
                                        this.$message({type: 'success', message: `修改员工" ${this.edit.model.stf_name} "成功`});
                                }
                                this.edit.isEdit = false;
		        },
                        toggle_invalid(data) {
                                if(data.stf_invalid) {   // 离职
	                                this.$confirm(`员工“ ${data.stf_name} ”离职？`, '提示', { type: 'warning' })
		                                .then(async () => {
                                                        await StaffApi.dimission(data.stf_id);
                                                        this.list.find(item => item.stf_id === data.stf_id).stf_invalid = 0;
		                                })
		                                .catch(err => console.log(err));
                                }else {   // 入职
                                        this.$confirm(`员工“ ${data.stf_name} ”复职？`, '提示', { type: 'warning' })
	                                        .then(async () => {
                                                        await StaffApi.reinstate(data.stf_id);
                                                        this.list.find(item => item.stf_id === data.stf_id).stf_invalid = 1;
	                                        })
                                                .catch(err => console.log(err));
                                }

                        }
	        },
                async created() {
                        this.getStaff();
                        const all = await DictionaryApi.all();
                        this.category = all.filter(item => item.dic_group_key === 'staff_category');
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
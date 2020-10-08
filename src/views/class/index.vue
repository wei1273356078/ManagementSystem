<template>
	<el-container>
		<el-header>
			<el-form :inline="true">
				<el-form-item label="班级名称：">
					<el-input
						v-model="model.cls_name"
						placeholder="请输入搜索内容"
						prefix-icon="el-icon-search"
						@blur="getClass"
					></el-input>
				</el-form-item>
				<el-form-item label="班级专业：">
					<el-select v-model="model.cls_dic_id_major" value="" prefix-icon="el-icon-search" @change="getClass">
						<el-option label="- 所有专业 -" :value="0"></el-option>
						<el-option
							v-for="item in category"
							:key="item.dic_id"
							:label="item.dic_name"
							:value="item.dic_id"
						></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="班级状态：">
					<el-select v-model="model.cls_status" value="" prefix-icon="el-icon-search" @change="getClass">
						<el-option label="- 所有 -" :value="0"></el-option>
						<el-option
							v-for="item in status"
							:key="item.cls_status"
							:label="item.cls_status_name"
							:value="item.cls_status"
						></el-option>
					</el-select>
				</el-form-item>
				<el-form-item style="float: right;">
					<el-button icon="el-icon-plus" type="success" @click.native="add">新增</el-button>
				</el-form-item>
			</el-form>
		</el-header>
		<el-main        >
			<el-table :data="classList" border stripe>
				<el-table-column type="index" label="#" width="40" align="center"></el-table-column>
				<el-table-column label="班级名称" prop="cls_name" width="110" align="center"></el-table-column>
				<el-table-column label="班级专业" width="100" align="center">
					<template slot-scope="{ row }">
						<span v-text="category.find(item => item.dic_id === row.cls_dic_id_major) ? category.find(item => item.dic_id === row.cls_dic_id_major).dic_name : ''"></span>
					</template>
				</el-table-column>
				<el-table-column label="教学老师" width="100" align="center">
					<template slot-scope="{ row }">
						<span v-text="teacher.find(item => item.stf_id === row.cls_stf_id_teacher) ? teacher.find(item => item.stf_id === row.cls_stf_id_teacher).stf_name : ''"></span>
					</template>
				</el-table-column>
				<el-table-column label="教务老师" width="100" align="center">
					<template slot-scope="{ row }">
						<span v-text="teacher.find(item => item.stf_id === row.cls_stf_id_admin) ? teacher.find(item => item.stf_id === row.cls_stf_id_admin).stf_name : ''"></span>
					</template>
				</el-table-column>
				<el-table-column label="就业老师" width="100" align="center">
					<template slot-scope="{ row }">
						<span v-text="teacher.find(item => item.stf_id === row.cls_stf_id_job) ? teacher.find(item => item.stf_id === row.cls_stf_id_job).stf_name : ''"></span>
					</template>
				</el-table-column>
				<el-table-column label="教室" width="100" align="center">
					<template slot-scope="{ row }">
						<span v-text="classRoom.find(item => item.clsr_id === row.cls_clsr_id) ? classRoom.find(item => item.clsr_id === row.cls_clsr_id).clsr_name : ''"></span>
					</template>
				</el-table-column>
				<el-table-column label="开课时间" prop="cls_begin" width="100" align="center"></el-table-column>
				<el-table-column label="结课时间" prop="cls_end" width="100" align="center"></el-table-column>
				<el-table-column label="班级状态" width="100" align="center">
					<template slot-scope="{ row }">
						<span v-if="row.cls_begin && row.cls_end" style="color: #999;">结课</span>
						<span v-else-if="row.cls_begin && !row.cls_end" style="color: #67C23A;">开课中</span>
						<span v-else-if="!row.cls_begin && !row.cls_end" style="color: #E6A23C;">未开课</span>
					</template>
				</el-table-column>
				<el-table-column label="备注">
					<template slot-scope="{ row }">
						<p v-text="`${ row.cls_remark ? row.cls_remark : '暂无相关备注...' }`" :style="`color: ${ row.cls_remark ? '#000' : '#999' };`"></p>
					</template>
				</el-table-column>
				<el-table-column label="操作" width="180">
					<template slot-scope="{ row }">
						<el-button type="primary" size="mini" @click="update(row)" icon="el-icon-edit">修改</el-button>
						<el-button type="danger" size="mini" v-show="row.cls_begin && !row.cls_end" @click="classEnd(row.cls_id)">结课</el-button>
						<el-button type="success" size="mini" v-show="!row.cls_begin && !row.cls_end" @click="classBegin(row)">开课</el-button>
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
				@current-change="getClass(false)"
				@size-change="getClass"
			></el-pagination>
		</el-footer>
		<el-dialog :modal="false" :visible="edit.isEdit" width="500px" :show-close="false" title="班级编辑">
			<el-form label-width="90px">
				<el-form-item label="班级名称：">
					<el-input v-model="edit.model.cls_name"></el-input>
				</el-form-item>
				<el-form-item label="班级专业：">
					<el-select v-model="edit.model.cls_dic_id_major">
						<el-option
							v-for="item in category"
							:key="item.dic_id"
							:label="item.dic_name"
							:value="item.dic_id"
						></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="教学老师：">
					<el-select v-model="edit.model.cls_stf_id_teacher">
						<el-option
							v-for="item in teacher.filter(item => item.stf_category === 4)"
							:key="item.stf_id"
							:label="item.stf_name"
							:value="item.stf_id"
						></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="教务老师：">
					<el-select v-model="edit.model.cls_stf_id_admin">
						<el-option
							v-for="item in teacher.filter(item => item.stf_category === 5)"
							:key="item.stf_id"
							:label="item.stf_name"
							:value="item.stf_id"
						></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="就业老师：">
					<el-select v-model="edit.model.cls_stf_id_job">
						<el-option
							v-for="item in teacher.filter(item => item.stf_category === 6)"
							:key="item.stf_id"
							:label="item.stf_name"
							:value="item.stf_id"
						></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="班级备注：">
					<el-input type="textarea" v-model="edit.model.cls_remark"></el-input>
				</el-form-item>
			</el-form>
			<div style="text-align: right;">
				<el-button type="primary" @click="save">保存</el-button>
				<el-button @click="edit.isEdit = false">取消</el-button>
			</div>
		</el-dialog>
		<el-dialog :modal="false" :visible="beginClass.isEdit" width="500px" :show-close="false" title="开班">
			<el-form label-width="100px">
				<el-form-item label="教师">
					<el-select v-model="beginClass.cls_room" :value="0">
						<el-option
							v-for="item in classRoom"
							:key="item.clsr_id"
							:label="item.clsr_name"
							:value="item.clsr_id"
							:disabled="item.clsr_occupy === 1 ? true : false"
						></el-option>
					</el-select>
				</el-form-item>
				<el-form-item align="right">
					<el-button type="primary" @click="btnBeginClass">确定</el-button>
					<el-button @click="beginClass.isEdit = false">取消</el-button>
				</el-form-item>
			</el-form>
		</el-dialog>
	</el-container>
</template>

<script type="text/ecmascript-6">
	import { ClassApi } from '@/util/api.js';
	import { DictionaryApi } from '@/util/api.js';

        export default {
                name: 'Class',
	        data() {
                        return {
                                classList: [],  // 所有班级
	                        teacher: [],   // 获取所有的老师
                                classRoom: [],   // 获取教室
                                category: [],  // 获取分类
	                        status: [   // 0: 所有 1：开课中 2. 未开课 3. 结课
                                        {cls_status: 1, cls_status_name: '开课中'},
                                        {cls_status: 2, cls_status_name: '未开课'},
                                        {cls_status: 3, cls_status_name: '结课'},
	                        ],
                                pagination: { total: 0, pageSize: 5, currentPage: 1 },
	                        model: {
                                        cls_name: '',
                                        cls_dic_id_major: 0,
                                        cls_status: 0,
                        },
	                        edit: {
                                        isEdit: false,
		                        mode: true,
		                        cls_id: 0,
		                        model: {
                                                cls_name: '',
                                                cls_dic_id_major: '',
                                                cls_stf_id_teacher: '',
                                                cls_stf_id_admin: '',
                                                cls_stf_id_job: '',
                                                cls_remark: '',
                                                cls_clsr_id:  null,
                                                cls_begin: null,
                                                cls_end: null
		                        }
	                        },
	                        beginClass: {
                                        cls_id: 0,
                                        isEdit: false,
		                        cls_room: ''
	                        }
                        }
	        },
	        methods: {
                        async getClass(isStartOverAgain = true) {
                                if(isStartOverAgain) this.pagination.currentPage = 1;
                                const { list, total } = await ClassApi.list({
                                        ...this.model,
                                        begin: (this.pagination.currentPage - 1) * this.pagination.pageSize,
                                        pageSize: this.pagination.pageSize
                                });
                                this.classList = list;
                                this.pagination.total = total;
                        },
                        add() {
                                this.edit.model.cls_name = '';
                                this.edit.model.cls_dic_id_major = '';
                                this.edit.model.cls_stf_id_teacher = '';
                                this.edit.model.cls_stf_id_admin = '';
                                this.edit.model.cls_stf_id_job = '';
                                this.edit.model.cls_remark = '';
                                this.edit.model.cls_clsr_id = null;
                                this.edit.model.cls_begin = null;
                                this.edit.model.cls_end = null;
                                this.edit.isEdit = true;
                                this.edit.mode = true;
                        },
                        update(data) {
                                this.edit.model.cls_name = data.cls_name;
                                this.edit.model.cls_dic_id_major = data.cls_dic_id_major;
                                this.edit.model.cls_stf_id_teacher = data.cls_stf_id_teacher;
                                this.edit.model.cls_stf_id_admin = data.cls_stf_id_admin;
                                this.edit.model.cls_stf_id_job = data.cls_stf_id_job;
                                this.edit.model.cls_remark = data.cls_remark;
                                this.edit.model.cls_clsr_id = data.cls_clsr_id;
                                this.edit.model.cls_begin = data.cls_begin;
                                this.edit.model.cls_end = data.cls_end;
                                this.edit.cls_id = data.cls_id;
                                this.edit.isEdit = true;
                                this.edit.mode = false;
                        },
                        async save() {
                                if(this.edit.mode) {  // 新增
					const id = await ClassApi.add(this.edit.model);
					this.edit.model.cls_id = id;
					this.classList.push(JSON.parse(JSON.stringify(this.edit.model)));
					this.$message({ type: 'success', message: '增加成功！' });
                                }else {   // 修改
					await ClassApi.update({
                                                ...this.edit.model,
                                                cls_id: this.edit.cls_id
					});
					this.edit.model.cls_id = this.edit.cls_id;
					let i = this.classList.findIndex(item => this.edit.cls_id === item.cls_id);
					this.classList.splice(i, 1, JSON.parse(JSON.stringify(this.edit.model)));
					this.$message({type: 'success', message: '修改成功！'});
                                }
                                this.edit.isEdit = false;
                        },
                        classBegin(data) {
                                this.$confirm('确认“开课”吗？', '提示', {type: 'warning'})
	                                .then(() => {
                                                this.beginClass.cls_id = data.cls_id;
                                                this.beginClass.isEdit = true;
	                                })
	                                .catch(err => console.log(err));
                        },
		        classEnd(id) {
                                this.$confirm('确认“结课”吗？', '提示', {type: 'warning'})
	                                .then(async () => {
                                                const time = await ClassApi.end({ cls_id: id });
                                                this.classList.find(item => item.cls_id === id).cls_end = time;
                                                this.$message({type: 'success', message: '结课成功'});
	                                })
	                                .catch(err => console.log(err));
		        },
                        async btnBeginClass() {
                                const time = await ClassApi.begin({
                                        cls_id: this.beginClass.cls_id,
                                        cls_clsr_id: this.beginClass.cls_room
                                });
                                this.classList.find(item => item.cls_id === this.beginClass.cls_id).cls_begin = time;
                                this.$message({type: 'success', message: '开课成功'});
                                this.beginClass.isEdit = false;
                        }

	        },
	        async created() {
                        // 获取班级
			this.getClass();
                        // 获取类别
                        const all = await DictionaryApi.all();
                        this.category = all.filter(item => item.dic_group_key === 'class_major');
                        // 获取教师
                        const { list } = await this.$axios({
                                method: 'post',
                                url: '/staff/list',
                                data: {
                                        stf_category: 0,
                                        stf_name: '',
                                        begin: 0,
                                        pageSize: 1000
                                }
                        });
                        this.teacher = list;
                        // 获取教室
                        this.classRoom = await this.$axios({
                                url: '/classroom/all',
                                method: 'get'
                        });
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
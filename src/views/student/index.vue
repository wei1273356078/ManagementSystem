<template>
	<el-container>
		<el-header>
			<el-form :inline="true">
				<el-form-item label="学生姓名：">
					<el-input
						style="width: 180px;"
						v-model="model.cls_name"
						placeholder="请输入搜索内容"
						prefix-icon="el-icon-search"
						@blur="getStudent"
					></el-input>
				</el-form-item>
				<el-form-item label="所在班级：">
					<el-select v-model="model.stu_cls_id" value="" prefix-icon="el-icon-search" @change="getStudent" style="width: 180px;">
						<el-option label="- 全部 -" :value="0"></el-option>
						<el-option label="- 无班级 -" :value="null"></el-option>
						<el-option
							v-for="item in classList"
							:key="item.cls_id"
							:label="item.cls_name"
							:value="item.cls_id"
						></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="学生学历：">
					<el-select v-model="model.stu_qualification" value="" prefix-icon="el-icon-search" @change="getStudent" style="width: 180px;">
						<el-option label="- 全部 -" :value="0"></el-option>
						<el-option
							v-for="item in category"
							:key="item.dic_id"
							:label="item.dic_name"
							:value="item.dic_id"
						></el-option>
					</el-select>
				</el-form-item>
				<el-form-item style="float: right;">
					<el-button icon="el-icon-plus" type="primary" @click.native="add">新增</el-button>
					<el-button icon="el-icon-share" type="success" @click.native="batchClass">批量分班</el-button>
					<el-button icon="el-icon-download" type="danger" @click.native="stuExport">导出学生信息</el-button>
				</el-form-item>
			</el-form>
		</el-header>
		<el-main>
			<el-table :data="studentList" @selection-change="handleSelectionChange" border stripe>
				<el-table-column type="index" fixed="left" label="#" width="40" align="center"></el-table-column>
				<el-table-column type="selection"	fixed="left" width="50" align="center"></el-table-column>
				<el-table-column label="学生名字" fixed="left" prop="stu_name" width="100" align="center"></el-table-column>
				<el-table-column label="班级" width="130" align="center">
					<template slot-scope="{ row }">
						<span v-text="classList.find(item => item.cls_id === row.stu_cls_id) ? classList.find(item => item.cls_id === row.stu_cls_id).cls_name : '无班级'"></span>
					</template>
				</el-table-column>
				<el-table-column label="存档照片" width="100" align="center">
					<template slot-scope="{ row }">
						<el-popover placement="right" trigger="click" :title="row.stu_name">
							<div class="block">
								<el-image v-if="row.stu_avatar" :src="row.stu_avatar"></el-image>
								<div v-else class="image-empty">
									<el-image>
										<div slot="error" class="image-slot">
											<i class="el-icon-picture-outline"></i>
										</div>
									</el-image>
								</div>
							</div>
							<el-button type="text" slot="reference">预览</el-button>
						</el-popover>
					</template>
				</el-table-column>
				<el-table-column label="性别" width="60" align="center">
					<template slot-scope="{ row }">
						<span v-text="row.stu_sex === 1 ? '男' : '女'"></span>
					</template>
				</el-table-column>
				<el-table-column label="联系电话" width="150" align="center" prop="stu_phone"></el-table-column>
				<el-table-column label="联系电话（备用）" width="150" align="center" prop="stu_phone2"></el-table-column>
				<el-table-column label="出生日期" prop="stu_born" width="100" align="center"></el-table-column>
				<el-table-column label="学历" width="100" align="center">
					<template slot-scope="{ row }">
						<span v-text="category.find(item => item.dic_id === row.stu_qualification) ? category.find(item => item.dic_id === row.stu_qualification).dic_name : ''"></span>
					</template>
				</el-table-column>
				<el-table-column label="毕业院校" width="130" align="center" prop="stu_school"></el-table-column>
				<el-table-column label="院校专业" prop="stu_major" width="150" align="center"></el-table-column>
				<el-table-column label="家庭住址" prop="stu_address" width="350" align="center"></el-table-column>
				<el-table-column label="备注" width="500">
					<template slot-scope="{ row }">
						<p v-text="`${ row.stu_remark ? row.stu_remark : '暂无相关备注...' }`" :style="`color: ${ row.stu_remark ? '#000' : '#999' };`"></p>
					</template>
				</el-table-column>
				<el-table-column fixed="right" label="操作" width="400" align="center">
					<template slot-scope="{ row }">
						<el-button type="primary" size="mini" icon="el-icon-share" @click="divideClass(row)">分班</el-button>
						<el-button type="danger" size="mini" icon="el-icon-picture-outline" @click="pictureSave(row)">照片存档</el-button>
						<el-button type="success" size="mini" icon="el-icon-edit" @click="update(row)">编辑</el-button>
						<el-button type="success" size="mini" icon="el-icon-delete">删除</el-button>
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
				@current-change="getStudent(false)"
				@size-change="getStudent"
			></el-pagination>
		</el-footer>
		<el-dialog :modal="false" :visible="edit1.isEdit" width="700px" :show-close="false" title="学生维护">
			<el-form label-width="150px">
				<el-form-item label="学生姓名：">
					<el-input v-model="edit1.model.stu_name" placeholder="请输入学生的名字"></el-input>
				</el-form-item>
				<el-form-item label="性别：">
					<el-radio v-model="edit1.model.stu_sex" :label="1">男</el-radio>
					<el-radio v-model="edit1.model.stu_sex" :label="0">女</el-radio>
				</el-form-item>
				<el-form-item label="联系电话：">
					<el-input v-model="edit1.model.stu_phone" show-word-limit maxlength="11" placeholder="请输入手机号"></el-input>
				</el-form-item>
				<el-form-item label="备用电话：">
					<el-input v-model="edit1.model.stu_phone2"placeholder="请输入备用联系电话(手机号/座机号)">
						<template slot="append">例如：028-88888888</template>
					</el-input>
				</el-form-item>
				<el-form-item label="出生日期：">
					<el-date-picker type="date" placeholder="选择日期" value-format="yyyy-MM-dd" v-model="edit1.model.stu_born" style="width: 218px;"></el-date-picker>
				</el-form-item>
				<el-form-item label="学历：">
					<el-select v-model="edit1.model.stu_qualification" placeholder="- 请选择学生的学历 -" value="">
						<el-option
							v-for="item in category"
							:key="item.dic_id"
							:label="item.dic_name"
							:value="item.dic_id"
						></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="在读/毕业院校：">
					<el-input v-model="edit1.model.stu_school" placeholder="请输入在读/毕业的院校(选填)"></el-input>
				</el-form-item>
				<el-form-item label="在校学习专业：">
					<el-input v-model="edit1.model.stu_major" placeholder="请输入在校学习专业(选填)"></el-input>
				</el-form-item>
				<el-form-item label="家庭住址：">
					<el-input v-model="edit1.model.stu_address" placeholder="请输入家庭住址"></el-input>
				</el-form-item>
				<el-form-item label="学生备注：">
					<el-input type="textarea" v-model="edit1.model.stu_remark" show-word-limit maxlength="120" placeholder="请输入学生备注..."></el-input>
				</el-form-item>
			</el-form>
			<div style="text-align: right;">
				<el-button type="primary" @click="save">保存</el-button>
				<el-button @click="edit1.isEdit = false">取消</el-button>
			</div>
		</el-dialog>
		<el-dialog :modal="false" :visible="edit.isEdit" width="800px" :show-close="false" title="照片存档">
			<div class="upload__pictrue">
				<h3>个人照片：</h3>
				<div class="exist__pictrue" v-if="temData.stu_avatar">
					<el-image :src="temData.stu_avatar"></el-image>
					<p>学生当前存档图片</p>
				</div>
				<div class="exist__pictrue" v-else>
					<div slot="error" class="image-slot">
						<i class="el-icon-picture-outline"></i>
					</div>
				</div>
				<el-upload
					list-type="picture-card"
					accept=".jpg,.png"
					action="/student/avatarupload"
					name="avatar"
					ref="upload"
					:headers="edit.uploadHeader"
					:before-upload="beforeUploadHandler"
					:on-success="uploadSuccessHandler"
					:on-remove="uploadRemoveHandler"
				>
					<i class="el-icon-plus"></i>
					<p class="el-upload__tip" slot="tip">只能上传JPG/PNG图片，且小于2M</p>
				</el-upload>
			</div>
			<div slot="footer">
				<el-button type="primary" @click="savePhoto" :disabled="!edit.model.stu_avatar_new">保存</el-button>
				<el-button @click="edit.isEdit = false">取消</el-button>
			</div>
		</el-dialog>
		<el-dialog :modal="false" :visible="edit2.isEdit" width="500px" :show-close="false" title="分班">
			<el-form label-width="100px">
				<el-form-item label="班级：">
					<el-select v-model="edit2.model.stu_cls_id" :value="null">
						<el-option label="- 无班级 -" :value="null"></el-option>
						<el-option
							v-for="item in classList"
							:key="item.cls_id"
							:label="item.cls_name"
							:value="item.cls_id"
							:disabled="item.cls_end ? true : false"
						></el-option>
					</el-select>
				</el-form-item>
				<el-form-item align="right">
					<el-button type="primary" @click="divideClassSave">保存</el-button>
					<el-button @click="edit2.isEdit = false">取消</el-button>
				</el-form-item>
			</el-form>
		</el-dialog>
	</el-container>
</template>

<script type="text/ecmascript-6">
	import { StudentApi } from '@/util/api.js';
        import { DictionaryApi } from '@/util/api.js';

        export default {
                name: 'Student',
	        data() {
                        return {
                                studentList: [],  // 学生信息
                                classList: [],  // 所有的班级信息
                                category: [],  // 学历
                                pagination: { total: 0, pageSize: 5, currentPage: 1 },
	                        model: {
                                        stu_name: '',   // 搜索名字
                                        stu_cls_id: 0,   // 学生班级id
                                        stu_qualification: 0,  // 学生学历
	                        },
                                temData: {},  // 临时数据
                                edit: {   // 照片存档编辑
                                        isEdit: false,
                                        uploadHeader: {Authorization: sessionStorage.getItem('token')},
	                                model: {
                                                stu_id: 0,
		                                stu_avatar_old: '',
		                                stu_avatar_new: ''
	                                }
                                },
				edit1: {   // 编辑学生表
					isEdit: false,
					mode: true,
					stu_id: 0,
					model: {
                                                stu_name: '',
						stu_avatar: null,
						stu_cls_id: null,
						stu_sex: 1,  // 0 表示女  1 表示男
						stu_phone: '',
						stu_phone2: '',
						stu_born: '',
						stu_qualification: '',
						stu_school: '',
						stu_major: '',
						stu_address: '',
						stu_remark: ''
					}
				},
	                        edit2: {   // 分班编辑
                                        isEdit: false,
		                        isSingleDivideClass: true,   // true 表示单个分班，  false表示批量分班
		                        model: {
                                                stu_id: 0,
			                        stu_ids: [],
			                        stu_cls_id: null
		                        }
	                        }
                        }
	        },
	        methods: {
                        async getStudent(isStartOverAgain = true) {
                                if(isStartOverAgain) this.pagination.currentPage = 1;
                                const { list, total } = await StudentApi.list({
                                        ...this.model,
                                        begin: (this.pagination.currentPage - 1) * this.pagination.pageSize,
                                        pageSize: this.pagination.pageSize
                                });
                                this.studentList = list;
                                this.pagination.total = total;
                        },
                        // 导出学生表
		        stuExport() {},
		        // 分班编辑
                        handleSelectionChange(val) {  // 监听多选按钮的变化
                                this.edit2.model.stu_ids = [];
                                val.forEach(item => {
                                        this.edit2.model.stu_ids.push(item.stu_id);
                                });
                        },
                        batchClass() {
                                if(!this.edit2.model.stu_ids.length) return this.$alert('请选勾选要分班的学生！', '提示', {type: 'warning'}).catch(err => console.log(err));
                                this.edit2.model.stu_id = null;
                                this.edit2.isEdit = true;
                                this.edit2.isSingleDivideClass = false;
                        },
                        divideClass(data) {
				this.temData = data;
				this.edit2.model.stu_cls_id = data.stu_cls_id;
				this.edit2.model.stu_id = data.stu_id;
                                this.edit2.isEdit = true;
                                this.edit2.isSingleDivideClass = true;
                        },
		        async divideClassSave() {
                                await StudentApi.assignclass(this.edit2.model);
                                if(this.edit2.isSingleDivideClass) {   // 单个分班
                                        this.studentList.find(item => item.stu_id === this.edit2.model.stu_id).stu_cls_id = this.edit2.model.stu_cls_id;
                                }else {  // 批量分班
	                                this.edit2.model.stu_ids.forEach(id => {
                                                this.studentList.find(item => item.stu_id === id).stu_cls_id = this.edit2.model.stu_cls_id;
	                                })
                                }
                                this.edit2.isEdit = false;
                                this.$message({ type: 'success', message: '分班成功' });
                                this.temData = {};   // 清理临时数据
		        },
		        // 编辑学生表
		        add() {
                                this.edit1.model.stu_name =  '';
                                this.edit1.model.stu_avatar =  null;
                                this.edit1.model.stu_cls_id =  null;
                                this.edit1.model.stu_sex =  1;
                                this.edit1.model.stu_phone =  '';
                                this.edit1.model.stu_phone2 =  '';
                                this.edit1.model.stu_born =  '';
                                this.edit1.model.stu_qualification =  '';
                                this.edit1.model.stu_school =  '';
                                this.edit1.model.stu_major =  '';
                                this.edit1.model.stu_address =  '';
                                this.edit1.model.stu_remark =  '';
                                this.edit1.isEdit = true;
                                this.edit1.mode = true;
		        },
                        update(data) {
                                this.edit1.stu_id = data.stu_id;
                                this.edit1.model.stu_name =  data.stu_name;
                                this.edit1.model.stu_avatar =  data.stu_avatar;
                                this.edit1.model.stu_cls_id =  data.stu_cls_id;
                                this.edit1.model.stu_sex =  data.stu_sex;
                                this.edit1.model.stu_phone =  data.stu_phone;
                                this.edit1.model.stu_phone2 =  data.stu_phone2;
                                this.edit1.model.stu_born =  data.stu_born;
                                this.edit1.model.stu_qualification =  data.stu_qualification;
                                this.edit1.model.stu_school =  data.stu_school;
                                this.edit1.model.stu_major =  data.stu_major;
                                this.edit1.model.stu_address =  data.stu_address;
                                this.edit1.model.stu_remark =  data.stu_remark;
                                this.edit1.isEdit = true;
                                this.edit1.mode = false;
                        },
                        async save() {
                                if(this.edit1.mode) {  // 增加
                                        const id = await StudentApi.add(this.edit1.model);
                                        this.edit1.model.stu_id = id;
                                        this.studentList.push(JSON.parse(JSON.stringify(this.edit1.model)));
                                        this.$message({type: 'success', message: '增加成功'});
                                }else {  // 编辑
                                        await StudentApi.update({
                                                ...this.edit1.model,
                                                stu_id: this.edit1.stu_id
                                        });
                                        this.edit1.model.stu_id = this.edit1.stu_id;
                                        let i = this.studentList.findIndex(item => item.stu_id === this.edit1.stu_id);
                                        this.studentList.splice(i, 1, JSON.parse(JSON.stringify(this.edit1.model)));
                                        this.$message({type: 'success', message: '修改成功'});
                                }
                                this.edit1.isEdit = false;
                        },
		        // 上传图片资源
                        pictureSave(data) {    // 照片存档按钮
                                if(this.$refs.upload) this.$refs.upload.clearFiles();
	                        this.edit.model.stu_avatar_new = '';
	                        this.edit.model.stu_avatar_old = data.stu_avatar;
	                        this.edit.model.stu_id = data.stu_id;
	                        this.temData = data;
                                this.edit.isEdit = true;
                        },
                        async savePhoto() {   // 照片存入数据库
	                        const newPicture = await StudentApi.avatarupdate(this.edit.model);
	                        this.edit.isEdit = false;
	                        this.studentList.find(item => item.stu_id === this.edit.model.stu_id).stu_avatar = newPicture;
                                this.$message({type: 'success', message: '存档成功'});
                                if(this.$refs.upload) this.$refs.upload.clearFiles();
                                this.temData = {};  // 释放临时数据
                        },
                        // 在此函数内部对要上传的资源进行类型、大小等等想要进行的验证
                        beforeUploadHandler(file) {
                                const isJPG = file.type === 'image/jpeg';
                                const isPNG = file.type === 'image/png';
                                const isLt2M = file.size / 1024 / 1024 < 2;

                                if ((!isJPG) && (!isPNG)) {
                                        this.$message.error('上传头像图片只能是 JPG 或 PNG 格式!');
                                }
                                if (!isLt2M) {
                                        this.$message.error('上传头像图片大小不能超过 2MB!');
                                }
                                return (isJPG || isPNG) && isLt2M;
                        },
                        uploadSuccessHandler(response, file, fileList) {
                                if(response.status === 200) {
                                        if(fileList.length > 1) fileList.shift();
                                        // 把返回的图片在tmp中的名字保存起来
	                                this.edit.model.stu_avatar_new = response.data;
                                }else {
                                        this.$message.error(response.message);
                                }
                        },
                        uploadRemoveHandler(file, fileList) {
                                this.edit.model.stu_avatar_new = '';
                        }
	        },
	        async created() {
                        this.getStudent();
                        // 得到所有的班级信息
		        this.classList = await this.$axios({
			        method: 'get',
			        url: '/class/all'
		        });
		        // 获取学历
                        const all = await DictionaryApi.all();
                        this.category = all.filter(item => item.dic_group_key === 'qualification');
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
	.block
		width 200px
		height 250px
		display flex
		justify-content center
		align-items center
		.image-empty
			height 100%
			width 100%
			display flex
			justify-content center
			align-items center
			background-color #ccc
			.image-slot
				display flex
				justify-content center
				align-items center
				i
					font-size 50px
	.upload__pictrue
		display flex
		.exist__pictrue
			height 171px
			width 148px
			display flex
			justify-content center
			align-items center
			flex-direction column
			margin-right 20px
			padding-right 20px
			border-right 2px solid #ccc
			.image-slot
				width 100%
				height 100%
				display flex
				justify-content center
				align-items center
				background-color #ccc
				i
					font-size 40px
			p
				margin-top 10px
</style>
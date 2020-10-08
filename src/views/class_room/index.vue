<template>
	<div>
		<div class="header">
			<span></span>闲置
			<span></span>使用中
		</div>
		<el-row :gutter="20">
			<el-col
				:span="6"
			        v-for="item in classRoom"
			        :key="item.clsr_id"
			        @mouseout.native="overId = 0"
			        @mouseover.native="overId = item.clsr_id"
			>
				<el-card shadow="hover" :style="`background-color: ${item.clsr_occupy === 1 ? '#E6A23C' : '#67C23A'};`">
					<h5 v-text="item.clsr_name"></h5>
					<div class="mask" v-show="overId === item.clsr_id">
						<i class="el-icon-edit" @click="update(item)"></i>
						<i class="el-icon-delete" @click="remove(item.clsr_id)" v-show="item.clsr_occupy !== 1"></i>
					</div>
				</el-card>
			</el-col>
			<el-col :span="6">
				<el-card shadow="hover" @click.native="add" style="cursor: pointer;">
					<i class="el-icon-plus"></i>
				</el-card>
			</el-col>
		</el-row>
		<el-dialog title="教室编辑" :visible.sync="edit.isEdit" width="500px" :show-close="false" :modal="false">
			<el-form label-width="100px">
				<el-form-item label="教室名字：">
					<el-input v-model="edit.model.clsr_name"></el-input>
				</el-form-item>
				<el-form-item align="right">
					<el-button type="primary" @click="save">保存</el-button>
					<el-button @click="edit.isEdit = false">取消</el-button>
				</el-form-item>
			</el-form>
		</el-dialog>
	</div>
</template>

<script type="text/ecmascript-6">
	import { ClassRoomApi } from '@/util/api.js';

        export default {
                name: 'classRoom',
	        data() {
                        return {
                                classRoom: [],    // 班级教室
	                        overId: 0,
	                        edit: {
                                        isEdit: false,
		                        mode: true,
		                        model: {
                                                clsr_id: 0,
                                                clsr_name: ''
		                        }

	                        },
                        }
	        },
	        methods: {
		        remove(id) {
		                this.$confirm('确认删除？', '提示', {type: 'warning'})
			                .then(async () => {
			                        await ClassRoomApi.remove(id);
			                        const i = this.classRoom.findIndex(item => item.clsr_id === id);
			                        this.classRoom.splice(i, 1);
			                        this.$message({type: 'success', message: '删除成功！'});
			                })
			                .catch(err => console.log(err));
		        },
                        add() {
		                this.edit.model.clsr_name = '';
		                this.edit.isEdit = true;
		                this.edit.mode = true;
                        },
                        update(item) {
		                this.edit.model.clsr_id = item.clsr_id;
				this.edit.model.clsr_name = item.clsr_name;
                                this.edit.isEdit = true;
                                this.edit.mode = false;
                        },
                        async save() {
		                if(this.edit.mode) {  // 新增
		                        const id = await ClassRoomApi.add({clsr_name: this.edit.model.clsr_name});
		                        this.edit.model.clsr_id = id;
		                        this.edit.model.clsr_occupy = 0;
		                        this.classRoom.push(JSON.parse(JSON.stringify(this.edit.model)));
		                        this.$message({ type: 'success', message: '新增成功！' });
		                }else {   // 编辑
                                        await ClassRoomApi.update(this.edit.model);
                                        this.edit.model.clsr_occupy = 0;
                                        const i = this.classRoom.findIndex(item => item.clsr_id === this.edit.model.clsr_id);
                                        this.classRoom.splice(i, 1, JSON.parse(JSON.stringify(this.edit.model)));
                                        this.$message({type: 'success', message: '修改成功！'});
		                }
		                this.edit.isEdit = false;
                        }
	        },
	        async created() {
		        this.classRoom = await ClassRoomApi.all();
	        }
        };
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>
	.header
		display flex
		align-items center
		height 50px
		line-height 50px
		span
			height 20px
			width 20px
			margin 5px 5px 5px 20px
			background-color #67C23A
			&:nth-child(2)
				background-color #E6A23C
	.el-col
		display flex
		justify-content center
		align-item center
		.el-card
			position relative
			flex-grow 1
			display flex
			justify-content center
			align-items center
			margin-top 20px
			height 100px
			h5
				font-size 20px
				color #fff
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
				i
					font-size 40px
					margin-left 20px
					cursor pointer
					color #fff
</style>
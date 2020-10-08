// 统一导入导出所有系统功能组件

import Class from './class';
import PwdChange from './pwd_change';
import Role from './role';
import Staff from './staff';
import Student from './student';
import User from './user';
import Func from './func';
import ClassRoom from './class_room';

// 统一导出

export default {
        Class: { name: '班级管理', component: Class },
        PwdChange: { name: '密码管理', component: PwdChange },
        Role: { name: '角色管理', component: Role },
        Staff: { name: '员工管理', component: Staff },
        Student: { name: '学生管理', component: Student },
        User: { name: '用户管理', component: User },
        Func: { name: '功能管理', component: Func },
        ClassRoom: { name: '教室管理', component: ClassRoom }
};
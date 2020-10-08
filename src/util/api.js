import http from './http.js';
// 一个文件可以export无数次，但最多只能export default一次
export const UserApi = {
        list: data => http({ method: 'post', url: '/user/list', data }),
        add: data => http({ method: 'post', url: '/user/add', data }),
        update: data => http({ method: 'post', url: '/user/change_pwd', data }),
        remove: user_name => http({ method: 'post', url: '/user/remove/' + user_name }),
        configUserRole: data => http({ method: 'post', url: '/user/config_role', data }),
        validName: data => http({ method: 'post', url: '/user/valid_name', data })
};

export const FuncApi = {
        all: () => http({ method: 'get', url: '/function/all' }),
        add: data => http({ method: 'post', url: '/function/add', data }),
        update: data => http({ method: 'post', url: '/function/update', data }),
        remove: id => http({ method: 'post', url: '/function/remove/' + id })
};

export const RoleApi = {
        all: () => http({ method: 'get', url: '/role/all' }),
        remove: role_id => http({ method: 'post', url: '/role/remove/' + role_id }),
        add: data => http({ method: 'post', url: '/role/add', data }),
        update: data => http({ method: 'post', url: '/role/update', data })
};

export const RoleFuncApi = {
        getRoleFuncs: role_id => http({ method: 'get', url: '/role_function/list/' + role_id }),
        configRoleFunc: data => http({ method: 'post', url: '/role_function/config', data })
};

export const DictionaryApi = { all: () => http({ method: 'get', url: '/dictionary/all' }) };

export const StaffApi = {
        dimission: stf_id => http({ method: 'get', url: '/staff/dimission/' + stf_id }),
        reinstate: stf_id => http({ method: 'get', url: '/staff/reinstate/' + stf_id }),
        add: data => http({ method: 'post', url: '/staff/add', data }),
        update: data => http({ method: 'post', url: '/staff/update', data }),
        list: data => http({ method: 'post', url: '/staff/list', data })
};

export const ClassApi = {
        list: data => http({ method: 'post', url: '/class/list', data }),
        add: data => http({ url: '/class/add', method: 'post', data }),
        update: data => http({ method: 'post', url: '/class/update', data }),
        end: data => http({ method: 'post', url: '/class/end', data }),
        begin: data => http({ method: 'post', url: '/class/begin', data })
}

export const StudentApi = {
        list: data => http({method: 'post', url: '/student/list', data}),
        assignclass: data => http({method: 'post', url: '/student/assignclass', data}),
        add: data => http({ method: 'post', url: '/student/add', data }),
        update: data => http({ method: 'post', url: '/student/update', data }),
        avatarupdate: data => http({ method: 'post', url: '/student/avatarupdate', data })
};

export const ClassRoomApi = {
        remove: id => http({ method: 'get', url: '/classroom/remove/' + id }),
        add: data => http({ method: 'post', url: '/classroom/add', data }),
        update: data => http({ method: 'post', url: '/classroom/update', data }),
        all: () => http({ method: 'get', url: '/classroom/all' })
};


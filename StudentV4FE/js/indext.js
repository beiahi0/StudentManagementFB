const app = new Vue({
    el: '#app',
    data() {
        //校验学号是否存在
        const rulesSNo = (rule, value, callback) => {
            //如果是修改则直接返回，无需校验
            if (this.isEdit) {
                callback();
            }
            //使用Axios进行校验
            axios.post(
                this.baseURL + 'sno/check/',
                {
                    //sno是后端数据库字段，value是默认参数,也可以写成studentForm.sno
                    sno: value,
                }
            )
                .then((res) => {
                    if (res.data.code == 1) {
                        if (res.data.exists) {
                            console.log(res.data.exists);
                            callback(new Error("学号已存在！"));
                        } else {
                            callback();
                        }
                    } else {
                        //请求失败
                        callback(new Error("校验学号后端异常"));
                    }
                })
                .catch((err) => {
                    //如果请求失败再控制台打印
                    console.log(err);
                });
        }
        return {
            msg: 'hello vue',
            students: [],
            pageStudents: [], //分页后当前页的学生信息
            // baseURL: "http://192.168.1.102:8000/",
            baseURL:"http://101.34.58.126:8000/",
            inputStr: '',    //输入的查询条件
            total: 100,  //数据行数
            dialogTitle: '',//弹出框的标题
            isView: false,   //表示是否查看
            isEdit: false,   //表示是否修改
            currentpage: 1,    //当前所在的页
            pagesize: 10,    //每页显示多少行
            selectStudents: [],//选择复选框时，把记录存在这个集合
            dialogVisible: false,    //弹出表单
            studentForm: {
                sno: '',
                name: '',
                dept: '',
                gender: '',
                birthday: '',
                mobile: '',
                email: '',
                address: '',
                image: '',
                imageUrl:'',    //学生头像路径
            },
            rules: {
                //设置学号必填，消息提示message，在失去焦点的时候触发
                //首先在表单上设置rules=“rules”，然后再需要校验的字段上面prop=“sno”...
                sno: [
                    { required: true, message: '学号不能为空', trigger: 'blur' },
                    //校验正则表达式
                    { pattern: /^[9][5]\d{3}$/, message: '学号必须是95开头五位数', trigger: 'blur' },
                    { validator: rulesSNo, trigger: 'blur' },  //校验学号是否存在
                ],
                name: [
                    { required: true, message: '姓名不能为空', trigger: 'blur' },
                    //校验正则表达式
                    { pattern: /^[\u4e00-\u9fa5]{2,5}$/, message: '姓名必须是2-5个汉字', trigger: 'blur' },
                ],
                gender: [
                    { required: true, message: '性别不能为空', trigger: 'change' },
                ],
                birthday: [
                    { required: true, message: '出生日期不能为空', trigger: 'blur' },
                ],
                mobile: [
                    { required: true, message: '手机号不能为空', trigger: 'blur' },
                    //校验正则表达式
                    { pattern: /^[1][35789]\d{9}$/, message: '手机号不合法', trigger: 'blur' },
                ],
                email: [
                    { required: true, message: '邮箱地址不能为空', trigger: 'blur' },
                    //校验正则表达式
                    { pattern: /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/, message: '邮箱地址不合法', triggler: 'blur' },
                ],
                address: [
                    { required: true, message: '家庭住址不能为空', trigger: 'blur' },
                ]
            }
        }
    },
    mounted() {
        //自动加载数据
        this.getStudents();
    },
    methods: {
        //获取所有学生信息
        getStudents: function () {
            //axios异步请求完之后会自动把this置为undefied
            //先把this地址存下来
            let that = this
            //使用Axios实现Ajax请求
            axios
                .get(that.baseURL + "students/")
                .then(function (res) {
                    //请求成功后执行的函数
                    if (res.data.code == 1) {
                        //把数据给students
                        that.students = res.data.data;
                        //获取返回记录的总行数
                        that.total = res.data.data.length;
                        //获取当前页的数据
                        that.getPageStudents();
                        //提示成功：
                        that.$message({
                            message: '数据加载成功',
                            type: 'success'
                        });
                    } else {
                        //失败提示：
                        that.$message.error(res.data.msg);
                    }
                })
                .catch(function (err) {
                    //请求失败后执行的函数
                    console.log(err);
                });
        },
        getAllStudents() {
            //清空输入的inputStr
            this.inputStr = "";
            this.getStudents();
        },
        //获取当前页的学生数据
        getPageStudents() {
            //先把当前PageStudents页的数据清空
            this.pageStudents = [];
            //获得当前页的数据
            for (let i = (this.currentpage - 1) * this.pagesize; i < this.total; i++) {
                //遍历数据添加到pageStudent中
                this.pageStudents.push(this.students[i]);
                //判断是否达到一页要求
                if (this.pageStudents.length == this.pagesize) break;
            }
        },
        //添加学生时打开表单
        addStudent() {
            //修改标题
            this.dialogTitle = "添加学生信息";
            this.dialogVisible = true;
        },
        //分页时修改每一页的行数
        handleSizeChange(size) {
            //修改当前每页数据行数
            this.pagesize = size;
            //数据重新分页
            this.getPageStudents();
        },
        //调整当前的页码
        handleCurrentChange(pageNumber) {
            //修改当前的页码
            this.currentpage = pageNumber;
            //数据重新分页
            this.getPageStudents();
        },
        //实现学生信息的查询
        queryStudents() {
            //使用Ajax请求--POST--传递inputstr
            let that = this
            //来时Ajax请求
            axios
                .post(
                    that.baseURL + "students/query/",
                    {
                        inputstr: that.inputStr
                    }
                )
                .then(function (res) {
                    if (res.data.code === 1) {
                        //把数据给students
                        that.students = res.data.data;
                        //获取返回记录的总行数
                        that.total = res.data.data.length;
                        //获取当前页的数据
                        that.getPageStudents();
                        //提示成功：
                        that.$message({
                            message: '查询数据加载成功',
                            type: 'success'
                        });
                    } else {
                        that.$message.error(res.data.msg);
                    }
                })
                .catch(function (err) {
                    console.log(err);
                    that.$message.error("获取后端查询结果出现异常！");
                });
        },
        //查看学生的明细
        viewStudent(row) {
            //修改标题
            this.dialogTitle = "查看学生信息";
            //修改isView变量
            this.isView = true;
            //弹出表单
            this.dialogVisible = true;
            //表单拿到对象展示必须用深拷贝
            this.studentForm = JSON.parse(JSON.stringify(row));
        },
        //关闭弹出框的表单,用@close=“函数名”，绑定表单的叉号
        closeDialogForm(formName) {
            //重置表单的校验
            this.$refs[formName].resetFields();
            //清空表单上一次展示的内容
            this.studentForm.sno = "",
                this.studentForm.name = "",
                this.studentForm.gender = "",
                this.studentForm.birthday = "",
                this.studentForm.mobile = "",
                this.studentForm.email = "",
                this.studentForm.address = "";
            //关闭
            this.dialogVisible = false;
            //初始化isView和isEdit的值是false
            this.isEdit = false;
            this.isView = false;
        },
        //修改学生的明细
        updateStudent(row) {
            //修改标题
            this.dialogTitle = "修改学生信息";
            //修改isEdit变量=true
            this.isEdit = true;
            //弹出表单
            this.dialogVisible = true;
            //表单拿到对象展示必须用深拷贝
            this.studentForm = JSON.parse(JSON.stringify(row));
        },
        //提交学生的表单 formName是表单的名称
        submitStudentForm(formName) {
            this.$refs[formName].validate((valid) => {
                if (valid) {
                    //校验成功后,执行添加或者修改
                    if (this.isEdit) {
                        //修改
                        this.submitUpdateStudent();
                    } else {
                        //添加
                        this.submitAddStudent();
                    }
                } else {
                    console.log('error submit!!');
                    return false;
                }
            });
        },
        //添加到数据库的函数
        submitAddStudent() {
            //定义that
            let that = this;
            //执行axios请求
            axios
                .post(that.baseURL + 'student/add/', that.studentForm)
                .then(res => {
                    //执行成功
                    if (res.data.code == 1) {
                        //获取所有学生的信息
                        that.students = res.data.data;
                        //获取记录的条数
                        that.total = res.data.data.length;
                        //获取分页信息
                        that.getPageStudents();
                        //提示
                        that.$message({
                            message: '查询数据加载成功',
                            type: 'success'
                        });
                        //关闭窗体
                        that.closeDialogForm('studentForm');
                    } else {
                        //失败的提示
                        that.$message.error(res.data.msg);
                    }
                })
                .catch(err => {
                    //执行失败
                    console.log(err);
                    that.$message.error("获取后端查询结果出现异常！");
                });

        },
        //修改更新到数据库
        submitUpdateStudent() {
            //定义that
            let that = this;
            //执行axios请求
            axios
                .post(that.baseURL + 'student/update/', that.studentForm)
                .then(res => {
                    //执行成功
                    if (res.data.code == 1) {
                        //获取所有学生的信息
                        that.students = res.data.data;
                        //获取记录的条数
                        that.total = res.data.data.length;
                        //获取分页信息
                        that.getPageStudents();
                        //提示
                        that.$message({
                            message: '数据修改加载成功',
                            type: 'success'
                        });
                        //关闭窗体
                        that.closeDialogForm('studentForm');
                    } else {
                        //失败的提示
                        that.$message.error(res.data.msg);
                    }
                })
                .catch(err => {
                    //执行失败
                    console.log(err);
                    that.$message.error("修改时获取后端查询结果出现异常！");
                });
        },
        //删除一条学生的记录,row表示那一行的信息
        deleteStudent(row) {
            //等待确认删除
            this.$confirm('确认删除?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                //确认删除的相应事件
                let that = this
                //调用后端的接口
                axios.post(that.baseURL + 'student/delete/', { sno: row.sno })
                    .then(res => {
                        if (res.data.code == 1) {
                            //获取所有的学生信息
                            that.students = res.data.data;
                            //获取记录数
                            that.total = res.data.data.length;
                            //分页
                            that.getPageStudents();
                            //提示
                            that.$message({
                                message: '数据删除成功',
                                type: 'success'
                            });
                        } else {
                            //失败的提示
                            that.$message.error(res.data.msg);
                        }

                    })
            }).catch(() => {
                this.$message({
                    type: 'info',
                    message: '已取消删除'
                });
            });
        },
        //批量删除，选择复选框时的触发操作 把选择的信息保存在selectStudents集合
        handleSelectionChange(data) {
            this.selectStudents = data;
            console.log(data);
        },
        //删除一群学生的记录
        deleteStudents() {
            //等待确认删除
            this.$confirm("确认批量删除" + this.selectStudents.length + "个学生信息?", '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                //确认删除的相应事件
                let that = this
                //调用后端的接口
                axios.post(that.baseURL + 'students/delete/', { student: that.selectStudents }) //左边student对应后端参数一致
                    .then(res => {
                        if (res.data.code == 1) {
                            //获取所有的学生信息
                            that.students = res.data.data;
                            //获取记录数
                            that.total = res.data.data.length;
                            //分页
                            that.getPageStudents();
                            //提示
                            that.$message({
                                message: '数据批量删除成功',
                                type: 'success'
                            });
                        } else {
                            //失败的提示
                            that.$message.error(res.data.msg);
                        }

                    })
            }).catch(() => {
                this.$message({
                    type: 'info',
                    message: '已取消删除'
                });
            });
        },
        //选择学生头像后点击确定触发的事件
        uploadPicturePost(file){
            //定义that
            let that=this;
            //定义一个FormData类
            let fileReq=new FormData();
            //把照片传进去
            fileReq.append('avatar',file.file);
            console.log(file.file);
            //使用Axios发起Ajax的请求
            axios(
                {
                    methods:'post',
                    url:that.baseURL+'upload/',
                    data:fileReq
                }
            ).then(res=>{
                //根据code判断是否成功
                if(res.data.code==1){
                    //把照片给image
                    that.studentForm.image = res.data.name;
                    console.log("把照片给image")
                    //拼接imageUrl
                    that.studentForm.imageUrl = that.baseURL+"media/"+res.data.name;
                }else{
                    //失败的提示
                    that.$message.error(res.data.msg);
                }
            }).catch(err=>{
                //执行失败
                console.log(err);
                that.$message.error("上传图片出现异常");
            });
        },

    },
})

// {sno:'95052',name:'李四',gender:'男',birthday:'1996-01-1',
//             Phone:'18709456343',email:'3308472759@qq.com',Address:'武汉金融港北103号'},
//             {sno:'95052',name:'李四',gender:'男',birthday:'1996-01-1',
//             Phone:'18709456343',email:'3308472759@qq.com',Address:'武汉金融港北103号405室'},
//             {sno:'95052',name:'李四',gender:'男',birthday:'1996-01-1',
//             Phone:'18709456343',email:'3308472759@qq.com',Address:'武汉工程大学金融港北103号'},
//             {sno:'95052',name:'李四',gender:'男',birthday:'1996-01-1',
//             Phone:'18709456343',email:'3308472759@qq.com',Address:'武汉工程大学金融港北103号'},
//             {sno:'95052',name:'李四',gender:'男',birthday:'1996-01-1',
//             Phone:'18709456343',email:'3308472759@qq.com',Address:'武汉工程大学金融港北103号'},
//             {sno:'95052',name:'李四',gender:'男',birthday:'1996-01-1',
//             Phone:'18709456343',email:'3308472759@qq.com',Address:'武汉工程大学金融港北103号'}
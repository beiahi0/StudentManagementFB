const app = new Vue({
    el: '#app03',
    data() {
        //校验学号是否存在
        const rulesclassNo = (rule, value, callback) => {
            //如果是修改则直接返回，无需校验
            if (this.isEdit) {
                callback();
            }
            //使用Axios进行校验
            axios.post(
                this.baseURL + 'classNo/check/',
                {
                    //sno是后端数据库字段，value是默认参数,也可以写成studentForm.sno
                    classNo: value,
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
            classes: [],
            pageClasses: [], //分页后当前页的学生信息
            // baseURL: "http://192.168.1.102:8000/",
            baseURL:"http://101.34.58.126:8000/",
            inputStr: '',    //输入的查询条件
            total: 100,  //数据行数
            dialogTitle: '',//弹出框的标题
            isView: false,   //表示是否查看
            isEdit: false,   //表示是否修改
            currentpage: 1,    //当前所在的页
            pagesize: 10,    //每页显示多少行
            selectClasses: [],//选择复选框时，把记录存在这个集合
            dialogVisible: false,    //弹出表单
            classForm: {
                classNo: '',
                className: '',
                image: '',
                imageUrl:'',    //学生头像路径
            },
            rules: {
                //设置学号必填，消息提示message，在失去焦点的时候触发
                //首先在表单上设置rules=“rules”，然后再需要校验的字段上面prop=“sno”...
                classNo: [
                    { required: true, message: '班级号不能为空', trigger: 'blur' },
                    //校验正则表达式
                    { pattern: /^\d{1,3}$/, message: '班级号必须不大于1000', trigger: 'blur' },
                    { validator: rulesclassNo, trigger: 'blur' },  //校验学号是否存在
                ],
                className: [
                    { required: true, message: '班级名不能为空', trigger: 'blur' },
                    //校验正则表达式
                    { pattern: /^[\u4e00-\u9fa5]{2,15}\d{1,3}[\u4e00-\u9fa5]{0,5}$/, message: '班级名必须是2-15个汉字', trigger: 'blur' },
                ]
            }
        }
    },
    mounted() {
        //自动加载数据
        this.getClasses();
    },
    methods: {
        //获取所有学生信息
        getClasses: function () {
            //axios异步请求完之后会自动把this置为undefied
            //先把this地址存下来
            let that = this
            //使用Axios实现Ajax请求
            axios
                .get(that.baseURL + "classes/")
                .then(function (res) {
                    //请求成功后执行的函数
                    if (res.data.code == 1) {
                        //把数据给students
                        that.classes = res.data.data;
                        //获取返回记录的总行数
                        that.total = res.data.data.length;
                        //获取当前页的数据
                        that.getPageClasses();
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
        getAllClasses() {
            //清空输入的inputStr
            this.inputStr = "";
            this.getClasses();
        },
        //获取当前页的学生数据
        getPageClasses() {
            //先把当前PageStudents页的数据清空
            this.pageClasses = [];
            //获得当前页的数据
            for (let i = (this.currentpage - 1) * this.pagesize; i < this.total; i++) {
                //遍历数据添加到pageStudent中
                this.pageClasses.push(this.classes[i]);
                //判断是否达到一页要求
                if (this.pageClasses.length == this.pagesize) break;
            }
        },
        //添加学生时打开表单
        addClass() {
            //修改标题
            this.dialogTitle = "添加学生信息";
            this.dialogVisible = true;
        },
        //分页时修改每一页的行数
        handleSizeChange(size) {
            //修改当前每页数据行数
            this.pagesize = size;
            //数据重新分页
            this.getPageClasses();
        },
        //调整当前的页码
        handleCurrentChange(pageNumber) {
            //修改当前的页码
            this.currentpage = pageNumber;
            //数据重新分页
            this.getPageClasses();
        },
        //实现学生信息的查询
        queryClasses() {
            //使用Ajax请求--POST--传递inputstr
            let that = this
            //来时Ajax请求
            axios
                .post(
                    that.baseURL + "classes/query/",
                    {
                        inputstr: that.inputStr
                    }
                )
                .then(function (res) {
                    if (res.data.code === 1) {
                        //把数据给students
                        that.classes = res.data.data;
                        //获取返回记录的总行数
                        that.total = res.data.data.length;
                        //获取当前页的数据
                        that.getPageClasses();
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
        viewClass(row) {
            //修改标题
            this.dialogTitle = "查看班级信息";
            //修改isView变量
            this.isView = true;
            //弹出表单
            this.dialogVisible = true;
            //表单拿到对象展示必须用深拷贝
            this.classForm = JSON.parse(JSON.stringify(row));
        },
        //关闭弹出框的表单,用@close=“函数名”，绑定表单的叉号
        closeDialogForm(formName) {
            //重置表单的校验
            this.$refs[formName].resetFields();
            //清空表单上一次展示的内容
            this.classForm.classNo = "",
            this.classForm.className = "";
                
            //关闭
            this.dialogVisible = false;
            //初始化isView和isEdit的值是false
            this.isEdit = false;
            this.isView = false;
        },
        //修改学生的明细
        updateClass(row) {
            //修改标题
            this.dialogTitle = "修改班级信息";
            //修改isEdit变量=true
            this.isEdit = true;
            //弹出表单
            this.dialogVisible = true;
            //表单拿到对象展示必须用深拷贝
            this.classForm = JSON.parse(JSON.stringify(row));
        },
        //提交学生的表单 formName是表单的名称
        submitClassForm(formName) {
            this.$refs[formName].validate((valid) => {
                if (valid) {
                    //校验成功后,执行添加或者修改
                    if (this.isEdit) {
                        //修改
                        this.submitUpdateClass();
                    } else {
                        //添加
                        this.submitAddClass();
                    }
                } else {
                    console.log('error submit!!');
                    return false;
                }
            });
        },
        //添加到数据库的函数
        submitAddClass() {
            //定义that
            let that = this;
            //执行axios请求
            axios
                .post(that.baseURL + 'class/add/', that.classForm)
                .then(res => {
                    //执行成功
                    if (res.data.code == 1) {
                        //获取所有学生的信息
                        that.classes = res.data.data;
                        //获取记录的条数
                        that.total = res.data.data.length;
                        //获取分页信息
                        that.getPageClasses();
                        //提示
                        that.$message({
                            message: '查询数据加载成功',
                            type: 'success'
                        });
                        //关闭窗体
                        that.closeDialogForm('classForm');
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
        submitUpdateClass() {
            //定义that
            let that = this;
            //执行axios请求
            axios
                .post(that.baseURL + 'class/update/', that.classForm)
                .then(res => {
                    //执行成功
                    if (res.data.code == 1) {
                        //获取所有学生的信息
                        that.classes = res.data.data;
                        //获取记录的条数
                        that.total = res.data.data.length;
                        //获取分页信息
                        that.getPageClasses();
                        //提示
                        that.$message({
                            message: '数据修改加载成功',
                            type: 'success'
                        });
                        //关闭窗体
                        that.closeDialogForm('classForm');
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
        deleteClass(row) {
            //等待确认删除
            this.$confirm('确认删除?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                //确认删除的相应事件
                let that = this
                //调用后端的接口
                axios.post(that.baseURL + 'class/delete/', { classNo: row.classNo })
                    .then(res => {
                        if (res.data.code == 1) {
                            //获取所有的学生信息
                            that.classes = res.data.data;
                            //获取记录数
                            that.total = res.data.data.length;
                            //分页
                            that.getPageClasses();
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
            this.selectClasses = data;
            console.log(data);
        },
        //删除一群学生的记录
        deleteClasses() {
            //等待确认删除
            this.$confirm("确认批量删除" + this.selectClasses.length + "个班级信息?", '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                //确认删除的相应事件
                let that = this
                //调用后端的接口
                axios.post(that.baseURL + 'classes/delete/', { class: that.selectClasses }) //左边student对应后端参数一致
                    .then(res => {
                        if (res.data.code == 1) {
                            //获取所有的学生信息
                            that.classes = res.data.data;
                            //获取记录数
                            that.total = res.data.data.length;
                            //分页
                            that.getPageClasses();
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
    },
})

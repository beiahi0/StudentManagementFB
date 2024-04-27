const app_login = new Vue({
    el: '#app_login',
    data() {
      const ruleCheckPass = (rule, value, callback) => {
        if (value == '') {
          callback(new Error('请在此输入密码'));
        } else if (value != this.adminForm.pass) {
          callback(new Error('两次密码不一致'));
        } else {
          callback();
        }
      }
      return {
        baseURL: "http://101.34.58.126:8000/",//基地址
        adminForm: {
          name: '',
          pass: '',
          checkPass: '',
        },
        //定义校验规则
        rules: {
          pass: [
            { required: true, trigger: 'blur' }
          ],
          checkPass: [
            { required: true, trigger: 'blur' },
            { validator: ruleCheckPass, trigger: 'blur' }
          ],
          name: [
            { required: true, message: '姓名不能为空', trigger: 'blur' },
            //校验正则表达式
            { pattern: /^[\u4e00-\u9fa5]{2,5}$/, message: '姓名必须是2-5个汉字', trigger: 'blur' },
          ]
        }
      };
    },
    methods: {
      submitForm(formName) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            this.judgeAdmin();
          } else {
            console.log('error submit!!');
            return false;
          }
        });
      },
      resetForm(formName) {
        this.$refs[formName].resetFields();
      },
      //将表单数据提交到数据库
      judgeAdmin() {
        let that = this;
        //执行Axios请求
        axios.post(that.baseURL + 'register/', that.adminForm)
          .then(res => {
            if (res.data.code == 1) {
              window.location.replace("http://101.34.58.126:5500/login.html");
              //提示
              that.$message({
                message: '注册成功',
                type: 'success'
              });
            } else {
              //失败的提示
              that.$message.error(res.data.msg);
            }
          })
          .catch(err => {
            console.log(err);
            that.$message.error("校验时后端查询出现异常");
          });
      }
      
    }
  
  })
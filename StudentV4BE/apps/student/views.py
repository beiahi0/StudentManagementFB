from io import BytesIO

from django import forms
from django.shortcuts import render, redirect

from student import models
from student.models import Student, Teacher, Class, Admin
# 引入json模块封装返回的数据 JsonResponse
from django.http import JsonResponse, HttpResponse
# 引入json模块
import json
# 导入Q查询
from django.db.models import Q

from student.utils.code import check_code
from student.utils.encrpy import md5
from utils.getRandom import get_random_str

from django.conf import settings
import os


# Create your views here.
def get_students(request):
    """获取所有学生的信息"""
    try:
        # 使用ORM获取所有学生的信息
        obj_student = Student.objects.all().values()
        # 把结果转为List
        students = list(obj_student)
        # 以json形式封装返回数据
        return JsonResponse({'code': 1, 'data': students})
    except Exception as e:
        # 如果出现异常，返回
        return JsonResponse({'code': 0, 'msg': "获取学生信息出现异常：" + str(e)})


def query_students(request):
    """查询学生信息"""
    # 使用ORM获取条件查询的学生信息，axios默认json格式,字典类型('inputstr'),data['inputstr'] 可以取出传递的值
    data = json.loads(request.body.decode('utf-8'))
    print(data)
    try:
        # 使用ORM获取满足条件的学生信息，并把对象转为字典格式,由于采用的是“或者”的关系采用Q查询，需要导包
        obj_students = Student.objects.filter(
            Q(sno__icontains=data['inputstr']) | Q(name__icontains=data['inputstr']) |
            Q(gender__icontains=data['inputstr']) | Q(birthday__icontains=data['inputstr']) |
            Q(mobile__icontains=data['inputstr']) | Q(email__icontains=data['inputstr']) |
            Q(address__icontains=data['inputstr']) | Q(dept__icontains=data['inputstr'])).values()
        # 把结果转为List
        students = list(obj_students)
        # 以json形式封装返回数据
        return JsonResponse({'code': 1, 'data': students})
    except Exception as e:
        # 如果出现异常，返回
        return JsonResponse({'code': 0, 'msg': "查询学生信息出现异常：" + str(e)})


def is_exists_sno(request):
    """判断学号是否存在"""
    # 接收传递过来的学号
    try:
        data = json.loads(request.body.decode('utf-8'))
        obj_students = Student.objects.filter(sno=data['sno'])
        if obj_students.count() == 0:
            return JsonResponse({'code': 1, 'exists': False})
        else:
            return JsonResponse({'code': 1, 'exists': True})
    except Exception as e:
        return JsonResponse({'code': 0, 'msg': "校验学号失败：" + str(e)})


def add_student(request):
    """添加学生到数据库"""
    # 接收前端传递过来的值
    data = json.loads(request.body.decode('utf-8'))
    try:
        # 添加到数据库
        obj_student = Student(
            sno=data['sno'], name=data['name'], gender=data['gender'],
            birthday=data['birthday'], mobile=data['mobile'], email=data['email'],
            address=data['address'], dept=data['dept']
        )
        # 执行添加
        obj_student.save()
        # 使用ORM获取所有学生的信息
        obj_student = Student.objects.all().values()
        # 把结果转为List
        students = list(obj_student)
        # 以json形式封装返回数据
        return JsonResponse({'code': 1, 'data': students})
    except Exception as e:
        return JsonResponse({'code': 0, 'msg': "添加到数据库异常" + str(e)})


def update_student(request):
    """修改学生信息"""
    # 接收前端传递过来的值
    data = json.loads(request.body.decode('utf-8'))
    try:
        # 查找要修改的学生信息
        obj_student = Student.objects.get(sno=data['sno'])
        # 依次修改
        obj_student.name = data['name']
        obj_student.gender = data['gender']
        obj_student.birthday = data['birthday']
        obj_student.mobile = data['mobile']
        obj_student.email = data['email']
        obj_student.address = data['address']
        obj_student.dept = data['dept']
        # 保存到数据库中
        obj_student.save()
        # 使用ORM获取所有学生的信息
        obj_student = Student.objects.all().values()
        # 把结果转为List
        students = list(obj_student)
        # 以json形式封装返回数据
        return JsonResponse({'code': 1, 'data': students})
    except Exception as e:
        return JsonResponse({'code': 0, 'msg': "修改到数据库异常" + str(e)})


def delete_student(request):
    """删除一条学生信息"""
    # 接收前端传递过来的值
    data = json.loads(request.body.decode('utf-8'))
    try:
        # 查找要修改的学生信息
        obj_student = Student.objects.get(sno=data['sno'])
        # 删除
        obj_student.delete()
        # 使用ORM获取所有学生的信息
        obj_student = Student.objects.all().values()
        # 把结果转为List
        students = list(obj_student)
        # 以json形式封装返回数据
        return JsonResponse({'code': 1, 'data': students})
    except Exception as e:
        return JsonResponse({'code': 0, 'msg': "删除学生信息写入数据库异常" + str(e)})


def delete_students(request):
    """批量删除"""
    # 接收前端传递过来的值
    data = json.loads(request.body.decode('utf-8'))
    try:
        # 变量传递的集合
        for one_student in data['student']:
            obj_student = Student.objects.get(sno=one_student['sno'])
            # 执行删除
            obj_student.delete()
        # 获取删除后的结果
        # 使用ORM获取所有学生的信息
        obj_student = Student.objects.all().values()
        # 把结果转为List
        students = list(obj_student)
        # 以json形式封装返回数据
        return JsonResponse({'code': 1, 'data': students})
    except Exception as e:
        return JsonResponse({'code': 0, 'msg': "批量删除删除学生信息写入数据库异常" + str(e)})


def upload(request):
    """接收上传的文件"""
    # 接收上传的文件 avatar前端传进来
    rev_file = request.FILES.get('avatar')
    # 判断是否有文件
    if not rev_file:
        return JsonResponse({'code': 0, 'msg': '图片不存在'})
    # 获得一个唯一的名字：uuid+ha
    new_name = get_random_str()
    # 准备写入的url
    file_path = os.path.join(settings.MEDIA_ROOT, new_name + os.path.splitext(rev_file)[1])
    # 开始写入到本地磁盘
    try:
        f = open(file_path, 'wb')
        # 如果文件较大多次写入
        for i in rev_file.chunks():
            f.write(i)
        # 关闭
        f.close()
        # 返回照片名称
        return JsonResponse({'code': 1, 'name': new_name + os.path.splitext(rev_file)[1]})
    except Exception as e:
        return JsonResponse({'code': 0, 'msg': str(e)})


def get_teachers(request):
    """获取所有老师的信息"""
    try:
        # 使用ORM获取所有老师的信息
        obj_teacher = Teacher.objects.all().values()
        # 把结果转为List
        teachers = list(obj_teacher)
        # 以json形式封装返回数据
        return JsonResponse({'code': 1, 'data': teachers})
    except Exception as e:
        # 如果出现异常，返回
        return JsonResponse({'code': 0, 'msg': "获取教师信息出现异常：" + str(e)})


def query_teachers(request):
    """查询教师信息"""
    # 使用ORM获取条件查询的学生信息，axios默认json格式,字典类型('inputstr'),data['inputstr'] 可以取出传递的值
    data = json.loads(request.body.decode('utf-8'))
    print(data)
    try:
        # 使用ORM获取满足条件的学生信息，并把对象转为字典格式,由于采用的是“或者”的关系采用Q查询，需要导包
        obj_teachers = Teacher.objects.filter(
            Q(tno__icontains=data['inputstr']) | Q(name__icontains=data['inputstr']) |
            Q(gender__icontains=data['inputstr']) |
            Q(mobile__icontains=data['inputstr']) | Q(email__icontains=data['inputstr']) |
            Q(researchField__icontains=data['inputstr'])).values()
        # 把结果转为List
        teachers = list(obj_teachers)
        # 以json形式封装返回数据
        return JsonResponse({'code': 1, 'data': teachers})
    except Exception as e:
        # 如果出现异常，返回
        return JsonResponse({'code': 0, 'msg': "查询学生信息出现异常：" + str(e)})


def is_exists_tno(request):
    """判断职工号是否存在"""
    # 接收传递过来的学号
    try:
        data = json.loads(request.body.decode('utf-8'))
        obj_teachers = Teacher.objects.filter(tno=data['tno'])
        if obj_teachers.count() == 0:
            return JsonResponse({'code': 1, 'exists': False})
        else:
            return JsonResponse({'code': 1, 'exists': True})
    except Exception as e:
        return JsonResponse({'code': 0, 'msg': "校验职工号失败：" + str(e)})


def add_teacher(request):
    """添加教师到数据库"""
    # 接收前端传递过来的值
    data = json.loads(request.body.decode('utf-8'))
    try:
        # 添加到数据库
        obj_teacher = Teacher(
            tno=data['tno'], name=data['name'], gender=data['gender'],
            mobile=data['mobile'], email=data['email'],
            researchField=data['researchField']
        )
        # 执行添加
        obj_teacher.save()
        # 使用ORM获取所有学生的信息
        obj_teacher = Teacher.objects.all().values()
        # 把结果转为List
        teachers = list(obj_teacher)
        # 以json形式封装返回数据
        return JsonResponse({'code': 1, 'data': teachers})
    except Exception as e:
        return JsonResponse({'code': 0, 'msg': "添加到数据库异常" + str(e)})


def update_teacher(request):
    """修改教师信息"""
    # 接收前端传递过来的值
    data = json.loads(request.body.decode('utf-8'))
    try:
        # 查找要修改的学生信息
        obj_teacher = Teacher.objects.get(tno=data['tno'])
        # 依次修改
        obj_teacher.name = data['name']
        obj_teacher.gender = data['gender']
        obj_teacher.mobile = data['mobile']
        obj_teacher.email = data['email']
        obj_teacher.researchField = data['researchField']
        # 保存到数据库中
        obj_teacher.save()
        # 使用ORM获取所有学生的信息
        obj_teacher = Teacher.objects.all().values()
        # 把结果转为List
        teachers = list(obj_teacher)
        # 以json形式封装返回数据
        return JsonResponse({'code': 1, 'data': teachers})
    except Exception as e:
        return JsonResponse({'code': 0, 'msg': "修改到数据库异常" + str(e)})


def delete_teacher(request):
    """删除一条教师信息"""
    # 接收前端传递过来的值
    data = json.loads(request.body.decode('utf-8'))
    try:
        # 查找要修改的学生信息
        obj_teacher = Teacher.objects.get(tno=data['tno'])
        # 删除
        obj_teacher.delete()
        # 使用ORM获取所有学生的信息
        obj_teacher = Teacher.objects.all().values()
        # 把结果转为List
        teachers = list(obj_teacher)
        # 以json形式封装返回数据
        return JsonResponse({'code': 1, 'data': teachers})
    except Exception as e:
        return JsonResponse({'code': 0, 'msg': "删除学生信息写入数据库异常" + str(e)})


def delete_teachers(request):
    """批量删除"""
    # 接收前端传递过来的值
    data = json.loads(request.body.decode('utf-8'))
    try:
        # 变量传递的集合
        for one_teacher in data['teacher']:
            obj_teacher = Teacher.objects.get(tno=one_teacher['tno'])
            # 执行删除
            obj_teacher.delete()
        # 获取删除后的结果
        # 使用ORM获取所有学生的信息
        obj_teacher = Teacher.objects.all().values()
        # 把结果转为List
        teachers = list(obj_teacher)
        # 以json形式封装返回数据
        return JsonResponse({'code': 1, 'data': teachers})
    except Exception as e:
        return JsonResponse({'code': 0, 'msg': "批量删除删除学生信息写入数据库异常" + str(e)})


# 登录注册页面
class BootStrapForm(forms.Form):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for name, field in self.fields.items():
            if field.widget.attrs:
                field.widget.attrs["class"] = "form-control"
                field.widget.attrs["placeholder"] = field.label
            else:
                field.widget.attrs = {
                    "class": "form-control",
                    "placeholder": field.label
                }


class LoginForm(BootStrapForm):
    userName = forms.CharField(
        label="用户名",
        widget=forms.TextInput,
        required=True
    )
    password = forms.CharField(
        label="密码",
        widget=forms.PasswordInput(render_value=True),  # 不清空密码
        required=True
    )


def begin(request):
    return render(request, 'in.html')


def login(request):
    data = json.loads(request.body.decode('utf-8'))
    try:
        obj_admin = Admin.objects.get(userName=data['name'], password=data['pass'])
        if obj_admin is not None:
            return JsonResponse({'code': 1, 'msg': '登录成功'})
        else:
            return JsonResponse({'code': 0, 'msg': '用户名或密码错误'})

    except Exception as e:
        return JsonResponse({'code': 0, 'msg': '查询用户异常' + str(e)})


def register(request):
    data = json.loads(request.body.decode('utf-8'))
    try:
        obj_admin = Admin(userName=data['name'], password=data['pass'])
        obj_admin.save()
        return JsonResponse({'code': 1, 'msg': '注册成功'})

    except Exception as e:
        return JsonResponse({'code': 0, 'msg': '注册用户后端异常' + str(e)})


def get_classes(request):
    """获取所有课程的信息"""
    try:
        # 使用ORM获取所有老师的信息
        obj_class = Class.objects.all().values()
        # 把结果转为List
        classes = list(obj_class)
        # 以json形式封装返回数据
        return JsonResponse({'code': 1, 'data': classes})
    except Exception as e:
        # 如果出现异常，返回
        return JsonResponse({'code': 0, 'msg': "获取教师信息出现异常：" + str(e)})


def query_classes(request):
    """查询班级信息"""
    # 使用ORM获取条件查询的学生信息，axios默认json格式,字典类型('inputstr'),data['inputstr'] 可以取出传递的值
    data = json.loads(request.body.decode('utf-8'))
    print(data)
    try:
        # 使用ORM获取满足条件的学生信息，并把对象转为字典格式,由于采用的是“或者”的关系采用Q查询，需要导包
        obj_classes = Class.objects.filter(
            Q(classNo__icontains=data['inputstr']) | Q(className__icontains=data['inputstr'])).values()
        # 把结果转为List
        classes = list(obj_classes)
        # 以json形式封装返回数据
        return JsonResponse({'code': 1, 'data': classes})
    except Exception as e:
        # 如果出现异常，返回
        return JsonResponse({'code': 0, 'msg': "查询班级信息出现异常：" + str(e)})


def is_exists_classNo(request):
    """判断班级号是否存在"""
    # 接收传递过来的班级号
    try:
        data = json.loads(request.body.decode('utf-8'))
        obj_classes = Class.objects.filter(classNo=data['classNo'])
        if obj_classes.count() == 0:
            return JsonResponse({'code': 1, 'exists': False})
        else:
            return JsonResponse({'code': 1, 'exists': True})
    except Exception as e:
        return JsonResponse({'code': 0, 'msg': "校验班级号失败：" + str(e)})


def add_class(request):
    """添加教师到数据库"""
    # 接收前端传递过来的值
    data = json.loads(request.body.decode('utf-8'))
    try:
        # 添加到数据库
        obj_class = Class(
            classNo=data['classNo'], className=data['className']
        )
        # 执行添加
        obj_class.save()
        # 使用ORM获取所有学生的信息
        obj_class = Class.objects.all().values()
        # 把结果转为List
        classes = list(obj_class)
        # 以json形式封装返回数据
        return JsonResponse({'code': 1, 'data': classes})
    except Exception as e:
        return JsonResponse({'code': 0, 'msg': "添加到数据库异常" + str(e)})


def update_class(request):
    """修改教师信息"""
    # 接收前端传递过来的值
    data = json.loads(request.body.decode('utf-8'))
    try:
        # 查找要修改的学生信息
        obj_class = Class.objects.get(classNo=data['classNo'])
        # 依次修改
        obj_class.classNo = data['classNo']
        obj_class.className = data['className']
        # 保存到数据库中
        obj_class.save()
        # 使用ORM获取所有学生的信息
        obj_class = Class.objects.all().values()
        # 把结果转为List
        classes = list(obj_class)
        # 以json形式封装返回数据
        return JsonResponse({'code': 1, 'data': classes})
    except Exception as e:
        return JsonResponse({'code': 0, 'msg': "修改到数据库异常" + str(e)})


def delete_class(request):
    """删除一条教师信息"""
    # 接收前端传递过来的值
    data = json.loads(request.body.decode('utf-8'))
    try:
        # 查找要修改的学生信息
        obj_class = Class.objects.get(classNo=data['classNo'])
        # 删除
        obj_class.delete()
        # 使用ORM获取所有学生的信息
        obj_class = Class.objects.all().values()
        # 把结果转为List
        classes = list(obj_class)
        # 以json形式封装返回数据
        return JsonResponse({'code': 1, 'data': classes})
    except Exception as e:
        return JsonResponse({'code': 0, 'msg': "删除学生信息写入数据库异常" + str(e)})


def delete_classes(request):
    """批量删除"""
    # 接收前端传递过来的值
    data = json.loads(request.body.decode('utf-8'))
    try:
        # 变量传递的集合
        for one_class in data['class']:
            obj_class = Class.objects.get(classNo=one_class['classNo'])
            # 执行删除
            obj_class.delete()
        # 获取删除后的结果
        # 使用ORM获取所有学生的信息
        obj_class = Class.objects.all().values()
        # 把结果转为List
        classes = list(obj_class)
        # 以json形式封装返回数据
        return JsonResponse({'code': 1, 'data': classes})
    except Exception as e:
        return JsonResponse({'code': 0, 'msg': "批量删除删除学生信息写入数据库异常" + str(e)})

"""
URL configuration for StudentV4BE project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path
from student import views

urlpatterns = [
    path('', views.begin),

    path('login/', views.login),  # 登录界面
    path('register/', views.register),  # 注册
    path('admin/', admin.site.urls),
    path('students/', views.get_students),  # 获取所有学生的url
    path('students/query/', views.query_students),  # 查询学生信息的接口
    path('sno/check/', views.is_exists_sno),  # 校验学号是否存在
    path('student/add/', views.add_student),  # 添加学生信息的接口
    path('student/update/', views.update_student),  # 修改学生信息
    path('student/delete/', views.delete_student),  # 删除学生信息
    path('students/delete/', views.delete_students),  # 批量删除学生信息
    path('upload/', views.upload),  # 上传文件的接口
    # """教师url管理"""

    path('teachers/', views.get_teachers),  # 获取所有老师的url
    path('teachers/query/', views.query_teachers),  # 查询老师信息的接口
    path('tno/check/', views.is_exists_tno),  # 校验职工号号是否存在
    path('teacher/add/', views.add_teacher),  # 添加老师信息的接口
    path('teacher/update/', views.update_teacher),  # 修改老师信息
    path('teacher/delete/', views.delete_teacher),  # 删除老师信息
    path('teachers/delete/', views.delete_teachers),  # 批量删除老师信息
    # 班级url管理
    path('classes/', views.get_classes),  # 获取所有班级的url
    path('classes/query/', views.query_classes),  # 查询班级信息的接口
    path('classNo/check/', views.is_exists_classNo),  # 校验班级号号是否存在
    path('class/add/', views.add_class),  # 添加班级信息的接口
    path('class/update/', views.update_class),  # 修改班级信息
    path('class/delete/', views.delete_class),  # 删除班级信息
    path('classes/delete/', views.delete_classes),  # 批量删除班级信息
]

# 允许所有的media上传文件被访问
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

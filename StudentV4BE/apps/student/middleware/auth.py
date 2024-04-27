from django.http import HttpResponse
from django.utils.deprecation import MiddlewareMixin
from django.shortcuts import render, redirect

"""定义中间件，然后在setting文件中加入类的路径，中间件process_request方法如果有返回值则返回，反之继续向下执行代码"""


class AuthMiddlewareMixin(MiddlewareMixin):
    """中间件"""

    def process_request(self, request):
        """读取当前用户的登录信息，如果能读到，则说明已登陆"""
        """首先要排除不需要登陆就可以访问的页面"""
        """获取当前用户访问的url：request.path_info"""
        if request.path_info in ["/login/", "/image/code/"]:
            return
        info_dict = request.session.get("info")
        print(info_dict)
        if info_dict:
            return
        else:
            return redirect("/login/")

    def process_response(self, request, response):
        print("M1.走了")
        return response

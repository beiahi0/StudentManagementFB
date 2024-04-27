from django.core.exceptions import ValidationError
from app01 import models
from app01.utils.BootStrapModelForm import BootStrapModelForm


class UserModelForm(BootStrapModelForm):
    class Meta:
        # 获取UserInfo里面的参数
        model = models.UserInfo
        fields = ["name", "password", "age", "account", "create_time", "gender", "dept_id"]


class PrettyNumModelForm(BootStrapModelForm):
    class Meta:
        model = models.PrettyNum
        fields = ["mobile", "price", "level", "status"]

    def clean_mobile(self):
        txt_mobile = self.cleaned_data["mobile"]
        exist = models.PrettyNum.objects.exclude(id=self.instance.pk).filter(mobile=txt_mobile).exists()
        if exist:
            raise ValidationError("手机号已存在")
        return txt_mobile

from django.db import models


# Create your models here.
class Student(models.Model):
    gender_choices = (('男', '男'), ('女', '女'))
    sno = models.IntegerField(db_column="SNo", primary_key=True, null=False)
    name = models.CharField(db_column="SName", max_length=100, null=False)
    gender = models.CharField(db_column="Gender", max_length=100, choices=gender_choices)
    birthday = models.DateField(db_column="Birthday", null=False)
    mobile = models.CharField(db_column="Mobile", max_length=100)
    email = models.CharField(db_column="Email", max_length=100)
    address = models.CharField(db_column="Address", max_length=200)
    ''''''
    dept = models.CharField(db_column="Sdept", max_length=100, default='null')
    # dept = models.ForeignKey(to='Class', on_delete=models.CASCADE)
    ''''''

    class Meta:
        managed = True
        db_table = "Student"

    def __str__(self):
        return "学号：%s\t姓名：%s\t性别：%s" % (self.sno, self.name, self.gender)


class Teacher(models.Model):
    gender_choices = (('男', '男'), ('女', '女'))
    tno = models.IntegerField(db_column="TNo", primary_key=True, null=False)
    name = models.CharField(db_column="TName", max_length=100, null=False)
    gender = models.CharField(db_column="Gender", max_length=100, choices=gender_choices)
    # birthday = models.DateField(db_column="Birthday", null=False)
    mobile = models.CharField(db_column="Mobile", max_length=100)
    email = models.CharField(db_column="Email", max_length=100)
    researchField = models.CharField(db_column="researchField", max_length=200)

    class Meta:
        managed = True
        db_table = "Teacher"

    def __str__(self):
        return "职工号：%s\t姓名：%s" % (self.tno, self.name)


class Class(models.Model):
    classNo = models.IntegerField(db_column="classNo", primary_key=True, null=False)
    className = models.CharField(db_column="className", null=False, max_length=100)

    class Meta:
        managed = True
        db_table = "Class"

    def __str__(self):
        return self.className


class Admin(models.Model):
    # admin_id=models.IntegerField(db_column="admin_id",primary_key=True,null=False,max_length=100)
    userName = models.CharField(db_column="userName", primary_key=True, null=False, max_length=100)
    password = models.CharField(db_column="password", null=False, max_length=100)

    class Meta:
        managed = True
        db_table = "Admin"

    def __str__(self):
        return "管理员名称：%s\t密码：%s" % (self.userName, self.password)

# Generated by Django 4.2.6 on 2023-12-19 15:43

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('student', '0006_alter_class_table'),
    ]

    operations = [
        migrations.AlterField(
            model_name='student',
            name='dept',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='student.class'),
        ),
    ]

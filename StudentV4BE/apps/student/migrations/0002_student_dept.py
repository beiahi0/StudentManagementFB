# Generated by Django 4.2.6 on 2023-12-18 14:01

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('student', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='student',
            name='dept',
            field=models.CharField(db_column='Sdept', default='null', max_length=100),
        ),
    ]
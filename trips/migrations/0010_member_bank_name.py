# Generated by Django 4.2 on 2024-10-07 16:17

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('trips', '0009_alter_member_is_participate'),
    ]

    operations = [
        migrations.AddField(
            model_name='member',
            name='bank_name',
            field=models.CharField(default='', max_length=15),
        ),
    ]

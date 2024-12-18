# Generated by Django 5.1 on 2024-08-25 16:28

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Payment',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('amount', models.IntegerField()),
                ('pay_time', models.DateTimeField()),
                ('mutual', models.CharField(max_length=30)),
                ('category', models.CharField(default='', max_length=10)),
                ('bank_account', models.CharField(default='', max_length=30)),
            ],
        ),
    ]

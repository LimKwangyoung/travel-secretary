# Generated by Django 4.2 on 2024-10-07 14:00

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('trips', '0008_trip_image_url'),
    ]

    operations = [
        migrations.AlterField(
            model_name='member',
            name='is_participate',
            field=models.BooleanField(default=False),
        ),
    ]

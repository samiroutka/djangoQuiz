# Generated by Django 4.1.3 on 2022-12-16 12:49

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('questions', '0002_questions_answered_or_not'),
    ]

    operations = [
        migrations.AddField(
            model_name='questions',
            name='image',
            field=models.ImageField(blank=True, upload_to='questions/images'),
        ),
    ]
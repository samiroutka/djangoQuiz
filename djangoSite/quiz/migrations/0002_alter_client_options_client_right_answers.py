# Generated by Django 4.1.3 on 2022-12-12 17:16

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('quiz', '0001_initial'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='client',
            options={'verbose_name': 'клиентa', 'verbose_name_plural': 'клиенты'},
        ),
        migrations.AddField(
            model_name='client',
            name='right_answers',
            field=models.FloatField(blank=True, null=True, verbose_name='правильные_ответы'),
        ),
    ]
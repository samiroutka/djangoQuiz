from django.db import models

class client(models.Model):
  nickname = models.CharField(max_length=20)
  right_answers = models.IntegerField(default=0, null=True, blank=True, verbose_name='правильные_ответы')
  current_answer = models.BooleanField(default=False)

  class Meta:
    verbose_name = 'клиентa'
    verbose_name_plural = 'клиенты'

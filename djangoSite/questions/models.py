from django.db import models

class questions(models.Model):
  number_of_question = models.IntegerField(null=True, blank=True, verbose_name='какой по счёту данный вопрос')
  question = models.CharField(max_length=50)
  image = models.ImageField(blank=True, upload_to='questions/images')
  answer1 = models.CharField(max_length=50)
  answer2 = models.CharField(max_length=50)
  answer3 = models.CharField(max_length=50)
  number_of_correct_answer = models.IntegerField(null=True, blank=True, verbose_name='номер_правильного_ответа')
  answered_or_not = models.BooleanField(default=False)

  class Meta:
    verbose_name = 'вопрос'
    verbose_name_plural = 'вопросы'
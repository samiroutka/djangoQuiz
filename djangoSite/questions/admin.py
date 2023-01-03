from django.contrib import admin
from .models import *

class questionsAdmin(admin.ModelAdmin):
  list_display = ['number_of_question', 'question', 'number_of_correct_answer', 'answered_or_not']

admin.site.register(questions, questionsAdmin)

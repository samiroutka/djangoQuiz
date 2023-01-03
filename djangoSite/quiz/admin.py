from django.contrib import admin
from .models import *

class clientAdmin(admin.ModelAdmin):
  list_display = ['nickname', 'current_answer']

admin.site.register(client, clientAdmin)

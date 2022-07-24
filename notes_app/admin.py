from django.contrib import admin
from .models import *

class UserAdmin(admin.ModelAdmin):
    list_display = ("id", "username", "first_name", "last_name", "email")

class NotesAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "deleted", "archive", "author")

class LabelsAdmin(admin.ModelAdmin):
    list_display = ("id", "name","author")

# Register your models here.
admin.site.register(User, UserAdmin)
admin.site.register(Notes, NotesAdmin)
admin.site.register(Labels, LabelsAdmin)



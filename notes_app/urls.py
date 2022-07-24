from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name  = 'index'),
    path('label/<str:l_name>/<int:l_id>', views.label_notes, name  = 'label_notes'),
    path('edit_label/<int:label_id>', views.edit_label, name  = 'edit_label'),
    path('delete_label/<str:label_name>/<int:label_id>', views.delete_label, name  = 'delete_label'),
    path('create_label/<str:label_created>', views.create_label, name  = 'create_label'),
    path('note/<int:id>', views.note, name  = 'note'),
    path('archive/<str:note_title>/<int:note_id>', views.archive_unarchive, name  = 'archive_unarchive'),
    path('all_archive', views.all_archive, name  = 'all_archive'),
    path('delete/<str:note_title>/<int:note_id>', views.delete_restore, name  = 'delete_restore'),
    path('save', views.save, name  = 'save'),
    path('all_deleted', views.all_deleted, name  = 'all_deleted'),
    path("accounts/login/", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register")
]
from django.db import models
from django.contrib.auth.models import AbstractUser
from datetime import datetime
import django.utils.timezone

# Create your models here.
class User(AbstractUser):
    pass
    def __str__(self):
        return f"{self.username}"


class Labels(models.Model):
    name = models.CharField(max_length = 20, unique=False)
    notes = models.ManyToManyField('Notes', blank = True, related_name = "notes_with_label")
    author = models.ForeignKey(User, on_delete=models.CASCADE, blank = False,)

    def __str__(self):
        return f"Label {self.id}: {self.name} Creator: {self.author.username}"

class Notes(models.Model):
    title = models.CharField(max_length = 250)
    content =models.TextField(max_length = 20000)
    archive = models.BooleanField(default = False)
    deleted = models.BooleanField(default = False)
    date_created = models.DateTimeField(default=django.utils.timezone.now)
    labels = models.ManyToManyField(Labels, blank = True, related_name = "note_labels")
    author = models.ForeignKey(User, on_delete=models.CASCADE, blank = False,)

    def __str__(self):
        return f"Note {self.id}: {self.title} "









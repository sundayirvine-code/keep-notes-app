from django.shortcuts import render
from django.http import HttpResponse
from django.urls import reverse
from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from .models import *
from django.http import JsonResponse
import json
from django.core.exceptions import ObjectDoesNotExist
from django.contrib.auth.decorators import login_required
# Create your views here.

user_id = 0
@login_required
def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))

#register a new user
def register(request):
    if request.method == "POST":
        username = request.POST["username"].capitalize()
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "notes_app/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "notes_app/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        message="Registration Successful"
        return HttpResponseRedirect(reverse("login"))
    else:
        return render(request, "notes_app/register.html")

#log in a registered user
def login_view(request):
    if request.method == "POST":
        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["pasw"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "notes_app/login.html", {
                "message": "Invalid username and/or password."
            })

    return render(request, "notes_app/login.html")

@login_required
def index(request):
    labels = Labels.objects.filter(author=request.user)
    NOTES={}
    notes = Notes.objects.filter(archive=False, deleted=False, author = request.user).order_by('-date_created')
    for note in notes.iterator():
        LABELS = []
        labelss = note.notes_with_label.all()
        for label in labelss.iterator():
            LABELS.append(label.name.upper())
        NOTES[note.id] = {
            "title": note.title,
            "content": note.content,
            "date_created": note.date_created,
            "LABELS":LABELS
        }
    
    return render(request, "notes_app/index.html",
    {
        "labels": labels,
        "notes": NOTES
    }
    )

# A function that returns all notes with a given label
def label_notes(request, l_name, l_id):
    try:
        label = Labels.objects.get(id = l_id)

        NOTES = {}
        notes = Notes.objects.filter(labels = label, archive=False, deleted=False,author = request.user)
        for note in notes.iterator():
            LABELS = []
            labels = note.notes_with_label.all()
            for label in labels.iterator():
                LABELS.append(label.name.upper())
            NOTES[note.id] = {
                "title": note.title,
                "content": note.content,
                "date_created": note.date_created,
                "labels": LABELS
            }

        label_names=[]
        labels = Labels.objects.all()
        for label in labels.iterator():
            label_names.append(label.name)  
        return JsonResponse(
        {
        "labels": label_names,
        "notes": NOTES

        }, status=201)

    except ObjectDoesNotExist:
        return JsonResponse({"error": "NOTE DOES NOT EXIST."}, status=400)


#function that retrieves all data of a given note
def note(request, id):
    try:
        note = Notes.objects.get(pk=id)
        return JsonResponse(
            {
                "content":note.content,
                "title":note.title
            }, status=201
        )
    except DoesNotExist:
         return JsonResponse({"error": "NOTE DOES NOT EXIST."}, status=400)


#function that archives and unarchives a note
def archive_unarchive(request, note_title, note_id):
    # This process must be via PUT
    if request.method != "PUT":
        return JsonResponse({"error": "PUT request required."}, status=400)
    
    # Data collection
    data = json.loads(request.body)
    archive_status = data.get("archive_status")

    opposite_status = 0
    if archive_status == True:
        opposite_status = False
    else:
        opposite_status = True

    #get to that particular note and update
    Notes.objects.filter(title__iexact = note_title, id=note_id,archive=archive_status).update(archive=opposite_status)
    status = Notes.objects.get(id = note_id).archive
    return JsonResponse({"message": "Process Successful.",
    "status": status,
    "note_id": note_id
    }, status=201)

 
#function that saves a note
def save(request):
    # This process must be via POST
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)
    
    # Data collection
    data = json.loads(request.body)
    content = data.get("content")
    title = data.get("title").strip()
    note_id = data.get("id")

    #get to that particular note and update
    
    try:
        n = Notes.objects.filter(id=note_id)
        n.update(title=title, content=content)
        #get the saved data
        note = Notes.objects.get(title__iexact = title, id=note_id)

        LABELS = []
        labels = note.notes_with_label.all()
        for label in labels.iterator():
            LABELS.append(label.name.upper())
        return JsonResponse({"message": "Save Process Successful.",
        "title": note.title,
        "content": note.content,
        "date_created": note.date_created,
        "labels": LABELS
        }, status=201)
    except ObjectDoesNotExist:
        #Save the note
        Notes(title=title, content=content, author=request.user).save()
        NOTES = {}
        notes = Notes.objects.filter(title=title, content=content)
        for note in notes.iterator():
            LABELS = []
            labels = note.notes_with_label.all()
            for label in labels.iterator():
                LABELS.append(label.name.upper())
            NOTES[note.id] = {
                "title": note.title,
                "content": note.content,
                "date_created": note.date_created,
                "labels": LABELS
            }
        return JsonResponse({"message": "New note created.",
        "notes": NOTES
        }, status=201)


#function that deletes and restores a note
def delete_restore(request, note_title, note_id):
    # This process must be via PUT
    if request.method != "PUT":
        return JsonResponse({"error": "PUT request required."}, status=400)
    
    # Data collection
    data = json.loads(request.body)
    delete_status = data.get("delete_status")

    opposite_status = 0
    if delete_status == True:
        opposite_status = False
    else:
        opposite_status = True
    #check if this note exists
    try:
        Notes.objects.filter(title__iexact = note_title, id=note_id,deleted=delete_status)
        #get to that particular note and update
        Notes.objects.filter(title__iexact = note_title, id=note_id,deleted=delete_status).update(deleted=opposite_status)
        status = Notes.objects.get(id = note_id).deleted
        return JsonResponse({"message": "Process Successful.",
        "status": status,
        "note_id": note_id
        }, status=201)
    except DoesNotExist:
        return JsonResponse({"message": "Process Unsuccessful. Note Does Not Exist",
        }, status=400)



#FUNCTION THAT RETRIEVES ALL ARCHIVED NOTES
def all_archive(request):
    # This process must be via GET
    if request.method != "GET":
        return JsonResponse({"error": "GET request required."}, status=400)

    #QUERY ALL ARCHIVED NOTES
    NOTES = {}
    archived = Notes.objects.filter(archive=True, deleted=False,author=request.user)
    for note in archived.iterator():
        #HAVE A LIST FOR ALL THE LABELS OF THIS note
        LABELS = []
        labels = note.notes_with_label.all()
        for label in labels.iterator():
            LABELS.append(label.name.upper())
        NOTES[note.id] = {
            "title": note.title,
            "content": note.content,
            "date_created": note.date_created,
            "labels": LABELS
        }
    

    return JsonResponse(
    {
    "notes": NOTES
    
    }, status=201)

#FUNCTION THAT RETRIEVES ALL DELETED NOTES
def all_deleted(request):
    # This process must be via GET
    if request.method != "GET":
        return JsonResponse({"error": "GET request required."}, status=400)

    #QUERY ALL ARCHIVED NOTES
    NOTES = {}
    deleted = Notes.objects.filter(deleted=True,author=request.user)
    for note in deleted.iterator():
        #HAVE A LIST FOR ALL THE LABELS OF THIS note
        LABELS = []
        labels = note.notes_with_label.all()
        for label in labels.iterator():
            LABELS.append(label.name.upper())
        NOTES[note.id] = {
            "title": note.title,
            "content": note.content,
            "date_created": note.date_created,
            "labels": LABELS
        }
    

    return JsonResponse(
    {
    "notes": NOTES
    
    }, status=201)


#FUNCTION THAT CREATES A NEW LABEL
def create_label(request, label_created):
    # This process must be via POST
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)
    try:
        if label_created:
            label = Labels(name=label_created, author=request.user)
            label.save()
        LABEL = Labels.objects.get(name=label_created)
    except IntegrityError:
        return JsonResponse({"error": "Your Label must be unique"}, status = 400)
    return JsonResponse(
    {
    "label_name": LABEL.name.upper(),
    "label_id": LABEL.id
    
    }, status=201)


#function that edits a particular label
def edit_label(request,label_id):
    # This process must be via POST
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)
    #data collection
    data = json.loads(request.body)
    current_label_name = data.get('current_label_name')
    edited_label_name = data.get('edited_label_name')
    #check that whatever is being edited exists
    try:
        label = Labels.objects.filter(pk=label_id, author=request.user)
        label.update(name=edited_label_name)
        saved_label = Labels.objects.get(pk=label_id)
        return JsonResponse(
        {
        "label_name": saved_label.name.upper(),
        "label_id": saved_label.id
        
        }, status=201)
    except ObjectDoesNotExist:
        return False


#function that deletes a label
def delete_label(request, label_name, label_id):
    #ensure the label exists
    try:
        label = Labels.objects.get(name__iexact=label_name, pk = label_id)
        label.delete()
        return JsonResponse(
        {
        'message': "record deleted successfully"
        }, status=201)
    except Labels.DoesNotExist:
        pass
    

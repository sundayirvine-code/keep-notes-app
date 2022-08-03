// function that creates word wrap after a number of  characters
function textFold(input, lineSize) {
  const output = []
  let outputCharCount = 0
  let outputCharsInCurrentLine = 0
  for (var i = 0; i < input.length; i++) {
    const inputChar = input[i]
    output[outputCharCount++] = inputChar
    if (inputChar === '\n') {
      outputCharsInCurrentLine = 0
    } else if (outputCharsInCurrentLine > lineSize-2) {
      output[outputCharCount++] = '\n'
      outputCharsInCurrentLine = 0
    } else {
      outputCharsInCurrentLine++
    }
  }
  return output.join('')
}

function input_button_disappear(){
  document.querySelector("#input_box").style.display = "none";
  document.querySelector("button").style.display = "none";
  document.querySelector("#create_label").style.display = "block";
}

//function that genarates csrf token
function getCookie(name) {
  let cookieValue = null;

  if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
          const cookie = cookies[i].trim();

          // Does this cookie string begin with the name we want?
          if (cookie.substring(0, name.length + 1) === (name + '=')) {
              cookieValue = decodeURIComponent(cookie.substring(name.length + 1));

              break;
          }
      }
  }

  return cookieValue;
}


// function that takes a note id and fetches all the data
function all_note_data(id,element){
  if(id=="big_note"){
    return
  }
  //go to this URL
  fetch(`/note/${id}`)
  //capture the result from the server and convert it to a JSON format
  .then(response => response.json())
  .then(result => { 
    //terget the content section and append result
    var last = element.firstElementChild.nextElementSibling.nextElementSibling;//meta
    last.lastElementChild.style.cursor="pointer"
    var second_last = element.firstElementChild.nextElementSibling;
    last.style.height="20%";
    last.style.border="1px solid rgba(255, 255, 255, 0.4)";
    last.style.borderTop="";
    last.style.borderRadius="5px";
    //make the metadata disappear
    last.lastElementChild.firstElementChild.style.display="none";//archive btn
    last.lastElementChild.firstElementChild.nextElementSibling.style.display="none";//delete btn
    last.lastElementChild.firstElementChild.nextElementSibling.nextElementSibling.style.display="none";//
    last.lastElementChild.lastElementChild.style.display="block";
    last.lastElementChild.lastElementChild.className="close"
    //element.lastElementChild.remove()
    //last.lastElementChild.lastElementChild.style.cursor="pointer";
    //make the section bigger
    element.setAttribute('id',"big_note");

    element.className=`${id}`;
    // remove the pre tag
    second_last.firstElementChild.remove();
    // create a text area and append the data
    var textarea = document.createElement('textarea');
    var input = document.createElement('input')
    input.value=result.title

    //remove title tag
    element.firstElementChild.firstElementChild.remove();
    input.style.width="100%"
    input.style.height="30px";
    element.firstElementChild.append(input)

    //textarea.setAttribute('class',"n_content");
    textarea.innerHTML = result['content'];
    textarea.style.width="100%";
    textarea.style.height="95%";
    textarea.style.boxShadow='';
    //append the textarea
    second_last.style.height="100%";
    second_last.style.background="#161616";
    second_last.append(textarea);

  })

  
}



//when you click outside the div, the note shrinks back
function shrink(){
  save_big_note();
  input_button_disappear()
  //close the notes with id = big_note
  var big_note = document.querySelector('#big_note');
  if(big_note == null){
    return
  }
  
  //return the meta data
  var last = big_note.lastElementChild;
  last.style.height="20%"
  //make the metadata disappear
  last.lastElementChild.firstElementChild.style.display="inline-block";
  last.lastElementChild.firstElementChild.nextElementSibling.style.display="inline-block";
  last.lastElementChild.firstElementChild.nextElementSibling.nextElementSibling.style.display="inline-block";
  last.lastElementChild.lastElementChild.style.display="none";
  last.style.border="";
  
  var id = big_note.getAttribute('class');
  big_note.id = id;
  big_note.className = "note";
 
  //heading
  var text = big_note.firstElementChild;
  let title = text.firstElementChild.value;
  //remove input
  text.firstElementChild.remove()
  let h1 = document.createElement('h1')
  h1.innerHTML=title;
  text.append(h1);
  //note_content
  var text2 = text.nextElementSibling;
  text2.style.height = "70%";
  // remove text area
  var cont = text2.firstElementChild.value;
  text2.firstElementChild.remove();
  // create pre element
  var pre = document.createElement("pre");
  pre.className="n_content";

  let new_line_count=0
  let conte=''
  for (let n of cont){
    if (new_line_count == 10){
      break
    }
          
    else{
      if (n == '\n'){
        new_line_count += 1
      }             
        conte += n
    }
          
  }
  
  let first = textFold(conte, 85);
  pre.innerHTML = first + `...`;
  text2.append(pre);
  
}



//function that saves note data
function save(note_id=null,note_title,content_){
  //url that saves the note
  fetch(`/save`, {
    method: 'POST',
    headers:{
      'Accept':'application/json',
      'Content-Type': 'application/json',
      'X-CSRFToken': getCookie('csrftoken')
    },
    body: JSON.stringify({
        title:note_title,
        id:note_id,
        content:content_,
        
    })
    })
  //capture the result from the server and convert it to a JSON format
  .then(response => response.json())
  .then(result => { 
    //console.log(result)
    //WHEN A NEW NOTE IS CREATED:
    if(result['message'] == 'New note created.'){
      document.querySelector('#create_note_title').border="none"
      //clear the title and textarea
      document.querySelector("#create_note_content").value = '';
      document.querySelector('#create_note_title').value = "";
      // RETURN TO ITS HEIGHT
      document.querySelector("#create_note_content").style.height = "50px"
      notes_object = result['notes'];
      Object.keys(notes_object).forEach(key =>{
        
        //BULD THE ENTIRE NOTE
        var new_node = note_builder(notes_object, key,false,false,1);
        //reference to parent node
        let create_div = document.querySelector('#create_note');
        let first_note_div = create_div.nextElementSibling;
        if(first_note_div != null){
          let parent_div = first_note_div.parentNode;
          console.log('parent',parent_div, 'first note',first_note_div, 'new node',new_node)
          parent_div.insertBefore(new_node,first_note_div);
          console.log('im not the first note')
          
        }
        if(first_note_div -= null){
          document.querySelector('#notes_bar').append(new_node);
          console.log('im the first note')
        }

    });
    if(result.message == 'Save Process Successful.'){
  
    }
        click_archive()
        click_delete()
        click_unarchive()
        click_note()
        close() 
        attach_label()   
    }

    
  })

}

// FUNCTION THAT SAVES DATA WRITTEN IN THE TEXT AREA
function save_big_note(){
  var big_note = document.querySelector('#big_note');
  if(big_note != null){
    var id = big_note.getAttribute('class');
    var title = big_note.firstElementChild.firstElementChild.value;
    var cont = big_note.firstElementChild.nextElementSibling.firstElementChild.value;
    save(id,title,cont);
  }
}
//FUNCTION THAT ADDS A CLICK EVENT ON THE CLOSE BUTTON
function close(){
  
  document.querySelectorAll('#close').forEach(close_button =>{
    var par = close_button.parentElement;
      par.onclick=function(){
        if(document.querySelector('#paste_labels') != null){document.querySelector('#paste_labels').remove()}
        if( close_button.getAttribute('class') == 'close'){
          close_button.click()
            save_big_note();
            shrink();
        }
        
      }
    input_button_disappear();
  })

}

// FUNCTION THAT ADDS A CLICK EVENT TO THE ENTIRE NOTE
function click_note(){
  
      input_button_disappear()
      document.querySelectorAll(".note").forEach(note =>{
        //add a click event on each note content
        var elem = note.firstElementChild.nextElementSibling;

        var handler = function(){
          if(document.querySelector('#paste_labels') != null){document.querySelector('#paste_labels').remove()}
          //shrink any open note
          if(document.querySelector('#big_note') != note && document.querySelector('#big_note') != null){
            //SHRINK THE NOTE
            shrink();
          }        
          //call a function that takes an id and outputs all the note data
          all_note_data(note.getAttribute('id'),note); 

          
        }
        elem.addEventListener("click",handler);
        close()
            
        //add a click event on each note title
        note.firstElementChild.onclick = function(){
          //shrink any open note
          if(document.querySelector('#big_note') != note && document.querySelector('#big_note') != null){
            shrink();
          }
          //call a function that takes an id and outputs all the note data
          all_note_data(note.getAttribute('id'),note);

        }
        
      })
}

// FUNCTION THAT ADDS A CLICK EVENT TO THE DELETE BUTTON
function click_delete(){
      save_big_note();
      input_button_disappear()
      document.querySelectorAll('#delete').forEach(delete_button => {
        delete_button.onclick = function(){
        //collect function arguments
        var note_id = this.parentElement.parentElement.parentElement.getAttribute('id');
        var note_title = this.parentElement.parentElement.parentElement.firstElementChild.firstElementChild.innerHTML;
        delete_(note_title, note_id, false,this.parentElement.parentElement.parentElement)
      }})
      
}

// add a click event on unarchive button
function click_unarchive(){
      save_big_note();
      input_button_disappear()
      document.querySelectorAll('#unarchive').forEach(unarchive_button => {
        unarchive_button.onclick = function(){
        //collect function arguments
        var note_id = this.parentElement.parentElement.parentElement.getAttribute('id');
        var note_title = this.parentElement.parentElement.parentElement.firstElementChild.firstElementChild.innerHTML;
        archive(note_title, note_id, true,this.parentElement.parentElement.parentElement)
      }})
}

function click_archive(){
  save_big_note();
  input_button_disappear()
  document.querySelectorAll('#archive').forEach(archive_button => {
    archive_button.onclick = function(){
    //collect function arguments
    var note_id = this.parentElement.parentElement.parentElement.getAttribute('id');
    var note_title = this.parentElement.parentElement.parentElement.firstElementChild.firstElementChild.innerHTML;
    archive(note_title, note_id, false,this.parentElement.parentElement.parentElement)
  }})
}




// function that archives or unarhives note
function archive(note_title, note_id, archive_status, this_note){
  save_big_note();
  fetch(`/archive/${note_title}/${note_id}`, {
    method: 'PUT',
    headers:{
      'Accept':'application/json',
      'Content-Type': 'application/json',
      'X-CSRFToken': getCookie('csrftoken')
    },
    body: JSON.stringify({
        note_title:note_title,
        note_id:note_id,
        archive_status: archive_status,
        csrfmiddlewaretoken:'{{csrf_token}}'
    })
    })
    // remove this note
    .then(response => response.json())
    .then(result => { 
      this_note.remove();
    })
}

// function that deletes and restores a note
function delete_(note_title, note_id, delete_status, this_note){
  save_big_note();
  fetch(`/delete/${note_title}/${note_id}`, {
    method: 'PUT',
    headers:{
      'Accept':'application/json',
      'Content-Type': 'application/json',
      'X-CSRFToken': getCookie('csrftoken')
    },
    body: JSON.stringify({
        note_title:note_title,
        note_id:note_id,
        delete_status: delete_status,
        csrfmiddlewaretoken:'{{csrf_token}}'
    })
    })
    // remove this note
    .then(response => response.json())
    .then(result => { 
      this_note.remove();
    })

}

//FUNCTION THAT REMOVES THE CURRENT NOTES BAR AND ADDS A NEW ONE
function remove_add_notes_bar(){
  //get the section that displays notes & remove it
  var notes_bar = document.querySelector('#notes_bar');
  notes_bar.remove();
  
  //create a new section to display notes & append it to the body tag
  var notes_bar = document.createElement('div');
  notes_bar.id="notes_bar";
  var body = document.querySelector('body');
  body.append(notes_bar)
}

// A FUNCTION THAT BUILDS AN ENTIRE NOTE
function note_builder(notes_object, key,arc = false, del = false, new_note = null){
  //extract note title
  var note_title = notes_object[key]['title']
  //create div to hold each note's data(title, content, date)
  var note = document.createElement('div');
  note.className='note'
  note.id = key;

  // holds the title
  var title_div = document.createElement('div');
  title_div.className = "note_title";
  var title_h1 = document.createElement('h1');
  title_h1.innerHTML = note_title;
  title_div.append(title_h1);
  note.append(title_div);
  
  
  //extract the content
  var note_content = notes_object[key]['content'];
  // capture the first  180 sub strings and text wrap at character 82
  //var first = note_content.substring(0,600);
  
  //first = first.replace(/(.{82})/g, "$1<br>");

  let new_line_count=0
  let conte=''
  for (let n of note_content){
    if (new_line_count == 10){
      break
    }
          
    else{
      if (n == '\n'){
        new_line_count += 1
      }             
        conte += n
    }
          
  }
  let first = textFold(conte, 85);
  //holds the content
  var notecontent = document.createElement('div');
  notecontent.className = 'note_content';
  var note_para = document.createElement('pre');
  note_para.className = 'n_content';
  // load the first data first
  note_para.innerHTML = first + `...`;
  notecontent.append(note_para);
  note.append(notecontent);
  
  //holds meta information
  var meta_info = document.createElement('div');
  meta_info.className = "meta_info";
  //var span = document.createElement('span');
  //span.className = "span1";
  //var pre = document.createElement('pre');
  //var date_created = notes_object[key]['date_created'];
  //span.innerHTML = date_created;
  //span.append(pre);
  //meta_info.append(span);
  note.append(meta_info);

  // 2. LABELS OF THIS NOTE
  var meta_left = document.createElement('div');
  var meta_right = document.createElement('div');
  meta_left.className = "meta_left";
  meta_right.className = "meta_right";
  if(arc == false && del == false){
    var del = document.createElement('span');
    del.id="delete"
    del.innerHTML = 'DELETE'
    var edit = document.createElement('span');
    edit.innerHTML = 'EDIT'
    var l = document.createElement('span');
    l.innerHTML = 'LABELS'
    l.id = "attach_label"
    
    var archive = document.createElement('span');
    archive.id='archive'
    archive.innerHTML = 'ARCHIVE'
    var close = document.createElement('span');
    close.id="close"
    close.innerHTML = 'CLOSE'
    meta_right.append(archive);
    meta_right.append(del);
    meta_right.append(l);
    meta_right.append(close);
  }
  if(arc == true && del == false){
    var del = document.createElement('span');
    del.id="delete"
    del.innerHTML = 'DELETE'
    var edit = document.createElement('span');
    edit.innerHTML = 'EDIT'
    var unarchive = document.createElement('span');
    unarchive.id='unarchive'
    unarchive.innerHTML = 'UNARCHIVE'
    var close = document.createElement('span');
    close.id="close"
    close.innerHTML = 'CLOSE'
    meta_right.append(unarchive);
    meta_right.append(del);
    meta_right.append(edit);
    meta_right.append(close);
    var note_labels = notes_object[key]['labels'];

  }
  if(del == true){
    var restore = document.createElement('span');
    restore.id = 'restore'
    restore.innerHTML = 'RESTORE'
    var edit = document.createElement('span');
    edit.innerHTML = 'EDIT'
    var close = document.createElement('span');
    close.id="close";
    close.innerHTML = 'CLOSE';
    meta_right.append(restore);
    meta_right.append(edit);
    meta_right.append(close);
  }
  var note_labels = notes_object[key]['labels'];
  note_labels.forEach(label=>{
    var span2 = document.createElement('span');
    span2.className = "span2"
    span2.innerHTML = label;
    meta_left.append(span2)
    
  });
  meta_info.append(meta_left);
  meta_info.append(meta_right);
  
  if(new_note == null){
    notes_bar.append(note);
  }
  if(new_note == 1){
    return note;
  }
  
}

// function that fetches all archived notes
function all_archive(){
  save_big_note();
  fetch(`/all_archive`, {
    method: 'GET',
    })
    // DISPLAY NOTES
    .then(response => response.json())
    .then(result => { 
      var notes_object = result['notes'];
      //CALL A FUNCTION THAT REMOVES THE CURRENT NOTES BAR AND APPENDS ANOTHER
      remove_add_notes_bar();
      //loop through the part of our result containing the notes
      Object.keys(notes_object).forEach(key =>{
        
        //BULD THE ENTIRE NOTE
        note_builder(notes_object, key, true,false);

    });

    click_unarchive()
    click_delete()
    click_note()
    close()

    })
    
}

// function that fetches all deleted notes
function all_deleted(){
  save_big_note();
  fetch(`/all_deleted`, {
    method: 'GET',
    })
    // DISPLAY NOTES
    .then(response => response.json())
    .then(result => { 
      var notes_object = result['notes'];
      //CALL A FUNCTION THAT REMOVES THE CURRENT NOTES BAR AND APPENDS ANOTHER
      remove_add_notes_bar();
      //loop through the part of our result containing the notes
      Object.keys(notes_object).forEach(key =>{

        //BULD THE ENTIRE NOTE
        note_builder(notes_object, key, false, true);

    });
    // add a click event on restore button
    document.querySelectorAll('#restore').forEach(restore_button => {
      restore_button.onclick = function(){
      //collect function arguments
      var note_id = this.parentElement.parentElement.parentElement.getAttribute('id');
      var note_title = this.parentElement.parentElement.parentElement.firstElementChild.firstElementChild.innerHTML;
      delete_(note_title, note_id, true,this.parentElement.parentElement.parentElement)
    }})

    click_note()
    close()

    })
    
}

// function that fetches notes when a given label name is clicked
function label_notes(label_name, id){
    save_big_note();

    //go to this URL
    fetch(`/label/${label_name}/${id}`)
    //capture the result from the server and convert it to a JSON format
    .then(response => response.json())
    .then(result => { 
            var notes_object = result['notes'];

            //CALL A FUNCTION THAT REMOVES THE CURRENT NOTES BAR AND APPENDS ANOTHER
            remove_add_notes_bar();

            //loop through the part of our result containing the notes
            Object.keys(notes_object).forEach(key =>{

                //BULD THE ENTIRE NOTE
                note_builder(notes_object, key);

            });

            click_note()
            click_archive()
            click_delete()
            close()
    });

}// END OF LABEL_NOTES FUNCTION

//function that allows us to edit a label name
function label_icons_edit(label_edit_icon){
  //targets the label
  let label_to_edit = label_edit_icon.parentElement;
  let label_id = label_to_edit.id;
  label_to_edit.id = "input_element_to_edit"
  //replace p with input
  let p_tag = label_to_edit.firstElementChild
  let p_tag_content = p_tag.innerHTML;
  p_tag.style.display="none";
  let input_element = document.createElement('input')
  input_element.setAttribute('autocomplete', 'off')
  input_element.id = "input_element_edit"
  input_element.value = p_tag_content;
   //remove edit and delete
   let last = label_to_edit.lastElementChild;
   let prev = last.previousElementSibling;
   last.style.display="none";
   prev.style.display="none"
  label_to_edit.append(input_element)
  let save_edited_label_button = prev.previousElementSibling
  save_edited_label_button.style.display="inline";
  save_edited_label_button.onclick = function(e){
    e.stopPropagation();
  let edited_label_name = input_element.value.trim()
  if(edited_label_name == "" || edited_label_name.length > 250){
    input_element.style.border="1px solid red"
    return
  }
  else{
        //go to server
        fetch(`/edit_label/${label_id}`, {
          method: 'POST',
          headers:{
            'Accept':'application/json',
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
          },
          body: JSON.stringify({
              csrfmiddlewaretoken:'{{csrf_token}}',
              current_label_name:p_tag_content,
              edited_label_name:edited_label_name
          })
    
          })
          //capture the result from the server and convert it to a JSON format
        .then(response => response.json())
        .then(result => { 
            //return hover
            label_to_edit.id=label_id;
            //remove the input box
            input_element.remove();
            //return icons
            last.style.display="";
            prev.style.display="";
            p_tag.style.display="inline";
            p_tag.innerHTML= result.label_name;
            p_tag.nextElementSibling.style.display="none";
       
            
     
        });
  }

  }
 //remove onclick event
 input_element.onclick = function(e){
  e.stopPropagation();
}
 
}

function click_edit_icon(){
  document.querySelectorAll(".label_icons_edit").forEach(label_edit_icon =>{
    label_edit_icon.onclick = function(e){
    e.stopPropagation();
    label_icons_edit(label_edit_icon)
  }
 })
}

//function that deletes a label
function del_leb(label_delete){
  //collect data
  var p = label_delete.parentElement;
  var label_name = p.firstElementChild.innerHTML;
  var label_id = p.id;

  //go to the server
  fetch(`delete_label/${label_name}/${label_id}`)
  .then(response => response.json())
  .then(result => { 
    if(result.message == 'record deleted successfully'){
      //remove element
      p.remove();
    }
  })
  
}

function click_delete_icon(){
  // click event to delete a label
  document.querySelectorAll(".label_icons_delete").forEach(label_delete =>{
    label_delete.onclick = function(e){
      e.stopPropagation();
      del_leb(label_delete)
    }
  })
}

//ATTACH LABEL FUNCTION
function attach_label(){
      //a click event on each note labels button
      document.querySelectorAll('#attach_label').forEach(btn =>{
        btn.onclick = ()=>{
          console.log('give me a list of all labels')
        document.querySelectorAll('#paste_labels').forEach(s=>{
            if( s != null){
              //close all open selects
              s.remove()
    
            }
          })
          
          //ask the server for all the labels
          fetch(`/all_labels`, {
          })
        .then(response => response.json())
        .then(result => { 
          //console.log(result)
          let paste_labels = document.createElement('div');
          paste_labels.id ="paste_labels"
          let select = document.createElement('select');
          select.setAttribute('name', 'labels')
          select.setAttribute('id', 'all_user_labels')
          let disabled_option = document.createElement('option')
          disabled_option.setAttribute('selected','true')
          disabled_option.setAttribute('disabled','disabled')
          
          disabled_option.innerHTML='Choose A Label'
          select.append(disabled_option)
          let parent_note = btn.parentElement.parentElement.parentElement;
          let note_id = parent_note.id
          for(let x of result.labels ){
          //console.log(x)
          //get the section to append the labels
          let option = document.createElement('option')
          option.setAttribute('value', x)
          option.innerHTML=x
          select.append(option)
          }
          paste_labels.append(select)
          parent_note.append(paste_labels)
  
          //onChange Event
          document.querySelector('#all_user_labels').onchange=function(){
            let x = document.querySelector('#all_user_labels').value;
            //go to the server
            fetch(`/attach_label/${x}`, {
              method: 'POST',
              headers:{
                'Accept':'application/json',
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
              },
                body: JSON.stringify({
                  note_id:note_id ,
                  csrfmiddlewaretoken:'{{csrf_token}}'
              })
              })
            .then(response => response.json())
            .then(result => { 
              console.log(result.labels)
              //appedn label to the note
              let meta_left = parent_note.firstElementChild.nextElementSibling.nextElementSibling.firstElementChild
              let span = document.createElement('span')
              span.innerHTML = result.labels
              meta_left.append(span)
              document.querySelectorAll('#paste_labels').forEach(s=>{
                if( s != null){
                  //close all open selects
                  s.remove()
        
                }
              })
            })
          }
        })
  
        }
     
  
      })
}
document.addEventListener("DOMContentLoaded", function(){
    //FUNCTION THAT ATTACHES LABELS
    attach_label();
    // add a click event on the header section & the notes that have the class note
    document.querySelector('#header').onclick = function(){
      
      shrink();     
    
    }
    click_note()
    click_archive()
    click_delete()
    
    
    // add a click event on archive link
    document.querySelector('#archive_link').onclick = function(){
      save_big_note();
      input_button_disappear();
      all_archive();
      close()
    }

     // add a click event on delete link
     document.querySelector('#delete_link').onclick = function(){
      save_big_note();
      input_button_disappear();
      all_deleted();
      close()
    }

    //add a click event on create label button
    document.querySelector("#create_label_button").onclick = function(){
      save_big_note();

      //once clicked, submit the content in the input box
      var label_created = document.querySelector("#input_box").value;
      if(label_created == '' || label_created.length > 20){
        //red outline
        document.querySelector("#input_box").style.border="1px solid red";
        //return message
        var create_label = document.querySelector('#create_label');
        create_label.parentElement.style.display="block";
        create_label.innerHTML = "Label name must be between 1 and 20 characters long"

      }
      else{
              //go to the server
      fetch(`/create_label/${label_created}`, {
        method: 'POST',
        headers:{
          'Accept':'application/json',
          'Content-Type': 'application/json',
          'X-CSRFToken': getCookie('csrftoken')
        },
          body: JSON.stringify({
          csrfmiddlewaretoken:'{{csrf_token}}'
        })
        })
      //capture the result from the server and convert it to a JSON format
      .then(response => response.json())
      .then(result => { 
        //console.log(result)
        if(result.error == 'Label is unique'){
        
        //COLLECT DATA FROM DATABASE
        var label_id = result['label_id'];
        var label = result["label_name"];
        
        var label_container = document.querySelector("#label_container");
        //create div tag to hold the label
        var label_link = document.createElement('div');
        label_link.className = "label_link";
        label_link.id = label_id;

        //create  p tag
        var l_name = document.createElement('p');
        l_name.className = "l_name";
        l_name.innerHTML = label;
        l_name.id = label_id;
        
        //append p tag to div tag
        label_link.append(l_name);

        //create the 3 span tags
        let span_save = document.createElement('span');
        let span_delete = document.createElement('span');
        let span_edit = document.createElement('span');
        span_save.innerHTML="SAVE";
        span_delete.innerHTML="DELETE";
        span_edit.innerHTML="EDIT";
        span_save.classList.add('label_icons','label_icons_save')
        span_save.style.display="none";
        span_delete.classList.add('label_icons','label_icons_delete')
        span_edit.classList.add('label_icons','label_icons_edit')

        label_link.append(span_save,span_delete,span_edit);
        
        //append div tag to label_container
        label_container.append(label_link)

        //make the button and input box dissapear
       input_button_disappear();

        //make the create label link appear
        document.querySelector(".label_link_create").style.display="block";
        var c_l = document.querySelector("#create_label");
        c_l.style.display = "block";
        c_l.innerHTML="CREATE LABEL"

        //add a click event on this link
        label_link.onclick = function(){
          save_big_note();
          // go to the server
          var label_name = label_link.firstElementChild.innerHTML;
          var id = this.id;           
          //call function that retrieves data from database
          label_notes(label_name, id);

          // Change what appears on the header section
          document.querySelector('#label_name').innerHTML = label_name;
          
      }
      click_delete_icon()
      click_edit_icon()
    }
    else{
      click_delete_icon()
      click_edit_icon()
      alert('Labels must be unique')
    }
      });
      }
    }

    //add a click event on create label link
    document.querySelector("#create_label").onclick = function(){
      save_big_note();
      //reveal the input button
      var input = document.querySelector("#input_box");
      input.style.display="block";
      input.value="";
      document.querySelector('#create_label_button').style.display="block";
      this.parentElement.style.display = "none";
    }

      // load content asyncronously
      document.querySelectorAll('.label_link').forEach(label_link =>{
        //add on click event to the label links
        label_link.onclick = function(){
            
            // go to the server
            var label_name = label_link.firstElementChild.innerHTML;
            var id = this.id;           
            //call function that retrieves data from database
            label_notes(label_name, id);

            // Change what appears on the header section
            document.querySelector('#label_name').innerHTML = label_name;
            
        }
    });

    input_button_disappear();

    //TEXT AREA FUNCTIONALITY
    var textarea = document.querySelector("#create_note_content");
    //FLEXIBLE HEIGHT
    textarea.oninput = function(){
      textarea.style.height = "";
      textarea.style.height =  textarea.scrollHeight + "px"
    };
  
    //onfocus event displays a save button
    textarea.onfocus = function(){
      var save_note_button = document.querySelector('#save_note');
      save_note_button.style.display = "block"

    }
    //ONCLIKING THE BUTTON SUBMIT DATA
    document.querySelector('#save_note').onclick = function(){
      //collect data
      var note_title = document.querySelector('#create_note_title').value;
      var note_content = document.querySelector("#create_note_content").value;
      //data validation
      //1. remove whitespace from title
      note_title = note_title.trim();
      //2. empty values
      if(note_title == '' || note_title.length > 250 ){
        //red around title   
        var t = document.querySelector('#create_note_title');
        t.style.border="1px solid red";
        t.style.borderRadius="5px";
        // error message
        return
      }
      if(note_content == '' || note_content.length > 20000){
        c = document.querySelector("#create_note_content");
        c.style.border="1px solid red";
        c.style.borderRadius="5px";
        return
      }
      else{
        save(null,note_title,note_content)
        
      }
        
    }

    // click event to edit a label
    click_edit_icon()
    

    // click event to delete a label
     click_delete_icon()
    

});


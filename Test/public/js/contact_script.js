console.log("Hello world!");

function goToContact()
{
  window.location.href="contact";
}
function goToHome()
{
  window.location.href="/";
}
function goToLogin()
{
  window.location.href="login";
}

function getContactInfo()
{
  var name= document.getElementById('name').value;
  var email= document.getElementById('e-mail').value;
  var mes= document.getElementById('message').value;
  if(name ==''||email==''||mes==''){
    return;
  }
  var data= [name,email,mes];
    document.getElementById('name').value='';
   document.getElementById('e-mail').value='';
   document.getElementById('message').value='';
  console.log(data);
  return data;
}

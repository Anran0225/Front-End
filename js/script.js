function setCookie(name,value,days){
  const d=new Date();
  d.setTime(d.getTime()+(days*24*60*60*1000));
  document.cookie=name+"="+value+";expires="+d.toUTCString()+";path=/";
}
function getCookie(name){
  let cname=name+"=";
  let decoded=decodeURIComponent(document.cookie);
  let ca=decoded.split(';');
  for(let c of ca){
    c=c.trim();
    if(c.indexOf(cname)==0) return c.substring(cname.length,c.length);
  }
  return "";
}
$(document).ready(function(){
  const page=location.pathname.split("/").pop() || "index.html";
  $(".nav-link").each(function(){
    if($(this).attr("href")===page){$(this).addClass("active");}
  });

  if(localStorage.getItem("theme")==="light"){
    $("body").addClass("light-mode");
    $("#themeToggle").text("Dark Mode");
  }

  $("#themeToggle").on("click",function(){
    $("body").toggleClass("light-mode");
    const isLight=$("body").hasClass("light-mode");
    localStorage.setItem("theme",isLight?"light":"dark");
    $(this).text(isLight?"Dark Mode":"Light Mode");
  });

  sessionStorage.setItem("lastVisitedPage",page);
  $("#lastPage").text(sessionStorage.getItem("lastVisitedPage"));

  if(!getCookie("aiCookieConsent")){
    $("#cookieNotice").fadeIn();
  }
  $("#acceptCookie").on("click",function(){
    setCookie("aiCookieConsent","accepted",30);
    $("#cookieNotice").fadeOut();
  });

  $("#joinForm").on("submit",function(e){
    e.preventDefault();
    const name=$("#name").val();
    const email=$("#email").val();
    localStorage.setItem("memberName",name);
    localStorage.setItem("memberEmail",email);
    $("#formMsg").html("Thanks, <b>"+name+"</b>! Your registration is saved using localStorage.");
    this.reset();
  });

  $("#loadQuote").on("click",function(){
    $.ajax({
      url:"https://api.quotable.io/random?tags=technology",
      method:"GET",
      success:function(data){
        $("#apiResult").html("<b>AI Inspiration:</b> “"+data.content+"” — "+data.author);
      },
      error:function(){
        $("#apiResult").html("API unavailable. Demo: Artificial Intelligence helps students build smarter solutions.");
      }
    });
  });
});
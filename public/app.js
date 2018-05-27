var app = angular.module('chat',[]);
// local
var __appurl = "http://localhost:8000/";
// Dev server
// var __appurl = ""

function message(text){
    alert(text);
}

function redirect(url){
    return window.location.href = '/chat/'+url;
}
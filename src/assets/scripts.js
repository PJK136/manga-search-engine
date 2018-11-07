dataTest = {
    "imageURL":"", 
    "title":"", 
    "author":"", 
    "demographic":"", 
    "genre":"", 
    "firstPublicationDate":"", 
    "lirstPublicationDate":"",
    "volumes":""
}

function appendResult(mangaData, id){
    var manga = $("<div>").load("assets/templates/manga-item.html");
    manga.attr("id", "manga-item-" + id);
    $("#results").append(manga);
}

function test(){
    for (var i=0; i<3; i++){
        appendResult(0,i);
    }
}

function empty(){
    $("#results").empty();
}
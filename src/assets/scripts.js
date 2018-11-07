function appendResult(mangaData, id){
    var manga = $("<div>").load("assets/templates/manga-item.html");
    manga.attr("id", "manga-item-" + id);
    $("#results").append(manga);
}

function test(){
    appendResult(0,1);
    appendResult(0,2);
    appendResult(0,3);
}
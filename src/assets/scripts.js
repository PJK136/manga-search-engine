function getResults(mangasData){
    for(var i in mangasData){
        appendResult(i, mangasData[i]);
    }
}


function appendResult(id, mangaData){
    var manga = $("<div>").load("assets/templates/manga-item.html", function() {
        manga.attr("class", "manga-item card col-md-3 ");
        manga.attr("id", "manga-item-" + id);
        manga.find(".image").attr("src", mangaData["imageURL"]);
        manga.find(".title").text(mangaData["title"]);
        manga.find(".description").text(mangaData["description"]);
        manga.find(".author").text(mangaData["author"]);
        manga.find(".demografic").text(mangaData["demografic"]);
        manga.find(".type").text(mangaData["type"]);
        manga.find(".first-publication-date").text(mangaData["firstPublicationDate"]);
        manga.find(".last-publication-date").text(mangaData["lastPublicationDate"]);
        manga.find(".volumes").text(mangaData["volumes"]);
        $("#results").append(manga);
        $("#results").append("<br>");
    });
}


function empty(){
    $("#results").empty();
}

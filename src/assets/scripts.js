dataTest = [
        {
            "imageURL":"", 
            "title":"Manga1", 
            "author":"", 
            "demographic":"", 
            "genre":"", 
            "firstPublicationDate":"", 
            "lirstPublicationDate":"",
            "volumes":""
        },
        {
            "imageURL":"", 
            "title":"Manga2", 
            "author":"", 
            "demographic":"", 
            "genre":"", 
            "firstPublicationDate":"", 
            "lirstPublicationDate":"",
            "volumes":""
        },
        {
            "imageURL":"", 
            "title":"Manga3", 
            "author":"", 
            "demographic":"", 
            "genre":"", 
            "firstPublicationDate":"", 
            "lirstPublicationDate":"",
            "volumes":""
        }
    ]

function getResults(mangasData){
    for(var i=0; i < mangasData.length; i++){
        appendResult(mangasData[i], i);
    }
}

function appendResult(mangaData, id){
    var manga = $("<div>").load("assets/templates/manga-item.html");
    manga.attr("id", "manga-item-" + id);
    $("#results").append(manga);
    $("#manga-item-" + id + " .title").text(mangaData["title"]);
}

function test(){
    for (var i=1; i<4; i++){
        appendResult(0,i);
    }
}

function empty(){
    $("#results").empty();
}
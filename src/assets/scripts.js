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
        appendResult(i, mangasData[i]);
    }
}


function appendResult(id, mangaData){
    var manga = $("<div>").load("assets/templates/manga-item.html", function() {
        manga.attr("id", "manga-item-" + id);
        manga.find(".title").text(mangaData["title"]);
        $("#results").append(manga);
    });
}

function test(){
    for (var i=1; i<4; i++){
        appendResult(0,i);
    }
}

function empty(){
    $("#results").empty();
}
dataTest = [
        {
            "imageURL":"http://www.konbini.com/wp-content/blogs.dir/11/files/2017/08/onepiece-480x279.jpg", 
            "title":"One Piece", 
            "author":"", 
            "demographic":"", 
            "genre":"", 
            "firstPublicationDate":"", 
            "lastPublicationDate":"",
            "volumes":""
        },
        {
            "imageURL":"https://medias.comixtrip.fr/wp-content/uploads/2014/10/naruto-shippuden-02-1200x675.jpg", 
            "title":"Naruto", 
            "author":"", 
            "demographic":"", 
            "genre":"", 
            "firstPublicationDate":"", 
            "lastPublicationDate":"",
            "volumes":""
        },
        {
            "imageURL":"https://myanimelist.cdn-dena.com/images/anime/3/40451.jpg", 
            "title":"Bleach", 
            "author":"", 
            "demographic":"", 
            "genre":"", 
            "firstPublicationDate":"", 
            "lastPublicationDate":"",
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
        manga.find(".image-url").attr("src", mangaData["imageURL"]);
        manga.find(".title").text(mangaData["title"]);
        manga.find(".author").text(mangaData["author"]);
        manga.find(".demografic").text(mangaData["demografic"]);
        manga.find(".type").text(mangaData["type"]);
        manga.find(".first-publication-date").text(mangaData["firstPublicationDate"]);
        manga.find(".last-publication-date").text(mangaData["lastPublicationDate"]);
        manga.find(".volumes").text(mangaData["volumes"]);
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
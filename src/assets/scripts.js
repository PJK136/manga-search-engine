var SearchBar = {
    search : function(form) {
        MangaList.empty();
        MAL.searchByName($(form).find("[name=manga-title]").val(), MangaList.append);
    }
}

var MangaList = {
    mangaItemId: 0,
    
    appendList : function(mangasData) {
        for(var i in mangasData) {
            this.append(mangasData[i]);
        }
    },

    append : function(mangaData) {
        var manga = $("<div>").load("assets/templates/manga-item.html", function() {
            id = this.mangaItemId;
            this.mangaItemId++;
            
            manga.attr("class", "manga-item card col-md-4");
            manga.attr("id", "manga-item-" + id);
            manga.find(".image").attr("src", mangaData["imageURL"]);
            manga.find(".title").text(mangaData["title"]);
            manga.find(".description").text(mangaData["description"]);
            manga.find(".author").text(mangaData["author"]);
            manga.find(".demographic").text(mangaData["demographic"]);
            manga.find(".genres").text(mangaData["genres"]);
            manga.find(".first-publication-date").text(mangaData["firstPublicationDate"]);
            manga.find(".last-publication-date").text(mangaData["lastPublicationDate"]);
            manga.find(".volumes").text(mangaData["volumes"]);
            $("#results").append(manga);
            $("#results").append("<br>");
        });
    },

    empty : function() {
        this.mangaItemId = 0;
        $("#results").empty();
    }
}

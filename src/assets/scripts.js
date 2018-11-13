var SearchBar = {
    search : function(form) {
        MangaList.empty();
        MAL.searchByName($(form).find("[name=manga-title]").val(), MangaList.append);
    }
}

var MangaList = {
    mangaItemId: 0,
    
    fields: {
        "author":"Author",
        "demographic":"Demographic",
        "genres":"Genres",
        "publisher":"Publisher",
        "magazine":"Magazine",
        "first-publication-date":"First publication",
        "last-publication-date":"Last publication",
        "volumes":"Volumes",
        "chapters":"Chapters"
    },
    
    appendList : function(mangasData) {
        for(var i in mangasData) {
            this.append(mangasData[i]);
        }
    },

    append : function(mangaData) {
        id = MangaList.mangaItemId;
        MangaList.mangaItemId++;
        
        var manga = $('<div class="manga-item card col-md-4">');
        manga.attr("id", "manga-item-" + id);    
        
        if (mangaData["imageURL"])
        {
            var img = $('<img class="manga-image card-img-top">');
            img.attr("src", mangaData["imageURL"]);
            manga.append(img);
        }
        
        var mangaBody = $('<div class="card-body">');
        
        var title = $('<h5 class="title card-title">');
        title.text(mangaData["title"]);
        mangaBody.append(title);
        
        var description = $('<p class="description card-text">');
        description.text(mangaData["description"]);
        mangaBody.append(description);
        
        for (var attr in MangaList.fields)
            MangaList.appendMangaBody(mangaBody,mangaData,attr,MangaList.fields[attr]);
        mangaBody.append($('<br><div class="text-center"><a href="#" class="btn btn-primary ">More details</a></div>'));
        
        manga.append(mangaBody);
        
        $("#results").append(manga);
        $("#results").append("<br>");
    },
    
    appendMangaBody : function(body,data,attr,name) {
        if (data[attr])
        {
            var label = $("<b>");
            label.text(name+": ");
            var field = $("<span>");
            field.attr("class",attr);
            field.text(data[attr]);
            body.append(label);
            body.append(field);
            body.append($("<br>"));
        }
    },

    empty : function() {
        MAL.mangaItemId = 0;
        $("#results").empty();
    }
}

var SearchBar = {
    search : function(form) {
        MangaList.empty();
        var submitButton = $(form).find("[name=submit]");
        submitButton.removeClass("btn-primary").addClass("btn-secondary").prop('disabled', true);
        var mangaTitle = $(form).find("[name=manga-title]").val();
        
        var promises = [];
        promises.push(SearchBar.searchWith(MAL.searchByName, mangaTitle));
        promises.push(SearchBar.searchWith(MAL.searchByName, mangaTitle));
        
        Promise.all(promises).then(() => submitButton.removeClass("btn-secondary").addClass("btn-primary").prop('disabled', false));
    },
    
    searchWith : function(searchEngine, mangaTitle) {
        return new Promise((resolve, reject) => {
            var promise = searchEngine(mangaTitle);
            promise.then(mangaList => MangaList.appendList(mangaList));
            promise.then(() => resolve());
        });
    }
}

var MangaList = {
    mangaItemId: 0,
    
    specialFields : [
        "title",
        "imageURL"
    ],
    
    fields: {
        "author":"Author",
        "demographic":"Demographic",
        "genres":"Genres",
        "publisher":"Publisher",
        "magazine":"Magazine",
        "first-publication-date":"First publication",
        "last-publication-date":"Last publication",
        "volumes":"Volumes",
        "chapters":"Chapters",
        "source":"Source"
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
};

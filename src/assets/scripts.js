var SearchBar = {
    search : function(form) {
        MangaList.empty();
        var submitButton = $(form).find("[name=submit]");
        submitButton.removeClass("btn-primary").addClass("btn-secondary").prop('disabled', true);
        var mangaTitle = $(form).find("[name=manga-title]").val();
        
        var promises = [];
        promises.push(SearchBar.searchWith(MAL.searchByName, mangaTitle));
        promises.push(SearchBar.searchWith(AniList.searchByName, mangaTitle));
        
        Promise.all(promises).then(() => submitButton.removeClass("btn-secondary").addClass("btn-primary").prop('disabled', false));
    },
    
    searchWith : function(searchEngine, mangaTitle) {
        return new Promise((resolve, reject) => {
            var promise = searchEngine(mangaTitle);
            promise.then(mangaList => MangaList.appendList(mangaList));
            promise.then(() => resolve());
        });
    }
};

var MangaList = {
    mangaItemId: 0,
    maxDescriptionLength: 150,

    specialFields : [
        "titleRomaji",
        "titleKanji",
        "titleEnglish",
        "imageURL",
        "description",
    ],
    
    fields: {
        "authors":"Authors",
        "demographics":"Demographics",
        "genres":"Genres",
        "publishers":"Publishers",
        "magazines":"Magazines",
        "firstPublicationDate":"First publication",
        "lastPublicationDate":"Last publication",
        "numberOfVolumes":"Volumes", //int
        "numberOfChapters":"Chapters", //int
        "source":"Source"
    },
    
    appendList : function(mangasData) {
        for(var i in mangasData) {
            MangaList.append(mangasData[i]);
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
        title.text(mangaData["titleRomaji"]);
        mangaBody.append(title);
        
        if (mangaData["description"])
        {
            var descriptionText = mangaData["description"];
            var description = $('<p class="description card-text">');
            if(descriptionText.length > MangaList.maxDescriptionLength){ 
                var shortContent = descriptionText.substr(0,MangaList.maxDescriptionLength);
                var longContent = descriptionText.substr(MangaList.maxDescriptionLength);
                var readMore = $('<a href="#" class="read-more"><br/>Read More</a>');
                var moreText = $('<span class="more-text" style="display:none;">');
                moreText.text(longContent);
                description.append(shortContent);
                description.append(readMore)
                description.append(moreText);
                description.find('a.read-more').click(function(event){ 
                    event.preventDefault(); 
                    $(this).hide(); 
                    $(this).parents('.description').find('.more-text').show();
                });	
            } else {
                description.text(mangaData["description"]);
            }
            mangaBody.append(description);
        }
        
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
            var val = data[attr];
            if (Array.isArray(val))
                val = val.join(", ");
            
            var label = $("<b>");
            label.text(name+": ");
            var field = $("<span>");
            field.attr("class",attr);
            field.text(val);
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

var MoreDetails = {
    fields = {

    }
}

// $('.dropdown-menu a').click(function(){
//     $('#selected').text($(this).text());
// });
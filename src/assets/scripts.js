function decodeEntities(encodedString) {
    var textArea = document.createElement('textarea');
    textArea.innerHTML = encodedString;
    return textArea.value;
}

function toMoment(date)
{
    if (date)
        return moment(date);
    else
        return null;
}

var SearchBar = {
    search : function(form) {
        $("#results").show();
        MangaList.empty();
        var submitButton = $("#submit-search");
        submitButton.removeClass("btn-primary btn-danger").addClass("btn-secondary").prop('disabled', true);
        var query = $(form).find("[name=query]").val();
        
        var searchType = $("#search-type").val();
        
        var promises = [];
        if ($("#dbpedia-checkbox").is(":checked")) {
            $("#dbpedia-section").show();
            promises.push(SearchBar.searchWith(DBPedia[searchType], query, "dbpedia-results"));
        }
        if ($("#anilist-checkbox").is(":checked")) {
            $("#anilist-section").show();
            promises.push(SearchBar.searchWith(AniList[searchType], query, "anilist-results"));
        }
        if ($("#mal-checkbox").is(":checked")) {
            $("#mal-section").show();
            promises.push(SearchBar.searchWith(MAL[searchType], query, "mal-results"));
        }
        
        $.when.apply($, promises).then(() => submitButton.removeClass("btn-secondary").addClass("btn-primary").prop('disabled', false))
        .catch((error) => { console.log(error); submitButton.removeClass("btn-secondary").addClass("btn-danger").prop('disabled', false);});
    },
    
    searchWith : function(searchEngine, query, resultDivId) {
        return new Promise((resolve, reject) => {
            var promise = searchEngine(query);
            promise.then(mangaList => MangaList.appendList(resultDivId, mangaList));
            promise.then(() => resolve());
            promise.catch((error) => reject(error));
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
    
    titleFields: {
        "titleRomaji":"Romaji",
        "titleKanji":"Kanji",
        "titleEnglish":"English"
    },
    
    fields: {
        "authors":"Authors",
        "demographics":"Demographics",
        "genres":"Genres",
        "publishers":"Publishers",
        "magazines":"Magazines",
        "firstPublicationDate":"First publication",
        "lastPublicationDate":"Last publication",
        "numberOfVolumes":"Volumes",
        "numberOfChapters":"Chapters",
        "directors":"Directors",
        "producers":"Producers",
        "source":"Source"
    },
    
    appendList : function(divId, mangasData) {
        for(var i in mangasData) {
            MangaList.append(divId, mangasData[i]);
        }
    },

    append : function(divId, mangaData) {
        id = MangaList.mangaItemId;
        MangaList.mangaItemId++;
        
        var manga = $('<div class="manga-item card">');
        manga.attr("id", "manga-item-" + id);    
        
        var title = $('<div class="card-header">');
        var mangaTitle = undefined;
        if (mangaData["titleEnglish"])
            mangaTitle = mangaData["titleEnglish"];
        else if (mangaData["titleRomaji"])
            mangaTitle = mangaData["titleRomaji"];
        else
            mangaTitle = mangaData["titleKanji"];
        title.text(mangaTitle);
        manga.append(title);
        
        if (mangaData["imageURL"])
        {
            var img = $('<img class="manga-image card-img-top">');
            img.attr("src", mangaData["imageURL"]);
            manga.append(img);
        }
        
        var mangaBody = $('<div class="card-body">');
        
        for (var attr in MangaList.titleFields)
            MangaList.appendMangaBody(mangaBody,mangaData,attr,MangaList.titleFields[attr]);
        
        mangaBody.append($('<hr>'));
        
        if (mangaData["description"])
        {
            var descriptionText = mangaData["description"];
            var description = $('<p class="description card-text">');
            if(descriptionText.length > MangaList.maxDescriptionLength){ 
                var shortContent = descriptionText.substr(0,MangaList.maxDescriptionLength);
                var threeDots = $('<span class="three-dots">[...]</span>');
                var longContent = descriptionText.substr(MangaList.maxDescriptionLength);
                var readMore = $('<a href="#" class="read-more"><br/>Read More</a>');
                var moreText = $('<span class="more-text"">');
                var readLess = $('<a href="#" class="read-less"><br/>Read Less</a>');
                moreText.text(longContent);
                moreText.hide();
                readLess.hide();
                
                description.append(shortContent);
                description.append(threeDots);
                description.append(readMore)
                description.append(moreText);
                description.append(readLess);
                
                var toggleText = function(event) {
                    event.preventDefault(); 
                    var parent = $(this).parents('.description');
                    parent.find('.three-dots').toggle();
                    parent.find('.more-text').toggle();
                    parent.find('.read-more').toggle();
                    parent.find('.read-less').toggle();
                }
                
                description.find('a.read-more').click(toggleText);
                description.find('a.read-less').click(toggleText);
            } else {
                description.text(mangaData["description"]);
            }
            mangaBody.append(description);
        }
        
        for (var attr in MangaList.fields)
            MangaList.appendMangaBody(mangaBody,mangaData,attr,MangaList.fields[attr]);
        
        manga.append(mangaBody);
        manga.append($('<div class="card-footer text-center"><a href="#" class="btn btn-primary ">More details</a></div>'));
        
        $("#"+divId).append(manga);
        $("#"+divId).append("<br>");
    },
    
    appendMangaBody : function(body,data,attr,name) {
        if (data[attr])
        {
            var val = data[attr];
            if (Array.isArray(val))
                val = val.join(", ");
            if (moment.isMoment(val))
                val = val.format("YYYY-MM-DD");
            
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
        $("#dbpedia-section").hide();
        $("#dbpedia-results").empty();
        $("#anilist-section").hide();
        $("#anilist-results").empty();
        $("#mal-section").hide();
        $("#mal-results").empty();
    }

};

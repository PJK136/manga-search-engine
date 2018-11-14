var MAL = {
    pg13:3,
    
    findManga : function(id)
    {
        return new Promise((resolve, reject) => {
            var request = $.get("https://api.jikan.moe/v3/manga/"+id, manga => {
                var authors = manga["authors"].map(a => a["name"]);
                var genres = manga["genres"].map(g => g["name"]);
                var magazines = manga["serializations"].map(m => m["name"]);
                
                var data = {
                    "titleRomaji": manga["title"],
                    "titleKanji": manga["title_japanese"],
                    "titleEnglish": manga["title_english"],
                    "imageURL": manga["image_url"],
                    "description": manga["synopsis"],
                    "authors": authors,
                    "genres": genres,
                    "magazines": magazines,
                    "firstPublicationDate": moment(manga["published"]["from"]),
                    "lastPublicationDate": moment(manga["published"]["to"]),
                    "numberOfVolumes": manga["volumes"],
                    "numberOfChapters": manga["chapters"],
                    "source": "MyAnimeList"
                };
                
                resolve(data);
            }).fail(data => reject(data));
        });
    },
    
    searchByName : function (name)
    {
        return new Promise((resolve, reject) => {
            $.get("https://api.jikan.moe/v3/search/manga",
                {"q":name, "type":"manga", "rated":MAL.pg13, "limit":9, "page":1},
                (results) => {
                    var promises = [];
                    for (var i in results["results"])
                    {
                        var summary = results["results"][i];
                        promises[i] = MAL.findManga(summary["mal_id"]);
                    }
                    
                    /* For asynchronous loading :
                    function nextPromise(i) {
                        promises[i].then(manga => onSuccess(manga));
                        if (i+1 < promises.length)
                            promises[i].then(manga => nextPromise(i+1,manga));
                    }
                    
                    nextPromise(0);*/
                    
                    $.when.apply($, promises).then(function() {
                        resolve(arguments);
                    });
            }).fail(data => reject(data));
        });
    }
};

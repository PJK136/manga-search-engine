var MAL = {
    pg13:3,
    
    findManga : function(id)
    {
        return new Promise((resolve, reject) => {
            var request = $.get("https://api.jikan.moe/v3/manga/"+id, manga => {
                var authors = manga["authors"].map(a => a["name"]).join(", ");
                var genres = manga["genres"].map(g => g["name"]).join(", ");
                var firstPublicationDate = manga["published"]["from"];
                var lastPublicationDate = manga["published"]["to"];
                if (firstPublicationDate)
                    firstPublicationDate = firstPublicationDate.substring(0,10);
                if (lastPublicationDate)
                    lastPublicationDate = lastPublicationDate.substring(0,10);
                var magazine = manga["serializations"].map(m => m["name"]).join(", ");
                
                var data = {
                    "imageURL": manga["image_url"],
                    "title": manga["title"],
                    "description": manga["synopsis"],
                    "author": authors,
                    "genres": genres,
                    "magazine": magazine,
                    "first-publication-date": firstPublicationDate,
                    "last-publication-date": lastPublicationDate,
                    "volumes": manga["volumes"],
                    "chapters": manga["chapters"]
                };
                
                resolve(data);
            }).fail(data => reject(data));
        });
    },
    
    searchByName : function (name, onSuccess)
    {
        $.get("https://api.jikan.moe/v3/search/manga",
            {"q":name, "type":"manga", "rated":MAL.pg13, "limit":9, "page":1},
            function(results) {
                var promises = [];
                for (var i in results["results"])
                {
                    var summary = results["results"][i];
                    promises[i] = MAL.findManga(summary["mal_id"]);
                }
                
                function nextPromise(i) {
                    promises[i].then(manga => onSuccess(manga));
                    if (i+1 < promises.length)
                        promises[i].then(manga => nextPromise(i+1,manga));
                }
                
                nextPromise(0);
        });
    }
}

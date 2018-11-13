var MAL = {
    pg13:3,
    
    findManga : function(id)
    {
        return new Promise((resolve, reject) => {
            var request = $.get("https://api.jikan.moe/v3/manga/"+id, manga => {
                var authors = manga["authors"].map(a => a["name"]).join(", ");
                var genres = manga["genres"].map(g => g["name"]).join(", ");
                
                var data = {
                    "imageURL": manga["image_url"],
                    "title": manga["title"],
                    "description": manga["synopsis"],
                    "author": authors,
                    "genres": genres,
                    "firstPublicationDate": manga["published"]["from"],
                    "lastPublicationDate": manga["published"]["to"],
                    "volumes": manga["volumes"]
                };
                
                resolve(data);
            }).fail(data => reject(data));
        });
    },
    
    searchByName : function (name, onSuccess)
    {
        $.get("https://api.jikan.moe/v3/search/manga",
            {"q":name, "type":"manga", "rated":this.pg13, "limit":10, "page":1},
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

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
                    "firstPublicationDate": toMoment(manga["published"]["from"]),
                    "lastPublicationDate": toMoment(manga["published"]["to"]),
                    "numberOfVolumes": manga["volumes"],
                    "numberOfChapters": manga["chapters"],
                    "source": "MyAnimeList"
                };
                
                resolve(data);
            }).fail(data => reject(data));
        });
    },
    
    findMangasFromAuthor : function(id)
    {
        return new Promise((resolve, reject) => {
            var request = $.get("https://api.jikan.moe/v3/person/"+id, author => {
                var promises = [];
                var published_manga = author["published_manga"];
                for (var i in published_manga)
                {
                    promises.push(MAL.findManga(published_manga[i]["manga"]["mal_id"]));
                }
                
                $.when.apply($, promises).then(function() {
                    resolve(arguments);
                });
            }).fail(data => reject(data));
        });
    },
    
    searchByName : function (name)
    {
        return MAL.searchByNameGenre(name, undefined);
    },
    
    searchByGenre : function (genre)
    {
        return MAL.searchByNameGenre(undefined, genre);
    },
    
    searchByNameGenre : function (name, genre)
    {
        return new Promise((resolve, reject) => {
            $.get("https://api.jikan.moe/v3/search/manga",
                {"q":name, "genre":genre, "type":"manga", "rated":MAL.pg13, "limit":9, "page":1},
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
    },
    
    searchByAuthor: function (author)
    {
        return new Promise((resolve, reject) => {
            $.get("https://api.jikan.moe/v3/search/person",
                {"q":author, "limit":9, "page":1},
                (results) => {
                    var promises = [];
                    for (var i in results["results"])
                    {
                        var summary = results["results"][i];
                        promises[i] = MAL.findMangasFromAuthor(summary["mal_id"]);
                    }
                    
                    $.when.apply($, promises).then(function() {
                        var mangaDatas = [];
                        for (var i in arguments)
                        {
                            for (var j in arguments[i])
                            {
                                mangaDatas.push(arguments[i][j]);
                            }
                        }
                        resolve(mangaDatas);
                    });
            }).fail((jqXHR, textStatus, errorThrown) => {
                if (jqXHR.status != 404)
                    reject(jqXHR, textStatus, errorThrown);
                else
                    resolve([]);
            });
        });
    }
};

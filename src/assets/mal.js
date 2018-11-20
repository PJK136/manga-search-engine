var MAL = {
    MAX_RESULTS_LENGTH: 9,
    
    genres: ["", "Action", "Adventure", "Cars", "Comedy", "Dementia", "Demons", "Mystery", "Drama", "Ecchi", "Fantasy", "Game", "Hentai", "Historical", "Horror", "Kids", "Magic", "Martial Arts", "Mecha", "Music", "Parody", "Samurai", "Romance", "School", "Sci Fi", "Shoujo", "Shoujo Ai", "Shounen", "Shounen Ai", "Space", "Sports", "Super Power", "Vampire", "Yaoi", "Yuri", "Harem", "Slice of Life", "Supernatural", "Military", "Police", "Psychological", "Thriller", "Seinen", "Josei", "Doujinshi", "Gender Bender"].map((value) => value.toLowerCase()),
    
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
                    "status": manga["status"],
                    "score": manga["score"]+"/10",
                    "firstPublicationDate": toMoment(manga["published"]["from"]),
                    "lastPublicationDate": toMoment(manga["published"]["to"]),
                    "numberOfVolumes": manga["volumes"],
                    "numberOfChapters": manga["chapters"],
                    "source": "MyAnimeList",
                    "sourceURL": manga["url"]
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
                
                var mangaIds = [];
                for (var i in published_manga)
                {
                    mangaIds.push(published_manga[i]["manga"]["mal_id"]);
                }
                
                resolve(mangaIds);
            }).fail(data => reject(data));
        });
    },
    
    searchByName : function (name)
    {
        return MAL.searchByNameGenre(name, undefined);
    },
    
    searchByGenre : function (genre)
    {
        var indexGenre = MAL.genres.indexOf(genre.toLowerCase());
        if (indexGenre <= 0)
            return new Promise((resolve, reject) => { resolve([]); });
        return MAL.searchByNameGenre(undefined, indexGenre);
    },
    
    searchByNameGenre : function (name, genre)
    {
        return new Promise((resolve, reject) => {
            $.get("https://api.jikan.moe/v3/search/manga",
                {"q":name, "genre":genre, "type":"manga", "limit":MAL.MAX_RESULTS_LENGTH, "page":1},
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
                        var promises2 = []
                        
                        for (var i in arguments)
                        {
                            for (var j in arguments[i])
                            {
                                if (promises2.length >= MAL.MAX_RESULTS_LENGTH)
                                    break;
                                
                                promises2.push(MAL.findManga(arguments[i][j]));
                            }
                        }
                        
                        $.when.apply($, promises2).then(function() {
                            var mangaDatas = [];
                            for (var i in arguments)
                                mangaDatas.push(arguments[i]);

                            resolve(mangaDatas);
                        });
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

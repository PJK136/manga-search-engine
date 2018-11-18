var AniList = {
    searchByName : function (name)
    {
        return AniList.searchByNameGenre(name, undefined);
    },
    
    searchByGenre : function (genre)
    {
        return AniList.searchByNameGenre(undefined, genre);
    },
    
    searchByNameGenre : function (name, genre)
    {
        var variables = {
            search: name,
            genre: genre,
            page: 1,
            perPage: 9
        };

        return new Promise((resolve, reject) => {
            $.post('https://graphql.anilist.co',
                   {query: AniList.queryByNameGenre, variables: variables},
                   (data) => {
                       var mangas = data["data"]["Page"]["media"];
                       resolve(AniList.convertMangas(mangas));
            }).fail(data => {reject(data)});
        });
    },
    
    searchByAuthor : function (author)
    {
        var variables = {
            search: author,
            page: 1,
            perPage: 9
        };

        return new Promise((resolve, reject) => {
            $.post('https://graphql.anilist.co',
                   {query: AniList.queryByAuthor, variables: variables},
                   (data) => {
                       var mangaDatas = [];
                       var staffs = data["data"]["Page"]["staff"];
                       for (var i in staffs)
                       {
                           var mangas = staffs[i]["staffMedia"]["nodes"];
                            Array.prototype.push.apply(mangaDatas,AniList.convertMangas(mangas));
                       }
                       
                       resolve(mangaDatas);
            }).fail(data => {reject(data)});
        });
    },
    
    convertMangas : function(mangas) {
        var mangaDatas = [];
        for (var i in mangas)
        {
            var manga = mangas[i];
            var description = manga["description"];
            if (description) {
                description = decodeEntities(description);
                description = description.replace(new RegExp("<br>", 'g'), '\n');
            }
            
            var startDate = manga["startDate"];
            if (startDate["month"])
                startDate["month"]--;
            else if (!startDate["year"])
                startDate = null;
            
            var endDate = manga["endDate"];
            if (endDate["month"])
                endDate["month"]--;
            else if (!endDate["year"])
                endDate = null;
            
            var authors = manga["staff"]["edges"].map(a => a["node"]["name"]["first"] + " " + a["node"]["name"]["last"] + " (" + a["role"] + ")");
            
            var status = manga["status"].charAt(0).toUpperCase() + manga["status"].slice(1).toLowerCase();
            
            mangaDatas.push({
                "titleRomaji": manga["title"]["romaji"],
                "titleKanji": manga["title"]["native"],
                "titleEnglish": manga["title"]["english"],
                "imageURL": manga["coverImage"]["large"],
                "description": description,
                "authors": authors,
                "genres": manga["genres"],
                "status": status,
                "score": manga["averageScore"]/10.,
                "firstPublicationDate": toMoment(startDate),
                "lastPublicationDate": toMoment(endDate),
                "numberOfColumes": manga["volumes"],
                "numberOfChapters": manga["chapters"],
                "source": "AniList",
                "sourceURL": manga["siteUrl"]
            });
        }
        
        return mangaDatas;
    }
};

AniList.coreQuery = `
    id
    title {
        romaji
        english
        native
    }
    coverImage {
        large
    }
    description(asHtml: false)
    genres
    startDate {
        year
        month
        day
    }
    endDate {
        year
        month
        day
    }
    status
    averageScore
    volumes
    chapters
    siteUrl
    staff {
        edges {
            node {
                name {
                    first
                    last
                }
            }
            role
        }
    }
`;
                    
AniList.queryByNameGenre = `
    query ($search: String, $genre: String, $page: Int, $perPage: Int) {
        Page (page: $page, perPage: $perPage) {
            media (search: $search, genre: $genre, type: MANGA, sort: [POPULARITY_DESC]) {` +
                AniList.coreQuery +
            `}
        }
    }
`;

AniList.queryByAuthor = `
    query ($search: String, $page: Int, $perPage: Int) {
        Page (page: $page, perPage: $perPage) {
            staff (search: $search, sort: [SEARCH_MATCH]) {
                staffMedia (type: MANGA, sort: [POPULARITY_DESC], page: $page, perPage: $perPage) {
                    nodes {` +
                    AniList.coreQuery +
                    `}
                }
            }
        }
    }
`;

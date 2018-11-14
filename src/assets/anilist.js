var AniList = {
    searchByName : function (name)
    {
        return new Promise((resolve, reject) => {
            var query = `
                query ($search: String, $page: Int, $perPage: Int) {
                    Page (page: $page, perPage: $perPage) {
                        media (search: $search, type: MANGA, sort: [POPULARITY_DESC]) {
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
                            volumes
                            chapters
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
                        }
                    }
                }
            `;

            var variables = {
                search: name,
                page: 1,
                perPage: 9
            };
            
            $.post('https://graphql.anilist.co',
                   {query: query, variables: variables},
                   (data) => {
                       var mangaDatas = [];
                       var mangas = data["data"]["Page"]["media"];
                       for (var i in mangas)
                       {
                           var manga = mangas[i];
                           var description = manga["description"];
                           if (description) {
                               description = decodeEntities(description);
                               description = description.replace(new RegExp("<br>", 'g'), '\n');
                           }
                           
                           var startDate = manga["startDate"]["year"] ? manga["startDate"] : null;
                           var endDate = manga["endDate"]["year"] ? manga["endDate"] : null;
                           
                           var authors = manga["staff"]["edges"].map(a => a["node"]["name"]["first"] + " " + a["node"]["name"]["last"] + " (" + a["role"] + ")");
                           
                           mangaDatas.push({
                               "titleRomaji": manga["title"]["romaji"],
                               "titleKanji": manga["title"]["native"],
                               "titleEnglish": manga["title"]["english"],
                               "imageURL": manga["coverImage"]["large"],
                               "description": description,
                               "authors": authors,
                               "genres": manga["genres"],
                               "firstPublicationDate": toMoment(startDate),
                               "lastPublicationDate": toMoment(endDate),
                               "numberOfColumes": manga["volumes"],
                               "numberOfChapters": manga["chapters"],
                               "source": "AniList"
                           });
                       }
                       
                       resolve(mangaDatas);
            }).fail(data => {reject(data)});
        });
    }
};

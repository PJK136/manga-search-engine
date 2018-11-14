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
                            description
                            genres
                            volumes
                            chapters
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
                           mangaDatas.push({
                               "title": manga["title"]["romaji"],
                               "imageURL": manga["coverImage"]["large"],
                               "description-html": manga["description"],
                               "volumes": manga["volumes"],
                               "chapters": manga["chapters"],
                               "source": "AniList"
                           });
                       }
                       
                       resolve(mangaDatas);
            });
        });
    }
};

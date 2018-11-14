function decodeEntities(encodedString) {
    var textArea = document.createElement('textarea');
    textArea.innerHTML = encodedString;
    return textArea.value;
}

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
                           var description = manga["description"];
                           if (description) {
                               description = decodeEntities(description);
                               description = description.replace(new RegExp("<br>", 'g'), '\n');
                           }
                           
                           mangaDatas.push({
                               "titleRomaji": manga["title"]["romaji"],
                               "titleKanji": manga["title"]["native"],
                               "titleEnglish": manga["title"]["english"],
                               "imageURL": manga["coverImage"]["large"],
                               "description": description,
                               "numberOfColumes": manga["volumes"],
                               "numberOfChapters": manga["chapters"],
                               "source": "AniList"
                           });
                       }
                       
                       resolve(mangaDatas);
            });
        });
    }
};

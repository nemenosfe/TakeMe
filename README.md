# TakeMeLegends - API

## Categories disponibles
JSON amb les possibles categories:  

```json
{  
  "category": [
    {
      "name": "Concerts &amp; Tour Dates",
      "id": "music"
    },
    {
      "name": "Conferences &amp; Tradeshows",
      "id": "conference"
    },
    {
      "name": "Comedy",
      "id": "comedy"
    },
    {
      "name": "Education",
      "id": "learning_education"
    },
    {
      "name": "Kids &amp; Family",
      "id": "family_fun_kids"
    },
    {
      "name": "Festivals",
      "id": "festivals_parades"
    },
    {
      "name": "Film",
      "id": "movies_film"
    },
    {
      "name": "Food &amp; Wine",
      "id": "food"
    },
    {
      "name": "Fundraising &amp; Charity",
      "id": "fundraisers"
    },
    {
      "name": "Art Galleries &amp; Exhibits",
      "id": "art"
    },
    {
      "name": "Health &amp; Wellness",
      "id": "support"
    },
    {
      "name": "Holiday",
      "id": "holiday"
    },
    {
      "name": "Literary &amp; Books",
      "id": "books"
    },
    {
      "name": "Museums &amp; Attractions",
      "id": "attractions"
    },
    {
      "name": "Neighborhood",
      "id": "community"
    },
    {
      "name": "Business &amp; Networking",
      "id": "business"
    },
    {
      "name": "Nightlife &amp; Singles",
      "id": "singles_social"
    },
    {
      "name": "University &amp; Alumni",
      "id": "schools_alumni"
    },
    {
      "name": "Organizations &amp; Meetups",
      "id": "clubs_associations"
    },
    {
      "name": "Outdoors &amp; Recreation",
      "id": "outdoors_recreation"
    },
    {
      "name": "Performing Arts",
      "id": "performing_arts"
    },
    {
      "name": "Pets",
      "id": "animals"
    },
    {
      "name": "Politics &amp; Activism",
      "id": "politics_activism"
    },
    {
      "name": "Sales &amp; Retail",
      "id": "sales"
    },
    {
      "name": "Science",
      "id": "science"
    },
    {
      "name": "Religion &amp; Spirituality",
      "id": "religion_spirituality"
    },
    {
      "name": "Sports",
      "id": "sports"
    },
    {
      "name": "Technology",
      "id": "technology"
    },
    {
      "name": "Other &amp; Miscellaneous",
      "id": "other"
    }
  ]
}
```

## Events API (Peticions d'esdeveniments)

Pàrametres d'entrada per totes les peticions:
	- API key (encara que ara per ara funciona sense API key)

### GET /events/

#### Paràmetres d'entrada
  - Els possibles paràmetres d'entrada són:
    - **category**: Un *String* amb qualsevol ID d'una categoria de les disponibles (el JSON amb les possibilitats està més amunt).
    - **keywords**: Un *String* amb les paraules clau que és volen cercar.
    - **date**: Un *String* amb qualsevol d'aquestes possibilitats:
      - Un String d'aquests: *All*, *Future*, *Past*, *Today*, *Last Week*, *This Week*, *Next week*
      - Un mes qualsevol en lletres en anglès, com per exemple: *October*, *November*, *December*, *January*, etc.
      - Un rang de dates concretes en format *YYYYMMDD00-YYYYMMDD00* (els últims dos dígits de cada data seran ignorats però s'han de passar igualment).
    - **location**: Un *String* amb qualsevol d'aquestes possibilitats:
      - Un nom de ciutat o regió o país, com per exemple un d'aquests: *Barcelona*, *London*, *Catalonia*, *Spain*, *United Kingdom*.
      - Un codi postal.
      - L'ID del local.
  - Tots aquests paràmetres d'entrada són opcionals, però com a mínim ha de rebre un d'ells (qualsevol), i també funciona si s'envia més d'un d'aquells paràmetres d'entrada, amb qualsevol combinació.  
  - Si s'envia el paràmetre *location*, també es pot enviar el paràmetre **within** amb un *int* que s'ignifica la quantitat de quilòmetres de radi des d'aquest location (per defecte, si no s'envia res, són 350 ara per ara).  
  - També es possible enviar un **page_size** que vol dir quants esdeveniments màxim volem rebre de tots els que hi ha amb aquestes condicions. Per defecte, si no s'envia res, és *10*.
  - I per últim també es pot enviar un **page_number** amb quina pàgina volem rebre amb *page_size* esdeveniments de la llista total d'esdeveniments estem, tenint en compte que cada pàgina té *page_size* esdeveniments. Per exemple, si *page_size* val 10 i *page_number* val 2, tindrem la llista d'esdeveniments de l'11 al 20. *page_number* és opcional i per defecte val 1.
  - Els esdeveniments estan ordenats per data.    
  - Un exemple de paràmetres d'entrada:  
```javascript
{
  'category' : 'comedy',
  'keywords' : 'Espectacle interessant'
  'date' : '2016112500-2017042700',
  'location' : 'Barcelona',
  'within' : '20',
  'page_size' : '50',
  'page_number' : '2'
}
```

#### Paràmetres de sortida
  - Conté moltíssima informació però la idea resumida és el següent JSON:  
```javascript
{  
   "total_items":"1647",
   "page_number":"1",
   "page_size":"10",
   "events":{  
      "event":[ // Array amb la llista dels 10 esdeveniments
        {
          // Informació de l'esdeveniment1

        },
        {
          // Informació de l'esdeveniment2
        },
        // ...
        {
          // Informació de l'esdeveniment10
        }
      ]
   }
}
```
  - **Explicació en procés** :smile:  

### GET /events/:id
  - Falta redactar-ho però ja està funcionant, ara ho escriuré :smile:

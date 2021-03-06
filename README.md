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

## Script a executar sobre la base de dades abans de tocar res més
Sobre la línia de comandes de linux feu: `node scriptDatabase.js` i ja ho farà tot :smile:  

**Els usuaris s'han de crear SEMPRE amb una petició POST i MAI directament a la base de dades, pel token**.  

## Taula resum de l'API (del que tenim per ara totalment fet, testejat i documentat)

| Verb   | Path                       | Auth             | Description                  |
| -------|----------------------------|:----------------:| ----------------------------:|
| GET    | /events/                           | appkey           | Veure una llista d'esdeveniments per data, categoria, localització i/o paraules clau |
| GET    | /events/:id/                       | appkey           | Veure un esdeveniment |
| GET    | /events/user/                      | appkey + token   | Veure els 'assitiré' d'un usuari |
| POST   | /events/user/                      | appkey + token   | Crear un 'assitiré'|
| PUT    | /events/:id/user/                  | appkey + token   | Fer un check-in |
| DELETE | /events/:id/user/                  | appkey + token   | Eliminar un 'assitiré' |
| GET    | /rewards/                          | appkey           | Veure la llista total de recompenses |
| GET    | /rewards/user/                     | appkey + token   | Veure les recompenses d'un usuari |
| POST   | /rewards/user/                     | appkey + token   | Compra d'una recompensa per un usuari |
| GET    | /users/                            | appkey           | Veure la llista d'usuaris |
| GET    | /users/:uid-provider               | appkey           | Veure un usuari |
| POST   | /users/                            | appkey           | Crear un usuari nou o canviar el token si ja existia l'usuari |
| PUT    | /users/:uid-provider               | appkey + token   | Canviar la informació d'un usuari |
| DELETE | /users/:uid-provider               | appkey + token   | Eliminar un usuari |
| GET    | /users/:uid-provider/preferences   | appkey + token   | Veure les preferences d'un usuari |
| POST   | /users/preferences                 | appkey + token   | Crear les preferences d'un usuari |
| PUT    | /users/:uid-provider/preferences   | appkey + token   | Modificar les preferences d'un usuari |
| DELETE | /users/:uid-provider/preferences   | appkey + token   | Eliminar les preferences d'un usuari |
| GET    | /achievements/                     | appkey           | Veure la llista de 'logros' |
| GET    | /achievements/user/                | appkey + token   | Veure els 'logros' d'un usuari |
| GET    | /recommendations/:uid-provider     | appkey + token   | Veure els esdeveniments recomenats per un usuari segons les seves preferències |


## Events API (Peticions d'esdeveniments)

Pàrametres d'entrada comunts per totes les peticions:
	- API key (que sempre és el següent: **7384d85615237469c2f6022a154b7e2c**)

### GET /events/
GET d'una llista d'esdeveniments.  

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
  - Ara també es pot enviar un **sort_order**, que si no s'envia, per defecte és *relevance*.  
  - També es possible enviar un **page_size** que vol dir quants esdeveniments màxim volem rebre de tots els que hi ha amb aquestes condicions. Per defecte, si no s'envia res, és *10*.
  - I per últim també es pot enviar un **page_number** amb quina pàgina volem rebre amb *page_size* esdeveniments de la llista total d'esdeveniments estem, tenint en compte que cada pàgina té *page_size* esdeveniments. Per exemple, si *page_size* val 10 i *page_number* val 2, tindrem la llista d'esdeveniments de l'11 al 20. *page_number* és opcional i per defecte val 1.    
  - Un exemple de paràmetres d'entrada (en forma de JSON, però s'envien a la URL):  
```javascript
{
  'appkey' : '7384d85615237469c2f6022a154b7e2c',
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
  - Un exemple explicat en el següent JSON (els esdeveniments estan ordenats per data):  
```javascript
{  
   "total_items":"1647", // Total d'esdeveniments que compleixen les condicions del paràmetres d'entrada.
   "page_number":"1",
   "page_size":"10", // Quants esdeveniments de total_items realment venen en el següent array
   "events":{  
      "event":[ // Array amb la llista dels 10 esdeveniments
        {
          // Informació de l'esdeveniment1
          "id":"E0-001-095182625-3", // ID de l'esdeveniment
          "title":"Títol de l'esdeveniment 1",
          "description":"<strong>Descripció de l'esdeveniment en HTML</strong><p>i a més la descripció pot ser mooooooooolt llarga! (si voleu un exemple real el puc possar més endavant)</p>",
          /* Sí, ve totalment en HTML, fins el punt que he vist això dins d'una descripció: gran selecció d&#39;estàndards<br>
          però amb Android es pot mostrar sense que sigui un problema :) */
          "number_attendances" : 0, // nombre d'usuaris de la nostra aplicació que volen van fer click a "assistiré" d'aquest esdeveniment
          "checkin_done" : 0, // si l'usuari ha fet check-in a aquest esdeveniment
          "wanted_attendance" : 1, // si l'usuari ha marcat 'assistiré' per aquest esdeveniment
          "takes" : 123, // takes que es guanyen assitint a aquest esdeveniment
          "url":"http://barcelona.eventful.com/events/jazzman-trio-/E0-001-088579321-8@2016091200?utm_source=apis&utm_medium=apim&utm_campaign=apic", // URL de l'esdeveniment a Eventful
          "all_day":"0", // 0 vol dir que l'horari queda específicat per l'start_time i l'stop_time, 1 vol dir tot el dia i 2 vol dir "no time specified"
          "start_time":"2016-09-12 23:00:00",
          "stop_time":"null", // Tot i que "all_day" valgui 0, aquest paràmetre pot tenir valor "null"
          "venue_display":"1", // Si val 1, podem mostrar la informació del local sense cap problema, si val 0 vol dir que la informació del local no del tot fiable perquè a vegades en lloc del local només sabem amb total seguretat en quina ciutat serà.
          "venue_id":"V0-001-009623999-6", // ID del local
          "venue_name":"Jazzman Jazzclub", // Nom del local
          "address":"Roger de Flor, 238", // Adreça del local
          "city":"Barcelona",
          "country":"Spain",
          "region":null, // A vegades ve com a null i a vegades com "Cataluna", però si volem cercar per regió hem de cercar per "Catalonia" i ens trobarà els que no tenen valor null aquí.
          "postal_code":null,
          "latitude":"41.3833", // És un float amb signe
          "longitude":"2.18333", // És un float amb signe
          "images":{ // images a vegades val null però quan té contingut, tindrà (o gairebé sempre) thumb (48x48), medium (128x128) i large (480x480)
            "medium":{  
              "width":"128",
              "height":"128",
              "url":"http://s1.evcdn.com/store/skin/no_image/categories/128x128/other.jpg"
            },
            "thumb":{  
              "width":"48",
              "height":"48",
              "url":"http://s1.evcdn.com/store/skin/no_image/categories/48x48/other.jpg"
            }
          },
          "categories":{ // Sempre he vist que ve 1 i només 1 categoria dins del següent array, i mai ho he vist com a null (però això ho trec dels exemples que he vist, no es que m'ho digui la especificació que he llegit)
            "category":[  
              {  
                "name":"Other &amp; Miscellaneous",
                "id":"other"
              }
            ]
           },
           "free": null, // Des d'aquí, sempre serà null
           "price": null, // Des d'aquí, sempre serà null
        },
        {
          // Informació de l'esdeveniment2
          // ...
        },
        /*
        Esdeveniments del 3 al 9 ...
        */
        {
          // Informació de l'esdeveniment10
          // ...
        }
      ]
   }
}
```  

  - En les dades d'un esdeveniment no ve el **preu**, aquesta informació sí ve en el **GET /events/:id** pel GET d'un esdeveniment concret pel seu ID.   

### GET /events/:id
GET d'un esdeveniment en particular pel seu ID.  

#### Paràmetres d'entrada
Cap paràmetre d'entrada obligatori, però un exemple d'aquest GET seria (sent l'ID de l'esdeveniment: *E0-001-095173443-9*):  `urlDelServidor/events/E0-001-095173443-9?appkey=7384d85615237469c2f6022a154b7e2c`  
Si passeu **uid**, **provider** i **token**, us retornarà el *wanted_attendance* dient si vol assitir o no, però si no envieu la info de l'usuari, simplement retorna 0 al *wanted_attendance*.  

#### Paràmetres de sortida
Un exemple resumit al següent JSON (explico els canvis respecte a la informació de **GET /events/** després del JSON):  
```javascript
"event" : {
  "id":"E0-001-095182625-3", // ID de l'esdeveniment
  "title":"Títol de l'esdeveniment 1",
  "description":"<strong>Descripció de l'esdeveniment en HTML</strong><p>i a més la descripció pot ser mooooooooolt llarga! (si voleu un exemple real el puc possar més endavant)</p>",
  /* Sí, ve totalment en HTML, fins el punt que he vist això dins d'una descripció: gran selecció d&#39;estàndards<br>
  però amb Android es pot mostrar sense que sigui un problema :) */
  "number_attendances" : 0, // nombre d'usuaris de la nostra aplicació que volen van fer click a "assistiré" d'aquest esdeveniment
  "checkin_done" : 0, // si l'usuari ha fet check-in a aquest esdeveniment
  "wanted_attendance" : 1, // si l'usuari ha marcat 'assistiré' per aquest esdeveniment
  "takes" : 123, // takes que es guanyen assitint a aquest esdeveniment
  "url":"http://barcelona.eventful.com/events/jazzman-trio-/E0-001-088579321-8@2016091200?utm_source=apis&utm_medium=apim&utm_campaign=apic", // URL de l'esdeveniment a Eventful
  "all_day":"0", // 0 vol dir que l'horari queda específicat per l'start_time i l'stop_time, 1 vol dir tot el dia i 2 vol dir "no time specified"
  "start_time":"2016-09-12 23:00:00",
  "stop_time":"null", // Tot i que "all_day" valgui 0, aquest paràmetre pot tenir valor "null"
  "venue_display":"1", // Si val 1, podem mostrar la informació del local sense cap problema, si val 0 vol dir que la informació del local no del tot fiable perquè a vegades en lloc del local només sabem amb total seguretat en quina ciutat serà.
  "venue_id":"V0-001-009623999-6", // ID del local
  "venue_name":"Jazzman Jazzclub", // Nom del local
  "address":"Roger de Flor, 238", // Adreça del local
  "city":"Barcelona",
  "country":"Spain",
  "region":null, // A vegades ve com a null i a vegades com "Cataluna", però si volem cercar per regió hem de cercar per "Catalonia" i ens trobarà els que no tenen valor null aquí.
  "postal_code":null,
  "latitude":"41.3833", // És un float amb signe
  "longitude":"2.18333", // És un float amb signe
  "images":{ // images a vegades val null però quan té contingut, tindrà (o gairebé sempre) thumb (48x48), medium (128x128) i large (480x480)
    "image": {
      "medium":{  
        "width":"128",
        "height":"128",
        "url":"http://s1.evcdn.com/store/skin/no_image/categories/128x128/other.jpg"
      },
      "thumb":{  
        "width":"48",
        "height":"48",
        "url":"http://s1.evcdn.com/store/skin/no_image/categories/48x48/other.jpg"
      }
    }
  },
  "categories":{ // Sempre he vist que ve 1 i només 1 categoria dins del següent array, i mai ho he vist com a null (però això ho trec dels exemples que he vist, no es que m'ho digui la especificació que he llegit)
    "category":[  
      {  
        "name":"Other &amp; Miscellaneous",
        "id":"other"
      }
    ]
   },
   "free":"null", // 1 vol dir gratis, 0 vol dir de pagament i null vol dir que encara no ho sabem.
   "price":"null", // pot ser null o pot ser un String descriptiu amb el preu (encara que no he vist cap exemple amb preu, fins i tot tenint el link de la venta d'entrades).
},
```  

Les diferències respecte a **GET /events/** són les següents:  
  - Ara els atribus **free** i **price** poden no ser *null*.
  - Les images ara venen dins de: *images.image*.  

### GET /events/user/
GET de tots els esdeveniments d'un usuari.  

#### Paràmetres d'entrada
Exemple de paràmetre d'entrada (en forma de JSON, però s'envien a la URL):
```javascript
{
  'appkey' : '7384d85615237469c2f6022a154b7e2c', // paràmetre obligatori per totes les peticions a l'API
  'token' : '5ba039ba572efb08d6442074d7d478d5', // paràmetre obligatori
  'uid' : '1234abc', // paràmetre obligatori
  'provider' : 'facebook', // paràmetre obligatori
  'page_size' : 20, // paràmetre opcional
  'page_number' : 1 // paràmetre opcional
};
```
  - **page_size**: vol dir quants esdeveniments màxim volem rebre de tots els que hi ha per aquest usuari. Per defecte, si no s'envia res, és *20*.
  - **page_number**: vol dir quina pàgina volem rebre amb *page_size* esdeveniments de la llista total d'esdeveniments d'aquest usuari, tenint en compte que cada pàgina té *page_size* esdeveniments. Per exemple, si *page_size* val 10 i *page_number* val 2, tindrem la llista d'esdeveniments de l'11 al 20. *page_number* és opcional i per defecte val 1.    


#### Paràmetres de sortida
  - Els esdeveniments que estan passant ara o passaran al futur els quals l'usuari ha marcat *assitiré* + esdeveniments passants els quals l'usuari va fer check-in.  
  - Els esdeveniments estan *ordenats* per data i *categoritzats* per **past**, **present** i **future**.  
Un exemple seria el següent:
```javascript
{
  "total_items": 2,
  "number_checkins": 1,
  "past": {
    "events": [
      {
        "event": {
          "id": "E0-001-000278174-6",
          "checkin_done": 1,
          "time_checkin": '17:32',
          "title": "Martini Tasting",
          "description": "Sample drinks made with featured vodkas.",
          "number_attendances": 2,
          "checkin_done" : 0,
          "wanted_attendance" : 1,
          "takes" : 123,
          "url": "http://cincinnati.eventful.com/events/martini-tasting-/E0-001-000278174-6?utm_source=apis&utm_medium=apim&utm_campaign=apic",
          "all_day": "0",
          "start_time": "2005-08-24 12:00:00",
          "stop_time": null,
          "venue_display": "1",
          "venue_id": "V0-001-000108360-1",
          "venue_name": "Encore Cafe - West Chester",
          "address": null,
          "city": "West Chester",
          "country": "United States",
          "region": "Ohio",
          "postal_code": "45069",
          "latitude": "39.3360595703125",
          "longitude": "-84.4053573608398",
          "images": null,
          "categories": {
            "category": [
              {
                "name": "Concerts &amp; Tour Dates",
                "id": "music"
              }
            ]
          },
          "free": null,
          "price": null
        }
      }
    ]
  },
  "present": {
    "events": []
  },
  "future": {
    "events": [
      null,
      {
        "event": {
          "id": "E0-001-093720767-4",
          "checkin_done": 0,
          "time_checkin": null,
          "title": "GSMA Mobile World Congress",
          "description": null,
          "number_attendances": 1,
          "checkin_done" : 0,
          "wanted_attendance" : 1,
          "takes" : 123,
          "url": "http://barcelona.eventful.com/events/gsma-mobile-world-congress-/E0-001-093720767-4?utm_source=apis&utm_medium=apim&utm_campaign=apic",
          "all_day": "2",
          "start_time": "2017-02-27 00:00:00",
          "stop_time": "2017-03-02 00:00:00",
          "venue_display": "1",
          "venue_id": "V0-001-008763883-0",
          "venue_name": "Barcelona, Spain",
          "address": "Barcelona",
          "city": "Barcelona",
          "country": "Spain",
          "region": null,
          "postal_code": "90292",
          "latitude": "41.3833",
          "longitude": "2.18333",
          "images": null,
          "categories": {
            "category": [
              {
                "name": "Conferences &amp; Tradeshows",
                "id": "conference"
              }
            ]
          },
          "free": null,
          "price": null
        }
      }
    ]
  }
}
```  
  - **number_checkins** és el nombre de vegades que l'usuari ha fet check-in, ja sigui en esdeveniments passats o passant en el mateix moment (present).  
  - Per cada esdeveniment conté exactament les mateixes dades per cada esdeveniment que a **GET /events/:id** però també conté *time_checkin* que és la data i l'hora en que va fer check-in o null si no l'ha fet.   

### POST /events/user/
POST per un "assistiré" d'un usuari a un esdeveniment.

#### Paràmetres d'entrada
Exemple de paràmetre d'entrada:
```javascript
{
  'appkey' : '7384d85615237469c2f6022a154b7e2c', // paràmetre obligatori per totes les peticions a l'API
  'token' : '5ba039ba572efb08d6442074d7d478d5', // paràmetre obligatori
  'event_id' : 'E0-001-093875660-9', // paràmetre obligatori
  'uid' : '1234abc', // paràmetre obligatori
  'provider' : 'facebook' // paràmetre obligatori
}
```

#### Paràmetres de sortida
Si tot ha anat bé, retorna el següent:
```javascript
'attendance' : {
  'event_id' : 'E0-001-093875660-9',
  'uid' : '1234abc',
  'provider' : 'facebook',
  "checkin_done" : 0,
  "wanted_attendance" : 1,
  "time_checkin": null,
  'takes' : '80' // Takes que es guanyaran quan assiteixi a l'esdeveniment
}
```

### PUT /events/:id/user/
PUT per fer el check-in d'una assitència a un esdeveniment (no cal que s'hagi marcat previament com a "assistiré").
Un exemple d'aquest PUT seria a la següent URL (sent l'ID de l'esdeveniment: *E0-001-095173443-9*):  `urlDelServidor/events/E0-001-095173443-9`  
Recordeu que sempre cal enviar també l'appkey.  

#### Paràmetres d'entrada
Exemple de paràmetre d'entrada (Tots els paràmetres són obligatoris):
```javascript
{
  'token' : '364b99c40b84b5207e89a207a606720a',
  'appkey' : '7384d85615237469c2f6022a154b7e2c',
  'uid' : '3a',
  'provider' : 'provider',
  'checkin_done' : '1', // Cal que sigui un 1 !!!
  'time_checkin': '17:32' // Paràmetre obligatori! (Em guardo i retorno exactament el que em passeu, com a String)
}
```

#### Paràmetres de sortida
Si tot ha anat bé, retorna el següent:
```javascript
"attendance": {
  "event_id": "E0-001-096784716-9",
  "uid": '3a',
  "provider": "provider",
  "checkin_done" : 1,
  "wanted_attendance" : 1,
  "time_checkin": "17:32",
  "new_takes": 886,
  "total_takes": 16355,
  "experience": 15569,
  "level": 1,
  "achievement": {
    "id": "music_10",
    "name": "Interesado en Música.",
    "description": "Has asistido a 10 eventos de Música.",
    "takes": 100,
    "category_id": "music",
    "number_required_attendances": 10
  }
}
```

### DELETE /events/:id/user/
DELETE d'una assitència a un esdeveniment (si s'ha fet el check-in a aquest esdeveniment, donarà error i no s'esborrarà l'assitència).
Un exemple d'aquest DELETE seria a la següent URL (sent l'ID de l'esdeveniment: *E0-001-095173443-9*):  `urlDelServidor/events/E0-001-095173443-9`  
No es pot fer un DELETE quan ja s'ha fet el check-in.

#### Paràmetres d'entrada
Exemple de paràmetre d'entrada:
```javascript
{
  'appkey' : '7384d85615237469c2f6022a154b7e2c', // paràmetre obligatori per totes les peticions a l'API
  'token' : '5ba039ba572efb08d6442074d7d478d5', // paràmetre obligatori
  'uid' : '1234abc', // paràmetre obligatori
  'provider' : 'facebook', // paràmetre obligatori
}
```

#### Paràmetres de sortida
Si tot ha anat bé, no retorna res (un JSON buit).
Si ha hagut l'ERROR de "no es pot esborrar aquesta assitència perquè ja ha fet check-in", retorna el següent:
```javascript
'error' : { "No es pot desmarcar l'assitència si ja s'ha fet el check-in" }
```

## Rewards API (Peticions de recompenses)

### GET /rewards/
GET d'una llista de recompenses.  

#### Paràmetres d'entrada
No cal cap paràmetre d'entrada (excepte l'**appkey**), però els següents són opcionals:
  - **page_size**: Quantes recompenses com a màxim vols rebre. Per defecte és 20.  
  - **page_number**: Número de pàgina de recompenses anant de *page_size* en *page_size*. Per defecte és 1.
Les recompenses estan ordenades per nivell, després per takes i finalment alfabèticament pel nom.  

#### Paràmetres de sortida
Un exemple de paràmetres de sortida seria el següent:
```javascript
"rewards" : {
  [  
    {  
      "name":"recompensa 01",
      "description":"Descripció de la primera recompensa",
      "takes":100,
      "level":1
    },
    {  
      "name":"recompensa 02",
      "description":"Descripció de la segona recompensa",
      "takes":200,
      "level":1
    }
  ]
}
```  

### GET /rewards/user
GET de la llista de recompenses d'un usuari.  

#### Paràmetres d'entrada
Els següents són opcionals:
  - **page_size**: Quantes recompenses com a màxim vols rebre. Per defecte és 20.
  - **page_number**: Número de pàgina de recompenses anant de *page_size* en *page_size*. Per defecte és 1.
Els **paràmetres obligatoris** són els següents: **uid**, **provider** i **token** (a més de l'**appkey**).  

Un exemple de paràmetres d'entrada:  
```javascript
{
  'appkey' : '7384d85615237469c2f6022a154b7e2c',
  'token' : '5ba039ba572efb08d6442074d7d478d5',
  'uid' : '1a',
  'provider' : 'provider',
  'page_size' : 20
}
```  

#### Paràmetres de sortida
Retorna la llista de recompenses comprades per l'usuari en un array *rewards*, amb l'atribut *total_items* que indica quantes recompenses diferents ha comprat, amb l'atribut *total_rewards* que es el total de recompenses en total que ha comprat, tenint en compte que ha pogut comprar més d'una recompensa del mateix tipus.  

Un exemple de paràmetres de sortida seria el següent:  
```javascript
{
  "total_items": 3,
  "total_rewards": 12,
  "rewards": [
    {
      "reward": {
        "name": "recompensa 01",
        "description": "Descripció de la primera recompensa",
        "takes": 100,
        "level": 1,
        "amount": 3 // Quantes recompenses d'aquest tipus ha comprat
      }
    },
    {
      "reward": {
        "name": "recompensa 02",
        "description": "Descripció de la segona recompensa",
        "takes": 200,
        "level": 1,
        "amount": 5 // Quantes recompenses d'aquest tipus ha comprat
      }
    },
    {
      "reward": {
        "name": "recompensa 04",
        "description": "Descripció de la 4a recompensa",
        "takes": 10,
        "level": 1,
        "amount": 4 // Quantes recompenses d'aquest tipus ha comprat
      }
    }
  ]
}
```

### POST /rewards/user  

#### Paràmetres d'entrada
Exemple de paràmetre d'entrada:  
```javascript
{
  'appkey' : '7384d85615237469c2f6022a154b7e2c', // paràmetre obligatori per totes les peticions a l'API
  'token' : '5ba039ba572efb08d6442074d7d478d5', // Paràmetre obligatori
  'uid' : '1a', // Paràmetre obligatori
  'provider' : 'provider', // Paràmetre obligatori
  'reward_name' : 'recompensa 04', // Paràmetre obligatori
  'amount' : 3 // Paràmetre opcional, si no s'envia val 1
}
```  

#### Paràmetres de sortida
L'API comprova si té el nivell suficient per comprar aquesta recompensa i si li queden bastant takes, i si es així, es fa la compra s'encarrega tant de crear la comprar, com d'actualitzar l'*amount* si ha l'havia comprat abans i també li resta els takes.  
Si tot ha anat bé, retorna el següent:  
```javascript
{
  "purchase": {
    "reward_name": "recompensa 04",
    "uid": "1a",
    "provider": "provider",
    "amount" : 3, // La quantitat de recompenses d'aquest tipus que ha comprar aquest usuari aquesta vegada
    "total_amount": 5, // El total de recompenses d'aquest tipus que ha comprat aquest usuari (entre totes les peticions a l'API)
    "takes_left": 2450 // La quantitat de takes que li queden a l'usuari
  }
}
```

## Users API (Peticions d'usuaris i de les seves preferències)

### GET /users/
GET de tots els usuaris de la base de dades.

#### Paràmetres d'entrada
No cal cap paràmetre d'entrada excepte l'**appkey**.

#### Paràmetres de sortida
Un exemple de sortida seria el següent:
```javascript
'users' : [
  {
    "uid":"1a",
    "provider":"provider",
    "name":"Nom1",
    "takes":2320,
    "experience":3800,
    "level":2
  },
  (...)
  {
    "uid":"31cb",
    "provider":"providerTest",
    "name":"nameTest",
    "takes":0,
    "experience":0,
    "level":1
  }
]
```

### GET /users/:id
GET de l'usuari identificat per uid i provider en format: uid-provider.

#### Paràmetres d'entrada
Els paràmetres d'entrada necessaris són els següents (a més de l'**appkey**):
 - **uid**: Paràmetre que correspon a l'identificador únic dels usuaris per a aquell proveïdor.
 - **provider**: Paràmetre que indica de quin proveïdor és aquell uid.
 **uid** i **provider** conjuntament són l'identificador de l'usuari, i un exemple d'aquest request seria:
 *GET /users/31-providerTest*.

#### Paràmetres de sortida
Un exemple de sortida seria el següent:
```javascript
{
  'user' : {
    "uid":"31cb",
    "provider":"providerTest",
    "name":"nameTest",
    "takes":0,
    "experience":0,
    "level":1,
    "experience_of_next_level":0.6,
    'has_preferences' : false, // Si té preferències o no
    'number_checkins' : 0
  }
}
```

### POST /users/
POST utilitzat per tal d'afegir un nou usuari a la base de dades.

#### Paràmetres d'entrada
Els paràmetres d'entrada necessaris són els següents (a més de l'**appkey** i del **token**):
 - **uid**: Paràmetre que correspon a part de l'identificador únic dels usuaris.
 - **provider**: Paràmetre que correspon a l'altra part de l'identificador únic dels usuaris.
 - **name**: Paràmetre que correspon al nom de l'usuari.

#### Paràmetres de sortida
Un exemple seria:
```javascript
{
  'user' : {
    'uid' : "4b",
    'provider' : 'providerTest',
    'name' : 'nameTest',
    'takes' : 0,
    'experience' : 0,
    'level' : 1,
    'new_user' : true, // Si es un nou usuari o si ja existia
    'has_preferences' : false, // Si té preferències o no
    'number_checkins' : 0,
    'experience_of_next_level': 0.6,
    'token' : '364b99c40b84b5207e89a207a606720a' // El token per identificar la sessió
  }
}
```  
Si no existia, el crea i retorna tota la seva informació (amb el token inclòs), si existia, renova el token i el retorna.  

### PUT /users/:id
PUT utilitzat per tal d'actualitzar informació de l'usuari identificat per uid i provider.

#### Paràmetres d'entrada
Els paràmetres d'entrada necessaris són els següents (a més de l'**appkey** i del **token**):
 - **uid**: Paràmetre que correspon a part de l'identificador únic dels usuaris.
 - **provider**: Paràmetre que correspon a l'altra part de l'identificador únic dels usuaris.
 - **name**: Paràmetre que correspon al nom de l'usuari.

#### Paràmetres de sortida
Un exemple seria:
```javascript
{
  'user' : {
    'uid' : '4b',
    'provider' : 'providerTest',
    'name' : 'nameTest',
    'takes' : 0,
    'experience' : 0,
    'level' : 1,
  }
}
```

### DELETE /users/:id
DELETE utilitzat per tal d'esborrar de la base de dades l'usuari identificat per uid i el seu provider.

#### Paràmetres d'entrada
Els paràmetres d'entrada necessaris són els següents (a més de l'**appkey** i del **token**):
 - **uid**: Paràmetre que correspon a l'identificador únic dels usuaris per a aquell proveïdor.
 - **provider**: Paràmetre que indica de quin proveïdor és aquell uid.
 **uid** i **provider** conjuntament són l'identificador de l'usuari, i un exemple d'aquest request seria:
 *DELETE /users/31-providerTest*.

#### Paràmetres de sortida
No hi ha paràmetres de sortida, només el propi codi HTTP de resposta.


### GET /users/:uid-provider/preferences
GET de les preferències de l'usuari identificat per uid i provider en format: uid-provider.

#### Paràmetres d'entrada
Els paràmetres d'entrada necessaris són els següents (a més de l'**appkey**):
 - **uid**: Paràmetre que correspon a l'identificador únic dels usuaris per a aquell proveïdor.
 - **provider**: Paràmetre que indica de quin proveïdor és aquell uid.
 - **token**: Token de la sessió de l'usuari.
 **uid** i **provider** conjuntament són l'identificador de l'usuari, i un exemple d'aquest request seria:
 *GET /users/2-provider/preferences*.

#### Paràmetres de sortida
Un exemple de sortida seria el següent:
```javascript
{
  "uid": "2",
  "provider": "provider",
  "categories": "music||comedy||art||sports",
  "locations": "Barcelona||Madrid||Bilbao"
}
```

### POST /users/:uid-provider/preferences
POST utilitzat per tal d'afegir les preferències de l'usuari a la base de dades.  
Només feu aquesta petició quan no té guardades les preferències, però si estan guardades i voleu modificar-les, feu la petició PUT.  
Exemple de la petició per un usuari amb uid 1 i provider facebook: *POST /users/1-facebook/preferences*  

#### Paràmetres d'entrada
Els paràmetres d'entrada necessaris al *body* són els següents (a més de l'**appkey**):
 - **token**: Token de la sessió de l'usuari.
 - A més, cal enviar les **categories** i/o les **locations** (podeu enviar només una de les 2 o les 2).  

#### Paràmetres de sortida
Un exemple seria:
```javascript
{
  "uid": "2",
  "provider": "provider",
  "categories": "music||comedy||art||sports",
  "locations": "Barcelona||Madrid||Bilbao"
}
```  

### PUT /users/:uid-provider/preferences
PUT utilitzat per tal de modificar les preferències de l'usuari previament guardades amb un POST.  
Exemple de la petició per un usuari amb uid 1 i provider facebook: *PUT /users/1-facebook/preferences*  

#### Paràmetres d'entrada
Els paràmetres d'entrada necessaris al *body* són els següents (a més de l'**appkey**):
 - **token**: Token de la sessió de l'usuari.
 - A més, cal enviar les **categories** i/o les **locations** (podeu enviar només una de les 2 o les 2).  

#### Paràmetres de sortida
Un exemple seria:
```javascript
{
  "uid": "2",
  "provider": "provider",
  "categories": "music||comedy||art||sports",
  "locations": "Barcelona||Madrid||Bilbao"
}
```  
Si s'han modificat només les *categories* o només les *locations*, igualment es retornen les *categories* i *locations* que té actualment, encara que un d'ells no s'hagi modificat (o sí, si envieu els 2 paràmetres).  

### DELETE /users/:uid-provider/preferences
DELETE utilitzat per tal d'esborrar les preferències de l'usuari.  
Exemple de la petició per un usuari amb uid 1 i provider facebook: *DELETE /users/1-facebook/preferences*  

#### Paràmetres d'entrada
Els paràmetres d'entrada necessaris són els següents (a més de l'**appkey**):
 - **uid**: Paràmetre que correspon a l'identificador únic dels usuaris per a aquell proveïdor.
 - **provider**: Paràmetre que indica de quin proveïdor és aquell uid.
 - **token**: Token de la sessió de l'usuari.
 **uid** i **provider** conjuntament són l'identificador de l'usuari, i un exemple d'aquest request seria:
 *DELETE /users/31-providerTest*.

#### Paràmetres de sortida
No hi ha paràmetres de sortida, només el propi codi HTTP de resposta.

## Achievements API (Peticions de 'logros')

### GET /achievements/
GET d'una llista de 'logros'.  

#### Paràmetres d'entrada
No cal cap paràmetre d'entrada (excepte l'**appkey**), però els següents són opcionals:
  - **page_size**: Quants 'logros' com a màxim vols rebre. Per defecte és 20.  
  - **page_number**: Número de pàgina de 'logros' anant de *page_size* en *page_size*. Per defecte és 1.
Els logros estan ordenats per alfabèticament pel nom.  

#### Paràmetres de sortida
Un exemple de paràmetres de sortida seria el següent:
```javascript
```javascript
{  
  "achievements":[  
    {  
      "id":"animals_10",
      "name":"logro 01",
      "description":"random description 01",
      "takes": 100
    },
    {  
      "id":"unAltreId",
      "name":"logro 02",
      "description":"random description 02",
      "takes": 100
    },
    {
      "id":"unIdMes",
      "name":"logro 03",
      "description":"random description 03",
      "takes": 100
    }
  ]
}
```  

### GET /achievements/user
GET de la llista de 'logros' d'un usuari.

#### Paràmetres d'entrada
Els següents són opcionals:
  - **page_size**: Quants 'logros' com a màxim vols rebre. Per defecte és 20.
  - **page_number**: Número de pàgina de 'logros' anant de *page_size* en *page_size*. Per defecte és 1. Els logros estan ordenats per alfabèticament pel nom.  
Els **paràmetres obligatoris** són els que identifiquen l'usuari: **uid** i **provider**.  
No cal token de sessió perquè qualsevol persona pot veure els 'logros' de qualsevol altre usuari.

Un exemple de paràmetres d'entrada:  
```javascript
{
  'appkey' : '7384d85615237469c2f6022a154b7e2c', // paràmetre obligatori per totes les peticions a l'API
  'uid' : '1a',
  'provider' : 'provider',
  'page_size' : 20
}
```  

#### Paràmetres de sortida
Un exemple de paràmetres de sortida seria el següent:  

```javascript
{  
  "achievements":[  
    {  
      "id":"animals_10",
      "name":"logro 01",
      "description":"random description 01",
      "takes": 100
    },
    {  
      "id":"unAltreId",
      "name":"logro 02",
      "description":"random description 02",
      "takes": 100
    },
    {
      "id":"unIdMes",
      "name":"logro 03",
      "description":"random description 03",
      "takes": 100
    }
  ]
}
```  

## Recommendations API (Peticions de recomanacions d'esdeveniments per un usuari durant un mes)

Pàrametres d'entrada comunts per totes les peticions:
	- API key (que sempre és el següent: **7384d85615237469c2f6022a154b7e2c**)

### GET /recommendations/:id
GET d'una llista d'esdeveniments amb data com a molt a un mes vista recomanats per un usuari segons les seves preferències.  
Si no té preferències guardades, s'envien els esdeveniments sense importar la categoria ni la localització.   


#### Paràmetres d'entrada
  - l'id de l'usuari al paràmetre és uid-provider, per exemple: **GET /recommendations/123-facebook**  
  - Els paràmetres d'entrada obligatoris per query són l'**appkey** i el **token** de l'usuari.  
  - Els paràmetres d'entrada opcionals per query són el **page_size**, el **page_number**, i **sort_order**, si no s'envien, per defecte són *20*, *1* i *relevance* respectivament.  

#### Paràmetres de sortida
Igual que a *GET /events*.  

  - Un exemple explicat en el següent JSON (els esdeveniments estan ordenats per data):  
```javascript
{  
   "total_items":"1647", // Total d'esdeveniments que compleixen les condicions del paràmetres d'entrada.
   "page_number":"1",
   "page_size":"10", // Quants esdeveniments de total_items realment venen en el següent array
   "events":{  
      "event":[ // Array amb la llista dels 10 esdeveniments
        {
          // Informació de l'esdeveniment1
          "id":"E0-001-095182625-3", // ID de l'esdeveniment
          "title":"Títol de l'esdeveniment 1",
          "description":"<strong>Descripció de l'esdeveniment en HTML</strong><p>i a més la descripció pot ser mooooooooolt llarga! (si voleu un exemple real el puc possar més endavant)</p>",
          /* Sí, ve totalment en HTML, fins el punt que he vist això dins d'una descripció: gran selecció d&#39;estàndards<br>
          però amb Android es pot mostrar sense que sigui un problema :) */
          "number_attendances" : 0, // nombre d'usuaris de la nostra aplicació que volen van fer click a "assistiré" d'aquest esdeveniment
          "checkin_done" : 0, // si l'usuari ha fet check-in a aquest esdeveniment
          "wanted_attendance" : 1, // si l'usuari ha marcat 'assistiré' per aquest esdeveniment
          "takes" : 123, // takes que es guanyen assitint a aquest esdeveniment
          "url":"http://barcelona.eventful.com/events/jazzman-trio-/E0-001-088579321-8@2016091200?utm_source=apis&utm_medium=apim&utm_campaign=apic", // URL de l'esdeveniment a Eventful
          "all_day":"0", // 0 vol dir que l'horari queda específicat per l'start_time i l'stop_time, 1 vol dir tot el dia i 2 vol dir "no time specified"
          "start_time":"2016-09-12 23:00:00",
          "stop_time":"null", // Tot i que "all_day" valgui 0, aquest paràmetre pot tenir valor "null"
          "venue_display":"1", // Si val 1, podem mostrar la informació del local sense cap problema, si val 0 vol dir que la informació del local no del tot fiable perquè a vegades en lloc del local només sabem amb total seguretat en quina ciutat serà.
          "venue_id":"V0-001-009623999-6", // ID del local
          "venue_name":"Jazzman Jazzclub", // Nom del local
          "address":"Roger de Flor, 238", // Adreça del local
          "city":"Barcelona",
          "country":"Spain",
          "region":null, // A vegades ve com a null i a vegades com "Cataluna", però si volem cercar per regió hem de cercar per "Catalonia" i ens trobarà els que no tenen valor null aquí.
          "postal_code":null,
          "latitude":"41.3833", // És un float amb signe
          "longitude":"2.18333", // És un float amb signe
          "images":{ // images a vegades val null però quan té contingut, tindrà (o gairebé sempre) thumb (48x48), medium (128x128) i large (480x480)
            "medium":{  
              "width":"128",
              "height":"128",
              "url":"http://s1.evcdn.com/store/skin/no_image/categories/128x128/other.jpg"
            },
            "thumb":{  
              "width":"48",
              "height":"48",
              "url":"http://s1.evcdn.com/store/skin/no_image/categories/48x48/other.jpg"
            }
          },
          "categories":{ // Sempre he vist que ve 1 i només 1 categoria dins del següent array, i mai ho he vist com a null (però això ho trec dels exemples que he vist, no es que m'ho digui la especificació que he llegit)
            "category":[  
              {  
                "name":"Other &amp; Miscellaneous",
                "id":"other"
              }
            ]
           },
           "free": null, // Des d'aquí, sempre serà null
           "price": null, // Des d'aquí, sempre serà null
        },
        {
          // Informació de l'esdeveniment2
          // ...
        },
        /*
        Esdeveniments del 3 al 9 ...
        */
        {
          // Informació de l'esdeveniment10
          // ...
        }
      ]
   }
}
```  

  - En les dades d'un esdeveniment no ve el **preu**, aquesta informació sí ve en el **GET /events/:id** pel GET d'un esdeveniment concret pel seu ID.  

## Aclaracions
Dades necessaries a ```insertDadesFalsesPerFerProves.sql``` per passar les proves amb *node scriptDatabase.js && npm run test*:  
```SQL
INSERT INTO users VALUES ("1", "provider", "Nom1", 2500, 3800, 2);
INSERT INTO users VALUES ("2", "provider", "Nom2", 200, 200, 1);
INSERT INTO users VALUES ("3", "provider", "Nom3", 60, 60, 1);

INSERT INTO tokens VALUES("b903e0f0b987fc22588f517c9df0274f", "1", "provider");
INSERT INTO tokens VALUES("526b0e737e7ad6e3344da44e56559ce5", "2", "provider");
INSERT INTO tokens VALUES("67bfd2aa446a1f125fed5d317dc254a5", "3", "provider");

INSERT INTO achievements VALUES (1, "logro 01", "random description 01", 10, "music", 1);
INSERT INTO achievements VALUES (2, "logro 02", "random description 02", 20, "comedy", 1);
INSERT INTO achievements VALUES (3, "logro 03", "random description 03", 30, "other", 1);

INSERT INTO rewards VALUES ("recompensa 01", "Descripció de la primera recompensa", 100, 1);
INSERT INTO rewards VALUES ("recompensa 02", "Descripció de la segona recompensa", 200, 1);
INSERT INTO rewards VALUES ("recompensa 03", "Descripció de la tercera recompensa", 50, 2);
INSERT INTO rewards VALUES ("recompensa 04", "Descripció de la 4a recompensa", 10, 1);

INSERT INTO events VALUES ("E0-001-093720767-4", 0, "2017-02-27 00:00:00", "2017-03-02 00:00:00", 0, 10);
INSERT INTO events VALUES ("E0-001-000278174-6", 0, "2005-08-24 12:00:00", null, 0, 5);
INSERT INTO events VALUES ("E0-001-096844204-0@2016102500", 0, "2016-10-25 00:35:00", null, 0, 5);
INSERT INTO events VALUES("E0-001-095872589-2@2016102508", 2, null, null, 0, 10);

INSERT INTO attendances VALUES("E0-001-093720767-4", "1", "provider", false, null);
INSERT INTO attendances VALUES("E0-001-000278174-6", "1", "provider", true, '13:32');
INSERT INTO attendances VALUES("E0-001-000278174-6", "2", "provider", true, '08:04');
INSERT INTO attendances VALUES("E0-001-096844204-0@2016102500", "1", "provider", false, null);
INSERT INTO attendances VALUES("E0-001-095872589-2@2016102508", "1", "provider", false, null);

INSERT INTO userscategories VALUES("1", "provider", "music", 1);
INSERT INTO userscategories VALUES("2", "provider", "music", 1);

INSERT INTO acquisitions VALUES("1", "provider", 1);

INSERT INTO purchases VALUES ("1", "provider", "recompensa 01", 3);
INSERT INTO purchases VALUES ("1", "provider", "recompensa 02", 5);
```  
  
Dades necessaries a ```insertDadesFalsesPerFerProves.sql``` per fer *node scriptDatabase.js* per fer proves des de l'app d'Android:  
```SQL

INSERT INTO users VALUES ('1', "provider", "Nom1", 2500, 3800, 2);
INSERT INTO users VALUES ('2', "provider", "Nom2", 200, 200, 1);
INSERT INTO users VALUES ('3', "provider", "Nom3", 60, 60, 1);

INSERT INTO tokens VALUES("b903e0f0b987fc22588f517c9df0274f", "1", "provider");
INSERT INTO tokens VALUES("526b0e737e7ad6e3344da44e56559ce5", "2", "provider");
INSERT INTO tokens VALUES("67bfd2aa446a1f125fed5d317dc254a5", "3", "provider");

INSERT INTO events VALUES ("E0-001-093720767-4", 0, "2017-02-27 00:00:00", "2017-03-02 00:00:00", 0, 10);
INSERT INTO events VALUES ("E0-001-000278174-6", 0, "2005-08-24 12:00:00", null, 0, 5);
INSERT INTO events VALUES ("E0-001-096844204-0@2016102500", 0, "2016-10-25 00:35:00", null, 0, 5);
INSERT INTO events VALUES("E0-001-095872589-2@2016102508", 2, null, null, 0, 10);

INSERT INTO attendances VALUES("E0-001-093720767-4", "1", "provider", false, null);
INSERT INTO attendances VALUES("E0-001-000278174-6", "1", "provider", true, '13:32');
INSERT INTO attendances VALUES("E0-001-000278174-6", "2", "provider", true, '08:04');
INSERT INTO attendances VALUES("E0-001-096844204-0@2016102500", "1", "provider", false, null);
INSERT INTO attendances VALUES("E0-001-095872589-2@2016102508", "1", "provider", false, null);

INSERT INTO userscategories VALUES("1", "provider", "music", 1);
INSERT INTO userscategories VALUES("2", "provider", "music", 1);
```  


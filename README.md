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
	- API key (encara que ara per ara funciona sense API key :stuck_out_tongue:)

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
  - També es possible enviar un **page_size** que vol dir quants esdeveniments màxim volem rebre de tots els que hi ha amb aquestes condicions. Per defecte, si no s'envia res, és *10*.
  - I per últim també es pot enviar un **page_number** amb quina pàgina volem rebre amb *page_size* esdeveniments de la llista total d'esdeveniments estem, tenint en compte que cada pàgina té *page_size* esdeveniments. Per exemple, si *page_size* val 10 i *page_number* val 2, tindrem la llista d'esdeveniments de l'11 al 20. *page_number* és opcional i per defecte val 1.    
  - Un exemple de paràmetres d'entrada (en forma de JSON, però s'envien a la URL):  
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
          "images":{ // images a vegades val null però quan té contingut, sempre l'he vist així amb aquests 2 tamanys (però a l'especificació no diu que sigui així sempre, només m'ho he trobat així en tots els exemples que he vist)
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
          ,
          "categories": null, // Des d'aquí, sempre serà null
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

  - En les dades d'un esdeveniment no ve ni la **categoria** ni el **preu**, però totes dues dades sí venen en el **GET /events/:id** pel GET d'un esdeveniment concret pel seu ID.  

### GET /events/:id
GET d'un esdeveniment en particular pel seu ID.  

#### Paràmetres d'entrada
Cap paràmetre d'entrada, però un exemple d'aquest GET seria (sent l'ID de l'esdeveniment: *E0-001-095173443-9*):  `urlDelServidor/events/E0-001-095173443-9`  

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
  "images":{ // images a vegades val null però quan té contingut, sempre l'he vist així amb aquests 2 tamanys (però a l'especificació no diu que sigui així sempre, només m'ho he trobat així en tots els exemples que he vist)
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
   "free":"null", // 1 vol dir gratis, 0 vol dir de pagament i null vol dir que encara no ho sabem.
   "price":"null", // pot ser null o pot ser un String descriptiu amb el preu (encara que no he vist cap exemple amb preu, fins i tot tenint el link de la venta d'entrades).
},
```  

Les diferències respecte a **GET /events/** són les següents:  
  - Ara els atribus **categories**, **free** i **price** poden no ser *null*.

### GET /events/user/
GET de tots els esdeveniments d'un usuari.  

#### Paràmetres d'entrada
Faltaria també el token de sessió de l'usuari per assegurar-nos que només el propi usuari pot veure aquesta informació (**encara no implementat** :smile: :octocat:).  
Exemple de paràmetre d'entrada, del que hi ha per ara a falta del token, (en forma de JSON, però s'envien a la URL):
```javascript
{
  'uid' : 1234, // paràmetre obligatori
  'provider' : 'facebook', // paràmetre obligatori
  'page_size' : 20, // paràmetre opcional
  'page_number' : 1 // paràmetre opcional
};
```
  - **page_size**: vol dir quants esdeveniments màxim volem rebre de tots els que hi ha per aquest usuari. Per defecte, si no s'envia res, és *20*.
  - **page_number**: vol dir quina pàgina volem rebre amb *page_size* esdeveniments de la llista total d'esdeveniments d'aquest usuari, tenint en compte que cada pàgina té *page_size* esdeveniments. Per exemple, si *page_size* val 10 i *page_number* val 2, tindrem la llista d'esdeveniments de l'11 al 20. *page_number* és opcional i per defecte val 1.    


#### Paràmetres de sortida
  - Esdeveniments ordenats per data. Categoritzats per **past**, **present** i **future**.  
Un exemple seria el següent:
```javascript
{
  "total_items": 2,
  "past": {
    "events": [
      {
        "event": {
          "id": "E0-001-000278174-6",
          "checkin_done": 1,
          "title": "Martini Tasting",
          "description": "Sample drinks made with featured vodkas.",
          "number_attendances": 2,
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
          "title": "GSMA Mobile World Congress",
          "description": null,
          "number_attendances": 1,
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
  - Exactament les mateixes dades per cada esdeveniment que a **GET /events/:id/** però amb un atribut més per a aquest usuari: **checkin_done**, que pot ser *1* si l'ha fet i *0* si no.  

### POST /events/user/
POST per un "assistiré" d'un usuari a un esdeveniment.

#### Paràmetres d'entrada
Faltaria també el token de sessió de l'usuari per assegurar-nos que només el propi usuari pot crear aquesta informació (**encara no implementat** :smile: :octocat:).  
Exemple de paràmetre d'entrada (del que hi ha per ara a falta del token):
```javascript
{
  'event_id' : 'E0-001-093875660-9', // paràmetre obligatori
  'uid' : 1234, // paràmetre obligatori
  'provider' : 'facebook' // paràmetre obligatori
}
```

#### Paràmetres de sortida
Si tot ha anat bé, retorna el següent:
```javascript
'attendance' : {
  'event_id' : 'E0-001-093875660-9',
  'uid' : 1234,
  'provider' : 'facebook',
  'checkin_done' : '0'
}
```

### PUT /events/:id/user/
PUT per fer el check-in d'una assitència a un esdeveniment (s'ha d'haver marcat previament com 'assitiré').
Un exemple d'aquest PUT seria a la següent URL (sent l'ID de l'esdeveniment: *E0-001-095173443-9*):  `urlDelServidor/events/E0-001-095173443-9`  
**Falta que el check-in li doni els takes que li ha de donar, però no ho podem implementar en aquesta iteració encara perquè haurem de definir bé el tema dels takes, els nivels, les recompenses i els 'logros' abans de programar-ho.** :ok_hand: :smile: :sunglasses:  

#### Paràmetres d'entrada
Faltaria també el token de sessió de l'usuari per assegurar-nos que només el propi usuari pot fer un check-in d'ell mateix a la nostra API (**encara no implementat** :smile: :octocat:).  
Exemple de paràmetre d'entrada (del que hi ha per ara a falta del token):
```javascript
{
  'uid' : 1234, // paràmetre obligatori
  'provider' : 'facebook', // paràmetre obligatori
  'checkin_done' : '1' // paràmetre obligatori, i ha de ser un '1' o un 'true' (ara mateix la API no accepta desmarcar un check-in fet anteriorment).
}
```

#### Paràmetres de sortida
Si tot ha anat bé, retorna el següent:
```javascript
'attendance' : {
  'event_id' : 'E0-001-093875660-9',
  'uid' : 1234,
  'provider' : 'facebook',
  'checkin_done' : '1'
}
```

### DELETE /events/:id/user/
DELETE d'una assitència a un esdeveniment (si s'ha fet el check-in a aquest esdeveniment, donarà error i no s'esborrarà l'assitència).
Un exemple d'aquest DELETE seria a la següent URL (sent l'ID de l'esdeveniment: *E0-001-095173443-9*):  `urlDelServidor/events/E0-001-095173443-9`  

#### Paràmetres d'entrada
Faltaria també el token de sessió de l'usuari per assegurar-nos que només el propi usuari pot desmarcar la seva assitència a un esdeveniment (**encara no implementat** :smile: :octocat:).  
Exemple de paràmetre d'entrada (del que hi ha per ara a falta del token):
```javascript
{
  'uid' : 1234, // paràmetre obligatori
  'provider' : 'facebook', // paràmetre obligatori
  'checkin_done' : '1' // paràmetre obligatori, i ha de ser un '1' o un 'true' (ara mateix la API no accepta desmarcar un check-in fet anteriorment).
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
No cal cap paràmetre d'entrada, però els següents són opcionals:
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
Els **paràmetres obligatoris** són els que identifiquen l'usuari: **uid** i **provider**.  

Un exemple de paràmetres d'entrada:  
```javascript
{
  'uid' : 1,
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
Faltaria també el token de sessió de l'usuari per assegurar-nos que només el propi usuari pot crear aquesta informació (**encara no implementat** :smile: :octocat:).  
Exemple de paràmetre d'entrada (del que hi ha per ara a falta del token):  
```javascript
{
  'uid' : 1, // Paràmetre obligatori
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
    "uid": 1,
    "provider": "provider",
    "amount" : 3, // La quantitat de recompenses d'aquest tipus que ha comprar aquest usuari aquesta vegada
    "total_amount": 5, // El total de recompenses d'aquest tipus que ha comprat aquest usuari (entre totes les peticions a l'API)
    "takes_left": 2450 // La quantitat de takes que li queden a l'usuari
  }
}
```

## Users API (Peticions d'usuaris)

### GET /users/
GET de tots els usuaris de la base de dades.

#### Paràmetres d'entrada
No cal cap paràmetre d'entrada.

#### Paràmetres de sortida
Un exemple de sortida seria el següent:
```javascript
[
    {
        "uid":1,
        "provider":"provider",
        "name":"Nom1",
        "surname":"Cognom1",
        "email":"emailfals1@gmail.com",
        "takes":2320,
        "experience":3800,
        "level":2
    },
    (...)
    {
        "uid":31,
        "provider":"providerTest",
        "name":"nameTest",
        "surname":"surnameTest",
        "email":"email31@test.com",
        "takes":0,
        "experience":0,
        "level":1
    }
]
```

### GET /users/:uid
GET de l'usuari identificat per uid.

#### Paràmetres d'entrada
Els paràmetres d'entrada necessaris són els següents:
 - **uid**: Paràmetre que correspon a l'identificador únic dels usuaris.

#### Paràmetres de sortida
Un exemple de sortida seria el següent:
```javascript
{
    "uid":31,
    "provider":"providerTest",
    "name":"nameTest",
    "surname":"surnameTest",
    "email":"email31@test.com",
    "takes":0,
    "experience":0,
    "level":1
}
```

### POST /users/
POST utilitzat per tal d'afegir un nou usuari a la base de dades.

#### Paràmetres d'entrada
Els paràmetres d'entrada necessaris són els següents:
 - **uid**: Paràmetre que correspon a part de l'identificador únic dels usuaris.
 - **provider**: Paràmetre que correspon a l'altra part de l'identificador únic dels usuaris.
 - **name**: Paràmetre que correspon al nom de l'usuari.
 - **surname**: Paràmetre que correspon al cognom de l'usuari.
 - **email**: Paràmetre que correspon al correu electrònic de l'usuari.
Un exemple seria:
```javascript
{
    'uid' : 31,
    'provider' : 'providerTest',
    'name' : 'nameTest',
    'surname' : 'surnameTest',
    'email' : 'email31@test.com'
}
```

#### Paràmetres de sortida
No hi ha paràmetres de sortida, només el propi codi HTTP de resposta.

### PUT /users/:uid
PUT utilitzat per tal d'actualitzar informació de l'usuari identificat per uid.

#### Paràmetres d'entrada
Els paràmetres d'entrada necessaris són els següents:
 - **uid**: Paràmetre que correspon a part de l'identificador únic dels usuaris.
 - **provider**: Paràmetre que correspon a l'altra part de l'identificador únic dels usuaris.
 - **name**: Paràmetre que correspon al nom de l'usuari.
 - **surname**: Paràmetre que correspon al cognom de l'usuari.
 - **email**: Paràmetre que correspon al correu electrònic de l'usuari.
Un exemple seria:
```javascript
{
    'name' : 'updatedName',
    'surname' : 'updatedSurname',
    'email' : updatedMail
};
```

#### Paràmetres de sortida
No hi ha paràmetres de sortida, només el propi codi HTTP de resposta.

### DELETE /users/:uid
DELETE utilitzat per tal d'esborrar de la base de dades l'usuari identificat per uid.

#### Paràmetres d'entrada
Els paràmetres d'entrada necessaris són els següents:
 - **uid**: Paràmetre que correspon a part de l'identificador únic dels usuaris.

#### Paràmetres de sortida
No hi ha paràmetres de sortida, només el propi codi HTTP de resposta.

## Achievements API (Peticions de 'logros')

### GET /achievements/
GET d'una llista de 'logros'.  

#### Paràmetres d'entrada
No cal cap paràmetre d'entrada, però els següents són opcionals:
  - **page_size**: Quants 'logros' com a màxim vols rebre. Per defecte és 20.  
  - **page_number**: Número de pàgina de 'logros' anant de *page_size* en *page_size*. Per defecte és 1.
Els logros estan ordenats per alfabèticament pel nom.  

#### Paràmetres de sortida
Un exemple de paràmetres de sortida seria el següent:
```javascript
{  
  "achievements":[  
    {  
      "name":"logro 01",
      "description":"random description 01"
    },
    {  
      "name":"logro 02",
      "description":"random description 02"
    },
    {  
      "name":"logro 03",
      "description":"random description 03"
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

Un exemple de paràmetres d'entrada:  
```javascript
{
  'uid' : 1,
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
      "name":"logro 01",
      "description":"random description 01"
    },
    {  
      "name":"logro 02",
      "description":"random description 02"
    },
    {  
      "name":"logro 03",
      "description":"random description 03"
    }
  ]
}
```  

### POST /achievements/user/
POST per quan usuari guanya un 'logro'.

#### Paràmetres d'entrada
Faltaria també el token de sessió de l'usuari per assegurar-nos que només el propi usuari pot crear aquesta informació (**encara no implementat** :smile: :octocat:).  
Exemple de paràmetre d'entrada (del que hi ha per ara a falta del token):
```javascript
{
  'achievement_name' : 'nom del logro', // paràmetre obligatori
  'uid' : 1234, // paràmetre obligatori
  'provider' : 'facebook' // paràmetre obligatori
}
```

#### Paràmetres de sortida
Si tot ha anat bé, retorna el següent:
```javascript
'acquisition' : {
  'achievement_name' : 'nom del logro',
  'uid' : 1234,
  'provider' : 'facebook'
}
```

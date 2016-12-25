const utilsCommon = require('../utils/common'),
      rp = require('request-promise'),
      Promise = require("bluebird"),

      urlEventfulApi = "http://api.eventful.com/json/events/",
      keyEventfulApi = "KxZvhSVN3f38ct54";

module.exports = {
  getMoment: function (datetime_start, all_day, datetime_stop) { // Dono per suposat que stop_time és més tard que start_time si cap dels 2 val null
    const now = utilsCommon.getFormattedDateTimeNow();
    if (datetime_start == null || all_day == 2) { return "future"; } // Si encara no sabem la data en que comença és que l'esdeveniment és futur.
    if (datetime_start < now) {
      if (datetime_stop > now) { return "present"; }
      else { return "past"; }
    }
    return "future"; // Si no es compleix cap dels anteriors vol dir que start_time és futur
  },
  doRequest: function (params, type) {
    const finalURL = urlEventfulApi + type + "/" + "?app_key=" + keyEventfulApi + "&" + params;
    let optionsRequest = {
      url: finalURL,
      method: "GET",
      json: true
    };
    return rp(optionsRequest);
  },
  getFinalCategoryIdFromEventfulResponse: function (eventEventful) { return eventEventful["categories"] ? eventEventful["categories"]["category"][0]["id"] : null; },
  getNumberOfPreviousAttendancesOfCategoryByDBResult: function (DBresult) { return DBresult.length ? DBresult[0].number_attendances : 0; },
  getFinalJSONOfAnEvent: function (eventEventful, resultDB) {
    const event_id = eventEventful["id"],
          number_attendances_and_takes = getNumberOfAssitancesAndTakesFromDBResultByID(resultDB, event_id);
    return {
      event : {
        id : event_id,
        title : eventEventful["title"],
        description : eventEventful["description"] || null,
        number_attendances : number_attendances_and_takes.number_attendances,
        takes : number_attendances_and_takes.takes,
        url : eventEventful["url"] || null,
        all_day :  eventEventful["all_day"] || null,
        start_time :  eventEventful["start_time"] || null,
        stop_time :  eventEventful["stop_time"] || null,
        venue_display : eventEventful["venue_display"] || null,
        venue_id : eventEventful["venue_id"] || null,
        venue_name : eventEventful["venue_name"] || null,
        address : eventEventful["venue_address"] || eventEventful["address"] || null,
        city : eventEventful["city_name"] || eventEventful["city"] || null,
        country : eventEventful["country_name"] || eventEventful["country"] || null,
        region : eventEventful["region_name"] || eventEventful["region"] || null,
        postal_code : eventEventful["postal_code"] || null,
        latitude : eventEventful["latitude"] || null,
        longitude : eventEventful["longitude"] || null,
        images : eventEventful["image"] || eventEventful["images"] || null,
        free : eventEventful["free"] || null,
        price : eventEventful["price"] || null,
        categories : eventEventful["categories"] || null
      } // Per ara no retornem "Performers" ni "Tags" ni "Links"
    };
  },
  getTakesToEarnInEvent: function() { return Math.floor(Math.random() * 1000 + 1); }, // Retorna un número aleatori del rang [1, 1000)
  prepareFinalResponseOfAllEventsJSON: function (eventsEventful, resultDB) {
    // Prepara les dades generals:
    let myEventsResponse = {
      total_items : eventsEventful.total_items,
      page_number : eventsEventful.page_number,
      page_size : eventsEventful.page_size,
      events : []
    };

    // Prepara les dades d'esdeveniments:
    for (let position = eventsEventful.page_size - 1; position >=0; position--) {
      myEventsResponse.events[position] = this.getFinalJSONOfAnEvent(eventsEventful.events.event[position], resultDB);
    }
    return myEventsResponse;
  },
  buildSearchParams: function (params_query, page_size, page_number) {
    let params = `sort_order=date&page_size=${page_size}&page_number=${page_number}&include=categories`;
    if (params_query.location) {
      params = params + "&location=" + params_query.location;
      let within = 350;
      if (params_query.within) {
        within = params_query.within;
      }
      params = params + "&units=km&within=" + within;
    }
    if (params_query.keywords) { params = params + "&keywords=" + params_query.keywords; }
    if (params_query.category) { params = params + "&category=" + params_query.category; }
    if (params_query.date) { params = params + "&date=" + params_query.date; }
    return params;
  },
  createAndSaveAttendanceWithNeededData: function (mysqlConnection, event_id, uid, provider, checkin_done = false, start = null, stop = null, all_day = null) {
    return new Promise((resolve, reject) => {
      const sqlEventInDB = `SELECT takes FROM events WHERE id='${event_id}';`;
      let takes = -1;
      let toBeSaved;
      mysqlConnection.query(sqlEventInDB)
      .then((result) => {
        // Si no tenim l'esdeveniment a la nostra BD, el demanem a Eventful
        return new Promise((resolve, reject) => {
          if (result.length != 0 && result[0].takes) {
            takes = result[0].takes;
            toBeSaved = false;
            resolve(result);
          }
          else {
            takes = this.getTakesToEarnInEvent();
            toBeSaved = true;
            resolve(1);
          }
        });
      })
      .then((result) => {
        // Si no tenim l'esdeveniment a la nostra BD, el guardem
        if (toBeSaved) {
          const sqlInsertEventInDB = `INSERT INTO events values ('${event_id}', ${all_day}, ${start}, ${stop}, 0, ${takes});`;
          return mysqlConnection.query(sqlInsertEventInDB);
        }
        else {
          return new Promise(function (resolve, reject){ resolve(1); });
        }
      })
      .then((result) => { // Inserta l'assitència
        const sqlInsertAttendanceInDB = `INSERT IGNORE INTO attendances values ('${event_id}', '${uid}', '${provider}', ${checkin_done});`;
        return mysqlConnection.query(sqlInsertAttendanceInDB);
      })
      .then((result) => { // Retorna
        const attendanceResponse = {
          event_id,
          uid,
          provider,
          'checkin_done' : checkin_done ? "1" : "0",
          takes
        };
        resolve(attendanceResponse);
      })
    });
  },
  getRangDates: function () {
    const today = new Date(),
          lastDate = new Date();
    lastDate.setMonth(lastDate.getMonth() + 1);
    return `${today.getFullYear()}${today.getMonth() + 1}${today.getDate()}00`
           + "-"
           + `${lastDate.getFullYear()}${lastDate.getMonth() + 1}${lastDate.getDate()}00`;
  }
};

function getNumberOfAssitancesAndTakesFromDBResultByID(DBresult, id) { // PREcondició: DBresult estan ordenats per ID
  if (DBresult) {
    const pos = findEventInDatabaseResponseByID(DBresult, id);
    if (pos > -1) { return { number_attendances : DBresult[pos].number_attendances, takes : DBresult[pos].takes }; }
  }
  return { number_attendances : 0, takes : -1 };
}

function findEventInDatabaseResponseByID(DBresult, id) { // Cerca binaria, PREcondició: DBresult estan ordenats per ID.
  if (DBresult.length === 0) { return -1; } // No trobat

  const mid = Math.floor(DBresult.length / 2),
        id_db = DBresult[mid].id;

  if (id_db.toString() === id.toString()) { return mid; } // Trobat
  else if (id.toString() > id_db.toString()) { return findEventInDatabaseResponseByID(DBresult.slice(mid, DBresult.length), id); }
  else { return findEventInDatabaseResponseByID(DBresult.slice(0, mid), id); }
}

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
    const finalURL = urlEventfulApi + type + "/" + "?app_key=" + keyEventfulApi + "&" + params + "&image_sizes=thumb,medium,large";
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
          info_from_db = _getDesiredInfoFromDBResultByID(resultDB, event_id);
    return {
      event : {
        id : event_id,
        title : eventEventful["title"],
        description : eventEventful["description"] || null,
        number_attendances : info_from_db.number_attendances,
        takes : info_from_db.takes,
        wanted_attendance : info_from_db.wanted_attendance,
        checkin_done : info_from_db.checkin_done,
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
  getTakesToEarnInEvent: function() { return Math.floor(Math.random() * 100 + 1); }, // Retorna un número aleatori del rang [1, 100)
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
  buildSearchParams: function (params_query, page_size, page_number, sort_order) {
    let params = `sort_order=${sort_order}&page_size=${page_size}&page_number=${page_number}&include=categories`;
    if (params_query.location) {
      const within = params_query.within || 350;
      params += `&location=${params_query.location}&units=km&within=${within}`;
    }
    if (params_query.keywords) { params += `&keywords=${params_query.keywords}`; }
    if (params_query.category) {
      const category = params_query.category.replace(/\|\|/g, ',');
      params += `&category=${category}`;
    }
    if (params_query.date) { params += `&date=${params_query.date}`; }
    return params;
  },
  createAndSaveAttendanceWithNeededData: function (mysqlConnection, event_id, uid, provider, start, stop, all_day, checkin_done = false, time_checkin = null) {
    return new Promise((resolve, reject) => {
      const sqlEventInDB = `SELECT takes FROM events WHERE id='${event_id}';`;
      let takes = -1, toBeSaved;
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
          const sqlInsertEventInDB = `INSERT INTO events values ('${event_id}', ${all_day},
                                   ${start ? "'" + start + "'" : null},
                                   ${stop ? "'" + stop + "'" : null},
                                   0, ${takes});`;
          return mysqlConnection.query(sqlInsertEventInDB);
        }
        else { return new Promise(function (resolve, reject){ resolve(1); }); }
      })
      .then((result) => { // Inserta l'assitència
        const sqlInsertAttendanceInDB = `INSERT IGNORE INTO attendances values ('${event_id}', '${uid}', '${provider}', ${checkin_done}, '${time_checkin}');`;
        return mysqlConnection.query(sqlInsertAttendanceInDB);
      })
      .then((result) => { // Fa el check-in si ja estava l'asstiència guardada sense check-in
        if (result.affectedRows == 0 && checkin_done) {
          const sql = `UPDATE attendances SET checkin_done=true, time_checkin='${time_checkin}' WHERE events_id='${event_id}' AND users_uid='${uid}' AND users_provider='${provider}';`;
          return mysqlConnection.query(sql);
        }
        else { return new Promise(function (resolve, reject){ resolve(1); }); }
      })
      .then((result) => { // Retorna
        const attendanceResponse = {
          event_id,
          uid,
          provider,
          'checkin_done' : checkin_done ? 1 : 0,
          time_checkin,
          takes
        };
        resolve(attendanceResponse);
      })
    });
  },
  getRangDates: function (firstDate = new Date(), months = 1) {
    const lastDate = new Date(firstDate.toString());
    lastDate.setMonth(lastDate.getMonth() + months);
    return `${firstDate.getFullYear()}${utilsCommon.addZero(firstDate.getMonth() + 1)}${utilsCommon.addZero(firstDate.getDate())}00`
           + "-"
           + `${lastDate.getFullYear()}${utilsCommon.addZero(lastDate.getMonth() + 1)}${utilsCommon.addZero(lastDate.getDate())}00`;
  }
};

function _getDesiredInfoFromDBResultByID(DBresult, id) { // PREcondició: DBresult estan ordenats per ID
  if (DBresult && DBresult.length > 0) {
    const pos = _findEventInDatabaseResponseByID(DBresult, id, 0, DBresult.length - 1);
    if (pos > -1) {
      return {
        number_attendances : DBresult[pos].number_attendances,
        takes : DBresult[pos].takes,
        wanted_attendance : (DBresult[pos].checkin_done != null) ? 1 : 0,
        checkin_done : DBresult[pos].checkin_done ? 1 : 0
      };
    }
  }
  return { number_attendances : 0, takes : -1, wanted_attendance: 0, checkin_done: 1 };
}

function _findEventInDatabaseResponseByID(DBresult, id, start_pos, end_pos) { // Cerca binaria, PREcondició: DBresult estan ordenats per ID.
  const middle_pos = Math.floor((end_pos + start_pos) / 2),
        id_db = DBresult[middle_pos].id;

  if (id_db == id) { return middle_pos; } // Trobat
  else if (start_pos === end_pos) { return -1; } // No trobat
  else if (id.toString() > id_db.toString()) { return _findEventInDatabaseResponseByID(DBresult, id, middle_pos + 1, end_pos); }
  else { return _findEventInDatabaseResponseByID(DBresult, id, start_pos, middle_pos); }
}

require('dotenv').config()
var { GoogleSpreadsheet } = require('google-spreadsheet');
var { JWT } = require('google-auth-library')
var async = require('async');
var mcache = require('memory-cache');

var doc;
var sheet;
var sessions;

var cacheTimeout = process.env.CACHE_TIMEOUT;
if (!cacheTimeout) {
    cacheTimeout = 5;
}

var getYear = function() {
    return (process.env.UKGC_YEAR) ? process.env.UKGC_YEAR : (new Date()).getFullYear();
 }

 var getSpreadsheetKey = function() {
    return process.env.UKGC_SPREADSHEET_URL.match(/[-\w]{25,}/);
 }

exports.getCachedSessions = function(callback) {
  var cachedSessions = mcache.get('cachedSessions')
  var cachedError = mcache.get('cachedError')
  if (cachedSessions) {
    callback(cachedSessions, cachedError);
  } else {
    callback(null, cachedError);
  }
}

exports.getCachedSession = function(sessionId, callback) {
  var cachedSessions = mcache.get('cachedSessions')
  var cachedError = mcache.get('cachedError')
  if (cachedSessions) {
    sessions = cachedSessions.filter(function (row) {
      return row.id === sessionId;
    });
    console.log('Got '+sessions.length+' sessions of ID ' + sessionId);
    session = sessions[0];
    callback(session, cachedError);
  } else {
    callback(null, cachedError);
  }
}

exports.initCachedSessions = function(callback) {
  setCache(function() {
    setInterval(setCache, cacheTimeout * 1000);
    callback();
  });
}

var setCache = function(callback) {
  exports.getSessions(function(sessions, error) {
    if(sessions) {
      mcache.put('cachedSessions', sessions);
    }
    mcache.put('cachedError', error);
    if(typeof callback === "function") {
      callback();
    }
  })
}

exports.getSessions = function(callback) {
  async.series([
      async function essentialConfig() {
        checkEssentialConfig(process.env, function(error) {
          if(error) {
            console.log(error)
            callback(null, error);
            return;
          }
        })
      },
      async function setAuth() {
        const serviceAccountAuth = new JWT({
          email: process.env.UKGC_CLIENT_EMAIL,
          key: process.env.UKGC_PRIVATE_KEY.split(String.raw`\n`).join('\n'),
          scopes: [
            'https://www.googleapis.com/auth/spreadsheets',
          ],
        });
        doc = new GoogleSpreadsheet(getSpreadsheetKey(), serviceAccountAuth);
      },
      async function loadInfoAndWorksheets() {
        var gSheetDoc = mcache.get('gSheetDoc');
        if(gSheetDoc) {
          sheet = gSheetDoc.sheetsByIndex[0];
          return;
        } else {
          var hrstart = process.hrtime(hrstart);
          await doc.loadInfo();
          var hrend = process.hrtime(hrstart);
          console.log('GSheets API response INFO in ' + hrend[0] + 's ' + hrend[1] / 1000000 + 'ms');
          mcache.put('gSheetDoc', doc, 30 * 60 * 1000);
          sheet = doc.sheetsByIndex[0];
        }
      },
      async function workingWithRows() {
        var hrstart = process.hrtime(hrstart);
        var rows = await sheet.getRows();
        var hrend = process.hrtime(hrstart);
        console.log('GSheets API response ROWS in ' + hrend[0] + 's ' + hrend[1] / 1000000 + 'ms');
        if ( typeof rows !== 'undefined' ) {
          sessions = rows.reduce(function(result, row) {
            if (row.get('Year') === getYear()) {
              return result.concat({
                title: row.get('Title'),
                room: row.get('Room'),
                id: row.rowNumber.toString(),
                year: row.get('Year'),
                time: row.get('Time'),
                leader1: row.get('Leader1'),
                leader2: row.get('Leader2'),
                leader3: row.get('Leader3'),
                leader4: row.get('Leader4'),
                sessionnotes: row.get('Session Notes'),
                hashtag: row.get('Hashtag'),
              })
            }
            return result;
          }, []);
        }
      }
    ], function(err){
        if( err ) {
          console.log('Error: '+err);
          callback(null, err)
        } else {
          callback(sessions);
        }
    });
}

var getYear = function() {
  return (process.env.UKGC_YEAR) ? process.env.UKGC_YEAR : (new Date()).getFullYear();
}

var getSpreadsheetKey = function() {
  return process.env.UKGC_SPREADSHEET_URL.match(/[-\w]{25,}/);
}

var checkEssentialConfig = function(config, callback) {
  var errorConstruction = [];
  if(!config.UKGC_PRIVATE_KEY) {
    errorConstruction.push('UKGC_PRIVATE_KEY is not set.');
  }
  if(!config.UKGC_CLIENT_EMAIL) {
    errorConstruction.push('UKGC_CLIENT_EMAIL is not set.');
  }
  if(!config.UKGC_SPREADSHEET_URL) {
    errorConstruction.push('UKGC_SPREADSHEET_URL is not set.');
  }
  if(errorConstruction.length !== 0) {
    errorConstruction.unshift('Required environment variables are not set:');
    var errorMessage = errorConstruction.join(' ');
  }
  callback(errorMessage);
}
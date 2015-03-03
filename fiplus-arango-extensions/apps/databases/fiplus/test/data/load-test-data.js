// User test data

var defaultUser = db.user.save({ // password 1234
    "_key": "101",
    "userData": {
        "profile_pic": "101",
        "age": 20,
        "gender": "female",
        "location_proximity_setting": true,
        device_ids: [
            '1',
            '2'
        ]
    },
    "user": "1234@data.com",
    "authData": {
        "active": true,
        "keyLength": 66,
        "workUnits": 60,
        "hashMethod": "pbkdf2",
        "hash": "1hmVAqCM7PMmpUnA8RzjqUfQqLn0iRNs4R394RFZrfeknnn+JPCW9jQWF+lu/61DcWMJZryD/PrAWmW7vNxeccfA",
        "salt": "p9LsaCy8G0JQubalJvzLsttjmcrm0qsq6y6aqVSDc03IhWoLqyxRlwM89OtXZG3XYT"
    }
});

var user1 = db.user.save({
    "_key": "1",
    "user": "test@data.com",
    "userData" :
    {
        "username": "one",
        "profile_pic": "any",
        "age": 20,
        "gender": "male",
        "location_proximity_setting": true
    },
    authData: {
        active: true,
        keyLength: 66,
        workUnits: 60,
        hashMethod: "pbkdf2",
        hash: "YCmjkxFdh7uzEdAuKRBITd6C68vEfSiSh4zY46acdB9z5xngvyuvO2qEuESxRPZ2klJI4e8hGiV3FXIrHcAUKdFr",
        salt: "okf9IJGcn5AyJ8YWsveYInmWDhC4aH65nBiE4DIbX5S8Lp7FeFVR8lSbiV2GUT04Bg"

    }
});

var user2 = db.user.save({
    "_key": "2",
    "user": "test2@data.com",
    "userData" :
    {
        "username": "two",
        "profile_pic": "any",
        "age": 20,
        "gender": "female",
        "location_proximity_setting": true
    },
    authData: { //password: test2
        active: true,
        keyLength: 66,
        workUnits: 60,
        hashMethod: "pbkdf2",
        hash: "YOkZwdgCz1SaJtqq34NPHMgBHc4qFFbNMxSgE6ig/KJ6UAXluLvF39F0ipYbOfCl+gHZ0yoyf8IEkY/P+JCtvBWD",
        salt: "tqyK0h68ilfsPxA6Muk8wQqWPYaf32s4RITfNj34TDUOqAIEvoJbkgnXquuirX1gI4"
    }
});

// A newly registered user used in user profile tests
var user3 = db.user.save({
    "_key": "3",
    "user": "test3@data.com",
    "userData" :
    {
        "username": "three",
        "profile_pic": "any",
        "age": 22,
        "gender": "female",
        "location_proximity_setting": true
    }
});

// used for confirm voted for suggestion users
var user4 = db.user.save({
    "_key": "4",
    "user": "test4@data.com",
    "userData" :
    {
        "username": "four",
        "profile_pic": "any",
        "age": 22,
        "gender": "female",
        "location_proximity_setting": true
    },
    authData: { //password: test4
        active: true,
        keyLength: 66,
        workUnits: 60,
        hashMethod: "pbkdf2",
        hash: "wNjirmHAbwRUvg2ij09oxu6p4oxEZe8OcdLOixg5B2TPFC+4JbcnI0JTyF3bHc+apx/ocQW7H+ih/Ky4OMKaFe92",
        salt: "EsmjF5l2uum0FEZAU4NumWxeRWpCBrFTAfVyhAn4MeXpKcEfIwkw49zgUXRGnBv1xO"
    }
});

// used for not confirm voted for suggestion users b/c only voted for one
var user5 = db.user.save({
    "_key": "5",
    "user": "test5@data.com",
    "userData" :
    {
        "username": "five",
        "profile_pic": "any",
        "age": 22,
        "gender": "female",
        "location_proximity_setting": true
    },
    authData: { //password: test5
        active: true,
        keyLength: 66,
        workUnits: 60,
        hashMethod: "pbkdf2",
        hash: "DVxGuXqgoSM14jSzpX9e5IAq6UlHZ34apV5vq5zhC6HRYmyVg9K7UwV8VjqVYUO3r5egNg6YNWuev0vjd80QJpxX",
        salt: "OI4JbEsim4qZmkebOicjG1gkHGVv7TxvvjAXk5ts9AqH1irKL9XkylLVbgVPIAgJ4v"
    }
});

// used for not confirm voted for suggestion users b/c only voted for other sugs
var user6 = db.user.save({
    "_key": "6",
    "user": "test6@data.com",
    "userData" :
    {
        "username": "six",
        "profile_pic": "any",
        "age": 22,
        "gender": "female",
        "location_proximity_setting": true
    }
});

// Location test data
var loc1 = db.location.save({"latitude": 100,"longitude": 100});
var loc2 = db.location.save({"latitude": 50,"longitude": 100});
var loc3 = db.location.save({"latitude": 100,"longitude": 50});
var loc4 = db.location.save({"latitude": 150,"longitude": 150});

// Interest test data
var int1 = db.interest.save({name:"Soccer"});
var int2 = db.interest.save({name:"Hockey"});
var int3 = db.interest.save({name:"Basketball"});
var int4 = db.interest.save({name:"Curling"});

// Date test data
// Dec 1, 2014 10am
var time1 = db.time_stamp.save({"value":1417453200000});
// Dec 1, 2014 12am
var time2 = db.time_stamp.save({"value":1417460400000});
// Dec 1, 2014 11 am
var time3 = db.time_stamp.save({"value":1417456800000});
// Dec 1, 2014 1 pm
var time4 = db.time_stamp.save({"value":1417464000000});
//1/1/2100 1200
var time5 = db.time_stamp.save({"value":4102513200000});
//1/1/2100 1300
var time6 = db.time_stamp.save({"value":4102516800000});
// Jan 11, 3012 8 pm
var time7 = db.time_stamp.save({"value":32883177600000});
// Jan 11, 3012 9 pm
var time8 = db.time_stamp.save({"value":32883181200000});

// Time period
var tp1 = db.time_period.save({});
var tp2 = db.time_period.save({});
var tp3 = db.time_period.save({});
var tp4 = db.time_period.save({});

// start test data
db.start.save(tp1,time1,{});
db.end.save(tp1,time2,{});
db.start.save(tp2,time3,{});
db.end.save(tp2,time4,{});
db.start.save(tp3, time5,{});
db.end.save(tp3, time6,{});
db.start.save(tp4, time7,{});
db.end.save(tp4, time8,{});

// In Location test data
db.in_location.save(user1, loc1,{});
db.in_location.save(user2, loc1,{});

// is_available test data
db.is_available.save(user1, tp1, {});
db.is_available.save(user2, tp2, {});

// is interested
db.interested_in.save(user1,int1,{});
db.interested_in.save(user1,int2,{});
db.interested_in.save(user2,int2,{});
db.interested_in.save(user2,int3,{});
db.interested_in.save(defaultUser,int1,{});
db.interested_in.save(defaultUser,int2,{});
db.interested_in.save(defaultUser,int3,{});

// Activity
var act1 = db.activity.save({
    _key:'1',
    Name:'A1',
    description:'activity 1',
    max_attendees:5,
    allow_joiner_input: true
});

var act2 = db.activity.save({
    _key:'2',
    Name:'A2',
    description:'activity 2',
    max_attendees:3,
    allow_joiner_input: false,
    is_cancelled: false
});

var act3 = db.activity.save({
    _key:'3',
    Name:'A3',
    description:'activity 3',
    max_attendees:3,
    allow_joiner_input: false,
    is_cancelled: false
});

var act4 = db.activity.save({
    _key:'4',
    Name:'A4',
    description:'activity 4',
    max_attendees:5,
    allow_joiner_input: false,
    is_cancelled: false
});

var act5 = db.activity.save({
    _key:'5',
    Name:'A5',
    description:'activity 5',
    max_attendees:5,
    allow_joiner_input: false,
    is_cancelled: false
});

var act6 = db.activity.save({
    _key:'6',
    Name:'A6',
    description:'activity 6',
    max_attendees:6,
    allow_joiner_input: false,
    is_cancelled: false
});

// Used for FirmUp testing
var act7 = db.activity.save({
    _key:'7',
    Name:'A7',
    description:'activity 7',
    max_attendees:10,
    allow_joiner_input: false,
    is_cancelled: false

// A confirmed event with suggestions, joiner, and confirmed attendees
var act8 = db.activity.save({
    _key:'8',
    Name:'A8',
    description:'activity 8',
    max_attendees:5,
});

// Used for unjoin testing
var act8 = db.activity.save({
    _key:'8',
    Name:'A8',
    description:'activity 8',
    max_attendees:6,
    allow_joiner_input: false,
    is_cancelled: false
});

var activity1 = db.activity.save({Name:'BasketballNW'});
var activity2 = db.activity.save({Name:'BasketballSW'});
var activity3 = db.activity.save({Name:'BasketballNE'});
var activity4 = db.activity.save({Name:'BasketballSE'});
var activity5 = db.activity.save({Name:'SoccerSE'});

// Time Suggestions
var sug1 = db.suggestion.save({_key:'1'});
 db.is.save(sug1, tp3, {});
 db.suggested.save(act1, sug1, {});
var timeSug1 = db.suggestion.save({_key:'4'});
 db.suggested.save(act1, timeSug1, {});
 db.is.save(timeSug1, tp3, {});
var timeSug2 = db.suggestion.save({_key:'5'});
 db.suggested.save(act1, timeSug2, {});
 db.is.save(timeSug2, tp4, {});
var timeSug3 = db.suggestion.save({_key:'6'});
 db.suggested.save(act2, timeSug3, {});
 db.is.save(timeSug3, tp3, {});
var timeSug4 = db.suggestion.save({_key:'10'});
 db.suggested.save(act7, timeSug4, {});
 db.is.save(timeSug4, tp3, {});
var timeSug5 = db.suggestion.save({_key:'13'});
db.suggested.save(act7, timeSug5, {});
db.is.save(timeSug5, tp4, {});
var timeSug6 = db.suggestion.save({_key:'14'});
db.suggested.save(act8, timeSug6, {});
db.is.save(timeSug6, tp3, {});
var timeSug7 = db.suggestion.save({_key:'15'});
db.suggested.save(act8, timeSug7, {});
db.is.save(timeSug7, tp4, {});

// Location Suggestions
var sug2 = db.suggestion.save({_key:'2'});
 db.is.save(sug2, loc4, {});
 db.suggested.save(act1, sug2, {});
var locSug4 = db.suggestion.save({_key:'7'});
 db.suggested.save(act1, locSug4, {});
 db.is.save(locSug4, loc3, {});
 var locSug5 = db.suggestion.save({_key:'8'});
 db.suggested.save(act2, locSug5, {});
 db.is.save(locSug5, loc2, {});
 var locSug6 = db.suggestion.save({_key:'9'});
 db.suggested.save(act2, locSug6, {});
 db.is.save(locSug6, loc4, {});
var locSug7 = db.suggestion.save({_key:'11'});
 db.suggested.save(act7, locSug7, {});
 db.is.save(locSug7, loc2, {});
var locSug8 = db.suggestion.save({_key:'12'});
 db.suggested.save(act7, locSug8, {});
 db.is.save(locSug8, loc4, {});
var locSug9 = db.suggestion.save({_key:'16'});
db.suggested.save(act8, locSug9, {});
db.is.save(locSug9, loc2, {});
var locSug10 = db.suggestion.save({_key:'17'});
db.suggested.save(act8, locSug10, {});
db.is.save(locSug8, loc4, {});

// confirmed times and locations
db.confirmed.save(act8, loc4, {});
db.confirmed.save(act8, tp4, {});

// Creators
db.created.save(defaultUser, activity1, {});
db.joined.save(defaultUser, activity1, {});
db.created.save(defaultUser, activity2, {});
db.joined.save(defaultUser, activity2, {});
db.created.save(defaultUser, activity3, {});
db.joined.save(defaultUser, activity3, {});
db.created.save(defaultUser, activity4, {});
db.joined.save(defaultUser, activity4, {});
db.created.save(defaultUser, activity5, {});
db.joined.save(defaultUser, activity5, {});
db.created.save(user1, act1, {});
db.joined.save(user1, act1, {});
db.created.save(user2, act2, {});
db.joined.save(user2, act2, {});
db.created.save(user3, act3, {});
db.joined.save(user3, act3, {});
db.created.save(defaultUser, act4, {});
db.joined.save(defaultUser, act4, {});
db.created.save(defaultUser, act5, {});
db.joined.save(defaultUser, act5, {});
db.created.save(defaultUser, act6, {});
db.joined.save(defaultUser, act6, {});
db.created.save(defaultUser, act7, {});
db.joined.save(defaultUser, act7, {});
db.created.save(defaultUser, act8, {});
db.joined.save(defaultUser, act8, {});

// Joiners
db.joined.save(user2, act1, {});
db.joined.save(user2, act3, {});
db.joined.save(user1, act2, {});
db.joined.save(user3, act2, {});
db.joined.save(defaultUser, act3, {});
db.joined.save(defaultUser, act8, {});
db.joined.save(user4, act7, {});
db.joined.save(user5, act7, {});
db.joined.save(user6, act7, {});
db.joined.save(user4, act8, {});
db.joined.save(user5, act8, {});
db.joined.save(user6, act8, {});

// Confirmed Attendees
db.confirmed.save(user6, act8, {});
db.confirmed.save(defaultUser, act8, {});

// Tagged
db.tagged.save(act1, int1, {});
db.tagged.save(act2, int2, {});
db.tagged.save(act2, int3, {});
db.tagged.save(act3, int1, {});
db.tagged.save(act5, int4, {});
db.tagged.save(activity1,int3,{});
db.tagged.save(activity2,int3,{});
db.tagged.save(activity3,int3,{});
db.tagged.save(activity4,int3,{});
db.tagged.save(activity5,int1,{});

db.suggested.save(act1, sug1, {});
db.suggested.save(act1, sug2, {});

var sug3 = db.suggestion.save({_key:'3'});
db.is.save(sug3, tp1, {});

var sug4 = db.suggestion.save({_key:'13'});
db.is.save(sug4, tp4, {});
db.suggested.save(act6, sug4, {});

// One activity in past, one activity in future
db.suggested.save(act3, sug1, {});
db.suggested.save(act4, sug3, {});
db.suggested.save(act5, sug1, {});
db.suggested.save(activity1, sug1, {});
db.suggested.save(activity1, sug3, {});
db.suggested.save(activity2, sug3, {});

// used for confirm voted for suggestion users.
db.voted.save(user4, timeSug4, {});
db.voted.save(user4, locSug8, {});
db.voted.save(user5, timeSug4, {});
db.voted.save(user6, locSug7, {});
db.voted.save(user6, timeSug5, {});

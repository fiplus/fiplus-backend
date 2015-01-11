// User test data
var user1 = db.user.save({
    "_key": "1",
    "email": "test@data.com",
    "profile_pic": "any",
    "age": 20,
    "gender": "male",
    "location_proximity_setting": true
});

var user2 = db.user.save({
    "_key": "2",
    "email": "test2@data.com",
    "profile_pic": "any",
    "age": 20,
    "gender": "female",
    "location_proximity_setting": true
});

// A newly registered user used in user profile tests
var user3 = db.user.save({
    _key: "3",
    email: "test3@data.com"
});

// Location test data
var loc1 = db.location.save({"latitude": 100,"longitude": 100});
var loc2 = db.location.save({"latitude": 50,"longitude": 100});
var loc3 = db.location.save({"latitude": 100,"longitude": 50});
var loc4 = db.location.save({"latitude": 150,"longitude": 150});

// Interest test data
var int1 = db.interest.save({name:"soccer"});
var int2 = db.interest.save({name:"hockey"});
var int3 = db.interest.save({name:"basketball"});

// Date test data
// Dec 1, 2014 10am
var time1 = db.time_stamp.save({"value":1417453200000});

// Dec 1, 2014 12am
var time2 = db.time_stamp.save({"value":1417460400000});

// 11 am
var time3 = db.time_stamp.save({"value":1417456800000});
// 1 pm
var time4 = db.time_stamp.save({"value":1417464000000});

//1/1/2100 1200
var time5 = db.time_stamp.save({"value":4102513200000});
//1/1/2100 1300
var time6 = db.time_stamp.save({"value":4102516800000});

// Time period
var tp1 = db.time_period.save({});
var tp2 = db.time_period.save({});
var tp3 = db.time_period.save({});

// start test data
db.start.save(tp1,time1,{});
db.end.save(tp1,time2,{});
db.start.save(tp2,time3,{});
db.end.save(tp2,time4,{});

db.start.save(tp3,time5,{});
db.end.save(tp3,time6,{});

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

// Activity
var act1 = db.activity.save({
    _key:'1',
    name:'A1',
    description:'activity 1',
    maximum_attendance:5
});

var act2 = db.activity.save({
    _key:'2',
    name:'A2',
    description:'activity 2',
    maximum_attendance:0
});
var activity1 = db.activity.save({name:'BasketballNW'});
var activity2 = db.activity.save({name:'BasketballSW'});
var activity3 = db.activity.save({name:'BasketballNE'});
var activity4 = db.activity.save({name:'BasketballSE'});
var activity5 = db.activity.save({name:'SoccerSE'});

//tagged
db.tagged.save(activity1,int3,{});
db.tagged.save(activity2,int3,{});
db.tagged.save(activity3,int3,{});
db.tagged.save(activity4,int3,{});
db.tagged.save(activity5,int1,{});

//Suggestions
var sug1 = db.suggestion.save({_key:'1'});
db.is.save(sug1, tp3, {});
db.suggested.save(act1, sug1, {});

var sug2 = db.suggestion.save({_key:'2'});
db.is.save(sug2, loc4, {});
db.suggested.save(act1, sug2, {});
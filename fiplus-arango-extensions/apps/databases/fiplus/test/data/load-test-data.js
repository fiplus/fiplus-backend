// User test data
var user1 = db.users.save({
    "_key": "1",
    "email": "test@data.com",
    "profile_pic": "any",
    "age": 20,
    "gender": "male",
    "location_proximity_setting": true
});

var user2 = db.users.save({
    "_key": "2",
    "email": "test2@data.com",
    "profile_pic": "any",
    "age": 20,
    "gender": "female",
    "location_proximity_setting": true
});

// A newly registered user used in user profile tests
var user3 = db.users.save({
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

// Time period
var tp1 = db.time_period.save({});
var tp2 = db.time_period.save({});

// start test data
db.starts.save(tp1,time1,{});
db.ends.save(tp1,time2,{});
db.starts.save(tp2,time3,{});
db.ends.save(tp2,time4,{});

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
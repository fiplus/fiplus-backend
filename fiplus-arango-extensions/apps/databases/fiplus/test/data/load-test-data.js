// User test data
var user1 = db.users.save({
    "email": "test@data.com",
    "profile_pic": "any",
    "age": 20,
    "gender": "male",
    "location_proximity_setting": true
});

var user2 = db.users.save({
    "email": "test2@data.com",
    "profile_pic": "any",
    "age": 20,
    "gender": "female",
    "location_proximity_setting": true
});

// Location test data
var loc1 = db.location.save({"latitude": 100,"longitude": 100});
var loc2 = db.location.save({"latitude": 50,"longitude": 100});
var loc3 = db.location.save({"latitude": 100,"longitude": 50});
var loc4 = db.location.save({"latitude": 150,"longitude": 150});

// Interest test data
var int1 = db.interest.save({"interest name":"soccer"});
var int2 = db.interest.save({"interest name":"hockey"});
var int3 = db.interest.save({"interest name":"basketball"});

// Date test data
var year = db.year.save({"value":2014});
var month = db.month.save({"value":12});
var day = db.day.save({"value":12});
var time = db.time.save({"value":11});
db.in_year.save(month,year,{});
db.in_month.save(day,month,{});
db.in_day.save(time,day,{});
var time1 = time;

var time2 = db.time.save({"value":1});
db.in_year.save(month,year,{});
db.in_month.save(day,month,{});
db.in_day.save(time2,day,{});

var time3 = db.time.save({"value":10});
db.in_year.save(month,year,{});
db.in_month.save(day,month,{});
db.in_day.save(time3,day,{});

var time4 = db.time.save({"value":12});
db.in_year.save(month,year,{});
db.in_month.save(day,month,{});
db.in_day.save(time4,day,{});

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
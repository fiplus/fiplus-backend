var frisby = require('C:/Users/Ralph/AppData/Roaming/npm/node_modules/frisby/lib/frisby');
//Figure out how to just use frisby and not the absolute path.

frisby.create("Register user basic test")
    .post('http://localhost:8529/_db/fiplus/dev/extensions/user/register',
    {
        email: "test@frisby.com"
    }, {json: true})
    .expectBodyContains('Success')
    .toss();

frisby.create("User configure profile basic test")
    .put('http://localhost:8529/_db/fiplus/dev/extensions/user/profile',
    {
        "email": "test@frisby.com",
        "profile_pic": "any",
        "age": 21,
        "gender": "male",
        "lat": 101,
        "long": 201,
        "location_proximity_setting": true,
        "start_year_availability": 2015,
        "start_month_availability": 1,
        "start_day_availability": 1,
        "start_hour_availability": 9,
        "end_year_availability": 2015,
        "end_month_availability": 1,
        "end_day_availability": 1,
        "end_hour_availability": 10,
        "tagged_interests": [
            {"interest name": "soccer"},
            {"interest name": "hockey"},
            {"interest name": "basketball"}
        ]
    }, {json: true})
    .expectBodyContains('Success')
    .toss();
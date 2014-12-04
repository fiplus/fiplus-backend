var frisby = require('frisby');

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
            "latitude": 101,
            "longitude": 201,
            "location_proximity_setting": true,
            "start_time_stamp": 1983,
            "end_time_stamp": 3898,
            "tagged_interests": [
                {"interest name": "soccer"},
                {"interest name": "hockey"},
                {"interest name": "basketball"}
            ]
    }, {json: true})
    .expectBodyContains('Success')
    .toss();
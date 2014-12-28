var frisby = require('frisby');

frisby.create("Register user basic test")
    .post('http://localhost:8529/_db/fiplus/dev/extensions/userfi/register',
    {
        email: "test@frisby.com"
    }, {json: true})
    .expectBodyContains('Success')
    .toss();

frisby.create("Confirm newly registered user is saved")
    .put('http://localhost:8529/_db/fiplus/_api/simple/by-example', {
        "collection":"users",
        "example":{"email":"test@frisby.com"}
    }, {json:true})
    .expectJSON('result.?', {
        email:'test@frisby.com'
    })
    .toss();

frisby.create("User configure profile basic test")
    .put('http://localhost:8529/_db/fiplus/dev/extensions/userfi/profile',
    {
        "email": "test3@data.com",
        "profile_pic": "any",
        "age": 21,
        "gender": "male",
        "latitude": 101,
        "longitude": 201,
        "location_proximity_setting": true,
        "availabilities": [
            {
                // 1/1/2015 1 - 5am
                start: 1420099200000,
                end: 1420113600000
            },
            {
                // 2/1/2015 1 - 5pm
                start: 1420228800000,
                end: 1420243200000
            }
        ],
        "tagged_interests": [
            'soccer',
            'hockey',
            'basketball'
        ]
    }, {json: true})
    .expectBodyContains('Success')
    .toss();

frisby.create("Check for documents/edges created in basic user profile test")
    .post('http://localhost:8529/_db/fiplus/_api/traversal',
    {
        startVertex: 'users/3',
        graphName: 'fiplus',
        direction: 'any',
        maxDepth: 2
    }, {json: true})
    .expectJSON('result.visited.vertices.?',
    {
        latitude: 101,
        longitude: 201
    })
    .expectJSON('result.visited.vertices.?',
    {
        name: 'soccer'
    })
    .expectJSON('result.visited.vertices.?',
    {
        name: 'hockey'
    })
    .expectJSON('result.visited.vertices.?',
    {
        name: 'basketball'
    })
    .expectJSON('result.visited.vertices.?',
    {
        value: 1420099200000
    })
    .expectJSON('result.visited.vertices.?',
    {
        value: 1420113600000
    })
    .expectJSON('result.visited.vertices.?',
    {
        value: 1420228800000
    })
    .expectJSON('result.visited.vertices.?',
    {
        value: 1420243200000
    })
    .toss();

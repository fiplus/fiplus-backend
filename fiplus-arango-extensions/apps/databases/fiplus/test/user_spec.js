var frisby = require('frisby');

frisby.create(this.description)
    .post('http://localhost:8529/_db/fiplus/dev/extensions/userfi/login',
    {
        "email": "1234@data.com",
        "password": "1234"
    }, {json: true})
    .inspectJSON()
    .afterJSON(function(res) {
        frisby.globalSetup({
            request:{
                session: res.session,
                headers: {
                    connection: res.headers.connection,
                    Cookie: res.headers.Cookie
                }
            }
        });
    })
    .toss();

/*
describe("Configure User Profile", function () {
    it("should add information to the user's profile", function () {
        frisby.create(this.description)
            .put('http://localhost:8529/_db/fiplus/dev/extensions/userfi/profile',
            {
                "email": "test3@data.com",
                username: 'test3',
                "profile_pic": "any",
                "age": 21,
                "gender": "male",
                "latitude": 101,
                "longitude": 201,
                "location_proximity_setting": true,
                "availabilities": [
                    {
                        // 1/1/2015 1 - 5am
                        start: 4102513200000,
                        end: 4102516800000
                    },
                    {
                        // 2/1/2015 1 - 5pm
                        start: 4105191600000,
                        end: 4105195200000
                    }
                ],
                "tagged_interests": [
                    'soccer',
                    'hockey',
                    'basketball'
                ]
            }, {json: true})
            .expectStatus(200)
            .toss();

        frisby.create(this.description + " dB check.")
            .post('http://localhost:8529/_db/fiplus/_api/traversal',
            {
                startVertex: 'user/3',
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
                value: 4102513200000
            })
            .expectJSON('result.visited.vertices.?',
            {
                value: 4102516800000
            })
            .expectJSON('result.visited.vertices.?',
            {
                value: 4105191600000
            })
            .expectJSON('result.visited.vertices.?',
            {
                value: 4105195200000
            })
            .toss();
    });
});

describe('Get User Profile', function() {
    it('should return user profile information with given email address.', function() {
        frisby.create(this.description)
            .get('http://localhost:8529/_db/fiplus/dev/extensions/userfi/profile/test3@data.com',{})
            .expectStatus(200)
            .expectJSON(
            {
                "attributes": {},
                "isValid": true,
                "errors": {},
                "email": "test3@data.com",
                username: 'test3',
                "profile_pic": "any",
                "age": 21,
                "gender": "male",
                "latitude": 101,
                "longitude": 201,
                "location_proximity_setting": true,
                "availabilities" : [
                    {
                        "attributes": {},
                        "isValid": true,
                        "errors": {},
                        "start": 4102513200000,
                        "end": 4102516800000
                    },
                    {
                        "attributes": {},
                        "isValid": true,
                        "errors": {},
                        "start": 4105191600000,
                        "end": 4105195200000
                    }
                ],
                "tagged_interests": [
                    'soccer',
                    'basketball',
                    'hockey'
                ]
            })
            .toss();
    });
});
*/
describe('Who Am I', function() {
    it('should return the current user.', function() {
        frisby.create(this.description)
            .get('http://localhost:8529/_db/fiplus/dev/extensions/userfi/whoami',{})
            .expectStatus(200)
            .expectJSON(
            {
                "user": {
                    "location_proximity_setting": true,
                    "age": 20,
                    "profile_pic": "101",
                    "gender": "female"
                },
                "username": "1234@data.com"
            })
            .toss();
    });
});


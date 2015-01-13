var frisby = require('frisby');

describe("Register User", function () {
    it("should register a new user", function () {
        frisby.create(this.description)
            .post('http://localhost:8529/_db/fiplus/dev/extensions/userfi/register',
            {
                "user": "AUSER",
                "email": "auser@auser.auser",
                "password": "Au$3r"
            }, {json: true})
            .expectStatus(200)
            .toss();

        frisby.create(this.description + " dB check.")
            .put('http://localhost:8529/_db/fiplus/_api/simple/by-example', {
                "collection": "user",
                "example": {"email": "auser@auser.auser"}
            }, {json: true})
            .expectJSON('result.?', {
                email: 'auser@auser.auser'
            })
            .toss();
    });

    it("should not register existing user", function () {
        frisby.create(this.description)
            .post('http://localhost:8529/_db/fiplus/dev/extensions/userfi/register',
            {
                "user": "AnotherUSER",
                email: "auser@auser.auser",
                "password": "pAssw0rd"
            }, {json: true})
            .expectStatus(400)
            .toss();
    });
});

describe("configure User Profile", function () {
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
            .get('http://localhost:8529/_db/fiplus/dev/extensions/userfi/profile/test3@data.com',
            {})
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
                "availabilities": [
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
                    'hockey',
                    'basketball'
                ]
            })
            .toss();
    });
});
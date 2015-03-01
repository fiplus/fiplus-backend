var frisby = require('frisby');

// Test setup - Login as default user
frisby.create(this.description)
    .post('https://localhost:3001/api/Users/login',
    {
        "email": "1234@data.com",
        "password": "1234"
    }, {json: true})
    .addHeader('Cookie', 'sid=asdf;sid.sig=asdf')
    .after(function (err, res, body) {
        var sid = res.headers['set-cookie'][0];
        var sidSig = res.headers['set-cookie'][1];

        frisby.globalSetup({
            request: {
                headers: {
                    cookie: sid.split(';')[0] + ';' + sidSig.split(';')[0]
                }
            }
        });
    })
    .toss();

describe("Configure User Profile", function () {
    it("should add information to the user's profile", function () {
        frisby.create(this.description)
            .put('https://localhost:3001/api/Users/profile',
            {
                "email": "1234@data.com",
                username: '1234',
                "profile_pic": "any",
                "age": 21,
                "gender": "male",
                "location": {
                    "latitude": 101,
                    "longitude": 201
                },
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
                    // Adding as lowercase to test correctly storing them in the db
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
                startVertex: 'user/101',
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
                name: 'Soccer'
            })
            .expectJSON('result.visited.vertices.?',
            {
                name: 'Hockey'
            })
            .expectJSON('result.visited.vertices.?',
            {
                name: 'Basketball'
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

describe('Get User Profile', function () {
    it('should return this user\'s profile.', function () {
        frisby.create(this.description)
            .get('https://localhost:3001/api/Users/profile/101', {})
            .expectStatus(200)
            .expectJSON(
            {
                "email": "1234@data.com",
                "username": '1234',
                "profile_pic": "any",
                "age": 21,
                "gender": "male",
                "location": {
                    "latitude": 101,
                    "longitude": 201
                },
                "location_proximity_setting": true,
                "availabilities": [
                    {
                        "start": 4102513200000,
                        "end": 4102516800000
                    },
                    {
                        "start": 4105191600000,
                        "end": 4105195200000
                    }
                ],
                "tagged_interests": [
                    'Soccer',
                    'Basketball',
                    'Hockey'
                ]
            })
            .toss();
    });
    it('should return another user\'s profile.', function () {
        frisby.create(this.description)
            .get('https://localhost:3001/api/Users/profile/2', {})
            .expectStatus(200)
            .expectJSON(
            {
                "profile_pic": "any",
                "tagged_interests": [
                    "Hockey",
                    "Basketball"
                ]
            })
            .toss();
    });
});

describe('Set User device ids', function() {
    it('add device id', function() {
        frisby.create(this.description)
            .post('https://localhost:3001/api/Users/device', {
                current_device_id: '',
                new_device_id: '3'
            }, {json:true})
            .expectStatus(200)
            .toss();

        frisby.create('checking if added correctly')
            .get('http://localhost:8529/_db/fiplus/_api/document/user/101', {})
            .expectStatus(200)
            .expectJSON('userData',
            {
                device_ids: ['1','2','3']
            })
            .toss();
    });

    it('update device id', function() {
        frisby.create(this.description)
            .post('https://localhost:3001/api/Users/device', {
                current_device_id: '3',
                new_device_id: '4'
            }, {json:true})
            .expectStatus(200)
            .toss();

        frisby.create('checking if added correctly')
            .get('http://localhost:8529/_db/fiplus/_api/document/user/101', {})
            .expectStatus(200)
            .expectJSON('userData',
            {
                device_ids: ['1','2','4']
            })
            .toss();
    });
});

describe('Who Am I', function () {
    it('should return the current user.', function () {
        frisby.create(this.description)
            .get('https://localhost:3001/api/Users/whoami', {})
            .expectStatus(200)
            .expectJSON(
            {
                "user_id": "101"
            })
            .toss();
    });
});

describe('Test user favourites', function() {
    it('add user to favourites', function() {
        frisby.create(this.description)
            .post('https://localhost:3001/api/Users/favourites/1', {json:true})
            .expectStatus(200)
            .toss();
    });

    it('add user to favourites', function() {
        frisby.create(this.description)
            .post('https://localhost:3001/api/Users/favourites/3', {json:true})
            .expectStatus(200)
            .toss();
    });

    it('get favourites of logged in user with limit', function() {
        frisby.create(this.description)
            .get('https://localhost:3001/api/Users/favourites?Limit=2', {})
            .expectStatus(200)
            .expectJSON(
            {
                "favourite_users": [
                    {
                        "user_id": "1",
                        "username": "one",
                        "profile_pic": "any",
                        "tagged_interests": [
                            "Soccer",
                            "Hockey"
                        ]
                    },
                    {
                        "user_id": "3",
                        "username": "three",
                        "profile_pic": "any",
                        "tagged_interests": []
                    }
                ]
            })
            .toss();
    });

    it('delete user from favourites', function() {
        frisby.create(this.description)
            .delete('https://localhost:3001/api/Users/favourites/3', {json:true})
            .expectStatus(200)
            .toss();
    });

    it('get favourites of logged in user without putting a limit. Also confirms that delete worked.', function() {
        frisby.create(this.description)
            .get('https://localhost:3001/api/Users/favourites?', {})
            .expectStatus(200)
            .expectJSON(
            {
                "favourite_users": [
                    {
                        "user_id": "1",
                        "username": "one",
                        "profile_pic": "any",
                        "tagged_interests": [
                            "Soccer",
                            "Hockey"
                        ]
                    }
                ]
            })
            .toss();
    });
});
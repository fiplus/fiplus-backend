var frisby = require('frisby');

// Test setup - clear cookies
frisby.globalSetup({
    request: {
        headers: {
            cookie: ""
        }
    }
});

describe("Register User", function () {
    it("should register a new user", function () {
        frisby.create(this.description)
            .post('http://localhost:3001/api/Users/register',
            {
                "email": "auser@auser.auser",
                "password": "Au$3r"
            }, {json: true})
            .expectStatus(200)
            .toss();

        frisby.create(this.description + " dB check.")
            .put('http://localhost:8529/_db/fiplus/_api/simple/by-example', {
                "collection": "user",
                "example": {"user": "auser@auser.auser"}
            }, {json: true})
            .expectJSON('result.?', {
                user: 'auser@auser.auser'
            })
            .toss();
    });

    it("should not register existing user", function () {
        frisby.create(this.description)
            .post('http://localhost:3001/api/Users/register',
            {
                email: "auser@auser.auser",
                "password": "pAssw0rd"
            }, {json: true})
            .expectStatus(400)
            .toss();
    });
});

describe("Login", function () {
    it("should allow the login of a registered user", function () {
        frisby.create(this.description)
            .post('http://localhost:3001/api/Users/register',
            {
                "email": "auser2@auser.auser",
                "password": "Au$3r2"
            }, {json: true})
            .toss();

        frisby.create(this.description)
            .post('http://localhost:3001/api/Users/login',
            {
                "email": "auser2@auser.auser",
                "password": "Au$3r2"
            }, {json: true})
            .expectStatus(200)
            .toss();
    });
    it("should disallow login of unregistered user", function () {
        frisby.create(this.description)
            .post('http://localhost:3001/api/Users/login',
            {
                "email": "bad",
                "password": "Au$3r2"
            }, {json: true})
            .expectStatus(401)
            .toss();
    });
    it("should disallow login with bad password", function () {
        frisby.create(this.description)
            .post('http://localhost:3001/api/Users/login',
            {
                "email": "auser2@auser.auser",
                "password": "bad"
            }, {json: true})
            .expectStatus(401)
            .toss();
    });
});

describe("Logout", function () {
    it("should logout user if logged in", function () {
        frisby.create(this.description)
            .post('http://localhost:3001/api/Users/logout', {})
            .expectStatus(200)
            .toss();
    });
});

describe("User Requests", function () {
    it("should fail if not authenticated: ", function () {
        frisby.create(this.description + "get whoami")
            .get('http://localhost:3001/api/Users/whoami',
            {}, {json: true})
            .expectStatus(401)
            .toss();

        frisby.create(this.description + "put profile")
            .put('http://localhost:3001/api/Users/profile',
            {}, {json: true})
            .expectStatus(401)
            .toss();

        frisby.create(this.description + "get profile")
            .get('http://localhost:3001/api/Users/profile/1234@data.com',
            {}, {json: true})
            .expectStatus(401)
            .toss();

        frisby.create(this.description)
            .post('http://localhost:3001/api/Users/device', {})
            .expectStatus(401)
            .toss();
    });
});

describe("Search Requests", function () {
    it("should fail if not authenticated: ", function () {
        frisby.create(this.description + "search activities")
            .get('http://localhost:3001/api/Matches/activities',
            {}, {json: true})
            .expectStatus(401)
            .toss();
    });
});

describe("Interest Requests", function () {
    it("should fail if not authenticated: ", function () {
        frisby.create(this.description + "get interest with input")
            .get('http://localhost:3001/api/Interests',
            {}, {json: true})
            .expectStatus(401)
            .toss();
    });
});

describe("Activity Requests", function () {
    it("should fail if not authenticated: ", function () {
        frisby.create(this.description + "create activity")
            .post('http://localhost:3001/api/Acts',
            {}, {json: true})
            .expectStatus(401)
            .toss();

        frisby.create(this.description + "get activity")
            .get('http://localhost:3001/api/Acts/1',
            {}, {json: true})
            .expectStatus(401)
            .toss();

        frisby.create(this.description + "get attendee")
            .get('http://localhost:3001/api/Acts/1/user',
            {}, {json: true})
            .expectStatus(401)
            .toss();

        frisby.create(this.description + "put suggest Time Period For Activity")
            .put('http://localhost:3001/api/Acts/1/time',
            {}, {json: true})
            .expectStatus(401)
            .toss();

        frisby.create(this.description + "put suggest Location For Activity")
            .put('http://localhost:3001/api/Acts/1/location',
            {}, {json: true})
            .expectStatus(401)
            .toss();

        frisby.create(this.description + "post voteForSuggestion")
            .post('http://localhost:3001/api/Acts/suggestion/1/user',
            {}, {json: true})
            .expectStatus(401)
            .toss();

        frisby.create(this.description + "post tag Activity With Interest")
            .put('http://localhost:3001/api/Acts/1/interest/soccer',
            {}, {json: true})
            .expectStatus(401)
            .toss();

        frisby.create(this.description + "post join")
            .put('http://localhost:3001/api/Acts/1/user',
            {}, {json: true})
            .expectStatus(401)
            .toss();
    });
});

var frisby = require('frisby');

// Test setup - Login as default user
frisby.create(this.description)
    .post('http://localhost:3001/api/Users/login',
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

describe("Get activities based on user interests", function () {
    it("should get activities related to the user interests", function () {
    frisby.create("Request activities based on user interest")
        .get('http://localhost:3001/api/Matches/activities?num_activities=100&by_interest=true')
        .expectJSON('?', {
            Name: 'BasketballNW'
        })
        .expectJSON('?', {
            Name: 'BasketballSE'
        })
        .expectJSON('?', {
            Name: 'BasketballNE'
        })
        .expectJSON('?', {
            Name: 'BasketballSW'
        })
        .toss();
    });
});

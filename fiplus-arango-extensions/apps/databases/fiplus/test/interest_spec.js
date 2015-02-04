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

describe('Get Interests', function() {
    it('gives input', function() {
        frisby.create("Get interests based on input")
            .get("http://localhost:3001/api/Interests?input=So")
            // For simplicity and to guard against new test data being added in the future, just test if 'soccer' appears
            .expectBodyContains('soccer')
            .toss();
    });

    it('no input; all interests', function() {
        frisby.create("Get all interests")
            .get('http://localhost:3001/api/Interests')
            .expectBodyContains('soccer')
            .expectBodyContains('hockey')
            .expectBodyContains('basketball')
            .toss();
    });
});

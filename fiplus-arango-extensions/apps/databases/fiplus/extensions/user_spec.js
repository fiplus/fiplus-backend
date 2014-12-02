var frisby = require('frisby');

frisby.create("Register user basic test")
    .post('http://localhost:8529/_db/fiplus/extensions/user/register',
    {
        email: "test@frisby.com"
    }, {json: true})
    .expectBodyContains('Success')
    .toss();
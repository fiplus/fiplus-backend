var frisby = require('frisby');

frisby.create('Tag an activity with existing interest')
    .put("http://localhost:8529/_db/fiplus/dev/extensions/activity/1/interest/soccer")
    .expectStatus(200)
    .toss();

frisby.create('Tag an activity with a non-existing interest')
    .put("http://localhost:8529/_db/fiplus/dev/extensions/activity/1/interest/newinterest")
    .expectStatus(200)
    .toss();

frisby.create('Tag an non-existing activity')
    .put("http://localhost:8529/_db/fiplus/dev/extensions/activity/0/interest/soccer")
    .expectStatus(404)
    .toss();

frisby.create('Check for if activity got properly tagged')
    .post("http://localhost:8529/_db/fiplus/_api/traversal",
    {
        startVertex:'activity/1',
        graphName:'fiplus',
        direction:'outbound',
        edgeCollection:'tagged'
    }, {json:true})
    .expectJSON('result.visited.vertices.?',
    {
        name:'soccer'
    })
    .expectJSON('result.visited.vertices.?',
    {
        name:'newinterest'
    })
    .toss();

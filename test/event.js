let mongoose = require("mongoose");
let Event = require('../models/event');

let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../app');
let should = chai.should();

chai.use(chaiHttp);

describe('Events', function() {
    it("this function must remove all data from events", function () {
        Event.remove(function (err, event) {
            return event;
        });
    });
});

describe('/GET events', function() {
    it('it should GET all the events', function(done) {
        chai.request(server)
            .get('/events')
            .end(function(err, res){
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('status');
                res.body.should.have.property('data');
                done();
            });
    });
});

describe('/POST event', function() {
    it('it should create a new event', function(done) {
        chai.request(server)
            .post('/events/create')
            .send({'year': 2017, 'month': 10, 'date': 4, "weeksIndex": 0, "dayIndex": 3, "title": "Test Event", "description": "Test Event Description" })
            .end(function(err, res){
                res.should.have.status(200);
                res.should.be.json;
                res.body.should.be.a('object');
                res.body.should.have.property('status');
                res.body.should.have.property('message');
                res.body.should.have.property('data');
                res.body.data.should.be.a('object');
                res.body.data.should.have.property('_id');
                res.body.data.should.have.property('year');
                res.body.data.should.have.property('month');
                res.body.data.should.have.property('date');
                res.body.data.should.have.property('weeksIndex');
                res.body.data.should.have.property('dayIndex');
                res.body.data.should.have.property('title');
                res.body.data.should.have.property('description');
                res.body.data.title.should.equal('Test Event');
                res.body.data.description.should.equal('Test Event Description');
                done();
            });
    });
});

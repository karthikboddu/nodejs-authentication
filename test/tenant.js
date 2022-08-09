const mongoose = require("mongoose"),
    db = require("../app/models"),
    tenant = db.tenant.tenantModel,
    chai = require('chai'),
    chaiHttp = require('chai-http'),
    server = require('../server'),
    should = chai.should();

    chai.use(chaiHttp);

  /*
  * Test the /POST route
  */
  describe('/POST login', () => {



    it('it should throw error', (done) => {

        chai.request(server)
            .post('/api/tenant/login')
            .send({
              username: "testtest11",
              password: "123456"
              })
            .end((err, res) => {
                  res.should.have.status(200);
                  res.body.should.be.a('object');
                  res.body.should.have.property('errors');
              done();
            });
      });

    it('it should get the token', (done) => {
        let data = {
            username: "muraliboddu",
            password: "123456"
        }
      chai.request(server)
          .post('/api/tenant/login')
          .send(data)
          .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.data.should.have.property('accessToken');
                res.body.data.should.have.property('refreshtoken');
            done();
          });
    });


    
});

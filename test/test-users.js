'use strict'

const chai = require('chai')
const chaiHttp = require('chai-http')
const faker = require('faker')
const mongoose = require('mongoose')

const {
  app,
  runServer,
  closeServer
} = require('../server')
const { TEST_DB_URL } = require('../config')
const { User } = require('../users/models')

const should = chai.should();
const expect = chai.expect
chai.use(chaiHttp)


function tearDownDb(){
  return new Promise((resolve, reject) => {
    console.warn('Deleting database')
    mongoose.connection.dropDatabase()
      .then(result => resolve(result))
      .catch(err => reject(err))
  })
}

function seedUsersData(){
  console.info('seeding user data')
  const seedData = []
  for (let i = 1; i<= 10; i++){
    seedData.push({
      id: faker.random.number(),
      username: faker.internet.userName(),
      password: faker.internet.password()
    })
    console.log(seedData)

  }
  return User.insertMany(seedData)
}

describe('Users resource', function () {

  before(function () {
    return runServer(TEST_DB_URL)
  })

  beforeEach(function(){
    return seedUsersData()
  })

  afterEach(function(){
    return tearDownDb()
  })

  after(function () {
    return closeServer()
  })


  describe('GET endpoint', function () {
    it('Should return all existing users', function () {
      let res
      return chai.request(app)
        .get('/users')
        .then(_res => {
          res = _res
          res.should.have.status(200)
          res.body.should.have.lengthOf.at.least(1)
          return User.count()
        })
        .then(count => {
          res.body.should.have.lengthOf(count)
        })
    })

    it('Should return users with correct field', function(){
      let resUser
      return chai.request(app)
        .get('/users')
        .then(function(res){
          res.should.have.status(200)
          res.should.be.json
          res.body.should.be.a('array')
          res.body.should.have.lengthOf.at.least(1)

          res.body.forEach(function(user){
            user.should.be.a('object')
            user.should.include.keys('id', 'username', 'password')
          })
          resUser = res.body[0]
          return User.findById(resUser.id)
        })
        .then(user => {
          resUser.id.should.equal(user.id)
          resUser.username.should.equal(user.username)
          resUser.password.should.equal(user.password)
        })
    })
  })
})
import dotenv from 'dotenv'
import express from 'express'
import bodyParser from 'body-parser'
import Queue from 'bull'
import Matador from 'bull-ui/app'
import Toureiro from 'toureiro'

dotenv.load()

const [,host,port,db] = process.env.REDIS_URL.match(/redis\:\/\/([\d\.]*)\:(\d*)\/(\d*)/)

const twilioQueue = new Queue('twilio', port, host, { db });

const matador = Matador({ redis: { port, host, options: { db } }})

const toureiro = Toureiro({ redis: { port, host, db }})

const server = express()

server.use(bodyParser.urlencoded({ extended: true }))
server.use(bodyParser.json())

server.post('/confirm', async (req, res) => {

  console.log('QUEUEING: %s', JSON.stringify(req.body))

  const result = await twilioQueue.add(req.body, { attempts: 3, backoff: 5000 })

  res.status(200).type('application/xml').send('<?xml version="1.0" encoding="UTF-8"?><Response></Response>')

})

server.use('/jobs', (req, res, next) => {
  req.basepath = '/jobs'
  res.locals.basepath = '/jobs'
  next()
}, matador)

server.use('/toureiro', toureiro)

server.listen(3000, () => {
  console.log('Listening on port 3000...')
})

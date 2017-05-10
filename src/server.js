import dotenv from 'dotenv'
import express from 'express'
import bodyParser from 'body-parser'
import Queue from 'bull'

dotenv.load()

const TwilioQueue = new Queue('twilio', process.env.REDIS_URL);

const server = express()

server.use(bodyParser.urlencoded({ extended: true }))
server.use(bodyParser.json())

server.post('/confirm', async (req, res) => {

  console.log(req.body)

  await TwilioQueue.add(req.body)

  res.status(200).send('OK')

})

server.listen(3000, () => {
  console.log('Listening on port 3000...')
})

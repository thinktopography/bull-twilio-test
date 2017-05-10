import dotenv from 'dotenv'
import Queue from 'bull'
import Twilio from 'twilio'

dotenv.load()

const twilio = Twilio(process.env.TWILIO_ID, process.env.TWILIO_TOKEN)

const [,host,port,db] = process.env.REDIS_URL.match(/redis\:\/\/([\d\.]*)\:(\d*)\/(\d*)/)
const twilioQueue = new Queue('twilio', port, host, { db });

twilioQueue.process(async (job, done) => {

  console.log('PROCESSING: %s', JSON.stringify(job.data))

  if(job.data.Body === 'boom') {
    return done(Error('foo'))
  }

  await twilio.messages.create({
    from: process.env.TWILIO_PHONE,
    to: job.data.From,
    body: `You texted: '${job.data.Body}'`
  })

  done()

})

twilioQueue.on('failed', async (job, err) => {

  if(job.attemptsMade < job.opts.attempts) return console.log('failed')

  await twilio.messages.create({
    from: process.env.TWILIO_PHONE,
    to: job.data.From,
    body: 'I couldnt send your text. I give up...'
  })

})

twilioQueue.on('completed', (job, result) => {
  console.log('completed')
})

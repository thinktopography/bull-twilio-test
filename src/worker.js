import dotenv from 'dotenv'
import Queue from 'bull'
import twilio from 'twilio'

dotenv.load()

const twilio = TW(process.env.TWILIO_ID, process.env.TWILIO_TOKEN)

const twilioQueue = new Queue('twilio', process.env.REDIS_URL);

twilioQueue.process((job, done) => {

  twilio.messages.create({
    from: process.env.TWILIO_NUMBER,
    to: job.data.From,
    body: `You texted: '${job.data.Body}'`
  }).then(done)


})

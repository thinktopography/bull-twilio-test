import dotenv from 'dotenv'
import Queue from 'bull'
import Twilio from 'twilio'

dotenv.load()

const twilio = Twilio(process.env.TWILIO_ID, process.env.TWILIO_TOKEN)

const twilioQueue = new Queue('twilio', process.env.REDIS_URL);

twilioQueue.process(async (job, done) => {

  await twilio.messages.create({
    from: process.env.TWILIO_PHONE,
    to: job.data.From,
    body: `You texted: '${job.data.Body}'`
  })

  done()

})

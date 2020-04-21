const sgMail = require('@sendgrid/mail')


sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email, name) => {
    const msg = {
        from: 'm.u.akram1997@gmail.com',
        to: email,
        subject: 'Welcome to Task Manager by Usama',
        text: `We are glad to have you here ${name}. Please let us know how you get along with app!`
    }
    sendMail(msg)
}

const sendFeedbackRequestEmail = (email, name) => {
    const msg = {
        from: 'm.u.akram1997@gmail.com',
        to: email,
        subject: 'Sorry to see you go! Please Tell us a reason?',
        text: `Hello ${name}. Why are you leaving? Kindly do tell us and help us to improve your system.\n We appriciate your Feedback. And want to keep you.`
    }
    sendMail(msg)
}

const sendMail = async (msg) => {
    try {
        await sgMail.send(msg)
    }
    catch (error) {
        // console.log(error.response.body)
    }
}


module.exports = {
    sendWelcomeEmail,
    sendFeedbackRequestEmail
}
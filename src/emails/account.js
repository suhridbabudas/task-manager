const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeMail = (email, name) => {
  sgMail.send({
    to: email,
    from: "mylife.sb007@gmail.com",
    subject: "Welcome!",
    text: `Hi ${name},\n\nA warm welcome and lots of good wishes on becoming part of our growing
    team. Congratulations and on behalf of all the members. We are all
    happy and excited about your inputs and contribution to our company.`,
  });
};

const sendGoodbyeMail = (email, name) => {
  console.log(email, name);
  sgMail.send({
    to: email,
    from: "mylife.sb007@gmail.com",
    subject: "Good Bye!",
    text: `
      Hi ${name},\n\n
      
      First of all, we appreciate you being part of the [company name] community.\n
      
      As per your request, your subscription has been canceled. The good news is that your account will be active for the next 3 months and you can still access in the meantime.\n
      
      We’d like to learn the reason behind your cancellation so we can better serve our customers (and hopefully you!) in the future.\n\n
      
      Thanks`,
  });
};

module.exports = {
  sendWelcomeMail,
  sendGoodbyeMail,
};

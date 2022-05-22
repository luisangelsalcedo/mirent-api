import nodemailer from "nodemailer";
import { config } from "../config/index.js";

// create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: config.gmail.user, // generated ethereal user
    pass: config.gmail.apipassword, // generated ethereal password
  },
});

transporter.verify().then(() => {
  console.log("Nodemailer: Ready for send mails");
});

/**
 * ## sendMail
 * ```
 const msg = {
    from: '"Fred Foo 👻" <foo@example.com>', // sender address
    to: "bar@example.com, baz@example.com", // list of receivers
    subject: "Hello ✔", // Subject line
    text: "Hello world?", // plain text body
    html: "<b>Hello world?</b>", // html body
  }
sendMail(msg)
 * ```
 * @param {object} msg
 * @returns {Boolean} success (true)
 */
export const sendMail = (msg) => transporter.sendMail(msg);

import sgMail from "@sendgrid/mail";
import { config } from "../config/index.js";
/**
 * ## sendMail
 * ```
 const msg = {
    to: "test@example.com", // Change to your recipient
    from: "test@example.com", // Change to your verified sender
    subject: "Sending with SendGrid is Fun",
    text: "and easy to do anywhere, even with Node.js",
    html: "<strong>and easy to do anywhere, even with Node.js</strong>",
};
sendMail(msg)
 * ```
 * @param {object} msg
 * @returns {Boolean} success (true)
 */
export const sendMail = (msg) =>
  new Promise((resolve, reject) => {
    sgMail.setApiKey(config.sendgrid.apikey);
    sgMail
      .send(msg)
      .then(() => {
        resolve(true);
      })
      .catch((error) => {
        reject(error);
      });
  });

const VerificationEmail = (username, otp) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Email Verification</title>
      <style>
        .container {
          max-width: 600px;
          margin: 0 auto;
          font-family: Arial, sans-serif;
          padding: 20px;
          border: 1px solid #ddd; /* Inferred boundary for email body */
        }
        .header h1 {
          color: #4CAF50; /* from image: #4CAF50 */
        }
        .content {
          text-align: center;
        }
        .content p {
          font-size: 16px;
          line-height: 1.5;
        }
        .otp {
          font-size: 20px;
          font-weight: bold;
          color: #4CAF50; /* from image: #4CAF50 */
          margin: 20px 0;
          padding: 10px 20px; /* Inferred padding for better visibility */
          border: 1px dashed #4CAF50; /* Inferred dashed border */
          display: inline-block; /* Inferred to contain dashed border */
        }
        .footer {
          text-align: center;
          font-size: 14px;
          color: #777; /* from image: #777 */
          margin-top: 20px; /* from image: margin-top: 20px; */
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Hii ${username} !! Please Verify Your Email Address</h1>
        </div>
        <div class="content">
          <p>Thank you for registering with Ecommerce. Please use the OTP below to verify your email address:</p>
          <div class="otp">${otp}</div>
          <p>If you didn't create an account, you can safely ignore this email.</p>
        </div>
        <div class="footer">
          <p>&copy; 2024 Spicez Gold. All rights reserved.</p>
          <p style="font-size: 12px; color: #aaa;">You are receiving this email because you signed up on our website.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

export default VerificationEmail;
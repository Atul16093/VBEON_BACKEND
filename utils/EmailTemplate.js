export default class EmailTemplate {
    getEmailVerificationTemplate(data) {
        if (!data) {
            throw new Error("Data Not Found");
        }
        let template = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verification</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            text-align: center;
            padding: 20px;
        }
        .container {
            max-width: 450px;
            background: #ffffff;
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 5px 10px rgba(0, 0, 0, 0.2);
            margin: auto;
            border-top: 6px solid #4CAF50;
        }
        .otp-code {
            font-size: 30px;
            font-weight: bold;
            color: #4CAF50;
            margin: 20px 0;
            background: #E8F5E9;
            display: inline-block;
            padding: 12px 25px;
            border-radius: 8px;
            letter-spacing: 2px;
        }
        .footer {
            margin-top: 20px;
            font-size: 13px;
            color: #777;
        }
        h2 {
            color: #4CAF50;
        }
    </style>
</head>
<body>
    <div class="container">
        <h2>Email Verification</h2>
        <p>Dear <strong>${data.name}</strong>,</p>
        <p>Thank you for signing up with <strong>${data.appName}</strong>! Please use the verification code below to activate your account:</p>
        <p class="otp-code">${data.OTP}</p>
        <p>Please enter this code to complete your verification. Do not share it with anyone.</p>
        <p class="footer">If you did not sign up for this, please ignore this email.</p>
        <hr>
        <p class="footer">&copy; ${data.year} <strong>${data.appName}</strong>. All rights reserved.</p>
    </div>
</body>
</html>`;
        return template;
    }
}

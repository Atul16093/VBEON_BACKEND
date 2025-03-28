export default class Templete {
    getOtpTemplete(data) {
        if (!data) {
            throw new Error("Data Not Found ");
        }
        let template = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OTP Verification</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #e3f2fd;
            text-align: center;
            padding: 20px;
        }
        .container {
            max-width: 400px;
            background: #ffffff;
            padding: 25px;
            border-radius: 10px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
            margin: auto;
            border-top: 5px solid #1e88e5;
        }
        .otp-code {
            font-size: 28px;
            font-weight: bold;
            color: #1e88e5;
            margin: 20px 0;
            background: #bbdefb;
            display: inline-block;
            padding: 10px 20px;
            border-radius: 5px;
        }
        .footer {
            margin-top: 20px;
            font-size: 13px;
            color: #555;
        }
        h2 {
            color: #1e88e5;
        }
    </style>
</head>
<body>
    <div class="container">
    <h2>OTP Verification FOR PASSWORD RESET</h2>
    <p>Dear <strong>${data.name}</strong>,</p>
    <p>Your One-Time Password (OTP) for verification on <strong>${data.appName}</strong> for password updation is:</p>
    <p class="otp-code">${data.OTP}</p>
    <p>Please enter this OTP to complete your verification. Do not share it with anyone.</p>
    <p class="footer">If you did not request this, please ignore this email.</p>
    <hr>
    <p class="footer">&copy; ${data.year} <strong>${data.appName}</strong>. All rights reserved.</p>
</div>
</body>
</html>
`
        return template;
    }

}
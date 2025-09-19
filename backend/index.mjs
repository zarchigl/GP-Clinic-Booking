import { DynamoDBClient, PutItemCommand, GetItemCommand } from "@aws-sdk/client-dynamodb";
import nodemailer from "nodemailer";

// Env variables
const gmailUser = process.env.GMAIL_USER;
const gmailPassword = process.env.GMAIL_APP_PASSWORD;

// DynamoDB client
const dynamoDbClient = new DynamoDBClient({ region: "us-east-1" });

// Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: gmailUser, pass: gmailPassword },
});

// Format time helper: "09:00" → "9 AM"
function formatTimeSlot(timeString) {
  if (!timeString.includes(":")) return timeString;
  const [hourStr] = timeString.split(":");
  let hour = parseInt(hourStr, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;
  return `${hour} ${ampm}`;
}

// Lambda handler
export const handler = async (event) => {
  // Allow all origins temporarily for testing
  const headers = {
    "Access-Control-Allow-Origin": "https://main.d2tgac5p3lij3.amplifyapp.com", // change "*" to your frontend URL in production
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
    "Access-Control-Allow-Methods": "POST,OPTIONS",
  };

  // Handle preflight
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers, body: "" };
  }

  try {
    console.log("Booking event:", event);

    if (!event.body) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: "Missing request body" }),
      };
    }

    const data = JSON.parse(event.body);

    // Check required fields
    const requiredFields = [
      "fullName",
      "email",
      "contactNumber",
      "service",
      "appointmentDate",
      "dateOfBirth",
      "timeSlot",
      "emergencyName",
      "emergencyNumber",
    ];

    for (const field of requiredFields) {
      if (!data[field]) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ message: `Missing field: ${field}` }),
        };
      }
    }

    // Check if appointment exists
    const existing = await dynamoDbClient.send(
      new GetItemCommand({
        TableName: "TestDynamoDBTable",
        Key: { fullName: { S: data.fullName } },
      })
    );

    if (existing.Item) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: "An appointment with this name already exists" }),
      };
    }

    // Format time
    const formattedTime = formatTimeSlot(data.timeSlot);

    // Save to DynamoDB
    const params = {
      TableName: "TestDynamoDBTable",
      Item: {
        fullName: { S: data.fullName },
        email: { S: data.email },
        contactNumber: { S: data.contactNumber },
        service: { S: data.service },
        appointmentDate: { S: data.appointmentDate },
        dateOfBirth: { S: data.dateOfBirth },
        timeSlot: { S: formattedTime },
        emergencyName: { S: data.emergencyName },
        emergencyNumber: { S: data.emergencyNumber },
        additionalInfo: { S: data.additionalInfo || "" },
      },
    };
    await dynamoDbClient.send(new PutItemCommand(params));

    // Send confirmation email
    const mailOptions = {
      from: gmailUser,
      to: data.email,
      subject: "Appointment Confirmation",
      text: `Hello ${data.fullName},\n\nYour appointment for ${data.service} on ${data.appointmentDate} at ${formattedTime} has been booked successfully.`,
    };
    await transporter.sendMail(mailOptions);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: "Appointment booked successfully and email sent" }),
    };
  } catch (error) {
    console.error("Error booking appointment:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: "Internal server error", error: error.message }),
    };
  }
};

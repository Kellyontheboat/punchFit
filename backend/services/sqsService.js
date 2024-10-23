const { SQSClient, SendMessageCommand, ReceiveMessageCommand, DeleteMessageCommand } = require('@aws-sdk/client-sqs');
const dotenv = require('dotenv')
dotenv.config()

const sqsClient = new SQSClient({
  region: process.env.AWS_BUCKET_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});
const sendMessageToQueue = async (messageBody) => {
  const params = {
    QueueUrl: process.env.AWS_SQS_QUEUE_URL, 
    MessageBody: JSON.stringify(messageBody),
  };

  try {
    const data = await sqsClient.send(new SendMessageCommand(params));
    console.log("Message sent to SQS:", data.MessageId);
  } catch (err) {
    console.error("Error sending message to SQS:", err);
  }
};

const processMessage = async (message) => {
  const { videoName, memberId, scheduleName } = JSON.parse(message.Body);
  console.log("Processing message:", videoName, memberId, scheduleName);

  // After processing, delete the message from the queue
  const deleteParams = {
    QueueUrl: process.env.AWS_SQS_QUEUE_URL,
    ReceiptHandle: message.ReceiptHandle,
  };
  await sqsClient.send(new DeleteMessageCommand(deleteParams));
};

const pollQueue = async () => {
  const params = {
    QueueUrl: process.env.AWS_SQS_QUEUE_URL,
    MaxNumberOfMessages: 10,
    WaitTimeSeconds: 20,
  };

  try {
    const data = await sqsClient.send(new ReceiveMessageCommand(params));
    if (data.Messages) {
      for (const message of data.Messages) {
        await processMessage(message);
      }
    }
  } catch (err) {
    console.error("Error receiving messages from SQS:", err);
  }
};

// Continuously poll the queue
setInterval(pollQueue, 5000);

module.exports = { sendMessageToQueue };

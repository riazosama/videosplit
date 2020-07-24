var aws = require("aws-sdk");
var sqs = new aws.SQS();
var queueUrl = process.env.SQS_URL;

const getMessageFromSQS = async () => {
  const params = {
    QueueUrl: queueUrl,
    AttributeNames: [
      "All"
    ],
    MaxNumberOfMessages: 1
  };

  try {
    return await sqs.receiveMessage(params).promise()
  } catch (e) {
    console.log("error while fetching from queue", e)
  }
};

module.exports.onVideoUpload = async event => {

  const params = {
    MessageBody: JSON.stringify(event.Records[0].s3.object),
    QueueUrl: queueUrl,
    DelaySeconds: 0,
  };

  if (!event.Records[0].s3.object.key.includes("output")) {

    try {
      await sqs.sendMessage(params).promise();
      console.log("sucess");
    } catch (e) {
      console.log("fail", e);

    }
  }

  const bucket = event.Records[0].s3.bucket.name;
  const filename = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));
  const message = `File is uploaded in - ${bucket} -> ${filename}`;
  console.log(message);

}

module.exports.bootEc2Instance = async event => {
  console.log("Entered bootEc2Instance", event)
  const instance = new aws.EC2({ region: event.instanceRegion });
  try {

    const ec2State = await instance
      .describeInstanceStatus({ InstanceIds: [process.env.INSTANCE] }).promise()

    if (ec2State.InstanceStatuses.length === 0) {
      const sqsMessage = await getMessageFromSQS();
      const message = sqsMessage.Messages ? sqsMessage.Messages : []

      if (message.length === 0) {
        console.log("Nothing in Queue. No need to start instance")
        return
      }

      await instance.startInstances({ InstanceIds: [process.env.INSTANCE] }).promise();
      console.log("Instance Started");
    } else {
      console.log("Instance already running. Nothing to do right now.")
    }
  } catch (e) {
    console.log("error", e)
  }
}

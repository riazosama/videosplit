var aws = require("aws-sdk");
var sqs = new aws.SQS();
var queueUrl = process.env.SQS_URL;

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
  console.log("Insatance starting:", "dddd")
  // const ec2 = new AWS.EC2({ region: event.instanceRegion });
  // return ec2.startInstances({ InstanceIds: ["i-069c545e64b1ef74d"] }).promise()
  //   .then(() => `Successfully Started i-069c545e64b1ef74d`)
  //   .catch(err => console.log(err));
}
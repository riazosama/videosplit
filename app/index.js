module.exports.onVideoUpload = async event => {
var aws = require("aws-sdk");
var sqs = new aws.SQS();
var queueUrl = "https://sqs.us-east-2.amazonaws.com/506464813465/videosplit_sqs";
exports.handler = async (event, context, callback) => {
  
  
    const params = {
    MessageBody: JSON.stringify(event.Records[0].s3.object),
    QueueUrl: queueUrl,
    DelaySeconds: 0,
  };
  
  if (!event.Records[0].s3.object.key.includes("output")) {
     sqs.sendMessage(params, function (err, data) {
    if (err) {
      console.log("Error", err);
    } else {
      console.log("Success", data);
    }
  }); 
  }

  const bucket = event.Records[0].s3.bucket.name;
  const filename = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));
  const message = `File is uploaded in - ${bucket} -> ${filename}`;
  console.log(message);
   callback(null, message);
};

}
const AWS = require("aws-sdk");

exports.handler = (event) => {
  const codebuild = new AWS.CodeBuild();
  codebuild.startBuild({ projectName: process.env.PROJECT_ARN }, function (err, data) {
    if (err) console.log(err, err.stack);
    else     console.log(data);
  });
  return {
    statusCode: 200,
    body: JSON.stringify('Success'),
  };
};

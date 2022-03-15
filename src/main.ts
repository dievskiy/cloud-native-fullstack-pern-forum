import * as path from 'path';
import * as apprunner from '@aws-cdk/aws-apprunner';
import { CloudFrontWebDistribution } from '@aws-cdk/aws-cloudfront';
import * as codebuild from '@aws-cdk/aws-codebuild';
import { ComputeType, LinuxBuildImage } from '@aws-cdk/aws-codebuild';
import * as iam from '@aws-cdk/aws-iam';
import * as lambda from '@aws-cdk/aws-lambda';
import * as s3 from '@aws-cdk/aws-s3';
import * as s3Deployment from '@aws-cdk/aws-s3-deployment';
import * as cdk from '@aws-cdk/core';
import { App, CfnOutput, Stack, StackProps } from '@aws-cdk/core';
import * as cr from '@aws-cdk/custom-resources';
import '../config';

export class AppStack extends Stack {
  constructor(scope: cdk.App, id: string, props: StackProps = {}) {
    super(scope, id, props);

    const imagesBucketName = 'imagesbucketxxx'; // use some other bucket name here
    const buildBucketName = 'frontend-bucket-pern-build';
    const sourceBucketName = 'frontend-bucket-pern-source';
    const backendECRUrl = 'public.ecr.aws/s1w0n6m9/pern-fullstack:latest';

    const imagesBucket = new s3.Bucket(this, 'ImagesBucket', {
      bucketName: imagesBucketName,
      publicReadAccess: true,
      encryption: s3.BucketEncryption.UNENCRYPTED,
    });

    const service = new apprunner.Service(this, 'AppRunnerService', {
      source: apprunner.Source.fromEcrPublic({
        imageConfiguration: {
          port: 8000,
          environment: {
            DB_URI: `${process.env.DB_URI}`,
            APP_PORT: `${process.env.APP_PORT}`,
            JWT_SECRET: `${process.env.JWT_SECRET}`,
            AWS_BUCKET_NAME: imagesBucket.bucketName,
            AWS_BUCKET_REGION: this.region,
            AWS_ACCESS_KEY: `${process.env.AWS_ACCESS_KEY}`,
            AWS_SECRET_KEY: `${process.env.AWS_SECRET_KEY}`,
          },
        },
        imageIdentifier: backendECRUrl,
      }),
    });

    const sourceBucket = new s3.Bucket(this, 'PernFrontendBucketSource', {
      bucketName: sourceBucketName,
    });

    new s3Deployment.BucketDeployment(this, 'deployProjectForBuild', {
      sources: [s3Deployment.Source.asset(`${path.resolve(__dirname)}/../frontend`)],
      destinationBucket: sourceBucket,
      destinationKeyPrefix: 'frontend/',
    });

    const buildBucket = new s3.Bucket(this, 'FrontendBucket', {
      bucketName: buildBucketName,
      publicReadAccess: true,
      websiteIndexDocument: 'index.html',
      encryption: s3.BucketEncryption.UNENCRYPTED,
    });

    const frontendBuildProject = new codebuild.Project(this, 'CodeBuildProject', {
      buildSpec: codebuild.BuildSpec.fromObject({
        version: '0.2',
        phases: {
          install: {
            runtimeVersions: {
              nodejs: 12,
            },
            commands: ['echo "Installing dependencies"', 'npm install'],
          },
          build: {
            commands: ['echo "Building..."', 'npm run build'],
          },
          post_build: {
            commands: [
              // we use s3 cp and not artifact because of public read acls
              `aws s3 cp build/main.js s3://${buildBucketName}/main.js --acl public-read`,
              `aws s3 cp build/index.html s3://${buildBucketName}/index.html --acl public-read`,
            ],
          },
        },
        cache: {
          paths: ['/root/.npm/**/*', '/node_modules/'],
        },
      }),
      source: codebuild.Source.s3({
        bucket: s3.Bucket.fromBucketArn(this, 'sourcebucket', `arn:aws:s3:::${sourceBucketName}`),
        path: 'frontend/',
      }),
      environment: {
        buildImage: LinuxBuildImage.STANDARD_5_0,
        computeType: ComputeType.SMALL,
        environmentVariables: {
          BASE_URL: { value: `https://${service.serviceUrl}` },
        },
      },
    });

    frontendBuildProject.role?.attachInlinePolicy(
      new iam.Policy(this, 'frontend-bucket-policy', {
        statements: [
          new iam.PolicyStatement({
            // todo: we should follow least of privilege principle
            actions: ['*'],
            resources: ['*'],
          }),
        ],
      }),
    );

    const codeBuildPolicyStatement = new iam.PolicyStatement({
      actions: ['codebuild:StartBuild'],
      resources: ['*'],
    });

    // use lambda to start above created build project
    const startBuildLambda = new lambda.Function(this, 'StartBuildLambdaFunction', {
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(`${path.resolve(__dirname)}/../lambda/`),
      memorySize: 256,
      timeout: cdk.Duration.minutes(15),
      environment: {
        PROJECT_ARN: frontendBuildProject.projectName,
      },
    });

    startBuildLambda.role?.attachInlinePolicy(
      new iam.Policy(this, 'list-buckets-policy', {
        statements: [codeBuildPolicyStatement],
      }),
    );

    // this is needed to execute lambda automatically when build project is created
    const lambdaTrigger = new cr.AwsCustomResource(this, 'StateFunctionTrigger', {
      policy: cr.AwsCustomResourcePolicy.fromStatements([
        new iam.PolicyStatement({
          actions: ['lambda:InvokeFunction'],
          effect: iam.Effect.ALLOW,
          resources: [startBuildLambda.functionArn],
        }),
      ]),
      timeout: cdk.Duration.minutes(15),
      onCreate: {
        service: 'Lambda',
        action: 'invoke',
        parameters: {
          FunctionName: startBuildLambda.functionName,
          InvocationType: 'Event',
        },
        physicalResourceId: cr.PhysicalResourceId.of('JobSenderTriggerPhysicalId'),
      },
      onUpdate: {
        service: 'Lambda',
        action: 'invoke',
        parameters: {
          FunctionName: startBuildLambda.functionName,
          InvocationType: 'Event',
        },
        physicalResourceId: cr.PhysicalResourceId.of('JobSenderTriggerPhysicalId'),
      },
    });
    lambdaTrigger.node.addDependency(frontendBuildProject);

    const cloudfront = new CloudFrontWebDistribution(this, 'ReactFrontendPERNDistribution', {
      originConfigs: [
        {
          s3OriginSource: {
            s3BucketSource: buildBucket,
          },
          behaviors: [{ isDefaultBehavior: true }],
        },
      ],
    });

    new CfnOutput(this, 'Distribution', {
      value: `https://${cloudfront.distributionDomainName}`,
    });
  }
}

const app = new App();

new AppStack(app, 'pern-fullstack-cloud-native');

app.synth();

import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as codepipeline from 'aws-cdk-lib/aws-codepipeline';
import * as actions from 'aws-cdk-lib/aws-codepipeline-actions';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';

import * as iam from "aws-cdk-lib/aws-iam";


const connectionArn = "arn:aws:codeconnections:us-east-1:456582263462:connection/cfaf9c50-7b9e-40c4-a91e-fbacd57bba94";

const sourceOutput = new codepipeline.Artifact();


export class PipelineStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // 🤫 GitHub token stored in Secrets Manager
    //const oauthToken = cdk.SecretValue.secretsManager('github-token1');

    // 📌 CodeBuild project
    const project = new codebuild.PipelineProject(this, 'BuildProject', {
      environment: {
        buildImage: codebuild.LinuxBuildImage.STANDARD_6_0,
      },

      buildSpec: codebuild.BuildSpec.fromObject({
        version: "0.2",
        phases: {
          build: {
            commands: [
              'echo "Creating S3 bucket..."',
              'aws s3 mb s3://my-pipeline-created-bucket-12345 || echo "Bucket may already exist"',
            ]
          }
        }
      })







    });

    // 📌 Pipeline
    const pipeline = new codepipeline.Pipeline(this, 'SimplePipeline');





// Allow CodeBuild to create S3 buckets
    project.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["s3:CreateBucket", "s3:PutBucketPublicAccessBlock", "s3:PutBucketAcl"],
        resources: ["*"],
        
      },)




    // ----------------
    // 1️⃣ SOURCE STAGE
    // ----------------
    const sourceOutput = new codepipeline.Artifact();

    pipeline.addStage({
        stageName: 'Source',
        actions: [
          new actions.CodeStarConnectionsSourceAction({
            actionName: 'GitHub_Source',
            owner: 'alexriley7',
            repo: 'codepipelinetest1',
            branch: 'main',
            output: sourceOutput,
            connectionArn: connectionArn,
        })
      ]
    });

    // --------------
    // 2️⃣ BUILD STAGE
    // --------------
    const buildOutput = new codepipeline.Artifact();

    const buildOutput2 = new codepipeline.Artifact();

    pipeline.addStage({
      stageName: 'Build',
      actions: [
        new actions.CodeBuildAction({
          actionName: 'Run_Build',
          project: project,
          input: sourceOutput,
          outputs: [buildOutput],
        })
      ]
    });



    pipeline.addStage({
      stageName: "CreateS3Bucket",
      actions: [
        new actions.CodeBuildAction({
          actionName: "S3BucketCreate",
          project: project,
          input: [buildOutput],
          outputs: [buildOutput2]
             // same source output from GitHub
        }),
      ],
    });


        // ---------------
    // 3️⃣ DEPLOY STAGE (dummy))
    // ---------------
    pipeline.addStage({
      stageName: 'Deploy',
      actions: [
        new actions.ManualApprovalAction({
          actionName: 'Approve',
        })
      ]
    });


  }
}

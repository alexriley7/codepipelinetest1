"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.PipelineStack = void 0;
const cdk = __importStar(require("aws-cdk-lib"));
const codepipeline = __importStar(require("aws-cdk-lib/aws-codepipeline"));
const actions = __importStar(require("aws-cdk-lib/aws-codepipeline-actions"));
const codebuild = __importStar(require("aws-cdk-lib/aws-codebuild"));
const connectionArn = "arn:aws:codeconnections:us-east-1:456582263462:connection/cfaf9c50-7b9e-40c4-a91e-fbacd57bba94";
const sourceOutput = new codepipeline.Artifact();
class PipelineStack extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        // 🤫 GitHub token stored in Secrets Manager
        //const oauthToken = cdk.SecretValue.secretsManager('github-token1');
        // 📌 CodeBuild project
        const project = new codebuild.PipelineProject(this, 'BuildProject', {
            environment: {
                buildImage: codebuild.LinuxBuildImage.STANDARD_6_0,
            }
        });
        // 📌 Pipeline
        const pipeline = new codepipeline.Pipeline(this, 'SimplePipeline');
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
        // ---------------
        // 3️⃣ DEPLOY STAGE (dummy)
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
exports.PipelineStack = PipelineStack;

import { Template } from "aws-cdk-lib/assertions";
import { Stack } from "aws-cdk-lib";
import { AwsCdkAppStack } from "../lib/aws-cdk-app-stack";

describe("AwsCdkAppStack", () => {
    let stack: Stack;

    beforeEach(() => {
        stack = new AwsCdkAppStack(new Stack(), "MyTestStack");
    });

    test("It should create a WidgetService", () => {
    // Check if the stack has a S3 Bucket, Lambda Function, and a REST API Gateway
    // which are part of the WidgetService construct.
        Template.fromStack(stack).hasResource("AWS::S3::Bucket", {});
        Template.fromStack(stack).hasResource("AWS::Lambda::Function", {});
        Template.fromStack(stack).hasResource("AWS::ApiGateway::RestApi", {});
    });
});

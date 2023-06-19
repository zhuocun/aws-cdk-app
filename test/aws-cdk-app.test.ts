import { expect as expectCDK, haveResourceLike } from "@aws-cdk/assert";
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
        expectCDK(stack).to(haveResourceLike("AWS::S3::Bucket"));
        expectCDK(stack).to(haveResourceLike("AWS::Lambda::Function"));
        expectCDK(stack).to(haveResourceLike("AWS::ApiGateway::RestApi"));
    });
});

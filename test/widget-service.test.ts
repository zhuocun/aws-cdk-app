import { expect as expectCDK, haveResource } from "@aws-cdk/assert";
import { Stack } from "aws-cdk-lib";
import { WidgetService } from "../lib/widget-service";

describe("WidgetService Construct", () => {
    let stack: Stack;

    beforeEach(() => {
        stack = new Stack();
        new WidgetService(stack, "MyTestConstruct");
    });

    // Tests that an S3 bucket is present in the stack
    test("has an S3 Bucket", () => {
        expectCDK(stack).to(haveResource("AWS::S3::Bucket"));
    });

    // Tests that a Lambda function is present in the stack
    test("has a Lambda Function", () => {
        expectCDK(stack).to(haveResource("AWS::Lambda::Function"));
    });

    // Tests that an API Gateway is present in the stack
    test("has a REST API Gateway", () => {
        expectCDK(stack).to(haveResource("AWS::ApiGateway::RestApi"));
    });

    // Tests that the Lambda function uses the correct runtime
    test("Lambda uses the correct runtime", () => {
        expectCDK(stack).to(
            haveResource("AWS::Lambda::Function", {
                Runtime: "nodejs16.x",
            })
        );
    });
});

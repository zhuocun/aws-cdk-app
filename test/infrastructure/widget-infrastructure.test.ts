import { Template } from "aws-cdk-lib/assertions";
import { Stack } from "aws-cdk-lib";
import { WidgetInfrastructure } from "../../infrastructure/lib/widget-infrastructure";

describe("Widget Infrastructure", () => {
  let stack: Stack;

  beforeEach(() => {
    stack = new Stack();
    new WidgetInfrastructure(stack, "MyTestConstruct"); // NOSONAR
  });

  it("has an S3 Bucket", () => {
    Template.fromStack(stack).hasResource("AWS::S3::Bucket", {});
  });

  it("has a Lambda Function", () => {
    Template.fromStack(stack).hasResource("AWS::Lambda::Function", {});
  });

  it("has a REST API Gateway", () => {
    Template.fromStack(stack).hasResource("AWS::ApiGateway::RestApi", {});
  });

  it("uses the correct runtime", () => {
    Template.fromStack(stack).hasResourceProperties("AWS::Lambda::Function", {
      Runtime: "nodejs18.x",
    });
  });
});

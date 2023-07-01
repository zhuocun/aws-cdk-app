import { Template } from "aws-cdk-lib/assertions";
import { Stack } from "aws-cdk-lib";
import { JenkinsInfrastructure } from "../../infrastructure/lib/jenkins-infrastructure";

describe("Jenkins Infrastructure", () => {
    let stack: Stack;

    beforeEach(() => {
      stack = new Stack();
      new JenkinsInfrastructure(stack, "MyTestConstruct"); // NOSONAR
    });

    it("has a VPC", () => {
        Template.fromStack(stack).hasResource("AWS::EC2::VPC", {});
    });

    it("has a Security Group", () => {
        Template.fromStack(stack).hasResource("AWS::EC2::SecurityGroup", {});
    });

    it("has an EC2 Instance", () => {
        Template.fromStack(stack).hasResource("AWS::EC2::Instance", {});
    });

    it("has an Application Load Balancer", () => {
        Template.fromStack(stack).hasResource(
            "AWS::ElasticLoadBalancingV2::LoadBalancer",
            {}
        );
    });

    it("uses the correct instance type for Jenkins Server", () => {
        Template.fromStack(stack).hasResourceProperties("AWS::EC2::Instance", {
            InstanceType: "t2.medium"
        });
    });
});

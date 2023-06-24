import { WidgetInfrastructure } from "./widget-infrastructure";
import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { JenkinsInfrastructure } from "./jenkins-infrastructure";

class AwsCdkAppStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
    new WidgetInfrastructure(this, "Widgets");
    new JenkinsInfrastructure(this, "Jenkins");
  }
}

export { AwsCdkAppStack };

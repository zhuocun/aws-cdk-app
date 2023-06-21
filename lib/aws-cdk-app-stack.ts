import { WidgetService } from "./widget-service";
import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";

export class AwsCdkAppStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);
        new WidgetService(this, "Widgets");
    }
}

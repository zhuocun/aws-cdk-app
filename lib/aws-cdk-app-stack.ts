import { WidgetService } from "./widget-service";
import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";

export class AwsCdkAppStack extends Stack {
    private infrastructure: WidgetService;
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);
        this.infrastructure = new WidgetService(this, "Widgets");
    }
}

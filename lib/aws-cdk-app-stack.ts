import { WidgetService } from "./widget-service";
import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";

export class AwsCdkAppStack extends cdk.Stack {
    private widgetService: WidgetService;
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);
        this.widgetService = new WidgetService(this, "Widgets");
    }
}

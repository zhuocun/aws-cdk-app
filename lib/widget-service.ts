import { Construct } from "constructs";
import { Stack } from "aws-cdk-lib";
import { Bucket } from "aws-cdk-lib/aws-s3";
import { Function, Runtime, Code } from "aws-cdk-lib/aws-lambda";
import { RestApi, LambdaIntegration } from "aws-cdk-lib/aws-apigateway";

export class WidgetService extends Construct {
    constructor(scope: Stack, id: string) {
        super(scope, id);

        const bucket = new Bucket(this, "WidgetStore");

        const handler = new Function(this, "WidgetHandler", {
            runtime: Runtime.NODEJS_16_X,
            code: Code.fromAsset("resources"),
            handler: "widgets.main",
            environment: {
                BUCKET: bucket.bucketName,
            },
        });

        bucket.grantReadWrite(handler);

        const api = new RestApi(this, "widgets-api", {
            restApiName: "Widget Service",
            description: "This service serves widgets.",
        });

        const getWidgetsIntegration = new LambdaIntegration(handler, {
            requestTemplates: { "application/json": "{ \"statusCode\": \"200\" }" },
        });

        api.root.addMethod("GET", getWidgetsIntegration);

        const widget = api.root.addResource("{id}");

        const postWidgetIntegration = new LambdaIntegration(handler);
        const getWidgetIntegration = new LambdaIntegration(handler);
        const deleteWidgetIntegration = new LambdaIntegration(handler);

        widget.addMethod("POST", postWidgetIntegration);
        widget.addMethod("GET", getWidgetIntegration);
        widget.addMethod("DELETE", deleteWidgetIntegration);
    }
}

import { Construct } from "constructs";
import { Stack } from "aws-cdk-lib";
import { Bucket } from "aws-cdk-lib/aws-s3";
import {
    Code,
    Function as LambdaFunction,
    Runtime
} from "aws-cdk-lib/aws-lambda";
import { RestApi, LambdaIntegration } from "aws-cdk-lib/aws-apigateway";

class WidgetInfrastructure extends Construct {
    constructor(scope: Stack, id: string) {
        super(scope, id);

        // Defines a S3 Bucket to store the widgets
        const bucket = new Bucket(this, "WidgetStore");

        // Defines the Lambda Function for the API Gateway
        const lambdaHandler = new LambdaFunction(this, "WidgetHandler", {
            runtime: Runtime.NODEJS_18_X,
            code: Code.fromAsset("dist/src/widget"),
            handler: "widget-controller.main",
            environment: {
                BUCKET: bucket.bucketName
            }
        });

        // Defines the S3 Bucket Permission for the Lambda Function
        bucket.grantReadWrite(lambdaHandler);

        // Defines the API Gateway Rest API
        const api = new RestApi(this, "widgets-api", {
            restApiName: "Widget Service",
            description: "This service serves widgets."
        });

        // Defines the API Gateway Integration for the Lambda Function
        const getWidgetsIntegration = new LambdaIntegration(lambdaHandler, {
            requestTemplates: { "application/json": "{ \"statusCode\": \"200\" }" }
        });

        api.root.addMethod("GET", getWidgetsIntegration);

        const widget = api.root.addResource("{id}");

        const postWidgetIntegration = new LambdaIntegration(lambdaHandler);
        const getWidgetIntegration = new LambdaIntegration(lambdaHandler);
        const deleteWidgetIntegration = new LambdaIntegration(lambdaHandler);

        widget.addMethod("POST", postWidgetIntegration);
        widget.addMethod("GET", getWidgetIntegration);
        widget.addMethod("DELETE", deleteWidgetIntegration);
    }
}

export { WidgetInfrastructure };

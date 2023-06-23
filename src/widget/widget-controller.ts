import { APIGatewayProxyEvent } from "aws-lambda";
import { createWidget, deleteWidget, getWidgets } from "./widget-service";

const formatResponse = (
    statusCode: number,
    body: unknown
): { statusCode: number; headers: object; body: string } => {
    return {
        statusCode,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    };
};

const main = async (
    event: APIGatewayProxyEvent
): Promise<{ statusCode: number; headers: object; body: string }> => {
    const method = event.httpMethod;
    const widgetName = event.path?.startsWith("/")
        ? event.path.substring(1)
        : event.path;
    try {
        switch (method) {
        case "GET":
            return formatResponse(200, await getWidgets(widgetName));
        case "POST":
            return formatResponse(200, await createWidget(widgetName));
        case "DELETE":
            return formatResponse(200, await deleteWidget(widgetName));
        default:
            return formatResponse(
                400,
                "Only GET, POST, and DELETE requests are accepted currently"
            );
        }
    } catch (error) {
        return formatResponse(500, error instanceof Error ? error.message : error);
    }
};

export { main };

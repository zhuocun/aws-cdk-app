import { APIGatewayProxyEvent } from "aws-lambda";

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

const getWidgetName = (event: APIGatewayProxyEvent): string => {
    return event.path?.startsWith("/") ? event.path.substring(1) : event.path;
};

export { formatResponse, getWidgetName };

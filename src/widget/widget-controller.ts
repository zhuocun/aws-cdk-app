import { APIGatewayProxyEvent } from "aws-lambda";
import { WidgetService } from "./widget-service";
import { formatResponse, getWidgetName } from "../../utils/controller-utils";

const getWidgets = async (event: APIGatewayProxyEvent) => {
  try {
    const widgetName = getWidgetName(event);
    if (widgetName) {
      return formatResponse(200, await WidgetService.getWidgets(widgetName));
    } else {
      return formatResponse(400, "Widget name missing");
    }
  } catch (error) {
    return formatResponse(500, error instanceof Error ? error.message : error);
  }
};

const createWidget = async (event: APIGatewayProxyEvent) => {
  try {
    const widgetName = getWidgetName(event);
    if (widgetName) {
      return formatResponse(
        200,
        await WidgetService.createWidget(getWidgetName(event))
      );
    } else {
      return formatResponse(400, "Widget name missing");
    }
  } catch (error) {
    return formatResponse(500, error instanceof Error ? error.message : error);
  }
};

const deleteWidget = async (event: APIGatewayProxyEvent) => {
  try {
    const widgetName = getWidgetName(event);
    if (widgetName) {
      return formatResponse(
        200,
        await WidgetService.deleteWidget(getWidgetName(event))
      );
    } else {
      return formatResponse(400, "Widget name missing");
    }
  } catch (error) {
    return formatResponse(500, error instanceof Error ? error.message : error);
  }
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
        return formatResponse(200, await WidgetService.getWidgets(widgetName));
      case "POST":
        return formatResponse(
          200,
          await WidgetService.createWidget(widgetName)
        );
      case "DELETE":
        return formatResponse(
          200,
          await WidgetService.deleteWidget(widgetName)
        );
      default:
        return formatResponse(
          400,
          "Only GET, POST, and DELETE requests are accepted now"
        );
    }
  } catch (error) {
    return formatResponse(500, error instanceof Error ? error.message : error);
  }
};

export { main };

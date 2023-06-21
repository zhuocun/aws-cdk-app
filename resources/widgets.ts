import {
    S3Client,
    ListObjectsV2Command,
    GetObjectCommand,
    PutObjectCommand,
    DeleteObjectCommand
} from "@aws-sdk/client-s3";
import { APIGatewayProxyEvent } from "aws-lambda";

const s3 = new S3Client({});
const bucketName = process.env.BUCKET ?? "widgets";

const main = async (
    event: APIGatewayProxyEvent & { widgets: string }
): Promise<{ statusCode: number; headers: object; body: string }> => {
    try {
        const method = event.httpMethod;
        const widgetName = event.path.startsWith("/")
            ? event.path.substring(1)
            : event.path;

        if (method === "GET") {
            if (event.path === "/") {
                const data = await s3.send(
                    new ListObjectsV2Command({ Bucket: bucketName })
                );
                const body = {
                    widgets: data.Contents
                        ? data.Contents.map((e) => {
                            return e.Key;
                        })
                        : []
                };
                return {
                    statusCode: 200,
                    headers: {},
                    body: JSON.stringify(body)
                };
            }

            if (widgetName) {
                const data = await s3.send(
                    new GetObjectCommand({ Bucket: bucketName, Key: widgetName })
                );
                const body = data.Body?.toString();

                return {
                    statusCode: 200,
                    headers: {},
                    body: JSON.stringify(body)
                };
            }
        }

        if (method === "POST") {
            if (!widgetName) {
                return {
                    statusCode: 400,
                    headers: {},
                    body: "Widget name missing"
                };
            }

            const now = new Date();
            const data = widgetName + " created: " + now;

            const base64data = Buffer.from(data, "binary");

            await s3.send(
                new PutObjectCommand({
                    Bucket: bucketName,
                    Key: widgetName,
                    Body: base64data,
                    ContentType: "application/json"
                })
            );

            return {
                statusCode: 200,
                headers: {},
                body: JSON.stringify(event.widgets)
            };
        }

        if (method === "DELETE") {
            if (!widgetName) {
                return {
                    statusCode: 400,
                    headers: {},
                    body: "Widget name missing"
                };
            }

            await s3.send(
                new DeleteObjectCommand({ Bucket: bucketName, Key: widgetName })
            );

            return {
                statusCode: 200,
                headers: {},
                body: "Successfully deleted widget " + widgetName
            };
        }

        return {
            statusCode: 400,
            headers: {},
            body: "We only accept GET, POST, and DELETE, not " + method
        };
    } catch (error: unknown) {
        let body = "";
        if (error instanceof Error) {
            body = error.stack ?? error.message;
        } else {
            body = JSON.stringify(error, null, 2);
        }
        return {
            statusCode: 400,
            headers: {},
            body: body
        };
    }
};

export { main };

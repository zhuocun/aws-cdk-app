import {
    S3Client,
    ListObjectsV2Command,
    GetObjectCommand,
    PutObjectCommand,
    DeleteObjectCommand
} from "@aws-sdk/client-s3";

const s3 = new S3Client({});
const bucketName = process.env.BUCKET ?? "WidgetStore";

const getWidgets = async (
    widgetName: string
): Promise<
  | {
      widgets: (string | undefined)[];
    }
  | {
      widget: string | undefined;
    }
> => {
    if (!widgetName) {
        const data = await s3.send(
            new ListObjectsV2Command({ Bucket: bucketName })
        );
        return { widgets: data.Contents ? data.Contents.map((e) => e.Key) : [] };
    }
    const data = await s3.send(
        new GetObjectCommand({ Bucket: bucketName, Key: widgetName })
    );
    return { widget: data.Body?.toString() };
};

const createWidget = async (widgetName: string): Promise<string> => {
    if (!widgetName) throw new Error("Widget name missing");
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
    return widgetName + " created successfully";
};

const deleteWidget = async (widgetName: string): Promise<string> => {
    if (!widgetName) throw new Error("Widget name missing");
    await s3.send(
        new DeleteObjectCommand({ Bucket: bucketName, Key: widgetName })
    );
    return "Successfully deleted widget " + widgetName;
};

export { getWidgets, createWidget, deleteWidget };

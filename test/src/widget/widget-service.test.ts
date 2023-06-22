import {
    createWidget,
    deleteWidget,
    getWidgets
} from "../../../src/widget/widget-service";

jest.mock("@aws-sdk/client-s3", () => {
    const actualModule = jest.requireActual("@aws-sdk/client-s3");

    return {
        ...actualModule,
        S3Client: jest.fn(() => ({
            send: jest.fn().mockImplementation((command) => {
                switch (command.constructor.name) {
                case actualModule.ListObjectsV2Command.name:
                    return Promise.resolve({
                        Contents: [{ Key: "widget1" }, { Key: "widget2" }]
                    });

                case actualModule.GetObjectCommand.name:
                    return Promise.resolve({
                        Body: command.input.Key
                    });

                case actualModule.PutObjectCommand.name:
                    return Promise.resolve();

                case actualModule.DeleteObjectCommand.name:
                    return Promise.resolve();

                default:
                    return Promise.resolve();
                }
            })
        }))
    };
});

describe("getWidgets", () => {
    it("should return all widget keys when widgetName is not provided", async () => {
        const result = await getWidgets("");
        expect(result).toEqual({ widgets: ["widget1", "widget2"] });
    });

    it("should return specific widget data when widgetName is provided", async () => {
        const result = await getWidgets("widget1");
        expect(result).toEqual({ widget: "widget1" });
    });
});

describe("createWidget", () => {
    it("should throw an error when widgetName is not provided", async () => {
        await expect(createWidget("")).rejects.toThrow("Widget name missing");
    });

    it("should create widget when widgetName is provided", async () => {
        const widgetName = "widget3";
        const result = await createWidget(widgetName);
        expect(result).toBe(widgetName + " created successfully");
    });
});

describe("deleteWidget", () => {
    it("should throw an error when widgetName is not provided", async () => {
        await expect(deleteWidget("")).rejects.toThrow("Widget name missing");
    });

    it("should delete widget when widgetName is provided", async () => {
        const widgetName = "widget1";
        const result = await deleteWidget(widgetName);
        expect(result).toBe("Successfully deleted widget " + widgetName);
    });
});

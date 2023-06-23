import { S3Client } from "@aws-sdk/client-s3";
import { APIGatewayProxyEvent } from "aws-lambda";
import { main } from "../../../src/widget/widget-controller";

jest.mock("@aws-sdk/client-s3", () => {
  const actualModule = jest.requireActual("@aws-sdk/client-s3");

  return {
    ...actualModule,
    S3Client: jest.fn(() => ({
      send: jest.fn().mockImplementation((command) => {
        switch (command.constructor.name) {
          case actualModule.ListObjectsV2Command.name:
            return Promise.resolve({
              Contents: [{ Key: "widget1" }, { Key: "widget2" }],
            });

          case actualModule.GetObjectCommand.name:
            if (command.input.Key === "errorWidget1") {
              return Promise.reject(new Error("Error fetching widget"));
            }

            if (command.input.Key === "errorWidget2") {
              return Promise.reject("Error fetching widget");
            }

            return Promise.resolve({
              Body: command.input.Key,
            });

          case actualModule.PutObjectCommand.name:
            return Promise.resolve();

          case actualModule.DeleteObjectCommand.name:
            return Promise.resolve();

          default:
            return Promise.resolve();
        }
      }),
    })),
  };
});

describe("main", () => {
  beforeEach(() => {
    (S3Client as jest.Mock).mockClear();
  });
  it("should handle GET request and return required widget", async () => {
    const event = {
      httpMethod: "GET",
      path: "/widget1",
    } as APIGatewayProxyEvent;

    const result = await main(event);

    expect(result.statusCode).toBe(200);
    expect(result.body).toEqual(expect.stringContaining("widget1"));
  });

  it("should handle GET request and return widgets", async () => {
    const event = {
      httpMethod: "GET",
      path: "",
    } as APIGatewayProxyEvent;

    const result = await main(event);

    expect(result.statusCode).toBe(200);
    expect(result.body).toEqual(expect.stringContaining("widget1"));
    expect(result.body).toEqual(expect.stringContaining("widget2"));
  });

  it("should handle POST request and create a widget", async () => {
    const event = {
      httpMethod: "POST",
      path: "/newWidget",
    } as APIGatewayProxyEvent;

    const result = await main(event);

    expect(result.statusCode).toBe(200);
    expect(result.body).toEqual(
      expect.stringContaining("newWidget created successfully")
    );
  });

  it("should handle DELETE request and delete a widget", async () => {
    const event = {
      httpMethod: "DELETE",
      path: "/widget1",
    } as APIGatewayProxyEvent;

    const result = await main(event);

    expect(result.statusCode).toBe(200);
    expect(result.body).toEqual(
      expect.stringContaining("Successfully deleted widget widget1")
    );
  });

  it("should handle invalid request method and return 400", async () => {
    const event = {
      httpMethod: "PUT",
      path: "/widget1",
    } as APIGatewayProxyEvent;

    const result = await main(event);

    expect(result.statusCode).toBe(400);
    expect(result.body).toEqual(
      expect.stringContaining(
        "Only GET, POST, and DELETE requests are accepted currently"
      )
    );
  });

  it("should handle error and return 500", async () => {
    const event1 = {
      httpMethod: "GET",
      path: "/errorWidget1",
    } as APIGatewayProxyEvent;

    const result1 = await main(event1);
    expect(result1.statusCode).toBe(500);
    expect(result1.body).toEqual(
      expect.stringContaining("Error fetching widget")
    );

    const event2 = {
      httpMethod: "GET",
      path: "/errorWidget2",
    } as APIGatewayProxyEvent;

    const result2 = await main(event2);
    expect(result2.statusCode).toBe(500);
    expect(result2.body).toEqual(
      expect.stringContaining("Error fetching widget")
    );
  });
});

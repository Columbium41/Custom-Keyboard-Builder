import {mockClient} from "aws-sdk-client-mock";
import {S3Client} from "@aws-sdk/client-s3";

// intercepts every S3Client.send, reset before each test in tests/setup/setup.ts
export const s3Mock = mockClient(S3Client);

export default ({ env }) => ({
  upload: {
    config: {
      provider: "aws-s3",
      providerOptions: {
        accessKeyId: env("AWS_ACCESS_KEY_ID"),
        secretAccessKey: env("AWS_ACCESS_SECRET"),
        region: env("AWS_REGION"),
        params: {
          Bucket: env("AWS_BUCKET"),
        },
      },
      actionOptions: {
        upload: {},
        uploadStream: {},
        delete: {},
      },
    },
  },
  "strapi-plugin-populate-deep": {
    config: {
      defaultDepth: 3,
    },
  },
  email: {
    config: {
      provider: "nodemailer",
      providerOptions: {
        host: "smtp.gmail.com",
        port: 587,
        auth: {
          user: "dev.anhtu@gmail.com",
          pass: "omqeeuusafoxwfzs",
        },
      },
      settings: {
        defaultFrom: "dev.anhtu@gmail.com",
        defaultReplyTo: "dev.anhtu@gmail.com",
      },
    },
  },
  sentry: {
    enabled: true,
    config: {
      dsn: "https://bd464109a0084501be4cfaad5424a291@o4504808240906240.ingest.sentry.io/4504808249950208",
      sendMetadata: true,
    },
  },
});

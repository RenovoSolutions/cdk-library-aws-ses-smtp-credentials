# AWS CDK Construct for Simple Email Service (SES) SMTP Credentials

[![build](https://github.com/RenovoSolutions/cdk-library-aws-ses-smtp-credentials/actions/workflows/build.yml/badge.svg)](https://github.com/RenovoSolutions/cdk-library-aws-ses-smtp-credentials/actions/workflows/build.yml)

This construct creates SES SMTP Credentials

## Overview

- Creates an IAM user with a policy to send SES emails
- Uses a custom resource to generate then convert AWS credentials to SES SMTP Credentials
- Uploads the resulting SMTP credentials to AWS Secrets Manager

## Usage examples

See [API](API.md) doc for full details

**typescript example:**

```typescript
new SesSmtpCredentials(stack, 'SesSmtpCredentials', {
  iamUserName: 'exampleUser',
});
```

## Testing the generated credentials in the CLI

See [this document from AWS](https://docs.aws.amazon.com/ses/latest/dg/send-email-smtp-client-command-line.html#send-email-using-openssl) for full details

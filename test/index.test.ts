import {
  App,
  Stack,
  aws_iam as iam,
  aws_kms as kms,
} from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import {
  SesSmtpCredentials,
} from '../src/index';

test('Snapshot with default KMS key', () => {
  const app = new App();
  const stack = new Stack(app, 'TestStack');

  new SesSmtpCredentials(stack, 'SesSmtpCredentials', {
    iamUserName: 'exampleUser',
    secretResourcePolicy: new iam.PolicyDocument({
      statements: [
        new iam.PolicyStatement({
          actions: ['secretsmanager:GetSecretValue'],
          effect: iam.Effect.ALLOW,
          principals: [new iam.ServicePrincipal('rds.amazonaws.com')],
          resources: ['*'],
          conditions: {
            StringEquals: {
              'aws:sourceAccount': [Stack.of(stack).account],
            },
            ArnLike: {
              'aws:SourceArn': `arn:aws:rds:${Stack.of(stack).region}:${Stack.of(stack).account}:og:${Stack.of(stack).stackName.toLowerCase()}*`,
            },
          },
        }),
      ],
    }),
  });

  const template = Template.fromStack(stack);
  const json = template.toJSON();
  const deletes = Object.assign({},
    template.findResources('Custom::CDKBucketDeployment'),
    template.findResources('AWS::Lambda::Function'),
  );
  const deleteKeys = Object.keys(deletes);
  deleteKeys.forEach((key) => {
    delete json.Resources[key].Properties.SourceObjectKeys;
    if (json.Resources[key].Properties.Code) {
      delete json.Resources[key].Properties.Code.S3Key;
    }
  });

  expect(json).toMatchSnapshot();
});

test('Snapshot with custom KMS key', () => {
  const app = new App();
  const stack = new Stack(app, 'TestStack');

  new SesSmtpCredentials(stack, 'SesSmtpCredentials', {
    iamUserName: 'exampleUser',
    secretResourcePolicy: new iam.PolicyDocument({
      statements: [
        new iam.PolicyStatement({
          actions: ['secretsmanager:GetSecretValue'],
          effect: iam.Effect.ALLOW,
          principals: [new iam.ServicePrincipal('rds.amazonaws.com')],
          resources: ['*'],
          conditions: {
            StringEquals: {
              'aws:sourceAccount': [Stack.of(stack).account],
            },
            ArnLike: {
              'aws:SourceArn': `arn:aws:rds:${Stack.of(stack).region}:${Stack.of(stack).account}:og:${Stack.of(stack).stackName.toLowerCase()}*`,
            },
          },
        }),
      ],
    }),
    kmsKey: new kms.Key(stack, 'CustomKmsKey'),
  });

  const template = Template.fromStack(stack);
  const json = template.toJSON();
  const deletes = Object.assign({},
    template.findResources('Custom::CDKBucketDeployment'),
    template.findResources('AWS::Lambda::Function'),
  );
  const deleteKeys = Object.keys(deletes);
  deleteKeys.forEach((key) => {
    delete json.Resources[key].Properties.SourceObjectKeys;
    if (json.Resources[key].Properties.Code) {
      delete json.Resources[key].Properties.Code.S3Key;
    }
  });

  expect(json).toMatchSnapshot();
});
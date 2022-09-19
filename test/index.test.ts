import {
  Stack,
  App,
  aws_iam as iam,
} from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import {
  SesSmtpCredentials,
} from '../src/index';

test('Snapshot', () => {
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

  expect(Template.fromStack(stack)).toMatchSnapshot();
});
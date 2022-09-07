import * as path from 'path';
import {
  aws_iam as iam,
  custom_resources as cr,
  CustomResource,
  aws_lambda as lambda,
  aws_secretsmanager as secretsmanager,
  Duration,
  Names,
  Stack,
  Tags,
} from 'aws-cdk-lib';
import { Construct } from 'constructs';

/**
 * The properties of a new set of SMTP Credentials
 */
export interface SesSmtpCredentialsProps {
  /**
   * The name of the IAM user to create
   */
  readonly iamUserName: string;
}

export class SesSmtpCredentials extends Construct {
  /**
   * The IAM user to which the SMTP credentials are attached.
   */
  public readonly iamUser: iam.User;
  /**
   * The AWS secrets manager secret that contains the SMTP credentials.
   */
  public readonly secret: secretsmanager.ISecret;

  constructor(scope: Construct, id: string, props: SesSmtpCredentialsProps) {
    super (scope, id);

    const secretName = `${Names.uniqueId(this)}${props.iamUserName}`;

    const sesSendPolicy = new iam.ManagedPolicy(this, 'SesSendPolicy', {
      statements: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          sid: 'SesAllowSendPolicy',
          actions: ['ses:SendRawEmail'],
          resources: ['*'],
        }),
      ],
    });

    this.iamUser = new iam.User(this, 'User', {
      userName: props.iamUserName,
      managedPolicies: [
        sesSendPolicy,
      ],
    });

    Tags.of(this.iamUser).add('CfnStackIdForSesCredLibrary', Stack.of(this).stackId);

    const role = new iam.Role(this, 'Role', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        new iam.ManagedPolicy(this, 'SecretsManagerPolicy', {
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              sid: 'SecretsManagerPolicy',
              actions: [
                'secretsmanager:PutSecretValue',
                'secretsmanager:CreateSecret',
                'secretsmanager:DeleteSecret',
                'secretsmanager:UpdateSecret',
                'secretsmanager:TagResource',
              ],
              resources: [`arn:aws:secretsmanager:${Stack.of(this).region}:${Stack.of(this).account}:secret:${secretName}-*`],
            }),
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              sid: 'IamAllowKeyManagementPolicy',
              actions: [
                'iam:CreateAccessKey',
                'iam:DeleteAccessKey',
                'iam:ListAccessKeys',
              ],
              resources: ['*'],
              conditions: {
                StringEquals: {
                  'iam:ResourceTag/CfnStackIdForSesCredLibrary': Stack.of(this).stackId,
                },
              },
            }),
          ],
        }),
      ],
    });

    const onEventHandler = new lambda.Function(this, 'OnEventHandler', {
      runtime: lambda.Runtime.PYTHON_3_9,
      handler: 'index.on_event',
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambda')),
      timeout: Duration.seconds(30),
      role,
    });

    const provider = new cr.Provider(this, 'Provider', {
      onEventHandler,
    });

    const secret = new CustomResource(this, 'SecretArn', {
      serviceToken: provider.serviceToken,
      properties: {
        UserName: props.iamUserName,
        SecretName: secretName,
        Region: Stack.of(this).region,
        Override: 'true',
      },
    });

    secret.node.addDependency(this.iamUser);

    this.secret = secretsmanager.Secret.fromSecretCompleteArn(this, 'Secret', secret.getAttString('SecretArn'));
  }
}
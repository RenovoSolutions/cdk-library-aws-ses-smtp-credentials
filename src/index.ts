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
  aws_kms as kms,
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
  /**
   * The resource policy to apply to the resulting secret
   */
  readonly secretResourcePolicy?: iam.PolicyDocument;
  /**
   * If a secret is pending deletion should it be restored?
   *
   * This helps in cases where cloudformation roll backs puts a secret in pending delete state.
   *
   * @default true
   */
  readonly restoreSecret?: boolean;
  /**
   * If a secret already exists should it be overwritten?
   *
   * This helps in cases where cloudformation creates a secret successfully but it gets orphaned for some reason.
   *
   * @default true
   */
  readonly overwriteSecret?: boolean;
  /**
   * The KMS key to use for the secret
   *
   * @default - default key
   */
  readonly kmsKey?: kms.IKey;
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

    const lambdaPolicy = new iam.ManagedPolicy(this, 'SecretsManagerPolicy', {
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
            'secretsmanager:RestoreSecret',
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
    });

    if (props.kmsKey) {
      lambdaPolicy.addStatements(new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        sid: 'KmsAllowKeyManagementPolicy',
        actions: [
          'kms:Encrypt',
          'kms:Decrypt',
          'kms:ReEncrypt*',
          'kms:GenerateDataKey*',
        ],
        resources: [props.kmsKey.keyArn],
      }));
    }

    const role = new iam.Role(this, 'Role', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        lambdaPolicy,
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
        Override: props.overwriteSecret ?? true,
        Restore: props.restoreSecret ?? true,
        KmsKeyId: props.kmsKey == undefined ? 'aws/secretsmanager' : props.kmsKey.keyId,
      },
    });

    secret.node.addDependency(this.iamUser);

    this.secret = secretsmanager.Secret.fromSecretCompleteArn(this, 'Secret', secret.getAttString('SecretArn'));

    if (props.secretResourcePolicy) {
      new secretsmanager.CfnResourcePolicy(this, 'SecretResourcePolicy', {
        secretId: this.secret.secretArn,
        resourcePolicy: props.secretResourcePolicy.toString(),
      });
    }
  }
}
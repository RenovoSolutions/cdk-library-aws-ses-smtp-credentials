# API Reference <a name="API Reference" id="api-reference"></a>

## Constructs <a name="Constructs" id="Constructs"></a>

### SesSmtpCredentials <a name="SesSmtpCredentials" id="@renovosolutions/cdk-library-aws-ses-smtp-credentials.SesSmtpCredentials"></a>

#### Initializers <a name="Initializers" id="@renovosolutions/cdk-library-aws-ses-smtp-credentials.SesSmtpCredentials.Initializer"></a>

```typescript
import { SesSmtpCredentials } from '@renovosolutions/cdk-library-aws-ses-smtp-credentials'

new SesSmtpCredentials(scope: Construct, id: string, props: SesSmtpCredentialsProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@renovosolutions/cdk-library-aws-ses-smtp-credentials.SesSmtpCredentials.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | *No description.* |
| <code><a href="#@renovosolutions/cdk-library-aws-ses-smtp-credentials.SesSmtpCredentials.Initializer.parameter.id">id</a></code> | <code>string</code> | *No description.* |
| <code><a href="#@renovosolutions/cdk-library-aws-ses-smtp-credentials.SesSmtpCredentials.Initializer.parameter.props">props</a></code> | <code><a href="#@renovosolutions/cdk-library-aws-ses-smtp-credentials.SesSmtpCredentialsProps">SesSmtpCredentialsProps</a></code> | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="scope" id="@renovosolutions/cdk-library-aws-ses-smtp-credentials.SesSmtpCredentials.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

---

##### `id`<sup>Required</sup> <a name="id" id="@renovosolutions/cdk-library-aws-ses-smtp-credentials.SesSmtpCredentials.Initializer.parameter.id"></a>

- *Type:* string

---

##### `props`<sup>Required</sup> <a name="props" id="@renovosolutions/cdk-library-aws-ses-smtp-credentials.SesSmtpCredentials.Initializer.parameter.props"></a>

- *Type:* <a href="#@renovosolutions/cdk-library-aws-ses-smtp-credentials.SesSmtpCredentialsProps">SesSmtpCredentialsProps</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@renovosolutions/cdk-library-aws-ses-smtp-credentials.SesSmtpCredentials.toString">toString</a></code> | Returns a string representation of this construct. |

---

##### `toString` <a name="toString" id="@renovosolutions/cdk-library-aws-ses-smtp-credentials.SesSmtpCredentials.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@renovosolutions/cdk-library-aws-ses-smtp-credentials.SesSmtpCredentials.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |

---

##### ~~`isConstruct`~~ <a name="isConstruct" id="@renovosolutions/cdk-library-aws-ses-smtp-credentials.SesSmtpCredentials.isConstruct"></a>

```typescript
import { SesSmtpCredentials } from '@renovosolutions/cdk-library-aws-ses-smtp-credentials'

SesSmtpCredentials.isConstruct(x: any)
```

Checks if `x` is a construct.

###### `x`<sup>Required</sup> <a name="x" id="@renovosolutions/cdk-library-aws-ses-smtp-credentials.SesSmtpCredentials.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@renovosolutions/cdk-library-aws-ses-smtp-credentials.SesSmtpCredentials.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#@renovosolutions/cdk-library-aws-ses-smtp-credentials.SesSmtpCredentials.property.iamUser">iamUser</a></code> | <code>aws-cdk-lib.aws_iam.User</code> | The IAM user to which the SMTP credentials are attached. |
| <code><a href="#@renovosolutions/cdk-library-aws-ses-smtp-credentials.SesSmtpCredentials.property.secret">secret</a></code> | <code>aws-cdk-lib.aws_secretsmanager.ISecret</code> | The AWS secrets manager secret that contains the SMTP credentials. |

---

##### `node`<sup>Required</sup> <a name="node" id="@renovosolutions/cdk-library-aws-ses-smtp-credentials.SesSmtpCredentials.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `iamUser`<sup>Required</sup> <a name="iamUser" id="@renovosolutions/cdk-library-aws-ses-smtp-credentials.SesSmtpCredentials.property.iamUser"></a>

```typescript
public readonly iamUser: User;
```

- *Type:* aws-cdk-lib.aws_iam.User

The IAM user to which the SMTP credentials are attached.

---

##### `secret`<sup>Required</sup> <a name="secret" id="@renovosolutions/cdk-library-aws-ses-smtp-credentials.SesSmtpCredentials.property.secret"></a>

```typescript
public readonly secret: ISecret;
```

- *Type:* aws-cdk-lib.aws_secretsmanager.ISecret

The AWS secrets manager secret that contains the SMTP credentials.

---


## Structs <a name="Structs" id="Structs"></a>

### SesSmtpCredentialsProps <a name="SesSmtpCredentialsProps" id="@renovosolutions/cdk-library-aws-ses-smtp-credentials.SesSmtpCredentialsProps"></a>

The properties of a new set of SMTP Credentials.

#### Initializer <a name="Initializer" id="@renovosolutions/cdk-library-aws-ses-smtp-credentials.SesSmtpCredentialsProps.Initializer"></a>

```typescript
import { SesSmtpCredentialsProps } from '@renovosolutions/cdk-library-aws-ses-smtp-credentials'

const sesSmtpCredentialsProps: SesSmtpCredentialsProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@renovosolutions/cdk-library-aws-ses-smtp-credentials.SesSmtpCredentialsProps.property.iamUserName">iamUserName</a></code> | <code>string</code> | The name of the IAM user to create. |
| <code><a href="#@renovosolutions/cdk-library-aws-ses-smtp-credentials.SesSmtpCredentialsProps.property.kmsKey">kmsKey</a></code> | <code>aws-cdk-lib.aws_kms.IKey</code> | The KMS key to use for the secret. |
| <code><a href="#@renovosolutions/cdk-library-aws-ses-smtp-credentials.SesSmtpCredentialsProps.property.overwriteSecret">overwriteSecret</a></code> | <code>boolean</code> | If a secret already exists should it be overwritten? |
| <code><a href="#@renovosolutions/cdk-library-aws-ses-smtp-credentials.SesSmtpCredentialsProps.property.restoreSecret">restoreSecret</a></code> | <code>boolean</code> | If a secret is pending deletion should it be restored? |
| <code><a href="#@renovosolutions/cdk-library-aws-ses-smtp-credentials.SesSmtpCredentialsProps.property.secretResourcePolicy">secretResourcePolicy</a></code> | <code>aws-cdk-lib.aws_iam.PolicyDocument</code> | The resource policy to apply to the resulting secret. |

---

##### `iamUserName`<sup>Required</sup> <a name="iamUserName" id="@renovosolutions/cdk-library-aws-ses-smtp-credentials.SesSmtpCredentialsProps.property.iamUserName"></a>

```typescript
public readonly iamUserName: string;
```

- *Type:* string

The name of the IAM user to create.

---

##### `kmsKey`<sup>Optional</sup> <a name="kmsKey" id="@renovosolutions/cdk-library-aws-ses-smtp-credentials.SesSmtpCredentialsProps.property.kmsKey"></a>

```typescript
public readonly kmsKey: IKey;
```

- *Type:* aws-cdk-lib.aws_kms.IKey
- *Default:* default key

The KMS key to use for the secret.

---

##### `overwriteSecret`<sup>Optional</sup> <a name="overwriteSecret" id="@renovosolutions/cdk-library-aws-ses-smtp-credentials.SesSmtpCredentialsProps.property.overwriteSecret"></a>

```typescript
public readonly overwriteSecret: boolean;
```

- *Type:* boolean
- *Default:* true

If a secret already exists should it be overwritten?

This helps in cases where cloudformation creates a secret successfully but it gets orphaned for some reason.

---

##### `restoreSecret`<sup>Optional</sup> <a name="restoreSecret" id="@renovosolutions/cdk-library-aws-ses-smtp-credentials.SesSmtpCredentialsProps.property.restoreSecret"></a>

```typescript
public readonly restoreSecret: boolean;
```

- *Type:* boolean
- *Default:* true

If a secret is pending deletion should it be restored?

This helps in cases where cloudformation roll backs puts a secret in pending delete state.

---

##### `secretResourcePolicy`<sup>Optional</sup> <a name="secretResourcePolicy" id="@renovosolutions/cdk-library-aws-ses-smtp-credentials.SesSmtpCredentialsProps.property.secretResourcePolicy"></a>

```typescript
public readonly secretResourcePolicy: PolicyDocument;
```

- *Type:* aws-cdk-lib.aws_iam.PolicyDocument

The resource policy to apply to the resulting secret.

---




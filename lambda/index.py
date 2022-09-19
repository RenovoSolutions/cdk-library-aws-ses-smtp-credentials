#!/usr/bin/env python3

# reference for python conversion: https://docs.aws.amazon.com/ses/latest/dg/smtp-credentials.html#smtp-credentials-convert

import hmac
import hashlib
import base64
import boto3
from botocore.exceptions import ClientError

SMTP_REGIONS = [
    'us-east-2',       # US East (Ohio)
    'us-east-1',       # US East (N. Virginia)
    'us-west-2',       # US West (Oregon)
    'ap-south-1',      # Asia Pacific (Mumbai)
    'ap-northeast-2',  # Asia Pacific (Seoul)
    'ap-southeast-1',  # Asia Pacific (Singapore)
    'ap-southeast-2',  # Asia Pacific (Sydney)
    'ap-northeast-1',  # Asia Pacific (Tokyo)
    'ca-central-1',    # Canada (Central)
    'eu-central-1',    # Europe (Frankfurt)
    'eu-west-1',       # Europe (Ireland)
    'eu-west-2',       # Europe (London)
    'sa-east-1',       # South America (Sao Paulo)
    'us-gov-west-1',   # AWS GovCloud (US)
]

# These values are required to calculate the signature. Do not change them.
DATE = "11111111"
SERVICE = "ses"
MESSAGE = "SendRawEmail"
TERMINAL = "aws4_request"
VERSION = 0x04


def sign(key, msg):
    return hmac.new(key, msg.encode('utf-8'), hashlib.sha256).digest()


def calculate_key(secret_access_key, region):
    if region not in SMTP_REGIONS:
        raise ValueError(f"The {region} Region doesn't have an SMTP endpoint.")

    signature = sign(("AWS4" + secret_access_key).encode('utf-8'), DATE)
    signature = sign(signature, region)
    signature = sign(signature, SERVICE)
    signature = sign(signature, TERMINAL)
    signature = sign(signature, MESSAGE)
    signature_and_version = bytes([VERSION]) + signature
    smtp_password = base64.b64encode(signature_and_version)
    return smtp_password.decode('utf-8')
  
def clean_up_access_key(username, access_key_id):
  iam = boto3.client('iam')
  try:
    iam.delete_access_key(UserName=username, AccessKeyId=access_key_id)
  except ClientError as e:
    if e.response['Error']['Code'] == 'NoSuchEntity':
      print("Access key %s or user %s already deleted" % (access_key_id, username))
  
def write_secret(props, key_response):
  try:
    client = boto3.client('secretsmanager')
    
    calculated_key = calculate_key(key_response['AccessKey']['SecretAccessKey'], props['Region'])

    response = client.create_secret(
      Name=props['SecretName'],
      SecretString='{"SMTP_USERNAME": "%s", "SMTP_PASSWORD": "%s"}' % (key_response['AccessKey']['AccessKeyId'], calculated_key),
      Description='SMTP Credentials for SES',
      KmsKeyId=props['KmsKeyId'],
    )

    return {
      'response': response,
      'accessKeyId': key_response['AccessKey']['AccessKeyId']
    }
  except ClientError as e:
    if e.response['Error']['Code'] == 'ResourceExistsException':
      if props['Override'] == 'true':
        print("Secret already exists, updating it")
        return write_updated_secret(props, key_response)
      else:
        print("Secret already exists and cant be written, cleaning up access key")
        clean_up_access_key(props['UserName'], key_response['AccessKey']['AccessKeyId'])
        raise e
    elif e.response['Error']['Code'] == 'InvalidRequestException':
      if 'secret with this name is already scheduled for deletion' in e.response['Error']['Message'] and props['Restore'] == 'true':
        print('Secret already exists and is scheduled for deletion, restoring it')
        client = boto3.client('secretsmanager')
        client.restore_secret(SecretId=props['SecretName'])
        write_updated_secret(props, key_response)
      else:
        print("Unknown error creating secret, cleaning up access key")
        clean_up_access_key(props['UserName'], key_response['AccessKey']['AccessKeyId'])
        raise e
    else:
      print("Unknown error creating secret, cleaning up access key")
      clean_up_access_key(props['UserName'], key_response['AccessKey']['AccessKeyId'])
      raise e
  
def write_updated_secret(props, key_response):
  try:
    client = boto3.client('secretsmanager')
    
    calculated_key = calculate_key(key_response['AccessKey']['SecretAccessKey'], props['Region'])

    response = client.update_secret(
      SecretId=props['SecretName'],
      SecretString='{"SMTP_USERNAME": "%s", "SMTP_PASSWORD": "%s"}' % (key_response['AccessKey']['AccessKeyId'], calculated_key),
      Description='SMTP Credentials for SES',
      KmsKeyId=props['KmsKeyId'],
    )

    return {
      'response': response,
      'accessKeyId': key_response['AccessKey']['AccessKeyId']
    }
  except ClientError as e:
    if e.response['Error']['Code'] == 'ResourceNotFoundException':
      print("Secret not found, creating it")
      return write_secret(props, key_response)
    elif e.response['Error']['Code'] == 'InvalidRequestException':
      if 'secret with this name is already scheduled for deletion' in e.response['Error']['Message'] and props['Restore'] == 'true':
        print('Secret is scheduled for deletion, restoring it')
        client = boto3.client('secretsmanager')
        client.restore_secret(SecretId=props['SecretName'])
        write_updated_secret(props, key_response)
      else:
        print("Unknown error updating secret, cleaning up access key: %s" % e.response['Error']['Code'])
        clean_up_access_key(props['UserName'], key_response['AccessKey']['AccessKeyId'])
        raise e
    else:
      print("Unknown error updating secret, cleaning up access key: %s" % e.response['Error']['Code'])
      clean_up_access_key(props['UserName'], key_response['AccessKey']['AccessKeyId'])
      raise e

def create_secret(props):
  iam = boto3.client('iam')
  
  key_response = iam.create_access_key(UserName=props['UserName'])
  
  return write_secret(props, key_response)

def update_secret(props):
  iam = boto3.client('iam')
  
  key_response = iam.create_access_key(UserName=props['UserName'])

  return write_updated_secret(props, key_response)
    
def on_event(event, context):
  print(event)
  request_type = event['RequestType']
  if request_type == 'Create': return on_create(event)
  if request_type == 'Update': return on_update(event)
  if request_type == 'Delete': return on_delete(event)
  raise Exception("Invalid request type: %s" % request_type)

def on_create(event):
  props = event["ResourceProperties"]
  print("create new resource with props %s" % props)
  
  secret = create_secret(props)

  return { 'PhysicalResourceId': '%s/%s' % (props['UserName'], secret['accessKeyId']), 'Data': { 'AccessKeyId': secret['accessKeyId'], 'SecretArn': secret['response']['ARN'] } }

def on_update(event):
  physical_id = event["PhysicalResourceId"]
  props = event["ResourceProperties"]
  old_props = event["OldResourceProperties"]
  print("update resource %s with props %s" % (physical_id, props))
  
  if old_props['Region'] != props['Region'] or old_props['SecretName'] != props['SecretName']:
    print("Secret name or region changed, deleting old secret")
    on_delete(event)
    return on_create(event)
  else:
    secret = update_secret(props)
    clean_up_access_key(old_props['UserName'], physical_id.split('/')[1])
    return { 'PhysicalResourceId': '%s/%s' % (props['UserName'], secret['accessKeyId']), 'Data': { 'AccessKeyId': secret['accessKeyId'], 'SecretArn': secret['response']['ARN'] } }
  

def on_delete(event):
  physical_id = event["PhysicalResourceId"]
  props = event["ResourceProperties"]
  print("delete resource %s" % physical_id)
  
  clean_up_access_key(props['UserName'], physical_id.split('/')[1])
  
  try:
    secrets_manager = boto3.client('secretsmanager')
    secrets_manager.delete_secret(SecretId=props['SecretName'])
  except ClientError as e:
    if e.response['Error']['Code'] == 'ResourceNotFoundException':
      print("Secret %s already deleted" % props['SecretName'])
  
  return { 'PhysicalResourceId': physical_id }

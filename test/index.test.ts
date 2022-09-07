import {
  Stack,
  App,
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
  });

  expect(Template.fromStack(stack)).toMatchSnapshot();
});
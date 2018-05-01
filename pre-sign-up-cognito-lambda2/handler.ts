import { CognitoUserPoolTriggerEvent, Callback, Context, Handler } from 'aws-lambda';
import { CognitoIdentityServiceProvider } from 'aws-sdk';
import { AWSError } from 'aws-sdk/lib/error';
import { preSignUp } from './my_modules/pre-signup-lambda-integration/pre-signup-integration-request-function';
import { SignUpUserEvent } from './advam_modules/pre-signup-lambda-integration/signup-userevent';

export const cognito = new CognitoIdentityServiceProvider();


export const PreSignUpHandler: Handler = (event: SignUpUserEvent, context: Context, callback: Callback) => {
	preSignUp(event, context, callback);	
}



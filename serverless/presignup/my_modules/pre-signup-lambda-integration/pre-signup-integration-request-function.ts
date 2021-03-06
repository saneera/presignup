import { Context } from 'aws-lambda';
import { SignUpUserEvent } from './signup-userevent';
import { ApiError} from './api-error';
import { CognitoIdentityServiceProvider} from 'aws-sdk';
import * as stringify from 'json-stable-stringify';

export type Callback = (err?: Error | string, data?: any) => void;
type UserAttribute = CognitoIdentityServiceProvider.Types.AttributeType;  
const getUserAttribute = (attributes: UserAttribute[], attributeName: string) => attributes ? attributes.filter(attribute => attribute.Name === attributeName)[0].Value : undefined;

export const cognito = new CognitoIdentityServiceProvider();
type existingUser = CognitoIdentityServiceProvider.UserType;

export const preSignUp = (newUser: SignUpUserEvent, context: any, callback: Callback) => {
 Promise.resolve().then(() =>{
    if (newUser.request.userAttributes.email_verified === 'false') {
      throw new ApiError(`email_verified = false for ${newUser.userName}`);
    }
    if (newUser.triggerSource === 'PreSignUp_ExternalProvider') {
      return getUserByAttribute('email', newUser.request.userAttributes.email, newUser.userPoolId)
      .then(existingUser => {
        if (existingUser.Enabled && existingUser.UserStatus === 'CONFIRMED' && existingUser.Attributes && existingUser.Username
        && getUserAttribute(existingUser.Attributes, 'email_verified') === 'true'){
          return linkUsers(newUser.userName, existingUser.Username, newUser.userPoolId);
        } else{
          console.error(stringify(existingUser));
          throw new ApiError(`invalid state for ${existingUser.Username}`);
        }        
      });
    } 
  })
  .then(() => callback(null, newUser))
  .catch(() =>{
    console.error(stringify([newUser]));
     callback('User signup is disabled');
  });  
  
};


const getUserByAttribute = (attributeName: string, attributeValue: string, userPoolId: string) => {
    return cognito.listUsers({
      UserPoolId: userPoolId,
      Filter: `${attributeName} = "${attributeValue}"`,
    }).promise()
      .then(data => {
        if(!data.Users) {
          throw new ApiError('Not Found', ['User not found'], 404);
        }
        const user = data.Users.filter(user => user.UserStatus !== 'EXTERNAL_PROVIDER')[0];
        if (user == null) {
          throw new ApiError('Not Found', ['User not found'], 404);
        }
        return user;
      });
};



 const linkUsers = (externalUsername: string, internalUsername: string, userPoolId: string, )=>{
  return cognito.adminLinkProviderForUser({
   UserPoolId: userPoolId,
   SourceUser: {
     ProviderName: externalUsername.split('_')[0],
     ProviderAttributeName: 'Cognito_Subject',
     ProviderAttributeValue: externalUsername.split('_')[1],
   },
   DestinationUser: {
     ProviderName: 'Cognito',
     ProviderAttributeValue: internalUsername,
   },
  }).promise();
  };
 
  

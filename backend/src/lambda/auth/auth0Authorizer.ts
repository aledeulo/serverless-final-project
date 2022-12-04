import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda';
import 'source-map-support/register';

import { verify } from 'jsonwebtoken';
import { createLogger } from '../../utils/logger';
// import Axios from 'axios';
// import { Jwt } from '../../auth/Jwt';
import { JwtPayload } from '../../auth/JwtPayload';

const logger = createLogger('auth');

// TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
// const jwksUrl = 'https://dev-deemk8gcid7irsnq.us.auth0.com/.well-known/jwks.json';
const certificate = `-----BEGIN CERTIFICATE-----
MIIDHTCCAgWgAwIBAgIJV1Xw9YdqdcIBMA0GCSqGSIb3DQEBCwUAMCwxKjAoBgNV
BAMTIWRldi1kZWVtazhnY2lkN2lyc25xLnVzLmF1dGgwLmNvbTAeFw0yMjEyMDIw
NTE5MzhaFw0zNjA4MTAwNTE5MzhaMCwxKjAoBgNVBAMTIWRldi1kZWVtazhnY2lk
N2lyc25xLnVzLmF1dGgwLmNvbTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoC
ggEBAMoLgdVq5ThjCmehuXpa0/YuG6xnq6GBi1E87eHLQMieMyAgE8bgUYHkk1xl
Grv85cC2lqbkIgQjgg/H6S6MReL84PIQe+wKCOyLsgiSxy6y3jTphEeu519sVHlQ
3DMnNAsHJI/nHvvyzZ7nwKPZ4ezitqDrXjy2ubnCy1N6UDQ2TDM6q60uGB6niB/o
kTKa/Sbdr6YdZLPhcxz8WbA2BORtPdLf4QcEnhJmXs1uAyvdLFFWpwdIosdDG0HJ
ywTwEfqeYmVoCm9JZX5yNTxCK05WPsQWws2CXHnoR/LiMOQ+F8dJCH0riVoed8uY
46PmhAiXDQO1VRB40e2aVNA2iG0CAwEAAaNCMEAwDwYDVR0TAQH/BAUwAwEB/zAd
BgNVHQ4EFgQUaZtGnQb4Sf/nXYYnUb9tTu5E0AkwDgYDVR0PAQH/BAQDAgKEMA0G
CSqGSIb3DQEBCwUAA4IBAQAGuJORxxydoHspFn/0RfrWmg0pKlwzYWxAGDr2fo0f
D24Jna+7qLZi3jKfE625kEycw9x7+Qs+GNDGUWk12KjlBVAdzDuwjTgIUf9IBb9Y
1k4zBRmiF49/l+UI2HunbpUBiOm8plJktr+YFjKEYmdW9K6dQvfrb2pf5QSCEDtn
UH0ypgZJA332Osm/jBS7qRLGocEw41ckKjQ33iSnU7LZ9vsMpg1Ug2BtWp1Wdrsc
vJThV8Q0RcgaNSmnGG3jJCNOfsyYVH4FFmZQeNRT6Zu8x+SYnVn9h4XYDzn0ihbQ
nF7NrRvXLFiZdAePVkFS1Y9nbe/DEV4o4ozSc3iVWKLO
-----END CERTIFICATE-----`;

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken);
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)
  // const jwt: Jwt = decode(token, { complete: true }) as Jwt

  // // TODO: Implement token verification
  // // You should implement it similarly to how it was implemented for the exercise for the lesson 5
  // // You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/

  // const res = Axios.get
  return verify(
    token, 
    certificate,
    { algorithms: ['RS256'] }
  ) as JwtPayload;
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header');

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header');

  const split = authHeader.split(' ');
  const token = split[1];

  return token;
}

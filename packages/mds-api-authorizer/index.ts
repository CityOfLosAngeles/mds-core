import express from 'express'
import jwtDecode from 'jwt-decode'
import { UUID } from '@mds-core/mds-types'

export interface ApiAuthorizerClaims {
  principalId: string
  scope: string
  provider_id: UUID
  user_email: string | null
}

const {
  TOKEN_PROVIDER_ID_CLAIM = 'https://ladot.io/provider_id',
  TOKEN_USER_EMAIL_CLAIM = 'https://ladot.io/user_email'
} = process.env

export type ApiAuthorizer = (req: express.Request) => ApiAuthorizerClaims | null

export const AuthorizationHeaderApiAuthorizer: ApiAuthorizer = req => {
  if (req.headers && req.headers.authorization) {
    const decode = ([scheme, token]: string[]): ApiAuthorizerClaims | null => {
      const decoders: { [scheme: string]: () => ApiAuthorizerClaims } = {
        bearer: () => {
          const {
            sub: principalId,
            scope,
            [TOKEN_PROVIDER_ID_CLAIM]: provider_id,
            [TOKEN_USER_EMAIL_CLAIM]: user_email,
            email,
            ...claims
          } = jwtDecode(token)
          return { principalId, scope, provider_id, user_email: user_email || email, ...claims }
        },
        basic: () => {
          const [principalId, scope] = Buffer.from(token, 'base64')
            .toString()
            .split('|')
          return { principalId, scope, provider_id: principalId, user_email: null }
        }
      }
      const decoder = decoders[scheme.toLowerCase()]
      return decoder ? decoder() : null
    }
    return decode(req.headers.authorization.split(' '))
  }
  return null
}

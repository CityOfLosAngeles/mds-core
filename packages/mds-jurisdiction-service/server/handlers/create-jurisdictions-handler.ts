/*
    Copyright 2019-2020 City of Los Angeles.

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

        http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
 */

import { ServiceResponse, ServiceResult, ServiceError } from '@mds-core/mds-service-helpers'
import { ValidationError, ConflictError } from '@mds-core/mds-utils'
import logger from '@mds-core/mds-logger'
import { CreateJurisdictionType, JurisdictionDomainModel } from '../../@types'
import { AsJurisdictionEntity, AsJurisdiction, isJurisdiction } from './utils'
import { JurisdictionRepository } from '../repository'

export const CreateJurisdictionsHandler = async (
  jurisdictions: CreateJurisdictionType[]
): Promise<ServiceResponse<JurisdictionDomainModel[], ValidationError | ConflictError>> => {
  try {
    const entities = await JurisdictionRepository.writeJurisdictions(jurisdictions.map(AsJurisdictionEntity))
    return ServiceResult(entities.map(AsJurisdiction()).filter(isJurisdiction))
  } catch (error) /* istanbul ignore next */ {
    logger.error('Error Creating Jurisdictions', error)
    return ServiceError(error instanceof ValidationError ? error : new ConflictError(error))
  }
}
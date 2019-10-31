import { merge } from 'lodash';
import loadTypeSchema from '../utils/schema';

import user from './user/user.resolver';

const types = ['user'];

export const schemaTypes = Promise.all(types.map(loadTypeSchema));

export const resolvers = merge({}, user);

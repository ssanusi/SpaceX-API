/* eslint-disable class-methods-use-this */
/* eslint-disable no-param-reassign */
import { SchemaDirectiveVisitor } from 'apollo-server';
import { defaultFieldResolver } from 'graphql';
import { ensureAuthenticated, verifyRole } from '../../utils/auth';

class AuthDirective extends SchemaDirectiveVisitor {
  visitObject(type) {
    this.ensureFieldsWrapped(type);
    type.requiredAuthRole = this.args.requires;
  }

  visitFieldDefinition(field, details) {
    this.ensureFieldsWrapped(details.objectType);
    field.requiredAuthRole = this.args.requires;
  }

  ensureFieldsWrapped(objectType) {
    if (objectType.authFieldsWrapped) return;
    objectType.authFieldsWrapped = true;

    const fields = objectType.getFields();
    let user;
    Object.keys(fields).forEach(fieldName => {
      const field = fields[fieldName];
      const { resolve = defaultFieldResolver } = field;
      field.resolve = async function(...args) {
        const requiredRole =
          field.requiredAuthRole || objectType.requiredAuthRole;

        if (!requiredRole) {
          return resolve.apply(this, args);
        }

        const context = args[2];
        user = await ensureAuthenticated(context);
        if (!verifyRole(user, requiredRole)) {
          throw new Error('You are not Authorized');
        }
        args[2] = { ...args[2], user };
        return resolve.apply(this, args);
      };
    });
  }
}

export default AuthDirective;

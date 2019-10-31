import { ApolloServer } from 'apollo-server';
import { schemaTypes, resolvers } from './types';
import models from './data/models';
import AuthDirective from './types/directives/AuthDirectives';

const schemaDirectives = {
  auth: AuthDirective
};
export default async function start() {
  const rootSchema = `
    schema {
      query: Query
      mutation: Mutation
    }
  `;
  const globalSchemaTypes = await schemaTypes;
  const server = new ApolloServer({
    typeDefs: [rootSchema, ...globalSchemaTypes],
    resolvers,
    schemaDirectives,
    context: async ({ req }) => ({ token: req.headers.authorization, models })
  });
  const PORT = process.env.PORT || 9000;
  const { url } = await server.listen({ port: PORT });
  console.log(`Apollo Server is ready at ${url}`);
}

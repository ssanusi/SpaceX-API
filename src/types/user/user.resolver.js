import { AuthenticationError, UserInputError } from 'apollo-server';
import {
  generateToken,
  sendEmail,
  generateResetToken,
  verifyResetToken
} from '../../utils/auth';

const getUser = (__, arg, { models, user }) => {
  let id;
  if (!arg.id) {
    id = user.id;
  } else {
    id = arg.id;
  }
  return models.User.findOne({
    where: { id }
  });
};
const getUsers = (__, args, { models }) => {
  return models.User.findAll();
};
const createUser = (__, args, { models }) => {
  return models.User.create(args.input, { returning: true });
};

const editUser = async (__, args, { models }) => {
  const [, updatedUser] = await models.User.update(args.input, {
    where: { id: args.id },
    returning: true
  });
  return updatedUser[0].dataValues;
};

const deleteUser = (__, args, { models }) => {
  const deletedUser = models.User.destroy({ where: { id: args.id } });
  if (!deletedUser) {
    throw new Error('Delete Operation unsucessful');
  }
  return { message: 'User Deleted Successfully' };
};

const signUp = async (__, args, { models }) => {
  try {
    const createdUser = await models.User.create(args.input, {
      returning: true
    });
    const { id, role } = createdUser.dataValues;
    const token = await generateToken({ id, role });
    return { token, createdUser, message: 'Your SignUp was Successful' };
  } catch (error) {
    throw new Error(error);
  }
};
const signIn = async (__, args, { models }) => {
  const { email, password } = args.input;
  const user = await models.User.findOne({
    where: { email }
  });
  const { id, role, password: hashPassword } = user.dataValues;
  if (!user) {
    throw new UserInputError('No user found with this login credentials.');
  }
  const verified = await user.validatePassword(password, hashPassword);
  if (!verified) {
    throw new AuthenticationError('Invalid Credential Provided');
  }

  return {
    token: generateToken({ id, role }),
    message: 'Login Successfully'
  };
};

const forgetPassword = async (__, arg, { models }) => {
  const user = await models.User.findOne({
    where: { email: arg.email }
  });
  if (!user) {
    throw new UserInputError('Email is not Registered');
  }
  const token = generateResetToken(user.dataValues.email);
  const message = await sendEmail(user.dataValues.email, token);
  return { message };
};

const resetPassword = async (__, args, { models }) => {
  const decoded = verifyResetToken(args.input.token);
  if (!decoded) {
    throw new UserInputError('Invalid Token');
  }
  const [, updatedPassword] = await models.User.update(
    { password: args.input.password },
    {
      where: { email: decoded.email },
      returning: true
    }
  );
  return {
    message: 'Password Reset Successfully',
    updatedUser: updatedPassword[0].dataValues
  };
};

export const addRole = async (__, args, { models }) => {
  const [, updatedRoles] = models.User.update(
    {
      role: args.input.role
    },
    {
      where: { id: args.input.id },
      returning: true
    }
  );
  return {
    message: 'Password Reset Successfully',
    updatedUser: updatedRoles[0].dataValues
  };
};

export default {
  Query: {
    getUser,
    getUsers,
    forgetPassword,
    signIn
  },
  Mutation: {
    createUser,
    editUser,
    deleteUser,
    signUp,
    resetPassword,
    addRole
  }
};

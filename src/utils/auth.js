import jwt from 'jsonwebtoken';
import sgMail from '@sendgrid/mail';
import models from '../data/models';

export const generateToken = payload => {
  return jwt.sign(payload, process.env.JWT_KEY, { expiresIn: '1d' });
};

export const generateResetToken = email => {
  return jwt.sign({ email }, process.env.JWT_PASSWORD_RESET, {
    expiresIn: '1d'
  });
};

export const verifyResetToken = token => {
  return jwt.verify(token, process.env.JWT_PASSWORD_RESET);
};
export const verifyToken = token => {
  return jwt.verify(token, process.env.JWT_KEY);
};

export const decodeToken = token => {
  return jwt.decode(token);
};

export const sendEmail = async (email, token) => {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  const msg = {
    to: email,
    from: 'oxbrain247@gmail.com',
    subject: 'Reset Password',
    text: 'You have requested password change token for reset',
    html: `<strong${token}</strong>`
  };
  await sgMail.send(msg);
  return `Reset Message Sent to ${email} and token ${token}`;
};

export const getUser = id => {
  const { User } = models;
  return User.findOne({
    where: { id }
  });
};

export const ensureAuthenticated = async context => {
  const { token } = context;
  if (!token) {
    throw new Error('Login with Valid Credential');
  }
  const verified = verifyToken(token);
  const { id } = verified;
  let user;
  if (verified) {
    user = await getUser(id);
  }
  return user.dataValues;
};

export const verifyRole = (user, requiresRole) => {
  if (user.role === requiresRole) {
    return true;
  }
  return false;
};

export const tokenToUser = async token => {
  const verified = verifyToken(token);
  const { id } = verified;
  let user;
  if (verified) {
    user = await getUser(id);
  }
  return user.dataValues;
};

import bcrypt from 'bcrypt';

const hash = password => bcrypt.hashSync(password, bcrypt.genSaltSync(10));
export default (sequelize, DataTypes) => {
  const User = sequelize.define(
    'User',
    {
      id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4
      },
      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            args: true,
            msg: 'firstName is Required'
          },
          min: {
            args: 3,
            msg: 'First Name Should Have Minimum of 3 character'
          }
        }
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            args: true,
            msg: 'lastName is Required'
          },
          min: {
            args: 3,
            msg: 'First Name Should Have Minimum of 3 character'
          }
        }
      },
      username: {
        type: DataTypes.STRING,
        unique: true,
        validate: {
          notEmpty: {
            args: true,
            msg: 'username is Required'
          },
          min: {
            args: 3,
            msg: 'User Name Should Have Minimum of 3 character'
          }
        }
      },
      email: {
        type: DataTypes.STRING,
        unique: true,
        validate: {
          notEmpty: {
            args: true,
            msg: 'email is Required'
          },
          isEmail: {
            args: true,
            msg: 'Provide a Valid Email'
          }
        }
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            args: true,
            msg: 'Password is Required'
          },
          len: {
            args: [8, 42],
            msg: 'Password length should be between 8 to 42 character'
          }
        }
      },
      role: {
        type: DataTypes.ENUM('admin', 'user'),
        allowNull: false,
        defaultValue: 'user'
      }
    },
    {}
  );
  User.associate = models => {
    // associations can be defined here
  };

  User.beforeCreate(user => {
    const hashPassword = hash(user.dataValues.password);
    user.password = hashPassword;
  });
  User.beforeBulkUpdate(user => {
    user.fields.forEach(item => {
      if (item === 'password') {
        const hashPassword = hash(user.attributes.password);
        user.attributes.password = hashPassword;
      }
    });
  });
  User.prototype.generatePasswordHash = user => {
    const saltRounds = 10;
    return bcrypt.hash(user.password, saltRounds);
  };
  User.prototype.validatePassword = async (password, hashPassword) => {
    return bcrypt.compare(password, hashPassword);
  };
  return User;
};

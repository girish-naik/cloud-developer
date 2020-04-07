import {Sequelize} from 'sequelize-typescript';
import { effectiveConfig } from './config/config';

// Instantiate new Sequelize instance!
export const sequelize = new Sequelize({
  "username": effectiveConfig.username,
  "password": effectiveConfig.password,
  "database": effectiveConfig.database,
  "host":     effectiveConfig.host,

  dialect: effectiveConfig.dialect,
  storage: ':memory:',
});


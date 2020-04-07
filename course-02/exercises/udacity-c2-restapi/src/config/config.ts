type Config = { [index: string]: {[index: string]:string} }
export const config : Config = {
  "local" : {
    "username": process.env.SQL_USERNAME,
    "password": process.env.SQL_PASSWORD,
    "database": process.env.SQL_DATABASE,
    "host": process.env.SQL_HOSTNAME,
    "dialect": process.env.SQL_DIALECT,
    "auth_salt": process.env.AUTH_SALT,
    "auth_jwt_secret": process.env.AUTH_JWT_SECRET,
    "aws_region": process.env.AWS_REGION,
    "aws_profile": process.env.AWS_PROFILE,
    "aws_media_bucket": process.env.AWS_MEDIA_BUCKET
  },
  "dev": {
  "username": process.env.DEV_SQL_USERNAME,
    "password": process.env.DEV_SQL_PASSWORD,
    "database": process.env.DEV_SQL_DATABASE,
    "host": process.env.DEV_SQL_HOSTNAME,
    "dialect": process.env.SQL_DIALECT,
    "aws_region": process.env.AWS_REGION,
    "aws_profile": process.env.AWS_PROFILE,
    "aws_media_bucket": process.env.AWS_MEDIA_BUCKET,
    "auth_salt": process.env.AUTH_SALT,
    "auth_jwt_secret": process.env.AUTH_JWT_SECRET,
  },
  "prod": {
    "username": process.env.PROD_SQL_USERNAME,
    "password": process.env.SQL_PASSWORD,
    "database": process.env.SQL_DATABASE,
    "host": process.env.SQL_HOSTNAME,
    "dialect": process.env.SQL_DIALECT,
    "aws_region": process.env.AWS_REGION,
    "aws_profile": process.env.AWS_PROFILE,
    "aws_media_bucket": process.env.AWS_MEDIA_BUCKET,
    "auth_salt": process.env.AUTH_SALT,
    "auth_jwt_secret": process.env.AUTH_JWT_SECRET,
  }
}

export const environment : string = process.env.UDAGRAM_ENV;
export const effectiveConfig = config[environment];
#!/bin/bash

function checkEnv() {
  if [[ -z "$DB_HOST" ]]; then
    echo "DB_HOST is not set"
    exit 1
  fi
  if [[ -z "$DB_NAME" ]]; then
    echo "DB_NAME is not set"
    exit 1
  fi
  if [[ -z "$DB_PORT" ]]; then
    echo "DB_PORT is not set"
    exit 1
  fi
  if [[ -z "$DB_USER" ]]; then
    echo "DB_USER is not set"
    exit 1
  fi
  if [[ -z "$DB_PASSWORD" ]]; then
    echo "DB_PASSWORD is not set"
    exit 1
  fi
  # Add checks for other environment variables if needed
}

function checkConnection() {
  echo "Connect MongoDB . . ."
  timeout 10 bash -c 'until printf "" 2>>/dev/null >>/dev/tcp/$0/$1; do sleep 1; done' $DB_HOST $DB_PORT
}

function configureServer() {
  if [ ! -f .env ]; then
    envsubst '${DB_HOST}
      ${DB_NAME}
      ${DB_PORT}
      ${DB_USER}
      ${DB_PASSWORD}
      ${THROTTLER_SHORT_NAME}
      ${THROTTLER_MEDIUM_NAME}
      ${THROTTLER_LONG_NAME}
      ${THROTTLER_SHORT_TTL}
      ${THROTTLER_MEDIUM_TTL}
      ${THROTTLER_LONG_TTL}
      ${THROTTLER_SHORT_LIMIT}
      ${THROTTLER_MEDIUM_LIMIT}
      ${THROTTLER_LONG_LIMIT}
      ${MAIL_HOST}
      ${MAIL_PORT}
      ${MAIL_SECURE}
      ${MAIL_IGNORE_TLS}
      ${MAIL_USER}
      ${MAIL_PASSWORD}
      ${MAIL_SENDER_NAME}
      ${MAIL_VERIFICATION_HOST}
      ${JWT_SECRECT_KEY}
      ${JWT_EXPIRES_IN}
      ${GOOGLE_CLIENT_ID}
      ${GOOGLE_CLIENT_SECRET}
      ${GOOGLE_AUTH_REDIRECT}
      ${FACEBOOK_APP_ID}
      ${FACEBOOK_APP_SECRET}
      ${FACEBOOK_AUTH_REDIRECT}
      ${APPLE_CLIENT_ID}
      ${APPLE_TEAM_ID}
      ${APPLE_KEY_ID}
      ${APPLE_PRIVATE_KEY}
      ${APPLE_AUTH_REDIRECT}
      ${RMQ_HOST}' \
      < docker/env.tmpl > .env
  fi
}
export -f configureServer

if [ "$1" = 'rollback' ]; then
  # Validate if DB_HOST is set.
  checkEnv
  # Validate DB Connection
  checkConnection
  # Configure server
  su pixfar -c "bash -c configureServer"

  # Configure server
  configureServer
  # Rollback Migrations
  echo "Rollback migrations"
  # Add your rollback command here
fi

if [ "$1" = 'start' ]; then
  # Validate if DB_HOST is set.
  checkEnv
  # Validate DB Connection
  checkConnection
  # Configure server

  # Configure server
  su pixfar -c "bash -c configureServer"

  configureServer
  # Run Migrations
  echo "Run migrations"
  # Add your migration command here

  # Start server
  echo "Starting the server..."
  # Add your command to start the server here
  su pixfar -c "node dist/main.js"
fi


# # Create necessary directories
# mkdir -p /home/pixfar/rikoul-server/uploads/bucket-category-image
# mkdir -p /home/pixfar/rikoul-server/uploads/surprise-bucket-image
# mkdir -p /home/pixfar/rikoul-server/uploads/user-profile-image

# # Set ownership to pixfar user
# chown -R pixfar:pixfar /home/pixfar/rikoul-server/uploads

# # Set read, write, and execute permissions for the owner
# # and read and execute permissions for the group and others
# chmod -R 777 /home/pixfar/rikoul-server/uploads

# Add any additional commands or configurations as needed

exec runuser -u pixfar "$@"
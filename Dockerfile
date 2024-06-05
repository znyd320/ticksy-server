# Stage 1: Build
FROM node:latest AS build
# Copy app
COPY . /home/pixfar/rikoul-server
WORKDIR /home/pixfar/
RUN cd rikoul-server \
    && npm install \
    && npm run build \
    && rm -fr node_modules \
    && npm install --only=production

# Stage 2: Final Image
FROM node:slim

# Install packages
RUN apt-get update && apt-get install -y gettext-base && apt-get clean

# Setup docker-entrypoint
COPY docker/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh

# Add non-root user
RUN useradd -ms /bin/bash pixfar
WORKDIR /home/pixfar/rikoul-server
COPY --from=build /home/pixfar/rikoul-server .

RUN chown -R pixfar:pixfar /home/pixfar
# set project directory
WORKDIR /home/pixfar/rikoul-server

RUN mkdir -p /home/pixfar/rikoul-server/uploads/bucket-category-image
RUN mkdir -p /home/pixfar/rikoul-server/uploads/surprise-bucket-image
RUN mkdir -p /home/pixfar/rikoul-server/uploads/user-profile-image


RUN chmod -R 777 /home/pixfar/rikoul-server/uploads

# Expose port
EXPOSE 3000

# Ensure entrypoint script is executable
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["start"]
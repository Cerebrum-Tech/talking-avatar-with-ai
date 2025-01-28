# Step 1: Use an official Node.js runtime as a parent image to build the app
FROM node:22 AS build

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json .

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the TypeScript code
RUN npm run build

# Step 2: Download and extract the Rhubarb Lip Sync binaries
FROM alpine:3.14 AS rhubarb

# Install curl and unzip
RUN apk --no-cache add curl unzip

# Set the working directory in the container
WORKDIR /tmp

# Download the zip file
RUN curl -L -o rhubarb.zip https://github.com/DanielSWolf/rhubarb-lip-sync/releases/download/v1.13.0/Rhubarb-Lip-Sync-1.13.0-Linux.zip

# Extract the zip file
RUN unzip rhubarb.zip

# Step 3: Create the final image with Node.js, Rhubarb and FFmpeg
FROM node:22

# Install ffmpeg and clean up unnecessary apt files to reduce image size
RUN apt-get update && apt-get install -y ffmpeg && apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy the package.json file to retain the metadata of dependencies in final image
COPY --from=build /usr/src/app/package*.json ./

# Copy the built application from the build stage
COPY --from=build /usr/src/app/dist ./dist

# Copy node_modules from the build stage
COPY --from=build /usr/src/app/node_modules ./node_modules

# Copy the extracted Rhubarb binaries
COPY --from=rhubarb /tmp/Rhubarb-Lip-Sync-1.13.0-Linux /usr/src/app/bin

# Ensure the binaries have execute permission
RUN chmod +x /usr/src/app/bin/*

# Set the environment variable for the port
ENV PORT=3000

# Expose the port the app runs on
EXPOSE 3000

# Command to run the application
CMD ["node", "dist/server.js"]
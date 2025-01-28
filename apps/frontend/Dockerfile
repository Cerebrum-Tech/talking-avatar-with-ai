# Step 1: Build the React app with Vite
# Use an official Node.js runtime as a parent image
FROM node:22 AS build

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code including the public folder
COPY . .

# Build the React app with Vite
RUN npm run build

# Step 2: Serve the React app with Nginx
# Use an official Nginx image as a parent image
FROM nginx:alpine

# Copy the build output from the previous stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy the public folder
COPY --from=build /app/public /usr/share/nginx/html

# Expose the port the app runs on
EXPOSE 80

# Command to run Nginx which will serve the static files
CMD ["nginx", "-g", "daemon off;"]
# Step 1: Use the official Nginx image as the base image
FROM nginx:alpine

# Step 2: Remove the default static files served by Nginx
RUN rm -rf /usr/share/nginx/html/*

# Step 3: Copy your project files into the Nginx web root directory
COPY . /usr/share/nginx/html

# Step 4: Expose the default HTTP port (80)
EXPOSE 80

# Step 5: Start Nginx when the container starts
CMD ["nginx", "-g", "daemon off;"]

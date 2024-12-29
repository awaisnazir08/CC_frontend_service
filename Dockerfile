# Step 1: Use an official Nginx image
FROM nginx:alpine

# Step 2: Copy the local files into the container
COPY ./ /usr/share/nginx/html

# Step 3: Expose port 80
EXPOSE 80

# Step 4: Start Nginx server
CMD ["nginx", "-g", "daemon off;"]

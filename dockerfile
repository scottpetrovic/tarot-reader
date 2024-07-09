FROM nginx:alpine

# copy contents of public build into nginx container
# need to do a 'npm run build' on the project to generate a dist folder with final contents
COPY ./tarot-reader/dist /usr/share/nginx/html



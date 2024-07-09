FROM nginx:alpine

# copy contents of public build into nginx container
COPY ./tarot-reader /usr/share/nginx/html


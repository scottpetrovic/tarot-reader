TODO List
----------
- reference "Tarot mystery" for super nintendo for visual ideas
- Get feedback on things.
- how/where to host this for more sharing on game dev channel?


## Running instructions for web project

go into folder in command line and run commmands
    npm install
    npm run dev


Now open a web browser to the URL you say and it should start working



# Start Ollama web server locally

Need to install ollama from location (https://ollama.com/download)

If ollama is not running, you can manually run it with the following command in the command line:

    ollama serve

There is a default port that ollama web server runs on, so you shouldn't have to change anything on the web server


## Building things

to build the project run the following:
    npm run build



## Docker related things to get running
Create a docker image for the project. Open a command line and go to this README.md folder. Run
    sudo docker build . -t tarot-reader:latest
    
Run the docker image. 
- "-d" makes the container run detached from the command line
- "-p" port to expose out to the internet. Right side is port in container, left side is external port to expose
- the "tarot-reader:latest" will be what you 'tagged' it in the build command above

    sudo docker run -d -p 44123:80 tarot-reader:latest
    
    
When running the docker container and needing to expose the port for cloudflare, you will use the RIGHT port number. If it is something like 80, you will not need to specify it in the cloudflare setup.
 


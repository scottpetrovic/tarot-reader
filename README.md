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


## Building Tarot Reader NPM project for serving to web

to build the project, make sure you are in the root > tarot-reader folder, then run the following:
    npm run build

This will create a "dist" folder that has all the final files

## Build and run docker container on linux server
These instructions are for building a docker image to deploy. Instructions are for linux. Make sure you are at the root level of the project with the Dockerfile present.

Open a command line and go to this README.md folder. Run
    sudo docker build . -t tarot-reader:latest
    
Run the docker image. 
- "-d" makes the container run detached from the command line
- "-p" port to expose out to the internet. Right side is port in container, left side is external port to expose
- the "tarot-reader:latest" will be what you 'tagged' it in the build command above

    sudo docker run -d -p 44123:80 tarot-reader:latest
    
    
When running the docker container and needing to expose the port for cloudflare, you will use the RIGHT port number. If it is something like 80, you will not need to specify it in the cloudflare setup.
 

 # Dependency - Ollama AI web server
 You need an ollama web server that does the AI processing for the large language model (LLM). There is a default docker container image we can use for this. We will need to modify it slightly to allow our domain access. Otherwise we run into cross domain issues.

 You can see available docker images here: https://hub.docker.com/search?q=ollama

 My web server has an AMD GPU, so I use the 'rocm' version denoted with the rocm tag.

    sudo docker run -d --env OLLAMA_ORIGINS="louvus.com,scottpetrovic.com" -p 11434:11434 ollama/ollama:rocm  
   

## Docker name and installin a model
You have a running docker container now. Docker will auto-generate a container name like "mystifying_mendeleev" when it is ran.  You can find your running docker NAME this way
    
    sudo docker ps -a

The Ollama docker image doesn't come with any AI models installed, so if you try to use it now you will get errors saying there is nothing found to chat with. You have to install AI models manually. We need to go into our running container and install one. We will install the llama3 model
    
    sudo docker exec -it <CONTAINERNAME> ollama run llama3

After the terminal says the model is installed you can type "/exit" to get out of the ollama command and exit out of the container.





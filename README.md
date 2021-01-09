# Slack OOO App
This is an app built using Node.js and Slack API that allows users to set their profiles to OOO for a specified period of time and set it back to normal.

## Setup
### Requirements
- Node
- ngrok
- Yarn/node
- Slack app
- Slack API User and Bot tokens

### Steps
- clone this repo
- create a slack app through https://api.slack.com/
- create a .env file from .sample.env
- run the node app using `yarn start:dev`
- run ngrok to expose the local url with `./ngrok http 3000`
- add the ngrok url to the slack slash command and the interactive component
- install the slack app in your preferred worspace

## Endpoints
| Endpoints                 | Method  | Description                                         |
|---------------------------|---------|-----------------------------------------------------|
|  /                        | POST    | responds with a slack welcome message block         |
|  /slack-interactive       | POST    | cancels or sets OOO profile (slash command route)   | 


## Hosting
App hosted on Google Cloud Platform
Make requests to https://slack-ooo-gcp.ew.r.appspot.com

## Demo
![screen-recorder-sat-jan-09-2021-19-55-36 (online-video-cutter com) (2)](https://user-images.githubusercontent.com/28973383/104105870-02d76f80-52ba-11eb-9453-51c48edea99e.gif)

## Testing
(to be added)

## Documentation
(to be added)

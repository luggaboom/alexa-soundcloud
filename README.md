# Alexa-SoundCloud

This skill can be run on AWS Lambda to let you play songs by artists on SoundCloud® as well as discover new music by genre.

## How to Run

1. Clone the project and package the skill:
```bash
git clone https://github.com/luggaboom/alexa-soundcloud.git
cd js
npm install
zip -r ../alexa-soundcloud.zip *
```

Follow instructions here: https://github.com/alexa/skill-sample-nodejs-audio-player/blob/mainline/README.md

In addition to the above, you'll need to request API Access from SoundCloud® at https://docs.google.com/forms/d/e/1FAIpQLSfNxc82RJuzC0DnISat7n4H-G7IsPQIdaMpe202iiHZEoso9w/viewform

This is unaffiliated with SoundCloud®. This was based off of the sample skill linked above.
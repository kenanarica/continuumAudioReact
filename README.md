## React Continuum WebAudioRecorder(WAR)

### How it works: 

* Most of the recording code is just copied from the original WAR without react, but I've streamlined and beautified the code a little bit.
* The WARecorder component maintains a state of a `recording` boolean. While not crucial, it's nice for updating buttons and text labels.
* More importantly, it maintains an array of download links. These links get formatted into a nice list when it's time to render. 
* That's mostly it, the biggest challenge I faced on this mini-project was the issue of scope- a lot of times I had to change functions to arrow functions or bind stuff to `this`. It's one of those things that takes frustratingly long to figure out.  
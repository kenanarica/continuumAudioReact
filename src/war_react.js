import React from 'react';

/*
Structure:
    WARecorder has state aspect recording, which should control an onscreen label
    WARecorder returns a download link. Was originally going to be an audio element too, but that's not necessary. 
*/

// global variables for the startRecording function.
// stream_copy is completely necessary, but I'm not sure that rec_obj needs to be global.  
var stream_copy;
var rec_obj;

function ListRecordings(props) {
  const listOfLinks = props.listOfLinks;

  if (listOfLinks.length > 0) { 
      const sublist  = listOfLinks.map((elt, i) => <li key={i}> {listOfLinks[i]} </li>);
      // return it
      return <div> <h1> Links: </h1> {sublist} </div>;
  } else {
      // Otherwise, give them a notice about it
      return <h1>Links to audio will appear here</h1>;
  }
}


class WARecorder extends React.Component { 
    
    constructor(props) {        

        //always gotta call super(props) but I forgot why 
        super(props);
        
        //WARecorder maintains a boolean if it's recording
        //As well as a list of <a> elements that get compiled by renderLinks()
        this.state = { 
            recording : false,
            downloads : []
        }
        
        //Both of these eventListeners have to be bound to this to use react calls like setState()

        var startButton = document.getElementById("startButton");
        startButton.addEventListener("click", function() {
            
          console.log("Start pressed");
            this.setState({
                recording : true
            })
            this.startRecording();
            
        }.bind(this));
        

        var stopButton = document.getElementById("stopButton");
        stopButton.addEventListener("click", function() {
            
            console.log("Stop pressed");
            startButton.disabled = false;
            document.getElementById("statusLabel").innerHTML = 'Not recording.';
            this.stopRecording();

        }.bind(this));
    
        

    } //enf of WARecorder constructor

    // render out our links from an array of link objects
    renderLinks(listOfLinks) {
        // go through every link if they exist
        if (listOfLinks.length > 0) { 
            var sublist = new Array();
            for (var i = 0; i < listOfLinks.length; i++) {
                // give them their own little div
                var linkobj = <li key={i}> 
                    {listOfLinks[i]}
                </li>
                // push it
                sublist.push(linkobj);

            }
            //return it
            return <div> 
                <h1> Links: </h1>
                {sublist} 
            </div>;

        } else {
            // Otherwise, give them a notice about it
            return <h1>Links to audio will appear here</h1>;
        }

    }
    
    //THIS IS LUC'S CODE, I DID NOT WRITE IT. THANK YOU LUC <3 
    niceDate() {
      function pad(number) {
        if (number < 10) {
          return '0' + number;
        }
        return number;
      }
      let aDate = new Date();
      return aDate.getFullYear() +
          '-' + pad(aDate.getMonth() + 1) +
          '-' + pad(aDate.getDate()) +
          ' ' + pad(aDate.getHours()) +
          ':' + pad(aDate.getMinutes()) +
          ':' + pad(aDate.getSeconds())
    }


    createLinkDiv(blob, index) {
      // generate a download link and name for our blob
      var url = URL.createObjectURL(blob);
      var fname = index + "-" + this.niceDate() + ".mp3";
      return <a href={url} download = {fname}> {fname} </a>;
    }

    // startRecording was changed to an arrow function because the default 'function' method wouldn't
    // include any kind of scope.
    // Ex. I couldn't call setState, use state variables, or renderLinks()
    startRecording() {
        // Request access to record w/mic
        navigator.mediaDevices.getUserMedia( {audio : true, video : false } ).then(stream =>  { 
          console.log(this.state.recording);
          // Make our stream copy
          stream_copy = stream;

          // audioContext now declared inside getUserMedia :)
          var audioContext = new AudioContext;
      
          var input = audioContext.createMediaStreamSource(stream);
            
          // I hard-coded mp3, but it can use .ogg as well. 
          rec_obj = new WebAudioRecorder(input, {
            workerDir    : "javascripts/",
            encoding     : "mp3",
            
            // Diagnostic event listeners
            onEncoderLoading: function(rec_obj, encoding) {
              // show "loading encoder..." display 
              console.log("Loading " + encoding + " encoder...");
            },
      
            onEncoderLoaded: function(rec_obj, encoding) {
              // hide "loading encoder..." display 
              console.log(encoding + " encoder loaded");
            }
            
          } ); //end constructor for rec_obj
          
          rec_obj.onComplete = (rec_obj, blob) => {
            console.log("onComplete called");
            // Create our download link
            var newListOfDownloads = this.state.downloads;
            var linkToPush = this.createLinkDiv(blob, newListOfDownloads.length);
            newListOfDownloads.push(linkToPush);
            this.setState({
              recording : false,
              downloads : newListOfDownloads
            })
          }
      
          // 20 minute max recording, hard coded mp3 available.
          // ogg can be swapped with mp3 in the rec_obj constructor json above.
          rec_obj.setOptions({
            timeLimit: 1200,
            encodeAfterRecord: true, 
            ogg: {
                quality: 0.75
            },
            mp3: {
                bitRate: 192
            }
          });

          rec_obj.startRecording()
          startButton.disabled = true;
        }) //end getUserMedia()
        
      } // end startRecording()

      stopRecording() { 
        // stop our stream
        if (stream_copy) {
          stream_copy.getAudioTracks()[0].stop()
        }
        // call our recorder's stop function
        if (rec_obj) {
          rec_obj.finishRecording()
        }
      }

  
    render() {
      // If we're recording, disable the start button.
      // This could have been done in the startButton onClick listener, but I think it's cool to do it statewise.
      if (this.state.recording) { 
          var label = document.getElementById("statusLabel").innerHTML = 'Recording.';
          document.getElementById("startButton").disabled = true;
      }
      return <ListRecordings listOfLinks={this.state.downloads} />;
    }
}

export default WARecorder;
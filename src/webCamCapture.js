import React from "react";
import Webcam from "react-webcam";
import AWS from 'aws-sdk/dist/aws-sdk-react-native';
import base64 from 'base64-js';

require('dotenv').config();

var options = {
    accessKeyId: process.env.REACT_APP_accessKeyId,
    secretAccessKey: process.env.REACT_APP_secretAccessKey,
    region: 'eu-west-1'
}

var rekognition = new AWS.Rekognition(options);
var sourceImage, targetImage;

class WebcamCapture extends React.Component {
    setRef = webcam => {
      this.webcam = webcam;
      rekognition.listCollections().promise()
      .then(data => {
          console.log("DATA:", data);
          if(data.CollectionIds.length == 0) {
              return rekognition.createCollection({ "CollectionId": "LASC"}).promise();
          }
      })
      .catch(err => {
          console.log("ERR:", err)
      })

    };
   
    captureB = () => {
      const imageSrc = this.webcam.getScreenshot();
      const tmpArray = imageSrc.split(',')
      tmpArray.shift()
      sourceImage = base64.toByteArray(tmpArray.join());
      console.log("Source captured, Calling AWS")
      rekognition.searchFacesByImage({
          "CollectionId": "LASC",
          "FaceMatchThreshold": 85,
          "Image": {
              "Bytes": sourceImage
          }
      }).promise()
      .then(data => {
        console.log("MATCHING:", data)
        if(data.FaceMatches.length == 0) {
            console.log("Storing Image data");
            return rekognition.indexFaces({
                "CollectionId": "LASC",
                "Image": {
                    "Bytes": sourceImage
                },
                "MaxFaces": 1
            }).promise()
        }
        else
            console.log("Face already recorded")
      })
      .catch(err => {
          console.log("ERR", err)
      })
    };
   
    compare = () => {
        const imageSrc = this.webcam.getScreenshot();
        const tmpArray = imageSrc.split(',')
        tmpArray.shift()
        targetImage = base64.toByteArray(tmpArray.join());
        console.log("Target captured")
        console.log("Calling AWS...")
        rekognition.searchFacesByImage({
            "CollectionId": "LASC",
            "FaceMatchThreshold": 85,
            "Image": {
                "Bytes": targetImage
            }
        }).promise()
        .then(data => {
          console.log("MATCHING:", data)
            if(data.FaceMatches.length == 0) {
                console.log("No Match Found");
            }
            else
                console.log("Face Match Detected")
        })
        .catch(err => {
            console.log("ERR", err)
        })
        
    }

    purgeCollection = () => {
        rekognition.deleteCollection({
            "CollectionId": "LASC"
        }).promise()
        .then(() => {
            console.log("All Image data purged")
            return rekognition.createCollection({ "CollectionId": "LASC"}).promise();

        })
        .catch((err) => {
            console.log("ERROR:", err)
        })
    }
     
    render() {
      const videoConstraints = {
        width: 1280,
        height: 720,
        facingMode: "user"
      };
   
      return (
        <div>
          <Webcam
            audio={false}
            height={350}
            ref={this.setRef}
            screenshotFormat="image/jpeg"
            width={350}
            videoConstraints={videoConstraints}
          />
          <button onClick={this.captureB}>Capture Reference photo</button>
          <button onClick={this.compare}>Capture &amp; Compare photos</button>
          <button onClick={this.purgeCollection}>Purge photos</button>
        </div>
      );
    }
  }
  
export default WebcamCapture;
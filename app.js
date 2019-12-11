//const url = 'ws://127.0.0.1:8082/';

/*
 1) Read websocket stream
 2) Stream to posenet
 3) Posenet can broadcast over websocket
 */


//const player = new JSMpeg.Player(url, {canvas: canvas});

var imageScaleFactor = 0.2;
var outputStride = 16;
var flipHorizontal = false;

var imageElement = document.getElementById("img");
imageElement.width = 1024;
imageElement.height = 768;

const video = imageElement;
const canvas = document.querySelector("canvas");
canvas.width = imageElement.width;
canvas.height = imageElement.height;

const ctx = canvas.getContext("2d");

navigator.mediaDevices
    .getUserMedia({
        audio: false,
        video: {
            height: imageElement.height,
            width: imageElement.width,
            facingMode: "user"
        }
    })
    .then(function(stream) {
        video.srcObject = stream;
    })
    .catch(function(err0r) {
        console.log(err0r.message);
        console.log("Something went wrong!");
    });

const parts = {
    nose: {},
    leye: {},
    reye: {},
    lear: {},
    rear: {}
};

video.addEventListener("play", () => {
    posenet
        .load()
        .then(function(net) {
            console.log("Model loaded");
            const v = document.querySelector("video");
            setInterval(() => {
                net
                    .estimateSinglePose(v, imageScaleFactor, flipHorizontal, outputStride)
                    .then(function(pose) {
                        ctx.fillStyle = "red";

                        pose.keypoints.forEach(k => {
                            if (k.part == "nose" && k.score > 0.8) parts.nose = k;
                            if (k.part == "leftEye" && k.score > 0.8) parts.leye = k;
                            if (k.part == "rightEye" && k.score > 0.8) parts.reye = k;
                        });

                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                        ctx.drawImage(
                            imageElement,
                            0,
                            0,
                            imageElement.width * imageScaleFactor,
                            imageElement.height * imageScaleFactor,
                            0,
                            0,
                            imageElement.width * imageScaleFactor,
                            imageElement.height * imageScaleFactor
                        );
                        ctx.drawImage(imageElement, 0, 0);
                        Object.keys(parts).forEach(k => {
                            const part = parts[k];
                            if (!part.position) return;
                            const size = 10;
                            ctx.fillRect(
                                part.position.x - size / 2,
                                part.position.y - size / 2,
                                size,
                                size
                            );
                        });
                    });
            }, 100);
        })

        .catch(err => {
            console.log(err.message);
        });
});

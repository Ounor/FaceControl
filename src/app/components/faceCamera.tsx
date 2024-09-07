import * as faceapi from 'face-api.js';
import React, { useEffect, useRef, useState } from 'react';

interface Emotions {
    angry: number;
    disgusted: number;
    fearful: number;
    happy: number;
    neutral: number;
    sad: number;
    surprised: number;
}


const FaceCamera = (props: any) => {
    const [modelsLoaded, setModelsLoaded] = useState<boolean>(false);
    const [captureVideo, setCaptureVideo] = useState<boolean>(true);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    // Загрузка моделей
    useEffect(() => {
        startVideo()

        const loadModels = async () => {
            const MODEL_URL = '/models';
            Promise.all([
                faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
                faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
                faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
                faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
            ]).then(() => setModelsLoaded(true));
        };
        loadModels();
    }, []);

    const startVideo = () => {
        setCaptureVideo(true);
        navigator.mediaDevices
            .getUserMedia({ video: { width: 300 } })
            .then((stream) => {
                const video = videoRef.current;
                if (video) {
                    video.srcObject = stream;
                }
            })
            .catch((err) => {
                console.error("Error accessing webcam:", err);
            });
    };

    const getDominantEmotion = (emotions: Emotions): keyof Emotions => {
        let maxEmotion: keyof Emotions = 'neutral'; // Начальное значение
        let maxValue = -Infinity;

        if (emotions) {
            for (const [emotion, value] of Object.entries(emotions)) {
                if (value > maxValue) {
                    maxValue = value;
                    maxEmotion = emotion as keyof Emotions;
                }
            }
        }


        return maxEmotion;
    };


    // Обработка воспроизведения видео
    const handleVideoOnPlay = () => {
        setInterval(async () => {
            if (canvasRef.current && videoRef.current) {
                const video = videoRef.current;

                const detections = await faceapi
                    .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
                    .withFaceLandmarks()
                    .withFaceExpressions() || 'neutral';


                props.onChangeEmotion(getDominantEmotion(detections[0]?.expressions))

            }
        }, 100);
    };

    return (
        <div>
            {captureVideo ?
                modelsLoaded ?
                    <div>
                        <video
                            onPlay={handleVideoOnPlay}
                            className="aspect-square rounded-full" ref={videoRef} autoPlay
                            id="videoElement"/>


                        <canvas ref={canvasRef} style={{position: 'absolute'}}/>
                    </div>
                    :
                    <div>Загрузка...</div>
                :
                <></>}
        </div>
    );
}

export default FaceCamera;

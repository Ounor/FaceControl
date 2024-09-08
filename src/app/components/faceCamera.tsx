import * as faceapi from 'face-api.js';
import React, { useEffect, useRef, useState } from 'react';
import { unstable_noStore as noStore } from 'next/cache';

interface Emotions {
    angry: number;
    disgusted: number;
    fearful: number;
    happy: number;
    neutral: number;
    sad: number;
    surprised: number;
}

interface Props {
    onChangeEmotion: (emotion: string) => void;
    wrong: boolean;
    success: boolean;
}

const FaceCamera = (props: Props) => {
    noStore();

    const [modelsLoaded, setModelsLoaded] = useState<boolean>(false);
    const [captureVideo, setCaptureVideo] = useState<boolean>(true);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    // Загрузка моделей
    useEffect(() => {
        startVideo();

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

    const handleVideoOnPlay = () => {
        setInterval(async () => {
            if (canvasRef.current && videoRef.current) {
                const video = videoRef.current;

                const detections = await faceapi
                    .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
                    .withFaceLandmarks()
                    .withFaceExpressions();

                if (detections?.length) {
                    props.onChangeEmotion(getDominantEmotion(detections[0]?.expressions));
                }
            }
        }, 100);
    };

    // Генерация классов для анимаций в зависимости от состояния
    const videoClassName = props.success
        ? 'video-shadow-success'
        : props.wrong
            ? 'video-shake'
            : '';

    return (
        <div>
            {captureVideo ? (
                modelsLoaded ? (
                    <div>
                        <video
                            onPlay={handleVideoOnPlay}
                            className={`aspect-square rounded-full ${videoClassName}`}
                            ref={videoRef}
                            autoPlay
                            id="videoElement"
                        />
                        <canvas ref={canvasRef} style={{ position: 'absolute' }} />
                    </div>
                ) : (
                    <div>Загрузка...</div>
                )
            ) : (
                <></>
            )}
        </div>
    );
};

export default FaceCamera;

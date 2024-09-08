import React, {useEffect, useState} from 'react';
import AudioController from '@/app/components/audioController';
import FaceCamera from "@/app/components/faceCamera";

type Emotion = 'surprised' | 'happy' | 'neutral';

interface Circle {
    lane: number;
    position: number;
    emotion: Emotion;
}

const lanes = [0, 1, 2]; // Три полосы

const Game: React.FC = () => {
    const [circles, setCircles] = useState<Circle[]>([]);
    const [lastBeatTime, setLastBeatTime] = useState<number>(0);
    const [score, setScore] = useState<number>(0);
    const [BPM, setBPM] = useState(0);
    const [currentEmotion, setCurrentEmotion] = useState<string>('neutral');
    const [success, setSuccess] = useState<boolean>(false); // Состояние успеха
    const [wrong, setWrong] = useState<boolean>(false); // Состояние ошибки
    const speed = 2; // Скорость движения кругов

    const beatInterval = 120 / BPM;

    // Обновление игрового таймера каждую секунду
    useEffect(() => {
        const timer = setInterval(() => {
            console.log(currentEmotion)

            setCircles((prevCircles) => {
                return prevCircles.filter(circle => {
                    if (circle.position > 80) {
                        if ( circle.emotion === currentEmotion ) {
                            setSuccess(true);
                            setWrong(false)
                            setScore(prevScore => prevScore + 100);
                            return false;
                        } else if (circle.emotion !== currentEmotion) {
                            setWrong(true); // Устанавливаем ошибку
                            setSuccess(false); // Устанавливаем успех
                            setScore(prevScore => prevScore > 0 ? prevScore - 50 : 0);
                            setTimeout(() => setWrong(false), 1000); // Через 2 секунды сбрасываем ошибку
                            return false;

                        }
                    }
                    return true;
                });
            });
        }, 100);

        return () => clearInterval(timer); // Очищаем таймер при размонтировании компонента
    }, [currentEmotion]);

    const getRandomEmotion = (): Emotion => {
        const emotions: Emotion[] = ['surprised', 'happy', 'neutral'];
        return emotions[Math.floor(Math.random() * emotions.length)];
    };

    const handleTimeUpdate = (currentTime: number) => {
        if (currentTime - lastBeatTime >= beatInterval) {
            const randomLane = Math.floor(Math.random() * lanes.length);
            setCircles((prevCircles) => [
                ...prevCircles,
                { lane: randomLane, position: 0, emotion: getRandomEmotion() }
            ]);
            setLastBeatTime(currentTime);
        }
    };


    useEffect(() => {
        const interval = setInterval(() => {
            setCircles((prevCircles) =>
                prevCircles
                    .map(circle => ({
                        ...circle,
                        position: circle.position + speed
                    }))
                    .filter(circle => circle.position < 100)
            );
        }, 50);

        return () => clearInterval(interval);
    }, []);

    const handleKeyPress = (event: KeyboardEvent) => {
        const keyMap: Record<string, number> = {
            'a': 0,
            's': 1,
            'd': 2
        };

        const pressedLane = keyMap[event.key];
        if (pressedLane !== undefined) {
            setCircles((prevCircles) => {
                let hit = false;
                const updatedCircles = prevCircles.filter(circle => {
                    if (
                        circle.lane === pressedLane &&
                        circle.position > 80 &&
                        circle.position < 100
                    ) {
                        hit = true;
                        const accuracy = 1 - Math.abs(circle.position - 90) / 10;
                        setScore(prevScore => prevScore + Math.floor(accuracy * 100));
                        setSuccess(true); // Устанавливаем успех
                        setTimeout(() => setSuccess(false), 2000); // Через 2 секунды сбрасываем успех
                        return false;
                    }
                    return true;
                });

                if (!hit) {
                    setWrong(true); // Устанавливаем ошибку
                    setTimeout(() => setWrong(false), 2000); // Через 2 секунды сбрасываем ошибку
                    console.log("Мимо!");
                }
                return updatedCircles;
            });
        }
    };

    useEffect(() => {
        window.addEventListener('keydown', handleKeyPress);
        return () => {
            window.removeEventListener('keydown', handleKeyPress);
        };
    }, []);

    const handleSetBpm = (value: number) => setBPM(value);

    const renderCircleEmotion = (emotion: Emotion) => {
        switch (emotion) {
            case 'surprised':
                return '😯';
            case 'happy':
                return '😃';
            case 'neutral':
                return '😐';
            default:
                return '😐';
        }
    };

    return (
        <div className="flex flex-col items-center z-1">
            <div className="mb-4 text-2xl font-bold">Счет: {score}</div>
            <AudioController onSetBPM={handleSetBpm} onTimeUpdate={handleTimeUpdate} />
            <div className="flex">
                {lanes.map((lane) => (
                    <div key={lane} className="w-24 h-96 bg-gray-800 m-2 relative overflow-hidden">
                        {circles
                            .filter((circle) => circle.lane === lane)
                            .map((circle, index) => (
                                <div
                                    key={index}
                                    className="absolute w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-2xl"
                                    style={{ top: `${circle.position}%`, left: '25%' }}
                                >
                                    {renderCircleEmotion(circle.emotion)}
                                </div>
                            ))}
                    </div>
                ))}
            </div>
            <FaceCamera success={success} wrong={wrong} onChangeEmotion={setCurrentEmotion} />

        </div>
    );
};

export default Game;

"use client"
import React, { useState, useEffect } from 'react';
import AudioController from './audioController';

// Определение типов
interface Circle {
    lane: number;
    position: number;
}

const lanes = [0, 1, 2]; // Три полосы

const Game: React.FC = ({setAudioSrc, audioSrc}) => {
    const [circles, setCircles] = useState<Circle[]>([]);
    const [lastBeatTime, setLastBeatTime] = useState<number>(0);
    const [score, setScore] = useState<number>(0); // Добавляем состояние для счета
    const speed = 2; // Скорость движения кругов
    const [BPM, setBPM] = useState(0);
    const beatInterval = 60 / BPM; // Время между тактами в секундах

    // Функция вызывается при обновлении времени аудио
    const handleTimeUpdate = (currentTime: number) => {
        // Рассчитываем, когда должен появиться следующий круг
        if (currentTime - lastBeatTime >= beatInterval) {
            const randomLane = Math.floor(Math.random() * lanes.length);
            setCircles((prevCircles) => [
                ...prevCircles,
                { lane: randomLane, position: 0 }
            ]);
            setLastBeatTime(currentTime); // Обновляем время последнего такта
        }
    };

    // Обновление позиции кругов
    useEffect(() => {
        const interval = setInterval(() => {
            setCircles((prevCircles) =>
                prevCircles
                    .map(circle => ({
                        ...circle,
                        position: circle.position + speed
                    }))
                    .filter(circle => circle.position < 100) // Удаляем круги, которые вышли за пределы экрана
            );
        }, 50);

        return () => clearInterval(interval);
    }, []);

    // Обработчик нажатия клавиш
    const handleKeyPress = (event: KeyboardEvent) => {
        const keyMap: Record<string, number> = {
            'a': 0, // левая полоса
            's': 1, // средняя полоса
            'd': 2  // правая полоса
        };

        const pressedLane = keyMap[event.key];
        if (pressedLane !== undefined) {
            setCircles((prevCircles) => {
                let hit = false;
                const updatedCircles = prevCircles.filter(circle => {
                    // Проверяем, если круг находится в пределах допустимого диапазона
                    if (
                        circle.lane === pressedLane &&
                        circle.position > 80 &&
                        circle.position < 100
                    ) {
                        hit = true;
                        // Чем ближе к 90%, тем больше очков начисляем
                        const accuracy = 1 - Math.abs(circle.position - 90) / 10;
                        setScore(prevScore => prevScore + Math.floor(accuracy * 100)); // Начисляем очки
                        return false; // Убираем круг после попадания
                    }
                    return true; // Оставляем остальные круги
                });

                if (!hit) {
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

    const handleSetBpm = (value: number) =>  setBPM(value);


    return (
        <div className="flex flex-col items-center z-1">
            {/* Вывод текущего счета */}
            <div className="mb-4 text-2xl font-bold">Счет: {score}</div>
            <AudioController onSetBPM={handleSetBpm} onTimeUpdate={handleTimeUpdate} setAudioSrc={setAudioSrc} audioSrc={audioSrc}/>
            <div className="flex">
                {lanes.map((lane) => (
                    <div key={lane} className="w-24 h-96 bg-gray-800 m-2 relative overflow-hidden">
                        {/* Круги */}
                        {circles
                            .filter((circle) => circle.lane === lane)
                            .map((circle, index) => (
                                <div
                                    key={index}
                                    className="absolute w-12 h-12 bg-blue-500 rounded-full"
                                    style={{ top: `${circle.position}%`, left: '25%' }}
                                ></div>
                            ))}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Game;

"use client";

import React, { useEffect, useRef, useState } from 'react';
import { analyze } from 'web-audio-beat-detector';
import {
    Upload,
    Button,
    Typography,
    Progress,
    message,
    List,
    Space
} from 'antd';
import {
    PauseOutlined,
    PlayCircleOutlined,
    UploadOutlined
} from '@ant-design/icons';
import AudioSpectrum from "react-audio-spectrum";
import useWindowDimensions from "@/app/helpers/useWindowDimensions";

// Интерфейс для пропсов
interface AudioControllerProps {
    onTimeUpdate: (currentTime: number) => void;
    onSetBPM: (bpm: number) => void;
}

// Интерфейс для песни (файла)
interface Song {
    file: File;
    delay: number;
    bpm: number | null;
}

// Разрешенные аудиофайлы
const audioFileTypes = ['.mp3', '.wav', '.aac', '.ogg', '.flac'];

// Функция для создания случайной задержки
const getRandomDelay = (): number => {
    return Math.floor(Math.random() * 3000) + 2000; // Задержка от 2 до 4 секунд
};

// Компонент AudioController с типизацией
const AudioController: React.FC<AudioControllerProps> = ({ onTimeUpdate, onSetBPM }) => {
    const audioElementRef = useRef<HTMLAudioElement | null>(null);
    const [songs, setSongs] = useState<Song[]>([]); // Массив песен с типизацией
    const [uploading, setUploading] = useState<boolean>(false); // Статус загрузки
    const [progress, setProgress] = useState<number>(0); // Прогресс загрузки
    const [audioSrc, setAudioSrc] = useState<string | undefined>(undefined); // Хранит путь к выбранному аудиофайлу
    const {  width } = useWindowDimensions();

    useEffect(() => {
        const handleTimeUpdate = () => {
            if (audioElementRef.current) {
                onTimeUpdate(audioElementRef.current.currentTime); // Передаем текущее время аудиофайла
            }
        };

        if (audioElementRef.current) {
            audioElementRef?.current.addEventListener('timeupdate', handleTimeUpdate);
        }
        return () => {
            if (audioElementRef.current) {
                // eslint-disable-next-line react-hooks/exhaustive-deps
                audioElementRef?.current.removeEventListener('timeupdate', handleTimeUpdate);
            }
        };
    }, [onTimeUpdate]);


    // Округление значения BPM
    const roundBPM = (value: number): number => {
        return Math.round(value * 10) / 10;
    };

    // Функция анализа песни и определения BPM
    const analyse = async (song: Song) => {
        const { file, delay } = song;

        const audioContext = new AudioContext();
        const reader = new FileReader();

        reader.onloadstart = () => {
            setUploading(true);
            setProgress(0);
        };

        reader.onprogress = (event: ProgressEvent<FileReader>) => {
            if (event.lengthComputable) {
                const percent = Math.round((event.loaded / event.total) * 100);
                setProgress(percent);
            }
        };

        reader.onload = async () => {
            await new Promise((resolve) => setTimeout(resolve, delay)); // Задержка перед анализом

            if (reader.result instanceof ArrayBuffer) {
                const audioBuffer = await audioContext.decodeAudioData(reader.result);
                const tempo = await analyze(audioBuffer);
                const bpm = roundBPM(tempo);

                setUploading(false);
                setProgress(0);

                onSetBPM(bpm);

                setSongs((prevSongs) =>
                    prevSongs.map((s) => (s.file === file ? { ...s, bpm } : s))
                );

                message.success(`${file.name} проанализирован и готов!`);
            }
        };

        reader.onerror = () => {
            message.error('Ошибка при чтении файла.');
        };

        if (file instanceof Blob) {
            reader.readAsArrayBuffer(file);
        } else {
            console.error('Ошибка файла');
        }
    };

    // Функция для воспроизведения аудио
    const playAudio = () => {
        if (audioElementRef.current) {
            audioElementRef.current.play();
        }
    };

    // Функция для паузы аудио
    const pauseAudio = () => {
        if (audioElementRef.current) {
            audioElementRef.current.pause();
        }
    };

    // Функция для обработки загрузки файла
    const handleFileUpload = (file: File) => {
        if (file) {
            const fileURL = URL.createObjectURL(file); // Создаем URL для локального аудиофайла
            setAudioSrc(fileURL); // Устанавливаем аудиофайл как источник
        }
        const extension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
        if (!audioFileTypes.includes(extension)) {
            message.error('Неверный формат. Выберите другой файл (MP3, WAV).');
            return;
        }

        const song: Song = {
            file,
            delay: getRandomDelay(),
            bpm: null
        };

        setSongs((prevSongs) => [...prevSongs, song]);

        analyse(song);
    };

    return (
        <div className={'content-center'}>
            <div className=''>

            {!songs.length && (
                <Upload
                    beforeUpload={() => false}
                    // @ts-ignore
                    onChange={(info) => handleFileUpload(info.file)}
                    showUploadList={false}
                    accept={audioFileTypes.join(',')}
                >
                    <Button icon={<UploadOutlined />} disabled={uploading}>
                        Выбери песню
                    </Button>
                </Upload>
            )}

            {songs.length > 0 && (
                <div className={'flex-row flex content-center justify-between'}>
                    <Space>
                        <Button onClick={playAudio} icon={<PlayCircleOutlined />}>
                            Играть
                        </Button>
                    </Space>
                    <Space>
                        <Button onClick={pauseAudio} icon={<PauseOutlined />}>
                            Пауза
                        </Button>
                    </Space>
                </div>
            )}

            {uploading && (
                <div className="progress-container w-full content-center mv-15">
                    <Progress
                        percent={progress}
                        size={[300, 20]}
                    />
                </div>
            )}

            {songs.length > 0 && !uploading && (
                <List
                    dataSource={songs}
                    renderItem={(song) => (
                        <List.Item>
                            <Space>
                                <Typography.Text className={'text-gray-50'}>
                                    {song.file.name}
                                </Typography.Text>
                                {song.bpm && (
                                    <Typography.Text className={'text-white'}>
                                        BPM: {song.bpm}
                                    </Typography.Text>
                                )}
                            </Space>
                        </List.Item>
                    )}
                />
            )}
            </div>

            <div className={'opacity-25 pointer-events-none absolute w-full bottom-0 left-0 z-0'}>
                <audio id={'audio-element'} ref={audioElementRef} src={audioSrc} preload="auto"></audio>

                <AudioSpectrum
                    id="audio-canvas"
                    height={600}
                    width={width}
                    audioId={'audio-element'}
                    capColor={'red'}
                    capHeight={2}
                    meterWidth={2}
                    meterCount={256}
                    meterColor={[
                        {stop: 0, color: '#f00'},
                        {stop: 0.5, color: '#0CD7FD'},
                        {stop: 1, color: 'red'}
                    ]}
                    gap={14}
                />
            </div>
        </div>
    );
};

export default AudioController;

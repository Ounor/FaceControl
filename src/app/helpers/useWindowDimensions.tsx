'use client'
import { useState, useEffect } from 'react';

// Интерфейс для размеров окна
interface WindowDimensions {
    width: number;
    height: number;
}

export default function useWindowDimensions(): WindowDimensions {
    // Функция для получения размеров окна
    function getWindowDimensions(windowObj: (Window & typeof globalThis) | undefined) {
        const width =  windowObj?.innerWidth || 0;
        const height = windowObj?.innerHeight || 0;
        return {
            width,
            height,
        };
    }

    const [windowDimensions, setWindowDimensions] = useState<WindowDimensions>();


    useEffect(() => {
        // Обновляем размеры окна при монтировании
        setWindowDimensions(getWindowDimensions(window));

        function handleResize() {
            setWindowDimensions(getWindowDimensions(window));
        }

        window.addEventListener('resize', handleResize);

        // Очищаем обработчик при размонтировании
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return windowDimensions as WindowDimensions;
}

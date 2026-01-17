'use client';

import { useEffect, useState } from 'react';
import { trackView, ViewData } from '@/lib/api/analytics';

// Hook to track page views
export function useTrackView(contentType: ViewData['contentType'], contentId?: string) {
    useEffect(() => {
        trackView({
            contentType,
            contentId,
            timestamp: new Date(),
        });
    }, [contentType, contentId]);
}

// Hook to manage favorites
export function useFavorite(contentType: string, contentId: string) {
    const [isFavorited, setIsFavorited] = useState(false);
    const [favoriteCount, setFavoriteCount] = useState(0);

    useEffect(() => {
        // Check if favorited
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        const key = `${contentType}-${contentId}`;
        setIsFavorited(favorites.includes(key));

        // Get count (in real implementation, this would be from backend)
        setFavoriteCount(favorites.includes(key) ? 1 : 0);
    }, [contentType, contentId]);

    const toggleFavorite = () => {
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        const key = `${contentType}-${contentId}`;

        if (favorites.includes(key)) {
            const filtered = favorites.filter((f: string) => f !== key);
            localStorage.setItem('favorites', JSON.stringify(filtered));
            setIsFavorited(false);
            setFavoriteCount(prev => Math.max(0, prev - 1));
        } else {
            favorites.push(key);
            localStorage.setItem('favorites', JSON.stringify(favorites));
            setIsFavorited(true);
            setFavoriteCount(prev => prev + 1);
        }
    };

    return { isFavorited, favoriteCount, toggleFavorite };
}

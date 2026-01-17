// Dummy API functions - Replace with actual backend calls later

export interface ViewData {
    contentType: 'home' | 'blog' | 'project' | 'memory' | 'hobby' | 'resume';
    contentId?: string;
    timestamp: Date;
}

export interface FavoriteData {
    contentType: 'blog' | 'project' | 'memory';
    contentId: string;
}

// Track page/section views
export async function trackView(data: ViewData): Promise<void> {
    // TODO: Replace with actual API call
    console.log('Tracking view:', data);

    // Dummy implementation - store in localStorage for now
    const views = JSON.parse(localStorage.getItem('views') || '[]');
    views.push({ ...data, timestamp: new Date().toISOString() });
    localStorage.setItem('views', JSON.stringify(views));
}

// Get view count for content
export async function getViewCount(contentType: string, contentId?: string): Promise<number> {
    // TODO: Replace with actual API call
    const views = JSON.parse(localStorage.getItem('views') || '[]');
    return views.filter((v: any) =>
        v.contentType === contentType && (!contentId || v.contentId === contentId)
    ).length;
}

// Add favorite/like
export async function addFavorite(data: FavoriteData): Promise<void> {
    // TODO: Replace with actual API call
    console.log('Adding favorite:', data);

    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    const key = `${data.contentType}-${data.contentId}`;

    if (!favorites.includes(key)) {
        favorites.push(key);
        localStorage.setItem('favorites', JSON.stringify(favorites));
    }
}

// Remove favorite/like
export async function removeFavorite(data: FavoriteData): Promise<void> {
    // TODO: Replace with actual API call
    console.log('Removing favorite:', data);

    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    const key = `${data.contentType}-${data.contentId}`;
    const filtered = favorites.filter((f: string) => f !== key);
    localStorage.setItem('favorites', JSON.stringify(filtered));
}

// Get favorite count for content
export async function getFavoriteCount(contentType: string, contentId: string): Promise<number> {
    // TODO: Replace with actual API call
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    const key = `${contentType}-${contentId}`;
    return favorites.includes(key) ? 1 : 0;
}

// Check if content is favorited
export async function isFavorited(contentType: string, contentId: string): Promise<boolean> {
    // TODO: Replace with actual API call
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    const key = `${contentType}-${contentId}`;
    return favorites.includes(key);
}

// Get analytics overview
export async function getAnalytics() {
    // TODO: Replace with actual API call
    const views = JSON.parse(localStorage.getItem('views') || '[]');
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');

    return {
        totalViews: views.length,
        totalFavorites: favorites.length,
        viewsByType: views.reduce((acc: any, v: any) => {
            acc[v.contentType] = (acc[v.contentType] || 0) + 1;
            return acc;
        }, {}),
    };
}

// Example blog API functions
export async function getBlogPosts() {
    // TODO: Replace with actual API call
    return [];
}

export async function getBlogPost(slug: string) {
    // TODO: Replace with actual API call
    return null;
}

// Example project API functions
export async function getProjects() {
    // TODO: Replace with actual API call
    return [];
}

export async function getProject(id: string) {
    // TODO: Replace with actual API call
    return null;
}

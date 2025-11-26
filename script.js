// Configuration
const NOVELS = [
    {
        id: 'genius_grandson',
        title: 'Genius Grandson of the Loan Shark King',
        // Point to the optimized index file
        file: 'data/optimized/genius_grandson/index.json', 
        description: 'Cheon Tae-san, cucu dari Raja Rentenir, kembali untuk mengambil alih segalanya.',
        coverColor: '#ef4444' // Red
    },
    {
        id: 'lazy_sovereign',
        title: 'The Lazy Sovereign',
        file: 'data/optimized/lazy_sovereign/index.json',
        description: 'Kisah seorang penguasa yang malas namun memiliki kekuatan luar biasa.',
        coverColor: '#3b82f6' // Blue
    },
    {
        id: 'nano_machine',
        title: 'Nano Machine',
        file: 'data/optimized/nano_machine/index.json',
        description: 'Cheon Yeo-woon, seorang anak haram yang mendapatkan Nano Machine dari masa depan.',
        coverColor: '#10b981' // Green
    }
];

// State
let currentNovel = null;
let currentChapterIndex = 0;
let chapters = [];

// DOM Elements
const themeToggleBtn = document.getElementById('theme-toggle');
const rootElement = document.documentElement;

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    
    const path = window.location.pathname;
    
    // Robust routing for GitHub Pages (handles subpaths)
    if (path.endsWith('index.html') || path.endsWith('/') || path.split('/').pop() === '') {
        initHomePage();
    } else if (path.endsWith('novel.html')) {
        initNovelPage();
    } else if (path.endsWith('chapter.html')) {
        initChapterPage();
    } else {
        // Fallback for root path if not caught above
        initHomePage();
    }
});

// Theme Logic
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const currentTheme = rootElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            setTheme(newTheme);
        });
    }
}

function setTheme(theme) {
    rootElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
}

// Home Page Logic
function initHomePage() {
    const grid = document.getElementById('novel-grid');
    if (!grid) return;

    grid.innerHTML = ''; // Clear loading spinner

    NOVELS.forEach(novel => {
        const card = document.createElement('a');
        card.href = `novel.html?id=${novel.id}`;
        card.className = 'novel-card';
        card.innerHTML = `
            <div class="novel-cover-placeholder" style="background: linear-gradient(135deg, ${novel.coverColor}, #1f2937)">
                ${novel.title.charAt(0)}
            </div>
            <div class="novel-info">
                <h3 class="novel-title">${novel.title}</h3>
                <p class="novel-meta">${novel.description}</p>
            </div>
        `;
        grid.appendChild(card);
    });
}

// Novel Detail Page Logic
async function initNovelPage() {
    const params = new URLSearchParams(window.location.search);
    const novelId = params.get('id');
    const novelConfig = NOVELS.find(n => n.id === novelId);

    if (!novelConfig) {
        alert('Novel tidak ditemukan!');
        window.location.href = 'index.html';
        return;
    }

    // Update Header Info
    document.getElementById('novel-title').textContent = novelConfig.title;
    document.getElementById('novel-desc').textContent = novelConfig.description;

    // Fetch Data (Index only)
    try {
        const response = await fetch(novelConfig.file);
        if (!response.ok) throw new Error('Gagal memuat data');
        const data = await response.json();
        
        // Render Chapter List
        const listContainer = document.getElementById('chapter-list');
        listContainer.innerHTML = ''; // Clear loading

        // Data structure is now { id, total_chapters, chapters: [...] }
        const chapterList = data.chapters || [];

        chapterList.forEach((chapter) => {
            const item = document.createElement('a');
            item.href = `chapter.html?id=${novelId}&chapter=${chapter.index}`;
            item.className = 'chapter-item';
            item.innerHTML = `
                <span>${chapter.title}</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
            `;
            listContainer.appendChild(item);
        });

    } catch (error) {
        console.error(error);
        document.getElementById('chapter-list').innerHTML = '<p>Gagal memuat daftar chapter. Pastikan Anda menjalankan website ini menggunakan server lokal (bukan file://).</p>';
    }
}

// Chapter Page Logic
async function initChapterPage() {
    const params = new URLSearchParams(window.location.search);
    const novelId = params.get('id');
    const chapterIndex = parseInt(params.get('chapter'));
    const novelConfig = NOVELS.find(n => n.id === novelId);

    if (!novelConfig || isNaN(chapterIndex)) {
        window.location.href = 'index.html';
        return;
    }

    // Setup Back Link
    const backBtn = document.getElementById('back-to-novel');
    backBtn.href = `novel.html?id=${novelId}`;

    // Fetch Individual Chapter Data
    try {
        // Construct path to specific chapter file
        // e.g., data/optimized/genius_grandson/chapters/0.json
        const chapterFile = `data/optimized/${novelId}/chapters/${chapterIndex}.json`;
        
        const response = await fetch(chapterFile);
        if (!response.ok) throw new Error('Chapter tidak ditemukan');
        const chapter = await response.json();
        
        // Render Content
        document.getElementById('chapter-title').textContent = chapter.title;
        
        // Format content: replace newlines with paragraphs
        const contentHtml = chapter.content
            .split('\n')
            .filter(line => line.trim() !== '')
            .map(line => `<p>${line}</p>`)
            .join('');
            
        document.getElementById('chapter-content').innerHTML = contentHtml;

        // Setup Navigation
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');

        // We need to know total chapters to disable "Next" button correctly.
        // Ideally we fetch index.json first, but for speed we can just check if next chapter exists or handle 404.
        // Or we can pass total chapters in URL. 
        // For now, let's just enable them and let the user hit a wall (or handle error).
        // Better: Fetch index.json lightly or just assume. 
        // Let's assume we can navigate.
        
        if (chapterIndex > 0) {
            prevBtn.href = `chapter.html?id=${novelId}&chapter=${chapterIndex - 1}`;
            prevBtn.classList.remove('disabled');
        } else {
            prevBtn.classList.add('disabled');
        }

        // Check if next chapter exists by trying to fetch it? No, too many requests.
        // Let's just enable it. If it 404s, the initChapterPage will handle it (redirect or error).
        nextBtn.href = `chapter.html?id=${novelId}&chapter=${chapterIndex + 1}`;
        nextBtn.classList.remove('disabled');

        // Settings Toggle
        const settingsBtn = document.getElementById('settings-toggle');
        const settingsPanel = document.getElementById('settings-panel');
        
        if (settingsBtn && settingsPanel) {
            settingsBtn.addEventListener('click', () => {
                settingsPanel.classList.toggle('active');
            });
        }

        // Font Size Logic
        const fontSizeBtns = document.querySelectorAll('.font-size-btn');
        const contentArea = document.getElementById('chapter-content');
        
        // Load saved font size
        const savedFontSize = localStorage.getItem('fontSize') || '18px';
        contentArea.style.fontSize = savedFontSize;

        fontSizeBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const size = e.target.dataset.size;
                let newSize;
                if (size === 'small') newSize = '16px';
                if (size === 'medium') newSize = '18px';
                if (size === 'large') newSize = '22px';
                
                contentArea.style.fontSize = newSize;
                localStorage.setItem('fontSize', newSize);
            });
        });

    } catch (error) {
        console.error(error);
        document.getElementById('chapter-content').innerHTML = '<p>Gagal memuat konten chapter.</p>';
    }
}

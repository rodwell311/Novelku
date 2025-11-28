// Configuration
const NOVELS = [
    {
        id: 'genius_grandson',
        title: 'Genius Grandson of the Loan Shark King',
        // Point to the optimized index file
        file: 'data/optimized/genius_grandson/index.json', 
        description: 'Cheon Tae-san, cucu dari Raja Rentenir, kembali untuk mengambil alih segalanya.',
        coverColor: '#ef4444', // Red (Fallback)
        image: 'images/genius_grandson.png'
    },
    {
        id: 'lazy_sovereign',
        title: 'The Lazy Sovereign',
        file: 'data/optimized/lazy_sovereign/index.json',
        description: 'Kisah seorang penguasa yang malas namun memiliki kekuatan luar biasa.',
        coverColor: '#3b82f6', // Blue (Fallback)
        image: 'images/lazy_sovereign.png'
    },
    {
        id: 'nano_machine',
        title: 'Nano Machine',
        file: 'data/optimized/nano_machine/index.json',
        description: 'Cheon Yeo-woon, seorang anak haram yang mendapatkan Nano Machine dari masa depan.',
        coverColor: '#10b981', // Green (Fallback)
        image: 'images/nano_machine.png'
    },
    {
        id: 'investor_future',
        title: 'An Investor Who Sees Future',
        file: 'data/optimized/investor_future/index.json',
        description: 'Seiring berjalannya waktu, saya menjadi dewasa, dan saya tiba di masa depan yang saya impikan sebagai seorang anak. Namun tidak ada yang berubah secara signifikan...',
        coverColor: '#F59E0B', // Gold/Amber
        image: 'images/investor_future.png'
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

    initBackToTop();
});

// Back to Top Logic
function initBackToTop() {
    const btn = document.createElement('button');
    btn.className = 'back-to-top';
    btn.ariaLabel = 'Kembali ke Atas';
    btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 15l-6-6-6 6"/></svg>';
    document.body.appendChild(btn);

    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            btn.classList.add('visible');
        } else {
            btn.classList.remove('visible');
        }
    });

    btn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

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
        
        let coverHtml;
        if (novel.image) {
            coverHtml = `<img src="${novel.image}" alt="${novel.title}" class="novel-cover-image">`;
        } else {
            coverHtml = `
                <div class="novel-cover-placeholder" style="background: linear-gradient(135deg, ${novel.coverColor}, #1f2937)">
                    ${novel.title.charAt(0)}
                </div>
            `;
        }

        card.innerHTML = `
            ${coverHtml}
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
        const sortBtn = document.getElementById('sort-btn');
        let isReversed = false;

        // Data structure is now { id, total_chapters, chapters: [...] }
        const chapterList = data.chapters || [];

        function renderChapters() {
            listContainer.innerHTML = ''; // Clear list
            
            const chaptersToRender = [...chapterList]; // Copy array
            if (isReversed) {
                chaptersToRender.reverse();
            }

            chaptersToRender.forEach((chapter) => {
                const item = document.createElement('a');
                item.href = `chapter.html?id=${novelId}&chapter=${chapter.index}`;
                item.className = 'chapter-item';
                item.innerHTML = `
                    <span>${chapter.title}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                `;
                listContainer.appendChild(item);
            });
        }

        // Initial Render
        renderChapters();

        // Check for saved progress
        const savedProgress = getReadingProgress(novelId);
        if (savedProgress) {
            // Create Container for Alignment
            const btnContainer = document.createElement('div');
            btnContainer.style.maxWidth = '800px';
            btnContainer.style.margin = '0 auto 1.5rem auto';
            btnContainer.style.width = '100%';
            btnContainer.style.display = 'flex'; // To allow button to size itself
            
            const resumeBtn = document.createElement('a');
            resumeBtn.href = `chapter.html?id=${novelId}&chapter=${savedProgress.chapterIndex}`;
            resumeBtn.className = 'nav-btn';
            resumeBtn.style.display = 'inline-flex';
            resumeBtn.style.alignItems = 'center';
            resumeBtn.style.gap = '0.5rem';
            resumeBtn.style.width = 'auto'; // Override full width
            resumeBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                Lanjutkan: ${savedProgress.chapterTitle || 'Chapter ' + (savedProgress.chapterIndex + 1)}
            `;
            
            btnContainer.appendChild(resumeBtn);
            
            // Insert before chapter list section or inside it
            const chapterSection = document.querySelector('.chapter-list-section');
            if (chapterSection) {
                chapterSection.insertBefore(btnContainer, chapterSection.firstChild);
            }
        }

        // Sort Button Logic
        if (sortBtn) {
            sortBtn.addEventListener('click', () => {
                isReversed = !isReversed;
                renderChapters();
                
                // Update Button Text/Icon
                const btnText = sortBtn.querySelector('span');
                const btnIcon = sortBtn.querySelector('svg');
                
                if (isReversed) {
                    btnText.textContent = 'Terlama';
                    btnIcon.innerHTML = '<path d="M11 5h10"></path><path d="M11 9h10"></path><path d="M11 13h10"></path><path d="M3 17l3 3 3-3"></path><path d="M6 18V4"></path>'; 
                    btnIcon.style.transform = 'scaleY(-1)';
                } else {
                    btnText.textContent = 'Terbaru';
                    btnIcon.style.transform = 'none';
                }
            });
        }

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
        const chapterFile = `data/optimized/${novelId}/chapters/${chapterIndex}.json`;
        
        const response = await fetch(chapterFile);
        if (!response.ok) throw new Error('Chapter tidak ditemukan');
        const chapter = await response.json();
        
        // Render Content
        document.getElementById('chapter-title').textContent = chapter.title;
        
        const contentHtml = chapter.content
            .split('\n')
            .filter(line => line.trim() !== '')
            .map(line => `<p>${line}</p>`)
            .join('');
            
        document.getElementById('chapter-content').innerHTML = contentHtml;

        // Save Progress
        saveReadingProgress(novelId, chapterIndex, chapter.title);

        // Setup Navigation
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');

        // Total chapters logic is tricky without index.json, but we can rely on error handling or just enable buttons
        // For better UX, we could fetch index.json to check total chapters, but let's keep it simple for now.
        // We'll just check if index > 0 for prev.
        
        if (prevBtn) {
            if (chapterIndex > 0) {
                prevBtn.href = `chapter.html?id=${novelId}&chapter=${chapterIndex - 1}`;
                prevBtn.classList.remove('disabled');
                prevBtn.style.opacity = '1';
                prevBtn.style.pointerEvents = 'auto';
            } else {
                prevBtn.classList.add('disabled');
                prevBtn.style.opacity = '0.5';
                prevBtn.style.pointerEvents = 'none';
            }
        }

        if (nextBtn) {
            // We don't know max chapters here easily without fetching index. 
            // Let's assume there is a next chapter. If user clicks and it 404s, we handle it.
            // Ideally we should pass total chapters or fetch it.
            // Let's just enable it.
            nextBtn.href = `chapter.html?id=${novelId}&chapter=${chapterIndex + 1}`;
            nextBtn.classList.remove('disabled');
            nextBtn.style.opacity = '1';
            nextBtn.style.pointerEvents = 'auto';
        }

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
        document.getElementById('chapter-content').innerHTML = `<p class="error-msg">Gagal memuat chapter. ${error.message}</p>`;
    }
}

// Progress Saving Logic
function saveReadingProgress(novelId, chapterIndex, chapterTitle) {
    const history = JSON.parse(localStorage.getItem('novel_history') || '{}');
    history[novelId] = {
        chapterIndex: chapterIndex,
        chapterTitle: chapterTitle,
        lastRead: Date.now()
    };
    localStorage.setItem('novel_history', JSON.stringify(history));
}

function getReadingProgress(novelId) {
    const history = JSON.parse(localStorage.getItem('novel_history') || '{}');
    return history[novelId];
}

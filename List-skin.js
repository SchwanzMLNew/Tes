// ============ DATABASE LOADER ============
let listSkin = [];
let skinDataLoaded = false;

// Fungsi untuk load data dari JSON
async function loadSkinsFromDatabase() {
    try {
        console.log('📡 Loading skins from database...');
        const response = await fetch('data/skins.json?v=' + Date.now());
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data && data.skins && Array.isArray(data.skins)) {
            listSkin = data.skins;
            skinDataLoaded = true;
            console.log(`✅ Successfully loaded ${listSkin.length} skins from database`);
            
            // Trigger render setelah data loaded
            if (typeof renderMiniCard === 'function') {
                renderMiniCard();
            }
            if (typeof displaySkinDetailFromGlobal === 'function') {
                displaySkinDetailFromGlobal();
            }
            if (typeof renderAllSkins === 'function') {
                renderAllSkins();
            }
            
            return listSkin;
        } else {
            throw new Error('Invalid data format');
        }
    } catch (error) {
        console.error('❌ Failed to load database:', error);
        console.log('📦 Using fallback data...');
        
        // Fallback data jika JSON gagal load
        listSkin = getFallbackData();
        skinDataLoaded = true;
        
        if (typeof renderMiniCard === 'function') renderMiniCard();
        if (typeof displaySkinDetailFromGlobal === 'function') displaySkinDetailFromGlobal();
        
        return listSkin;
    }
}

// Fallback data (sama seperti data sebelumnya)
function getFallbackData() {
    return [
        {
            id: 1,
            image: "https://ik.imagekit.io/SchwanzML13/20260507_221604.jpg",
            date: "08 Mei 2026",
            title: "Akai Luckybox Revamp",
            videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ?si=abc123",
            replaceItems: [
                { name: "Default", desc: "", downloadUrl: "https://sfl.gl/w6LWKW" },
                { name: "Elite", desc: "", downloadUrl: "https://sfl.gl/36TXawVI" }
            ]
        },
        {
            id: 2,
            image: "https://ik.imagekit.io/SchwanzML13/maxresdefault.jpg",
            date: "29 Apr 2026",
            title: "Aulus Special Revamp",
            videoUrl: "https://www.youtube.com/embed/cr7k4YBK_PQ",
            replaceItems: [
                { name: "Default", desc: "", downloadUrl: "https://sfl.gl/z7Nu" },
                { name: "Basic", desc: "", downloadUrl: "https://sfl.gl/W0nC35" }
            ]
        }
    ];
}

// Fungsi untuk parsing tanggal
function parseDate(dateStr) {
    const months = {
        Jan: 0, Feb: 1, Mar: 2, Apr: 3, Mei: 4, May: 4, Jun: 5,
        Jul: 6, Agu: 7, Aug: 7, Sep: 8, Okt: 9, Oct: 9, Nov: 10, Des: 11, Dec: 11
    };
    const parts = dateStr.split(" ");
    if (parts.length === 3) {
        const [day, monthStr, year] = parts;
        const month = months[monthStr];
        if (month !== undefined) {
            return new Date(year, month, parseInt(day));
        }
    }
    return new Date(0);
}

// Escape HTML
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// Generate tabel replace
function generateReplaceTable(replaceItems) {
    if (!replaceItems || replaceItems.length === 0) {
        return `
            <div style="margin-top: 1.8rem; text-align: center; padding: 1rem; background: rgba(0,0,0,0.03); border-radius: 1rem;">
                <i class="fas fa-info-circle"></i> Tidak ada opsi replace untuk skin ini.
            </div>
        `;
    }

    let tableRows = '';
    for (let i = 0; i < replaceItems.length; i++) {
        const item = replaceItems[i];
        tableRows += `
            <tr>
                <th>${escapeHtml(item.name)}</th>
                <td style="text-align: right;">
                    <button class="btn-download-skin" data-skin-type="${escapeHtml(item.name)}" data-download-url="${escapeHtml(item.downloadUrl)}">
                        <i class="fas fa-download"></i> Download
                    </button>
                </td>
            </tr>
        `;
    }

    return `
        <div style="margin-top: 1.8rem; background: rgba(0,0,0,0.02); border-radius: 1.2rem; padding: 0.8rem 0.2rem;">
            <table class="replace-table">
                ${tableRows}
            </table>
        </div>
    `;
}

// Setup tombol download
function setupDownloadButtons() {
    const btns = document.querySelectorAll('.btn-download-skin');
    btns.forEach(btn => {
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        newBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const type = this.getAttribute('data-skin-type');
            const downloadUrl = this.getAttribute('data-download-url');
            
            if (downloadUrl && downloadUrl !== '#') {
                window.open(downloadUrl, '_blank');
            } else {
                alert(`🚀 Fitur download untuk skin tipe "${type}" akan segera hadir!`);
            }
        });
    });
}

// Ambil skin berdasarkan ID
function getSkinById(id) {
    const idx = parseInt(id);
    if (!isNaN(idx) && listSkin[idx]) {
        return listSkin[idx];
    }
    return null;
}

// Tampilkan detail skin
function displaySkinDetailFromGlobal() {
    if (!window.location.pathname.includes('detail-skin.html')) {
        return;
    }

    const dynamicContainer = document.getElementById('dynamicDetailContent');
    if (!dynamicContainer) {
        setTimeout(displaySkinDetailFromGlobal, 100);
        return;
    }

    // Tunggu data selesai load
    if (!skinDataLoaded) {
        dynamicContainer.innerHTML = `
            <div class="detail-card" style="text-align: center; padding: 2rem;">
                <i class="fas fa-spinner fa-pulse" style="font-size: 2rem; color: #3b71ca;"></i>
                <p style="margin-top: 1rem;">Memuat data skin...</p>
            </div>
        `;
        setTimeout(displaySkinDetailFromGlobal, 200);
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    let title = urlParams.get('title');
    let date = urlParams.get('date');
    let videoUrl = urlParams.get('video');
    let id = urlParams.get('id');
    let replaceItemsParam = urlParams.get('replace');

    let replaceItems = [];

    if (replaceItemsParam && replaceItemsParam !== '[]' && replaceItemsParam !== '%5B%5D') {
        try {
            const decoded = decodeURIComponent(replaceItemsParam);
            replaceItems = JSON.parse(decoded);
        } catch(e) {
            replaceItems = [];
        }
    }

    if (!title && !id) {
        try {
            const storedSkin = sessionStorage.getItem('selectedSkin');
            if (storedSkin) {
                const skinObj = JSON.parse(storedSkin);
                title = skinObj.title;
                date = skinObj.date;
                videoUrl = skinObj.videoUrl;
                replaceItems = skinObj.replaceItems || [];
            }
        } catch(e) {}
    }

    if ((!title || !date) && id !== null) {
        const skin = getSkinById(id);
        if (skin) {
            title = title || skin.title;
            date = date || skin.date;
            videoUrl = videoUrl || skin.videoUrl;
            if (replaceItems.length === 0) {
                replaceItems = skin.replaceItems || [];
            }
        }
    }

    if (!title) {
        dynamicContainer.innerHTML = `
            <div class="detail-card">
                <div class="no-data">
                    <i class="fas fa-exclamation-circle" style="font-size: 2rem; margin-bottom: 0.5rem; display: block;"></i>
                    <strong>Tidak ada data skin yang dipilih</strong><br>
                    <span style="font-size: 0.8rem;">Silakan klik kartu skin dari halaman utama.</span>
                </div>
            </div>
        `;
        return;
    }

    if (!videoUrl) {
        videoUrl = 'https://www.youtube.com/embed/0tOXxuLfT5I';
    }

    if (!date) {
        date = 'Tanggal tidak tersedia';
    }

    if (!replaceItems || !Array.isArray(replaceItems)) {
        replaceItems = [];
    }

    const youtubeEmbed = `
        <div class="youtube-wrapper">
            <iframe src="${videoUrl}" title="YouTube video player - ${escapeHtml(title)}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
        </div>
    `;

    const downloadTable = generateReplaceTable(replaceItems);

    const htmlContent = `
        <div class="detail-card">
            <h1 class="detail-title">${escapeHtml(title)}</h1>
            <div class="detail-date">
                <i class="far fa-calendar-alt"></i> <span>${escapeHtml(date)}</span>
            </div>
            ${youtubeEmbed}
            ${downloadTable}
            <div style="margin-top: 1rem; text-align: center; font-size: 0.75rem; color: #6f86a3;">
                <i class="fas fa-tag"></i> Koleksi eksklusif Schwans ML
            </div>
        </div>
    `;
    
    dynamicContainer.innerHTML = htmlContent;
    setupDownloadButtons();
}

// Render mini card di halaman utama
function renderMiniCard() {
    const container = document.querySelector(".dual-box-container");
    if (!container) return;

    if (!skinDataLoaded || !listSkin.length) {
        container.innerHTML = `
            <div class="empty-message">
                <i class="fas fa-spinner fa-pulse"></i> Memuat data skin...
            </div>
        `;
        return;
    }

    const latest10 = [...listSkin]
        .sort((a, b) => parseDate(b.date) - parseDate(a.date))
        .slice(0, 10);

    if (latest10.length === 0) {
        container.innerHTML = `<div class="empty-message">Belum ada skin tersedia</div>`;
        return;
    }

    container.innerHTML = latest10.map((item, index) => {
        const replaceItemsStr = JSON.stringify(item.replaceItems || []);
        const imgSrc = item.image || 'https://picsum.photos/id/20/200/110';
        return `
            <div class="mini-card" data-id="${item.id}" data-title="${escapeHtml(item.title)}" data-date="${escapeHtml(item.date)}" data-video="${escapeHtml(item.videoUrl)}" data-replace='${replaceItemsStr}'>
                <img class="mini-card-image" src="${imgSrc}" alt="${escapeHtml(item.title)}" loading="lazy" onerror="this.src='https://picsum.photos/id/20/200/110'">
                <div class="mini-card-content">
                    <div class="mini-card-date">
                        <i class="far fa-calendar-alt"></i> ${escapeHtml(item.date)}
                    </div>
                    <h4 class="mini-card-title">${escapeHtml(item.title)}</h4>
                </div>
            </div>
        `;
    }).join("");

    document.querySelectorAll('.mini-card').forEach(card => {
        const newCard = card.cloneNode(true);
        card.parentNode.replaceChild(newCard, card);
        
        newCard.addEventListener('click', (e) => {
            if (e.target.closest('.mini-card')) {
                const id = newCard.getAttribute('data-id');
                const title = newCard.getAttribute('data-title');
                const date = newCard.getAttribute('data-date');
                const video = newCard.getAttribute('data-video');
                const replaceItemsStr = newCard.getAttribute('data-replace') || '[]';
                
                let replaceItems = [];
                try {
                    replaceItems = JSON.parse(replaceItemsStr);
                } catch(e) {
                    replaceItems = [];
                }
                
                sessionStorage.setItem('selectedSkin', JSON.stringify({
                    id: id,
                    title: title,
                    date: date,
                    videoUrl: video,
                    replaceItems: replaceItems
                }));
                
                const replaceParam = encodeURIComponent(JSON.stringify(replaceItems));
                window.location.href = `detail-skin.html?title=${encodeURIComponent(title)}&date=${encodeURIComponent(date)}&video=${encodeURIComponent(video)}&id=${id}&replace=${replaceParam}`;
            }
        });
    });
}

// Fungsi untuk menambah skin baru (untuk admin panel)
async function addNewSkin(skinData) {
    try {
        const response = await fetch('data/skins.json');
        const data = await response.json();
        
        // Assign ID baru
        const newId = Math.max(...data.skins.map(s => s.id), 0) + 1;
        skinData.id = newId;
        
        data.skins.push(skinData);
        data.lastUpdated = new Date().toISOString().split('T')[0];
        
        // Simpan kembali (di environment nyata, ini butuh backend)
        console.log('Skin baru:', skinData);
        console.log('Untuk menyimpan permanen, butuh backend API');
        
        return true;
    } catch (error) {
        console.error('Error adding skin:', error);
        return false;
    }
}

// Auto load saat DOM ready
document.addEventListener("DOMContentLoaded", function() {
    console.log('DOM loaded, loading database...');
    loadSkinsFromDatabase();
});
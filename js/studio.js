/**
 * 全犀模型系统 - 直播间后台逻辑
 */

let brandPage = 1;
const BRAND_PAGE_SIZE = 10;

document.addEventListener('DOMContentLoaded', () => {
    renderOverviewStats();
    renderBrands();
    renderCompetitors();
    renderTrafficSources();
});

// ====== 概览统计 ======
function renderOverviewStats() {
    const brands = DataManager.getBrands();
    const activeBrands = brands.filter(b => b.status === 'active');
    const studios = DataManager.getStudios();
    const activeStudios = studios.filter(s => s.status === 'active');
    const orders = DataManager.getOrders();

    const totalBrandSales = brands.reduce((s, b) => s + b.monthlySales, 0);
    const totalOrderAmount = orders.reduce((s, o) => s + o.amount, 0);

    document.getElementById('overviewStats').innerHTML = `
        <div class="stat-card">
            <div class="stat-icon" style="background:#dbeafe;color:#2563eb;">🏢</div>
            <div class="stat-value">${activeBrands.length}</div>
            <div class="stat-label">入驻品牌方</div>
            <div class="stat-change up">平台品牌矩阵持续扩大</div>
        </div>
        <div class="stat-card">
            <div class="stat-icon" style="background:#d1fae5;color:#059669;">📦</div>
            <div class="stat-value">${brands.reduce((s, b) => s + (b.monthlySales > 0 ? 1 : 0), 0)}</div>
            <div class="stat-label">在售商品品类</div>
            <div class="stat-change up">覆盖 ${new Set(brands.map(b => b.category)).size} 个品类</div>
        </div>
        <div class="stat-card">
            <div class="stat-icon" style="background:#fef3c7;color:#d97706;">💰</div>
            <div class="stat-value">¥${(totalBrandSales / 10000).toFixed(0)}万</div>
            <div class="stat-label">品牌月总销售额</div>
            <div class="stat-change up">月度 GMV 稳步增长</div>
        </div>
        <div class="stat-card">
            <div class="stat-icon" style="background:#fce4ec;color:#e91e63;">📈</div>
            <div class="stat-value">${activeStudios.length}</div>
            <div class="stat-label">合作直播间</div>
            <div class="stat-change up">入驻直播间持续增长</div>
        </div>
    `;
}

// ====== 品牌入驻看板 ======
function renderBrands() {
    const brands = DataManager.getBrands().filter(b => b.status === 'active');
    const total = brands.length;
    const paged = brands.slice((brandPage - 1) * BRAND_PAGE_SIZE, brandPage * BRAND_PAGE_SIZE);

    document.getElementById('brandCount').textContent = `共 ${total} 个入驻品牌`;

    document.getElementById('brandTableBody').innerHTML = paged.map(b => `
        <tr>
            <td><strong>${b.name}</strong><br><span class="text-muted" style="font-size:12px;">${b.code}</span></td>
            <td><span class="badge" style="background:#f0fdf4;color:#166534;">${b.category}</span></td>
            <td>${b.productInfo}</td>
            <td>¥${b.priceRange}</td>
            <td><strong>¥${(b.monthlySales/10000).toFixed(1)}万</strong></td>
        </tr>
    `).join('');

    // Pagination
    const totalPages = Math.ceil(total / BRAND_PAGE_SIZE);
    if (totalPages > 1) {
        document.getElementById('brandPagination').innerHTML = `
            <div class="pagination">
                <button ${brandPage <= 1 ? 'disabled' : ''} onclick="changeBrandPage(${brandPage - 1})">‹</button>
                <span class="page-info">${brandPage}/${totalPages} 页，共 ${total} 个品牌</span>
                <button ${brandPage >= totalPages ? 'disabled' : ''} onclick="changeBrandPage(${brandPage + 1})">›</button>
            </div>
        `;
    }
}

function changeBrandPage(p) {
    brandPage = p;
    renderBrands();
}

// ====== 竞对情报 ======
function renderCompetitors() {
    const competitors = DataManager.getCompetitors();
    document.getElementById('competitorBody').innerHTML = competitors.map(c => `
        <tr>
            <td>
                <strong>${c.name}</strong>
                <br><span class="text-muted" style="font-size:12px;">${c.platform}</span>
            </td>
            <td>${c.studioCount} 个</td>
            <td><strong>¥${(c.totalSales/10000).toFixed(0)}万</strong></td>
            <td>¥${c.avgSales.toLocaleString()}</td>
            <td><span class="${c.growthRate.startsWith('+') ? 'text-success' : 'text-danger'}">${c.growthRate}</span></td>
        </tr>
    `).join('');
}

// ====== 流量方资源 ======
function renderTrafficSources() {
    const sources = DataManager.getTrafficSources().filter(t => t.status === 'active');
    document.getElementById('trafficGrid').innerHTML = sources.map(t => `
        <div class="card" style="box-shadow:none;border:1px solid var(--gray-200);">
            <div class="card-body">
                <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
                    <div style="width:40px;height:40px;border-radius:10px;background:${t.type === '线下拉新' ? '#dbeafe' : '#fef3c7'};display:flex;align-items:center;justify-content:center;font-size:20px;">
                        ${t.type === '线下拉新' ? '🏪' : '🎯'}
                    </div>
                    <div>
                        <strong style="font-size:15px;">${t.name}</strong>
                        <br><span class="badge" style="background:${t.type === '线下拉新' ? '#eff6ff' : '#fffbeb'};color:${t.type === '线下拉新' ? '#1e40af' : '#92400e'};">
                            ${t.type}
                        </span>
                    </div>
                </div>
                <div style="font-size:13px;color:var(--gray-600);">
                    <div style="margin-bottom:6px;">📍 ${t.region} · 覆盖 ${t.scale.toLocaleString()} 人</div>
                    <div style="margin-bottom:6px;">📊 月产能 ${t.monthlyCapacity.toLocaleString()} 人</div>
                    <div>🤝 合作佣金 ${t.commission}% · 合作自 ${t.cooperateSince}</div>
                    <div style="margin-top:8px;font-size:12px;color:var(--gray-400);">${t.description || ''}</div>
                </div>
            </div>
        </div>
    `).join('');
}

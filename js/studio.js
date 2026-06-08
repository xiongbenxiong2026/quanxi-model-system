/**
 * 全犀模型系统 - 直播间后台逻辑
 */

let brandPage = 1;
const BRAND_PAGE_SIZE = 10;

document.addEventListener('DOMContentLoaded', () => {
    renderOverviewStats();
    renderBrands();
    renderPlatformSales();
    renderTrafficSources();
});

// ====== 概览统计（使用真实业务指标） ======
function renderOverviewStats() {
    const metrics = DataManager.getMetrics();
    const brands = DataManager.getBrands();
    const stats = DataManager.getStats();
    const activeBrands = brands.filter(b => b.status === 'active');

    document.getElementById('overviewStats').innerHTML = `
        <div class="stat-card">
            <div class="stat-icon" style="background:#dbeafe;color:#2563eb;">🏢</div>
            <div class="stat-value">${activeBrands.length}</div>
            <div class="stat-label">入驻品牌方</div>
            <div class="stat-change up">共 ${metrics.brandCount} 家入驻</div>
        </div>
        <div class="stat-card">
            <div class="stat-icon" style="background:#d1fae5;color:#059669;">📦</div>
            <div class="stat-value">${metrics.productCategoryCount.toLocaleString()}</div>
            <div class="stat-label">在售品类（个）</div>
            <div class="stat-change up">覆盖 ${new Set(brands.map(b => b.category)).size} 大类</div>
        </div>
        <div class="stat-card">
            <div class="stat-icon" style="background:#fef3c7;color:#d97706;">💰</div>
            <div class="stat-value">¥${(stats.brandSales / 10000).toFixed(0)}万</div>
            <div class="stat-label">品牌方累计销售额</div>
            <div class="stat-change up">占总销售额 ${stats.brandSalesRatio}%</div>
        </div>
        <div class="stat-card">
            <div class="stat-icon" style="background:#fce4ec;color:#e91e63;">📈</div>
            <div class="stat-value">${metrics.studioCount}</div>
            <div class="stat-label">合作直播间</div>
            <div class="stat-change up">合计 ${(metrics.totalAudience / 10000).toFixed(1)} 万受众</div>
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

// ====== 平台销售数据 ======
function renderPlatformSales() {
    const stats = DataManager.getStats();
    const metrics = DataManager.getMetrics();
    const dailySales = metrics.totalAudience * metrics.dailyPerCapitaSpend;

    document.getElementById('platformSalesGrid').innerHTML = `
        <div style="background:#f0fdf4;padding:16px;border-radius:8px;">
            <div style="font-size:12px;color:var(--gray-500);margin-bottom:4px;">总销售额</div>
            <div style="font-size:24px;font-weight:700;color:#059669;">¥${(stats.totalOrderAmount / 100000000).toFixed(2)}亿</div>
            <div style="font-size:12px;color:var(--gray-400);margin-top:4px;">自 2026.05.01 上线至今</div>
        </div>
        <div style="background:#eff6ff;padding:16px;border-radius:8px;">
            <div style="font-size:12px;color:var(--gray-500);margin-bottom:4px;">日均销售额</div>
            <div style="font-size:24px;font-weight:700;color:#2563eb;">¥${(dailySales / 10000).toFixed(1)}万</div>
            <div style="font-size:12px;color:var(--gray-400);margin-top:4px;">日均销售额</div>
        </div>
        <div style="background:#fffbeb;padding:16px;border-radius:8px;">
            <div style="font-size:12px;color:var(--gray-500);margin-bottom:4px;">品牌方销售额</div>
            <div style="font-size:24px;font-weight:700;color:#d97706;">¥${(stats.brandSales / 100000000).toFixed(2)}亿</div>
            <div style="font-size:12px;color:var(--gray-400);margin-top:4px;">占比 ${stats.brandSalesRatio}% · ${metrics.brandCount} 家品牌</div>
        </div>
        <div style="background:#fef2f2;padding:16px;border-radius:8px;">
            <div style="font-size:12px;color:var(--gray-500);margin-bottom:4px;">其他销售额</div>
            <div style="font-size:24px;font-weight:700;color:#ef4444;">¥${(stats.otherSales / 100000000).toFixed(2)}亿</div>
            <div style="font-size:12px;color:var(--gray-400);margin-top:4px;">占比 ${stats.otherSalesRatio}%</div>
        </div>
    `;

    // 销售额构成条形图
    document.getElementById('salesBreakdownBar').innerHTML = `
        <div style="display:flex;height:24px;border-radius:6px;overflow:hidden;">
            <div style="flex:${stats.brandSalesRatio};background:#d97706;display:flex;align-items:center;justify-content:center;font-size:12px;color:white;font-weight:600;">
                品牌方 ${stats.brandSalesRatio}%
            </div>
            <div style="flex:${stats.otherSalesRatio};background:#9ca3af;display:flex;align-items:center;justify-content:center;font-size:12px;color:white;font-weight:600;">
                其他 ${stats.otherSalesRatio}%
            </div>
        </div>
    `;

    document.getElementById('salesBreakdownText').innerHTML =
        `品牌方销售额 ¥${(stats.brandSales / 10000).toFixed(0)}万（占比 ${stats.brandSalesRatio}%）| 其他销售额 ¥${(stats.otherSales / 10000).toFixed(0)}万（占比 ${stats.otherSalesRatio}%）`;
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
                    <div style="margin-top:8px;font-size:12px;color:var(--gray-400);padding:8px;background:var(--gray-50);border-radius:6px;">
                        ${t.description || ''}
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

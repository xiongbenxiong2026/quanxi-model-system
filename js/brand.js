/**
 * 全犀模型系统 - 品牌方后台逻辑
 */

let studioPage = 1;
const STUDIO_PAGE_SIZE = 8;
let chartInstances = {};

document.addEventListener('DOMContentLoaded', () => {
    renderOverviewStats();
    renderStudios();
    renderTopBrands();
    renderOrderStats();
    renderPortraitCharts();
    renderOrderTrendChart();
});

// ====== 概览统计 ======
function renderOverviewStats() {
    const studios = DataManager.getStudios().filter(s => s.status === 'active');
    const orders = DataManager.getOrders();
    const brands = DataManager.getBrands().filter(b => b.status === 'active');
    const totalAmount = orders.reduce((s, o) => s + o.amount, 0);
    const totalRefund = orders.reduce((s, o) => s + o.refund, 0);

    document.getElementById('overviewStats').innerHTML = `
        <div class="stat-card">
            <div class="stat-icon" style="background:#dbeafe;color:#2563eb;">📺</div>
            <div class="stat-value">${studios.length}</div>
            <div class="stat-label">合作直播间</div>
            <div class="stat-change up">覆盖 ${new Set(studios.map(s => s.location)).size} 个城市</div>
        </div>
        <div class="stat-card">
            <div class="stat-icon" style="background:#d1fae5;color:#059669;">👥</div>
            <div class="stat-value">${studios.reduce((s, st) => s + st.audienceSize, 0).toLocaleString()}</div>
            <div class="stat-label">平台总受众</div>
            <div class="stat-change up">精准消费人群持续增长</div>
        </div>
        <div class="stat-card">
            <div class="stat-icon" style="background:#fef3c7;color:#d97706;">💰</div>
            <div class="stat-value">¥${(totalAmount / 10000).toFixed(1)}万</div>
            <div class="stat-label">总交易额</div>
            <div class="stat-change up">含退款 ¥${(totalRefund / 10000).toFixed(1)}万</div>
        </div>
        <div class="stat-card">
            <div class="stat-icon" style="background:#fce4ec;color:#e91e63;">🏆</div>
            <div class="stat-value">${brands.length}</div>
            <div class="stat-label">入驻品牌方</div>
            <div class="stat-change up">品牌矩阵持续扩展</div>
        </div>
    `;
}

// ====== 直播间资源 ======
function renderStudios() {
    const studios = DataManager.getStudios().filter(s => s.status === 'active');
    const total = studios.length;
    const paged = studios.slice((studioPage - 1) * STUDIO_PAGE_SIZE, studioPage * STUDIO_PAGE_SIZE);

    document.getElementById('studioCount').textContent = `共 ${total} 个合作直播间`;
    document.getElementById('studioTableBody').innerHTML = paged.map(s => `
        <tr>
            <td><strong>${s.name}</strong><br><span class="text-muted" style="font-size:12px;">${s.code}</span></td>
            <td><span class="badge" style="background:#eff6ff;color:#1e40af;">${s.trafficType}</span></td>
            <td>${s.location}</td>
            <td>${(s.audienceSize / 10000).toFixed(1)}万${s.storeCount ? ` · ${s.storeCount}门店` : ''}</td>
            <td><strong>¥${(s.orderAmount / 10000).toFixed(1)}万</strong></td>
            <td><span class="${s.refundRate > 10 ? 'text-danger' : 'text-success'}">${s.refundRate}%</span></td>
        </tr>
    `).join('');

    // Pagination
    const totalPages = Math.ceil(total / STUDIO_PAGE_SIZE);
    if (totalPages > 1) {
        document.getElementById('studioPagination').innerHTML = `
            <div class="pagination">
                <button ${studioPage <= 1 ? 'disabled' : ''} onclick="changeStudioPage(${studioPage - 1})">‹</button>
                <span class="page-info">${studioPage}/${totalPages} 页 · 共 ${total} 个直播间</span>
                <button ${studioPage >= totalPages ? 'disabled' : ''} onclick="changeStudioPage(${studioPage + 1})">›</button>
            </div>
        `;
    }
}

function changeStudioPage(p) {
    studioPage = p;
    renderStudios();
}

// ====== Top10 品牌案例 ======
function renderTopBrands() {
    const top = DataManager.getTopBrands(10);
    const maxSales = top.length > 0 ? top[0].monthlySales : 1;

    document.getElementById('topBrandsBody').innerHTML = top.map((b, i) => `
        <div style="display:flex;align-items:center;gap:12px;padding:8px 0;border-bottom:1px solid var(--gray-100);">
            <div style="width:24px;height:24px;border-radius:50%;background:${i < 3 ? 'linear-gradient(135deg,#f59e0b,#f97316)' : '#f3f4f6'};display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:${i < 3 ? 'white' : '#6b7280'};">
                ${i + 1}
            </div>
            <div style="flex:1;">
                <div style="font-size:14px;font-weight:600;">${b.name}</div>
                <div style="font-size:12px;color:var(--gray-400);">${b.category} · ${b.productInfo}</div>
            </div>
            <div style="text-align:right;">
                <div style="font-size:14px;font-weight:700;color:var(--primary);">¥${(b.monthlySales / 10000).toFixed(1)}万</div>
                <div style="font-size:11px;color:var(--gray-400);">月销</div>
            </div>
        </div>
        <div class="progress-bar" style="margin-bottom:4px;">
            <div class="fill" style="width:${(b.monthlySales / maxSales * 100).toFixed(1)}%;background:${i < 3 ? 'linear-gradient(90deg,#f59e0b,#f97316)' : 'var(--primary-gradient)'};"></div>
        </div>
    `).join('');
}

// ====== 订单统计 ======
function renderOrderStats() {
    const orders = DataManager.getOrders();
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentOrders = orders.filter(o => {
        const d = new Date(o.date);
        return d >= thirtyDaysAgo && d <= now;
    });
    const totalAmount = recentOrders.reduce((s, o) => s + o.amount, 0);
    const totalRefund = recentOrders.reduce((s, o) => s + o.refund, 0);
    const onlineOrders = recentOrders.filter(o => o.trafficSource.includes('线上')).length;
    const offlineOrders = recentOrders.filter(o => o.trafficSource.includes('线下')).length;

    document.getElementById('orderStatsGrid').innerHTML = `
        <div class="stat-card">
            <div class="stat-value" style="font-size:20px;">${recentOrders.length}</div>
            <div class="stat-label">近30天订单</div>
        </div>
        <div class="stat-card">
            <div class="stat-value" style="font-size:20px;">¥${(totalAmount / 10000).toFixed(1)}万</div>
            <div class="stat-label">近30天交易额</div>
        </div>
        <div class="stat-card">
            <div class="stat-value" style="font-size:20px;">${onlineOrders}</div>
            <div class="stat-label">线上流量订单</div>
        </div>
        <div class="stat-card">
            <div class="stat-value" style="font-size:20px;">${offlineOrders}</div>
            <div class="stat-label">线下流量订单</div>
        </div>
    `;
}

// ====== 人群画像图表 ======
function renderPortraitCharts() {
    const data = DataManager.getPortraitData();
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

    // Age Distribution - Doughnut
    if (chartInstances.chartAge) chartInstances.chartAge.destroy();
    chartInstances.chartAge = new Chart(document.getElementById('chartAge'), {
        type: 'doughnut',
        data: {
            labels: data.ageDistribution.map(d => d.label),
            datasets: [{ data: data.ageDistribution.map(d => d.value), backgroundColor: colors }]
        },
        options: { responsive: true, plugins: { legend: { position: 'bottom', labels: { font: { size: 11 } } } } }
    });

    // Gender Ratio - Pie
    if (chartInstances.chartGender) chartInstances.chartGender.destroy();
    chartInstances.chartGender = new Chart(document.getElementById('chartGender'), {
        type: 'pie',
        data: {
            labels: data.genderRatio.map(d => d.label),
            datasets: [{ data: data.genderRatio.map(d => d.value), backgroundColor: ['#ec4899', '#3b82f6'] }]
        },
        options: { responsive: true, plugins: { legend: { position: 'bottom', labels: { font: { size: 11 } } } } }
    });

    // Consumption Level - Bar
    if (chartInstances.chartConsumption) chartInstances.chartConsumption.destroy();
    chartInstances.chartConsumption = new Chart(document.getElementById('chartConsumption'), {
        type: 'bar',
        data: {
            labels: data.consumptionLevel.map(d => d.label),
            datasets: [{
                label: '占比 %',
                data: data.consumptionLevel.map(d => d.value),
                backgroundColor: ['#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe']
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true, max: 100 } }
        }
    });

    // Category Preference - Horizontal Bar
    if (chartInstances.chartCategory) chartInstances.chartCategory.destroy();
    chartInstances.chartCategory = new Chart(document.getElementById('chartCategory'), {
        type: 'bar',
        data: {
            labels: data.categoryPreference.map(d => d.label),
            datasets: [{
                label: '占比 %',
                data: data.categoryPreference.map(d => d.value),
                backgroundColor: ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5', '#ecfdf5']
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            plugins: { legend: { display: false } },
            scales: { x: { beginAtZero: true, max: 100 } }
        }
    });

    // Traffic Source - Doughnut
    if (chartInstances.chartTraffic) chartInstances.chartTraffic.destroy();
    chartInstances.chartTraffic = new Chart(document.getElementById('chartTraffic'), {
        type: 'doughnut',
        data: {
            labels: data.trafficSourceRatio.map(d => d.label),
            datasets: [{ data: data.trafficSourceRatio.map(d => d.value), backgroundColor: colors }]
        },
        options: { responsive: true, plugins: { legend: { position: 'bottom', labels: { font: { size: 11 } } } } }
    });

    // Repurchase Rate - Bar
    if (chartInstances.chartRepurchase) chartInstances.chartRepurchase.destroy();
    chartInstances.chartRepurchase = new Chart(document.getElementById('chartRepurchase'), {
        type: 'bar',
        data: {
            labels: data.repurchaseRate.map(d => d.label),
            datasets: [{
                label: '占比 %',
                data: data.repurchaseRate.map(d => d.value),
                backgroundColor: ['#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe']
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true, max: 100 } }
        }
    });
}

// ====== 订单趋势图 ======
function renderOrderTrendChart() {
    const orders = DataManager.getOrders();
    const now = new Date();
    const days = [];
    const amounts = [];
    const counts = [];

    // Build last 30 days
    for (let i = 29; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        days.push((d.getMonth() + 1) + '/' + d.getDate());

        const dayOrders = orders.filter(o => o.date === dateStr);
        counts.push(dayOrders.length);
        amounts.push(parseFloat((dayOrders.reduce((s, o) => s + o.amount, 0) / 10000).toFixed(1)));
    }

    if (chartInstances.chartOrderTrend) chartInstances.chartOrderTrend.destroy();
    chartInstances.chartOrderTrend = new Chart(document.getElementById('chartOrderTrend'), {
        type: 'line',
        data: {
            labels: days,
            datasets: [
                {
                    label: '交易额 (万元)',
                    data: amounts,
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59,130,246,0.1)',
                    fill: true,
                    tension: 0.3,
                    yAxisID: 'y'
                },
                {
                    label: '订单数',
                    data: counts,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16,185,129,0.1)',
                    fill: true,
                    tension: 0.3,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            interaction: { mode: 'index', intersect: false },
            plugins: { legend: { position: 'top', labels: { font: { size: 11 } } } },
            scales: {
                y: { beginAtZero: true, position: 'left', title: { display: true, text: '交易额 (万元)' } },
                y1: { beginAtZero: true, position: 'right', grid: { drawOnChartArea: false }, title: { display: true, text: '订单数' } }
            }
        }
    });
}

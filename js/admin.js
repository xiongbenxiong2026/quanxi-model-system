/**
 * 全犀模型系统 - 管理后台逻辑
 */

let currentTab = 'studios';
let currentPage = 1;
let pageSize = 10;
let searchQuery = '';
let editingId = null;
let deleteTarget = null;

// ====== 页面初始化 ======
document.addEventListener('DOMContentLoaded', () => {
    renderStats();
    setupTabs();
    setupAddButton();
    renderTab(currentTab);
    setupDeleteConfirm();
});

// ====== 渲染统计 ======
function renderStats() {
    const s = DataManager.getStats();
    document.getElementById('statsGrid').innerHTML = `
        <div class="stat-card">
            <div class="stat-icon" style="background:#dbeafe;color:#2563eb;">📺</div>
            <div class="stat-value">${s.studioCount}</div>
            <div class="stat-label">直播间总数 / 活跃 ${s.activeStudioCount}</div>
        </div>
        <div class="stat-card">
            <div class="stat-icon" style="background:#d1fae5;color:#059669;">🏢</div>
            <div class="stat-value">${s.brandCount}</div>
            <div class="stat-label">品牌方总数 / 活跃 ${s.activeBrandCount}</div>
        </div>
        <div class="stat-card">
            <div class="stat-icon" style="background:#fef3c7;color:#d97706;">📋</div>
            <div class="stat-value">${s.orderCount.toLocaleString()}</div>
            <div class="stat-label">订单总数 / 已完成 ${s.completedOrders.toLocaleString()}</div>
        </div>
        <div class="stat-card">
            <div class="stat-icon" style="background:#fce4ec;color:#e91e63;">💰</div>
            <div class="stat-value">¥${(s.netAmount / 10000).toFixed(1)}万</div>
            <div class="stat-label">交易净额 / 总额 ¥${(s.totalOrderAmount/10000).toFixed(1)}万</div>
        </div>
    `;
}

// ====== Tab切换 ======
function setupTabs() {
    document.querySelectorAll('.tab-item').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.tab-item').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentTab = tab.dataset.tab;
            currentPage = 1;
            searchQuery = '';
            renderTab(currentTab);
            updateAddButtonLabel();
        });
    });
}

function setupAddButton() {
    document.getElementById('btnAdd').addEventListener('click', () => openAddModal());
}

function updateAddButtonLabel() {
    const labels = { studios: '+ 新增直播间', brands: '+ 新增品牌方', orders: '+ 新增订单', traffic: '+ 新增流量方' };
    document.getElementById('btnAdd').textContent = labels[currentTab] || '+ 新增';
}

// ====== 渲染Tab内容 ======
function renderTab(tab) {
    const container = document.getElementById('tabContent');
    const handlers = {
        studios: renderStudios,
        brands: renderBrands,
        orders: renderOrders,
        traffic: renderTraffic,
    };
    handlers[tab] ? handlers[tab](container) : (container.innerHTML = '<div class="loading">加载中...</div>');
}

// ====== 直播间管理 ======
function renderStudios(container) {
    let data = DataManager.getStudios();
    if (searchQuery) {
        const q = searchQuery.toLowerCase();
        data = data.filter(s =>
            s.name.toLowerCase().includes(q) ||
            s.location.includes(q) ||
            s.trafficType.includes(q) ||
            s.id.includes(q)
        );
    }
    const total = data.length;
    const paged = data.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    container.innerHTML = `
        <div class="search-bar">
            <input type="text" placeholder="搜索直播间名称、地点、流量类型..." value="${searchQuery}" oninput="onSearch(this.value)">
            <select onchange="onPageSize(this.value)">
                <option value="10" ${pageSize===10?'selected':''}>10条/页</option>
                <option value="20" ${pageSize===20?'selected':''}>20条/页</option>
                <option value="50" ${pageSize===50?'selected':''}>50条/页</option>
            </select>
        </div>
        <div class="table-container">
            <table>
                <thead><tr>
                    <th>ID</th>
                    <th>名称</th>
                    <th>流量类型</th>
                    <th>地点</th>
                    <th>人数</th>
                    <th>门店数</th>
                    <th>订单数</th>
                    <th>订单金额</th>
                    <th>退货率</th>
                    <th>状态</th>
                    <th>操作</th>
                </tr></thead>
                <tbody>
                    ${paged.length ? paged.map(s => `
                        <tr>
                            <td><span class="text-muted">${s.code}</span></td>
                            <td><strong>${s.name}</strong></td>
                            <td>${s.trafficType}</td>
                            <td>${s.location}</td>
                            <td>${(s.audienceSize/10000).toFixed(1)}万</td>
                            <td>${s.storeCount || '-'}</td>
                            <td>${s.orderCount.toLocaleString()}</td>
                            <td>¥${(s.orderAmount/10000).toFixed(1)}万</td>
                            <td><span class="${s.refundRate > 10 ? 'text-danger' : 'text-success'}">${s.refundRate}%</span></td>
                            <td><span class="badge ${s.status}">${s.status === 'active' ? '活跃' : '停用'}</span></td>
                            <td>
                                <button class="btn btn-sm btn-outline" onclick="openEditModal('studios','${s.id}')">编辑</button>
                                <button class="btn btn-sm btn-danger" onclick="openDeleteModal('studios','${s.id}')">删除</button>
                            </td>
                        </tr>
                    `).join('') : `<tr><td colspan="11"><div class="empty-state"><p>暂无数据</p></div></td></tr>`}
                </tbody>
            </table>
        </div>
        ${renderPagination(total)}
    `;
}

// ====== 品牌方管理 ======
function renderBrands(container) {
    let data = DataManager.getBrands();
    if (searchQuery) {
        const q = searchQuery.toLowerCase();
        data = data.filter(b =>
            b.name.toLowerCase().includes(q) ||
            b.category.includes(q) ||
            b.productInfo.includes(q)
        );
    }
    const total = data.length;
    const paged = data.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    container.innerHTML = `
        <div class="search-bar">
            <input type="text" placeholder="搜索品牌名称、品类、产品..." value="${searchQuery}" oninput="onSearch(this.value)">
            <select onchange="onPageSize(this.value)">
                <option value="10" ${pageSize===10?'selected':''}>10条/页</option>
                <option value="20" ${pageSize===20?'selected':''}>20条/页</option>
                <option value="50" ${pageSize===50?'selected':''}>50条/页</option>
            </select>
        </div>
        <div class="table-container">
            <table>
                <thead><tr>
                    <th>编码</th>
                    <th>名称</th>
                    <th>品类</th>
                    <th>产品</th>
                    <th>价格带</th>
                    <th>月销(元)</th>
                    <th>总销(元)</th>
                    <th>结算方式</th>
                    <th>入驻日期</th>
                    <th>状态</th>
                    <th>操作</th>
                </tr></thead>
                <tbody>
                    ${paged.length ? paged.map(b => `
                        <tr>
                            <td><span class="text-muted">${b.code}</span></td>
                            <td><strong>${b.name}</strong></td>
                            <td><span class="badge" style="background:#f0fdf4;color:#166534;">${b.category}</span></td>
                            <td>${b.productInfo}</td>
                            <td>¥${b.priceRange}</td>
                            <td>¥${(b.monthlySales/10000).toFixed(1)}万</td>
                            <td>¥${(b.totalSales/10000).toFixed(1)}万</td>
                            <td>${b.settlementType}</td>
                            <td>${b.joinDate}</td>
                            <td><span class="badge ${b.status}">${b.status === 'active' ? '活跃' : b.status === 'pending' ? '待审' : '停用'}</span></td>
                            <td>
                                <button class="btn btn-sm btn-outline" onclick="openEditModal('brands','${b.id}')">编辑</button>
                                <button class="btn btn-sm btn-danger" onclick="openDeleteModal('brands','${b.id}')">删除</button>
                            </td>
                        </tr>
                    `).join('') : `<tr><td colspan="11"><div class="empty-state"><p>暂无数据</p></div></td></tr>`}
                </tbody>
            </table>
        </div>
        ${renderPagination(total)}
    `;
}

// ====== 订单管理 ======
function renderOrders(container) {
    let data = DataManager.getOrders();
    if (searchQuery) {
        const q = searchQuery.toLowerCase();
        data = data.filter(o =>
            o.orderNo.toLowerCase().includes(q) ||
            o.brandName.toLowerCase().includes(q) ||
            o.studioName.toLowerCase().includes(q) ||
            o.trafficSource.includes(q)
        );
    }
    const total = data.length;
    const paged = data.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    container.innerHTML = `
        <div class="search-bar">
            <input type="text" placeholder="搜索订单号、品牌方、直播间、流量来源..." value="${searchQuery}" oninput="onSearch(this.value)">
            <select onchange="onPageSize(this.value)">
                <option value="10" ${pageSize===10?'selected':''}>10条/页</option>
                <option value="20" ${pageSize===20?'selected':''}>20条/页</option>
                <option value="50" ${pageSize===50?'selected':''}>50条/页</option>
            </select>
        </div>
        <div class="table-container">
            <table>
                <thead><tr>
                    <th>订单号</th>
                    <th>品牌方</th>
                    <th>品类</th>
                    <th>直播间</th>
                    <th>金额</th>
                    <th>数量</th>
                    <th>退款</th>
                    <th>流量来源</th>
                    <th>日期</th>
                    <th>状态</th>
                    <th>操作</th>
                </tr></thead>
                <tbody>
                    ${paged.length ? paged.map(o => `
                        <tr>
                            <td><span class="text-muted">${o.orderNo}</span></td>
                            <td>${o.brandName}</td>
                            <td><span class="badge" style="background:#f0fdf4;color:#166534;">${o.brandCategory}</span></td>
                            <td>${o.studioName}</td>
                            <td><strong>¥${o.amount.toFixed(2)}</strong></td>
                            <td>${o.quantity}</td>
                            <td class="${o.refund > 0 ? 'text-danger' : ''}">${o.refund > 0 ? '¥'+o.refund.toFixed(2) : '-'}</td>
                            <td><span class="badge" style="background:#eff6ff;color:#1e40af;">${o.trafficSource}</span></td>
                            <td>${o.date}</td>
                            <td><span class="badge ${o.status}">${o.status === 'completed' ? '已完成' : o.status === 'refunding' ? '退款中' : '已退款'}</span></td>
                            <td>
                                <button class="btn btn-sm btn-outline" onclick="openEditModal('orders','${o.id}')">编辑</button>
                                <button class="btn btn-sm btn-danger" onclick="openDeleteModal('orders','${o.id}')">删除</button>
                            </td>
                        </tr>
                    `).join('') : `<tr><td colspan="11"><div class="empty-state"><p>暂无数据</p></div></td></tr>`}
                </tbody>
            </table>
        </div>
        ${renderPagination(total)}
    `;
}

// ====== 流量方管理 ======
function renderTraffic(container) {
    let data = DataManager.getTrafficSources();
    if (searchQuery) {
        const q = searchQuery.toLowerCase();
        data = data.filter(t =>
            t.name.toLowerCase().includes(q) ||
            t.type.includes(q) ||
            t.region.includes(q)
        );
    }
    const total = data.length;
    const paged = data.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    container.innerHTML = `
        <div class="search-bar">
            <input type="text" placeholder="搜索流量方名称、类型、地区..." value="${searchQuery}" oninput="onSearch(this.value)">
            <select onchange="onPageSize(this.value)">
                <option value="10" ${pageSize===10?'selected':''}>10条/页</option>
                <option value="20" ${pageSize===20?'selected':''}>20条/页</option>
            </select>
        </div>
        <div class="table-container">
            <table>
                <thead><tr>
                    <th>名称</th>
                    <th>类型</th>
                    <th>地区</th>
                    <th>覆盖人数</th>
                    <th>月产能</th>
                    <th>佣金</th>
                    <th>合作日期</th>
                    <th>状态</th>
                    <th>操作</th>
                </tr></thead>
                <tbody>
                    ${paged.length ? paged.map(t => `
                        <tr>
                            <td><strong>${t.name}</strong></td>
                            <td><span class="badge" style="background:#f0fdf4;color:#166534;">${t.type}</span></td>
                            <td>${t.region}</td>
                            <td>${t.scale.toLocaleString()}</td>
                            <td>${t.monthlyCapacity.toLocaleString()}</td>
                            <td>${t.commission}%</td>
                            <td>${t.cooperateSince}</td>
                            <td><span class="badge ${t.status}">${t.status === 'active' ? '合作中' : '暂停'}</span></td>
                            <td>
                                <button class="btn btn-sm btn-outline" onclick="openEditModal('traffic','${t.id}')">编辑</button>
                                <button class="btn btn-sm btn-danger" onclick="openDeleteModal('traffic','${t.id}')">删除</button>
                            </td>
                        </tr>
                    `).join('') : `<tr><td colspan="9"><div class="empty-state"><p>暂无数据</p></div></td></tr>`}
                </tbody>
            </table>
        </div>
        ${renderPagination(total)}
    `;
}

// ====== 分页 ======
function renderPagination(total) {
    const totalPages = Math.ceil(total / pageSize);
    if (totalPages <= 1) return '';
    let html = '<div class="pagination">';
    html += `<button ${currentPage <= 1 ? 'disabled' : ''} onclick="goPage(${currentPage - 1})">‹</button>`;
    const start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, currentPage + 2);
    for (let i = start; i <= end; i++) {
        html += `<button class="${i === currentPage ? 'active' : ''}" onclick="goPage(${i})">${i}</button>`;
    }
    html += `<button ${currentPage >= totalPages ? 'disabled' : ''} onclick="goPage(${currentPage + 1})">›</button>`;
    html += `<span class="page-info">共 ${total} 条</span>`;
    html += '</div>';
    return html;
}

function goPage(p) {
    currentPage = p;
    renderTab(currentTab);
}

function onSearch(q) {
    searchQuery = q;
    currentPage = 1;
    renderTab(currentTab);
}

function onPageSize(size) {
    pageSize = parseInt(size);
    currentPage = 1;
    renderTab(currentTab);
}

// ====== 弹窗管理 - 新增 ======
function openAddModal() {
    editingId = null;
    const labels = {
        studios: { title: '新增直播间', type: 'studios' },
        brands: { title: '新增品牌方', type: 'brands' },
        orders: { title: '新增订单', type: 'orders' },
        traffic: { title: '新增流量方', type: 'traffic' },
    };
    const cfg = labels[currentTab];
    if (!cfg) return;
    document.getElementById('modalTitle').textContent = cfg.title;
    document.getElementById('modalBody').innerHTML = buildForm(cfg.type, null);
    document.getElementById('formModal').classList.add('show');
    document.getElementById('btnSave').onclick = () => saveForm(cfg.type);
}

// ====== 弹窗管理 - 编辑 ======
function openEditModal(type, id) {
    editingId = id;
    const titles = { studios: '编辑直播间', brands: '编辑品牌方', orders: '编辑订单', traffic: '编辑流量方' };
    document.getElementById('modalTitle').textContent = titles[type] || '编辑';
    const data = getDataByType(type, id);
    document.getElementById('modalBody').innerHTML = buildForm(type, data);
    document.getElementById('formModal').classList.add('show');
    document.getElementById('btnSave').onclick = () => saveForm(type);
}

function getDataByType(type, id) {
    if (type === 'studios') return DataManager.getStudios().find(s => s.id === id);
    if (type === 'brands') return DataManager.getBrands().find(b => b.id === id);
    if (type === 'orders') return DataManager.getOrders().find(o => o.id === id);
    if (type === 'traffic') return DataManager.getTrafficSources().find(t => t.id === id);
    return null;
}

function buildForm(type, data) {
    const v = (key, def = '') => data ? (data[key] ?? def) : def;
    if (type === 'studios') {
        return `
            <div class="form-row">
                <div class="form-group">
                    <label>直播间名称</label>
                    <input id="f_name" value="${v('name')}" placeholder="如：直播间 ***">
                </div>
                <div class="form-group">
                    <label>流量类型</label>
                    <select id="f_trafficType">
                        <option value="线上" ${v('trafficType')==='线上'?'selected':''}>线上</option>
                        <option value="线下" ${v('trafficType')==='线下'?'selected':''}>线下</option>
                        <option value="混合" ${v('trafficType')==='混合'?'selected':''}>混合</option>
                    </select>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>地点</label>
                    <input id="f_location" value="${v('location')}" placeholder="如：杭州市">
                </div>
                <div class="form-group">
                    <label>门店数（线下）</label>
                    <input id="f_storeCount" type="number" value="${v('storeCount', 0)}">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>人数</label>
                    <input id="f_audienceSize" type="number" value="${v('audienceSize', 10000)}">
                </div>
                <div class="form-group">
                    <label>状态</label>
                    <select id="f_status">
                        <option value="active" ${v('status')==='active'?'selected':''}>活跃</option>
                        <option value="inactive" ${v('status')==='inactive'?'selected':''}>停用</option>
                    </select>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>订单数</label>
                    <input id="f_orderCount" type="number" value="${v('orderCount', 500)}">
                </div>
                <div class="form-group">
                    <label>订单金额（元）</label>
                    <input id="f_orderAmount" type="number" step="0.01" value="${v('orderAmount', 100000)}">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>退货金额（元）</label>
                    <input id="f_refundAmount" type="number" step="0.01" value="${v('refundAmount', 5000)}">
                </div>
            </div>
        `;
    }
    if (type === 'brands') {
        return `
            <div class="form-row">
                <div class="form-group">
                    <label>品牌名称</label>
                    <input id="f_name" value="${v('name')}" placeholder="如：品牌 ***">
                </div>
                <div class="form-group">
                    <label>品类</label>
                    <select id="f_category">
                        ${BRAND_CATEGORIES.map(c => `<option value="${c}" ${v('category')===c?'selected':''}>${c}</option>`).join('')}
                    </select>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>产品信息</label>
                    <input id="f_productInfo" value="${v('productInfo')}">
                </div>
                <div class="form-group">
                    <label>价格带</label>
                    <input id="f_priceRange" value="${v('priceRange', '50-200')}">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>月销（元）</label>
                    <input id="f_monthlySales" type="number" value="${v('monthlySales', 100000)}">
                </div>
                <div class="form-group">
                    <label>结算方式</label>
                    <select id="f_settlementType">
                        <option value="T+1" ${v('settlementType')==='T+1'?'selected':''}>T+1</option>
                        <option value="周结" ${v('settlementType')==='周结'?'selected':''}>周结</option>
                        <option value="月结" ${v('settlementType')==='月结'?'selected':''}>月结</option>
                    </select>
                </div>
            </div>
            <div class="form-group">
                <label>状态</label>
                <select id="f_status">
                    <option value="active" ${v('status')==='active'?'selected':''}>活跃</option>
                    <option value="pending" ${v('status')==='pending'?'selected':''}>待审</option>
                    <option value="inactive" ${v('status')==='inactive'?'selected':''}>停用</option>
                </select>
            </div>
        `;
    }
    if (type === 'orders') {
        const studios = DataManager.getStudios();
        const brands = DataManager.getBrands();
        return `
            <div class="form-row">
                <div class="form-group">
                    <label>直播间</label>
                    <select id="f_studioId">
                        ${studios.map(s => `<option value="${s.id}" ${v('studioId')===s.id?'selected':''}>${s.name}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>品牌方</label>
                    <select id="f_brandId">
                        ${brands.map(b => `<option value="${b.id}" ${v('brandId')===b.id?'selected':''}>${b.name}</option>`).join('')}
                    </select>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>金额（元）</label>
                    <input id="f_amount" type="number" step="0.01" value="${v('amount', 100)}">
                </div>
                <div class="form-group">
                    <label>数量</label>
                    <input id="f_quantity" type="number" value="${v('quantity', 1)}">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>退款金额</label>
                    <input id="f_refund" type="number" step="0.01" value="${v('refund', 0)}">
                </div>
                <div class="form-group">
                    <label>流量来源</label>
                    <select id="f_trafficSource">
                        <option value="线上（云流量）" ${v('trafficSource')==='线上（云流量）'?'selected':''}>线上（云流量）</option>
                        <option value="线下（实体流量）" ${v('trafficSource')==='线下（实体流量）'?'selected':''}>线下（实体流量）</option>
                    </select>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>日期</label>
                    <input id="f_date" type="date" value="${v('date', new Date().toISOString().split('T')[0])}">
                </div>
                <div class="form-group">
                    <label>状态</label>
                    <select id="f_status">
                        <option value="completed" ${v('status')==='completed'?'selected':''}>已完成</option>
                        <option value="refunding" ${v('status')==='refunding'?'selected':''}>退款中</option>
                        <option value="refunded" ${v('status')==='refunded'?'selected':''}>已退款</option>
                    </select>
                </div>
            </div>
        `;
    }
    if (type === 'traffic') {
        return `
            <div class="form-row">
                <div class="form-group">
                    <label>名称</label>
                    <input id="f_name" value="${v('name')}" placeholder="如：某某服务商">
                </div>
                <div class="form-group">
                    <label>类型</label>
                    <select id="f_type">
                        <option value="线下拉新" ${v('type')==='线下拉新'?'selected':''}>线下拉新</option>
                        <option value="打粉团队" ${v('type')==='打粉团队'?'selected':''}>打粉团队</option>
                    </select>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>地区</label>
                    <input id="f_region" value="${v('region', '杭州市')}">
                </div>
                <div class="form-group">
                    <label>覆盖人数</label>
                    <input id="f_scale" type="number" value="${v('scale', 10000)}">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>月产能</label>
                    <input id="f_monthlyCapacity" type="number" value="${v('monthlyCapacity', 50000)}">
                </div>
                <div class="form-group">
                    <label>佣金比例(%)</label>
                    <input id="f_commission" type="number" step="0.1" value="${v('commission', 15)}">
                </div>
            </div>
            <div class="form-group">
                <label>状态</label>
                <select id="f_status">
                    <option value="active" ${v('status')==='active'?'selected':''}>合作中</option>
                    <option value="inactive" ${v('status')==='inactive'?'selected':''}>暂停</option>
                </select>
            </div>
        `;
    }
    return '<p>未知类型</p>';
}

// ====== 保存表单 ======
function saveForm(type) {
    const getVal = (id) => document.getElementById(id)?.value;
    const getNum = (id) => parseFloat(document.getElementById(id)?.value) || 0;

    try {
        if (type === 'studios') {
            const data = {
                name: getVal('f_name') || '直播间 ***',
                trafficType: getVal('f_trafficType'),
                location: getVal('f_location') || '未知',
                storeCount: getNum('f_storeCount'),
                audienceSize: getNum('f_audienceSize'),
                orderCount: getNum('f_orderCount'),
                orderAmount: getNum('f_orderAmount'),
                refundAmount: getNum('f_refundAmount'),
                status: getVal('f_status')
            };
            if (editingId) {
                DataManager.updateStudio(editingId, data);
                showAlert('直播间已更新', 'success');
            } else {
                DataManager.addStudio(data);
                showAlert('直播间已添加', 'success');
            }
        } else if (type === 'brands') {
            const data = {
                name: getVal('f_name') || '品牌 ***',
                category: getVal('f_category'),
                productInfo: getVal('f_productInfo') || '通用产品',
                priceRange: getVal('f_priceRange') || '50-200',
                monthlySales: getNum('f_monthlySales'),
                settlementType: getVal('f_settlementType'),
                status: getVal('f_status')
            };
            if (editingId) {
                DataManager.updateBrand(editingId, data);
                showAlert('品牌方已更新', 'success');
            } else {
                DataManager.addBrand(data);
                showAlert('品牌方已添加', 'success');
            }
        } else if (type === 'orders') {
            const studioId = getVal('f_studioId');
            const brandId = getVal('f_brandId');
            const studio = DataManager.getStudios().find(s => s.id === studioId);
            const brand = DataManager.getBrands().find(b => b.id === brandId);
            const data = {
                studioId: studioId,
                studioName: studio ? studio.name : '未知',
                brandId: brandId,
                brandName: brand ? brand.name : '未知',
                brandCategory: brand ? brand.category : '未知',
                amount: getNum('f_amount'),
                quantity: getNum('f_quantity'),
                refund: getNum('f_refund'),
                trafficSource: getVal('f_trafficSource'),
                date: getVal('f_date') || new Date().toISOString().split('T')[0],
                status: getVal('f_status')
            };
            if (editingId) {
                DataManager.updateOrder(editingId, data);
                showAlert('订单已更新', 'success');
            } else {
                DataManager.addOrder(data);
                showAlert('订单已添加', 'success');
            }
        } else if (type === 'traffic') {
            const data = {
                name: getVal('f_name') || '新流量方',
                type: getVal('f_type'),
                region: getVal('f_region') || '未知',
                scale: getNum('f_scale'),
                monthlyCapacity: getNum('f_monthlyCapacity'),
                commission: getNum('f_commission'),
                status: getVal('f_status')
            };
            if (editingId) {
                DataManager.updateTrafficSource(editingId, data);
                showAlert('流量方已更新', 'success');
            } else {
                DataManager.addTrafficSource(data);
                showAlert('流量方已添加', 'success');
            }
        }
        closeModal();
        renderStats();
        renderTab(currentTab);
    } catch (e) {
        showAlert('保存失败：' + e.message, 'danger');
    }
}

// ====== 删除 ======
function openDeleteModal(type, id) {
    deleteTarget = { type, id };
    const labels = { studios: '直播间', brands: '品牌方', orders: '订单', traffic: '流量方' };
    document.getElementById('deleteMsg').textContent = `确定要删除这条${labels[type] || '记录'}吗？此操作不可撤销。`;
    document.getElementById('deleteModal').classList.add('show');
}

function closeDeleteModal() {
    document.getElementById('deleteModal').classList.remove('show');
    deleteTarget = null;
}

function setupDeleteConfirm() {
    document.getElementById('btnConfirmDelete').addEventListener('click', () => {
        if (!deleteTarget) return;
        const { type, id } = deleteTarget;
        if (type === 'studios') DataManager.deleteStudio(id);
        else if (type === 'brands') DataManager.deleteBrand(id);
        else if (type === 'orders') DataManager.deleteOrder(id);
        else if (type === 'traffic') DataManager.deleteTrafficSource(id);
        closeDeleteModal();
        showAlert('已删除', 'success');
        renderStats();
        renderTab(currentTab);
    });
}

// ====== 弹窗开关 ======
function closeModal() {
    document.getElementById('formModal').classList.remove('show');
    editingId = null;
}

// ====== Alert ======
function showAlert(msg, type = 'info') {
    const area = document.getElementById('alertArea');
    const el = document.createElement('div');
    el.className = `alert alert-${type}`;
    el.textContent = msg;
    area.appendChild(el);
    setTimeout(() => el.remove(), 3000);
}

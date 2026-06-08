/**
 * 全犀模型系统 - 数据层
 * 真实业务数据（2026年6月版）
 */

const DB_KEY = 'quanxi_model_data';

// ====== 真实业务指标（2026-06） ======
const REAL_METRICS = {
    // 平台整体
    launchDate: '2026-05-01',
    operatingDays: 30,          // 实际运营天数（5/1→6/8约39天，按30个有效销售日）
    totalAudience: 636000,      // 平台合计人数
    dailyPerCapitaSpend: 7,     // 日均人均客单价（元）
    dailyLiveHours: 1,          // 每天直播时长（小时）
    totalSales: 134400000,      // 总销售额（1亿3440万）
    brandSales: 82000000,       // 品牌方销售额（8200万，占比62%）
    otherSales: 52400000,       // 其他销售额（5240万，占比38%）

    // 直播间
    studioCount: 53,
    minAudience: 4000,
    maxAudience: 80000,
    avgAudience: 12000,

    // 品牌方
    brandCount: 540,
    productCategoryCount: 1600, // 在售品类数

    // 流量方
    trafficSourceCount: 8,
};

// ====== 城市列表 ======
const CITIES = [
    '北京市', '上海市', '广州市', '深圳市', '杭州市', '成都市', '武汉市',
    '南京市', '重庆市', '天津市', '苏州市', '西安市', '长沙市', '郑州市',
    '东莞市', '青岛市', '合肥市', '佛山市', '宁波市', '昆明市', '沈阳市',
    '大连市', '厦门市', '济南市', '南宁市', '太原市', '贵阳市', '南昌市',
    '乌鲁木齐市', '兰州市', '海口市', '呼和浩特市'
];

const REGIONS = ['华北', '华东', '华南', '华中', '西南', '西北', '东北'];

const BRAND_CATEGORIES = [
    '食品零食', '美妆护肤', '家居日用', '服装鞋包', '母婴用品',
    '数码家电', '健康保健', '宠物用品', '运动户外', '珠宝饰品'
];

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min, max, decimals = 2) {
    return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function generateDate(startStr, daysRange) {
    const d = new Date(startStr);
    d.setDate(d.getDate() + Math.floor(Math.random() * daysRange));
    return d.toISOString().split('T')[0];
}

// ====== 生成直播间（53个，符合真实指标） ======
function generateStudios() {
    const studios = [];
    const sizes = [];

    // 生成53个符合范围的受众数，总和=636000
    // 分布：30个小(4k-10k) + 10个中(10k-20k) + 8个大(20k-35k) + 5个超大(35k-80k)
    for (let i = 0; i < 30; i++) sizes.push(randomInt(4000, 10000));
    for (let i = 0; i < 10; i++) sizes.push(randomInt(10000, 20000));
    for (let i = 0; i < 8; i++) sizes.push(randomInt(20000, 35000));
    for (let i = 0; i < 5; i++) sizes.push(randomInt(35000, 80000));

    // 调整总和到636000
    const currentSum = sizes.reduce((s, v) => s + v, 0);
    const diff = REAL_METRICS.totalAudience - currentSum;
    // 把差值随机分配到各直播间
    for (let i = 0; i < Math.abs(diff); i++) {
        const idx = randomInt(0, sizes.length - 1);
        sizes[idx] += diff > 0 ? 1 : -1;
        sizes[idx] = Math.max(4000, Math.min(80000, sizes[idx]));
    }

    const trafficTypePool = ['线上', '线下', '混合'];
    for (let i = 0; i < sizes.length; i++) {
        const tt = pick(trafficTypePool);
        const isOffline = tt === '线下' || tt === '混合';
        const audience = sizes[i];
        // 销售额按受众比例分配
        const salesRatio = audience / REAL_METRICS.totalAudience;
        const orderAmount = parseFloat((REAL_METRICS.totalSales * salesRatio).toFixed(2));
        const orderCount = Math.round(orderAmount / (REAL_METRICS.dailyPerCapitaSpend * 7)); // 平均客单约50
        const refundAmount = parseFloat((orderAmount * randomFloat(0.03, 0.08)).toFixed(2));

        studios.push({
            id: `studio_${i + 1}`,
            name: `直播间 ***`,
            code: `ZB${String(i + 1).padStart(3, '0')}`,
            trafficType: tt,
            location: pick(CITIES),
            region: pick(REGIONS),
            storeCount: isOffline ? randomInt(5, 200) : 0,
            audienceSize: audience,
            orderCount: Math.max(100, orderCount),
            orderAmount: orderAmount,
            refundAmount: refundAmount,
            refundRate: parseFloat((refundAmount / orderAmount * 100).toFixed(1)),
            avgOrderValue: REAL_METRICS.dailyPerCapitaSpend,
            dailyLiveHours: REAL_METRICS.dailyLiveHours,
            status: 'active',
            tags: pick([['高转化', '大流量'], ['垂直品类', '高客单'], ['新号', '成长中'], ['品牌自播', '高复购'], ['达人播', '高互动']]),
            createdAt: generateDate('2026-05-01', 38)
        });
    }
    return studios;
}

// ====== 生成品牌方（540家） ======
function generateBrands() {
    const brands = [];
    const productTypes = ['高品质', '热销爆款', '新品', '经典款', '限量款', '定制款'];
    const productForms = ['系列', '套装', '礼盒', '单品', '家庭装'];
    const settlementTypes = ['T+1', '周结', '月结'];
    const statusPool = ['active', 'active', 'active', 'pending', 'active'];

    // 品牌方总销售额8200万，分配到540家
    // top品牌贡献大额，长尾品牌贡献小额
    for (let i = 1; i <= REAL_METRICS.brandCount; i++) {
        // 用幂律分布：前20%品牌贡献80%销售额
        const rank = i / REAL_METRICS.brandCount; // 0~1
        const weight = Math.pow(1 - rank, 2); // 头部重权
        let monthlySales;
        if (i <= 10) {
            monthlySales = randomInt(2000000, 8000000); // top10: 200万-800万
        } else if (i <= 50) {
            monthlySales = randomInt(300000, 2000000); // 11-50: 30万-200万
        } else if (i <= 200) {
            monthlySales = randomInt(50000, 300000); // 51-200: 5万-30万
        } else {
            monthlySales = randomInt(5000, 50000); // 201-540: 5千-5万
        }

        // 品牌销售额加到总品牌销售额中，不强制精确匹配
        brands.push({
            id: `brand_${i}`,
            name: `品牌 ***`,
            code: `PP${String(i).padStart(4, '0')}`,
            category: pick(BRAND_CATEGORIES),
            productInfo: `${pick(productTypes)}${pick(productForms)}`,
            priceRange: `${randomInt(19, 99)}-${randomInt(100, 999)}`,
            monthlySales: monthlySales,
            totalSales: randomInt(Math.round(monthlySales * 1.2), Math.round(monthlySales * 3)),
            status: pick(statusPool),
            contactInfo: '已脱敏',
            joinDate: generateDate('2026-05-01', 38),
            settlementType: pick(settlementTypes),
            invoiceInfo: '已脱敏',
            topSku: `SKU-${String(i).padStart(4, '0')}`,
            avatar: ''
        });
    }

    // 按销售额排序（管理后台展示好看）
    brands.sort((a, b) => b.monthlySales - a.monthlySales);
    return brands;
}

// ====== 生成订单（运营期内约30天） ======
function generateOrders(studios, brands) {
    const orders = [];
    const statusPool = ['completed', 'completed', 'completed', 'completed', 'refunding', 'refunded'];
    const paymentMethods = ['微信支付', '支付宝', '银联'];

    // 每天平均销售额 = 636000 * 7 = 4,452,000
    // 日均订单数（按平均客单价50元算）≈ 89,000单/天
    // 取样本：每天生成约200条代表性订单，30天共6000条
    const dailySampleSize = 200;
    const totalDays = 30;
    let orderIdx = 0;

    for (let day = 0; day < totalDays; day++) {
        const dateObj = new Date('2026-05-01');
        dateObj.setDate(dateObj.getDate() + day);
        const dateStr = dateObj.toISOString().split('T')[0];

        // 每天的销售额略有波动
        const dayFactor = 0.8 + Math.random() * 0.4; // 0.8 ~ 1.2
        const daySales = Math.round(REAL_METRICS.totalSales / totalDays * dayFactor);

        for (let s = 0; s < dailySampleSize; s++) {
            const studio = studios[randomInt(0, studios.length - 1)];
            const brand = brands[randomInt(0, brands.length - 1)];
            const quantity = randomInt(1, 5);
            const unitPrice = randomFloat(10, 199);
            const amount = parseFloat((unitPrice * quantity).toFixed(2));
            const isRefund = Math.random() < 0.06;
            const refund = isRefund ? parseFloat((amount * randomFloat(0.3, 1)).toFixed(2)) : 0;

            orderIdx++;
            orders.push({
                id: `order_${orderIdx}`,
                orderNo: `QX${dateStr.replace(/-/g, '')}${String(orderIdx).padStart(6, '0')}`,
                studioId: studio.id,
                studioName: studio.name,
                brandId: brand.id,
                brandName: brand.name,
                brandCategory: brand.category,
                amount: amount,
                quantity: quantity,
                refund: refund,
                trafficSource: pick(['线上（云流量）', '线上（云流量）', '线上（云流量）', '线下（实体流量）']),
                date: dateStr,
                status: pick(statusPool),
                paymentMethod: pick(paymentMethods),
                deliveryStatus: isRefund ? '已退款' : pick(['已发货', '已签收'])
            });
        }
    }

    orders.sort((a, b) => a.date.localeCompare(b.date));
    return orders;
}

// ====== 生成流量方（8个，地区精确匹配，数据减半） ======
function generateTrafficSources() {
    const sources = [
        { name: '老庞服务商', type: '线下拉新', region: '大连市', desc: '大连本地社区团长网络' },
        { name: '徐阳渠道', type: '线下拉新', region: '杭州市', desc: '杭州区域商超合作渠道' },
        { name: '成都地推团队', type: '线下拉新', region: '成都市', desc: '成都及周边城市地推团队' },
        { name: '广州批发渠道', type: '线下拉新', region: '广州市', desc: '广州批发市场商户联盟' },
        { name: '精准粉团队', type: '打粉团队', region: '深圳市', desc: '信息流投放精准获客团队' },
        { name: '短视频引流组', type: '打粉团队', region: '杭州市', desc: '抖音/视频号矩阵引流团队' },
        { name: '社群裂变组', type: '打粉团队', region: '北京市', desc: '微信社群裂变运营团队' },
        { name: '直播切片分发', type: '打粉团队', region: '成都市', desc: '直播精彩片段多平台分发团队' }
    ];

    return sources.map((s, i) => ({
        id: `traffic_${i + 1}`,
        name: s.name,
        type: s.type,
        region: s.region,
        scale: randomInt(4000, 40000),        // 减半：原 8000-80000
        monthlyCapacity: randomInt(7500, 75000),  // 减半：原 15000-150000
        commission: randomFloat(4, 12),        // 减半：原 8-25
        contact: '已脱敏',
        status: 'active',
        cooperateSince: generateDate('2026-04-01', 40),
        description: s.desc
    }));
}

// ====== 人群画像数据 ======
function generatePortraitData() {
    return {
        ageDistribution: [
            { label: '18-25岁', value: 12 },
            { label: '26-35岁', value: 35 },
            { label: '36-45岁', value: 30 },
            { label: '46-55岁', value: 16 },
            { label: '55岁以上', value: 7 }
        ],
        genderRatio: [
            { label: '女性', value: 68 },
            { label: '男性', value: 32 }
        ],
        consumptionLevel: [
            { label: '高消费(200+)', value: 12 },
            { label: '中高消费(100-200)', value: 28 },
            { label: '中等消费(50-100)', value: 38 },
            { label: '低消费(50以下)', value: 22 }
        ],
        categoryPreference: [
            { label: '食品零食', value: 28 },
            { label: '美妆护肤', value: 22 },
            { label: '家居日用', value: 18 },
            { label: '服装鞋包', value: 14 },
            { label: '母婴用品', value: 8 },
            { label: '其他', value: 10 }
        ],
        trafficSourceRatio: [
            { label: '社群分享', value: 35 },
            { label: '直播间', value: 30 },
            { label: '朋友圈', value: 18 },
            { label: '搜索入口', value: 10 },
            { label: '其他', value: 7 }
        ],
        repurchaseRate: [
            { label: '1次', value: 25 },
            { label: '2-3次', value: 35 },
            { label: '4-6次', value: 22 },
            { label: '7次以上', value: 18 }
        ]
    };
}

// ====== 管理后台统计 ======
function computeStats() {
    const totalRefund = REAL_METRICS.totalSales * 0.05; // 约5%退款率
    return {
        studioCount: REAL_METRICS.studioCount,
        activeStudioCount: REAL_METRICS.studioCount,
        brandCount: REAL_METRICS.brandCount,
        activeBrandCount: Math.round(REAL_METRICS.brandCount * 0.85),
        orderCount: null, // 由实际订单数填充
        totalOrderAmount: REAL_METRICS.totalSales,
        totalRefund: Math.round(totalRefund),
        netAmount: REAL_METRICS.totalSales - Math.round(totalRefund),
        brandSales: REAL_METRICS.brandSales,
        brandSalesRatio: 62,
        otherSales: REAL_METRICS.otherSales,
        otherSalesRatio: 38,
        completedOrders: null,
        avgOrderValue: REAL_METRICS.dailyPerCapitaSpend
    };
}

// ====== 数据管理器 ======
const DataManager = {
    _data: null,

    init() {
        const stored = localStorage.getItem(DB_KEY);
        if (stored) {
            try {
                this._data = JSON.parse(stored);
                // 兼容旧数据：检测是否需要刷新
                if (!this._data.metrics || this._data.metrics.studioCount !== 53) {
                    this._data = this._generateFresh();
                    this.save();
                }
                return;
            } catch (e) { /* fall through */ }
        }
        this._data = this._generateFresh();
        this.save();
    },

    _generateFresh() {
        const studios = generateStudios();
        const brands = generateBrands();
        const orders = generateOrders(studios, brands);
        const trafficSources = generateTrafficSources();
        const portraitData = generatePortraitData();
        const stats = computeStats();
        stats.orderCount = orders.length;
        stats.completedOrders = orders.filter(o => o.status === 'completed').length;
        return {
            metrics: REAL_METRICS,
            studios,
            brands,
            orders,
            trafficSources,
            portraitData,
            stats
        };
    },

    save() {
        localStorage.setItem(DB_KEY, JSON.stringify(this._data));
    },

    reset() {
        this._data = this._generateFresh();
        this.save();
    },

    getMetrics() { return this._data.metrics || REAL_METRICS; },
    getStudios() { return this._data.studios; },
    getBrands() { return this._data.brands; },
    getOrders() { return this._data.orders; },
    getTrafficSources() { return this._data.trafficSources; },
    getPortraitData() { return this._data.portraitData; },

    // ====== CRUD: 直播间 ======
    addStudio(studio) {
        studio.id = `studio_${Date.now()}`;
        studio.refundRate = parseFloat((studio.refundAmount / studio.orderAmount * 100).toFixed(1));
        studio.avgOrderValue = parseFloat((studio.orderAmount / studio.orderCount).toFixed(2));
        this._data.studios.push(studio);
        this._data.stats.studioCount = this._data.studios.length;
        this.save();
        return studio;
    },
    updateStudio(id, data) {
        const idx = this._data.studios.findIndex(s => s.id === id);
        if (idx === -1) return null;
        Object.assign(this._data.studios[idx], data);
        const s = this._data.studios[idx];
        s.refundRate = parseFloat((s.refundAmount / s.orderAmount * 100).toFixed(1));
        s.avgOrderValue = parseFloat((s.orderAmount / s.orderCount).toFixed(2));
        this.save();
        return this._data.studios[idx];
    },
    deleteStudio(id) {
        this._data.studios = this._data.studios.filter(s => s.id !== id);
        this._data.stats.studioCount = this._data.studios.length;
        this.save();
    },

    // ====== CRUD: 品牌方 ======
    addBrand(brand) {
        brand.id = `brand_${Date.now()}`;
        this._data.brands.push(brand);
        this._data.stats.brandCount = this._data.brands.length;
        this.save();
        return brand;
    },
    updateBrand(id, data) {
        const idx = this._data.brands.findIndex(b => b.id === id);
        if (idx === -1) return null;
        Object.assign(this._data.brands[idx], data);
        this.save();
        return this._data.brands[idx];
    },
    deleteBrand(id) {
        this._data.brands = this._data.brands.filter(b => b.id !== id);
        this._data.stats.brandCount = this._data.brands.length;
        this.save();
    },

    // ====== CRUD: 订单 ======
    addOrder(order) {
        order.id = `order_${Date.now()}`;
        this._data.orders.push(order);
        this._data.stats.orderCount = this._data.orders.length;
        this.save();
        return order;
    },
    updateOrder(id, data) {
        const idx = this._data.orders.findIndex(o => o.id === id);
        if (idx === -1) return null;
        Object.assign(this._data.orders[idx], data);
        this.save();
        return this._data.orders[idx];
    },
    deleteOrder(id) {
        this._data.orders = this._data.orders.filter(o => o.id !== id);
        this._data.stats.orderCount = this._data.orders.length;
        this.save();
    },

    // ====== CRUD: 流量方 ======
    addTrafficSource(ts) {
        ts.id = `traffic_${Date.now()}`;
        this._data.trafficSources.push(ts);
        this.save();
        return ts;
    },
    updateTrafficSource(id, data) {
        const idx = this._data.trafficSources.findIndex(t => t.id === id);
        if (idx === -1) return null;
        Object.assign(this._data.trafficSources[idx], data);
        this.save();
        return this._data.trafficSources[idx];
    },
    deleteTrafficSource(id) {
        this._data.trafficSources = this._data.trafficSources.filter(t => t.id !== id);
        this.save();
    },

    // ====== 统计 ======
    getStats() {
        return this._data.stats || computeStats();
    },

    getTopBrands(limit = 10) {
        return [...this._data.brands]
            .filter(b => b.status === 'active')
            .sort((a, b) => b.monthlySales - a.monthlySales)
            .slice(0, limit);
    },

    getTopStudios(limit = 10) {
        return [...this._data.studios]
            .sort((a, b) => b.orderAmount - a.orderAmount)
            .slice(0, limit);
    },

    getOrdersByDateRange(start, end) {
        return this._data.orders.filter(o => o.date >= start && o.date <= end);
    }
};

// ====== 初始化 ======
DataManager.init();

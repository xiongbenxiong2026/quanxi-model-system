/**
 * 全犀模型系统 - 数据层
 * 模拟数据生成 + 数据管理（localStorage持久化）
 */

const DB_KEY = 'quanxi_model_data';

// ====== 默认模拟数据 ======

// 城市列表（用于生成逼真的地址）
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

const TRAFFIC_TYPES = ['线下拉新', '打粉团队'];

const TLS_TYPES = ['线上（云流量）', '线下（实体流量）'];

// ====== 脱敏工具 ======
function maskName(prefix, index) {
    return `${prefix}${'*'.repeat(3)}`;
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min, max, decimals = 2) {
    return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function generateDate(start, days) {
    const d = new Date(start);
    d.setDate(d.getDate() + Math.floor(Math.random() * days));
    return d.toISOString().split('T')[0];
}

// ====== 数据生成器 ======

function generateStudios(count = 50) {
    const studios = [];
    const trafficTypePool = ['线上', '线下', '混合'];
    for (let i = 1; i <= count; i++) {
        const tt = pick(trafficTypePool);
        const isOffline = tt === '线下' || tt === '混合';
        studios.push({
            id: `studio_${i}`,
            name: `直播间 ***`,
            code: `ZB${String(i).padStart(3, '0')}`,
            trafficType: tt,
            location: pick(CITIES),
            region: pick(REGIONS),
            storeCount: isOffline ? randomInt(10, 500) : 0,
            audienceSize: randomInt(10000, 500000),
            orderCount: randomInt(500, 20000),
            orderAmount: randomFloat(100000, 5000000),
            refundAmount: randomFloat(5000, 200000),
            refundRate: 0,
            avgOrderValue: 0,
            status: Math.random() > 0.15 ? 'active' : 'inactive',
            tags: pick([['高转化', '大流量'], ['垂直品类', '高客单'], ['新号', '成长中'], ['品牌自播', '高复购'], ['达人播', '高互动']]),
            createdAt: generateDate('2025-06-01', 365)
        });
    }
    // 计算衍生字段
    studios.forEach(s => {
        s.refundRate = parseFloat((s.refundAmount / s.orderAmount * 100).toFixed(1));
        s.avgOrderValue = parseFloat((s.orderAmount / s.orderCount).toFixed(2));
    });
    return studios;
}

function generateBrands(count = 300) {
    const brands = [];
    const statusPool = ['active', 'active', 'active', 'pending', 'inactive'];
    for (let i = 1; i <= count; i++) {
        brands.push({
            id: `brand_${i}`,
            name: `品牌 ***`,
            code: `PP${String(i).padStart(4, '0')}`,
            category: pick(BRAND_CATEGORIES),
            productInfo: `${pick(['高品质', '热销爆款', '新品', '经典款'])}${pick(['系列', '套装', '礼盒', '单品'])}`,
            priceRange: `${randomInt(29, 99)}-${randomInt(100, 999)}`,
            monthlySales: randomInt(10000, 5000000),
            totalSales: randomInt(50000, 50000000),
            status: pick(statusPool),
            contactInfo: '已脱敏',
            joinDate: generateDate('2026-01-01', 158),
            settlementType: pick(['T+1', '周结', '月结']),
            invoiceInfo: '已脱敏',
            topSku: `SKU-${String(i).padStart(4, '0')}`,
            avatar: ''
        });
    }
    return brands;
}

function generateOrders(studios, brands, count = 1500) {
    const orders = [];
    const statusPool = ['completed', 'completed', 'completed', 'refunding', 'refunded'];
    for (let i = 1; i <= count; i++) {
        const studio = studios[Math.floor(Math.random() * studios.length)];
        const brand = brands[Math.floor(Math.random() * brands.length)];
        const quantity = randomInt(1, 5);
        const unitPrice = randomFloat(29, 599);
        const amount = parseFloat((unitPrice * quantity).toFixed(2));
        const isRefund = Math.random() < 0.15;
        const refund = isRefund ? parseFloat((amount * randomFloat(0.3, 1)).toFixed(2)) : 0;
        orders.push({
            id: `order_${i}`,
            orderNo: `QX${String(Date.now()).slice(-6)}${String(i).padStart(6, '0')}`,
            studioId: studio.id,
            studioName: studio.name,
            brandId: brand.id,
            brandName: brand.name,
            brandCategory: brand.category,
            amount: amount,
            quantity: quantity,
            refund: refund,
            trafficSource: pick(TLS_TYPES),
            date: generateDate('2026-03-01', 100),
            status: pick(statusPool),
            paymentMethod: pick(['微信支付', '支付宝', '银联']),
            deliveryStatus: pick(['已发货', '已签收', '待发货'])
        });
    }
    // Sort by date
    orders.sort((a, b) => a.date.localeCompare(b.date));
    return orders;
}

function generateTrafficSources(count = 12) {
    const sources = [];
    const offlineNames = ['老庞服务商', '徐阳渠道', '郑州地推团队', '成都社区团长联盟', '北京商超渠道', '广州批发市场渠道'];
    const onlineNames = ['精准粉团队', '信息流优化组', '短视频引流组', '直播切片分发', '社群裂变组', 'KOL分销联盟'];

    for (let i = 0; i < count; i++) {
        const isOffline = i < count / 2;
        const namePool = isOffline ? offlineNames : onlineNames;
        sources.push({
            id: `traffic_${i + 1}`,
            name: namePool[i % namePool.length],
            type: isOffline ? '线下拉新' : '打粉团队',
            region: pick(CITIES),
            scale: randomInt(5000, 100000),
            monthlyCapacity: randomInt(10000, 200000),
            commission: randomFloat(10, 30),
            contact: '已脱敏',
            status: Math.random() > 0.1 ? 'active' : 'inactive',
            cooperateSince: generateDate('2026-01-01', 150),
            description: isOffline
                ? `线下渠道资源，覆盖${pick(['社区', '商超', '门店', '地推'])}场景`
                : `线上精准流量，擅长${pick(['短视频引流', '信息流投放', '社群裂变', '直播切片'])}`
        });
    }
    return sources;
}

// ====== 竞品模拟数据 ======
function generateCompetitors() {
    return [
        {
            name: '某某甄选',
            platform: '抖音',
            studioCount: 85,
            totalSales: 28500000,
            avgSales: 335294,
            topCategory: '食品零食',
            growthRate: '+23%',
            note: '头部直播机构'
        },
        {
            name: '某某优选',
            platform: '视频号',
            studioCount: 62,
            totalSales: 19800000,
            avgSales: 319355,
            topCategory: '家居日用',
            growthRate: '+31%',
            note: '私域直播标杆'
        },
        {
            name: '某某严选',
            platform: '快手',
            studioCount: 48,
            totalSales: 15200000,
            avgSales: 316667,
            topCategory: '美妆护肤',
            growthRate: '+18%',
            note: '供应链优势明显'
        },
        {
            name: '某某集市',
            platform: '多平台',
            studioCount: 120,
            totalSales: 42000000,
            avgSales: 350000,
            topCategory: '服装鞋包',
            growthRate: '+15%',
            note: '全品类覆盖'
        },
        {
            name: '某某好物',
            platform: '视频号',
            studioCount: 35,
            totalSales: 8900000,
            avgSales: 254286,
            topCategory: '健康保健',
            growthRate: '+42%',
            note: '增速最快的黑马'
        },
        {
            name: '某某甄选（全犀）',
            platform: '全犀平台',
            studioCount: 50,
            totalSales: 18500000,
            avgSales: 370000,
            topCategory: '综合',
            growthRate: '+67%',
            note: '全犀平台自营标杆'
        }
    ];
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
            { label: '高消费(200+)', value: 15 },
            { label: '中高消费(100-200)', value: 30 },
            { label: '中等消费(50-100)', value: 35 },
            { label: '低消费(50以下)', value: 20 }
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

// ====== 数据管理器 ======

const DataManager = {
    _data: null,

    init() {
        const stored = localStorage.getItem(DB_KEY);
        if (stored) {
            try {
                this._data = JSON.parse(stored);
                return;
            } catch (e) { /* fall through */ }
        }
        // 首次初始化
        this._data = this._generateFresh();
        this.save();
    },

    _generateFresh() {
        const studios = generateStudios(50);
        const brands = generateBrands(300);
        const orders = generateOrders(studios, brands, 1500);
        const trafficSources = generateTrafficSources();
        const competitors = generateCompetitors();
        const portraitData = generatePortraitData();
        return { studios, brands, orders, trafficSources, competitors, portraitData };
    },

    save() {
        localStorage.setItem(DB_KEY, JSON.stringify(this._data));
    },

    reset() {
        this._data = this._generateFresh();
        this.save();
    },

    getStudios() { return this._data.studios; },
    getBrands() { return this._data.brands; },
    getOrders() { return this._data.orders; },
    getTrafficSources() { return this._data.trafficSources; },
    getCompetitors() { return this._data.competitors; },
    getPortraitData() { return this._data.portraitData; },

    // ====== CRUD: 直播间 ======
    addStudio(studio) {
        studio.id = `studio_${Date.now()}`;
        studio.refundRate = parseFloat((studio.refundAmount / studio.orderAmount * 100).toFixed(1));
        studio.avgOrderValue = parseFloat((studio.orderAmount / studio.orderCount).toFixed(2));
        this._data.studios.push(studio);
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
        this.save();
    },

    // ====== CRUD: 品牌方 ======
    addBrand(brand) {
        brand.id = `brand_${Date.now()}`;
        this._data.brands.push(brand);
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
        this.save();
    },

    // ====== CRUD: 订单 ======
    addOrder(order) {
        order.id = `order_${Date.now()}`;
        this._data.orders.push(order);
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

    // ====== 统计方法 ======
    getStats() {
        const studios = this._data.studios;
        const brands = this._data.brands;
        const orders = this._data.orders;
        const totalOrderAmount = orders.reduce((s, o) => s + o.amount, 0);
        const totalRefund = orders.reduce((s, o) => s + o.refund, 0);
        return {
            studioCount: studios.length,
            activeStudioCount: studios.filter(s => s.status === 'active').length,
            brandCount: brands.length,
            activeBrandCount: brands.filter(b => b.status === 'active').length,
            orderCount: orders.length,
            totalOrderAmount: totalOrderAmount,
            totalRefund: totalRefund,
            netAmount: totalOrderAmount - totalRefund,
            completedOrders: orders.filter(o => o.status === 'completed').length,
            avgOrderValue: orders.length > 0 ? parseFloat((totalOrderAmount / orders.length).toFixed(2)) : 0
        };
    },

    getTopBrands(limit = 10) {
        return [...this._data.brands]
            .filter(b => b.status === 'active')
            .sort((a, b) => b.monthlySales - a.monthlySales)
            .slice(0, limit);
    },

    getTopStudios(limit = 10) {
        return [...this._data.studios]
            .filter(s => s.status === 'active')
            .sort((a, b) => b.orderAmount - a.orderAmount)
            .slice(0, limit);
    },

    getOrdersByDateRange(start, end) {
        return this._data.orders.filter(o => o.date >= start && o.date <= end);
    }
};

// ====== 初始化 ======
DataManager.init();

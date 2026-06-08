/**
 * 全犀模型系统 - 实时数字屏动画组件
 * 提供数字跳动 + 脉冲动画效果
 */

const LiveCounter = {
    /**
     * 渲染数字屏到指定容器
     * @param {string} containerId - 容器元素ID
     * @param {Array} items - 数据项 [{ icon, value, label, sub, color, format }]
     *   color: 'gold' | 'blue' | 'green' | 'purple' | 'rose'
     *   format: 'number' | 'money_yi' | 'money_wan' | 'percent' | 'people'
     */
    render(containerId, items) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const now = new Date();
        const timeStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`;

        container.innerHTML = `
            <div class="live-counter page-enter">
                <div class="counter-header">
                    <span class="pulse-dot"></span>
                    <span class="live-label">● 实时数据看板</span>
                    <span class="live-timestamp" id="counterTimestamp">${timeStr}</span>
                </div>
                <div class="counter-grid">
                    ${items.map((item, i) => `
                        <div class="counter-item card-enter" style="animation-delay:${0.05 * (i+1)}s">
                            <span class="counter-icon">${item.icon}</span>
                            <div class="counter-value ${item.color || 'blue'}" data-target="${item.value}" data-format="${item.format || 'number'}" data-decimals="${item.decimals || 0}">
                                0
                            </div>
                            <div class="counter-label">${item.label}</div>
                            ${item.sub ? `<div class="counter-sub">${item.sub}</div>` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        // 启动数字跳动动画
        this._animateAll();

        // 更新时间戳
        this._startClock();
    },

    _animateAll() {
        const counters = document.querySelectorAll('.counter-value');
        counters.forEach(el => this._animateNumber(el));
    },

    _animateNumber(el) {
        const target = parseFloat(el.dataset.target);
        const format = el.dataset.format || 'number';
        const decimals = parseInt(el.dataset.decimals) || 0;
        const duration = 2000; // 动画时长2秒
        const startTime = performance.now();

        function easeOutCubic(t) {
            return 1 - Math.pow(1 - t, 3);
        }

        function formatValue(val) {
            const absVal = Math.abs(val);
            switch (format) {
                case 'money_yi':
                    return (val / 100000000).toFixed(decimals) + '';
                case 'money_wan':
                    return (val / 10000).toFixed(decimals) + '';
                case 'percent':
                    return val.toFixed(decimals) + '%';
                case 'people':
                    if (absVal >= 10000) return (val / 10000).toFixed(1) + '万';
                    return val.toLocaleString();
                case 'number':
                default:
                    if (absVal >= 100000000) return (val / 100000000).toFixed(2) + '亿';
                    if (absVal >= 10000) return (val / 10000).toFixed(1) + '万';
                    return val.toLocaleString();
            }
        }

        function animate(now) {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = easeOutCubic(progress);
            const current = eased * target;
            el.textContent = formatValue(current);

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                el.textContent = formatValue(target);
            }
        }

        // 添加一个终端显示单位
        requestAnimationFrame(animate);
    },

    _startClock() {
        if (this._clockInterval) clearInterval(this._clockInterval);
        this._clockInterval = setInterval(() => {
            const el = document.getElementById('counterTimestamp');
            if (!el) { clearInterval(this._clockInterval); return; }
            const now = new Date();
            el.textContent = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`;
        }, 1000);
    }
};

"""
全犀模型系统 - 数据导出到Excel
生成与系统一致的模拟数据，输出4个Excel文件
"""

import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter
import random
import os

random.seed(42)  # 固定种子，确保与JS生成一致

# ====== 数据配置 ======
CITIES = [
    '北京市', '上海市', '广州市', '深圳市', '杭州市', '成都市', '武汉市',
    '南京市', '重庆市', '天津市', '苏州市', '西安市', '长沙市', '郑州市',
    '东莞市', '青岛市', '合肥市', '佛山市', '宁波市', '昆明市', '沈阳市',
    '大连市', '厦门市', '济南市', '南宁市', '太原市', '贵阳市', '南昌市',
    '乌鲁木齐市', '兰州市', '海口市', '呼和浩特市'
]
BRAND_CATEGORIES = [
    '食品零食', '美妆护肤', '家居日用', '服装鞋包', '母婴用品',
    '数码家电', '健康保健', '宠物用品', '运动户外', '珠宝饰品'
]

def randint(a, b):
    return random.randint(a, b)

def randfloat(a, b, d=2):
    return round(random.uniform(a, b), d)

def pick(arr):
    return random.choice(arr)

def generate_date(start_year=2025, days=365):
    import datetime
    start = datetime.date(start_year, 1, 1)
    return (start + datetime.timedelta(days=randint(0, days))).isoformat()

# ====== 生成数据 ======
def generate_studios(count=50):
    studios = []
    traffic_types = ['线上', '线下', '混合']
    for i in range(1, count + 1):
        tt = pick(traffic_types)
        is_offline = tt in ('线下', '混合')
        order_count = randint(500, 20000)
        order_amount = randfloat(100000, 5000000)
        refund_amount = randfloat(5000, 200000)
        studios.append({
            '编号': f'ZB{str(i).zfill(3)}',
            '名称': '直播间 ***',
            '流量类型': tt,
            '地点': pick(CITIES),
            '人数': randint(10000, 500000),
            '门店数(线下)': randint(10, 500) if is_offline else 0,
            '订单数': order_count,
            '订单金额(元)': order_amount,
            '退货金额(元)': refund_amount,
            '退货率': round(refund_amount / order_amount * 100, 1),
            '客单价(元)': round(order_amount / order_count, 2),
            '状态': '活跃' if random.random() > 0.15 else '停用'
        })
    return studios

def generate_brands(count=300):
    brands = []
    status_pool = ['活跃', '活跃', '活跃', '待审', '停用']
    for i in range(1, count + 1):
        ms = randint(10000, 5000000)
        brands.append({
            '编号': f'PP{str(i).zfill(4)}',
            '名称': '品牌 ***',
            '品类': pick(BRAND_CATEGORIES),
            '产品信息': f'{pick(["高品质", "热销爆款", "新品", "经典款"])}{pick(["系列", "套装", "礼盒", "单品"])}',
            '价格带(元)': f'{randint(29, 99)}-{randint(100, 999)}',
            '月销售额(元)': ms,
            '累计销售额(元)': randint(50000, 50000000),
            '结算方式': pick(['T+1', '周结', '月结']),
            '入驻日期': generate_date(2026, 158),
            '状态': pick(status_pool)
        })
    return brands

def generate_orders(studios, brands, count=1500):
    orders = []
    status_pool = ['已完成', '已完成', '已完成', '退款中', '已退款']
    for i in range(1, count + 1):
        studio = pick(studios)
        brand = pick(brands)
        quantity = randint(1, 5)
        unit_price = randfloat(29, 599)
        amount = round(unit_price * quantity, 2)
        is_refund = random.random() < 0.15
        refund = round(amount * randfloat(0.3, 1), 2) if is_refund else 0
        orders.append({
            '订单号': f'QX{str(i).zfill(8)}',
            '直播间': studio['名称'],
            '品牌方': brand['名称'],
            '品牌品类': brand['品类'],
            '金额(元)': amount,
            '数量': quantity,
            '退款金额(元)': refund,
            '流量来源': pick(['线上（云流量）', '线下（实体流量）']),
            '日期': generate_date(2026, 100),
            '状态': pick(status_pool),
            '支付方式': pick(['微信支付', '支付宝', '银联'])
        })
    orders.sort(key=lambda x: x['日期'])
    return orders

def generate_traffic(count=12):
    sources = []
    offline_names = ['老庞服务商', '徐阳渠道', '郑州地推团队', '成都社区团长联盟', '北京商超渠道', '广州批发市场渠道']
    online_names = ['精准粉团队', '信息流优化组', '短视频引流组', '直播切片分发', '社群裂变组', 'KOL分销联盟']
    for i in range(count):
        is_offline = i < count // 2
        name_pool = offline_names if is_offline else online_names
        sources.append({
            '名称': name_pool[i % len(name_pool)],
            '类型': '线下拉新' if is_offline else '打粉团队',
            '地区': pick(CITIES),
            '覆盖人数': randint(5000, 100000),
            '月产能(人)': randint(10000, 200000),
            '佣金比例(%)': randfloat(10, 30),
            '合作日期': generate_date(2026, 150),
            '状态': '合作中' if random.random() > 0.1 else '暂停',
            '说明': f'{"线下渠道资源，覆盖" + pick(["社区", "商超", "门店", "地推"]) + "场景" if is_offline else "线上精准流量，擅长" + pick(["短视频引流", "信息流投放", "社群裂变", "直播切片"])}'
        })
    return sources

# ====== Excel 导出 ======
def style_header(ws, row=1):
    """表头样式"""
    header_font = Font(name='微软雅黑', bold=True, size=11, color='FFFFFF')
    header_fill = PatternFill(start_color='2563EB', end_color='1D4ED8', fill_type='solid')
    header_align = Alignment(horizontal='center', vertical='center', wrap_text=True)
    thin_border = Border(
        left=Side(style='thin', color='D1D5DB'),
        right=Side(style='thin', color='D1D5DB'),
        top=Side(style='thin', color='D1D5DB'),
        bottom=Side(style='thin', color='D1D5DB')
    )
    for cell in ws[row]:
        cell.font = header_font
        cell.fill = header_fill
        cell.alignment = header_align
        cell.border = thin_border

def auto_width(ws, min_width=10, max_width=22):
    """自动列宽"""
    for col_cells in ws.columns:
        max_len = 0
        col_letter = get_column_letter(col_cells[0].column)
        for cell in col_cells:
            if cell.value:
                # 中文字符算2个宽度
                val = str(cell.value)
                length = sum(2 if ord(c) > 127 else 1 for c in val)
                max_len = max(max_len, length)
        width = min(max(max_len + 4, min_width), max_width)
        ws.column_dimensions[col_letter].width = width

def export_excel(data_list, filename, sheet_name):
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = sheet_name

    if not data_list:
        wb.save(filename)
        return

    # Header
    headers = list(data_list[0].keys())
    ws.append(headers)
    style_header(ws)

    # Data
    data_font = Font(name='微软雅黑', size=10)
    data_align = Alignment(horizontal='center', vertical='center')
    thin_border = Border(
        left=Side(style='thin', color='E5E7EB'),
        right=Side(style='thin', color='E5E7EB'),
        top=Side(style='thin', color='E5E7EB'),
        bottom=Side(style='thin', color='E5E7EB')
    )

    for row_data in data_list:
        row = [row_data[h] for h in headers]
        ws.append(row)

    # Style data rows
    for row in ws.iter_rows(min_row=2, max_row=ws.max_row, min_col=1, max_col=len(headers)):
        for cell in row:
            cell.font = data_font
            cell.alignment = data_align
            cell.border = thin_border

    # Highlight alternating rows
    light_fill = PatternFill(start_color='F9FAFB', end_color='F9FAFB', fill_type='solid')
    for r_idx in range(2, ws.max_row + 1, 2):
        for c_idx in range(1, len(headers) + 1):
            ws.cell(row=r_idx, column=c_idx).fill = light_fill

    auto_width(ws)
    wb.save(filename)
    print(f'[OK] 已生成: {os.path.basename(filename)} ({ws.max_row - 1} 条)')

# ====== 主程序 ======
def main():
    output_dir = os.path.expanduser('~/Downloads')

    print('正在生成数据...')
    studios = generate_studios(50)
    brands = generate_brands(300)
    orders = generate_orders(studios, brands, 1500)
    traffic = generate_traffic(12)

    print('正在导出 Excel...')
    export_excel(studios, os.path.join(output_dir, '全犀模型_01_直播间数据.xlsx'), '直播间')
    export_excel(brands, os.path.join(output_dir, '全犀模型_02_品牌方数据.xlsx'), '品牌方')
    export_excel(orders, os.path.join(output_dir, '全犀模型_03_订单数据.xlsx'), '订单')
    export_excel(traffic, os.path.join(output_dir, '全犀模型_04_流量方数据.xlsx'), '流量方')

    print(f'\n[OK] 全部导出完成！文件保存在: {output_dir}')

if __name__ == '__main__':
    main()

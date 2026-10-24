/*!
 * GoToTop - 回到顶部扇形进度按钮（纯JS插件版）
 * 引入即工作：<script src="gototop.js"></script>
 * 可选配置：window.GoToTop({ color: '#ff5e62' })
 */
(function() {
    'use strict';

    // ============ 默认配置 ============
    const DEFAULTS = {
        size: 32,              // 按钮尺寸（桌面端）
        ringWidth: 3.5,        // 进度环宽度
        color: '#ff5e62',      // 进度环颜色
        arrowColor: '#ffffff', // 箭头颜色
        style: 'breath',       // 展示样式：'arrow' 箭头 | 'breath' 呼吸灯（默认）
        breathColor: '#e6212a',// 呼吸灯颜色（深红，默认）
        breathSize: 6,         // 呼吸灯直径（半径约3px）
        hideThreshold: 80,     // 距离顶部多少px时隐藏按钮
        nearFullThreshold: 95, // 接近满圆阈值（阴影变化）
        dragThreshold: 5,      // 拖拽触发阈值（区分点击与拖拽）
        zIndex: 9999,
        bottom: 32,
        right: 32,
        mobileBreakpoint: 640,   // 移动端断点
        mobileSize: 27,
        mobileRingWidth: 3,
        mobileBottom: 20,
        mobileRight: 20,
        smallBreakpoint: 380,    // 小屏断点
        smallSize: 23,
        smallRingWidth: 2.5,
        smallBottom: 14,
        smallRight: 14
    };

    // 已初始化标记（防止重复加载）
    if (window.__GOTOTOP_LOADED__) return;
    window.__GOTOTOP_LOADED__ = true;

    let cfg = { ...DEFAULTS };
    let btn = null;
    let progressRing = null;
    let tooltip = null;
    let styleEl = null;
    let resizeObserver = null;

    // 状态
    let currentProgress = 0;
    let rafId = null;
    let ticking = false;
    let isDragging = false;
    let dragMoved = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let dragBtnStartX = 0;
    let dragBtnStartY = 0;

    // ============ 构建 CSS ============
    function buildCSS() {
        return `.gototop-btn{--gt-progress:0;--gt-size:${cfg.size}px;--gt-ring-width:${cfg.ringWidth}px;--gt-color:${cfg.color};--gt-shadow:0 4px 16px rgba(0,0,0,.12);--gt-shadow-hover:0 6px 24px rgba(255,94,98,.35);position:fixed;bottom:${cfg.bottom}px;right:${cfg.right}px;width:var(--gt-size);height:var(--gt-size);cursor:pointer;z-index:${cfg.zIndex};border:none;background:transparent;outline:none;-webkit-tap-highlight-color:transparent;touch-action:none;transition:transform .25s cubic-bezier(.34,1.56,.64,1),opacity .35s ease;opacity:1;margin:0;padding:0}.gototop-btn.gototop-hidden{opacity:0;pointer-events:none;transform:scale(.7)}.gototop-btn.gototop-dragging{cursor:grabbing;transition:none;transform:none!important}.gototop-btn:hover{transform:scale(1.08)}.gototop-btn:active{transform:scale(.94);transition:transform .1s ease}.gototop-btn .gototop-ring{position:absolute;inset:0;border-radius:50%;background:conic-gradient(from 0deg,var(--gt-color) 0% calc(var(--gt-progress)*1%),transparent calc(var(--gt-progress)*1%) 100%);pointer-events:none;box-shadow:var(--gt-shadow)}.gototop-btn .gototop-ring.gototop-full{box-shadow:var(--gt-shadow-hover)}.gototop-btn .gototop-inner{position:absolute;inset:var(--gt-ring-width);border-radius:50%;background:transparent;display:flex;align-items:center;justify-content:center;box-shadow:inset 0 1px 2px rgba(0,0,0,.04);pointer-events:none;transition:background .3s ease}.gototop-btn:hover .gototop-inner{background:transparent}.gototop-btn .gototop-arrow{width:11px;height:11px;pointer-events:none;transition:transform .3s cubic-bezier(.34,1.56,.64,1)}.gototop-btn:hover .gototop-arrow{transform:translateY(-4px)}.gototop-btn:active .gototop-arrow{transform:translateY(-6px) scale(.9)}.gototop-btn .gototop-breath{width:${cfg.breathSize}px;height:${cfg.breathSize}px;border-radius:50%;background:${cfg.breathColor};pointer-events:none;opacity:.38;animation:gototop-breath 2s ease-in-out infinite;box-shadow:0 0 4px 1px ${cfg.breathColor}}@keyframes gototop-breath{0%,100%{opacity:.38;box-shadow:0 0 4px 1px ${cfg.breathColor}}50%{opacity:.9;box-shadow:0 0 8px 3px ${cfg.breathColor}}}.gototop-btn .gototop-tooltip{position:absolute;bottom:calc(100% + 10px);left:50%;transform:translateX(-50%);background:#333;color:#fff;font-size:.75rem;padding:5px 10px;border-radius:6px;white-space:nowrap;opacity:0;pointer-events:none;transition:opacity .25s ease;letter-spacing:.03em}.gototop-btn:hover .gototop-tooltip{opacity:1}.gototop-btn .gototop-tooltip:after{content:'';position:absolute;top:100%;left:50%;transform:translateX(-50%);border:5px solid transparent;border-top-color:#333}@media(max-width:${cfg.mobileBreakpoint}px){.gototop-btn{bottom:${cfg.mobileBottom}px;right:${cfg.mobileRight}px;--gt-size:${cfg.mobileSize}px;--gt-ring-width:${cfg.mobileRingWidth}px}.gototop-btn .gototop-arrow{width:9px;height:9px}}@media(max-width:${cfg.smallBreakpoint}px){.gototop-btn{bottom:${cfg.smallBottom}px;right:${cfg.smallRight}px;--gt-size:${cfg.smallSize}px;--gt-ring-width:${cfg.smallRingWidth}px}.gototop-btn .gototop-arrow{width:8px;height:8px}}@media print{.gototop-btn{display:none!important}}@media(prefers-reduced-motion:reduce){.gototop-btn{transition:opacity .15s ease}.gototop-btn:hover{transform:none}.gototop-btn .gototop-arrow{transition:none}.gototop-btn .gototop-breath{animation:none;opacity:.6}}`;
    }

    // ============ 创建 DOM ============
    function createDOM() {
        // 注入样式
        styleEl = document.createElement('style');
        styleEl.id = 'gototop-styles';
        styleEl.textContent = buildCSS();
        document.head.appendChild(styleEl);

        // 创建按钮
        btn = document.createElement('button');
        btn.className = 'gototop-btn';
        btn.setAttribute('aria-label', '回到页面顶部');
        btn.setAttribute('title', '回到顶部');

        // 外环进度
        progressRing = document.createElement('span');
        progressRing.className = 'gototop-ring';

        // 内圈 + 指示器（箭头 或 呼吸灯）
        const inner = document.createElement('span');
        inner.className = 'gototop-inner';
        if (cfg.style === 'breath') {
            inner.innerHTML = `<span class="gototop-breath"></span>`;
        } else {
            inner.innerHTML = `<svg class="gototop-arrow" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 19V5" stroke="${cfg.arrowColor}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/><path d="M5 12L12 5L19 12" stroke="${cfg.arrowColor}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
        }

        // 百分比提示
        tooltip = document.createElement('span');
        tooltip.className = 'gototop-tooltip';
        tooltip.textContent = '0%';

        btn.appendChild(progressRing);
        btn.appendChild(inner);
        btn.appendChild(tooltip);
        document.body.appendChild(btn);
    }

    // ============ 计算滚动进度 ============
    function calculateProgress() {
        const scrollTop = window.scrollY || window.pageYOffset;
        const docHeight = document.documentElement.scrollHeight;
        const viewportHeight = document.documentElement.clientHeight;
        const maxScroll = docHeight - viewportHeight;

        if (maxScroll <= 0) return 0;

        const progress = Math.min((scrollTop / maxScroll) * 100, 100);
        return Math.max(progress, 0);
    }

    // ============ 更新 UI ============
    function updateUI(progress) {
        btn.style.setProperty('--gt-progress', progress.toFixed(2));
        tooltip.textContent = Math.round(progress) + '%';

        if (progress >= cfg.nearFullThreshold) {
            progressRing.classList.add('gototop-full');
        } else {
            progressRing.classList.remove('gototop-full');
        }

        const scrollTop = window.scrollY || window.pageYOffset;
        if (scrollTop <= cfg.hideThreshold) {
            btn.classList.add('gototop-hidden');
        } else {
            btn.classList.remove('gototop-hidden');
        }
    }

    // ============ 滚动处理（RAF 节流） ============
    function onScroll() {
        if (!ticking) {
            ticking = true;
            rafId = requestAnimationFrame(() => {
                currentProgress = calculateProgress();
                updateUI(currentProgress);
                ticking = false;
            });
        }
    }

    // ============ 回到顶部 ============
    function scrollToTop() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // ============ 拖拽功能 ============
    function onPointerDown(e) {
        if (e.button !== 0) return;

        const rect = btn.getBoundingClientRect();
        dragStartX = e.clientX;
        dragStartY = e.clientY;
        dragBtnStartX = rect.left;
        dragBtnStartY = rect.top;
        dragMoved = false;
        isDragging = true;

        btn.setPointerCapture(e.pointerId);
        btn.classList.add('gototop-dragging');
        e.preventDefault();
    }

    function onPointerMove(e) {
        if (!isDragging) return;

        const dx = e.clientX - dragStartX;
        const dy = e.clientY - dragStartY;

        if (Math.abs(dx) > cfg.dragThreshold || Math.abs(dy) > cfg.dragThreshold) {
            dragMoved = true;
        }

        const maxX = window.innerWidth - btn.offsetWidth;
        const maxY = window.innerHeight - btn.offsetHeight;

        let newX = dragBtnStartX + dx;
        let newY = dragBtnStartY + dy;
        newX = Math.max(0, Math.min(newX, maxX));
        newY = Math.max(0, Math.min(newY, maxY));

        btn.style.left = newX + 'px';
        btn.style.top = newY + 'px';
        btn.style.right = 'auto';
        btn.style.bottom = 'auto';
    }

    function onPointerUp(e) {
        if (!isDragging) return;
        isDragging = false;
        btn.classList.remove('gototop-dragging');
        btn.releasePointerCapture(e.pointerId);

        if (!dragMoved) {
            scrollToTop();
        }
        dragMoved = false;
    }

    // ============ 键盘事件 ============
    function onKeyDown(e) {
        if (e.key === 'Enter' || e.key === ' ' || e.code === 'Space') {
            e.preventDefault();
            scrollToTop();
        }
    }

    // ============ 窗口变化 ============
    function onResize() {
        currentProgress = calculateProgress();
        updateUI(currentProgress);
    }

    // ============ 初始化 ============
    function init() {
        createDOM();
        currentProgress = calculateProgress();
        updateUI(currentProgress);

        window.addEventListener('scroll', onScroll, { passive: true });
        btn.addEventListener('pointerdown', onPointerDown);
        btn.addEventListener('pointermove', onPointerMove);
        btn.addEventListener('pointerup', onPointerUp);
        btn.addEventListener('pointercancel', onPointerUp);
        btn.addEventListener('keydown', onKeyDown);
        window.addEventListener('resize', onResize, { passive: true });

        if (window.ResizeObserver) {
            resizeObserver = new ResizeObserver(onResize);
            resizeObserver.observe(document.body);
        }
    }

    // ============ 销毁 ============
    function destroy() {
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('resize', onResize);
        if (btn) {
            btn.removeEventListener('pointerdown', onPointerDown);
            btn.removeEventListener('pointermove', onPointerMove);
            btn.removeEventListener('pointerup', onPointerUp);
            btn.removeEventListener('pointercancel', onPointerUp);
            btn.removeEventListener('keydown', onKeyDown);
            btn.remove();
        }
        if (styleEl) styleEl.remove();
        if (resizeObserver) resizeObserver.disconnect();
        if (rafId) cancelAnimationFrame(rafId);
        window.__GOTOTOP_LOADED__ = false;
    }

    // ============ 暴露全局接口 ============
    window.GoToTop = function(options) {
        // 如果已初始化，先销毁再按新配置重建
        if (btn) destroy();
        cfg = { ...DEFAULTS, ...options };
        init();
    };
    window.GoToTop.destroy = destroy;

    // ============ 自动启动 ============
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => init());
    } else {
        init();
    }
})();

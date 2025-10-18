let scrollAmount = 0;
const maxScroll = 1000;
let progressBarsAnimated = false;
let justReachedMax = false;
let scrollLockTimeout = null;

function animateProgressBars() {
    if (progressBarsAnimated) return;
    progressBarsAnimated = true;

    const progressBars = document.querySelectorAll('.progress-bar');
    progressBars.forEach((bar) => {
        const fill = bar.querySelector('.progress-fill');
        const targetValue = parseInt(bar.dataset.value);
        const maxValue = parseInt(bar.dataset.max);
        const percentage = (targetValue / maxValue) * 100;

        setTimeout(() => {
            fill.style.width = `${percentage}%`;
        }, 100);
    });
}

document.addEventListener('wheel', (e) => {
    const wasFullyExpanded = scrollAmount >= maxScroll;
    const isFullyExpanded = scrollAmount >= maxScroll;

    if (isFullyExpanded && !justReachedMax) {
        const contentArea = document.querySelector('.content-container .content');
        const isOverContent = contentArea && contentArea.contains(e.target);

        if (isOverContent) {
            return;
        }
    }

    e.preventDefault();

    scrollAmount += e.deltaY;
    scrollAmount = Math.max(0, Math.min(maxScroll, scrollAmount));

    if (!wasFullyExpanded && scrollAmount >= maxScroll) {
        justReachedMax = true;
        if (scrollLockTimeout) clearTimeout(scrollLockTimeout);
        scrollLockTimeout = setTimeout(() => {
            justReachedMax = false;
        }, 800);
    }

    const topLayer = document.querySelector('.top-layer');
    const bottomLayer = document.querySelector('.bottom-layer');
    const contentContainer = document.querySelector('.content-container');
    const darkOverlay = document.querySelector('.dark-overlay');

    const progress = scrollAmount / maxScroll;
    const topOffset = progress * 45;
    const bottomOffset = progress * 55;

    topLayer.style.transform = `translateY(-${topOffset}vh)`;
    bottomLayer.style.transform = `translateY(${bottomOffset}vh)`;

    const overlayOpacity = scrollAmount / maxScroll;
    const contentOpacity = Math.max(0, (scrollAmount - maxScroll * 0.4) / (maxScroll * 0.6));

    contentContainer.style.opacity = contentOpacity;
    darkOverlay.style.opacity = overlayOpacity;

    if (contentOpacity >= 0.95) {
        animateProgressBars();
    }

    document.body.style.height = `${100 + scrollAmount}vh`;
}, { passive: false });

document.querySelectorAll('.staff-item').forEach(item => {
    const img = item.querySelector('img');
    const staffName = item.dataset.staff;
    const normalSrc = `./imgs/staff/${staffName}.gif`;
    const animSrc = `./imgs/staff/${staffName} anim.gif`;

    item.addEventListener('mouseenter', () => {
        img.src = animSrc;
    });

    item.addEventListener('mouseleave', () => {
        img.src = normalSrc;
    });
});

const contentArea = document.querySelector('.content-container .content');
if (contentArea) {
    contentArea.addEventListener('click', () => {
        justReachedMax = false;
        if (scrollLockTimeout) {
            clearTimeout(scrollLockTimeout);
            scrollLockTimeout = null;
        }
    });
}

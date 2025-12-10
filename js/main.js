document.addEventListener('DOMContentLoaded', () => {
    // ==================== GSAP 플러그인 ====================
    gsap.registerPlugin(ScrollTrigger);

    // ==================== Lenis ====================
    const lenis = new Lenis({
        duration: 0.8,
        easing: (t) => t,
        smooth: true,
        smoothTouch: true,
    });

    function raf(t) {
        lenis.raf(t);
        ScrollTrigger.update();
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    const header = document.querySelector('header');
    const contentsSection = document.querySelector('.contents');

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    header.classList.add('dark');
                } else {
                    header.classList.remove('dark');
                }
            });
        },
        { threshold: 0.3 }
    );

    observer.observe(contentsSection);

    // ==================== Intro 스크롤 애니메이션 ====================
    const introTimeline = gsap.timeline({
        scrollTrigger: {
            trigger: '.intro',
            start: 'top top',
            end: '+=200%',
            scrub: 2,
            pin: true,
            markers: false,
        }
    });

    introTimeline
        .to('.sunflower01', {
            x: 200,
            y: 500,
            scale: 1,
            ease: 'none'
        }, 0)
        .to('.intro_text', {
            opacity: 1,
            y: 0,
            ease: 'none'
        }, 0)
        .to({}, { duration: 2 });

    // ==================== Contents 섹션 고정 ====================
    ScrollTrigger.create({
        trigger: '.contents',
        start: 'top top',
        end: '+=200%',
        pin: true,
        pinSpacing: true,
        markers: false,
    });
    // ==================== Projects Z축 애니메이션 (섹션 고정) ====================
    const projectsTimeline = gsap.timeline({
        scrollTrigger: {
            trigger: '.projects',
            start: 'top top',
            end: '+=400%', // 4개 박스 * 100%
            scrub: 1,
            pin: true,
            markers: false,
            onUpdate: (self) => {
                // 스크롤 진행도에 따라 z-index 관리 (양방향 스크롤 지원)
                const progress = self.progress;
                const totalDuration = 4; // 전체 타임라인 길이 (4개 박스 * 1초)
                const boxes = gsap.utils.toArray('.box');

                boxes.forEach((box, index) => {
                    const boxStartTime = index * 1; // 각 박스 시작 시간 (0, 1, 2, 3)
                    const boxActiveStart = boxStartTime / totalDuration; // progress 기준 시작
                    const boxActiveEnd = (boxStartTime + 0.8) / totalDuration; // progress 기준 종료 (0.8초 동안 활성)

                    // 박스가 활성 구간에 있으면 z-index 높이기
                    if (progress >= boxActiveStart && progress <= boxActiveEnd) {
                        gsap.set(box, { zIndex: 100 });
                    } else {
                        gsap.set(box, { zIndex: 1 });
                    }
                });
            }
        }
    });

    // 각 박스를 순차적으로 나타났다가 사라지게
    const boxes = gsap.utils.toArray('.box');

    boxes.forEach((box, index) => {
        const startTime = index * 1; // 각 박스 시작 시간

        projectsTimeline
            // 박스 나타나기
            .to(box, {
                x: '-50%',
                y: '-50%',
                z: 0,
                scale: 1,
                opacity: 1,
                zIndex: 100, // 앞으로 가져오기
                duration: 0.4,
                ease: 'power2.out'
            }, startTime)
            // 박스 유지 (링크 클릭 가능 시간)
            .to({}, { duration: 0.4 })
            // 박스 사라지기
            .to(box, {
                z: 1000,
                scale: 1.2,
                opacity: 0,
                zIndex: 1, // 다시 뒤로
                duration: 0.2,
                ease: 'power2.in'
            }, startTime + 0.8);
    });
})
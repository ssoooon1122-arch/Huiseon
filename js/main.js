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
    const projectsTimeline = gsap.timeline({
        scrollTrigger: {
            trigger: '.projects',
            start: 'top top',
            end: '+=400%',   // 필요하면 나중에 600%로 늘려도 됨
            scrub: 1,
            pin: true,
            markers: false,
        }
    });

    const boxes = gsap.utils.toArray('.box');

    boxes.forEach((box, index) => {
        const startTime = index * 1.5;   // 전체 간격도 살짝 늘려줌 (0, 1.5, 3, 4.5)

        projectsTimeline
            // 1) 앞으로 천천히 당겨오기
            .to(box, {
                // 위치 관련 값 X, Y, left 건드리지 않기!
                z: 0,
                scale: 1,
                opacity: 1,
                zIndex: 100,
                duration: 0.8,          // ★ 0.4 → 0.8 로 두 배 느리게
                ease: 'power2.out'
            }, startTime)

            // 2) 잠깐 유지 (조금 줄여도 됨)
            .to({}, { duration: 0.5 })

            // 3) 뒤로 밀리면서 사라지기
            .to(box, {
                z: 1000,
                scale: 1.3,
                opacity: 0,
                zIndex: 1,
                duration: 0.4,          // 0.2 → 0.4 로 부드럽게
                ease: 'power2.in'
            }, startTime + 1.3);      // 0.8 + 0.5 이후에 시작
    });

})
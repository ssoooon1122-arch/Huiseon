document.addEventListener('DOMContentLoaded', () => {
    // ==================== GSAP 플러그인 ====================
    gsap.registerPlugin(ScrollTrigger);

    // ==================== Lenis ====================
    const lenis = new Lenis({
        duration: 0.8,
        easing: (t) => t, // 선형 (빠른 반응)
        smooth: true,
        smoothTouch: true, // 모바일 터치 스크롤 부드럽게
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
            end: 'bottom top',
            scrub: 1,
            pin: true,
            markers: false, // 디버깅 시 true로 변경
        }
    });

    // 영상을 y: 100, x: 100으로 이동하면서 텍스트 표시
    introTimeline
        .to('.sunflower01', {
            x: 200,
            y: 200,
            scale: 1,
            duration: 1,
            ease: 'power2.inOut'
        })
        .to('.intro_text', {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power2.out'
        }, '-=0.5'); // 영상 이동과 약간 겹치게 시작
})



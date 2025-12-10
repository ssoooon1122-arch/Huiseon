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
    // ==================== PROJECTS 3D Tunnel Effect ====================

    const boxes = gsap.utils.toArray('.box');

    // 1. 설정값 조절
    const zGap = 1500;       // 박스 사이의 깊이 간격 (너무 멀면 안 보임)
    const xOffset = 300;     // 좌우로 벌어질 거리 (픽셀 단위)
    const totalDistance = zGap * boxes.length;

    // 2. 초기 위치 세팅 (지그재그 배치 + 깊이 배치)
    boxes.forEach((box, i) => {
        // 홀수는 왼쪽(-), 짝수는 오른쪽(+)
        // i % 2 === 0 은 짝수(0, 2, 4...), i % 2 !== 0 은 홀수(1, 3...)
        const xPosition = (i % 2 === 0) ? xOffset : -xOffset;

        gsap.set(box, {
            z: -i * zGap,       // 뒤쪽으로 배치
            x: xPosition,       // 좌우 지그재그 배치
            xPercent: -50,      // 요소의 중심을 맞추기 위한 보정
            yPercent: -50,      // 요소의 중심을 맞추기 위한 보정
            opacity: 0          // 처음엔 부드럽게 등장시키기 위해 0
        });
    });

    // 3. 메인 스크롤 타임라인
    const projectsTimeline = gsap.timeline({
        scrollTrigger: {
            trigger: '.projects',
            start: 'top top',
            end: `+=${totalDistance}`,
            scrub: 1,
            pin: true,
            markers: false
        }
    });

    // 4. 전체 박스를 앞으로 당겨오는 애니메이션
    projectsTimeline.to(boxes, {
        z: (i) => {
            return (boxes.length - i) * zGap; // 맨 뒤 박스가 맨 앞까지 오도록 계산
        },
        ease: 'none',
        duration: 1
    });

    // 5. 개별 박스 투명도(Opacity) 제어 - "뒤에 있는 것도 보이게"
    boxes.forEach((box) => {
        gsap.to(box, {
            scrollTrigger: {
                trigger: '.projects',
                start: 'top top',
                end: `+=${totalDistance}`,
                scrub: true,
                onUpdate: () => {
                    const currentZ = gsap.getProperty(box, "z");

                    // (1) 아주 멀리 있을 때 (-5000 ~ -2000): 희미하게 보임 (0.2 ~ 0.5)
                    // (2) 다가올 때 (-2000 ~ 0): 선명해짐 (1)
                    // (3) 지나칠 때 (0 ~ 500): 사라짐 (0)

                    if (currentZ < -5000) {
                        // 너무 멀면 안 보임
                        gsap.set(box, { opacity: 0 });
                    }
                    else if (currentZ >= -5000 && currentZ < -1000) {
                        // 저 멀리서 다가오는 중 (점점 선명해짐)
                        // 거리에 따라 0.1 ~ 0.8 정도로 계산
                        const opacity = 1 - (Math.abs(currentZ) / 5000);
                        gsap.set(box, { opacity: opacity * 0.8 });
                    }
                    else if (currentZ >= -1000 && currentZ <= 200) {
                        // 눈앞에 왔을 때 (완전 선명)
                        gsap.set(box, { opacity: 1 });
                    }
                    else {
                        // 카메라 뒤로 지나감 (사라짐)
                        gsap.set(box, { opacity: 0 });
                    }
                }
            }
        });
    });

});
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

    const projectSection = document.querySelector('.projects');
    const boxes = gsap.utils.toArray('.box');

    // 박스 하나당 깊이 간격 (이 값을 늘리면 박스 사이 거리가 멀어짐)
    const zGap = 3000;

    // 전체 이동해야 할 거리
    const totalDistance = zGap * boxes.length;

    // 1. 초기 위치 설정: 박스들을 화면 뒤쪽(Z축 음수)으로 일렬 배치
    // 맨 첫 박스는 0, 두 번째는 -3000, 세 번째는 -6000...
    boxes.forEach((box, i) => {
        gsap.set(box, {
            z: -i * zGap,
            opacity: i === 0 ? 1 : 0 // 첫 번째만 일단 보이게
        });
    });

    // 2. 메인 스크롤 애니메이션
    const projectsTimeline = gsap.timeline({
        scrollTrigger: {
            trigger: '.projects',
            start: 'top top',
            end: `+=${totalDistance}`, // 박스 개수에 맞춰 스크롤 길이 확보
            scrub: 1, // 부드럽게 따라오게
            pin: true,
            markers: false
        }
    });

    // 3. 모든 박스를 동시에 앞으로 당겨옴
    projectsTimeline.to(boxes, {
        z: (i) => {
            // 현재 위치에서 (박스 갯수 * 간격) 만큼 앞으로 이동
            // 결과적으로 맨 뒤에 있던 박스가 맨 앞으로 옴
            return (boxes.length - i) * zGap;
        },
        ease: 'none',
        duration: 1
    });

    // 4. 개별 박스의 투명도(Opacity) 제어
    // 박스가 "눈앞"에 왔을 때만 보이고, 너무 멀거나 지나치면 사라지게 함
    boxes.forEach((box) => {
        gsap.to(box, {
            scrollTrigger: {
                trigger: '.projects',
                start: 'top top',
                end: `+=${totalDistance}`,
                scrub: true,
                onUpdate: () => {
                    // 현재 박스의 Z값 실시간 조회
                    const currentZ = gsap.getProperty(box, "z");

                    // Z위치에 따른 투명도 계산
                    // -500 ~ 500 사이: 아주 잘 보임 (opacity 1)
                    // 그 외: 점점 흐려짐

                    if (currentZ > -2000 && currentZ < 1000) {
                        // 가까이 올수록 선명해지다가
                        let opacity = 1;

                        // 너무 가까워져서 화면 뚫고 나갈 땐 흐려지게 (0~500 구간)
                        if (currentZ > 200) {
                            opacity = 1 - ((currentZ - 200) / 500);
                        }
                        // 너무 멀리 있을 땐 흐리게 (-2000 ~ -500 구간)
                        else if (currentZ < -500) {
                            opacity = 1 - (Math.abs(currentZ + 500) / 1500);
                        }

                        gsap.set(box, { opacity: Math.max(0, opacity), pointerEvents: "auto" });
                    } else {
                        // 시야 밖이면 숨김
                        gsap.set(box, { opacity: 0, pointerEvents: "none" });
                    }
                }
            }
        });
    });

}); // addEventListener 닫는 괄호
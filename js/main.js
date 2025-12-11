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
        trigger: 'section.contents',
        start: 'top top',
        end: '+=200%',
        pin: true,
        pinSpacing: true,
        markers: false,
    });
    // main.js - Projects 섹션 부분 (전체 교체)

    // ==============================================
    // ★ PROJECTS 3D Tunnel & Drop Effect ★
    // ==============================================

    const projectsSection = document.querySelector('.projects');
    const boxes = gsap.utils.toArray('.box');

    // 1. 설정값 조절 (취향에 따라 숫자 조절 가능)
    const zGap = 2000;        // 박스 간격 (넓을수록 깊이감 커짐)
    const xOffset = 400;      // 좌우 벌어짐 정도
    const totalDistance = zGap * boxes.length;

    // 2. 초기 위치 세팅
    boxes.forEach((box, i) => {
        // 지그재그 배치: 짝수는 오른쪽(+), 홀수는 왼쪽(-)
        const xPosition = (i % 2 === 0) ? -xOffset : xOffset;

        gsap.set(box, {
            z: -i * zGap,       // 뒤쪽 깊숙이 배치
            x: xPosition,       // 좌우 배치
            xPercent: -50,      // 중심점 보정
            yPercent: -50,      // 중심점 보정
            opacity: 0,         // 처음엔 숨김
            filter: "blur(10px)" // 멀리 있을 땐 흐리게 시작
        });
    });

    // 3. 메인 스크롤 타임라인
    const projectsTimeline = gsap.timeline({
        scrollTrigger: {
            trigger: '.projects',
            start: 'top top',
            // ★ 중요: 스크롤 길이를 충분히 줘서 마지막 카드가 지나갈 시간을 확보
            end: `+=${totalDistance + 2000}`,
            scrub: 2.0, // 숫자가 클수록 스크롤 멈췄을 때 미끄러지는(부드러운) 느낌이 강함
            pin: true,
            markers: false
        }
    });

    // 4. 애니메이션: 박스들이 화면을 뚫고 지나가도록 설정
    projectsTimeline.to(boxes, {
        z: (i) => {
            // 기존: (boxes.length - i) * zGap  --> 0에서 멈춤
            // 수정: 마지막 카드가 화면(0)을 넘어 2000px 뒤로 날아가버리게 함
            return (boxes.length - i) * zGap + 2000;
        },
        ease: 'none', // 등속 운동 (그래야 내가 스크롤하는 만큼 움직임)
        duration: 1
    });

    // 5. 개별 박스 시각 효과 (투명도 & 블러)
    boxes.forEach((box) => {
        gsap.to(box, {
            scrollTrigger: {
                trigger: '.projects',
                start: 'bottom bottom',
                end: `+=${totalDistance + 2000}`,
                scrub: true,
                onUpdate: () => {
                    const currentZ = gsap.getProperty(box, "z");

                    // ★ 이 구간에선 버튼/링크 클릭 허용
                    const isActive = currentZ >= -10000 && currentZ <= 5000;
                    gsap.set(box, { pointerEvents: isActive ? "auto" : "none" });

                    // (1) 아주 멀 때: 안 보임
                    if (currentZ < -4000) {
                        gsap.set(box, { opacity: 0, filter: "blur(20px)" });
                    }
                    // (2) 다가오는 중: 점점 선명해짐 (-4000 ~ -500)
                    else if (currentZ >= -4000 && currentZ < -500) {
                        const progress = 1 - (Math.abs(currentZ) / 4000); // 0 ~ 1
                        gsap.set(box, {
                            opacity: progress,
                            filter: `blur(${(1 - progress) * 10}px)` // 가까울수록 블러 제거
                        });
                    }
                    // (3) 눈 앞 (하이라이트): 완전 선명 (-500 ~ 500)
                    else if (currentZ >= -500 && currentZ <= 500) {
                        gsap.set(box, { opacity: 1, filter: "blur(0px)" });
                    }
                    // (4) 지나쳐서 사라질 때: 빠르게 흐려짐 (500 ~ )
                    else {
                        // 화면을 뚫고 지나가면 흐려지면서 사라짐
                        const fadeOut = Math.max(0, 1 - (currentZ - 500) / 1000);
                        gsap.set(box, {
                            opacity: fadeOut,
                            filter: `blur(${(1 - fadeOut) * 10}px)`
                        });
                    }
                }
            }
        });
    })



    /* aa */
    // GSAP ScrollTrigger 애니메이션 설정 - 원형 회전 애니메이션 추가
    const sWrap = document.querySelector('.slide_wrap');
    const items = gsap.utils.toArray('.slide_wrap > .con');

    const angleRange = 150; // 전체 부채꼴 각도

    gsap.set(items, {
        rotation: (i) => -angleRange / 2 + (i * angleRange / (items.length - 1)),
        // 예: 5장일 때 -55°, -27.5°, 0°, 27.5°, 55°
        transformOrigin: "center center",
    });



    gsap.to(sWrap, {
        rotation: -180, // 반원형 회전
        ease: "none",
        scrollTrigger: {
            trigger: '.horizontalSlide',
            start: 'top top',
            end: () => '+=' + (items.length * 450), // 아이템 크기와 수에 맞춰 종료점 계산
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
            onEnter: () => { }
            /*  onLeave: () => $('.sevice_wrap').removeClass('on'), */
        }
    });

    items.forEach((item, i) => {
        gsap.fromTo(item, {
            /*  opacity: 0, */
        },
            {
                opacity: 1,
                scrollTrigger: {
                    trigger: '.horizontalSlide',
                    start: () => 'top top+=' + (i * 450), // 각 아이템이 겹치지 않도록 스크롤 간격 조정
                    end: () => 'top top+=' + ((i + 1) * 450),
                    scrub: true,
                },
            });
    });

});
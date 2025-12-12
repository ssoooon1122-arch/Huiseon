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

    // ==================== Header Dark Mode (About 섹션 진입 시 색 바뀌는 부분) ====================
    const header = document.querySelector('header');
    const aboutSection = document.querySelector('.about_me');

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

    if (aboutSection) {
        observer.observe(aboutSection);
    }

    // ==================== Intro 스크롤 애니메이션 ====================
    const introTimeline = gsap.timeline({
        scrollTrigger: {
            trigger: '.intro',
            start: 'top top',
            end: '+=150%',
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

    // ==================== ABOUT_ME 섹션 고정 ====================
    ScrollTrigger.create({
        trigger: '.about_me',
        start: 'top top',
        end: '+=150%',
        pin: true,
        pinSpacing: true,
        markers: false,
    });

    // ==================== PROJECTS 3D Tunnel & Drop Effect ====================
    const projectsSection = document.querySelector('.projects');
    const boxes = gsap.utils.toArray('.box');

    const zGap = 2000;
    const xOffset = 400;
    const totalDistance = zGap * boxes.length;

    boxes.forEach((box, i) => {
        const xPosition = (i % 2 === 0) ? -xOffset : xOffset;

        gsap.set(box, {
            z: -i * zGap,
            x: xPosition,
            xPercent: -50,
            yPercent: -50,
            opacity: 0,
            filter: 'blur(10px)',
        });
    });

    const projectsTimeline = gsap.timeline({
        scrollTrigger: {
            trigger: '.projects',
            start: 'top top',
            end: `+=${totalDistance + 100}`,
            scrub: 2.0,
            pin: true,
            markers: false,
        }
    });

    projectsTimeline.to(boxes, {
        z: (i) => (boxes.length - i) * zGap + 2000,
        ease: 'none',
        duration: 1,
    });

    boxes.forEach((box) => {
        gsap.to(box, {
            scrollTrigger: {
                trigger: '.projects',
                start: 'bottom bottom',
                end: `+=${totalDistance + 2000}`,
                scrub: true,
                onUpdate: () => {
                    const currentZ = gsap.getProperty(box, 'z');

                    const isActive = currentZ >= -10000 && currentZ <= 5000;
                    gsap.set(box, { pointerEvents: isActive ? 'auto' : 'none' });

                    if (currentZ < -4000) {
                        gsap.set(box, { opacity: 0, filter: 'blur(20px)' });
                    } else if (currentZ >= -4000 && currentZ < -500) {
                        const progress = 1 - (Math.abs(currentZ) / 4000);
                        gsap.set(box, {
                            opacity: progress,
                            filter: `blur(${(1 - progress) * 10}px)`,
                        });
                    } else if (currentZ >= -500 && currentZ <= 500) {
                        gsap.set(box, { opacity: 1, filter: 'blur(0px)' });
                    } else {
                        const fadeOut = Math.max(0, 1 - (currentZ - 500) / 1000);
                        gsap.set(box, {
                            opacity: fadeOut,
                            filter: `blur(${(1 - fadeOut) * 10}px)`,
                        });
                    }
                },
            },
        });
    });

    // ==================== LOOKBOOK Draggable 코드 (수정본) ====================
    window.addEventListener('load', () => {
        if (typeof gsap === 'undefined' || typeof Draggable === 'undefined') {
            console.error('GSAP 또는 Draggable 플러그인을 로드할 수 없습니다.');
            return;
        }

        const cards = gsap.utils.toArray('.lookbook_item');
        if (!cards.length) {
            console.error('.lookbook_item 요소를 찾을 수 없습니다.');
            return;
        }

        const total = cards.length;
        const degree = 360 / total;
        let draggableInstance = null;
        let mainTimeline = null;

        // Lenis 인스턴스가 전역으로 'lenis' 변수에 존재한다고 가정
        function lockScroll() {
            if (typeof lenis !== 'undefined') lenis.stop();
        }

        function unlockScroll() {
            if (typeof lenis !== 'undefined') lenis.start();
        }

        function resetCards() {
            cards.forEach((card, index) => {
                gsap.set(card, {
                    x: index % 2
                        ? window.innerWidth + card.clientWidth * 4
                        : -window.innerWidth - card.clientWidth * 4,
                    y: window.innerHeight - card.clientHeight,
                    rotation: index % 2 ? 200 : -200,
                    scale: 4,
                    opacity: 0,
                    transformOrigin: 'center center',
                });
            });

            if (draggableInstance) {
                // reset 시 rotation도 0으로 초기화
                gsap.set('.lookbook_items', { rotation: 0 });
            }
        }

        function playAnimation() {
            if (mainTimeline) {
                mainTimeline.kill();
            }

            mainTimeline = gsap.timeline({
                onComplete: () => {
                    unlockScroll();
                    if (!draggableInstance) {
                        initDraggable();
                    } else {
                        draggableInstance.enable();
                    }
                },
            });

            cards.forEach((card, index) => {
                const sign = Math.floor((index / 2) % 2) ? 1 : -1;
                const value = Math.floor((index + 4) / 4) * 4;
                const initialRotation = index > total - 3 ? 0 : sign * value;

                // 1. 초기 위치에서 가운데로 모이는 애니메이션
                mainTimeline.to(
                    card,
                    {
                        x: 0,
                        y: 0,
                        rotation: initialRotation,
                        scale: 0.5,
                        opacity: 1,
                        ease: 'power4.out',
                        duration: 1,
                        delay: 0.15 * Math.floor(index / 2),
                    },
                    0
                );

                const rotationAngle = index * degree;

                // 2. 카드들이 3D 서클 형태로 회전하는 최종 위치로 이동
                mainTimeline.to(
                    card,
                    {
                        scale: 1,
                        duration: 0,
                    },
                    0.15 * (total / 2 - 1) + 1
                );

                // CSS에서 transform-origin: center 150vh; 로 변경했으므로 해당 값 유지
                mainTimeline.to(
                    card,
                    {
                        transformOrigin: 'center 150vh',
                        rotation: rotationAngle,
                        duration: 1,
                        ease: 'power1.out',
                    },
                    0.15 * (total / 2 - 1) + 1
                );
            });
        }

        // ScrollTrigger로 룩북 섹션 제어 (start 지점 및 onLeave 스크롤 해제 로직 수정)
        ScrollTrigger.create({
            trigger: '.lookbook',
            // start: 'top top', // GNB 연결 후 충돌 방지를 위해 start 지점을 조정해 볼 수 있습니다.
            start: 'top 10%',
            end: '+=150%',
            pin: true,
            pinSpacing: true,
            anticipatePin: 1,
            markers: false,
            onEnter: () => {
                resetCards();
                playAnimation();
                setTimeout(() => {
                    lockScroll();
                }, 100);
            },
            onEnterBack: () => {
                resetCards();
                playAnimation();
                setTimeout(() => {
                    lockScroll();
                }, 100);
            },
            onLeave: () => {
                if (mainTimeline) mainTimeline.kill();
                if (draggableInstance) draggableInstance.disable();
                resetCards();
                unlockScroll(); // ★ 섹션 이탈 시 스크롤 잠금 해제
            },
            onLeaveBack: () => {
                if (mainTimeline) mainTimeline.kill();
                if (draggableInstance) draggableInstance.disable();
                resetCards();
                unlockScroll(); // ★ 섹션 이탈 시 스크롤 잠금 해제
            },
        });

        // 드래그 기능 (GSAP Snap 사용으로 360도 무한 반복 안정화)
        function initDraggable() {
            // degree 간격으로 스냅 포인트를 생성하고 360도 범위 내로 유지 (선택 사항)
            const snapPoints = gsap.utils.pipe(
                gsap.utils.snap(degree),
                (rotation) => rotation % 360 // 360도 이상 회전 시에도 스냅 로직은 유지
            );

            draggableInstance = Draggable.create('.lookbook_items', {
                type: 'rotation',
                snap: {
                    rotation: snapPoints
                },
                // inertia: true, // 관성을 추가하여 부드러움을 높일 수 있음 (선택 사항)
                onDragStart: function () {
                    // 드래그 시작 시 관성 제거 (필요하다면)
                    gsap.killTweensOf('.lookbook_items');
                },
                onDragEnd: function () {
                    // GSAP의 snap이 드래그 종료 시 자동으로 스냅 애니메이션을 처리합니다.
                },
            })[0];
        }
    });

    // (나머지 CONTACT 섹션 및 네비게이션 스크롤 코드는 유지됩니다.)
    // ==================== CONTACT 섹션 텍스트/이미지 등장 ====================
    const contactSection = document.querySelector('.contact');

    if (contactSection) {
        ScrollTrigger.create({
            trigger: '.contact',
            start: 'top top',
            markers: false,
            onEnter: () => {
                contactSection.classList.add('is-visible');
            },
        });
    }

    // ==================== 네비게이션 스크롤 ====================
    document.querySelectorAll('header a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);

            if (targetSection) {
                lenis.scrollTo(targetSection, {
                    duration: 1.5,
                    easing: (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
                });
            }
        });
    });
});
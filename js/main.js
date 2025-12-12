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
    const aboutSection = document.querySelector('.about_me'); // ✅ .contents → .about_me

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

    // ✅ 섹션이 실제 있을 때만 observe 해서 에러 방지
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

    // ==============================================
    // ★ PROJECTS 3D Tunnel & Drop Effect ★
    // ==============================================
    const projectsSection = document.querySelector('.projects');
    const boxes = gsap.utils.toArray('.box');

    const zGap = 2000;       // 카드 간 z 간격
    const xOffset = 400;     // 좌우 벌어짐
    const totalDistance = zGap * boxes.length;

    // 초기 위치 세팅
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

    // 메인 스크롤 타임라인
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

    // 개별 박스 시각 효과
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

    // ==================== LOOKBOOK Draggable 코드 ====================
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
                gsap.set('.lookbook_items', { rotation: 0 });
            }
        }

        function lockScroll(lenisInstance) {
            lenisInstance.stop();
        }

        function unlockScroll(lenisInstance) {
            lenisInstance.start();
        }

        function playAnimation() {
            if (mainTimeline) {
                mainTimeline.kill();
            }

            mainTimeline = gsap.timeline({
                onComplete: () => {
                    unlockScroll(lenis);
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
                const rotation = index > total - 3 ? 0 : sign * value;

                mainTimeline.to(
                    card,
                    {
                        x: 0,
                        y: 0,
                        rotation: rotation,
                        scale: 0.5,
                        opacity: 1,
                        ease: 'power4.out',
                        duration: 1,
                        delay: 0.15 * Math.floor(index / 2),
                    },
                    0
                );

                const rotationAngle = index * degree;

                mainTimeline.to(
                    card,
                    {
                        scale: 1,
                        duration: 0,
                    },
                    0.15 * (total / 2 - 1) + 1
                );

                mainTimeline.to(
                    card,
                    {
                        transformOrigin: 'center 200vh',
                        rotation:
                            index > total / 2
                                ? -degree * (total - index)
                                : rotationAngle,
                        duration: 1,
                        ease: 'power1.out',
                    },
                    0.15 * (total / 2 - 1) + 1
                );
            });
        }

        // ScrollTrigger로 룩북 섹션 제어
        ScrollTrigger.create({
            trigger: '.lookbook',
            start: 'top top',
            end: '+=150%',
            pin: true,
            pinSpacing: true,
            anticipatePin: 1,
            markers: false,
            onEnter: () => {
                resetCards();
                playAnimation();
                setTimeout(() => {
                    lockScroll(lenis);
                }, 100);
            },
            onEnterBack: () => {
                resetCards();
                playAnimation();
                setTimeout(() => {
                    lockScroll(lenis);
                }, 100);
            },
            onLeave: () => {
                if (mainTimeline) mainTimeline.kill();
                if (draggableInstance) draggableInstance.disable();
                resetCards();
            },
            onLeaveBack: () => {
                if (mainTimeline) mainTimeline.kill();
                if (draggableInstance) draggableInstance.disable();
                resetCards();
            },
        });

        // 드래그 기능
        function initDraggable() {
            let startRotation = 0;

            draggableInstance = Draggable.create('.lookbook_items', {
                type: 'rotation',

                onDragStart: function () {
                    startRotation = this.rotation;
                },

                onDragEnd: function () {
                    const currentRotation = this.rotation;
                    const offset = Math.abs(currentRotation - startRotation);

                    if (currentRotation > startRotation) {
                        if (currentRotation - startRotation < degree / 2) {
                            gsap.to('.lookbook_items', {
                                rotation: `-=${offset}`,
                                duration: 0.3,
                                ease: 'power2.out',
                            });
                        } else {
                            gsap.to('.lookbook_items', {
                                rotation: `+=${degree - offset}`,
                                duration: 0.3,
                                ease: 'power2.out',
                            });
                        }
                    } else {
                        if (Math.abs(currentRotation - startRotation) < degree / 2) {
                            gsap.to('.lookbook_items', {
                                rotation: `+=${offset}`,
                                duration: 0.3,
                                ease: 'power2.out',
                            });
                        } else {
                            gsap.to('.lookbook_items', {
                                rotation: `-=${degree - offset}`,
                                duration: 0.3,
                                ease: 'power2.out',
                            });
                        }
                    }
                },
            })[0];
        }
    });

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
});

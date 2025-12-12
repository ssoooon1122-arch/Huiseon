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

    // ==================== Contents 섹션 고정 ====================
    ScrollTrigger.create({
        trigger: 'section.contents',
        start: 'top top',
        end: '+=150%',
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
            end: `+=${totalDistance + 100}`,
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



    // ==================== LOOKBOOK Draggable 코드 ====================
    window.addEventListener('load', () => {
        // GSAP / Draggable 로드 체크
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

        // 초기 상태로 리셋하는 함수
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

            // 드래그 인스턴스가 있으면 회전 초기화
            if (draggableInstance) {
                gsap.set('.lookbook_items', { rotation: 0 });
            }
        }

        // 애니메이션 실행 함수
        function playAnimation() {
            // 이전 타임라인이 있으면 중지하고 제거
            if (mainTimeline) {
                mainTimeline.kill();
            }

            mainTimeline = gsap.timeline({
                onComplete: () => {
                    unlockScroll(lenis);
                    // 애니메이션 완료 후 드래그 활성화
                    if (!draggableInstance) {
                        initDraggable();
                    } else {
                        // 이미 있으면 활성화
                        draggableInstance.enable();
                    }
                }
            });

            cards.forEach((card, index) => {
                const sign = Math.floor((index / 2) % 2) ? 1 : -1;
                const value = Math.floor((index + 4) / 4) * 4;
                const rotation = index > total - 3 ? 0 : sign * value;

                // 날아오는 애니메이션
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

                // 스케일 정상화
                const rotationAngle = index * degree;
                mainTimeline.to(
                    card,
                    {
                        scale: 1,
                        duration: 0,
                    },
                    0.15 * (total / 2 - 1) + 1
                );

                // 원형 배치로 전환
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




        function lockScroll(lenis) {
            lenis.stop();
        }

        function unlockScroll(lenis) {
            lenis.start();
        }




        // 1) 초기 상태 세팅
        //resetCards();

        // 2) ScrollTrigger로 룩북 섹션 진입/퇴장 감지
        ScrollTrigger.create({
            trigger: '.lookbook',
            start: 'top top',
            end: '+=150%',                 // ⭐ 변경: 150% → 250% (충분한 시간 확보)
            pin: true,
            pinSpacing: true,              // ⭐ 다시 true로
            anticipatePin: 1,              // ⭐ 추가: pin 부드럽게
            markers: false,
            onEnter: () => {

                resetCards();
                playAnimation();
                setTimeout(() => {
                    lockScroll(lenis);
                }, 100); // 약간의 지연 후 실행
            },
            onEnterBack: () => {
                resetCards();
                playAnimation();
                setTimeout(() => {
                    lockScroll(lenis);
                }, 100); // 약간의 지연 후 실행
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
            }
        });

        // 3) 드래그 기능 초기화 함수
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

                    // 가장 가까운 카드 위치로 스냅
                    if (currentRotation > startRotation) {
                        if (currentRotation - startRotation < degree / 2) {
                            gsap.to('.lookbook_items', {
                                rotation: `-=${offset}`,
                                duration: 0.3,
                                ease: 'power2.out'
                            });
                        } else {
                            gsap.to('.lookbook_items', {
                                rotation: `+=${degree - offset}`,
                                duration: 0.3,
                                ease: 'power2.out'
                            });
                        }
                    } else {
                        if (Math.abs(currentRotation - startRotation) < degree / 2) {
                            gsap.to('.lookbook_items', {
                                rotation: `+=${offset}`,
                                duration: 0.3,
                                ease: 'power2.out'
                            });
                        } else {
                            gsap.to('.lookbook_items', {
                                rotation: `-=${degree - offset}`,
                                duration: 0.3,
                                ease: 'power2.out'
                            });
                        }
                    }
                },
            })[0];
        }
    });

    // ==================== CONTACT 섹션 고정 + 해바라기 애니메이션 ====================
    const contactSection = document.querySelector('.contact');

    if (contactSection) {
        ScrollTrigger.create({
            trigger: '.contact',
            start: 'top top',
            markers: false,

            onEnter: () => {
                contactSection.classList.add('is-visible');
            },
            onEnterBack: () => {
                contactSection.classList.add('is-visible');
            },
            onLeave: () => {
                contactSection.classList.remove('is-visible');
            },
            onLeaveBack: () => {
                contactSection.classList.remove('is-visible');
            }

        });
    }

});

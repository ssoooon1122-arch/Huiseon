document.addEventListener('DOMContentLoaded', () => {
    // ==================== GSAP 플러그인 ====================
    gsap.registerPlugin(ScrollTrigger, Draggable);

    // ==================== Lenis (Smooth Scroll) ====================
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

    // ✅ iOS/폰트/이미지 로드 등으로 레이아웃 바뀌는 케이스 대비
    window.addEventListener('load', () => {
        ScrollTrigger.refresh();
    });

    // ==================== Header Dark Mode ====================
    const header = document.querySelector('header');
    const aboutSection = document.querySelector('.about_me');

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                // about_me 섹션이 뷰포트에 30% 이상 들어오면 dark 모드 활성화
                if (entry.isIntersecting) header.classList.add('dark');
                else header.classList.remove('dark');
            });
        },
        { threshold: 0.3 }
    );

    if (aboutSection) observer.observe(aboutSection);

    // ==================== Intro (pin) ====================
    const introTimeline = gsap.timeline({
        scrollTrigger: {
            id: 'introTrigger',
            trigger: '.intro',
            start: 'top top',
            end: '+=150%',
            scrub: 2,
            pin: true,
            markers: false,
        },
    });

    introTimeline
        .to(
            '.sunflower01',
            {
                x: 200,
                y: 500,
                scale: 1,
                ease: 'none',
            },
            0
        )
        .to(
            '.intro_text',
            {
                opacity: 1,
                y: 0,
                ease: 'none',
            },
            0
        )
        .to({}, { duration: 2 });

    // ==================== ABOUT (pin) ====================
    ScrollTrigger.create({
        id: 'aboutTrigger',
        trigger: '.about_me',
        start: 'top top',
        end: '+=150%',
        pin: true,
        pinSpacing: true,
        markers: false,
    });

    // ✅ ABOUT ME - 각 아이템 순차 등장
    gsap.from('.about_me_item', {
        opacity: 0,
        y: 50,
        stagger: 0.5,
        scrollTrigger: {
            trigger: '.about_me_items',
            start: 'top 80%',
            end: 'top 30%',
            scrub: 1,
        }
    });

    // ==================== PROJECTS 3D (pin) ====================
    const boxes = gsap.utils.toArray('.box');
    const zGap = 2000;
    const xOffset = 400;
    const totalDistance = zGap * boxes.length;

    boxes.forEach((box, i) => {
        const xPosition = i % 2 === 0 ? -xOffset : xOffset;

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
            id: 'projectsTrigger',
            trigger: '.projects',
            start: 'top top',
            end: `+=${totalDistance + 100}`,
            scrub: 2.0,
            pin: true,
            markers: false,
        },
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
                        const progress = 1 - Math.abs(currentZ) / 4000;
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

    // ==================== LOOKBOOK (pin + enter animation + draggable) ====================
    const lookbookCards = gsap.utils.toArray('.lookbook_item');
    const lookbookItems = document.querySelector('.lookbook_items');

    let lookbookTL = null;
    let lookbookDrag = null;

    function resetLookbookCards() {
        if (!lookbookCards.length) return;

        lookbookCards.forEach((card, index) => {
            gsap.set(card, {
                x:
                    index % 2
                        ? window.innerWidth + card.clientWidth * 4
                        : -window.innerWidth - card.clientWidth * 4,
                y: window.innerHeight - card.clientHeight,
                rotation: index % 2 ? 200 : -200,
                scale: 4,
                opacity: 0,
                transformOrigin: 'center center',
            });
        });

        gsap.set(lookbookItems, { rotation: 0 });
    }

    function killLookbook() {
        if (lookbookTL) {
            lookbookTL.kill();
            lookbookTL = null;
        }
        if (lookbookDrag) {
            lookbookDrag.disable();
            // killTweens도 같이
            gsap.killTweensOf(lookbookItems);
        }
    }

    function initLookbookDraggable(degree) {
        // ✅ 기존 드래그 있으면 제거/비활성
        if (lookbookDrag) lookbookDrag.disable();

        lookbookDrag = Draggable.create(lookbookItems, {
            type: 'rotation',
            inertia: false,
            // ✅ 스냅: 카드 하나 단위로
            snap: {
                rotation: gsap.utils.snap(degree),
            },
            onDragStart: () => {
                gsap.killTweensOf(lookbookItems);
            },
        })[0];

        lookbookDrag.enable();
    }

    function playLookbookEnterAnimation() {
        if (!lookbookCards.length) return;

        const total = lookbookCards.length;
        const degree = 360 / total;

        killLookbook();

        lookbookTL = gsap.timeline({
            onComplete: () => {
                // ✅ 애니 끝나면 드래그 활성
                initLookbookDraggable(degree);
                // ✅ 섹션 진입 시 잠깐 멈췄던 스크롤 다시 허용
                lenis.start();
            },
        });

        lookbookCards.forEach((card, index) => {
            const sign = Math.floor((index / 2) % 2) ? 1 : -1;
            const value = Math.floor((index + 4) / 4) * 4;
            const initialRotation = index > total - 3 ? 0 : sign * value;

            // 1) 중앙으로 모이기
            lookbookTL.to(
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

            // 2) 최종 원형 배치
            const rotationAngle = index * degree;

            lookbookTL.to(
                card,
                { scale: 1, duration: 0 },
                0.15 * (total / 2 - 1) + 1
            );

            lookbookTL.to(
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

    // ✅ 룩북 ScrollTrigger (핵심: id 부여 + 네비 점프 시에도 동일하게 동작)
    ScrollTrigger.create({
        id: 'lookbookTrigger',
        trigger: '.lookbook',
        start: 'top top',
        end: '+=150%',
        pin: true,
        pinSpacing: true,
        anticipatePin: 1,
        markers: false,

        onEnter: () => {
            // ✅ 들어오자마자: 카드 초기화 → 애니 실행 → 스크롤 잠깐 잠금
            resetLookbookCards();
            lenis.stop();
            playLookbookEnterAnimation();
        },
        onEnterBack: () => {
            resetLookbookCards();
            lenis.stop();
            playLookbookEnterAnimation();
        },

        onLeave: () => {
            // ✅ 나갈 때: 드래그/타임라인 종료 + 스크롤 복구
            killLookbook();
            lenis.start();
        },
        onLeaveBack: () => {
            killLookbook();
            lenis.start();
        },
    });

    // ✅ 리사이즈 시 룩북/핀 재계산
    window.addEventListener('resize', () => {
        // 룩북 카드가 화면 밖으로 날아가는 기준값들이 윈도우 사이즈에 영향 받음
        resetLookbookCards();
        ScrollTrigger.refresh();
    });

    // ==================== CONTACT ====================
    const contactSection = document.querySelector('.contact');
    if (contactSection) {
        ScrollTrigger.create({
            id: 'contactTrigger',
            trigger: '.contact',
            start: 'top 10%',
            markers: false,
            // GNB에서 직접 처리하므로 여기는 일반 스크롤링 시에만 작동하도록 유지
            onEnter: () => contactSection.classList.add('is-visible'),
            onEnterBack: () => contactSection.classList.add('is-visible'),
        });
    }

    // ==================== NAV (🔥 pin 섹션에서 절대 안 깨지는 방식) ====================
    // ✅ Lenis scrollTo 대신 window.scrollTo + ScrollTrigger.refresh가 정답
    const navMap = {
        intro: 'introTrigger',
        about: 'aboutTrigger',
        projects: 'projectsTrigger',
        lookbook: 'lookbookTrigger',
        contact: 'contactTrigger',
    };

    document.querySelectorAll('header a[href^="#"]').forEach((a) => {
        a.addEventListener('click', (e) => {
            e.preventDefault();

            const targetId = a.getAttribute('href').replace('#', '');
            const trigId = navMap[targetId];
            if (!trigId) return;

            const st = ScrollTrigger.getById(trigId);
            if (!st) return;

            // ✅ 룩북처럼 들어가며 스크롤 잠그는 섹션이 있으니
            // 우선 스크롤 허용 상태로 만들고 이동
            lenis.start();

            // ✅ ScrollTrigger 기준 위치로 이동(핀 보정 포함). +1을 주어 onEnter가 발동될 위치로 이동
            window.scrollTo(0, st.start + 1);

            // **✅ 핵심 수정:** Contact 섹션으로 점프 시, 클래스를 강제로 추가하여 노출 보장
            if (targetId === 'contact' && contactSection) {
                contactSection.classList.add('is-visible');
            }

            // ✅ 이동 직후 보정 필수
            ScrollTrigger.refresh(true);
            ScrollTrigger.update();

            // ✅ 바로 해당 섹션 onEnter가 확실히 실행되도록
            requestAnimationFrame(() => {
                ScrollTrigger.update();
            });
        });
    });
});
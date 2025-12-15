AOS.init();
const header = document.querySelector('header');
document.querySelector('header .right ul').addEventListener('click', () => {
    header.classList.toggle('on');
    document.body.classList.toggle('no_scroll');
})

//스크롤 위치를 마지막에 어디까지 했는지 기억하는 변수
let lastScrollY = window.scrollY;

//스크롤 할 때마다 실행되는 이벤트
window.addEventListener('scroll', () => {
    //지금 현재 스크롤 위치(세로로 얼만큼 내려왔는지) 저장
    const currentScrollY = window.scrollY;
    if (currentScrollY > lastScrollY) {
        //지금 스크롤이 이전보다 더 아래 -> 즉 사용자가 아래로 내림
        header.style.top = '-100px';
    } else {
        //사용자가 위로 올림
        header.style.top = '0';
    }

    //이번 스크롤 위치를 이전 스크롤 위치로 저장
    lastScrollY = currentScrollY;

})

/* 메인 슬라이드 */
const mainSlide = new Swiper(".slide_visual", {
    loop: true,
    autoplay: {
        delay: 5500,
        disableOnInteraction: false,
    },
    navigation: {
        nextEl: ".main_visual .pager .right",
        prevEl: ".main_visual .pager .left",
    },
});

const toggleBtn = document.querySelector('.main_visual .pager .btn_box i');
toggleBtn.addEventListener('click', function () {
    if (mainSlide.autoplay.running) {
        mainSlide.autoplay.stop();
        this.classList.remove('fa-pause');
        this.classList.add('fa-play');
    } else {
        mainSlide.autoplay.start();
        this.classList.remove('fa-play');
        this.classList.add('fa-pause');
    }
});

/* pager 숫자 업데이트 */
const numEl = document.querySelector('main .main_visual .pager .box .num');
const totalEl = document.querySelector('main .main_visual .pager .box .total');

//복제본 제외한 실제 슬라이드 개수 계산
const getTotal = () =>
    mainSlide.slidesEl.querySelectorAll('.swiper-slide:not(.swiper-slide-duplicate)').length;

//번호 총개수 세팅
const setPager = () => {
    const current = mainSlide.realIndex + 1;
    numEl.textContent = String(current);
    totalEl.textContent = String(getTotal());
}

//최초 1회 설정 + 슬라이드 변경시 업데이트
setPager();
mainSlide.on('slideChange', setPager); //슬라이드 변경시 업데이트

const infoSlide = new Swiper(".info .swiper", {
    loop: true,
    autoplay: {
        delay: 2500,
        disableOnInteraction: false,
    },
    direction: "vertical",
});

const customerSlide = new Swiper(".customer .slide_wrap", {
    loop: true,
    slidesPerView: 'auto',
    spaceBetween: 30,
    speed: 9000,
    autoplay: {
        delay: 0,                 // 딜레이 0 → 연속 재생
        disableOnInteraction: false,
        pauseOnMouseEnter: false, // 🔥 마우스 올려도 안 멈추게!
    },
    loopAdditionalSlides: 5,    // 루프 시 빈틈 방지
    on: {
        init: function () {
            this.wrapperEl.style.transitionTimingFunction = 'linear';
        },
        slideChangeTransitionStart: function () {
            this.wrapperEl.style.transitionTimingFunction = 'linear';
        },
    },
});

const blogSlide = new Swiper(".blog .slide_wrap", {
    loop: true,
    slidesPerView: 'auto',
    spaceBetween: 30,
    speed: 9000,
    autoplay: {
        delay: 0,                 // 딜레이 0 → 연속 재생
        disableOnInteraction: false,
        pauseOnMouseEnter: false, // 🔥 마우스 올려도 안 멈추게!
    },
    loopAdditionalSlides: 5,    // 루프 시 빈틈 방지
    on: {
        init: function () {
            this.wrapperEl.style.transitionTimingFunction = 'linear';
        },
        slideChangeTransitionStart: function () {
            this.wrapperEl.style.transitionTimingFunction = 'linear';
        },
    },
});

//.select_box button을 클릭했을때
//.select_box on class가 토글

 document.querySelector('footer .select_box button').addEventListener
 ('click', function () {
        document.querySelector('footer .select_box').classList.toggle('on')
    });
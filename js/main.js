document.addEventListener('DOMContentLoaded', () => {



})

const header = document.querySelector('.header');
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




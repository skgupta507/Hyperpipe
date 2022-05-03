export function usePrefs(key) {
  if (localStorage) {
    if (localStorage.get(key)) return true;
    else return false;
  } else return false;
}

export function useLazyLoad() {
  let lazyElems;

  if ('IntersectionObserver' in window) {
    lazyElems = document.querySelectorAll('.bg-img:not(.lazy)');

    let imgObs = new IntersectionObserver((elems, obs) => {
      elems.forEach((elem) => {
        setTimeout(() => {
          if (elem.isIntersecting) {
            let ele = elem.target;

            ele.classList.add('lazy');
            imgObs.unobserve(ele);
          }
        }, 20);
      });
    });

    lazyElems.forEach((img) => {
      imgObs.observe(img);
    });
  } else {
    console.log('Failed');
  }
}

import DOMPurify from 'dompurify';

export function useSanitize(txt) {
  return DOMPurify.sanitize(txt);
}

export function useRoute(l) {
  history.pushState({}, '', l);
}

export function useStore() {
  try {
    return window.localStorage;
  } catch (err) {
    console.error(err);

    const error = i => {
      console.error("Failed to Access '" + i + "' Please Enable localStorage.");
    };

    return {
      getItem: error,
      setItem: error,
    };
  }
}

export function useLazyLoad() {
  let lazyElems;

  if ('IntersectionObserver' in window) {
    lazyElems = document.querySelectorAll('.bg-img:not(.lazy)');

    let imgObs = new IntersectionObserver((elems, obs) => {
      elems.forEach(elem => {
        setTimeout(() => {
          if (elem.isIntersecting) {
            let ele = elem.target;

            ele.classList.add('lazy');
            imgObs.unobserve(ele);
          }
        }, 20);
      });
    });

    lazyElems.forEach(img => {
      imgObs.observe(img);
    });
  } else {
    console.log('Failed');
  }
}

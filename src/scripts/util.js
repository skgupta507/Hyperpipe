export const useStore = () => {
  try {
    return window.localStorage;
  } catch (err) {
    alert(err);

    const error = i => {
      alert("Failed to Access '" + i + "' Please Enable localStorage.");
    };

    return {
      getItem: error,
      setItem: error,
    };
  }
};

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

import DOMPurify from 'dompurify';

export function useSanitize(txt) {
  return DOMPurify.sanitize(txt, {
    ALLOWED_TAGS: ['br'],
  });
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

const c = [
  'linear-gradient(45deg, oklab(0.9 -0.05 -0.04), oklab(0.57 -0.03 -0.09))',
  //'linear-gradient(45deg, oklab(0.68 -0.02 -0.06), oklab(0.65 0.11 -0.05))',
  //'linear-gradient(45deg, #a3be8c, #88c0d0)',
  //'linear-gradient(45deg, #ebcb8b, #a3be8c)',
  //'linear-gradient(45deg, oklab(0.82 0.09 0.07), oklab(0.58 0.14 0.04)',
];

export function useRand() {
  const i = Math.floor(Math.random() * c.length);
  return c[i];
}

export const parseThumb = (url, proxy) =>
  url && proxy
    ? `${proxy}/vi_webp/${url.replace(
        '/watch?v=',
        '',
      )}/maxresdefault.webp?host=i.ytimg.com`
    : '/1x1.png';

import type { NextConfig } from "next";

// GitHub Pages 정적 배포용 설정.
// PAGES_BASE_PATH 는 저장소 하위 경로(예: /ddoddo-and-ppuni)이며,
// 배포(GitHub Actions)에서 주입한다. 로컬 개발에서는 비어 있어 영향 없음.
const basePath = process.env.PAGES_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export", // 정적 HTML/JS 로 내보내기 (서버 불필요)
  basePath: basePath || undefined,
  images: { unoptimized: true },
  trailingSlash: true,
  // 클라이언트에서 이미지 경로에 사용할 접두사
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
};

export default nextConfig;

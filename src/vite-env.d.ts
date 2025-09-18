/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FIREBASE_API_KEY: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN: string;
  readonly VITE_FIREBASE_PROJECT_ID: string;
  readonly VITE_FIREBASE_APP_ID: string;
  // 여기에 필요한 다른 환경 변수들을 추가할 수 있습니다。
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
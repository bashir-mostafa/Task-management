import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,      // true أو 0.0.0.0 → يستخدم أي IP متاح
    port: 3000,      // يمكنك تحديد بورت ثابت
    strictPort: true // إذا البورت مستخدم، سيرفر سيفشل بدل تغيير البورت تلقائياً
  },
});

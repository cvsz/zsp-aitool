# ZSP AI Tool Chrome Extension (MV3)

Chrome Extension สำหรับเก็บข้อมูลสินค้าจากหน้า Shopee ที่ผู้ใช้กำลังเปิดอยู่ (เฉพาะข้อมูลที่มองเห็นบนหน้า) แล้วให้ผู้ใช้ตรวจ/แก้ไขก่อนส่งเข้า zsp-aitool.

## Compliance

- เก็บเฉพาะข้อมูลที่มองเห็นในหน้าเว็บ
- ไม่ใช้ private API
- ไม่ bypass login หรือ CAPTCHA
- ไม่เก็บ private user data
- บังคับให้ผู้ใช้ตรวจแก้ข้อมูลก่อนส่ง
- ต้องกดยืนยันก่อนส่งข้อมูล

## Files

- `manifest.json`
- `src/popup.html`, `src/popup.ts`, `src/popup.css`
- `src/content-script.ts`
- `src/background.ts`
- `src/options.html`, `src/options.ts`
- `src/api-client.ts`
- `src/types.ts`

## Build

```bash
cd extension
npm install
npm run build
```

โหลดโฟลเดอร์ `extension/dist` ใน Chrome ผ่าน `chrome://extensions` > Developer mode > Load unpacked

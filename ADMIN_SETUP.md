# Admin Foydalanuvchi O'rnatish

## Admin Email
`jaloliddinruzikulov@gmail.com` emaili avtomatik ravishda admin sifatida ro'yxatdan o'tadi.

## Usul 1: Yangi ro'yxatdan o'tish (Tavsiya etiladi)
1. Saytga kiring: http://localhost:3000
2. "Sign Up" sahifasiga o'ting
3. Quyidagi ma'lumotlarni kiriting:
   - Email: `jaloliddinruzikulov@gmail.com`
   - Parol: O'zingiz xohlagan parol
   - Ism va Familiya
4. Ro'yxatdan o'ting - siz avtomatik admin bo'lasiz!

## Usul 2: Script orqali yaratish
```bash
# Admin foydalanuvchi yaratish
npm run create-admin
```

Bu script:
- Email: `jaloliddinruzikulov@gmail.com`
- Dastlabki parol: `Admin@123456`
- **MUHIM**: Birinchi kirishdan keyin parolni o'zgartiring!

## Admin Panelga Kirish
1. Login qiling: http://localhost:3000/login
2. Admin paneliga o'ting: http://localhost:3000/admin

## Admin Imkoniyatlari
- ✅ Foydalanuvchilarni boshqarish
- ✅ Loyihalarni ko'rish va o'chirish
- ✅ Media fayllarni boshqarish
- ✅ Tizim sozlamalari
- ✅ Statistika va analitika
- ✅ Bildirishnomalar

## Qo'shimcha Admin Emaillar
Quyidagi emaillar ham avtomatik admin bo'ladi:
- `jaloliddinruzikulov@gmail.com`
- `admin@pixelfy.uz`

## Xavfsizlik
- Parolni muntazam o'zgartirib turing
- Kuchli parol ishlating (8+ belgi, katta-kichik harflar, raqam, belgilar)
- Admin huquqini ehtiyotkorlik bilan bering
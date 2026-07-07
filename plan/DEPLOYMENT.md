# DEPLOYMENT.md — Mosh Madness (QA + Railway)

## BAGIAN 1 — QA: audit kode yang tidak clean.


### 1a. Perintah audit cepat (jalankan di root repo)
```bash
# list semua asset
find public/assets -type f | sort
# cari referensi tiap file di kode (contoh)
grep -rn "herosection_black" app components lib
grep -rn "kiri.mp4\|kanan.mp4" app components
grep -rn "assets/products" app components prisma
```
Minta Claude Code: *"audit tiap file di public/assets, laporkan mana yang belum direferensikan di kode/seed, pakai prinsip ponytail (hapus yang tak terpakai)."*

---

## BAGIAN 2 — Pre-flight sebelum deploy
```bash
npx tsc --noEmit      # harus bersih
npm run lint          # harus bersih
npm run build         # harus sukses (output: 'standalone')
```
Pastikan `next.config`:
```js
const nextConfig = { output: 'standalone', images: { /* allow domain /media */ } }
```
Prisma tetap mode engine-free (`queryCompiler` + `driverAdapters`).

--
### Test lokal pakai container (opsional)
```bash
docker compose up --build      # app di http://localhost:3000, MySQL di :3306
```

---

## BAGIAN 4 — Checklist rilis
- [ ] `tsc/lint/build` bersih
- [ ] Volume ter-mount, `UPLOAD_DIR` benar
- [ ] Semua env terisi (LOGIN ADMIN Email: admin@moshmadness.id
Password: ilham666)
- [ ] Migrasi jalan (`migrate deploy`) + seed sukses
- [ ] Admin bisa login, CRUD image sinkron DB↔storage
- [ ] `/api/health` hijau
- [ ] Reduced-motion & mobile diuji (375/768/1024/1440)
- [ ] Lisensi font Death Stinger diverifikasi (Creepster OFL ok)

# Referensi Akademik — Bab 1.1 (PMS), Bab 2.2 (Scrum), Bab 4 (Usability Framework)

Hasil verifikasi 2 putaran Research Claude (2026-05-12 + 2026-05-13). Semua citation di-cek terhadap publisher page, ISBN, DOI, SINTA tier, atau venue peer-reviewed. Pasangkan dengan `REFERENCES_ARSITEKTUR_PMS.md` (untuk Gambar 1.1 & 2.1 layered architecture).

> **🔑 TL;DR Final**
> - **Bab 1.1**: Kasavana 11e (2024) + Hayes 4e (2026) — chapter terverifikasi, **halaman exact belum bisa diverifikasi public** (lihat caveat di section masing-masing)
> - **Bab 2.2**: Scrum Guide November 2020 + **Ali & Waluyo (2024) SINTA 4** sebagai applied case (menggantikan Ruseno 2019 yang unaccredited)
> - **Bab 4**: **Aminurdin et al. (2023)** — UEQ evaluation Traveloka Hotel sebagai precedent metodologi usability

---

## Bab 1.1 — Arsitektur Umum Property Management System

### [PRIMARY] Kasavana — *Managing Front Office Operations*, 11th edition

```
Kasavana, M. L. (2024). Managing Front Office Operations (11th ed.).
Lansing, MI: American Hotel & Lodging Educational Institute (AHLEI).
ISBN-13: 978-0-86612-764-6.
```

**Lokasi pembahasan PMS**: Chapter 3 "Front Office Operations" — arsitektur PMS, modul software, interface ke sistem eksternal. Pendukung: Ch.4 (Reservations), Ch.5 (Registration), Ch.8 (Front Office Accounting), Ch.11 (Front Office Audit).

> ⚠️ **Page-range verification (2nd-pass research, 2026-05-13)**: Halaman exact 11th edition **TIDAK BISA diverifikasi dari sumber public** — AHLEI product page, eCampus, VitalSource, RedShelf, Amazon, dan "Take a Closer Look" PDF semua gated/preview-blocked. Baseline 9th edition: Ch.3 mulai p.103 ("The Guest Cycle"), sub-section "Front Office Systems" di p.110, four core modules section ~p.118, summary p.129 (total Ch.3 9e: ~pp.103-135). **Pagination 11e kemungkinan bergeser** karena revisi expanded sustainability + social media content.
>
> **Action item Anda**: Pinjam print copy ISBN 978-0-86612-764-6 di perpustakaan kampus / request review copy dari AHLEI / akses via VitalSource subscription. JANGAN sitir page numbers 9e sebagai 11e — **citasi "Kasavana, 2024, ch. 3" tanpa page range** sampai dikonfirmasi.

**Definisi formal (paraphrase-able):**

> Property Management System (PMS) adalah seperangkat aplikasi yang berkaitan langsung dengan aktivitas front-office dan back-office hotel — meliputi manajemen reservasi, room/rate assignment, check-in dan check-out, guest accounting, folio management, account settlement, dan room-status management. PMS umumnya terbagi menjadi **empat modul inti front-office**: Reservations Management, Rooms Management, Guest Account Management, dan General Management (reporting) — saling bertukar data melalui database terpusat dan berinterface dengan POS, call accounting, electronic locking, energy management, dan credit-card settlement.

---

### [SECONDARY] Hayes, Ninemeier & Hanson — *Hotel Operations Management*, 4th edition

```
Hayes, D. K., Ninemeier, J. D., & Hanson, B. (2026).
Hotel Operations Management (4th ed.). Hoboken, NJ: Pearson.
ISBN-13: 978-0-13-543945-6 (print).
eTextbook: 9780138310943 (Pearson+) / 9780138310639 (VitalSource).
Copyright © 2026 (published May 2025).
```

**Lokasi**: Chapter 9 "The Front Office" — PMS modul, interface ke operating departments. Pendukung: Ch.7 (Revenue Management), Ch.10 (Housekeeping).

> ⚠️ **Page-range verification**: Sama seperti Kasavana — Pearson catalog, Pearson+, VitalSource, Amazon Kindle, Google Books, dan empiretext.com semua hanya menampilkan chapter titles, tidak ada subsection paging. **Citasi "Hayes et al., 2026, ch. 9" tanpa page range** sampai bisa diverifikasi via print/eText.

**Kutipan paraphrase-able:**

> PMS adalah platform software yang mengintegrasikan aktivitas front-office (reservasi, room assignment, check-in/out, guest folios, night audit) dengan housekeeping room status dan back-office accounting, serta berinterface real-time dengan POS, call accounting, electronic locking, dan revenue-management. Edisi ke-4 menekankan bahwa PMS kontemporer harus **"embrace new technologies — including mobile apps, artificial intelligence (AI), and virtual reality — to enhance the guest experience,"** merefleksikan pergeseran ke cloud-based, API-driven PMS platforms.

---

### Recency-rule excluded

- ❌ Vallen & Vallen *Check-In Check-Out* 10e (2017) — outside 2021+ window
- ❌ Bardi *Hotel Front Office Management* 5e (2011)
- ❌ O'Fallon & Rutherford *Hotel Management and Operations* 5e (2010)

---

## Bab 2.2 — Alur Kerja Scrum

### [AUTHORITATIVE] The Scrum Guide November 2020

```
Schwaber, K., & Sutherland, J. (2020).
The Scrum Guide: The Definitive Guide to Scrum:
The Rules of the Game (November 2020).
https://scrumguides.org/scrum-guide.html
PDF: https://scrumguides.org/docs/scrumguide/v2020/2020-Scrum-Guide-US.pdf
```

**Length**: 14 halaman.

**Verbatim — Scrum Definition (p. 3):**

> *"Scrum is a lightweight framework that helps people, teams and organizations generate value through adaptive solutions for complex problems."*

**Verbatim — Sprints (p. 7):**

> *"Sprints are the heartbeat of Scrum, where ideas are turned into value. They are fixed length events of one month or less to create consistency. A new Sprint starts immediately after the conclusion of the previous Sprint."*

> ⚠️ Tidak ada revisi 2023/2024/2025. Blog third-party "2024 Scrum Guide" adalah mislabel — content unchanged dari Nov 2020 release. **JANGAN sitir mislabel itu.**

---

### [PRIMARY APPLIED CASE — SINTA 4 DOI-verified] Ali & Waluyo (2024)

✅ **Mengganti Ruseno 2019 (unaccredited journal, no DOI) yang ada di draft sebelumnya.**

```
Ali, H. H., & Waluyo, A. F. (2024).
Implementasi metode Scrum (Agile) pada sistem reservasi fasilitas
olahraga futsal berbasis mobile.
JSAI (Journal Scientific and Applied Informatics), 7(3), 575–581.
https://doi.org/10.36085/jsai.v7i3.7372
```

**Akreditasi:**
- **SINTA 4** (Kemenristekdikti Decree 230/E/KPT/2022, 30 Dec 2022)
- Publisher: Universitas Muhammadiyah Bengkulu (UMB)
- DOI resolves: ✓ (jurnal.umb.ac.id/index.php/JSAI/article/view/7372 dengan full PDF)
- SINTA profile: https://sinta.kemdiktisaintek.go.id/journals/profile/5642

**Kutipan paraphrase-able:**

> *"Metode Scrum, sebagai salah satu kerangka kerja dalam pengembangan perangkat lunak berbasis Agile, menawarkan pendekatan yang iteratif dan terstruktur ... memungkinkan ... membagi alur penelitian yang lebih cepat yang disebut sprint, dan memberikan hasil secara bertahap"*

**Relevansi untuk StayManager**: Paper menginstantiasi siklus Scrum lengkap (Product Backlog → Sprint Planning → Sprint Retrospective) untuk **reservation/booking application** dengan modul registration, booking, payment, notification — same module set yang StayManager implementasi untuk hotel rooms. Integration testing across 75 scenarios → 90.67% success rate. **Analog terdekat published Indonesian** untuk StayManager methodology.

---

### [SECONDARY APPLIED CASE — SINTA 4 DOI-verified] Simatupang & Pakpahan (2022)

```
Simatupang, K. O., & Pakpahan, A. F. (2022).
Metode Agile dalam perancangan sistem informasi reservasi
fasilitas Universitas Advent Indonesia.
Journal of Information System Research (JOSH), 3(4), 608–617.
https://doi.org/10.47065/josh.v3i4.1816
```

**Akreditasi:**
- **SINTA 4** (Decree 72/E/KPT/2024, 1 April 2024)
- Publisher: Forum Kerjasama Pendidikan Tinggi (FKPT) Medan
- DOI resolves: ✓ (ejurnal.seminar-id.com/index.php/josh/article/view/1816)
- SINTA profile: https://sinta.kemdiktisaintek.go.id/journals/profile/8355

**Kutipan paraphrase-able:**

> *"Sistem Informasi Reservasi Fasilitas ... dirancang ... agar memberikan layanan dan kemudahan dalam hal mengelola dan mengatur fasilitas yang tersedia ... This information system is designed using the Agile method and notifications will be sent via WhatsApp with details regarding the results of the facilities ordered."*

**Relevansi**: Agile/Scrum-family applied to **web-based facility reservation system** dengan third-party notification API integration — direct parallel ke StayManager online-reservation workflow + notification module.

---

### [FALLBACK SINTA 2] Higher tier tapi weaker topic match

```
Setiawan et al. (2024). JTIIK, Universitas Brawijaya.
DOI: 10.25126/jtiik.2024118344
```

Apply Scrum ke general information-system development (bukan reservation-specific). Gunakan kalau dosen menuntut SINTA tier lebih tinggi tapi accept topic match yang lebih jauh.

---

## Bab 4 — Justifikasi Framework Usability (Nielsen + Schneiderman)

### [PRIMARY] Aminurdin, Maulana & Wiyatno (2023) — UEQ Traveloka Hotel

```
Aminurdin, M., Maulana, D., & Wiyatno, T. N. (2023).
Measuring user experience of Traveloka Hotel using
User Experience Questionnaire.
Journal of Applied Intelligent System (JAIS), 8(2), 237–249.
https://doi.org/10.33633/jais.v8i2.8608
```

**Akreditasi:**
- Publisher: LPPM Universitas Dian Nuswantoro (UDINUS)
- e-ISSN 2502-9401, p-ISSN 2503-0493
- Peer-reviewed dengan publication-ethics policy + reviewer board
- DOI resolves: ✓ (publikasi.dinus.ac.id/jais/article/view/8608)
- Indexing: Google Scholar, Crossref, Dimensions, **Garuda**

**Kutipan paraphrase-able:**

> *"User Experience Questionnaire is used to quickly measure the user experience level of the product. Attractiveness, perspicuity, efficiency, dependability, stimulation, and novelty were the six UEQ scales used. A random sample of one hundred app users was selected. The results showed that each scale was overall excellent ... the Traveloka application can improve perspicuity with existing functions, so that the hotel booking process becomes easier to understand, easy to learn, simple, and clear."*

**Mengapa membenarkan framework Bab 4 StayManager:**

Paper mengevaluasi **OTA hotel reservation paling banyak digunakan di Indonesia (Traveloka)** dengan instrumen UX standar — establishing precedent bahwa hotel-booking information systems harus dievaluasi via multi-dimensional usability scales (bukan ad-hoc observation).

**Mapping 6 UEQ scales → Nielsen 5 faktor + Schneiderman 8 aturan:**

| UEQ Scale | Nielsen Five Factors | Schneiderman Eight Golden Rules |
|---|---|---|
| Perspicuity | Learnability | Rule 1 Consistency, Rule 8 Reduce short-term memory |
| Efficiency | Efficiency | Rule 2 Pintasan |
| Dependability | Error rate / recovery | Rule 5 Penanganan Kesalahan, Rule 6 Pembatalan, Rule 7 Locus of control |
| Attractiveness | Satisfaction | Rule 3 Umpan balik, Rule 4 Dialog closure |
| Stimulation | Satisfaction (enrich) | — |
| Novelty | Satisfaction (enrich) | — |

StayManager sebagai PMS dengan staff-facing + guest-facing booking + LLM chatbot, paper ini support justifikasi metodologi Bab 4 (Nielsen Lima Faktor + Schneiderman Delapan Aturan) operationalized via standardized instrument.

---

### [ALTERNATIVE 2025 / lebih recent] Bailaen & Bangkalang (2025)

```
Bailaen, E. A., & Bangkalang, D. H. (2025).
Evaluating the User Experience of a Mobile Ticketing Application
using the User Experience Questionnaire (UEQ).
Sistemasi: Jurnal Sistem Informasi, 14(3), 1460–1470.
https://doi.org/10.32520/stmsi.v14i3.5243
```

- SINTA-indexed, DOAJ-listed, DOI-verified
- Apply UEQ ke **Booking.com, Agoda, Traveloka, Tiket.com** (n=578)
- Gunakan sebagai secondary citation kalau ingin 2025 reference selain Aminurdin 2023

---

## Rekomendasi Sitasi Naskah

### Bab 1.1 (Pendahuluan):

> "Property Management System (PMS) merupakan platform software hospitality yang mengintegrasikan aktivitas front-office (reservasi, check-in/out, guest folios, audit) dengan room status dan back-office accounting, serta berinterface dengan sistem eksternal seperti POS, electronic locking, dan revenue management [Kasavana, 2024, ch. 3; Hayes et al., 2026, ch. 9]. PMS modern menekankan integrasi cloud, mobile, dan AI untuk meningkatkan pengalaman tamu [Hayes et al., 2026]. Gambar 1.1 mengilustrasikan komponen arsitektur PMS umum yang menjadi konteks penelitian ini."

### Bab 2.2 (Tinjauan Pustaka — Scrum):

> "Scrum didefinisikan oleh Schwaber dan Sutherland (2020) sebagai *'a lightweight framework that helps people, teams and organizations generate value through adaptive solutions for complex problems.'* Framework ini bersifat iteratif-inkremental dengan unit kerja **Sprint** sebagai 'heartbeat' yang berdurasi ≤1 bulan [Schwaber & Sutherland, 2020]. Aplikasi Scrum pada pengembangan sistem reservasi berbasis web/mobile dalam konteks Indonesia telah dilaporkan oleh Ali dan Waluyo (2024) untuk sistem reservasi fasilitas olahraga serta oleh Simatupang dan Pakpahan (2022) untuk sistem reservasi fasilitas universitas. Gambar 2.2 menggambarkan alur sprint cycle yang diterapkan dalam pengembangan StayManager."

### Bab 4 (Pengujian & Evaluasi):

> "Evaluasi usability StayManager mengadopsi dua framework standar: **Lima Faktor Manusia Terukur** (Nielsen, 1993) — learnability, efficiency, memorability, error rate, dan satisfaction — serta **Delapan Aturan Emas** desain antarmuka pengguna (Schneiderman, 2018). Pendekatan multi-dimensional usability ini sesuai dengan precedent evaluation OTA hotel di Indonesia oleh Aminurdin et al. (2023) yang mengaplikasikan User Experience Questionnaire (UEQ) untuk mengukur kualitas Traveloka Hotel pada enam skala (attractiveness, perspicuity, efficiency, dependability, stimulation, novelty)."

---

## Caveat & TODO Final untuk Submission

1. **🔴 Halaman fisik** Kasavana 11e Ch.3 + Hayes 4e Ch.9 → pinjam library copy untuk page numbers exact (JANGAN pakai 9e numbers sebagai 11e)
2. ✅ **Citation Indonesia DOI-verified** sudah didapat: Ali & Waluyo 2024 (SINTA 4) + Simatupang & Pakpahan 2022 (SINTA 4). Ruseno 2019 (unaccredited) **DIGANTI**.
3. ✅ **Citation Bab 4 framework** sudah didapat: Aminurdin et al. 2023 (Garuda-indexed) untuk justifikasi UEQ→Nielsen→Schneiderman mapping
4. **Konfirmasi panitia** soal threshold akreditasi minimum — kalau menuntut SINTA 1-2: fallback ke Setiawan et al. 2024 JTIIK (DOI 10.25126/jtiik.2024118344, SINTA 2) sebagai supplement Scrum citation

---

**End of REFERENCES_ACADEMIC.md v2** · Verified by Research Claude (2-pass) · 2026-05-13
